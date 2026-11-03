import React from 'react';
import { 
  Droplet, 
  MapPin, 
  Sun, 
  Moon, 
  Layers, 
  BarChart3, 
  Sliders, 
  Activity,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  scenario, 
  setScenario, 
  macroMetrics, 
  municipalMetrics,
  isSolving,
  theme = 'light',
  onToggleTheme
}) {
  const minLpcd = municipalMetrics?.minimum_ward_lpcd ?? 55.0;
  const lpcdPass = minLpcd >= 55.0;
  const alphaStorage = macroMetrics?.dam_alpha_storage_tmc ?? 64.2;
  const betaStorage = macroMetrics?.dam_beta_storage_tmc ?? 38.5;

  return (
    <header className="sticky top-0 z-50 transition-colors duration-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-amber-200/80 dark:border-amber-500/20 shadow-sm">
      {/* ROW 1: BRAND LOGO + BASIN SELECTOR + VIEWPORT SWITCHER + THEME TOGGLE */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Logo & System Track */}
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 flex-shrink-0">
              <div className="h-full w-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-amber-600 dark:text-amber-400 text-lg">
                Δ
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  HDRE <span className="text-amber-600 dark:text-amber-400">/ R2C Ai</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 uppercase">
                  v2.4 Prod
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Hydro-Diplomacy & Resilience Engine · Closed-Loop Treaty-to-Tap Operating System
              </p>
            </div>
          </div>

          {/* Basin & Climate Scenario Selector */}
          <div className="flex items-center space-x-2 bg-amber-50/70 dark:bg-slate-950/70 border border-amber-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono">
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 hidden sm:inline" />
            <span className="text-amber-700 dark:text-amber-400 font-bold hidden sm:inline">Basin:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Krishna-Bhima</span>
            <span className="text-amber-300 dark:text-slate-700">|</span>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="bg-transparent text-amber-800 dark:text-amber-300 font-bold focus:outline-none cursor-pointer max-w-[280px] truncate"
            >
              <option value="2026_DROUGHT_RCP85" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                2026 Severe Drought (-30% Monsoon, +2.5°C)
              </option>
              <option value="BASELINE_MONSOON" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                Historical Baseline (Normal Monsoon)
              </option>
              <option value="COMPOUND_HEATWAVE_RCP85" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                Compound Multi-Decade Heatwave (+3.5°C)
              </option>
            </select>
          </div>

          {/* Navigation Viewport Mode Switcher + Theme Toggle */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCurrentView('treaty')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'treaty'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Macro Treaty
              </button>

              <button
                onClick={() => setCurrentView('municipal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'municipal'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Municipal Cockpit
              </button>

              <button
                onClick={() => setCurrentView('closed-loop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'closed-loop'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Treaty-to-Tap
              </button>

              <button
                onClick={() => setCurrentView('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'analytics'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Analytics
              </button>
            </div>

            {/* LIGHT / DARK MODE TOGGLE */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all bg-amber-50 dark:bg-slate-800 border-amber-300 dark:border-slate-700 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-700 shadow-sm cursor-pointer"
                title="Toggle Light / Dark Mode"
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ROW 2: LIVE TELEMETRY TICKER RIBBON (CLEAN & SPACIOUS) */}
      <div className="bg-amber-50/50 dark:bg-slate-950/80 border-t border-amber-200/60 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs font-mono">
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500 dark:text-slate-400">CWC Telemetry:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">ONLINE</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Dam Alpha (Catchment): <strong className="text-amber-700 dark:text-amber-400">{alphaStorage} TMC</strong>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Dam Beta (Ujani): <strong className="text-amber-700 dark:text-amber-400">{betaStorage} TMC</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
              lpcdPass 
                ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300' 
                : 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700/60 text-rose-800 dark:text-rose-300'
            }`}>
              Human Floor: <strong>{minLpcd} LPCD</strong> ({lpcdPass ? 'PASS ≥ 55.0' : 'ALERT'})
            </div>
            <div className="px-2.5 py-0.5 rounded-full border bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 text-[11px] font-bold">
              Hospital Buffer: <strong>100% LOCKED</strong>
            </div>
            <div className="px-2.5 py-0.5 rounded-full border bg-blue-100 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700/60 text-blue-900 dark:text-blue-300 text-[11px] font-bold hidden sm:inline-block">
              Bulk Flume: <strong>{municipalMetrics?.allocated_bulk_quota_mld ?? 850} MLD</strong>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
