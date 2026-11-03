import json
import urllib.request

def test_endpoints():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Health
    print("--> Testing GET /api/v1/health")
    with urllib.request.urlopen(f"{base_url}/api/v1/health") as response:
        health_data = json.loads(response.read().decode())
        print("Health Response:", health_data)
        assert health_data["status"] == "HEALTHY"

    # 2. Maximin Treaty
    print("\n--> Testing POST /api/v1/treaty/simulate-maximin")
    req_data = {
        "dam_alpha_storage_tmc": 75.0,
        "dam_beta_storage_tmc": 42.0,
        "projected_inflow_tmc": 68.0,
        "climate_shock": {
            "precip_deficit_pct": -30.0,
            "temp_surge_c": 2.5
        }
    }
    req = urllib.request.Request(
        f"{base_url}/api/v1/treaty/simulate-maximin",
        data=json.dumps(req_data).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        maximin_res = json.loads(resp.read().decode())
        print(f"Status: {maximin_res['status']}")
        print(f"Optimal R_A: {maximin_res['optimal_release_state_a_tmc']} TMC")
        print(f"Optimal R_B: {maximin_res['optimal_release_state_b_tmc']} TMC")
        print(f"Security Score: {maximin_res['maximin_security_score']}")
        print(f"Pareto Points: {len(maximin_res['pareto_points'])} coordinates")
        assert maximin_res["status"] == "SUCCESS"

    # 3. Municipal MILP Rationing
    print("\n--> Testing POST /api/v1/municipal/optimize-ward-rationing")
    muni_data = {
        "allocated_bulk_quota_mld": 750.0,
        "forecast_horizon_days": 30,
        "enforce_lpcd_floor": True,
        "enforce_hospital_reserves": True
    }
    req = urllib.request.Request(
        f"{base_url}/api/v1/municipal/optimize-ward-rationing",
        data=json.dumps(muni_data).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        muni_res = json.loads(resp.read().decode())
        print(f"Solver Status: {muni_res['status']}")
        print(f"Min Ward LPCD: {muni_res['minimum_ward_lpcd']:.2f} (Statutory Floor: >= 55.0)")
        print(f"Avg Ward LPCD: {muni_res['average_ward_lpcd']:.2f}")
        print(f"Floor Maintained: {muni_res['lpcd_floor_maintained']}")
        print(f"Hospital Reserves Secured: {muni_res['hospital_reserves_secured']}")
        print(f"SCADA Automated Actions: {len(muni_res['automated_valve_actions'])}")
        assert muni_res["status"] in ["OPTIMAL_FEASIBLE", "FEASIBLE"]
        assert muni_res["minimum_ward_lpcd"] >= 55.0
        assert muni_res["hospital_reserves_secured"] is True

    # 4. Closed-loop Treaty-to-Tap
    print("\n--> Testing POST /api/v1/treaty-to-tap/simulate")
    c_data = {
        "dam_alpha_storage_tmc": 75.0,
        "dam_beta_storage_tmc": 42.0,
        "projected_inflow_tmc": 68.0,
        "climate_shock": {
            "precip_deficit_pct": -30.0,
            "temp_surge_c": 2.5
        },
        "forecast_horizon_days": 60,
        "bulk_allocation_fraction": 0.28
    }
    req = urllib.request.Request(
        f"{base_url}/api/v1/treaty-to-tap/simulate",
        data=json.dumps(c_data).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        c_res = json.loads(resp.read().decode())
        print(f"Closed Loop Status: {c_res['status']}")
        print(f"Narrative: {c_res['closed_loop_narrative']}")
        assert c_res["status"] == "SUCCESS"

    # 5. Frontend Root
    print("\n--> Testing GET / (Single Page Application)")
    with urllib.request.urlopen(f"{base_url}/") as resp:
        html_content = resp.read().decode()
        print(f"Frontend Served: {len(html_content)} bytes")
        assert "Hydro-Diplomacy & Resilience Engine" in html_content

    # 6. GeoJSON endpoints
    print("\n--> Testing GET /api/v1/geojson/wards and /api/v1/geojson/basin")
    with urllib.request.urlopen(f"{base_url}/api/v1/geojson/wards") as resp:
        wards_geo = json.loads(resp.read().decode())
        print(f"Wards GeoJSON Features: {len(wards_geo['features'])}")
        assert len(wards_geo['features']) == 15

    with urllib.request.urlopen(f"{base_url}/api/v1/geojson/basin") as resp:
        basin_geo = json.loads(resp.read().decode())
        print(f"Basin GeoJSON Features: {len(basin_geo['features'])}")

    print("\n==========================================")
    print("ALL API & CLOSED-LOOP TESTS PASSED 100%!")
    print("==========================================")

if __name__ == "__main__":
    test_endpoints()
