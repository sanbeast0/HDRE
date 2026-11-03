"""
Pydantic v2 validation schemas conforming to OpenAPI 3.1 specifications.
Strictly implements models for Macro Rawlsian Maximin Treaty Simulation,
Municipal Ward Deficit Prediction, and Google OR-Tools MILP Allocation.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ClimateShock(BaseModel):
    precip_deficit_pct: float = Field(
        default=-30.0,
        description="Percentage monsoon deficit anomaly (e.g. -30.0 for RCP 8.5 stress test)",
        ge=-100.0,
        le=100.0
    )
    temp_surge_c: float = Field(
        default=2.5,
        description="Extended ambient temperature surge in degrees Celsius",
        ge=-5.0,
        le=10.0
    )

class TreatySimulateRequest(BaseModel):
    basin_id: str = Field(default="KRISHNA_BHIMA_01", description="Basin identifier")
    dam_alpha_storage_tmc: float = Field(
        default=64.2,
        description="Combined live storage in Upstream Catchment dams (Alpha: Panshet, Varasgaon, Khadakwasla)",
        ge=0.0
    )
    dam_beta_storage_tmc: float = Field(
        default=38.5,
        description="Live storage in Downstream Interstate reservoir (Beta: Ujani)",
        ge=0.0
    )
    projected_inflow_tmc: float = Field(
        default=14.1,
        description="Projected seasonal catchment inflow in TMC",
        ge=0.0
    )
    climate_shock: ClimateShock = Field(
        default_factory=ClimateShock,
        description="Climate stressor parameters (precipitation deficit and temperature surge)"
    )
    environmental_flow_min_tmc: Optional[float] = Field(
        default=2.5,
        description="Mandated statutory environmental ecological flow for river trunk"
    )

class TreatySimulateResponse(BaseModel):
    status: str = Field(default="SUCCESS", description="Solver execution status")
    basin_id: str = "KRISHNA_BHIMA_01"
    optimal_release_state_a_tmc: float = Field(..., description="Equitable release allocated to State A (Upstream)")
    optimal_release_state_b_tmc: float = Field(..., description="Equitable release allocated to State B (Downstream)")
    maximin_security_score: float = Field(..., description="Rawlsian Maximin welfare index (0.0 to 1.0)")
    state_a_security: float = Field(..., description="State A security index")
    state_b_security: float = Field(..., description="State B security index")
    pareto_points: List[List[float]] = Field(..., description="Pareto trade-off curve coordinates [[S_A, S_B], ...]")
    judicial_summary: str = Field(..., description="Explainable AI legal dispute summary for adjudicators and ministers")
    evaporative_loss_tmc: float = Field(..., description="Penman-Monteith evaporative loss adjusted for temperature surge")
    effective_available_tmc: float = Field(..., description="Net mass available for allocation after losses and eco-flows")
    utilitarian_comparison: Dict[str, Any] = Field(..., description="Comparative stats vs uncoordinated Utilitarian allocation")

class MunicipalOptimizeRequest(BaseModel):
    city_id: str = Field(default="PUNE_METRO", description="City municipal ID")
    allocated_bulk_quota_mld: float = Field(
        default=850.0,
        description="Bulk intake water flume in MLD translated from macro reservoir release",
        gt=0.0
    )
    forecast_horizon_days: int = Field(
        default=60,
        description="Forecast horizon (30, 60, or 90 days)",
        ge=30,
        le=90
    )
    enforce_lpcd_floor: bool = Field(
        default=True,
        description="Non-negotiable statutory human water floor (>= 55 LPCD)"
    )
    enforce_hospital_reserves: bool = Field(
        default=True,
        description="Zero-deficit medical infrastructure reservation"
    )

class AutomatedValveAction(BaseModel):
    node_id: str = Field(..., description="SCADA valve identifier")
    action: str = Field(..., description="Prescribed automated valve actuation command")
    target_ward: str = Field(..., description="Target municipal ward ID")
    flow_adjustment_mld: float = Field(..., description="Flow delta in MLD")
    reason: str = Field(..., description="Algorithmic rationale for intervention")

class WardDetailAllocation(BaseModel):
    ward_id: str
    ward_name: str
    population: int
    elevation_head_m: float
    hospital_beds_count: int
    hospital_reserve_min_mld: float
    slum_pop_ratio: float
    pipe_age_years: float
    forecasted_unmet_ratio: float
    unconstrained_demand_mld: float
    allocated_flow_mld: float
    delivered_lpcd: float
    lpcd_compliant: bool
    hospital_zero_deficit: bool
    estimated_terminal_pressure_bar: float
    pressure_status: str
    leakage_pct: float
    severity_category: str

class MunicipalOptimizeResponse(BaseModel):
    status: str = Field(default="OPTIMAL_FEASIBLE", description="OR-Tools solver status")
    city_id: str = "PUNE_METRO"
    forecast_horizon_days: int
    lpcd_floor_maintained: bool = Field(..., description="Flag verifying >= 55 LPCD guaranteed across all wards")
    minimum_ward_lpcd: float = Field(..., description="Lowest LPCD received across all wards")
    average_ward_lpcd: float = Field(..., description="Average LPCD delivered across city")
    ward_allocations_mld: Dict[str, float] = Field(..., description="Per-ward allocated flow in MLD")
    hospital_reserves_secured: bool = Field(..., description="Flag verifying zero-deficit medical priority reservation")
    pumping_energy_cost_inr: float = Field(..., description="Total daily hydraulic pumping energy cost in INR")
    allocated_bulk_quota_mld: float
    total_unconstrained_demand_mld: float
    total_allocated_mld: float
    total_unmet_deficit_mld: float
    automated_valve_actions: List[AutomatedValveAction]
    ward_details: List[WardDetailAllocation]

class TreatyToTapRequest(BaseModel):
    basin_id: str = "KRISHNA_BHIMA_01"
    city_id: str = "PUNE_METRO"
    dam_alpha_storage_tmc: float = 64.2
    dam_beta_storage_tmc: float = 38.5
    projected_inflow_tmc: float = 14.1
    climate_shock: ClimateShock = Field(default_factory=ClimateShock)
    forecast_horizon_days: int = 60
    bulk_allocation_fraction: Optional[float] = Field(
        default=None,
        description="Fraction of State A release channeled to municipal bulk intake (default derived dynamically)"
    )

class TreatyToTapResponse(BaseModel):
    status: str = "SUCCESS"
    macro_treaty: TreatySimulateResponse
    micro_municipal: MunicipalOptimizeResponse
    closed_loop_narrative: str
