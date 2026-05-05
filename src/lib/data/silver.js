/**
 * SILVER LAYER — Data Transformations
 * Cleans, normalizes, deduplicates, and enriches Bronze data
 */

import { getDb } from '../db/connection';

const MAKE_NORMALIZATION = {
  'VW': 'VOLKSWAGEN', 'VOLKSWAGON': 'VOLKSWAGEN',
  'MERC': 'MERCEDES-BENZ', 'MERCEDES': 'MERCEDES-BENZ',
  'LANDROVER': 'LAND ROVER', 'LAND-ROVER': 'LAND ROVER',
  'ROLLS ROYCE': 'ROLLS-ROYCE',
  'MINI (BMW)': 'MINI',
  'CHEV': 'CHEVROLET', 'JAG': 'JAGUAR',
};

const DEFECT_CATEGORIES = [
  { pattern: /brake|braking/i, category: 'Brakes', component: 'Braking System' },
  { pattern: /tyre|tire/i, category: 'Tyres', component: 'Tyres & Wheels' },
  { pattern: /light|lamp|bulb|headlamp|indicator/i, category: 'Lighting', component: 'Lights & Signals' },
  { pattern: /suspension|shock|spring|strut/i, category: 'Suspension', component: 'Suspension System' },
  { pattern: /exhaust|emission|catalytic/i, category: 'Emissions', component: 'Exhaust & Emissions' },
  { pattern: /steering|rack|track rod/i, category: 'Steering', component: 'Steering System' },
  { pattern: /body|corrosion|rust|chassis|sill/i, category: 'Structure', component: 'Body & Chassis' },
  { pattern: /window|windscreen|wiper|mirror/i, category: 'Visibility', component: 'Windows & Wipers' },
  { pattern: /seat\s?belt|airbag/i, category: 'Safety', component: 'Restraints & Airbags' },
  { pattern: /door|boot|bonnet/i, category: 'Body', component: 'Doors & Panels' },
  { pattern: /fuel|petrol|diesel/i, category: 'Fuel', component: 'Fuel System' },
  { pattern: /drive\s?shaft|cv|axle|wheel bearing/i, category: 'Drivetrain', component: 'Drivetrain' },
];

function normalizeMake(make) {
  if (!make) return 'UNKNOWN';
  const upper = make.trim().toUpperCase();
  return MAKE_NORMALIZATION[upper] || upper;
}

function normalizeModel(model) {
  if (!model) return 'UNKNOWN';
  return model.trim().toUpperCase().replace(/\s+/g, ' ');
}

function classifyDefect(text) {
  for (const { pattern, category, component } of DEFECT_CATEGORIES) {
    if (pattern.test(text)) return { category, component };
  }
  return { category: 'Other', component: 'Other' };
}

function parseMileage(val, type) {
  if (type === 'NO_ODOMETER' || type === 'UNREADABLE') return { mileage: null, valid: false };
  const v = parseInt(val, 10);
  return isNaN(v) || v < 0 ? { mileage: null, valid: false } : { mileage: v, valid: true };
}

/**
 * Transform Bronze MOT data → Silver layer for a single vehicle
 */
export function transformVehicle(registration) {
  const db = getDb();
  const bronzeTests = db.prepare(
    'SELECT * FROM bronze_mot_tests WHERE registration = ? ORDER BY completed_date ASC'
  ).all(registration);

  if (bronzeTests.length === 0) return { success: false, message: 'No bronze data found' };

  const latest = bronzeTests[bronzeTests.length - 1];
  const makeNorm = normalizeMake(latest.make);
  const modelNorm = normalizeModel(latest.model);

  const firstUsed = latest.first_used_date ? new Date(latest.first_used_date) : null;
  const ageYears = firstUsed ? ((Date.now() - firstUsed.getTime()) / (365.25 * 86400000)) : null;

  const uniqueTests = new Map();
  for (const test of bronzeTests) {
    if (test.test_number && !uniqueTests.has(test.test_number)) uniqueTests.set(test.test_number, test);
  }
  const tests = Array.from(uniqueTests.values());
  const passes = tests.filter(t => t.test_result === 'PASSED').length;
  const failures = tests.filter(t => t.test_result === 'FAILED').length;
  const latestTest = tests[tests.length - 1];
  const { mileage: latestMileage } = parseMileage(latestTest?.odometer_value, latestTest?.odometer_result_type);

  db.prepare(`
    INSERT OR REPLACE INTO silver_vehicles (
      registration, vehicle_id, make, model, make_normalized, model_normalized,
      first_used_date, fuel_type, primary_colour, engine_size_cc,
      vehicle_age_years, total_mot_tests, total_passes, total_failures,
      latest_mileage, latest_test_date, latest_test_result, mot_expiry_date, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(registration, latest.vehicle_id, latest.make, latest.model, makeNorm, modelNorm,
    latest.first_used_date, latest.fuel_type, latest.primary_colour,
    latest.engine_size ? parseInt(latest.engine_size, 10) : null,
    ageYears ? Math.round(ageYears * 10) / 10 : null,
    tests.length, passes, failures, latestMileage,
    latestTest?.completed_date, latestTest?.test_result,
    latestTest?.expiry_date || latest.mot_test_due_date);

  let totalDefects = 0;
  const insertTest = db.prepare(`INSERT OR REPLACE INTO silver_mot_history (
    registration, test_number, test_date, test_result, expiry_date, mileage, mileage_unit, mileage_valid,
    defect_count, dangerous_count, major_count, minor_count, advisory_count
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const insertDefect = db.prepare(`INSERT OR IGNORE INTO silver_defects (
    registration, test_number, test_date, defect_text, defect_type, is_dangerous, category, component
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

  db.transaction(() => {
    for (const test of tests) {
      const defects = test.defects_json ? JSON.parse(test.defects_json) : [];
      const { mileage, valid } = parseMileage(test.odometer_value, test.odometer_result_type);
      let dangerous = 0, major = 0, minor = 0, advisory = 0;

      for (const d of defects) {
        const type = (d.type || '').toUpperCase();
        if (type === 'DANGEROUS') dangerous++;
        else if (type === 'MAJOR' || type === 'FAIL') major++;
        else if (type === 'MINOR') minor++;
        else advisory++;
      }

      insertTest.run(registration, test.test_number, test.completed_date, test.test_result,
        test.expiry_date, mileage, test.odometer_unit || 'mi', valid ? 1 : 0,
        defects.length, dangerous, major, minor, advisory);

      for (const d of defects) {
        const type = (d.type || '').toUpperCase();
        const { category, component } = classifyDefect(d.text || '');
        insertDefect.run(registration, test.test_number, test.completed_date,
          d.text || '', type || 'ADVISORY', d.dangerous ? 1 : 0, category, component);
        totalDefects++;
      }
    }
  })();

  // Build mileage timeline
  db.prepare('DELETE FROM silver_mileage_timeline WHERE registration = ?').run(registration);
  const insertMileage = db.prepare(`INSERT OR REPLACE INTO silver_mileage_timeline (
    registration, test_date, mileage, mileage_delta, days_since_last, daily_avg_miles, anomaly_flag
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`);

  let prevMileage = null, prevDate = null;
  for (const test of tests) {
    const { mileage, valid } = parseMileage(test.odometer_value, test.odometer_result_type);
    if (!valid || !mileage) continue;
    const td = new Date(test.completed_date);
    let delta = null, days = null, dailyAvg = null, anomaly = false;
    if (prevMileage !== null && prevDate !== null) {
      delta = mileage - prevMileage;
      days = Math.round((td - prevDate) / 86400000);
      dailyAvg = days > 0 ? Math.round((delta / days) * 100) / 100 : null;
      anomaly = mileage < prevMileage || (dailyAvg !== null && dailyAvg > 200);
    }
    insertMileage.run(registration, test.completed_date, mileage, delta, days, dailyAvg, anomaly ? 1 : 0);
    prevMileage = mileage;
    prevDate = td;
  }

  return { success: true, registration, make: makeNorm, model: modelNorm, testsProcessed: tests.length, defectsProcessed: totalDefects };
}

export function getSilverVehicle(reg) {
  return getDb().prepare('SELECT * FROM silver_vehicles WHERE registration = ?').get(reg);
}
export function getSilverMOTHistory(reg) {
  return getDb().prepare('SELECT * FROM silver_mot_history WHERE registration = ? ORDER BY test_date DESC').all(reg);
}
export function getSilverDefects(reg) {
  return getDb().prepare('SELECT * FROM silver_defects WHERE registration = ? ORDER BY test_date DESC').all(reg);
}
export function getMileageTimeline(reg) {
  return getDb().prepare('SELECT * FROM silver_mileage_timeline WHERE registration = ? ORDER BY test_date ASC').all(reg);
}
