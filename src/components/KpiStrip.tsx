import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';

export const KpiStrip: React.FC = () => {
  const { activeOutput } = useSimulationStore();

  return (
    <div className="h-16 bg-transparent px-8 flex items-center justify-end space-x-12 select-none font-mono-numbers">
      {/* 1. Total Flights */}
      <div className="text-center">
        <div className="text-xl font-bold text-white tracking-tight">
          {activeOutput.total_flights}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Flights
        </div>
      </div>

      {/* 2. Delayed Flights */}
      <div className="text-center">
        <div className="text-xl font-bold text-[#FF5555] tracking-tight">
          {activeOutput.delayed_flights_count.toString().padStart(2, '0')}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Delayed
        </div>
      </div>

      {/* 3. Cancelled Flights */}
      <div className="text-center">
        <div className="text-xl font-bold text-white tracking-tight">
          {activeOutput.cancelled_flights_count.toString().padStart(2, '0')}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Cancelled
        </div>
      </div>

      {/* 4. Stranded Pax */}
      <div className="text-center">
        <div className="text-xl font-bold text-white tracking-tight">
          {activeOutput.stranded_passengers}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Stranded Pax
        </div>
      </div>

      {/* 5. Crew Violations */}
      <div className="text-center">
        <div className="text-xl font-bold text-white tracking-tight">
          {activeOutput.crew_violations_count.toString().padStart(2, '0')}
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Crew Violations
        </div>
      </div>

      {/* 6. Total Delay */}
      <div className="text-center">
        <div className="text-xl font-bold text-white tracking-tight">
          {activeOutput.total_delay_minutes.toLocaleString()} min
        </div>
        <div className="text-[11px] text-zinc-400 font-sans tracking-wide">
          Total Delay
        </div>
      </div>
    </div>
  );
};
