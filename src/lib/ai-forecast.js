export const generateAIReport = (safetyScore, vehicle, defects, mileageTimeline) => {
  if (!vehicle) return null;

  const score = safetyScore?.safetyScore || 0;
  const age = vehicle.vehicle_age_years || 10;
  const passes = vehicle.total_passes || 0;
  const failures = vehicle.total_failures || 0;
  const totalTests = vehicle.total_mot_tests || 0;
  const isExpired = vehicle.mot_expiry_date ? new Date(vehicle.mot_expiry_date) < new Date() : false;

  // 1. Verdict
  let verdict = { status: "BUY", color: "var(--accent-green)", icon: "✅" };
  
  if (isExpired) {
    verdict = { status: "WALK AWAY", color: "var(--accent-red)", icon: "🚨" };
  } else if (score < 40 || (failures / totalTests) > 0.5) {
    verdict = { status: "WALK AWAY", color: "var(--accent-red)", icon: "🚨" };
  } else if (score < 70 || failures > 3) {
    verdict = { status: "NEGOTIATE", color: "var(--accent-amber)", icon: "💬" };
  }

  // 2. Risk Components
  let riskParts = [];
  const tyrefails = defects.filter(d => d.category === 'Tyres').length;
  if (tyrefails > 3) riskParts.push({ name: "Tyres & Tracking", reason: "Frequent replacements required historically." });
  const brakefails = defects.filter(d => d.category === 'Brakes').length;
  if (brakefails > 2) riskParts.push({ name: "Braking System", reason: "History of excessive wear." });
  const suspensionFails = defects.filter(d => d.category === 'Suspension').length;
  if (suspensionFails > 2) riskParts.push({ name: "Suspension Joints", reason: "Recurring degradation detected." });
  const emissions = defects.filter(d => d.category === 'Emissions').length;
  if (emissions > 1) riskParts.push({ name: "Exhaust & Emissions", reason: "Previous major emission failures." });

  // 3. Estimated Maintenance Cost
  let baseCost = age > 10 ? 400 : 250;
  baseCost += (failures * 50);
  baseCost += (riskParts.length * 150);
  
  // 4. Mileage Analysis
  let mileageAnalysis = {
    status: "Normal",
    text: "Consistent usage pattern detected.",
    totalMiles: vehicle.latest_mileage || 0,
    avgAnnualMiles: Math.round((vehicle.latest_mileage || 0) / age),
    anomalies: [],
    suspicious: false
  };

  if (mileageTimeline && mileageTimeline.length > 0) {
    const anomalies = mileageTimeline.filter(m => m.anomaly_flag);
    if (anomalies.length > 0) {
      mileageAnalysis.suspicious = true;
      mileageAnalysis.status = "Warning";
      mileageAnalysis.text = "Mileage discrepancies (potential rollbacks) detected in history. Verify service records carefully.";
      anomalies.forEach(a => mileageAnalysis.anomalies.push(`Discrepancy around ${new Date(a.test_date).getFullYear()}`));
    } else {
      const recent = mileageTimeline.slice(-3);
      if (recent.length > 1) {
        const avgRecent = recent.reduce((sum, m) => sum + (m.daily_avg_miles || 0), 0) / recent.length;
        if (avgRecent < 2) {
          mileageAnalysis.text = "Warning: Vehicle has sat idle or been driven very little recently. Check for seized brakes or battery degradation.";
          mileageAnalysis.status = "Idle Risk";
          mileageAnalysis.suspicious = true;
        } else if (avgRecent > 60) {
          mileageAnalysis.text = "High recent usage detected. Likely used for commercial, fleet, or heavy commuting.";
          mileageAnalysis.status = "High Usage";
        }
      }
    }
  }

  // 5. Summary Narrative
  let summary = `This ${age}-year-old ${vehicle.make} has an overall pass rate of ${Math.round((passes/totalTests)*100)}%. `;
  
  if (isExpired) {
    summary += "CRITICAL: The MOT on this vehicle has expired. Do not purchase without a fresh MOT certificate, as it may be hiding severe end-of-life mechanical failures.";
  } else if (verdict.status === 'WALK AWAY') {
    summary += "Due to the high frequency of defects and a low safety score, we strongly advise avoiding this vehicle unless you are a mechanic.";
  } else if (verdict.status === 'NEGOTIATE') {
    summary += `It has ${failures} previous MOT failures. Use the highlighted risk components to negotiate a lower price or request repairs before purchase.`;
  } else {
    summary += "It demonstrates a strong maintenance record and represents a solid purchase opportunity.";
  }

  return {
    verdict,
    riskParts: riskParts.length > 0 ? riskParts : [{ name: "General Wear & Tear", reason: "No specific recurring issues detected." }],
    estimatedAnnualCost: `£${baseCost} - £${baseCost + 300}`,
    mileageAnalysis,
    suspiciousMileage: mileageAnalysis.suspicious,
    summary
  };
};
