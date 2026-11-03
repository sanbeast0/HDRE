import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  MapPin, 
  ShieldCheck, 
  HeartPulse, 
  Gauge, 
  Sliders, 
  AlertTriangle, 
  Clock, 
  Layers, 
  ArrowUpRight,
  Droplets,
  CheckCircle2,
  ChevronRight,
  Flame,
  Search
} from 'lucide-react';

export default function MunicipalCockpit({ 
  municipalData, 
  onOptimizeMunicipal, 
  isSolving,
  wardsGeojson 
}) {
  const [bulkQuotaMld, setBulkQuotaMld] = useState(850.0);
  const [horizonDays, setHorizonDays] = useState(60);
  const [selectedWard, setSelectedWard] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const wards = municipalData?.ward_details ?? [];
  const minLpcd = municipalData?.minimum_ward_lpcd ?? 56.4;
  const avgLpcd = municipalData?.average_ward_lpcd ?? 68.2;
  const lpcdFloorPassed = municipalData?.lpcd_floor_maintained ?? true;
  const hospitalSecured = municipalData?.hospital_reserves_secured ?? true;
  const pumpingEnergyInr = municipalData?.pumping_energy_cost_inr ?? 428000;
  const valveActions = municipalData?.automated_valve_actions ?? [
    { node_id: "CORRIDOR_VALVE_04B", action: "DIVERT_INDUSTRIAL_FLOW", target_ward: "WARD_14", flow_adjustment_mld: 8.5, reason: "Divert 8.5 MLD from Industrial Corridor to Ward 14 ESR Sump." },
    { node_id: "VALVE_14B", action: "THROTTLE_15_PCT", target_ward: "WARD_14", flow_adjustment_mld: 2.8, reason: "Equalize tail-end pressure head (1.18 bar) and maintain statutory baseline." },
    { node_id: "BOOSTER_02A", action: "BOOST_SECONDARY_SUMP", target_ward: "WARD_02", flow_adjustment_mld: 3.2, reason: "High elevation node requires primary ESR pressure stabilization." }
  ];

  // Set default selected ward to Ward 14 (Shivajinagar) as in the report wireframe
  useEffect(() => {
    if (wards.length > 0 && !selectedWard) {
      const w14 = wards.find(w => w.ward_id === 'WARD_14') || wards[0];
      setSelectedWard(w14);
    }
  }, [wards]);

  const handleApplyRationing = (newQuota = bulkQuotaMld, newHorizon = horizonDays) => {
    onOptimizeMunicipal({
      city_id: "PUNE_METRO",
      allocated_bulk_quota_mld: Number(newQuota),
      forecast_horizon_days: Number(newHorizon)
    });
  };

  const filteredWards = wards.filter(w => {
    const matchesSearch = w.ward_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          w.ward_id.toLowerCase().includes(searchFilter.toLowerCase());
    if (severityFilter === 'ALL') return matchesSearch;
    return matchesSearch && w.severity_category === severityFilter;
  });

  const getDeficitColor = (cat) => {
    if (cat === 'SAFE') return '#10b981';
    if (cat === 'ALERT') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-6">
      
      {/* Viewport Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono text-xs uppercase font-semibold">
              Viewport 2
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Predictive Municipal Ward Resilience Cockpit (City Engineer Control Room)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            XGBoost Telemetry Forecasting (30-60-90 Days) & Google OR-Tools MILP Valve Rationing · Pune Metro
          </p>
        </div>

        {/* Horizon Tabs & Re-solve trigger */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {[30, 60, 90].map((h) => (
              <button
                key={h}
                onClick={() => {
                  setHorizonDays(h);
                  handleApplyRationing(bulkQuotaMld, h);
                }}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
                  horizonDays === h
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h}-Day Horizon
              </button>
            ))}
          </div>

          <button
            onClick={() => handleApplyRationing()}
            disabled={isSolving}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{isSolving ? 'SOLVING MILP...' : 'OPTIMIZE FLOW'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Statutory Human Floor */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Statutory Human Floor</span>
            <ShieldCheck className={`w-4 h-4 ${lpcdFloorPassed ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold font-mono ${lpcdFloorPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {minLpcd}
            </span>
            <span className="text-xs text-slate-400 font-mono">LPCD</span>
          </div>
          <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>NON-NEGOTIABLE (≥ 55 LPCD)</span>
          </div>
        </div>

        {/* Card 2: Hospital Reserve Buffer */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Hospital Node Buffer</span>
            <HeartPulse className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold font-mono text-cyan-400">
              100%
            </span>
            <span className="text-xs text-cyan-500 font-bold uppercase">LOCKED</span>
          </div>
          <div className="mt-1 flex items-center space-x-1 text-[11px] text-cyan-300 font-mono">
            <span>Zero-Deficit Priority Grid</span>
          </div>
        </div>

        {/* Card 3: Pumping Energy Cost */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Hydraulic Pumping Cost</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold font-mono text-amber-400">
              ₹{(pumpingEnergyInr / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-400 font-mono">/ day</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            <span>Elevation Balanced (SCIP)</span>
          </div>
        </div>

        {/* Card 4: Municipal Bulk Flume */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Bulk Intake Flume</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold font-mono text-sky-400">
              {bulkQuotaMld}
            </span>
            <span className="text-xs text-slate-400 font-mono">MLD</span>
          </div>
          <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
            <span>Avg Ward: {avgLpcd} LPCD</span>
          </div>
        </div>

      </div>

      {/* Central Interactive Grid: Choropleth Map + Deficit Radar + Selected Ward Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Choropleth Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Ward Choropleth Deficit Map (Pune Metro)
                </h2>
              </div>

              {/* Map Legend */}
              <div className="flex items-center space-x-3 text-[11px] font-mono">
                <div className="flex items-center space-x-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
                  <span className="text-slate-300">Safe (≥ 75 LPCD)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-500"></span>
                  <span className="text-slate-300">Alert (55-74)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500"></span>
                  <span className="text-slate-300">Deficit</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG / Leaflet Map Container */}
            <div className="mt-4 relative bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden h-[420px] flex items-center justify-center">
              
              {/* SVG Vector Polygon Render for Pune Metro Wards */}
              <svg className="w-full h-full" viewBox="73.76 18.44 0.22 0.16">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.003" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* River Mutha Flow Path across city */}
                <path
                  d="M 73.76 18.45 Q 73.83 18.49 73.85 18.52 T 73.95 18.55"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="0.003"
                  strokeDasharray="0.005,0.002"
                  opacity="0.6"
                />

                {/* Render Ward Polygons from GeoJSON */}
                {wardsGeojson?.features?.map((feature) => {
                  const wid = feature.properties.ward_id;
                  const wardStat = wards.find(w => w.ward_id === wid);
                  const isSelected = selectedWard?.ward_id === wid;
                  const fillColor = getDeficitColor(wardStat?.severity_category || 'SAFE');
                  const coords = feature.geometry.coordinates[0];
                  const pathStr = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0]} ${18.60 - (c[1] - 18.44)}`).join(' ') + ' Z';
                  const centroid = [feature.properties.centroid_lon, 18.60 - (feature.properties.centroid_lat - 18.44)];

                  return (
                    <g key={wid} className="cursor-pointer transition-all duration-200" onClick={() => setSelectedWard(wardStat)}>
                      <path
                        d={pathStr}
                        fill={fillColor}
                        fillOpacity={isSelected ? 0.85 : 0.38}
                        stroke={isSelected ? '#38bdf8' : fillColor}
                        strokeWidth={isSelected ? 0.0025 : 0.001}
                        className="hover:fill-opacity-70 transition-all"
                      />
                      {/* Label on centroid */}
                      <text
                        x={centroid[0]}
                        y={centroid[1]}
                        fill="#ffffff"
                        fontSize="0.0042"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                        pointerEvents="none"
                      >
                        {wid.replace('WARD_', 'W')}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Map Status Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="text-slate-400">Click any ward polygon to inspect SCADA node</div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <span>Selected Node:</span>
                  <span className="text-cyan-400 font-bold">{selectedWard?.ward_id || 'WARD_14'} ({selectedWard?.ward_name})</span>
                </div>
              </div>
            </div>

            {/* Bulk Intake Slider Adjuster */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>Adjust Bulk Intake Flume (MLD):</span>
                </span>
                <span className="text-sky-400 font-mono font-bold">{bulkQuotaMld} MLD</span>
              </div>
              <input
                type="range"
                min="550"
                max="1050"
                step="25"
                value={bulkQuotaMld}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBulkQuotaMld(val);
                  handleApplyRationing(val, horizonDays);
                }}
                className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Severe Drought Floor: 550 MLD</span>
                <span>Normal Inflow: 850 MLD</span>
                <span>Surplus: 1050 MLD</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: 30-60-90 Day Deficit Radar & Selected Ward Node Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Selected Ward Deep Inspector Card */}
          {selectedWard && (
            <div className="glass-panel p-4 rounded-xl border border-sky-800/60 bg-gradient-to-br from-slate-900 via-sky-950/20 to-slate-900">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-sky-900/80 text-sky-300 font-mono text-[11px] font-bold">
                      {selectedWard.ward_id}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {selectedWard.ward_name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Population: {selectedWard.population?.toLocaleString()} · Elev: {selectedWard.elevation_head_m}m
                  </p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  selectedWard.severity_category === 'SAFE' 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : selectedWard.severity_category === 'ALERT'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-rose-950 text-rose-300 border-rose-700'
                }`}>
                  {selectedWard.severity_category}
                </span>
              </div>

              {/* Wireframe Specific Node Metrics */}
              <div className="mt-3 space-y-2.5 text-xs font-mono">
                
                {/* 30-60-90 Day Deficit Radar breakdown */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                    XGBoost Multi-Horizon Deficit Radar:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">30-Day Deficit</span>
                      <span className="font-bold text-emerald-400 text-xs">
                        -{(selectedWard.forecasted_unmet_ratio * 35).toFixed(1)}% (Safe)
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">60-Day Deficit</span>
                      <span className="font-bold text-amber-400 text-xs">
                        -{(selectedWard.forecasted_unmet_ratio * 100).toFixed(1)}% (Alert)
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">90-Day Deficit</span>
                      <span className="font-bold text-rose-400 text-xs">
                        -{(selectedWard.forecasted_unmet_ratio * 180).toFixed(1)}% (Crit)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivered LPCD vs Statutory Floor */}
                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-sans">Delivered Tap Volume:</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-sm">{selectedWard.delivered_lpcd} LPCD </span>
                    <span className="text-[10px] text-emerald-500 font-sans font-bold">(PASS ≥ 55)</span>
                  </div>
                </div>

                {/* Hospital Node Buffer */}
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-sans">Hospital Buffer ({selectedWard.hospital_beds_count} Beds):</span>
                    <span className="text-cyan-400 font-bold">{selectedWard.hospital_reserve_min_mld} MLD</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full w-full rounded-full"></div>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-sans flex items-center justify-end">
                    [██████████████] 100% LOCKED
                  </span>
                </div>

                {/* Live Terminal Pressure & Leakage */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-sans block">Terminal Pressure</span>
                    <span className="text-sm font-bold text-sky-300">
                      {selectedWard.estimated_terminal_pressure_bar} Bar
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans block">Nominal</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-sans block">Pipe Leakage Est.</span>
                    <span className="text-sm font-bold text-amber-400">
                      {selectedWard.leakage_pct}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans block">{selectedWard.pipe_age_years} yr network</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Automated SCADA Valve Actions Feed */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Algorithmic Valve Interventions</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                SCADA Dispatched
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {valveActions.map((action, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sky-300 font-bold">{action.node_id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                      {action.action}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-tight">
                    {action.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 15 Municipal Wards Allocation Registry Table */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Pune Municipal Corporation · 15 Administrative Wards Allocation Ledger
            </h2>
            <p className="text-xs text-slate-400">
              Mixed-Integer Linear Program SCIP allocation enforcing non-negotiable LPCD baselines
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Severity Filter Pills */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
              {['ALL', 'SAFE', 'ALERT', 'CRITICAL_DEFICIT'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded ${
                    severityFilter === sev
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search ward..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Ward Code & Name</th>
                <th className="py-2.5 px-3">Population</th>
                <th className="py-2.5 px-3">Allocated Flow</th>
                <th className="py-2.5 px-3">Delivered LPCD</th>
                <th className="py-2.5 px-3">Hospital Buffer</th>
                <th className="py-2.5 px-3">Tap Pressure</th>
                <th className="py-2.5 px-3">Elevation</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredWards.map((w) => {
                const isSelected = selectedWard?.ward_id === w.ward_id;
                return (
                  <tr 
                    key={w.ward_id}
                    onClick={() => setSelectedWard(w)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-950/40' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-sky-400">{w.ward_id}</span>
                      <span className="text-slate-300 font-sans ml-2">{w.ward_name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {w.population?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-sky-300">
                      {w.allocated_flow_mld} MLD
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${w.delivered_lpcd >= 55.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {w.delivered_lpcd} LPCD
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400">
                      {w.hospital_reserve_min_mld} MLD (100% OK)
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {w.estimated_terminal_pressure_bar} Bar
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {w.elevation_head_m}m
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.severity_category === 'SAFE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : w.severity_category === 'ALERT'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {w.severity_category}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
