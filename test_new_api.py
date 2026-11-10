import urllib.request
import json

def test_endpoints():
    base = "http://127.0.0.1:8000"
    
    # 1. Health
    with urllib.request.urlopen(f"{base}/api/v1/health") as r:
        data = json.loads(r.read().decode())
        print("1. Health Check:", data["status"])
        assert data["status"] == "HEALTHY"

    # 2. Macro Simulate
    req = urllib.request.Request(
        f"{base}/api/v1/macro/simulate",
        data=json.dumps({"ratio": 55, "shocks": {"rainfall": -20, "temperature": 2.5, "releaseCut": 10, "populationSurge": 5}}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        print("2. Macro Simulate:", f"Ratio {data['ratio']}, SecA: {data['securityA']}, SecB: {data['securityB']}, MinSec: {data['minSecurity']}")
        assert len(data["timeline"]) == 11

    # 3. Optimal Ratio
    with urllib.request.urlopen(f"{base}/api/v1/macro/optimal-ratio") as r:
        data = json.loads(r.read().decode())
        print("3. Optimal Ratio:", f"Ratio {data['ratio']}:45, Maximin: {data['maximin']}, Status: {data['status']}")
        assert data["status"] == "OPTIMAL_CONVERGED"

    # 4. Justification
    with urllib.request.urlopen(f"{base}/api/v1/macro/justification") as r:
        data = json.loads(r.read().decode())
        print("4. Justification:", data["text"][:60] + "...")
        assert len(data["sources"]) > 0

    # 5. Micro Simulate
    req = urllib.request.Request(
        f"{base}/api/v1/micro/simulate",
        data=json.dumps({"quota": 850, "shocks": {"rainfall": -10, "temperature": 2.0, "releaseCut": 5, "populationSurge": 3}}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        print("5. Micro Simulate:", f"Quota: {data['quota']} MLD, Protected Baseline: {data['protectedBaseline']} LPCD, Deficit: {data['projectedDeficit']}%")
        assert data["protectedBaseline"] == 55.0

    # 6. Ward Risk
    with urllib.request.urlopen(f"{base}/api/v1/wards/risk") as r:
        data = json.loads(r.read().decode())
        print(f"6. Ward Risk: {len(data)} wards loaded. First ward: {data[0]['name']} ({data[0]['tier']})")
        assert len(data) >= 4

    # 7. Forecast
    with urllib.request.urlopen(f"{base}/api/v1/forecast?horizonDays=60") as r:
        data = json.loads(r.read().decode())
        print(f"7. Forecast (60d): Peak Deficit {data['peakDeficit']}%, Confidence {data['confidence']}")
        assert data["horizonDays"] == 60

    # 8. Alerts
    with urllib.request.urlopen(f"{base}/api/v1/alerts") as r:
        data = json.loads(r.read().decode())
        print(f"8. Alerts: {len(data)} early warnings active. First: {data[0]['message']}")
        assert len(data) >= 2

    # 9. Provenance
    with urllib.request.urlopen(f"{base}/api/v1/provenance") as r:
        data = json.loads(r.read().decode())
        print(f"9. Provenance: {data['mode']}, Updated: {data['updated']}")
        assert "55" in data["statutoryCompliance"]

    # 10. Frontend Landing Page (/)
    with urllib.request.urlopen(f"{base}/") as r:
        html = r.read().decode()
        print(f"10. Landing Page (/) Served: {len(html)} bytes, Title verified: {'From river diplomacy' in html}")
        assert "Hydro-Diplomacy" in html or "HDRE" in html

    # 11. Frontend Simulator Page (/simulator)
    with urllib.request.urlopen(f"{base}/simulator") as r:
        html = r.read().decode()
        print(f"11. Simulator Page (/simulator) Served: {len(html)} bytes")
        assert len(html) > 1000

    print("\n=======================================================")
    print("ALL NEW FRONTEND ENDPOINTS & PAGES VERIFIED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    test_endpoints()
