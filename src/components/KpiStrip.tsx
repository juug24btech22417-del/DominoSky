import React, { memo } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';

/** Memoised KPI strip — only re-renders when simulation output changes. */
export const KpiStrip: React.FC = memo(() => {
  const { activeOutput } = useSimulationStore();

  return (
    <div
      role="region"
      aria-label="Real-Time Network Operational Statistics"
      className="h-16 bg-transparent px-8 flex items-center justify-end space-x-12 select-none font-mono-numbers"
    >
      {/* 1. Total Flights */}
      <div className="text-center" aria-label={`Total Flights: ${activeOutput.total_flights}`}>
        <div className="text-xl font-bold text-white tracking-tight">
          {activeOutput.total_flights}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Flights
        </div>
      </div>

      {/* 2. Delayed Flights */}
      <div className="text-center" aria-label={`Delayed Flights: ${activeOutput.delayed_flights_count}`}>
        <div className="text-xl font-bold text-[#FF5555] tracking-tight" aria-live="polite" aria-atomic="true">
          {activeOutput.delayed_flights_count.toString().padStart(2, '0')}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Delayed
        </div>
      </div>

      {/* 3. Cancelled Flights */}
      <div className="text-center" aria-label={`Cancelled Flights: ${activeOutput.cancelled_flights_count}`}>
        <div className="text-xl font-bold text-white tracking-tight">
          {activeOutput.cancelled_flights_count.toString().padStart(2, '0')}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Cancelled
        </div>
      </div>

      {/* 4. Stranded Pax */}
      <div className="text-center" aria-label={`Stranded Passengers: ${activeOutput.stranded_passengers}`}>
        <div className="text-xl font-bold text-white tracking-tight" aria-live="polite" aria-atomic="true">
          {activeOutput.stranded_passengers}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Stranded Pax
        </div>
      </div>

      {/* 5. Crew Violations */}
      <div className="text-center" aria-label={`Crew Violations: ${activeOutput.crew_violations_count}`}>
        <div className="text-xl font-bold text-white tracking-tight">
          {activeOutput.crew_violations_count.toString().padStart(2, '0')}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Crew Violations
        </div>
      </div>

      {/* 6. Total Delay */}
      <div className="text-center" aria-label={`Total Delay Minutes: ${activeOutput.total_delay_minutes.toLocaleString()} minutes`}>
        <div className="text-xl font-bold text-white tracking-tight" aria-live="polite" aria-atomic="true">
          {activeOutput.total_delay_minutes.toLocaleString()} min
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Total Delay
        </div>
      </div>
    </div>
  );
});

KpiStrip.displayName = 'KpiStrip';

