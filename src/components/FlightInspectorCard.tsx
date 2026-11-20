import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { Share2, X, ChevronRight } from 'lucide-react';

export const FlightInspectorCard: React.FC = () => {
  const {
    activeOutput,
    selectedFlightId,
    selectFlight,
    setActiveNavTab
  } = useSimulationStore();

  // If no flight selected, default to DS0103 or first delayed flight
  const flight = selectedFlightId
    ? activeOutput.flights[selectedFlightId]
    : Object.values(activeOutput.flights).find(f => f.dep_delay > 0) || activeOutput.flights['DS0103'];

  if (!flight) return null;

  return (
    <div className="w-80 bg-[#0E121B]/95 backdrop-blur-md border border-[#1C2433] rounded-xl p-5 text-xs select-none shadow-2xl z-20 space-y-4">
      {/* Header: Flight ID, Status Badge, Close */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-white tracking-tight font-mono-numbers">
            {flight.flight_id}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            flight.is_cancelled
              ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
              : flight.dep_delay > 0
              ? 'bg-[#401216] text-[#FF5555] border border-[#6B1E24]'
              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
          }`}>
            {flight.is_cancelled ? 'Cancelled' : flight.dep_delay > 0 ? 'Delayed' : 'On Time'}
          </span>
        </div>

        <button
          onClick={() => selectFlight(null)}
          className="text-zinc-500 hover:text-white transition p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Route */}
      <div className="text-sm font-semibold text-zinc-200">
        {flight.origin} <span className="text-zinc-500 font-normal mx-1">→</span> {flight.destination}
      </div>

      {/* Timings Grid (Exact match to screenshot) */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono-numbers pt-1 border-t border-[#1C2433]">
        <div>
          <div className="text-[10px] text-zinc-500">Sched. Dep</div>
          <div className="text-zinc-200 font-medium">{flight.sched_dep}</div>
        </div>

        <div>
          <div className="text-[10px] text-zinc-500">Actual Dep</div>
          <div className="text-zinc-200 font-medium">
            {flight.actual_dep}{' '}
            {flight.dep_delay > 0 && (
              <span className="text-[#FF5555] font-semibold">+{flight.dep_delay} min</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-zinc-500">Sched. Arr</div>
          <div className="text-zinc-200 font-medium">{flight.sched_arr}</div>
        </div>

        <div>
          <div className="text-[10px] text-zinc-500">Actual Arr</div>
          <div className="text-zinc-200 font-medium">
            {flight.actual_arr}{' '}
            {flight.arr_delay > 0 && (
              <span className="text-[#FF5555] font-semibold">+{flight.arr_delay} min</span>
            )}
          </div>
        </div>
      </div>

      {/* WHY IT'S DELAYED (Exact match to screenshot causal list) */}
      <div className="space-y-2.5 pt-2 border-t border-[#1C2433]">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono-numbers font-semibold">
          WHY IT'S DELAYED
        </div>

        <div className="space-y-3 pl-1">
          {flight.causal_chain.length > 0 ? (
            flight.causal_chain.map((c, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-[11px] leading-tight">
                <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                  c.type === 'closure' ? 'bg-[#FF5555]' : 'bg-zinc-500'
                }`} />
                <div>
                  <div className="text-zinc-200 font-medium">{c.description}</div>
                  {c.impact_minutes && (
                    <div className="text-zinc-500 text-[10px] mt-0.5">+{c.impact_minutes} min rotational slip</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-start space-x-2.5 text-[11px] leading-tight">
              <span className="w-2 h-2 rounded-full mt-1 shrink-0 bg-emerald-400" />
              <div className="text-zinc-300">Flight operating on nominal schedule buffer.</div>
            </div>
          )}

          {/* Total delay line in red */}
          {flight.dep_delay > 0 && (
            <div className="flex items-center space-x-2.5 text-[11px] pt-1">
              <span className="w-2 h-2 rounded-full shrink-0 bg-[#FF5555]" />
              <span className="text-[#FF5555] font-bold">
                Total delay: {flight.dep_delay} min
              </span>
            </div>
          )}
        </div>
      </div>

      {/* View Domino Chain Button */}
      <button
        onClick={() => setActiveNavTab('insights')}
        className="w-full py-2 px-3 rounded-lg bg-[#141924] hover:bg-[#1B2232] border border-[#242E40] text-zinc-200 text-xs font-medium flex items-center justify-between transition mt-2"
      >
        <div className="flex items-center space-x-2">
          <Share2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>View Domino Chain</span>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-500" />
      </button>
    </div>
  );
};

