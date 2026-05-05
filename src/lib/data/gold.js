/**
 * GOLD LAYER — Business Logic & Aggregations
 * Computes safety scores, risk metrics, and dashboard-ready data
 */

import { getDb } from '../db/connection';

/**
 * Calculate composite safety score for a vehicle (0-100)
 */
export function calculateSafetyScore(registration) {
  const db = getDb();
  const vehicle = db.prepare('SELECT * FROM silver_vehicles WHERE registration = ?').get(registration);
  if (!vehicle) return null;

  const motHistory = db.prepare('SELECT * FROM silver_mot_history WHERE registration = ? ORDER BY test_date DESC').all(registration);
  const mileageData = db.prepare('SELECT * FROM silver_mileage_timeline WHERE registration = ?').all(registration);

  // 1. MOT Reliability Score (0-30 points)
  let motScore = 30;
  if (vehicle.total_mot_tests > 0) {
    const passRate = vehicle.total_passes / vehicle.total_mot_tests;
    motScore = Math.round(passRate * 30);
  }

  // 2. Defect Severity Score (0-30 points, higher = fewer severe defects)
  let defectScore = 30;
  if (motHistory.length > 0) {
    const totalDangerous = motHistory.reduce((s, t) => s + (t.dangerous_count || 0), 0);
    const totalMajor = motHistory.reduce((s, t) => s + (t.major_count || 0), 0);
    const totalMinor = motHistory.reduce((s, t) => s + (t.minor_count || 0), 0);
    const severityPenalty = (totalDangerous * 10) + (totalMajor * 3) + (totalMinor * 1);
    defectScore = Math.max(0, 30 - Math.min(30, severityPenalty));
  }

  // 3. Mileage Consistency Score (0-20 points)
  let mileageScore = 20;
  if (mileageData.length > 0) {
    const anomalies = mileageData.filter(m => m.anomaly_flag).length;
    mileageScore = Math.max(0, 20 - (anomalies * 10));
  }

  // 4. Recall Risk Score (0-20 points)
  let recallScore = 20;
  if (vehicle.has_outstanding_recalls) recallScore = 5;

  const totalScore = Math.min(100, motScore + defectScore + mileageScore + recallScore);

  let riskLevel = 'LOW';
  if (totalScore < 40) riskLevel = 'HIGH';
  else if (totalScore < 70) riskLevel = 'MEDIUM';

  const summary = generateSummary(totalScore, riskLevel, vehicle, motHistory);

  // Store in gold layer
  db.prepare(`
    INSERT OR REPLACE INTO gold_vehicle_safety_score (
      registration, safety_score, mot_reliability_score, defect_severity_score,
      mileage_consistency_score, recall_risk_score, risk_level, summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(registration, totalScore, motScore, defectScore, mileageScore, recallScore, riskLevel, summary);

  return {
    registration,
    safetyScore: totalScore,
    motReliabilityScore: motScore,
    defectSeverityScore: defectScore,
    mileageConsistencyScore: mileageScore,
    recallRiskScore: recallScore,
    riskLevel,
    summary,
    breakdown: {
      motReliability: { score: motScore, max: 30 },
      defectSeverity: { score: defectScore, max: 30 },
      mileageConsistency: { score: mileageScore, max: 20 },
      recallRisk: { score: recallScore, max: 20 },
    },
  };
}

function generateSummary(score, riskLevel, vehicle, motHistory) {
  const passRate = vehicle.total_mot_tests > 0
    ? Math.round((vehicle.total_passes / vehicle.total_mot_tests) * 100) : 0;
  const parts = [];
  parts.push(`${vehicle.make} ${vehicle.model} with ${vehicle.total_mot_tests} MOT tests on record.`);
  parts.push(`Overall pass rate: ${passRate}%.`);
  if (riskLevel === 'HIGH') parts.push('This vehicle shows significant risk indicators.');
  else if (riskLevel === 'MEDIUM') parts.push('Some concerns identified — review recommended.');
  else parts.push('This vehicle has a strong safety record.');
  return parts.join(' ');
}

/**
 * Get defect distribution for a vehicle
 */
export function getDefectDistribution(registration) {
  const db = getDb();
  return db.prepare(`
    SELECT category, defect_type, COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM silver_defects WHERE registration = ?), 1) as percentage
    FROM silver_defects WHERE registration = ?
    GROUP BY category ORDER BY count DESC
  `).all(registration, registration);
}

/**
 * Get dashboard metrics (aggregate across all vehicles in the system)
 */
export function getDashboardMetrics() {
  const db = getDb();
  const metrics = {};

  const vehicleCount = db.prepare('SELECT COUNT(*) as count FROM silver_vehicles').get();
  metrics.totalVehicles = vehicleCount?.count || 0;

  const testCount = db.prepare('SELECT COUNT(*) as count FROM silver_mot_history').get();
  metrics.totalMOTTests = testCount?.count || 0;

  const passRate = db.prepare(
    "SELECT ROUND(AVG(CASE WHEN test_result = 'PASSED' THEN 1.0 ELSE 0.0 END) * 100, 1) as rate FROM silver_mot_history"
  ).get();
  metrics.avgPassRate = passRate?.rate || 0;

  const defectCount = db.prepare('SELECT COUNT(*) as count FROM silver_defects').get();
  metrics.totalDefects = defectCount?.count || 0;

  const topDefects = db.prepare(`
    SELECT category, COUNT(*) as count FROM silver_defects
    GROUP BY category ORDER BY count DESC LIMIT 5
  `).all();
  metrics.topDefectCategories = topDefects;

  const mileageAnomalies = db.prepare('SELECT COUNT(*) as count FROM silver_mileage_timeline WHERE anomaly_flag = 1').get();
  metrics.mileageAnomalies = mileageAnomalies?.count || 0;

  const avgScore = db.prepare('SELECT ROUND(AVG(safety_score), 1) as avg FROM gold_vehicle_safety_score').get();
  metrics.avgSafetyScore = avgScore?.avg || 0;

  const makeStats = db.prepare(`
    SELECT make_normalized as make, COUNT(*) as count,
    ROUND(AVG(total_passes * 100.0 / NULLIF(total_mot_tests, 0)), 1) as avg_pass_rate
    FROM silver_vehicles GROUP BY make_normalized ORDER BY count DESC LIMIT 10
  `).all();
  metrics.topMakes = makeStats;

  return metrics;
}

/**
 * Get the gold safety score for a vehicle
 */
export function getGoldSafetyScore(registration) {
  return getDb().prepare('SELECT * FROM gold_vehicle_safety_score WHERE registration = ?').get(registration);
}
