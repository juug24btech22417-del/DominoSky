import React, { useState } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { DATASET } from '../engine/simulator';
import {
  CloudLightning,
  CloudFog,
  Sun,
  Play,
  Sliders,
  Activity
} from 'lucide-react';

export const FleetAndAlerts: React.FC = () => {
  const {
    activeOutput,
    closureAirport,
    applyPreset,
    setClosure,
    selectFlight,
    setActiveScheduleTab
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
          <h2>FLEET STATUS OVERVIEW</h2>
          <Activity className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
        </div>

        {/* Dual Donut Rings */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Donut 1: Aircraft Availability */}
          <div
            role="figure"
            aria-label={`Aircraft Ready: ${availabilityPct}% (${availableTails} of ${totalAircraft} tails ready)`}
            className="flex flex-col items-center bg-zinc-950 p-2.5 rounded border border-zinc-800"
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" aria-hidden="true">
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
          <div
            role="figure"
            aria-label={`On-Time Rate: ${onTimePct}% adherence`}
            className="flex flex-col items-center bg-zinc-950 p-2.5 rounded border border-zinc-800"
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" aria-hidden="true">
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
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>Ready: {availableTails} Tails</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
            <span>Delayed: {delayedTails} Tails</span>
          </span>
        </div>
      </div>

      {/* 2. DISRUPTION LAB CONTROLS */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 uppercase tracking-wider">
          <h2>AIRSPACE DISRUPTION LAB</h2>
          <Sliders className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
        </div>

        {/* Tactical Presets */}
        <div className="space-y-1.5" role="group" aria-label="Disruption Scenario Presets">
          <button
            onClick={() => applyPreset('mumbai_storm')}
            aria-pressed={closureAirport === 'BOM'}
            aria-label="Simulate Mumbai Severe Thunderstorm 90 minute ground stop"
            className={`w-full p-2.5 rounded text-left border transition flex items-center space-x-2.5 focus-visible:ring-2 focus-visible:ring-rose-400 outline-none ${
              closureAirport === 'BOM'
                ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}
          >
            <CloudLightning className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[11px]">Mumbai Severe Thunderstorm</div>
              <div className="text-[9px] text-zinc-400">90m Full Ground Stop • BOM</div>
            </div>
          </button>

          <button
            onClick={() => applyPreset('delhi_fog')}
            aria-pressed={closureAirport === 'DEL'}
            aria-label="Simulate Delhi Dense Winter Fog 120 minute low visibility closure"
            className={`w-full p-2.5 rounded text-left border transition flex items-center space-x-2.5 focus-visible:ring-2 focus-visible:ring-amber-400 outline-none ${
              closureAirport === 'DEL'
                ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}
          >
            <CloudFog className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[11px]">Delhi Dense Winter Fog</div>
              <div className="text-[9px] text-zinc-400">120m Low Visibility • DEL</div>
            </div>
          </button>

          <button
            onClick={() => applyPreset('clear')}
            aria-label="Reset to clear airspace nominal conditions"
            className="w-full p-2 rounded text-left border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white transition flex items-center space-x-2 text-[10px] focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
          >
            <Sun className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>Reset to Clear Airspace</span>
          </button>
        </div>

        {/* Custom Hub Halt */}
        <div className="pt-2 border-t border-zinc-900 space-y-2">
          <div className="flex justify-between items-center text-[10px] text-zinc-400">
            <label htmlFor="custom-airport-select">CUSTOM CLOSURE</label>
            <span className="text-zinc-200 font-semibold">{customDuration}m</span>
          </div>

          <div className="flex space-x-2">
            <select
              id="custom-airport-select"
              aria-label="Custom Closure Airport Hub"
              value={customAirport}
              onChange={e => setCustomAirport(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {DATASET.airports.map(ap => (
                <option key={ap.id} value={ap.id}>{ap.id} ({ap.city})</option>
              ))}
            </select>

            <button
              onClick={() => setClosure(customAirport, '08:00', customDuration)}
              aria-label={`Trigger custom closure on ${customAirport} for ${customDuration} minutes`}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-semibold transition flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
            >
              <Play className="w-3 h-3 fill-current" aria-hidden="true" />
              <span>TRIGGER</span>
            </button>
          </div>

          <input
            type="range"
            aria-label="Custom Closure Duration in Minutes"
            aria-valuemin={15}
            aria-valuemax={180}
            aria-valuenow={customDuration}
            aria-valuetext={`${customDuration} minutes`}
            min="15"
            max="180"
            step="15"
            value={customDuration}
            onChange={e => setCustomDuration(Number(e.target.value))}
            className="w-full accent-zinc-400 bg-zinc-800 h-1.5 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 3. ACTIVE DISRUPTION ALERTS FEED */}
      <div className="p-3.5 space-y-2 flex-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 uppercase tracking-wider">
          <h2>ACTIVE ALERTS ({activeOutput.events.length})</h2>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-56" role="feed" aria-label="Operational Events Feed">
          {activeOutput.events.map((ev, idx) => (
            <article
              key={idx}
              tabIndex={0}
              onClick={() => {
                if (ev.flight_id) selectFlight(ev.flight_id);
                setActiveScheduleTab('recovery');
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (ev.flight_id) selectFlight(ev.flight_id);
                  setActiveScheduleTab('recovery');
                }
              }}
              className={`p-2 rounded border cursor-pointer transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
                ev.severity === 'critical'
                  ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700'
                  : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className={`font-semibold ${ev.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {ev.time_str} • {ev.title}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                {ev.details}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
