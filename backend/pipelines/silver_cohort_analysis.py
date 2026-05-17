# PySpark Cohort Analysis Pipeline: Silver Layer
# Calculates advisory-to-failure conversion rate for components.

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, floor, year, to_date, lit, count, sum, round
from pyspark.sql.window import Window
from pyspark.sql import functions as F

def run_cohort_analysis():
    spark = SparkSession.builder \
        .appName("IsThisCarSafe-Silver-Cohort-Analysis") \
        .getOrCreate()

    bronze_table = "unity_catalog.isthiscarsafe_bronze.mot_tests"
    output_silver_table = "unity_catalog.isthiscarsafe_silver.component_risk_profile"

    # Load bronze data
    tests_df = spark.read.format("delta").load(bronze_table)

    # Establish window for chronological progression
    vehicle_window = Window.partitionBy("vehicle_id").orderBy("test_date")

    # Select distinct tests to build the chronological timeline per vehicle
    unique_tests = tests_df.select(
        "vehicle_id", "test_date", "mileage", "make_group"
    ).distinct()

    # Get chronological test order (N and N+1)
    timeline_df = unique_tests.withColumn("test_rank", F.row_number().over(vehicle_window))
    
    # Lead values to find test N+1
    next_test_df = timeline_df \
        .withColumn("next_test_date", F.lead("test_date", 1).over(vehicle_window)) \
        .withColumn("next_mileage", F.lead("mileage", 1).over(vehicle_window)) \
        .withColumn("next_test_rank", col("test_rank") + 1)

    # Filter out component-level advisories at test N
    advisories_n = tests_df.filter(col("rfr_type") == "ADVISORY").select(
        col("vehicle_id").alias("adv_vehicle_id"),
        col("test_date").alias("adv_test_date"),
        col("rfr_code").alias("adv_rfr_code"),
        col("component_name").alias("adv_component_name")
    )

    # Filter out component-level failures at test N+1
    failures_n_plus_1 = tests_df.filter(
        (col("rfr_type") == "FAIL") | 
        (col("rfr_type") == "MAJOR") | 
        (col("rfr_type") == "DANGEROUS")
    ).select(
        col("vehicle_id").alias("fail_vehicle_id"),
        col("test_date").alias("fail_test_date"),
        col("rfr_code").alias("fail_rfr_code")
    )

    # Join advisories at test N to their timeline rank
    advisories_ranked = advisories_n.join(
        next_test_df,
        (advisories_n.adv_vehicle_id == next_test_df.vehicle_id) & 
        (advisories_n.adv_test_date == next_test_df.test_date),
        "inner"
    )

    # Left join with failures at test N+1 for the same component (rfr_code match)
    cohort_join = advisories_ranked.join(
        failures_n_plus_1,
        (advisories_ranked.vehicle_id == failures_n_plus_1.fail_vehicle_id) & 
        (advisories_ranked.next_test_date == failures_n_plus_1.fail_test_date) & 
        (advisories_ranked.adv_rfr_code == failures_n_plus_1.fail_rfr_code),
        "left"
    )

    # Add derived columns: age_band, mileage_band
    # Age is calculated based on test year minus estimated model year (derived from first usage)
    # Since first used date is typically 3 years prior to first MOT (age 3)
    analyzed_cohort = cohort_join.withColumn(
        "vehicle_age", 
        F.coalesce((F.year("test_date") - F.year("test_date")), F.lit(5)) # Fallback estimate
    ).withColumn(
        "age_band", 
        F.floor(col("vehicle_age") / 2) * 2
    ).withColumn(
        "mileage_band", 
        F.floor(col("mileage") / 20000) * 20000
    )

    # Group by cohort factors to calculate failure rates
    risk_profile = analyzed_cohort.groupBy(
        col("adv_rfr_code").alias("rfr_code"),
        col("adv_component_name").alias("component_name"),
        col("make_group"),
        col("age_band"),
        col("mileage_band")
    ).agg(
        count(lit(1)).alias("advisory_count"),
        sum(when(col("fail_rfr_code").isNotNull(), 1).otherwise(0)).alias("subsequent_failure_count")
    )

    # Calculate final failure probability rate and overall cohort size
    final_risk_profile = risk_profile \
        .withColumn("failure_rate", round(col("subsequent_failure_count") / col("advisory_count"), 4)) \
        .withColumn("sample_size", col("advisory_count")) \
        .filter(col("sample_size") >= 50) # Strict statistical significance rule

    # Write profile table to Silver layer
    final_risk_profile.write \
        .format("delta") \
        .mode("overwrite") \
        .save(output_silver_table)

if __name__ == "__main__":
    run_cohort_analysis()
