import React, { useState } from 'react';
import { 
  Sliders, 
  Thermometer, 
  CloudRain, 
  Scale, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Cpu,
  Layers,
  Info
} from 'lucide-react';

export default function MacroTreatySandbox({ 
  treatyData, 
  onSimulateTreaty, 
  isSolving 
}) {
  const [alphaStorage, setAlphaStorage] = useState(64.2);
  const [betaStorage, setBetaStorage] = useState(38.5);
  const [inflow, setInflow] = useState(14.1);
  const [precipDeficit, setPrecipDeficit] = useState(-30.0);
  const [tempSurge, setTempSurge] = useState(2.5);
  const [monsoonStressorOn, setMonsoonStressorOn] = useState(true);
  const [heatwaveStressorOn, setHeatwaveStressorOn] = useState(true);

  // Toggle handlers for quick wireframe buttons
  const toggleMonsoon = () => {
    if (monsoonStressorOn) {
      setPrecipDeficit(0.0);
      setMonsoonStressorOn(false);
    } else {
      setPrecipDeficit(-30.0);
      setMonsoonStressorOn(true);
    }
  };

  const toggleHeatwave = () => {
    if (heatwaveStressorOn) {
      setTempSurge(0.0);
      setHeatwaveStressorOn(false);
    } else {
      setTempSurge(2.5);
      setHeatwaveStressorOn(true);
    }
  };

  const handleRunSolver = () => {
    onSimulateTreaty({
      dam_alpha_storage_tmc: Number(alphaStorage),
      dam_beta_storage_tmc: Number(betaStorage),
      projected_inflow_tmc: Number(inflow),
      climate_shock: {
        precip_deficit_pct: Number(precipDeficit),
        temp_surge_c: Number(tempSurge)
      }
    });
  };

  const optimalA = treatyData?.optimal_release_state_a_tmc ?? 38.9;
  const optimalB = treatyData?.optimal_release_state_b_tmc ?? 44.9;
  const maximinScore = treatyData?.maximin_security_score ?? 0.724;
  const secA = treatyData?.state_a_security ?? 0.74;
  const secB = treatyData?.state_b_security ?? 0.72;
  const evapLoss = treatyData?.evaporative_loss_tmc ?? 3.4;
  const paretoPoints = treatyData?.pareto_points ?? [
    [0.15, 0.92], [0.35, 0.88], [0.55, 0.82], [0.72, 0.74], [0.85, 0.45], [0.93, 0.20]
  ];
  const judicialSummary = treatyData?.judicial_summary ?? (
    "Reallocating 38.9 TMC to State A and 44.9 TMC to State B secures a 0.72 Maximin balance. " +
    "This preserves 91% of upstream agricultural baselines while maintaining downstream municipal intakes above statutory minimums."
  );

  return (
    <div className="space-y-6">
      
      {/* Viewport Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800 font-mono text-xs uppercase font-semibold">
              Viewport 1
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Macro Treaty Diplomacy Sandbox (Adjudicator & River Basin Tribunal)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Game-Theoretic Rawlsian Maximin Multi-Objective Optimization for Transboundary Riparian Water Treaties
          </p>
        </div>

        <button
          onClick={handleRunSolver}
          disabled={isSolving}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-900/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Cpu className={`w-4 h-4 ${isSolving ? 'animate-spin' : ''}`} />
          <span>{isSolving ? 'OPTIMIZING RAWLSIAN SLSQP...' : 'RUN MAXIMIN OPTIMIZATION SOLVER'}</span>
        </button>
      </div>

      {/* Main Grid: Sliders, Schematic, and Pareto Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Riparian Release Sliders & Climate Stressors (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Reservoir Storage Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Riparian Reservoir Telemetry</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-500">Live CWC Flumes</span>
            </div>

            {/* Dam Alpha Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Upstream Dam Alpha (Catchment):</span>
                <span className="text-sky-400 font-mono font-bold">{alphaStorage} TMC</span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="0.5"
                value={alphaStorage}
                onChange={(e) => setAlphaStorage(parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Panshet / Varasgaon pool</span>
                <span>Max: 85 TMC</span>
              </div>
            </div>

            {/* Dam Beta Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Downstream Dam Beta (Ujani):</span>
                <span className="text-sky-400 font-mono font-bold">{betaStorage} TMC</span>
              </div>
              <input
                type="range"
                min="5"
                max="55"
                step="0.5"
                value={betaStorage}
                onChange={(e) => setBetaStorage(parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Interstate Regulator</span>
                <span>Max: 55 TMC</span>
              </div>
            </div>

            {/* Inflow Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Projected Seasonal Inflow:</span>
                <span className="text-emerald-400 font-mono font-bold">{inflow} TMC</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                step="0.5"
                value={inflow}
                onChange={(e) => setInflow(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Climate Stressor Toggles Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span>Climate Stressor Toggles (RCP 8.5)</span>
            </h2>

            {/* Quick Wireframe Toggles */}
            <div className="space-y-2">
              <button
                onClick={toggleMonsoon}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  monsoonStressorOn
                    ? 'bg-rose-950/60 border-rose-600/80 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CloudRain className="w-4 h-4 text-rose-400" />
                  <span>-30% Monsoon Deficit (RCP 8.5)</span>
                </div>
                <span className="font-mono text-[11px] font-bold">
                  {monsoonStressorOn ? '[ ACTIVE ]' : '[ OFF ]'}
                </span>
              </button>

              <button
                onClick={toggleHeatwave}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  heatwaveStressorOn
                    ? 'bg-amber-950/60 border-amber-600/80 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>+2.5°C Extended Heatwave Surge</span>
                </div>
                <span className="font-mono text-[11px] font-bold">
                  {heatwaveStressorOn ? '[ ACTIVE ]' : '[ OFF ]'}
                </span>
              </button>
            </div>

            {/* Fine-Tuning Sliders */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Precipitation Anomaly:</span>
                  <span className={`font-mono font-bold ${precipDeficit < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {precipDeficit > 0 ? `+${precipDeficit}` : precipDeficit}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="30"
                  step="5"
                  value={precipDeficit}
                  onChange={(e) => {
                    setPrecipDeficit(parseFloat(e.target.value));
                    setMonsoonStressorOn(parseFloat(e.target.value) !== 0);
                  }}
                  className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Temperature Surge (ΔT):</span>
                  <span className="font-mono font-bold text-amber-400">+{tempSurge}°C</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={tempSurge}
                  onChange={(e) => {
                    setTempSurge(parseFloat(e.target.value));
                    setHeatwaveStressorOn(parseFloat(e.target.value) > 0);
                  }}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 font-mono">
                <span>Penman-Monteith Evaporative Loss: </span>
                <span className="text-rose-400 font-bold">{evapLoss} TMC</span>
              </div>
            </div>

          </div>

        </div>

        {/* Middle Column: Basin Schematic & Node Status (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Basin Hydrological Schematic</span>
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Transboundary Polarity
                </span>
              </div>

              {/* Schematic Flow Visualization */}
              <div className="mt-4 space-y-3 font-mono text-xs">
                
                {/* Upstream Catchment Node */}
                <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/60 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-300">[ State A: Upstream Catchment ]</span>
                    <span className="text-[10px] text-sky-400 font-sans px-1.5 py-0.5 rounded bg-sky-900/60">
                      Maharashtra
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Dams: Panshet, Varasgaon, Khadakwasla Intake Pool
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-sky-900/40">
                    <span className="text-slate-400">Maximin Allocation:</span>
                    <span className="text-cyan-300 font-bold">{optimalA} TMC</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Security Index:</span>
                    <span className="text-emerald-400 font-bold">{(secA * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* River Trunk & Environmental Flow Corridor */}
                <div className="flex flex-col items-center justify-center py-1 space-y-1">
                  <div className="h-4 w-0.5 bg-gradient-to-b from-sky-400 to-cyan-500"></div>
                  <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[10px] text-slate-300 flex items-center space-x-1 font-sans">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>River Trunk: </span>
                    <span className="font-mono text-cyan-300 font-bold">Q_env ≥ 2.5 TMC</span>
                    <span className="text-slate-500">(Eco Baseline)</span>
                  </div>
                  <div className="h-4 w-0.5 bg-gradient-to-b from-cyan-500 to-emerald-400"></div>
                </div>

                {/* Downstream Regulator Node */}
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">[ State B: Downstream Riparian ]</span>
                    <span className="text-[10px] text-emerald-400 font-sans px-1.5 py-0.5 rounded bg-emerald-900/60">
                      Karnataka
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Terminal Reservoir: Ujani Dam (Interstate Gate)
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-emerald-900/40">
                    <span className="text-slate-400">Maximin Allocation:</span>
                    <span className="text-emerald-300 font-bold">{optimalB} TMC</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Security Index:</span>
                    <span className="text-emerald-400 font-bold">{(secB * 100).toFixed(1)}%</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Maximin Equity</span>
                <span className="text-base font-bold text-cyan-400 font-mono">{maximinScore}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Mass Conserved</span>
                <span className="text-base font-bold text-emerald-400 font-mono">100% OK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Objective Pareto Frontier (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Multi-Objective Pareto Trade-Off</span>
                </h2>
                <span className="text-[10px] font-mono text-cyan-400">Rawlsian R*</span>
              </div>

              {/* Interactive SVG Pareto Curve */}
              <div className="mt-4 relative bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 mb-2 flex justify-between font-mono">
                  <span>State B Security (Y-axis)</span>
                  <span>State A Security (X-axis)</span>
                </div>

                <div className="h-44 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 240 160">
                    {/* Grid lines */}
                    <line x1="20" y1="140" x2="230" y2="140" stroke="#334155" strokeWidth="1" />
                    <line x1="20" y1="20" x2="20" y2="140" stroke="#334155" strokeWidth="1" />
                    <line x1="20" y1="80" x2="230" y2="80" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="125" y1="20" x2="125" y2="140" stroke="#1e293b" strokeDasharray="3,3" />

                    {/* Equality 45-degree guideline */}
                    <line x1="20" y1="140" x2="220" y2="20" stroke="#0ea5e9" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.4" />

                    {/* Pareto Frontier Curve */}
                    {paretoPoints.length > 1 && (
                      <path
                        d={paretoPoints.reduce((acc, pt, idx) => {
                          const x = 20 + pt[0] * 200;
                          const y = 140 - pt[1] * 120;
                          return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                        }, "")}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                    )}

                    {/* Points on frontier */}
                    {paretoPoints.map((pt, i) => {
                      const x = 20 + pt[0] * 200;
                      const y = 140 - pt[1] * 120;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="2.5"
                          className="fill-sky-400 hover:r-4 transition-all"
                        />
                      );
                    })}

                    {/* Rawlsian Maximin R* Marker */}
                    {(() => {
                      const rx = 20 + secA * 200;
                      const ry = 140 - secB * 120;
                      return (
                        <g>
                          <circle cx={rx} cy={ry} r="7" className="fill-emerald-400/20 stroke-emerald-400 animate-pulse" strokeWidth="2" />
                          <circle cx={rx} cy={ry} r="3" className="fill-emerald-400" />
                          <text x={rx - 30} y={ry - 10} fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">
                            R* Maximin ({maximinScore})
                          </text>
                        </g>
                      );
                    })()}

                    {/* Status Quo Standoff Point */}
                    <circle cx="165" cy="115" r="4" fill="#ef4444" />
                    <text x="145" y="130" fill="#f87171" fontSize="8" fontFamily="monospace">
                      Status Quo
                    </text>
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-900">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="text-slate-300">Rawlsian Maximin R*</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                    <span className="text-slate-400">Utilitarian Standoff</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Footnote */}
            <p className="text-[11px] text-slate-400 mt-3 font-sans leading-relaxed">
              * The Rawlsian Maximin objective guarantees that the welfare of the most vulnerable stakeholder is mathematically prioritized before peripheral surplus allocations.
            </p>
          </div>
        </div>

      </div>

      {/* Full-Width Explainable AI Judicial Brief Memo */}
      <div className="glass-panel p-5 rounded-xl border border-sky-900/40 bg-gradient-to-r from-slate-900/90 via-sky-950/20 to-slate-900/90 shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
          <FileText className="w-4 h-4" />
          <span>Explainable AI Judicial Brief & Treaty Legal Memorandum</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300">
            For Tribunal Ministers & Judges
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-line bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
          {judicialSummary}
        </p>
      </div>

    </div>
  );
}
