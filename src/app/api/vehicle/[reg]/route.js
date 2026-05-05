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
      // BRONZE: Ingest raw data from DVSA
      const bronzeResult = await ingestMOTData(registration);
      if (!bronzeResult.success) {
        return NextResponse.json({
          error: 'Vehicle not found',
          message: `No MOT records found for registration ${registration}. Please check the registration number and try again.`,
        }, { status: 404 });
      }

      // SILVER: Transform and clean data
      transformVehicle(registration);
      vehicle = getSilverVehicle(registration);
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

    // Fetch Recalls
    const recallData = await checkRecallsByMakeModel(vehicle.make_normalized || vehicle.make, vehicle.model_normalized || vehicle.model);
    
    // Filter recalls by the vehicle's first_used_date if available
    let relevantRecalls = [];
    if (recallData && recallData.recalls) {
      const vehicleYear = vehicle.first_used_date ? new Date(vehicle.first_used_date).getFullYear() : null;
      if (vehicleYear) {
        relevantRecalls = recallData.recalls.filter(r => {
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
      } else {
        relevantRecalls = recallData.recalls;
      }
    }

    return NextResponse.json({
      success: true,
      fromCache,
      vehicle,
      safetyScore,
      motHistory,
      defects: defects.slice(0, 50),
      mileageTimeline,
      defectDistribution,
      recalls: relevantRecalls,
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
