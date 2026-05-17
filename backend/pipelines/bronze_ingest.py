# PySpark Ingestion Pipeline: Bronze Layer
# Matches DVSA official RFR taxonomy to map codes to component names.

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, year, lower, trim

def run_bronze_ingestion():
    # Initialize Databricks Spark Session
    spark = SparkSession.builder \
        .appName("IsThisCarSafe-Bronze-Ingestion") \
        .getOrCreate()

    # Raw bulk DVSA MOT test table path
    raw_mot_path = "dbfs:/mnt/dvsa/bulk_mot_raw"
    output_delta_table = "unity_catalog.isthiscarsafe_bronze.mot_tests"

    # Read bulk raw data
    raw_df = spark.read.format("delta").load(raw_mot_path)

    # Human-readable RFR code taxonomy mapping
    # Mapped from official DVSA RFR standards (2025 UK MOT Inspection Manuals)
    rfr_mapped_df = raw_df.withColumn(
        "component_name",
        when(col("rfr_code").like("1.1%"), "Front Brakes")
        .when(col("rfr_code").like("1.2%"), "Rear Brakes")
        .when(col("rfr_code").like("1.3%"), "Parking Brake")
        .when(col("rfr_code").like("2.1%"), "Steering Linkage")
        .when(col("rfr_code").like("2.2%"), "Steering Wheel & Column")
        .when(col("rfr_code").like("3.1%"), "Windscreen & Glass")
        .when(col("rfr_code").like("3.2%"), "Windscreen Wipers")
        .when(col("rfr_code").like("4.1%"), "Headlamps")
        .when(col("rfr_code").like("4.2%"), "Indicators & Hazard Lights")
        .when(col("rfr_code").like("4.3%"), "Stop Lights")
        .when(col("rfr_code").like("5.1%"), "Front Suspension")
        .when(col("rfr_code").like("5.2%"), "Rear Suspension")
        .when(col("rfr_code").like("5.3%"), "Shock Absorbers")
        .when(col("rfr_code").like("6.1%"), "Exhaust System")
        .when(col("rfr_code").like("6.2%"), "Fuel System")
        .when(col("rfr_code").like("7.1%"), "Seatbelts & Anchors")
        .when(col("rfr_code").like("8.1%"), "Tyres (Front)")
        .when(col("rfr_code").like("8.2%"), "Tyres (Rear)")
        .when(col("rfr_code").like("8.3%"), "Wheels & Hubs")
        .when(col("rfr_code").like("9.1%"), "Emissions Control")
        .otherwise("General Chassis & Structural Components")
    )

    # Classify rfr_type by code and result flags
    classified_df = rfr_mapped_df.withColumn(
        "rfr_type",
        when(col("rfr_type_code") == "A", "ADVISORY")
        .when(col("rfr_type_code") == "M", "MINOR")
        .when(col("rfr_type_code") == "F", "FAIL")
        .when(col("rfr_type_code") == "D", "DANGEROUS")
        .otherwise("ADVISORY")
    )

    # Clean make strings and extract test year for partitioning
    cleaned_df = classified_df \
        .withColumn("make_group", lower(trim(col("make")))) \
        .withColumn("make_group", when(col("make_group") == "vw", "volkswagen")
                                 .when(col("make_group") == "bmw mini", "mini")
                                 .otherwise(col("make_group"))) \
        .withColumn("test_year", year(col("test_date")))

    # Select core columns
    bronze_table_df = cleaned_df.select(
        col("vehicle_id"),
        col("test_date"),
        col("test_result"),
        col("mileage"),
        col("rfr_code"),
        col("component_name"),
        col("rfr_type"),
        col("make_group"),
        col("test_year")
    )

    # Write to Unity Catalog partitioned by make and year for performance
    bronze_table_df.write \
        .format("delta") \
        .mode("overwrite") \
        .partitionBy("make_group", "test_year") \
        .save(output_delta_table)

if __name__ == "__main__":
    run_bronze_ingestion()
