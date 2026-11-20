import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { GanttTimeline } from '../GanttTimeline';
import confetti from 'canvas-confetti';
import {
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const RecoveryView: React.FC = () => {
  const {
    activeOutput,
    baselineOutput,
    appliedRecoveryId,
    applyRecovery,
    briefing
  } = useSimulationStore();

  const handleApply = (id: string | null) => {
    applyRecovery(id);
    if (id) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const delaySaved = Math.max(0, baselineOutput.total_delay_minutes - activeOutput.total_delay_minutes);
  const paxSaved = Math.max(0, baselineOutput.stranded_passengers - activeOutput.stranded_passengers);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-black select-none">
      {/* Top AI Tactical Briefing Banner */}
      <div className="bg-[#0D121B] border-b border-[#1A2230] p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-2 font-mono-numbers">
              <span className="text-xs font-bold text-white tracking-wide">
                AI DISPATCHER // AUTONOMOUS RECOVERY SOLVER
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-semibold">
                OPTIMAL SOLUTION FOUND
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-3xl">
              {briefing.recommendedActionSummary || briefing.executiveSummary}
            </p>
          </div>
        </div>

        {/* Quantified Impact Metrics */}
        <div className="flex items-center space-x-6 text-xs font-mono-numbers">
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase">Delay Saved</div>
            <div className="text-emerald-400 font-bold text-sm">
              -{delaySaved.toLocaleString()} min
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase">Pax Rescued</div>
            <div className="text-emerald-400 font-bold text-sm">
              +{paxSaved} pax
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase">Crew Violations</div>
            <div className="text-emerald-400 font-bold text-sm">
              0 Violations
            </div>
          </div>
        </div>
      </div>

      {/* Center: Recovery Strategy Cards (Side-by-Side Comparison) */}
      <div className="p-4 grid grid-cols-4 gap-4 bg-[#080B10] shrink-0 font-sans">
        {/* Option 1: AI Tail Swap (Recommended) */}
        <div
          onClick={() => handleApply('OPT-1')}
          className={`p-4 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
            appliedRecoveryId === 'OPT-1'
              ? 'bg-[#101826] border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
              : 'bg-[#0E131C] border-[#1E2633] hover:border-zinc-500'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                RECOMMENDED
              </span>
              <span className="text-[10px] text-zinc-500 font-mono-numbers">OPTION A</span>
            </div>
            <h3 className="text-sm font-bold text-white">AI Tail Swap Rotation</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Swap aircraft tail at BLR turnaround. Absorbs upstream ground stop without propagating to evening banks.
            </p>

            <div className="mt-3 space-y-1.5 font-mono-numbers text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Delay Absorbed</span>
                <span className="text-emerald-400 font-semibold">-120 min</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Passengers Saved</span>
                <span className="text-emerald-400 font-semibold">180 pax</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Cost Savings</span>
                <span className="text-emerald-400 font-semibold">₹8.4 Lakhs</span>
              </div>
            </div>
          </div>

          <button
            className={`w-full mt-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
              appliedRecoveryId === 'OPT-1'
                ? 'bg-cyan-400 text-black shadow-md'
                : 'bg-[#182232] hover:bg-[#202E44] text-zinc-200'
            }`}
          >
            {appliedRecoveryId === 'OPT-1' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PLAN COMMITTED</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Commit Tail Swap</span>
              </>
            )}
          </button>
        </div>

        {/* Option 2: Standby Crew Deadhead */}
        <div
          onClick={() => handleApply('OPT-2')}
          className={`p-4 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
            appliedRecoveryId === 'OPT-2'
              ? 'bg-[#101826] border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
              : 'bg-[#0E131C] border-[#1E2633] hover:border-zinc-500'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                CREW RELIEF
              </span>
              <span className="text-[10px] text-zinc-500 font-mono-numbers">OPTION B</span>
            </div>
            <h3 className="text-sm font-bold text-white">Standby Crew Activation</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Deploy Mumbai standby reserve crew to prevent DS0103 Captain Sharma duty time violation (DGCA CAR).
            </p>

            <div className="mt-3 space-y-1.5 font-mono-numbers text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">FDTL Violations</span>
                <span className="text-emerald-400 font-semibold">0 Violations</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Delay Averted</span>
                <span className="text-emerald-400 font-semibold">-90 min</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Cost Savings</span>
                <span className="text-emerald-400 font-semibold">₹4.2 Lakhs</span>
              </div>
            </div>
          </div>

          <button
            className={`w-full mt-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
              appliedRecoveryId === 'OPT-2'
                ? 'bg-cyan-400 text-black shadow-md'
                : 'bg-[#182232] hover:bg-[#202E44] text-zinc-200'
            }`}
          >
            {appliedRecoveryId === 'OPT-2' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PLAN COMMITTED</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Commit Crew Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Option 3: Strategic Turn Cancellation */}
        <div
          onClick={() => handleApply('OPT-3')}
          className={`p-4 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
            appliedRecoveryId === 'OPT-3'
              ? 'bg-[#101826] border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
              : 'bg-[#0E131C] border-[#1E2633] hover:border-zinc-500'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                FIREWALL
              </span>
              <span className="text-[10px] text-zinc-500 font-mono-numbers">OPTION C</span>
            </div>
            <h3 className="text-sm font-bold text-white">Strategic Turn Cancellation</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Cancel low-load out-and-back leg (62 pax) to firewall prime evening business trunk routes (186 pax).
            </p>

            <div className="mt-3 space-y-1.5 font-mono-numbers text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Evening Reliability</span>
                <span className="text-emerald-400 font-semibold">100% Protected</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Aircraft Freed</span>
                <span className="text-cyan-400 font-semibold">VT-DEL ready</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Net Impact</span>
                <span className="text-emerald-400 font-semibold">Cost-Neutral</span>
              </div>
            </div>
          </div>

          <button
            className={`w-full mt-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
              appliedRecoveryId === 'OPT-3'
                ? 'bg-cyan-400 text-black shadow-md'
                : 'bg-[#182232] hover:bg-[#202E44] text-zinc-200'
            }`}
          >
            {appliedRecoveryId === 'OPT-3' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PLAN COMMITTED</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Commit Firewall</span>
              </>
            )}
          </button>
        </div>

        {/* Option 4: Baseline (Do Nothing) */}
        <div
          onClick={() => handleApply(null)}
          className={`p-4 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
            !appliedRecoveryId
              ? 'bg-[#181113] border-rose-800/80 shadow-[0_0_16px_rgba(239,68,68,0.2)]'
              : 'bg-[#0E131C] border-[#1E2633] hover:border-zinc-500'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                UNCHECKED CASCADE
              </span>
              <span className="text-[10px] text-zinc-500 font-mono-numbers">BASELINE</span>
            </div>
            <h3 className="text-sm font-bold text-white">Do Nothing (Domino Drift)</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Ground stop causes uncontrolled domino propagation across 6 downstream aircraft rotations and crew expirations.
            </p>

            <div className="mt-3 space-y-1.5 font-mono-numbers text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Total Delay Mins</span>
                <span className="text-rose-400 font-semibold">{baselineOutput.total_delay_minutes.toLocaleString()} min</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Stranded Passengers</span>
                <span className="text-rose-400 font-semibold">{baselineOutput.stranded_passengers} pax</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500 text-[11px]">Crew Violations</span>
                <span className="text-rose-400 font-semibold">{baselineOutput.crew_violations_count} FDTL alerts</span>
              </div>
            </div>
          </div>

          <button
            className={`w-full mt-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
              !appliedRecoveryId
                ? 'bg-rose-900 text-rose-100 border border-rose-700'
                : 'bg-[#182232] hover:bg-[#202E44] text-zinc-400'
            }`}
          >
            <span>{!appliedRecoveryId ? 'BASELINE ACTIVE' : 'Revert to Baseline'}</span>
          </button>
        </div>
      </div>

      {/* Bottom: 24-Hour Fleet Tail Rotation Gantt Timeline */}
      <div className="flex-1 overflow-hidden flex flex-col border-t border-[#1A2230]">
        <div className="h-8 bg-[#0D121B] px-4 flex items-center justify-between text-[11px] font-mono-numbers text-zinc-400 border-b border-[#1A2230]">
          <span className="font-bold text-zinc-300">24-HOUR ROTATION SCHEDULE // ALL 16 AIRCRAFT TAILS</span>
          <span>GREEN = RECOVERED ROTATION • AMBER = ROTATIONAL SLIP • RED = GROUND STOP</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <GanttTimeline />
        </div>
      </div>
    </div>
  );
};
