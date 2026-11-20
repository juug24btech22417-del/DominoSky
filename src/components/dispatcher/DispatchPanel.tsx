import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { DATASET as _DATASET } from '../../engine/simulator';
import confetti from 'canvas-confetti';
import {
  Brain,
  GitBranch,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';

export const DispatchPanel: React.FC = () => {
  const {
    activeOutput,
    baselineOutput: _baselineOutput,
    recoveryOptions,
    briefing,
    appliedRecoveryId,
    applyRecovery,
    activeTab,
    setActiveTab,
    selectedFlightId,
    selectFlight
  } = useSimulationStore();

  const formatInr = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

  const selectedFlight = selectedFlightId ? activeOutput.flights[selectedFlightId] : null;

  const handleApplyAction = (actionId: string) => {
    applyRecovery(actionId);
    // Trigger celebration confetti on successful recovery plan execution
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleRevert = () => {
    applyRecovery(null);
  };

  return (
    <div className="w-84 bg-surface/90 border-l border-surface-border flex flex-col h-full overflow-hidden select-none">
      {/* Panel Navigation Tabs */}
      <div className="h-10 bg-surface-subtle border-b border-surface-border flex items-center px-2 text-xs font-mono-numbers divide-x divide-surface-border">
        <button
          onClick={() => setActiveTab('intelligence')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'intelligence'
              ? 'text-sky-cyan font-bold border-b-2 border-sky-cyan bg-surface/50'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>DISPATCH</span>
        </button>

        <button
          onClick={() => setActiveTab('domino_dna')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'domino_dna'
              ? 'text-sky-cyan font-bold border-b-2 border-sky-cyan bg-surface/50'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>DOMINO DNA</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery_lab')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'recovery_lab'
              ? 'text-sky-cyan font-bold border-b-2 border-sky-cyan bg-surface/50'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>RECOVERY</span>
          {recoveryOptions.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab 1: SKY / DISPATCH (Intelligence) */}
      {activeTab === 'intelligence' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono-numbers">
          {/* Executive Summary */}
          <div className="p-3 rounded bg-surface-subtle border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
              <span className="flex items-center space-x-1.5 text-sky-cyan">
                <Brain className="w-3 h-3" />
                <span>EXECUTIVE SITUATION REPORT</span>
              </span>
              <span className="text-gray-500">DGCA COMPLIANT</span>
            </div>
            <p className="text-gray-200 text-xs leading-relaxed font-sans">
              {briefing.executiveSummary}
            </p>
          </div>

          {/* Key Facts Matrix */}
          <div className="grid grid-cols-2 gap-2">
            {briefing.keyFacts.map((fact, idx) => (
              <div key={idx} className="p-2 rounded bg-surface-subtle border border-surface-border">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">{fact.label}</div>
                <div className={`text-sm font-bold mt-0.5 ${
                  fact.badge === 'critical' ? 'text-rose-400' : fact.badge === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {fact.value}
                </div>
              </div>
            ))}
          </div>

          {/* Threat Assessment */}
          <div className="p-3 rounded bg-surface-subtle border border-surface-border space-y-1.5">
            <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] uppercase tracking-wider font-semibold">
              <AlertOctagon className="w-3 h-3" />
              <span>PROPAGATION BOTTLENECK</span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed font-sans">
              {briefing.threatAssessment}
            </p>
          </div>

          {/* Tactical Recommendation Callout */}
          <div className="p-3 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 space-y-2">
            <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-wider font-bold text-sky-cyan">
              <Sparkles className="w-3 h-3" />
              <span>DISPATCH RECOVERY DIRECTIVE</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-200 font-sans">
              {briefing.recommendedActionSummary}
            </p>
            {recoveryOptions.length > 0 && (
              <button
                onClick={() => setActiveTab('recovery_lab')}
                className="w-full mt-2 py-1.5 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-cyan text-xs font-semibold flex items-center justify-center space-x-1 transition"
              >
                <span>OPEN RECOVERY LAB</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: DOMINO DNA (Causal Root-Cause Inspector) */}
      {activeTab === 'domino_dna' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono-numbers">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center space-x-1">
              <GitBranch className="w-3 h-3 text-sky-cyan" />
              <span>CAUSAL TRACE INSPECTOR</span>
            </span>
            <span className="text-[10px] text-gray-500">ROOT-CAUSE</span>
          </div>

          {/* Flight Selector */}
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">SELECT SECTOR TO INSPECT</label>
            <select
              value={selectedFlightId || ''}
              onChange={(e) => selectFlight(e.target.value || null)}
              className="w-full bg-surface-subtle border border-surface-border rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-sky-cyan"
            >
              <option value="">-- Choose a Flight --</option>
              {Object.values(activeOutput.flights)
                .sort((a, b) => b.dep_delay - a.dep_delay)
                .map((f) => (
                  <option key={f.flight_id} value={f.flight_id}>
                    {f.flight_id} ({f.origin}→{f.destination}) — {f.is_cancelled ? 'CANCELLED' : f.dep_delay > 0 ? `+${f.dep_delay}m DELAY` : 'ON-TIME'}
                  </option>
                ))}
            </select>
          </div>

          {selectedFlight ? (
            <div className="space-y-4">
              {/* Flight Summary Card */}
              <div className="p-3 rounded bg-surface-subtle border border-surface-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-sky-cyan">{selectedFlight.flight_id}</span>
                    <span className="text-gray-400 font-normal">
                      {selectedFlight.origin} → {selectedFlight.destination}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedFlight.is_cancelled ? 'bg-rose-500/20 text-rose-400' : selectedFlight.dep_delay > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {selectedFlight.is_cancelled ? 'CANCELLED' : selectedFlight.dep_delay > 0 ? `+${selectedFlight.dep_delay}m LATE` : 'ON-TIME'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-surface-border text-gray-400">
                  <div>Aircraft Tail: <span className="text-gray-200 font-semibold">{selectedFlight.active_tail_id}</span></div>
                  <div>Leg Order: <span className="text-gray-200 font-semibold">{selectedFlight.leg_order}</span></div>
                  <div>Sched Dep: <span className="text-gray-200">{selectedFlight.sched_dep}</span></div>
                  <div>Actual Dep: <span className="text-gray-200">{selectedFlight.actual_dep}</span></div>
                  <div>Passengers: <span className="text-gray-200 font-semibold">{selectedFlight.pax}</span></div>
                  <div>Delay Minutes: <span className="text-amber-400 font-bold">{selectedFlight.dep_delay}m</span></div>
                </div>
              </div>

              {/* Step-by-Step Causal Breadcrumbs */}
              <div className="space-y-2">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  DOMINO CHAIN PROPAGATION
                </div>

                <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-surface-border">
                  {selectedFlight.causal_chain.map((step, idx) => (
                    <div key={idx} className="relative group">
                      {/* Node Pip */}
                      <span className={`absolute -left-4 top-1.5 w-2 h-2 rounded-full border ${
                        step.type === 'closure'
                          ? 'bg-rose-500 border-rose-300'
                          : step.type === 'tail_propagation'
                          ? 'bg-amber-500 border-amber-300'
                          : 'bg-sky-500 border-sky-300'
                      }`} />

                      <div className="p-2.5 rounded bg-surface-subtle border border-surface-border hover:border-gray-600 transition">
                        <div className="text-[10px] text-gray-400 flex items-center justify-between">
                          <span className="font-semibold uppercase text-sky-cyan">STEP 0{step.step}</span>
                          {step.impact_minutes && (
                            <span className="text-amber-400 font-bold">+{step.impact_minutes}m DEFICIT</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-200 mt-1 font-sans leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 space-y-2">
              <Info className="w-6 h-6 mx-auto text-gray-600" />
              <p>Click any flight path or select from above to trace its causal ripple history.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: RECOVERY LAB (Before vs After Diff) */}
      {activeTab === 'recovery_lab' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono-numbers">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center space-x-1">
              <Zap className="w-3 h-3 text-sky-cyan" />
              <span>TACTICAL RECOVERY MATRIX</span>
            </span>
            <span className="text-[10px] text-emerald-400">GROUNDED MATH</span>
          </div>

          {appliedRecoveryId && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-[11px]">RECOVERY PLAN ACTIVE</span>
              </div>
              <button
                onClick={handleRevert}
                className="text-[10px] text-gray-400 hover:text-white underline font-mono-numbers"
              >
                REVERT TO BASELINE
              </button>
            </div>
          )}

          {recoveryOptions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500/60" />
              <p>Network operating within nominal parameters. No recovery actions required.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recoveryOptions.map((opt) => {
                const isSelected = appliedRecoveryId === opt.id;

                return (
                  <div
                    key={opt.id}
                    className={`p-3 rounded border transition space-y-3 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50'
                        : 'bg-surface-subtle border-surface-border hover:border-gray-600'
                    }`}
                  >
                    {/* Header & Strategy Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 border border-sky-500/30 text-sky-cyan">
                        {opt.strategy_tag}
                      </span>
                      <span className="text-[10px] text-gray-400">{opt.target_airport} HUB</span>
                    </div>

                    <div>
                      <div className="font-bold text-xs text-gray-100">{opt.title}</div>
                      <div className="text-[11px] text-gray-400 font-sans mt-0.5 leading-relaxed">
                        {opt.description}
                      </div>
                    </div>

                    {/* Before vs After Diff Matrix */}
                    <div className="p-2 rounded bg-canvas border border-surface-border space-y-1.5 text-[11px]">
                      <div className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">
                        BEFORE ➔ AFTER IMPACT DIFF
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Delay:</span>
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="text-rose-400 line-through">{opt.before_summary.delay_minutes}m</span>
                          <ArrowRight className="w-3 h-3 text-gray-500" />
                          <span className="text-emerald-400">{opt.after_summary.delay_minutes}m</span>
                          <span className="text-[10px] text-emerald-400">(-{opt.metrics_delta.delay_minutes_saved}m)</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Stranded Pax:</span>
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="text-rose-400 line-through">{opt.before_summary.stranded_pax}</span>
                          <ArrowRight className="w-3 h-3 text-gray-500" />
                          <span className="text-emerald-400">{opt.after_summary.stranded_pax}</span>
                          <span className="text-[10px] text-emerald-400">(-{opt.metrics_delta.passengers_rescued})</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Exp. Loss:</span>
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="text-rose-400 line-through">{formatInr(opt.before_summary.cost_inr)}</span>
                          <ArrowRight className="w-3 h-3 text-gray-500" />
                          <span className="text-emerald-400">{formatInr(opt.after_summary.cost_inr)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-surface-border">
                        <span className="text-gray-400">Crew Violations:</span>
                        <span className="text-emerald-400 font-bold">
                          {opt.before_summary.crew_violations} ➔ {opt.after_summary.crew_violations} (0 VIOLATIONS)
                        </span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => (isSelected ? handleRevert() : handleApplyAction(opt.id))}
                      className={`w-full py-2 rounded text-xs font-bold font-mono-numbers flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                        isSelected
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      {isSelected ? (
                        <span>REVERT DISPATCH PLAN</span>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>EXECUTE RECOVERY PLAN</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

