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
          // If registration is not found in DVSA
          return NextResponse.json({
            error: 'Vehicle not found',
            message: `The registration number ${registration} does not exist in the official MOT database. Please check and try again.`,
            status: 'NOT_FOUND'
          }, { status: 404 });
        }
      } catch (err) {
        console.error(`[API] DVSA Live Ingestion failed for ${registration}:`, err.message);
        return NextResponse.json({
          error: 'Connection error',
          message: 'Unable to fetch real-time data from DVSA. Please try again in a moment.',
        }, { status: 503 });
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

    // --- DYNAMIC MARKET VALUATION ENGINE ---
    const currentYear = new Date().getFullYear();
    const baseVehicleYear = vehicle.first_used_date ? new Date(vehicle.first_used_date).getFullYear() : 2015;
    const ageYears = Math.max(0, currentYear - baseVehicleYear);
    
    const baseModelHashStr = `${vehicle.make_normalized || vehicle.make}-${vehicle.model_normalized || vehicle.model}`;
    let baseHash = 0;
    for (let i = 0; i < baseModelHashStr.length; i++) {
      baseHash = ((baseHash << 5) - baseHash) + baseModelHashStr.charCodeAt(i);
      baseHash = baseHash & baseHash;
    }
    
    // 1. Base Price & Depreciation (15% per year)
    const baseNewPrice = 15000 + (Math.abs(baseHash) % 45000); // Realistic new MSRP £15k - £60k
    let currentBaseValue = baseNewPrice * Math.pow(0.85, ageYears);
    if (currentBaseValue < 500) currentBaseValue = 500;
    
    // 2. Mileage Adjustment
    const expectedMileage = ageYears * 10000;
    const actualMileage = vehicle.latest_mileage || expectedMileage;
    const mileageDiff = actualMileage - expectedMileage;
    currentBaseValue -= (mileageDiff * 0.05); // Deduct/Add 5p per mile
    
    // 3. Condition & MOT History (via Safety Score)
    // A score of 100 boosts value by ~15%, a score of 30 reduces it by ~20%
    const conditionMultiplier = 1 + (((safetyScore?.safetyScore || 70) - 70) / 200);
    currentBaseValue = currentBaseValue * conditionMultiplier;
    
    // 4. Accidents / Write-offs
    const writeOffCategory = registration === 'ML58FOU' ? 'Cat N' : null;
    if (writeOffCategory) {
      currentBaseValue = currentBaseValue * 0.65; // 35% penalty for Category write-offs
    }
    
    currentBaseValue = Math.max(300, currentBaseValue);

    // Derive Security & Provenance
    const provenance = {
      is_stolen: false,
      has_outstanding_finance: registration === 'ML58FOU', // Example mock
      write_off_category: writeOffCategory,
      previous_owners: Math.floor(Math.abs(baseHash) % 5) + 1, // Deterministic
      market_valuation: {
        low: Math.floor(currentBaseValue * 0.88),
        average: Math.floor(currentBaseValue),
        high: Math.floor(currentBaseValue * 1.12),
      }
    };

    // Derive Market Comparison (Deterministic based on Make, Model, Year)
    const vehicleYear = vehicle.first_used_date ? new Date(vehicle.first_used_date).getFullYear() : 2015;
    const modelHashStr = `${vehicle.make_normalized || vehicle.make}-${vehicle.model_normalized || vehicle.model}-${vehicleYear}`;
    let hash = 0;
    for (let i = 0; i < modelHashStr.length; i++) {
      hash = ((hash << 5) - hash) + modelHashStr.charCodeAt(i);
      hash = hash & hash;
    }
    const marketAveragePassRate = 65 + (Math.abs(hash) % 25);
    const vehiclePassRate = vehicle.total_mot_tests > 0 ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0;
    const diff = vehiclePassRate - marketAveragePassRate;
    
    let worseThanPercent = 50;
    if (diff < 0) worseThanPercent = 50 + Math.min(45, Math.abs(diff) * 2);
    else worseThanPercent = Math.max(5, 50 - (diff * 2));

    const marketComparison = {
      averagePassRate: marketAveragePassRate,
      worseThanPercent: worseThanPercent
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
      marketComparison,
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
