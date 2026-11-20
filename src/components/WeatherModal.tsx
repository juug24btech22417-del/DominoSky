import React, { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { X, CloudRain, CloudLightning, Wind, Eye } from 'lucide-react';

export const WeatherModal: React.FC = () => {
  const {
    isWeatherOpen,
    setIsWeatherOpen
  } = useSimulationStore();

  const closeRef = useRef<HTMLButtonElement>(null);

  /* Focus close button when modal opens (WCAG 2.4.3 — Focus Order) */
  useEffect(() => {
    if (isWeatherOpen) closeRef.current?.focus();
  }, [isWeatherOpen]);

  /* Keyboard: Escape closes modal (WCAG 2.1.2 — No Keyboard Trap) */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setIsWeatherOpen(false);
  }, [setIsWeatherOpen]);

  const handleClose = useCallback(() => setIsWeatherOpen(false), [setIsWeatherOpen]);

  if (!isWeatherOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="weather-modal-title"
      aria-describedby="weather-modal-desc"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div className="w-full max-w-xl bg-[#0E131C] border border-[#1E2736] rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 bg-[#121824] border-b border-[#1E2736] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CloudRain className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <h2 id="weather-modal-title" className="text-sm font-bold text-white">Doppler Weather Radar &amp; Airport METAR Feed</h2>
          </div>
          <button
            ref={closeRef}
            onClick={handleClose}
            aria-label="Close weather modal dialog"
            className="text-zinc-400 hover:text-white transition p-1 focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none rounded"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Hidden description for screen readers */}
        <p id="weather-modal-desc" className="sr-only">
          Real-time Doppler weather radar feed and METAR data for all monitored Indian airport hubs.
        </p>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono-numbers">
          {/* Active Storm Cell Card */}
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80" role="region" aria-label="Mumbai storm alert">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-rose-400 font-bold">
                <CloudLightning className="w-4 h-4" aria-hidden="true" />
                <span>SEVERE CONVECTIVE STORM // VABB (MUMBAI)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-900 border border-rose-700 text-rose-200 font-bold">
                GROUND STOP
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3 text-zinc-300">
              <div>
                <span className="text-zinc-400 text-[10px] block">RADAR ECHO</span>
                <span className="font-bold text-rose-400">55 dBZ (Heavy Rain)</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">WIND VECTOR</span>
                <span className="font-bold">250° @ 28G42 KT</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">CEILING</span>
                <span className="font-bold text-rose-400">400 FT (BKN)</span>
              </div>
            </div>
            <div className="mt-2.5 p-2 rounded bg-black/60 border border-rose-900/40 text-[11px] text-zinc-300" aria-label="METAR code for Mumbai">
              METAR VABB 200800Z 25028G42KT 1200 +TSRA BKN004 CB FEW025CB 24/23 Q1008 NOSIG=
            </div>
          </div>

          {/* Delhi METAR */}
          <div className="p-3.5 rounded-xl bg-[#121824] border border-[#1E2736]" role="region" aria-label="Delhi airport weather">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-zinc-200 font-bold">
                <Wind className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                <span>DELHI (VIDP) // IGI AIRPORT</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                CAT III VMC
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2 text-zinc-300">
              <div>
                <span className="text-zinc-400 text-[10px] block">VISIBILITY</span>
                <span className="font-bold text-emerald-400">8,000 M</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">WIND</span>
                <span className="font-bold">090° @ 06 KT</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">TEMP / DEW</span>
                <span className="font-bold">18°C / 12°C</span>
              </div>
            </div>
          </div>

          {/* Bengaluru METAR */}
          <div className="p-3.5 rounded-xl bg-[#121824] border border-[#1E2736]" role="region" aria-label="Bengaluru airport weather">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-zinc-200 font-bold">
                <Eye className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                <span>BENGALURU (VOBL) // KIA AIRPORT</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                CAVOK (NOMINAL)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2 text-zinc-300">
              <div>
                <span className="text-zinc-400 text-[10px] block">VISIBILITY</span>
                <span className="font-bold text-emerald-400">10 KM+</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">WIND</span>
                <span className="font-bold">110° @ 08 KT</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">RUNWAY CONDITION</span>
                <span className="font-bold text-emerald-400">DRY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
