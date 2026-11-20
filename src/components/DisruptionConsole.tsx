import React, { useState } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { DATASET } from '../engine/simulator';
import {
  CloudLightning,
  CloudFog,
  Wrench,
  Sun,
  Play,
  RotateCcw,
  Sliders,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';

export const DisruptionConsole: React.FC = () => {
  const {
    closureAirport,
    closureStartStr,
    closureDuration,
    setClosure,
    applyPreset,
    activeOutput
  } = useSimulationStore();

  const [selectedAirport, setSelectedAirport] = useState<string>(closureAirport || 'BOM');
  const [startTime, setStartTime] = useState<string>(closureStartStr || '08:00');
  const [duration, setDuration] = useState<number>(closureDuration > 0 ? closureDuration : 90);

  const handleApply = () => {
    setClosure(selectedAirport, startTime, duration);
  };

  const handleClear = () => {
    applyPreset('clear');
    setSelectedAirport('BOM');
    setStartTime('08:00');
    setDuration(90);
  };

  // Find direct departures affected at this airport
  const directAffectedCount = Object.values(activeOutput.flights).filter(
    f => f.origin === closureAirport && f.dep_delay > 0
  ).length;

  return (
    <div className="w-72 bg-surface/90 border-r border-surface-border flex flex-col h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="p-3 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono-numbers">
          <Sliders className="w-3.5 h-3.5 text-sky-cyan" />
          <span className="font-semibold text-gray-200 uppercase tracking-wider">DISRUPTION LAB</span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono-numbers">CHAOS ENGINE</span>
      </div>

      <div className="p-3 space-y-4 text-xs font-mono-numbers">
        {/* Preset Scenarios */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2 font-semibold">
            TACTICAL PRESETS
          </label>
          <div className="space-y-1.5">
            <button
              onClick={() => {
                applyPreset('mumbai_storm');
                setSelectedAirport('BOM');
                setStartTime('08:00');
                setDuration(90);
              }}
              className={`w-full p-2 rounded text-left border transition flex items-center space-x-2.5 ${
                closureAirport === 'BOM' && closureDuration === 90
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : 'bg-surface-subtle hover:bg-surface-hover border-surface-border text-gray-300'
              }`}
            >
              <div className="w-6 h-6 rounded bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <CloudLightning className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs truncate">Mumbai Thunderstorm</div>
                <div className="text-[10px] text-gray-400">90m Ground Stop • 08:00 IST</div>
              </div>
            </button>

            <button
              onClick={() => {
                applyPreset('delhi_fog');
                setSelectedAirport('DEL');
                setStartTime('06:00');
                setDuration(120);
              }}
              className={`w-full p-2 rounded text-left border transition flex items-center space-x-2.5 ${
                closureAirport === 'DEL' && closureDuration === 120
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-surface-subtle hover:bg-surface-hover border-surface-border text-gray-300'
              }`}
            >
              <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <CloudFog className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs truncate">Delhi Winter Fog</div>
                <div className="text-[10px] text-gray-400">120m Low Visibility • 06:00 IST</div>
              </div>
            </button>

            <button
              onClick={() => {
                applyPreset('blr_halt');
                setSelectedAirport('BLR');
                setStartTime('11:00');
                setDuration(60);
              }}
              className={`w-full p-2 rounded text-left border transition flex items-center space-x-2.5 ${
                closureAirport === 'BLR' && closureDuration === 60
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                  : 'bg-surface-subtle hover:bg-surface-hover border-surface-border text-gray-300'
              }`}
            >
              <div className="w-6 h-6 rounded bg-sky-500/20 flex items-center justify-center text-sky-cyan shrink-0">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs truncate">BLR Runway Maintenance</div>
                <div className="text-[10px] text-gray-400">60m Closure • 11:00 IST</div>
              </div>
            </button>

            <button
              onClick={handleClear}
              className={`w-full p-1.5 rounded text-left border transition flex items-center space-x-2 ${
                !closureAirport
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-surface-subtle hover:bg-surface-hover border-surface-border text-gray-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-emerald-400 ml-1" />
              <span className="text-[11px] font-medium">Clear Skies (Nominal Schedule)</span>
            </button>
          </div>
        </div>

        {/* Custom Disruption Builder */}
        <div className="pt-2 border-t border-surface-border space-y-3">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
            CUSTOM AIRPORT CLOSURE
          </label>

          {/* Airport Selector */}
          <div>
            <span className="text-gray-400 text-[11px] block mb-1 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-sky-cyan" />
              <span>Target Airport</span>
            </span>
            <select
              value={selectedAirport}
              onChange={(e) => setSelectedAirport(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-sky-cyan"
            >
              {DATASET.airports.map((ap) => (
                <option key={ap.id} value={ap.id}>
                  {ap.id} — {ap.city} ({ap.name})
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div>
            <span className="text-gray-400 text-[11px] block mb-1 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-sky-cyan" />
              <span>Start Time (IST)</span>
            </span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-sky-cyan"
            />
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-gray-400">Duration</span>
              <span className="text-sky-cyan font-bold">{duration} minutes</span>
            </div>
            <input
              type="range"
              min="15"
              max="240"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-0.5">
              <span>15m</span>
              <span>1 hr</span>
              <span>2 hrs</span>
              <span>4 hrs</span>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="pt-2 flex space-x-2">
            <button
              onClick={handleApply}
              className="flex-1 py-2 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold flex items-center justify-center space-x-1.5 transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>SIMULATE CLOSURE</span>
            </button>

            <button
              onClick={handleClear}
              title="Reset to clear network"
              className="px-2.5 py-2 rounded bg-surface-subtle hover:bg-surface-hover border border-surface-border text-gray-400 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active Disruption Status */}
        {closureAirport && (
          <div className="p-2.5 rounded bg-surface-subtle border border-rose-500/30 text-rose-300 space-y-1">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>ACTIVE GROUND STOP: {closureAirport}</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Runway held for {closureDuration}m. {directAffectedCount} flights directly delayed at origin. Delay ripple is actively propagating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

