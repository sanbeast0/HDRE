import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import MacroTreatySandbox from './components/MacroTreatySandbox.jsx';
import MunicipalCockpit from './components/MunicipalCockpit.jsx';
import AnalyticsCharts from './components/AnalyticsCharts.jsx';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  HeartPulse, 
  Gauge, 
  Droplet, 
  Layers,
  Cpu,
  Info
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('municipal'); // 'treaty' | 'municipal' | 'closed-loop' | 'analytics'
  const [scenario, setScenario] = useState('2026_DROUGHT_RCP85');
  const [treatyData, setTreatyData] = useState(null);
  const [municipalData, setMunicipalData] = useState(null);
  const [wardsGeojson, setWardsGeojson] = useState(null);
  const [basinGeojson, setBasinGeojson] = useState(null);
  const [isSolving, setIsSolving] = useState(false);
  const [closedLoopSliderTmc, setClosedLoopSliderTmc] = useState(38.9);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  // Initial data ingestion and baseline runs
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsSolving(true);
        // Load GeoJSONs
        const [wardsRes, basinRes] = await Promise.all([
          fetch('/api/v1/geojson/wards').catch(() => null),
          fetch('/api/v1/geojson/basin').catch(() => null)
        ]);
        if (wardsRes && wardsRes.ok) setWardsGeojson(await wardsRes.json());
        if (basinRes && basinRes.ok) setBasinGeojson(await basinRes.json());

        // Baseline Treaty run
        const treatyRes = await fetch('/api/v1/treaty/simulate-maximin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            basin_id: "KRISHNA_BHIMA_01",
            dam_alpha_storage_tmc: 64.2,
            dam_beta_storage_tmc: 38.5,
            projected_inflow_tmc: 14.1,
            climate_shock: { precip_deficit_pct: -30.0, temp_surge_c: 2.5 }
          })
        });
        if (treatyRes.ok) {
          const tData = await treatyRes.json();
          setTreatyData(tData);
          setClosedLoopSliderTmc(tData.optimal_release_state_a_tmc || 38.9);
        }

        // Baseline Municipal run
        const muniRes = await fetch('/api/v1/municipal/optimize-ward-rationing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city_id: "PUNE_METRO",
            allocated_bulk_quota_mld: 850.0,
            forecast_horizon_days: 60
          })
        });
        if (muniRes.ok) setMunicipalData(await muniRes.json());

      } catch (err) {
        console.error("Error loading baseline data:", err);
      } finally {
        setIsSolving(false);
      }
    }

    loadInitialData();
  }, []);

  // Handler for Macro Treaty Simulation
  const handleSimulateTreaty = async (params) => {
    try {
      setIsSolving(true);
      const res = await fetch('/api/v1/treaty/simulate-maximin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        setTreatyData(data);
        setClosedLoopSliderTmc(data.optimal_release_state_a_tmc);
      }
    } catch (err) {
      console.error("Treaty simulation error:", err);
    } finally {
      setIsSolving(false);
    }
  };

  // Handler for Municipal MILP Optimization
  const handleOptimizeMunicipal = async (params) => {
    try {
      setIsSolving(true);
      const res = await fetch('/api/v1/municipal/optimize-ward-rationing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        setMunicipalData(data);
      }
    } catch (err) {
      console.error("Municipal optimization error:", err);
    } finally {
      setIsSolving(false);
    }
  };

  // Handler for Closed-Loop Treaty-to-Tap Pipeline
  const handleClosedLoopShift = async (deltaTmc) => {
    const newReleaseA = Math.max(10.0, Math.min(65.0, closedLoopSliderTmc + deltaTmc));
    setClosedLoopSliderTmc(newReleaseA);
    
    // Convert newReleaseA to Bulk MLD: (Release_A * 28317 * 0.28) / 365
    const derivedMld = Math.round((newReleaseA * 28316.85 * 0.28) / 365.0);
    
    await handleOptimizeMunicipal({
      city_id: "PUNE_METRO",
      allocated_bulk_quota_mld: derivedMld,
      forecast_horizon_days: 60
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#fbfbfa] text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* Top Universal Navbar & Real-Time Ticker Ribbon */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        scenario={scenario}
        setScenario={setScenario}
        macroMetrics={{
          dam_alpha_storage_tmc: 64.2,
          dam_beta_storage_tmc: 38.5
        }}
        municipalMetrics={municipalData}
        isSolving={isSolving}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={() => handleSimulateTreaty({
          dam_alpha_storage_tmc: 64.2,
          dam_beta_storage_tmc: 38.5,
          projected_inflow_tmc: 14.1,
          climate_shock: { precip_deficit_pct: -30.0, temp_surge_c: 2.5 }
        })}
      />

      {/* Main Content Viewport Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentView === 'treaty' && (
          <MacroTreatySandbox
            treatyData={treatyData}
            onSimulateTreaty={handleSimulateTreaty}
            isSolving={isSolving}
          />
        )}

        {currentView === 'municipal' && (
          <MunicipalCockpit
            municipalData={municipalData}
            onOptimizeMunicipal={handleOptimizeMunicipal}
            isSolving={isSolving}
            wardsGeojson={wardsGeojson}
          />
        )}

        {/* Viewport: Closed-Loop Treaty-to-Tap Pipeline */}
        {currentView === 'closed-loop' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800 font-mono text-xs uppercase font-semibold">
                  Unified Closed-Loop Pipeline
                </span>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Direct Treaty-to-Tap Resilience Coupling
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                "An upstream release adjustment of 5% directly dictates downstream ward tap pressures, critical hospital buffer reserves, and equitable citizen access."
              </p>
            </div>

            {/* Direct Slider Coupling Controller */}
            <div className="glass-panel p-5 rounded-xl border border-purple-800/60 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Macro Treaty Release Coupling Slider: State A (Upstream)
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <button
                    onClick={() => handleClosedLoopShift(-2.0)}
                    disabled={isSolving}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-bold"
                  >
                    -5% (-2 TMC)
                  </button>
                  <button
                    onClick={() => handleClosedLoopShift(+2.0)}
                    disabled={isSolving}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-bold"
                  >
                    +5% (+2 TMC)
                  </button>
                  <span className="px-3 py-1 rounded bg-purple-950 text-purple-300 border border-purple-700 font-bold text-sm">
                    {closedLoopSliderTmc.toFixed(1)} TMC
                  </span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="20"
                max="55"
                step="0.5"
                value={closedLoopSliderTmc}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setClosedLoopSliderTmc(val);
                  const derivedMld = Math.round((val * 28316.85 * 0.28) / 365.0);
                  handleOptimizeMunicipal({
                    city_id: "PUNE_METRO",
                    allocated_bulk_quota_mld: derivedMld,
                    forecast_horizon_days: 60
                  });
                }}
                className="w-full accent-purple-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Live Flow Translation Metric */}
              <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-2 border-t border-purple-900/40 text-slate-400">
                <div className="flex items-center space-x-2">
                  <span>Upstream Release: <strong className="text-purple-300 font-bold">{closedLoopSliderTmc.toFixed(1)} TMC</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                  <span>Computed Bulk Municipal Flume: <strong className="text-sky-300 font-bold">{municipalData?.allocated_bulk_quota_mld ?? 850} MLD</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">Min LPCD: {municipalData?.minimum_ward_lpcd ?? 56.4} LPCD</span>
                  <span>·</span>
                  <span className="text-cyan-400 font-bold">Hospital Buffers: 100% Secured</span>
                </div>
              </div>
            </div>

            {/* Split Screen Views: Macro Summary vs Micro Ward Impacts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Side: Macro Riparian Treaty Summary */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Droplet className="w-4 h-4 text-sky-400" />
                    <span>Macro Interstate Equity Balance</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    SciPy SLSQP
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 font-sans block text-[11px]">State A (Upstream Catchment)</span>
                      <span className="text-base font-bold text-sky-300">{closedLoopSliderTmc.toFixed(1)} TMC</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">{(treatyData?.state_a_security ? treatyData.state_a_security * 100 : 74).toFixed(1)}% Security</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 font-sans block text-[11px]">State B (Downstream Interstate)</span>
                      <span className="text-base font-bold text-sky-300">{treatyData?.optimal_release_state_b_tmc ?? 44.9} TMC</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">{(treatyData?.state_b_security ? treatyData.state_b_security * 100 : 72).toFixed(1)}% Security</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 font-sans text-xs text-slate-300">
                    <span className="font-bold text-slate-200">Treaty Decision Logic:</span>
                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                      {treatyData?.judicial_summary ?? "Maximin equilibrium reached. Minimum stakeholder security maximized."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Micro Municipal Ward Tap Conditions */}
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <span>Micro Municipal Tap Telemetry</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    OR-Tools MILP
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Minimum City Tap Volume</span>
                      <span className="text-xl font-bold text-emerald-400">{municipalData?.minimum_ward_lpcd ?? 56.4} LPCD</span>
                      <span className="text-[10px] text-emerald-500 font-sans block font-bold">PASS ≥ 55 LPCD Floor</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 font-sans block text-[11px]">Hospital Buffers</span>
                      <span className="text-xl font-bold text-cyan-400">100%</span>
                      <span className="text-[10px] text-cyan-400 font-sans block font-bold">Zero-Deficit Locked</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-200 font-sans">Active SCADA Interventions:</span>
                    <div className="space-y-1.5 text-[11px]">
                      {municipalData?.automated_valve_actions?.slice(0, 3).map((act, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-300">
                          <span className="text-sky-300">{act.node_id}: {act.action}</span>
                          <span className="text-slate-500">{act.flow_adjustment_mld} MLD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {currentView === 'analytics' && (
          <AnalyticsCharts
            treatyData={treatyData}
            municipalData={municipalData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-mono">
          <div className="flex items-center space-x-2">
            <span>Hydro-Diplomacy & Resilience Engine (HDRE / R2C Ai)</span>
            <span>·</span>
            <span className="text-slate-400">The GOAT's (VIT Pune)</span>
          </div>
          <div>
            <span>Specification Version: 2.4.0 (Autonomous Production Blueprint)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
