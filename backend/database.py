"""
HDRE Data Fabric & Database Engine
Connects to SQLite / PostgreSQL, loads historical telemetry and dam datasets,
and manages spatial-temporal metadata queries.
"""
import os
import sqlite3
import pandas as pd
from typing import Dict, List, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "hdre.db")
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
WARD_CSV = os.path.join(DATA_DIR, "hdre_ward_training_dataset.csv")
DAM_CSV = os.path.join(DATA_DIR, "dam_weekly_reservoir_allocation_dataset.csv")

WARD_NAMES = {
    "WARD_01": "Aundh - Baner",
    "WARD_02": "Kothrud - Bavdhan",
    "WARD_03": "Kasba - Vishrambaug (Medical Node)",
    "WARD_04": "Bhavani Peth (Heritage Pipe)",
    "WARD_05": "Nana Peth - Ganj Peth",
    "WARD_06": "Sahakar Nagar - Padmavati",
    "WARD_07": "Bibwewadi - Kondhwa",
    "WARD_08": "Hadapsar - Mundhwa (High Growth)",
    "WARD_09": "Nagar Road - Vadgaon Sheri",
    "WARD_10": "Viman Nagar - Kalyani Nagar",
    "WARD_11": "Yerwada - Kalas (Slum Vulnerable)",
    "WARD_12": "Ghole Road - Deccan",
    "WARD_13": "Sinhagad Road - Parvati",
    "WARD_14": "Shivajinagar - Model Colony (Elevated Ridge)",
    "WARD_15": "Warje - Karvenagar"
}

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and populates data from CSVs if not already present."""
    conn = get_connection()
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS simulation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        sim_type TEXT,
        input_payload TEXT,
        output_payload TEXT,
        security_score REAL
    )
    """)
    conn.commit()

    # Check if ward_telemetry is loaded
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ward_telemetry'")
    if not cursor.fetchone():
        print("[DB] Ingesting ward telemetry CSV into SQLite...")
        if os.path.exists(WARD_CSV):
            df_ward = pd.read_csv(WARD_CSV)
            df_ward.to_sql("ward_telemetry", conn, if_exists="replace", index=False)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_ward_date ON ward_telemetry(ward_id, date)")
            print(f"[DB] Ingested {len(df_ward)} ward telemetry records.")

    # Check if dam_allocations is loaded
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='dam_allocations'")
    if not cursor.fetchone():
        print("[DB] Ingesting dam weekly allocation CSV into SQLite...")
        if os.path.exists(DAM_CSV):
            df_dam = pd.read_csv(DAM_CSV)
            df_dam.to_sql("dam_allocations", conn, if_exists="replace", index=False)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_dam_date ON dam_allocations(dam_id, week_start_date)")
            print(f"[DB] Ingested {len(df_dam)} dam records.")

    # Populate or refresh ward_metadata summary table
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ward_metadata'")
    if not cursor.fetchone():
        print("[DB] Building ward metadata reference table...")
        cursor.execute("""
        CREATE TABLE ward_metadata AS
        SELECT 
            ward_id,
            AVG(population) AS population,
            AVG(growth_rate) AS growth_rate,
            AVG(baseline_lpcd) AS baseline_lpcd,
            AVG(elevation_head_m) AS elevation_head_m,
            AVG(pipe_age_years) AS pipe_age_years,
            AVG(slum_pop_ratio) AS slum_pop_ratio,
            AVG(hospital_beds_count) AS hospital_beds_count,
            AVG(esr_capacity_kl) AS esr_capacity_kl,
            AVG(inlet_flow_mld) AS avg_historical_inlet_mld,
            AVG(terminal_pressure_bar) AS avg_terminal_pressure_bar,
            AVG(estimated_leakage_pct) AS avg_leakage_pct
        FROM ward_telemetry
        GROUP BY ward_id
        """)
        conn.commit()

    conn.close()

def get_all_ward_metadata() -> List[Dict[str, Any]]:
    """Returns baseline metadata for all 15 Pune Municipal wards."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ward_metadata ORDER BY ward_id")
    rows = cursor.fetchall()
    results = []
    for r in rows:
        d = dict(r)
        d["ward_name"] = WARD_NAMES.get(d["ward_id"], d["ward_id"])
        # Hospital daily minimum buffer in MLD (350 Liters/bed/day standard + 20% critical emergency surge margin)
        beds = d.get("hospital_beds_count", 0)
        d["hospital_reserve_min_mld"] = round((beds * 350.0 * 1.20) / 1_000_000.0, 4)
        # Baseline human right to water floor in MLD (55 LPCD)
        pop = d.get("population", 0)
        d["statutory_min_mld"] = round((pop * 55.0) / 1_000_000.0, 4)
        # Normal baseline unconstrained demand in MLD (~135-150 LPCD target)
        d["unconstrained_demand_mld"] = round((pop * 140.0) / 1_000_000.0, 4)
        results.append(d)
    conn.close()
    return results

def get_latest_dam_telemetry() -> List[Dict[str, Any]]:
    """Returns the most recent weekly telemetry for all dams."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT d.* FROM dam_allocations d
    INNER JOIN (
        SELECT dam_id, MAX(week_start_date) as max_date
        FROM dam_allocations
        GROUP BY dam_id
    ) latest ON d.dam_id = latest.dam_id AND d.week_start_date = latest.max_date
    ORDER BY d.dam_id
    """)
    rows = cursor.fetchall()
    results = [dict(r) for r in rows]
    conn.close()
    return results

def get_dam_timeseries(dam_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns historical time-series for dam telemetry."""
    conn = get_connection()
    cursor = conn.cursor()
    if dam_id:
        cursor.execute("SELECT * FROM dam_allocations WHERE dam_id = ? ORDER BY week_start_date", (dam_id,))
    else:
        cursor.execute("SELECT * FROM dam_allocations ORDER BY week_start_date, dam_id")
    rows = cursor.fetchall()
    results = [dict(r) for r in rows]
    conn.close()
    return results

def get_latest_ward_telemetry() -> List[Dict[str, Any]]:
    """Returns the most recent SCADA/metering reading for each ward."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT w.* FROM ward_telemetry w
    INNER JOIN (
        SELECT ward_id, MAX(date) as max_date
        FROM ward_telemetry
        GROUP BY ward_id
    ) latest ON w.ward_id = latest.ward_id AND w.date = latest.max_date
    ORDER BY w.ward_id
    """)
    rows = cursor.fetchall()
    results = []
    for r in rows:
        d = dict(r)
        d["ward_name"] = WARD_NAMES.get(d["ward_id"], d["ward_id"])
        results.append(d)
    conn.close()
    return results

def log_simulation(sim_type: str, input_data: str, output_data: str, score: float = 0.0):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO simulation_logs (sim_type, input_payload, output_payload, security_score)
    VALUES (?, ?, ?, ?)
    """, (sim_type, input_data, output_data, score))
    conn.commit()
    conn.close()
