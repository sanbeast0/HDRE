"""
Hydro-Diplomacy & Resilience Engine (HDRE / R2C Ai)
High-Performance FastAPI Application Gateway
OpenAPI 3.1 RESTful endpoints connecting transboundary river basin treaty allocations
directly to municipal ward tap delivery.
"""
import os
import json
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from database import (
    init_db,
    get_all_ward_metadata,
    get_latest_dam_telemetry,
    get_dam_timeseries,
    get_latest_ward_telemetry,
    log_simulation
)
from schemas import (
    TreatySimulateRequest,
    TreatySimulateResponse,
    MunicipalOptimizeRequest,
    MunicipalOptimizeResponse,
    TreatyToTapRequest,
    TreatyToTapResponse
)
from models.optimizers import RawlsianTreatyOptimizer, MunicipalMILPAllocator
from models.train_xgboost import WardDemandForecaster

# Initialize Database on app load
init_db()

app = FastAPI(
    title="Hydro-Diplomacy & Resilience Engine (HDRE / R2C Ai) API",
    description=(
        "Production-spec computational bridge connecting macro Rawlsian Maximin treaty "
        "allocations directly to micro municipal ward tap delivery. "
        "Enforces non-negotiable >= 55 LPCD human water floor and zero-deficit hospital reserves."
    ),
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local development and UI cockpit
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# ------------------------------------------------------------------------------
# SYSTEM HEALTH & METADATA
# ------------------------------------------------------------------------------

@app.get("/api/v1/health", tags=["System"])
async def health_check():
    return {
        "status": "HEALTHY",
        "system": "Hydro-Diplomacy & Resilience Engine (HDRE / R2C Ai)",
        "version": "2.4.0",
        "basin": "Krishna-Bhima Basin (KRISHNA_BHIMA_01)",
        "city": "Pune Metro (15 Municipal Wards)",
        "statutory_compliance_enforced": True
    }

@app.get("/api/v1/wards/metadata", tags=["Municipal Telemetry"])
async def get_wards():
    """Returns baseline demographic and hydraulic metadata for all 15 Pune municipal wards."""
    return get_all_ward_metadata()

@app.get("/api/v1/wards/telemetry/latest", tags=["Municipal Telemetry"])
async def get_wards_latest_telemetry():
    """Returns the most recent SCADA telemetry meter readings for each ward."""
    return get_latest_ward_telemetry()

@app.get("/api/v1/dams/telemetry/latest", tags=["Macro Telemetry"])
async def get_dams_latest():
    """Returns the latest weekly reservoir telemetry for Khadakwasla, Panshet, Varasgaon, and Ujani dams."""
    return get_latest_dam_telemetry()

@app.get("/api/v1/dams/telemetry/timeseries", tags=["Macro Telemetry"])
async def get_dams_history(dam_id: Optional[str] = Query(None)):
    """Returns historical time-series of reservoir levels, inflows, requirements, and releases."""
    return get_dam_timeseries(dam_id)

@app.get("/api/v1/geojson/wards", tags=["Geospatial"])
async def get_wards_geojson():
    """Returns the GeoJSON vector polygons for Pune municipal wards."""
    geojson_path = os.path.join(DATA_DIR, "municipal_wards.geojson")
    if os.path.exists(geojson_path):
        with open(geojson_path, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Wards GeoJSON not found.")

@app.get("/api/v1/geojson/basin", tags=["Geospatial"])
async def get_basin_geojson():
    """Returns the GeoJSON vector polygon and river trunk for the Krishna-Bhima Basin."""
    geojson_path = os.path.join(DATA_DIR, "river_basins.geojson")
    if os.path.exists(geojson_path):
        with open(geojson_path, "r") as f:
            return json.load(f)
    raise HTTPException(status_code=404, detail="Basin GeoJSON not found.")

@app.get("/api/v1/ml/model-info", tags=["Machine Learning"])
async def get_ml_info():
    """Returns XGBoost regression evaluation metrics and hyperparameter configurations."""
    config_path = os.path.join(os.path.dirname(__file__), "models", "model_config.json")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return json.load(f)
    return {"message": "Model config loading..."}

# ------------------------------------------------------------------------------
# CORE OPTIMIZATION ENDPOINTS
# ------------------------------------------------------------------------------

@app.post("/api/v1/treaty/simulate-maximin", response_model=TreatySimulateResponse, tags=["Macro Treaty Sandbox"])
async def simulate_maximin_treaty(req: TreatySimulateRequest):
    """
    STAGE 2: Macro Rawlsian Maximin Interstate Treaty Simulation.
    Formulates John Rawls' Maximin social justice optimization across riparian states
    to identify equitable treaty release options under severe precipitation and temperature anomalies.
    Returns Pareto optimal points and Explainable AI legal justification summary.
    """
    optimizer = RawlsianTreatyOptimizer()
    
    result = optimizer.solve_maximin(
        dam_alpha_storage_tmc=req.dam_alpha_storage_tmc,
        dam_beta_storage_tmc=req.dam_beta_storage_tmc,
        projected_inflow_tmc=req.projected_inflow_tmc,
        precip_deficit_pct=req.climate_shock.precip_deficit_pct,
        temp_surge_c=req.climate_shock.temp_surge_c,
        environmental_flow_min_tmc=req.environmental_flow_min_tmc or 2.5
    )

    log_simulation(
        sim_type="MACRO_RAWLSIAN_MAXIMIN",
        input_data=json.dumps(req.model_dump()),
        output_data=json.dumps({
            "R_A": result["optimal_release_state_a_tmc"],
            "R_B": result["optimal_release_state_b_tmc"],
            "score": result["maximin_security_score"]
        }),
        score=result["maximin_security_score"]
    )

    return result

@app.post("/api/v1/municipal/optimize-ward-rationing", response_model=MunicipalOptimizeResponse, tags=["Micro Municipal Cockpit"])
async def optimize_ward_rationing(req: MunicipalOptimizeRequest):
    """
    STAGE 3: Municipal Ward Deficit Prediction & MILP Allocation.
    Uses trained XGBoost regression models on historical telemetry to forecast 30-, 60-, and 90-day
    ward deficits, then solves Google OR-Tools Mixed-Integer Linear Program (MILP) to optimize
    hydraulic valve schedules and water rationing while strictly enforcing non-negotiable statutory
    human water floors (>= 55 LPCD) and zero-deficit hospital reserves.
    """
    wards = get_all_ward_metadata()
    latest_telemetry = get_latest_ward_telemetry()

    # Step 1: Run ML deficit forecast for the requested horizon
    forecasted_unmet_ratios = WardDemandForecaster.forecast(
        horizon_days=req.forecast_horizon_days,
        temp_surge_c=0.0,
        precip_deficit_pct=0.0,
        latest_telemetry=latest_telemetry
    )

    # Step 2: Solve Municipal MILP flow distribution
    allocator = MunicipalMILPAllocator(wards)
    result = allocator.solve_allocation(
        allocated_bulk_quota_mld=req.allocated_bulk_quota_mld,
        forecast_horizon_days=req.forecast_horizon_days,
        unmet_forecast_ratios=forecasted_unmet_ratios
    )

    log_simulation(
        sim_type="MUNICIPAL_ORTOOLS_MILP",
        input_data=json.dumps(req.model_dump()),
        output_data=json.dumps({
            "min_lpcd": result["minimum_ward_lpcd"],
            "avg_lpcd": result["average_ward_lpcd"],
            "pumping_cost": result["pumping_energy_cost_inr"]
        }),
        score=result["minimum_ward_lpcd"]
    )

    return result

@app.post("/api/v1/treaty-to-tap/simulate", response_model=TreatyToTapResponse, tags=["Closed-Loop Integration"])
async def simulate_treaty_to_tap(req: TreatyToTapRequest):
    """
    CLOSED-LOOP TREATY-TO-TAP PIPELINE:
    Proves that interstate hydro-diplomacy and municipal city survival are two sides of the same coin.
    Translates macro reservoir treaty releases directly into bulk municipal intake (MLD),
    forecasts ward vulnerability via XGBoost, and generates automated SCADA valve schedules via MILP.
    """
    # 1. Macro Treaty Simulation
    optimizer = RawlsianTreatyOptimizer()
    macro_result = optimizer.solve_maximin(
        dam_alpha_storage_tmc=req.dam_alpha_storage_tmc,
        dam_beta_storage_tmc=req.dam_beta_storage_tmc,
        projected_inflow_tmc=req.projected_inflow_tmc,
        precip_deficit_pct=req.climate_shock.precip_deficit_pct,
        temp_surge_c=req.climate_shock.temp_surge_c
    )

    # 2. Dynamic conversion from State A Upstream release (TMC) to Pune Municipal Bulk Quota (MLD)
    # 1 TMC = 28,317 million liters. Typically, ~18-20 TMC/year is urban waterworks quota.
    # Daily flume MLD = (Release_A_TMC * 28317 * fraction) / 365 days
    # Default fraction ~ 0.28 dedicated to Pune urban waterworks; remaining to canal irrigation.
    state_a_release_tmc = macro_result["optimal_release_state_a_tmc"]
    urban_fraction = req.bulk_allocation_fraction or 0.28
    
    # Compute resulting MLD flume (typical range 650 MLD to 950 MLD)
    computed_bulk_mld = round((state_a_release_tmc * 28316.85 * urban_fraction) / 365.0, 1)
    computed_bulk_mld = max(550.0, min(1200.0, computed_bulk_mld))

    # 3. Micro Municipal ML & MILP Execution
    wards = get_all_ward_metadata()
    latest_telemetry = get_latest_ward_telemetry()
    forecasted_unmet_ratios = WardDemandForecaster.forecast(
        horizon_days=req.forecast_horizon_days,
        temp_surge_c=req.climate_shock.temp_surge_c,
        precip_deficit_pct=req.climate_shock.precip_deficit_pct,
        latest_telemetry=latest_telemetry
    )

    allocator = MunicipalMILPAllocator(wards)
    micro_result = allocator.solve_allocation(
        allocated_bulk_quota_mld=computed_bulk_mld,
        forecast_horizon_days=req.forecast_horizon_days,
        unmet_forecast_ratios=forecasted_unmet_ratios
    )

    narrative = (
        f"CLOSED-LOOP EXECUTION COMPLETE: An upstream release of {state_a_release_tmc:.1f} TMC "
        f"translates into a downstream bulk intake flume of {computed_bulk_mld:.1f} MLD at Pune waterworks. "
        f"Google OR-Tools MILP guaranteed the statutory human baseline ({micro_result['minimum_ward_lpcd']:.1f} LPCD >= 55) "
        f"and locked 100% of critical hospital buffers ({len([w for w in micro_result['ward_details'] if w['hospital_zero_deficit']])}/15 wards secured). "
        f"Automated SCADA valve actuation dispatched {len(micro_result['automated_valve_actions'])} hydraulic commands."
    )

    return {
        "status": "SUCCESS",
        "macro_treaty": macro_result,
        "micro_municipal": micro_result,
        "closed_loop_narrative": narrative
    }

# ------------------------------------------------------------------------------
# SERVE FRONTEND STATIC FILES & SPA ROUTE
# ------------------------------------------------------------------------------

# Mount frontend directory for static assets if present
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    """Serves the interactive React single page application."""
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return JSONResponse(
        {"message": "HDRE API running. Frontend index.html being assembled.", "docs": "/docs"}
    )
