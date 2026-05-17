# Gold Layer: Predictive Maintenance Report Engine
# Generates user dossiers with component repair forecasts.

import datetime
import math
import json
from backend.models.repair_costs import REPAIR_COSTS

# Fallback risk mapping if the Delta tables are not actively running locally
FALLBACK_RISK_PROFILE = {
    ("8.1%", "ford", 4, 40000): 0.42,  # Front Tyres wear probability
    ("5.1%", "ford", 4, 40000): 0.35,  # Front Suspension joints
    ("1.1%", "ford", 4, 40000): 0.28,  # Front Brakes
    ("6.1%", "bmw", 6, 80000): 0.48,   # Exhaust leak
    ("5.3%", "bmw", 6, 80000): 0.39,   # Shock absorbers
    ("9.1%", "vauxhall", 8, 100000): 0.55 # Emissions failure
}

def get_failure_probability(rfr_code, make, age, mileage):
    # Normalize inputs for bucket matching
    make_group = make.lower().strip()
    age_band = math.floor(age / 2) * 2
    mileage_band = math.floor(mileage / 20000) * 20000

    # Try querying Delta table if in PySpark context
    try:
        from pyspark.sql import SparkSession
        spark = SparkSession.builder.getOrCreate()
        
        risk_df = spark.read.table("unity_catalog.isthiscarsafe_silver.component_risk_profile")
        match = risk_df.filter(
            (risk_df.rfr_code == rfr_code) &
            (risk_df.make_group == make_group) &
            (risk_df.age_band == age_band) &
            (risk_df.mileage_band == mileage_band)
        ).first()

        if match:
            return float(match.failure_rate), "HIGH"
    except Exception:
        # Fallback to local catalog during standalone runs or non-spark environments
        pass

    # Use lookup dictionary key matching
    match_key = (rfr_code, make_group, age_band, mileage_band)
    if match_key in FALLBACK_RISK_PROFILE:
        return FALLBACK_RISK_PROFILE[match_key], "HIGH"
        
    # Standard base rate mapping if specific model combination is not stored
    rfr_base_rates = {
        "1.1": 0.25, "1.2": 0.22, "1.3": 0.18,
        "2.1": 0.31, "2.2": 0.15,
        "3.1": 0.12, "3.2": 0.08,
        "4.1": 0.19, "4.2": 0.11, "4.3": 0.09,
        "5.1": 0.34, "5.2": 0.28, "5.3": 0.26,
        "6.1": 0.29, "6.2": 0.14,
        "7.1": 0.07,
        "8.1": 0.38, "8.2": 0.35, "8.3": 0.16,
        "9.1": 0.45
    }
    
    prefix = rfr_code[:3]
    base_rate = rfr_base_rates.get(prefix, 0.15)
    
    # Scale based on age and mileage buckets
    age_multiplier = 1.0 + (age_band * 0.05)
    mileage_multiplier = 1.0 + ((mileage_band / 20000) * 0.04)
    
    final_prob = min(0.95, base_rate * age_multiplier * mileage_multiplier)
    return round(final_prob, 2), "MEDIUM"

def get_vehicle_maintenance_report(registration):
    # Standardize registration number plate format
    normalized_reg = registration.replace(" ", "").upper()
    
    # 1. Fetch MOT History from DVSA API (Mocked for SaaS demonstration architecture)
    # Realistic mock dataset that mirrors the DVSA raw payload format
    mock_payload = {
        "registration": normalized_reg,
        "make": "Ford",
        "model": "Fiesta",
        "manufacture_year": 2017,
        "first_used_date": "2017-06-15",
        "fuel_type": "Petrol",
        "engine_size_cc": 998,
        "tests": [
            {
                "test_date": "2023-06-12",
                "test_result": "PASSED",
                "mileage": 42150,
                "defects": [
                    {"rfr_code": "8.1.A.1", "defect_text": "Front tyre worn close to legal limit (advisory)", "defect_type": "ADVISORY", "category": "Tyres (Front)"},
                    {"rfr_code": "5.1.B.2", "defect_text": "Front suspension arm pin or bush worn but not resulting in excessive movement (advisory)", "defect_type": "ADVISORY", "category": "Front Suspension"}
                ]
            },
            {
                "test_date": "2022-06-10",
                "test_result": "PASSED",
                "mileage": 35400,
                "defects": [
                    {"rfr_code": "8.1.A.1", "defect_text": "Front tyre worn close to legal limit (advisory)", "defect_type": "ADVISORY", "category": "Tyres (Front)"},
                    {"rfr_code": "1.1.C.3", "defect_text": "Front brake disc slightly worn (advisory)", "defect_type": "ADVISORY", "category": "Front Brakes"}
                ]
            }
        ]
    }

    make = mock_payload["make"]
    first_used_year = mock_payload["manufacture_year"]
    current_year = datetime.datetime.now().year
    age = max(1, current_year - first_used_year)

    latest_test = mock_payload["tests"][0]
    mileage = latest_test["mileage"]
    last_test_date = datetime.datetime.strptime(latest_test["test_date"], "%Y-%m-%d").date()
    
    # 2. Calculate months remaining until next MOT test
    mot_due_date = last_test_date + datetime.timedelta(days=365)
    today = datetime.date.today()
    days_to_mot = (mot_due_date - today).days
    months_to_mot = max(0, int(days_to_mot / 30.4))

    # 3. Identify all active advisories
    # Active advisory: appeared in the last 2 MOT tests and remains unresolved
    active_advisories = {}
    for test in mock_payload["tests"][:2]:
        for defect in test.get("defects", []):
            if defect["defect_type"] == "ADVISORY":
                code = defect["rfr_code"]
                if code not in active_advisories:
                    active_advisories[code] = {
                        "code": code,
                        "text": defect["defect_text"],
                        "category": defect["category"],
                        "consecutive_count": 1
                    }
                else:
                    active_advisories[code]["consecutive_count"] += 1

    # 4. Generate advisory risk profiles using the component cost and failure calculations
    advisory_risks = []
    total_low = 0
    total_high = 0
    max_urgency = 0.0
    overall_confidence = "HIGH"

    for code, adv in active_advisories.items():
        # Get category lookup for costs
        category = adv["category"]
        cost_match = REPAIR_COSTS.get(category, {"low": 100, "high": 300, "action": "Monitor"})
        
        # Calculate next MOT failure rate based on cohort bands
        failure_prob, confidence = get_failure_probability(code, make, age, mileage)
        if confidence == "MEDIUM":
            overall_confidence = "MEDIUM"

        # Calculate time-weighted urgency score
        # Advisories on cars with MOT tests due soon scale higher
        urgency_score = failure_prob * (1.0 + max(0.0, (6.0 - months_to_mot) / 6.0))
        max_urgency = max(max_urgency, urgency_score)

        total_low += cost_match["low"]
        total_high += cost_match["high"]

        advisory_risks.append({
            "component": category,
            "advisory_text": adv["text"],
            "consecutive_appearances": adv["consecutive_count"],
            "failure_probability": float(failure_prob),
            "urgency_score": round(float(urgency_score), 2),
            "estimated_repair_cost_low": cost_match["low"],
            "estimated_repair_cost_high": cost_match["high"],
            "repair_urgency": cost_match["action"]
        })

    # 5. Define overall vehicle risk level
    if today > mot_due_date:
        risk_level = "CRITICAL"
    elif max_urgency >= 0.7:
        risk_level = "CRITICAL"
    elif max_urgency >= 0.5:
        risk_level = "HIGH"
    elif max_urgency >= 0.25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "registration": normalized_reg,
        "mot_due_date": mot_due_date.strftime("%Y-%m-%d"),
        "months_to_mot": months_to_mot,
        "overall_risk_level": risk_level,
        "advisory_risks": advisory_risks,
        "total_estimated_repair_cost_low": total_low,
        "total_estimated_repair_cost_high": total_high,
        "data_confidence": overall_confidence
    }

if __name__ == "__main__":
    # Test lookup printout
    test_report = get_vehicle_maintenance_report("ML58FOU")
    print(json.dumps(test_report, indent=2))
