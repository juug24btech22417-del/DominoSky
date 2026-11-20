import React, { useState } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { DATASET } from '../engine/simulator';
import {
  CloudLightning,
  CloudFog,
  Sun,
  AlertTriangle,
  Play,
  Sliders,
  ShieldAlert,
  Activity
} from 'lucide-react';

export const FleetAndAlerts: React.FC = () => {
  const {
    activeOutput,
    closureAirport,
    applyPreset,
    setClosure
  } = useSimulationStore();

  const [customAirport, setCustomAirport] = useState('BOM');
  const [customDuration, setCustomDuration] = useState(90);

  // Compute fleet status
  const totalAircraft = 16;
  const delayedTails = new Set(
    Object.values(activeOutput.flights)
      .filter(f => f.is_delayed)
      .map(f => f.tail_id)
  ).size;

  const availableTails = totalAircraft - delayedTails;
  const availabilityPct = Math.round((availableTails / totalAircraft) * 100);

  const onTimePct = Math.round(
    (activeOutput.on_time_flights / (activeOutput.total_flights || 1)) * 100
  );

  return (
    <div className="w-80 bg-black border-r border-surface-border flex flex-col h-full overflow-y-auto select-none text-xs font-mono-numbers divide-y divide-zinc-900">
      {/* 1. FLEET STATUS OVERVIEW */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 uppercase tracking-wider">
          <span>FLEET STATUS OVERVIEW</span>
          <Activity className="w-3.5 h-3.5 text-zinc-400" />
        </div>

        {/* Dual Donut Rings (Refined, no neon!) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Donut 1: Aircraft Availability */}
          <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded border border-zinc-800">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#1c1c1c" strokeWidth="4.5" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke={availabilityPct < 70 ? '#EF4444' : '#10B981'}
                  strokeWidth="4.5"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * availabilityPct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-semibold text-zinc-100">{availabilityPct}%</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium mt-1.5 text-center">
              Aircraft Ready
            </span>
          </div>

          {/* Donut 2: Schedule Adherence */}
          <div className="flex flex-col items-center bg-zinc-950 p-2.5 rounded border border-zinc-800">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#1c1c1c" strokeWidth="4.5" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke={onTimePct < 70 ? '#F59E0B' : '#3B82F6'}
                  strokeWidth="4.5"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * onTimePct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-semibold text-zinc-100">{onTimePct}%</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium mt-1.5 text-center">
              On-Time Rate
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between text-[10px] text-zinc-400 pt-0.5">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Ready: {availableTails} Tails</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Delayed: {delayedTails} Tails</span>
          </span>
        </div>
      </div>

      {/* 2. DISRUPTION LAB CONTROLS */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 uppercase tracking-wider">
          <span>AIRSPACE DISRUPTION LAB</span>
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
        </div>

        {/* Tactical Presets */}
        <div className="space-y-1.5">
          <button
            onClick={() => applyPreset('mumbai_storm')}
            className={`w-full p-2.5 rounded text-left border transition flex items-center space-x-2.5 ${
              closureAirport === 'BOM'
                ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}
          >
            <CloudLightning className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[11px]">Mumbai Severe Thunderstorm</div>
              <div className="text-[9px] text-zinc-400">90m Full Ground Stop • BOM</div>
            </div>
          </button>

          <button
            onClick={() => applyPreset('delhi_fog')}
            className={`w-full p-2.5 rounded text-left border transition flex items-center space-x-2.5 ${
              closureAirport === 'DEL'
                ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}
          >
            <CloudFog className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[11px]">Delhi Dense Winter Fog</div>
              <div className="text-[9px] text-zinc-400">120m Low Visibility • DEL</div>
            </div>
          </button>

          <button
            onClick={() => applyPreset('clear')}
            className="w-full p-2 rounded text-left border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white transition flex items-center space-x-2 text-[10px]"
          >
            <Sun className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reset to Clear Airspace</span>
          </button>
        </div>

        {/* Custom Hub Halt */}
        <div className="pt-2 border-t border-zinc-900 space-y-2">
          <div className="flex justify-between items-center text-[10px] text-zinc-400">
            <span>CUSTOM CLOSURE</span>
            <span className="text-zinc-200 font-semibold">{customDuration}m</span>
          </div>

          <div className="flex space-x-2">
            <select
              value={customAirport}
              onChange={e => setCustomAirport(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
            >
              {DATASET.airports.map(ap => (
                <option key={ap.id} value={ap.id}>{ap.id} ({ap.city})</option>
              ))}
            </select>

            <button
              onClick={() => setClosure(customAirport, '08:00', customDuration)}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-semibold transition flex items-center space-x-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>TRIGGER</span>
            </button>
          </div>

          <input
            type="range"
            min="15"
            max="180"
            step="15"
            value={customDuration}
            onChange={e => setCustomDuration(Number(e.target.value))}
            className="w-full accent-zinc-400 cursor-pointer h-1 bg-zinc-900 rounded"
          />
        </div>
      </div>

      {/* 3. ACTIVE ALERTS */}
      <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 uppercase tracking-wider">
          <span>ACTIVE ALERTS</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-900 text-rose-300 font-medium">
            {activeOutput.events.length} ACTIVE
          </span>
        </div>

        <div className="space-y-2">
          {activeOutput.closure && (
            <div className="p-2.5 rounded bg-rose-950/20 border border-rose-900/50 text-rose-300 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-semibold">
                <span className="flex items-center space-x-1 text-rose-400">
                  <ShieldAlert className="w-3 h-3" />
                  <span>CRITICAL AIRPORT HALT</span>
                </span>
                <span>NOW</span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-relaxed font-sans">
                {activeOutput.closure.airport} operations suspended for {activeOutput.closure.duration} mins.
              </p>
            </div>
          )}

          {activeOutput.stranded_passengers > 0 && (
            <div className="p-2.5 rounded bg-amber-950/20 border border-amber-900/50 text-amber-300 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-semibold">
                <span className="flex items-center space-x-1 text-amber-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>BROKEN CONNECTIONS</span>
                </span>
                <span>CASCADE</span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-relaxed font-sans">
                {activeOutput.stranded_passengers} connecting passengers stranded across transit banks.
              </p>
            </div>
          )}

          {activeOutput.events.slice(0, 3).map((ev, idx) => (
            <div key={idx} className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 space-y-0.5">
              <div className="flex items-center justify-between text-[9px] text-zinc-500">
                <span className="font-semibold text-zinc-300">{ev.time_str} IST</span>
                <span className="uppercase text-[8px] text-zinc-400">{ev.severity}</span>
              </div>
              <div className="text-[10px] text-zinc-200">{ev.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
