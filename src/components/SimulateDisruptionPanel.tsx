import React, { useCallback } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { DATASET } from '../engine/simulator';
import {
  Plane,
  Calendar,
  CloudLightning,
  Play
} from 'lucide-react';

export const SimulateDisruptionPanel: React.FC = () => {
  const {
    closureAirport,
    closureDuration,
    disruptionReason,
    setClosure,
    applyPreset
  } = useSimulationStore();

  // Stable callbacks — prevent inline function recreation on every render
  const handleAirportChange = useCallback((apId: string) => {
    setClosure(apId, '08:00', closureDuration, disruptionReason);
  }, [setClosure, closureDuration, disruptionReason]);

  const handleDurationChange = useCallback((dur: number) => {
    setClosure(closureAirport || 'BOM', '08:00', dur, disruptionReason);
  }, [setClosure, closureAirport, disruptionReason]);

  return (
    <div className="w-80 bg-transparent p-6 flex flex-col space-y-5 select-none text-xs font-sans z-20">
      {/* Title */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono-numbers">
          SCENARIO
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
          Simulate Disruption
        </h1>
      </div>

      {/* Airport Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-zinc-400">Airport</label>
        <div className="relative">
          <div className="w-full bg-[#10141D] border border-[#1E2633] rounded-lg px-3 py-2.5 text-xs text-white flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-2">
              <Plane className="w-3.5 h-3.5 text-zinc-400 transform -rotate-45" />
              <select
                value={closureAirport || 'BOM'}
                onChange={(e) => handleAirportChange(e.target.value)}
                className="bg-transparent text-white focus:outline-none appearance-none cursor-pointer pr-4"
              >
                {DATASET.airports.map((a) => (
                  <option key={a.id} value={a.id} className="bg-[#10141D] text-white">
                    {a.id} – {a.city}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-zinc-500 text-[10px]">▼</span>
          </div>
        </div>
      </div>

      {/* Closure Duration Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-zinc-400">Closure Duration</span>
          <span className="text-white font-semibold">{closureDuration} min</span>
        </div>
        <input
          type="range"
          min="15"
          max="240"
          step="15"
          value={closureDuration}
          onChange={(e) => handleDurationChange(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#1A2230] rounded-full"
        />
      </div>

      {/* Start Time */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-zinc-400">Start Time</label>
        <div className="w-full bg-[#10141D] border border-[#1E2633] rounded-lg px-3 py-2.5 text-xs text-white flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-200">20 Nov 2026, 08:00 IST</span>
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-zinc-400">Reason</label>
        <div className="w-full bg-[#10141D] border border-[#1E2633] rounded-lg px-3 py-2.5 text-xs text-white flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-2">
            <CloudLightning className="w-3.5 h-3.5 text-zinc-400" />
            <span>{disruptionReason || 'Thunderstorm'}</span>
          </div>
          <span className="text-zinc-500 text-[10px]">▼</span>
        </div>
      </div>

      {/* Run Simulation Signature Pill Button */}
      <button
        onClick={() => setClosure(closureAirport || 'BOM', '08:00', closureDuration, disruptionReason)}
        className="w-full py-2.5 rounded-full bg-[#D2E9F7] hover:bg-white text-[#0A101D] font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg active:scale-98"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Run Simulation (≈ 2s)</span>
      </button>

      {/* Scenario Presets */}
      <div className="space-y-2 pt-2">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono-numbers">
          SCENARIO PRESETS
        </div>

        <div className="space-y-1.5">
          {/* Mumbai */}
          <button
            onClick={() => applyPreset('mumbai_storm')}
            className={`w-full px-3 py-2.5 rounded-lg border flex items-center justify-between text-left transition ${
              closureAirport === 'BOM' && closureDuration === 90
                ? 'bg-[#101622] border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                : 'bg-[#10141D] border-[#1E2633] text-zinc-300 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CloudLightning className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-medium">Mumbai Thunderstorm</span>
            </div>
            <span className="text-[10px] text-zinc-400">90 min</span>
          </button>

          {/* Delhi */}
          <button
            onClick={() => applyPreset('delhi_fog')}
            className={`w-full px-3 py-2.5 rounded-lg border flex items-center justify-between text-left transition ${
              closureAirport === 'DEL'
                ? 'bg-[#101622] border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                : 'bg-[#10141D] border-[#1E2633] text-zinc-300 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Plane className="w-3.5 h-3.5 text-zinc-400 transform -rotate-45" />
              <span className="text-[11px] font-medium">Delhi Closure</span>
            </div>
            <span className="text-[10px] text-zinc-400">120 min</span>
          </button>

          {/* Bengaluru */}
          <button
            onClick={() => applyPreset('blr_halt')}
            className={`w-full px-3 py-2.5 rounded-lg border flex items-center justify-between text-left transition ${
              closureAirport === 'BLR'
                ? 'bg-[#101622] border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                : 'bg-[#10141D] border-[#1E2633] text-zinc-300 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Plane className="w-3.5 h-3.5 text-zinc-400 transform -rotate-45" />
              <span className="text-[11px] font-medium">Bengaluru Disruption</span>
            </div>
            <span className="text-[10px] text-zinc-400">60 min</span>
          </button>
        </div>
      </div>
    </div>
  );
};

