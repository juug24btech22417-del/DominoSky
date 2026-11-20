import React, { useState, useMemo } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import confetti from 'canvas-confetti';
import {
  Plane,
  Search,
  CheckCircle2,
  Zap,
  GitBranch,
  Brain,
  ShieldCheck
} from 'lucide-react';

export const FlightScheduleAndRecovery: React.FC = () => {
  const {
    activeOutput,
    selectedFlightId,
    selectFlight,
    recoveryOptions,
    appliedRecoveryId,
    applyRecovery,
    briefing,
    activeScheduleTab,
    setActiveScheduleTab
  } = useSimulationStore();

  const [search, setSearch] = useState('');
  const activeTab = activeScheduleTab;
  const setActiveTab = setActiveScheduleTab;

  const formatInr = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

  // Memoized for max runtime efficiency (no re-renders on unaffected ticks)
  const flightsList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = Object.values(activeOutput.flights);
    if (!q) return all;
    return all.filter(f =>
      f.flight_id.toLowerCase().includes(q) ||
      f.origin.toLowerCase().includes(q) ||
      f.destination.toLowerCase().includes(q) ||
      f.tail_id.toLowerCase().includes(q)
    );
  }, [activeOutput.flights, search]);

  const selectedFlight = selectedFlightId ? activeOutput.flights[selectedFlightId] : null;

  const handleApply = (id: string) => {
    applyRecovery(id);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="w-88 bg-black border-l border-surface-border flex flex-col h-full overflow-hidden select-none text-xs font-mono-numbers divide-y divide-zinc-900">
      {/* Panel Tab Navigation */}
      <div role="tablist" aria-label="Flight Operations Console Tabs" className="h-9 bg-zinc-950 flex items-center px-2 divide-x divide-zinc-900">
        <button
          role="tab"
          id="tab-schedule"
          aria-selected={activeTab === 'schedule'}
          aria-controls="panel-schedule"
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-1 text-center font-semibold text-[11px] transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
            activeTab === 'schedule' ? 'text-zinc-100 border-b-2 border-zinc-200' : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          SCHEDULE ({activeOutput.total_flights})
        </button>

        <button
          role="tab"
          id="tab-recovery"
          aria-selected={activeTab === 'recovery'}
          aria-controls="panel-recovery"
          onClick={() => setActiveTab('recovery')}
          className={`flex-1 py-1 text-center font-semibold text-[11px] transition flex items-center justify-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
            activeTab === 'recovery' ? 'text-zinc-100 border-b-2 border-zinc-200' : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-400" aria-hidden="true" />
          <span>RECOVERY</span>
          {recoveryOptions.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          )}
        </button>

        <button
          role="tab"
          id="tab-dna"
          aria-selected={activeTab === 'dna'}
          aria-controls="panel-dna"
          onClick={() => setActiveTab('dna')}
          className={`flex-1 py-1 text-center font-semibold text-[11px] transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
            activeTab === 'dna' ? 'text-zinc-100 border-b-2 border-zinc-200' : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          DOMINO DNA
        </button>
      </div>

      {/* TAB 1: FLIGHT SCHEDULE & STATUS */}
      {activeTab === 'schedule' && (
        <div id="panel-schedule" role="tabpanel" aria-labelledby="tab-schedule" className="flex-1 flex flex-col overflow-hidden bg-black">
          {/* Search Header */}
          <div className="p-2.5 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
            <div className="relative flex-1 mr-2">
              <label htmlFor="schedule-flight-search" className="sr-only">
                Search flight, hub, or aircraft tail
              </label>
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2" aria-hidden="true" />
              <input
                id="schedule-flight-search"
                type="text"
                placeholder="Search flight, hub, tail..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded pl-7 pr-2 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <span className="text-[10px] text-zinc-400">LIVE FEED</span>
          </div>

          {/* Table Header */}
          <div className="h-6 bg-zinc-950/80 px-3 flex items-center justify-between text-[9px] text-zinc-400 border-b border-zinc-900 uppercase font-semibold">
            <span className="w-16">FLIGHT</span>
            <span className="w-16">SECTOR</span>
            <span className="w-14">ACT DEP</span>
            <span className="w-16 text-right">STATUS</span>
          </div>

          {/* Scrolling Rows */}
          <div role="table" aria-label="Live Flight Schedule Feed" className="flex-1 overflow-y-auto divide-y divide-zinc-900/40">
            {flightsList.map(f => {
              const isSelected = selectedFlightId === f.flight_id;
              let statusText = 'On Time';
              let statusColor = 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40';

              if (f.is_cancelled) {
                statusText = 'Cancelled';
                statusColor = 'text-rose-400 bg-rose-950/30 border-rose-900/40';
              } else if (f.dep_delay >= 60) {
                statusText = `+${f.dep_delay}m Late`;
                statusColor = 'text-rose-400 bg-rose-950/30 border-rose-900/40';
              } else if (f.dep_delay > 0) {
                statusText = `+${f.dep_delay}m Late`;
                statusColor = 'text-amber-400 bg-amber-950/30 border-amber-900/40';
              }

              return (
                <div
                  key={f.flight_id}
                  role="row"
                  tabIndex={0}
                  onClick={() => selectFlight(f.flight_id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') selectFlight(f.flight_id);
                  }}
                  className={`h-8 px-3 flex items-center justify-between hover:bg-zinc-900/60 cursor-pointer transition text-[11px] focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
                    isSelected ? 'bg-zinc-900 border-l-2 border-white' : ''
                  }`}
                >
                  <div className="w-16 flex items-center space-x-1.5 font-semibold text-zinc-200">
                    <Plane className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                    <span>{f.flight_id}</span>
                  </div>

                  <div className="w-16 text-zinc-300 text-[10px]">
                    {f.origin}→{f.destination}
                  </div>

                  <div className="w-14 text-zinc-400 text-[10px]">
                    {f.actual_dep}
                  </div>

                  <div className="w-16 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AI DISPATCHER & RECOVERY LAB */}
      {activeTab === 'recovery' && (
        <div id="panel-recovery" role="tabpanel" aria-labelledby="tab-recovery" className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-black">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 uppercase tracking-wider">
            <h2>AI DISPATCHER MATRIX</h2>
            <Brain className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          </div>

          {appliedRecoveryId && (
            <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 flex items-center justify-between text-[11px]">
              <span className="font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>RECOVERY PLAN ACTIVE</span>
              </span>
              <button
                onClick={() => applyRecovery(null)}
                aria-label="Revert committed recovery plan"
                className="text-[10px] underline text-zinc-400 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
              >
                REVERT
              </button>
            </div>
          )}

          {/* Situation Report */}
          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-1.5">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
              OPERATIONAL SITUATION REPORT
            </span>
            <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
              {briefing.executiveSummary}
            </p>
          </div>

          {/* Recovery Options */}
          {recoveryOptions.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500/50" aria-hidden="true" />
              <p>Schedule operating nominally. No recovery required.</p>
            </div>
          ) : (
            recoveryOptions.map(opt => {
              const isApplied = appliedRecoveryId === opt.id;

              return (
                <div
                  key={opt.id}
                  className={`p-3 rounded border space-y-2 transition ${
                    isApplied ? 'bg-emerald-950/20 border-emerald-800' : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-900 text-zinc-200 border border-zinc-700">
                      {opt.strategy_tag}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">{opt.target_airport} HUB</span>
                  </div>

                  <div className="font-semibold text-zinc-100 text-[11px]">{opt.title}</div>
                  <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">{opt.description}</p>

                  {/* Impact Diff Table */}
                  <div className="p-2 rounded bg-black border border-zinc-800 space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Delay Mins:</span>
                      <span className="font-semibold">
                        <span className="text-rose-400 line-through mr-1">{opt.before_summary.delay_minutes}m</span>
                        <span className="text-emerald-400">{opt.after_summary.delay_minutes}m</span>
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">Stranded Pax:</span>
                      <span className="font-semibold">
                        <span className="text-rose-400 line-through mr-1">{opt.before_summary.stranded_pax}</span>
                        <span className="text-emerald-400">{opt.after_summary.stranded_pax}</span>
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">Commercial Loss:</span>
                      <span className="font-semibold">
                        <span className="text-rose-400 line-through mr-1">{formatInr(opt.before_summary.cost_inr)}</span>
                        <span className="text-emerald-400">{formatInr(opt.after_summary.cost_inr)}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => (isApplied ? applyRecovery(null) : handleApply(opt.id))}
                    aria-label={`${isApplied ? 'Revert' : 'Execute'} recovery plan: ${opt.title}`}
                    className={`w-full py-1.5 rounded font-semibold text-xs flex items-center justify-center space-x-1.5 transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
                      isApplied
                        ? 'bg-rose-950/40 border border-rose-800 text-rose-300'
                        : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" aria-hidden="true" />
                    <span>{isApplied ? 'REVERT PLAN' : 'EXECUTE RECOVERY PLAN'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: DOMINO DNA CAUSAL INSPECTOR */}
      {activeTab === 'dna' && (
        <div id="panel-dna" role="tabpanel" aria-labelledby="tab-dna" className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-black">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 uppercase tracking-wider">
            <h2>DOMINO DNA ROOT-CAUSE</h2>
            <GitBranch className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          </div>

          {selectedFlight ? (
            <div className="space-y-3">
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-zinc-100 text-sm">{selectedFlight.flight_id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    selectedFlight.is_cancelled ? 'bg-rose-950/40 text-rose-300 border border-rose-900' : selectedFlight.dep_delay > 0 ? 'bg-amber-950/40 text-amber-300 border border-amber-900' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-900'
                  }`}>
                    {selectedFlight.is_cancelled ? 'CANCELLED' : selectedFlight.dep_delay > 0 ? `+${selectedFlight.dep_delay}m DELAY` : 'ON TIME'}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Sector: {selectedFlight.origin} → {selectedFlight.destination} • Tail: {selectedFlight.active_tail_id}
                </div>
              </div>

              {/* Breadcrumb Steps */}
              <div className="space-y-2 relative pl-3 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-800" role="list" aria-label="Causal Delay Propagation Chain">
                {selectedFlight.causal_chain.map((c, i) => (
                  <div key={i} role="listitem" className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
                    <div className="flex justify-between text-[9px] text-zinc-400 font-semibold uppercase">
                      <span>STEP 0{c.step}</span>
                      {c.impact_minutes && <span className="text-amber-400">+{c.impact_minutes}m DELAY</span>}
                    </div>
                    <p className="text-[10px] text-zinc-300 font-sans">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-400">
              Select any flight in the table or on the map to inspect its causal delay chain.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
