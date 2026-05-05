-- ============================================
-- CarRecalls UK — Database Schema
-- Medallion Architecture: Bronze → Silver → Gold
-- ============================================

-- =====================
-- BRONZE LAYER (Raw)
-- =====================

CREATE TABLE IF NOT EXISTS bronze_mot_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL,
    vehicle_id TEXT,
    make TEXT,
    model TEXT,
    first_used_date TEXT,
    fuel_type TEXT,
    primary_colour TEXT,
    registration_date TEXT,
    manufacture_date TEXT,
    engine_size TEXT,
    -- MOT test fields
    test_number TEXT,
    completed_date TEXT,
    test_result TEXT,
    expiry_date TEXT,
    odometer_value TEXT,
    odometer_unit TEXT,
    odometer_result_type TEXT,
    mot_test_due_date TEXT,
    -- Defects stored as JSON array
    defects_json TEXT,
    -- Metadata
    ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    raw_json TEXT,
    UNIQUE(registration, test_number)
);

CREATE TABLE IF NOT EXISTS bronze_recalls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT,
    recall_number TEXT,
    concern TEXT,
    defect TEXT,
    remedy TEXT,
    vehicle_number TEXT,
    build_start TEXT,
    build_end TEXT,
    recalled_date TEXT,
    -- Metadata
    ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    raw_json TEXT
);

CREATE TABLE IF NOT EXISTS bronze_api_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT NOT NULL,
    method TEXT DEFAULT 'GET',
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- SILVER LAYER (Transformed)
-- =====================

CREATE TABLE IF NOT EXISTS silver_vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL UNIQUE,
    vehicle_id TEXT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    make_normalized TEXT,
    model_normalized TEXT,
    first_used_date DATE,
    fuel_type TEXT,
    primary_colour TEXT,
    engine_size_cc INTEGER,
    vehicle_age_years REAL,
    total_mot_tests INTEGER DEFAULT 0,
    total_passes INTEGER DEFAULT 0,
    total_failures INTEGER DEFAULT 0,
    latest_mileage INTEGER,
    latest_test_date DATE,
    latest_test_result TEXT,
    mot_expiry_date DATE,
    has_outstanding_recalls BOOLEAN DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS silver_mot_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL,
    test_number TEXT NOT NULL UNIQUE,
    test_date DATE NOT NULL,
    test_result TEXT NOT NULL,
    expiry_date DATE,
    mileage INTEGER,
    mileage_unit TEXT DEFAULT 'mi',
    mileage_valid BOOLEAN DEFAULT 1,
    defect_count INTEGER DEFAULT 0,
    dangerous_count INTEGER DEFAULT 0,
    major_count INTEGER DEFAULT 0,
    minor_count INTEGER DEFAULT 0,
    advisory_count INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration) REFERENCES silver_vehicles(registration)
);

CREATE TABLE IF NOT EXISTS silver_defects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL,
    test_number TEXT NOT NULL,
    test_date DATE NOT NULL,
    defect_text TEXT NOT NULL,
    defect_type TEXT NOT NULL,
    is_dangerous BOOLEAN DEFAULT 0,
    category TEXT,
    component TEXT,
    FOREIGN KEY (test_number) REFERENCES silver_mot_history(test_number)
);

CREATE TABLE IF NOT EXISTS silver_mileage_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL,
    test_date DATE NOT NULL,
    mileage INTEGER NOT NULL,
    mileage_delta INTEGER,
    days_since_last INTEGER,
    daily_avg_miles REAL,
    anomaly_flag BOOLEAN DEFAULT 0,
    UNIQUE(registration, test_date),
    FOREIGN KEY (registration) REFERENCES silver_vehicles(registration)
);

-- =====================
-- GOLD LAYER (Business Logic)
-- =====================

CREATE TABLE IF NOT EXISTS gold_vehicle_safety_score (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL UNIQUE,
    safety_score INTEGER NOT NULL,
    mot_reliability_score INTEGER,
    defect_severity_score INTEGER,
    mileage_consistency_score INTEGER,
    recall_risk_score INTEGER,
    risk_level TEXT,
    summary TEXT,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration) REFERENCES silver_vehicles(registration)
);

CREATE TABLE IF NOT EXISTS gold_make_model_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    total_vehicles INTEGER DEFAULT 0,
    avg_safety_score REAL,
    avg_pass_rate REAL,
    avg_defects_per_test REAL,
    most_common_defect TEXT,
    recall_count INTEGER DEFAULT 0,
    risk_ranking INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(make, model)
);

CREATE TABLE IF NOT EXISTS gold_defect_trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    defect_category TEXT NOT NULL,
    defect_component TEXT,
    occurrence_count INTEGER DEFAULT 0,
    pct_of_all_defects REAL,
    avg_severity REAL,
    trend_direction TEXT,
    period TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gold_dashboard_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_key TEXT NOT NULL UNIQUE,
    metric_value TEXT NOT NULL,
    metric_type TEXT DEFAULT 'number',
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX IF NOT EXISTS idx_bronze_mot_reg ON bronze_mot_tests(registration);
CREATE INDEX IF NOT EXISTS idx_bronze_recalls_make ON bronze_recalls(make);
CREATE INDEX IF NOT EXISTS idx_silver_vehicles_make ON silver_vehicles(make_normalized);
CREATE INDEX IF NOT EXISTS idx_silver_mot_reg ON silver_mot_history(registration);
CREATE INDEX IF NOT EXISTS idx_silver_defects_reg ON silver_defects(registration);
CREATE INDEX IF NOT EXISTS idx_silver_defects_type ON silver_defects(defect_type);
CREATE INDEX IF NOT EXISTS idx_silver_mileage_reg ON silver_mileage_timeline(registration);
CREATE INDEX IF NOT EXISTS idx_gold_make_model ON gold_make_model_stats(make, model);
