/**
 * BRONZE LAYER — Raw Data Ingestion
 * Stores raw, unmodified data from DVSA APIs
 * Handles both old API (array response) and new API (object response) formats
 */

import { getDb } from '../db/connection';
import { getByRegistration } from '../dvsa/mot-client';
import { checkRecallsByMakeModel } from '../dvsa/recalls-client';

/**
 * Normalize the DVSA API response into a consistent vehicle shape
 * The new API may return the data differently from the old one
 */
function normalizeVehicleResponse(rawData) {
  if (!rawData) return null;

  // New API may return a single object; old API returns an array
  let vehicle;
  if (Array.isArray(rawData)) {
    if (rawData.length === 0) return null;
    vehicle = rawData[0];
  } else {
    vehicle = rawData;
  }

  // Log the raw shape for debugging
  console.log('[Bronze] Raw API response keys:', Object.keys(vehicle));
  console.log('[Bronze] Raw API response (first 500 chars):', JSON.stringify(vehicle).substring(0, 500));

  // The new API uses slightly different field names in some cases
  // Handle both camelCase and snake_case variants
  return {
    registration: vehicle.registration || vehicle.registrationNumber || null,
    vehicleId: vehicle.vehicleId || vehicle.vehicle_id || null,
    make: vehicle.make || vehicle.makeInFull || null,
    model: vehicle.model || null,
    firstUsedDate: vehicle.firstUsedDate || vehicle.first_used_date || vehicle.dateOfFirstUse || null,
    fuelType: vehicle.fuelType || vehicle.fuel_type || null,
    primaryColour: vehicle.primaryColour || vehicle.primary_colour || vehicle.colour || null,
    registrationDate: vehicle.registrationDate || vehicle.registration_date || null,
    manufactureDate: vehicle.manufactureDate || vehicle.manufacture_date || vehicle.dateOfManufacture || null,
    engineSize: vehicle.engineSize || vehicle.engine_size || vehicle.cylinderCapacity || null,
    motTestDueDate: vehicle.motTestDueDate || vehicle.mot_test_due_date || vehicle.motTestExpiryDate || null,
    motTests: vehicle.motTests || vehicle.mot_tests || vehicle.motTestReports || [],
    _raw: vehicle,
  };
}

/**
 * Normalize a single MOT test record
 */
function normalizeTest(test) {
  return {
    testNumber: test.testNumber || test.test_number || test.motTestNumber || `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    completedDate: test.completedDate || test.completed_date || test.testDate || test.completedAt || null,
    testResult: test.testResult || test.test_result || test.result || null,
    expiryDate: test.expiryDate || test.expiry_date || test.motTestExpiryDate || null,
    odometerValue: test.odometerValue || test.odometer_value || test.odometerReading || (test.odometer && test.odometer.value) || null,
    odometerUnit: test.odometerUnit || test.odometer_unit || (test.odometer && test.odometer.unit) || 'mi',
    odometerResultType: test.odometerResultType || test.odometer_result_type || (test.odometer && test.odometer.resultType) || 'READ',
    defects: test.rfrAndComments || test.rfr_and_comments || test.defects || test.reasonsForFailure || [],
  };
}

/**
 * Ingest raw MOT data for a vehicle registration
 */
export async function ingestMOTData(registration) {
  const db = getDb();
  const startTime = Date.now();

  try {
    const rawData = await getByRegistration(registration);
    const vehicle = normalizeVehicleResponse(rawData);

    if (!vehicle) {
      logApiCall(db, `/v1/trade/vehicles/registration/${registration}`, 'GET', 404, Date.now() - startTime);
      return { success: false, message: 'Vehicle not found', registration };
    }

    logApiCall(db, `/v1/trade/vehicles/registration/${registration}`, 'GET', 200, Date.now() - startTime);

    const insertedTests = [];

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO bronze_mot_tests (
        registration, vehicle_id, make, model, first_used_date, fuel_type,
        primary_colour, registration_date, manufacture_date, engine_size,
        test_number, completed_date, test_result, expiry_date,
        odometer_value, odometer_unit, odometer_result_type,
        mot_test_due_date, defects_json, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((tests) => {
      for (const rawTest of tests) {
        const test = normalizeTest(rawTest);
        stmt.run(
          vehicle.registration || registration,
          vehicle.vehicleId,
          vehicle.make,
          vehicle.model,
          vehicle.firstUsedDate,
          vehicle.fuelType,
          vehicle.primaryColour,
          vehicle.registrationDate,
          vehicle.manufactureDate,
          vehicle.engineSize,
          test.testNumber,
          test.completedDate,
          test.testResult,
          test.expiryDate,
          test.odometerValue,
          test.odometerUnit,
          test.odometerResultType,
          vehicle.motTestDueDate,
          JSON.stringify(test.defects),
          JSON.stringify(rawTest)
        );
        insertedTests.push(test);
      }
    });

    const motTests = vehicle.motTests;
    if (motTests.length > 0) {
      insertMany(motTests);
    } else {
      // Vehicle exists but has no MOT tests yet (new vehicle)
      // Still create a bronze record with vehicle info
      console.log(`[Bronze] Vehicle ${registration} found but has no MOT tests`);
      stmt.run(
        vehicle.registration || registration,
        vehicle.vehicleId, vehicle.make, vehicle.model,
        vehicle.firstUsedDate, vehicle.fuelType, vehicle.primaryColour,
        vehicle.registrationDate, vehicle.manufactureDate, vehicle.engineSize,
        `no_test_${registration}`, null, null, null, null, null, null,
        vehicle.motTestDueDate, '[]', JSON.stringify(vehicle._raw)
      );
    }

    console.log(`[Bronze] Ingested ${insertedTests.length} MOT tests for ${registration}`);

    return {
      success: true,
      registration: vehicle.registration || registration,
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        vehicleId: vehicle.vehicleId,
        fuelType: vehicle.fuelType,
        primaryColour: vehicle.primaryColour,
        firstUsedDate: vehicle.firstUsedDate,
        engineSize: vehicle.engineSize,
        registrationDate: vehicle.registrationDate,
        manufactureDate: vehicle.manufactureDate,
        motTestDueDate: vehicle.motTestDueDate,
      },
      testsIngested: insertedTests.length,
      rawTests: motTests,
    };
  } catch (error) {
    logApiCall(db, `/v1/trade/vehicles/registration/${registration}`, 'GET', 500, Date.now() - startTime, error.message);
    throw error;
  }
}

/**
 * Ingest recall data for a vehicle make/model
 */
export async function ingestRecallData(make, model) {
  const db = getDb();
  const startTime = Date.now();

  try {
    const rawData = await checkRecallsByMakeModel(make, model);
    if (!rawData) {
      logApiCall(db, `/recalls/vehicle/make/${make}/model/${model}`, 'GET', 404, Date.now() - startTime);
      return { success: false, message: 'No recall data found' };
    }
    logApiCall(db, `/recalls/vehicle/make/${make}/model/${model}`, 'GET', 200, Date.now() - startTime);
    const recalls = Array.isArray(rawData) ? rawData : (rawData.recalls || [rawData]);
    const stmt = db.prepare(`
      INSERT INTO bronze_recalls (make, model, recall_number, concern, defect, remedy,
        vehicle_number, build_start, build_end, recalled_date, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((items) => {
      for (const recall of items) {
        stmt.run(make, model,
          recall.recallNumber || recall.recall_number || null,
          recall.concern || null, recall.defect || null, recall.remedy || null,
          recall.vehicleNumber || null, recall.buildStart || null,
          recall.buildEnd || null, recall.recallDate || null, JSON.stringify(recall));
      }
    });
    insertMany(recalls);
    console.log(`[Bronze] Ingested ${recalls.length} recalls for ${make} ${model}`);
    return { success: true, recallsIngested: recalls.length };
  } catch (error) {
    logApiCall(db, `/recalls/vehicle/make/${make}/model/${model}`, 'GET', 500, Date.now() - startTime, error.message);
    throw error;
  }
}

function logApiCall(db, endpoint, method, statusCode, responseTimeMs, errorMessage = null) {
  try {
    db.prepare(`INSERT INTO bronze_api_logs (endpoint, method, status_code, response_time_ms, error_message)
      VALUES (?, ?, ?, ?, ?)`).run(endpoint, method, statusCode, responseTimeMs, errorMessage);
  } catch (e) { console.error('[Bronze] Failed to log API call:', e.message); }
}

export function getBronzeMOTData(registration) {
  return getDb().prepare('SELECT * FROM bronze_mot_tests WHERE registration = ? ORDER BY completed_date DESC').all(registration);
}

export function getBronzeRecallData(make, model) {
  return getDb().prepare('SELECT * FROM bronze_recalls WHERE make = ? AND model = ?').all(make, model);
}
