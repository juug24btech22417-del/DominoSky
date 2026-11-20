import React, { useState, useMemo, useCallback } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import {
  GitBranch,
  Download
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const {
    activeOutput,
    baselineOutput,
    closureAirport,
    closureDuration,
    disruptionReason,
    appliedRecoveryId
  } = useSimulationStore();

  const [activeTab, setActiveTab] = useState<'domino_dna' | 'dgca_fdtl' | 'financials'>('domino_dna');

  // Memoised derived metrics — prevent recalculation on unrelated re-renders
  const recoveryDelta = useMemo(() => ({
    delaySaved: Math.max(0, baselineOutput.total_delay_minutes - activeOutput.total_delay_minutes),
    paxSaved: Math.max(0, baselineOutput.stranded_passengers - activeOutput.stranded_passengers),
    crewSaved: Math.max(0, baselineOutput.crew_violations_count - activeOutput.crew_violations_count),
    costSaved: Math.max(0, baselineOutput.disruption_cost_inr - activeOutput.disruption_cost_inr),
  }), [activeOutput, baselineOutput]);

  // Stable export callback — avoids function recreation on every render
  const exportReport = useCallback(() => {
    const reportData = {
      timestamp: new Date().toISOString(),
      scenario: {
        closureAirport,
        durationMinutes: closureDuration,
        disruptionReason
      },
      baselineMetrics: {
        totalFlights: baselineOutput.total_flights,
        delayedFlights: baselineOutput.delayed_flights_count,
        totalDelayMinutes: baselineOutput.total_delay_minutes,
        strandedPax: baselineOutput.stranded_passengers,
        crewViolations: baselineOutput.crew_violations_count
      },
      activeMetrics: {
        totalFlights: activeOutput.total_flights,
        delayedFlights: activeOutput.delayed_flights_count,
        totalDelayMinutes: activeOutput.total_delay_minutes,
        strandedPax: activeOutput.stranded_passengers,
        crewViolations: activeOutput.crew_violations_count
      },
      recoveryDelta,
      appliedRecoveryPlan: appliedRecoveryId || 'None (Baseline)'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DominoSky_Executive_Audit_${closureAirport || 'BOM'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeOutput, baselineOutput, closureAirport, closureDuration, disruptionReason, appliedRecoveryId, recoveryDelta]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-black select-none font-sans">
      {/* Top Intelligence Header Bar */}
      <div className="h-12 bg-[#0D121B] border-b border-[#1A2230] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <GitBranch className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide font-mono-numbers">
              NETWORK INTELLIGENCE & ROOT-CAUSE CASSETTE
            </h2>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1 bg-[#121824] p-0.5 rounded-lg border border-[#1E2736] text-xs">
          <button
            onClick={() => setActiveTab('domino_dna')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
              activeTab === 'domino_dna'
                ? 'bg-[#253043] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DOMINO DNA CASCADE
          </button>
          <button
            onClick={() => setActiveTab('dgca_fdtl')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
              activeTab === 'dgca_fdtl'
                ? 'bg-[#253043] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DGCA FDTL AUDIT
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
              activeTab === 'financials'
                ? 'bg-[#253043] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            FINANCIAL EXPOSURE
          </button>
        </div>

        {/* Export Executive Report Button */}
        <button
          onClick={exportReport}
          className="px-3 py-1 rounded-md bg-[#16202E] hover:bg-[#202E42] border border-[#27384F] text-cyan-300 font-semibold text-xs flex items-center space-x-1.5 transition active:scale-95"
        >
          <Download className="w-3 h-3 text-cyan-400" />
          <span>Export Judge Audit</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#080B10]">
        {/* TAB 1: DOMINO DNA CASCADE */}
        {activeTab === 'domino_dna' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Domino DNA Causal Propagation Tree</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Mathematical graph tracking how an initial shock at {closureAirport || 'BOM'} propagates through aircraft rotations, gate bottlenecks, and crew legality boundaries.
              </p>
            </div>

            {/* Cascade Flow Line */}
            <div className="relative pl-6 space-y-6 border-l-2 border-dashed border-[#1E2633]">
              {/* Step 1: Initial Shock */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-black flex items-center justify-center" />
                <div className="p-4 rounded-xl bg-[#121620] border border-rose-900/60 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-mono-numbers">
                    <span className="text-rose-400 font-bold uppercase">Root Cause Event // Tier 0</span>
                    <span className="text-zinc-500">08:00 – 09:30 IST</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {closureAirport || 'BOM'} Airport Ground Stop ({closureDuration} min)
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    Convective thunderstorm cell restricts runway 27/09 arrival throughput to zero. Inbound flights forced into holding pattern or diverted.
                  </p>
                </div>
              </div>

              {/* Step 2: 1st Order Impact */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-black" />
                <div className="p-4 rounded-xl bg-[#121620] border border-amber-900/60 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-mono-numbers">
                    <span className="text-amber-400 font-bold uppercase">1st Order Inbound Delay // Tier 1</span>
                    <span className="text-zinc-500">09:50 IST</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    DS0201 (DEL → BOM) Lands +90m Late
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    Aircraft tail <span className="font-mono text-cyan-400">VT-IND</span> touches down at Mumbai 90 minutes behind schedule.
                  </p>
                </div>
              </div>

              {/* Step 3: Turnaround Slip */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-black" />
                <div className="p-4 rounded-xl bg-[#121620] border border-amber-900/60 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-mono-numbers">
                    <span className="text-amber-400 font-bold uppercase">Rotational Buffer Depletion // Tier 2</span>
                    <span className="text-zinc-500">10:45 IST</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    Turnaround Slip (+20 min) at Mumbai Gate
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    Nominal 45-minute turnaround expands due to gate hold and baggage transfer delays. Rotation buffer reduced to zero.
                  </p>
                </div>
              </div>

              {/* Step 4: Downstream Leg Delay */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-black" />
                <div className="p-4 rounded-xl bg-[#121620] border border-rose-900/60 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-mono-numbers">
                    <span className="text-rose-400 font-bold uppercase">2nd Order Cascade // Tier 3</span>
                    <span className="text-zinc-500">11:15 IST</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    DS0103 (BLR → CCU) Departure Pushed to 13:05 (+110m)
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    Inbound aircraft arrives late at Bengaluru. Flight pushed back 110 minutes, jeopardizing passenger connections to Guwahati and Agartala.
                  </p>
                </div>
              </div>

              {/* Step 5: Crew Violation */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-rose-600 border-2 border-black" />
                <div className="p-4 rounded-xl bg-[#181113] border border-rose-800 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-mono-numbers">
                    <span className="text-rose-400 font-bold uppercase">Regulatory Violation Risk // Tier 4</span>
                    <span className="text-zinc-500">15:30 IST</span>
                  </div>
                  <h4 className="text-sm font-bold text-rose-200 mt-1">
                    DGCA FDTL Breach: Captain Sharma Crew Duty Expiry
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    Flight Duty Period exceeds statutory 10-hour limit under DGCA CAR Section 7 Series J. Flight cannot depart without relief crew or tail swap.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DGCA FDTL CREW AUDIT */}
        {activeTab === 'dgca_fdtl' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">DGCA Flight Duty Time Limitation (FDTL) Audit</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Compliance monitor under Indian Civil Aviation Requirements (CAR) Section 7 Series J Part III. Maximum duty period: 10h (day) / 8h (night).
              </p>
            </div>

            <div className="border border-[#1E2633] rounded-xl overflow-hidden bg-[#10141D]">
              <table className="w-full text-left text-xs font-mono-numbers">
                <thead className="bg-[#141A26] border-b border-[#1E2633] text-zinc-400 text-[11px]">
                  <tr>
                    <th className="p-3">CREW MEMBER</th>
                    <th className="p-3">ROLE</th>
                    <th className="p-3">ASSIGNED ROTATION</th>
                    <th className="p-3">DUTY HOURS</th>
                    <th className="p-3">LIMIT</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2230] text-zinc-300">
                  <tr className="bg-rose-950/20">
                    <td className="p-3 font-bold text-white">Capt. A. Sharma</td>
                    <td className="p-3 text-zinc-400">Commander (A320)</td>
                    <td className="p-3 font-semibold text-cyan-400">DS0103 / DS0104</td>
                    <td className="p-3 text-rose-400 font-bold">10h 40m</td>
                    <td className="p-3 text-zinc-400">10h 00m</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 border border-rose-800 text-rose-300">
                        EXPIRED (BREACH)
                      </span>
                    </td>
                  </tr>

                  <tr className="bg-rose-950/10">
                    <td className="p-3 font-bold text-white">FO R. Sengupta</td>
                    <td className="p-3 text-zinc-400">First Officer (A320)</td>
                    <td className="p-3 font-semibold text-cyan-400">DS0103 / DS0104</td>
                    <td className="p-3 text-rose-400 font-bold">10h 25m</td>
                    <td className="p-3 text-zinc-400">10h 00m</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 border border-rose-800 text-rose-300">
                        EXPIRED (BREACH)
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-white">Capt. M. Verma</td>
                    <td className="p-3 text-zinc-400">Commander (A321)</td>
                    <td className="p-3 font-semibold text-cyan-400">DS0205 / DS0206</td>
                    <td className="p-3 text-amber-400 font-bold">8h 15m</td>
                    <td className="p-3 text-zinc-400">10h 00m</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 border border-amber-800 text-amber-300">
                        WARNING (1h 45m LEFT)
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-bold text-white">Capt. K. Menon</td>
                    <td className="p-3 text-zinc-400">Commander (B737)</td>
                    <td className="p-3 font-semibold text-cyan-400">DS0301 / DS0302</td>
                    <td className="p-3 text-emerald-400 font-bold">5h 30m</td>
                    <td className="p-3 text-zinc-400">10h 00m</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                        LEGAL
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL EXPOSURE */}
        {activeTab === 'financials' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Financial Impact & Passenger Compensation Analysis</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Direct statutory passenger compensation liability calculated under DGCA CAR Section 3, Series M, Part IV plus operational fuel and crew penalties.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#10141D] border border-[#1E2633]">
                <div className="text-[11px] text-zinc-400 font-mono-numbers uppercase">
                  DGCA Pax Compensation
                </div>
                <div className="text-2xl font-bold text-[#FF5555] font-mono-numbers mt-1">
                  ₹14,40,000
                </div>
                <p className="text-[11px] text-zinc-500 mt-2">
                  480 stranded passengers eligible for statutory ₹3,000 meal, lounge, and delay compensation vouchers under DGCA mandates.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#10141D] border border-[#1E2633]">
                <div className="text-[11px] text-zinc-400 font-mono-numbers uppercase">
                  Excess Fuel Burn & Holding
                </div>
                <div className="text-2xl font-bold text-amber-400 font-mono-numbers mt-1">
                  ₹8,20,000
                </div>
                <p className="text-[11px] text-zinc-500 mt-2">
                  14 aircraft burning extra fuel in terminal holding stacks over Mumbai airspace at avg ₹58,000/hr Jet-A1 rate.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#10141D] border border-[#1E2633]">
                <div className="text-[11px] text-zinc-400 font-mono-numbers uppercase">
                  Crew Overtime & Layovers
                </div>
                <div className="text-2xl font-bold text-cyan-400 font-mono-numbers mt-1">
                  ₹3,10,000
                </div>
                <p className="text-[11px] text-zinc-500 mt-2">
                  Mandatory hotel layovers and emergency standby mobilization fees for relief crews at BLR and BOM.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#151B27] border border-cyan-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-cyan-300 font-mono-numbers">
                  TOTAL NET FINANCIAL EXPOSURE
                </div>
                <div className="text-2xl font-bold text-white font-mono-numbers mt-0.5">
                  ₹25,70,000 <span className="text-xs text-zinc-400 font-normal">($31,000 USD)</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-emerald-400">
                  Potential Savings via AI Tail Swap:
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono-numbers">
                  ₹14,20,000 (55% Cost Recovery)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
