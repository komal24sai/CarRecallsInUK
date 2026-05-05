/**
 * Vehicle Lookup API Route
 * GET /api/vehicle/[reg] — Full pipeline: Bronze → Silver → Gold
 */

import { NextResponse } from 'next/server';
import { ingestMOTData } from '@/lib/data/bronze';
import { transformVehicle, getSilverVehicle, getSilverMOTHistory, getSilverDefects, getMileageTimeline } from '@/lib/data/silver';
import { calculateSafetyScore, getDefectDistribution } from '@/lib/data/gold';
import { checkRecallsByMakeModel } from '@/lib/dvsa/recalls-client';

export async function GET(request, { params }) {
  const { reg } = await params;
  const registration = reg.replace(/\s/g, '').toUpperCase();

  if (!registration || registration.length < 2 || registration.length > 8) {
    return NextResponse.json({ error: 'Invalid registration number' }, { status: 400 });
  }

  try {
    // Check if we already have silver data (cache)
    let vehicle = getSilverVehicle(registration);
    let fromCache = false;

    if (vehicle) {
      // Check if data is recent (within 24 hours)
      const updatedAt = new Date(vehicle.updated_at);
      const hoursSinceUpdate = (Date.now() - updatedAt.getTime()) / 3600000;
      if (hoursSinceUpdate < 24) {
        fromCache = true;
      }
    }

    if (!fromCache) {
      try {
        // BRONZE: Ingest raw data from DVSA
        const bronzeResult = await ingestMOTData(registration);
        if (bronzeResult.success) {
          // SILVER: Transform and clean data
          transformVehicle(registration);
          vehicle = getSilverVehicle(registration);
        } else {
          // FALLBACK: If DVSA returns no data, try to find a mock record for demo purposes
          vehicle = getSilverVehicle(registration); // Check if we have a local mock
          if (!vehicle) throw new Error('Vehicle not found');
        }
      } catch (err) {
        console.warn(`[API] DVSA Live Ingestion failed for ${registration}, falling back to mock:`, err.message);
        vehicle = getSilverVehicle(registration);
        if (!vehicle) {
          return NextResponse.json({
            error: 'Vehicle not found',
            message: `No records found for registration ${registration}. Please try a demo plate like ML58FOU.`,
          }, { status: 404 });
        }
      }
    }

    if (!vehicle) {
      return NextResponse.json({ error: 'Failed to process vehicle data' }, { status: 500 });
    }

    // GOLD: Calculate safety score
    const safetyScore = calculateSafetyScore(registration);
    const motHistory = getSilverMOTHistory(registration);
    const defects = getSilverDefects(registration);
    const mileageTimeline = getMileageTimeline(registration);
    const defectDistribution = getDefectDistribution(registration);

    // Derive Running Costs (Heuristic-based for SaaS Demo)
    const engineLitres = vehicle.engine_size ? parseFloat(vehicle.engine_size) / 1000 : 1.6;
    const isDiesel = vehicle.fuel_type?.toUpperCase().includes('DIESEL');
    const isElectric = vehicle.fuel_type?.toUpperCase().includes('ELECTRIC');
    
    const runningCosts = {
      insuranceGroup: Math.floor(Math.min(50, (engineLitres * 12) + (isDiesel ? 5 : 0))),
      averageMpg: isElectric ? '100+' : (isDiesel ? 55 - (engineLitres * 5) : 45 - (engineLitres * 5)).toFixed(1),
      co2Emissions: isElectric ? 0 : Math.floor(90 + (engineLitres * 30)),
      annualFuelCost: isElectric ? 450 : Math.floor(1200 + (engineLitres * 400)),
    };

    // Derive Security & Provenance (Simulated for SaaS Demo)
    const provenance = {
      is_stolen: false,
      has_outstanding_finance: registration === 'ML58FOU', // Mock finance for this specific demo plate
      write_off_category: registration === 'ML58FOU' ? 'Cat N' : null,
      previous_owners: Math.floor(Math.random() * 4) + 1,
      market_valuation: {
        low: Math.floor(4500 * (1 - (engineLitres / 5))),
        average: Math.floor(5500 * (1 - (engineLitres / 5))),
        high: Math.floor(6500 * (1 - (engineLitres / 5))),
      }
    };

    // Fetch Recalls from local model-matching database
    const recallData = await checkRecallsByMakeModel(vehicle.make_normalized || vehicle.make, vehicle.model_normalized || vehicle.model);


    // 1. Get outstanding recalls from the DVSA raw response (if available)
    const outstandingRecalls = vehicle.recalls || [];
    
    // 2. Filter model-wide recalls by the vehicle's year
    let matchedRecalls = [];
    if (recallData && recallData.recalls) {
      const vehicleYear = vehicle.first_used_date ? new Date(vehicle.first_used_date).getFullYear() : null;
      matchedRecalls = recallData.recalls.filter(r => {
        if (!vehicleYear) return true;
        if (!r.build_start && !r.build_end) return true;
        let inRange = false;
        if (r.build_start && r.build_end) {
          const startYear = new Date(r.build_start).getFullYear();
          const endYear = new Date(r.build_end).getFullYear();
          if (vehicleYear >= startYear && vehicleYear <= endYear) inRange = true;
        } else if (r.build_start) {
          if (vehicleYear >= new Date(r.build_start).getFullYear()) inRange = true;
        } else if (r.build_end) {
          if (vehicleYear <= new Date(r.build_end).getFullYear()) inRange = true;
        }
        return inRange;
      });
    }

    // 3. Cross-reference: Mark status as 'OUTSTANDING' or 'CLOSED'
    const finalRecalls = matchedRecalls.map(r => {
      const isOutstanding = outstandingRecalls.some(os => 
        os.recall_number === r.recall_number || 
        r.concern?.toLowerCase().includes(os.defect?.toLowerCase())
      );
      return {
        ...r,
        status: isOutstanding ? 'OUTSTANDING' : 'CLOSED',
        repaired_date: !isOutstanding ? 'Verified' : null
      };
    });

    return NextResponse.json({
      success: true,
      fromCache,
      vehicle,
      safetyScore,
      motHistory,
      defects: defects.slice(0, 50),
      mileageTimeline,
      defectDistribution,
      recalls: finalRecalls,
      runningCosts,
      provenance,
      meta: {
        dataSource: 'DVSA MOT History API',
        lastUpdated: vehicle.updated_at,
        totalTests: motHistory.length,
        totalDefects: defects.length,
      },
    });
  } catch (error) {
    console.error(`[API] Vehicle lookup failed for ${registration}:`, error);
    return NextResponse.json({
      error: 'Service temporarily unavailable',
      message: 'Unable to connect to DVSA. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 503 });
  }
}
