import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { X, CloudRain, CloudLightning, Wind, Eye } from 'lucide-react';

export const WeatherModal: React.FC = () => {
  const {
    isWeatherOverlayActive,
    setIsWeatherOverlayActive,
    closureAirport
  } = useSimulationStore();

  if (!isWeatherOverlayActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#0E131C] border border-[#1E2736] rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 bg-[#121824] border-b border-[#1E2736] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Doppler Weather Radar & Airport METAR Feed</h3>
          </div>
          <button
            onClick={() => setIsWeatherOverlayActive(false)}
            className="text-zinc-400 hover:text-white transition p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono-numbers">
          {/* Active Storm Cell Card */}
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-rose-400 font-bold">
                <CloudLightning className="w-4 h-4" />
                <span>SEVERE CONVECTIVE STORM // VABB (MUMBAI)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-900 border border-rose-700 text-rose-200 font-bold">
                GROUND STOP
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3 text-zinc-300">
              <div>
                <span className="text-zinc-500 text-[10px] block">RADAR ECHO</span>
                <span className="font-bold text-rose-400">55 dBZ (Heavy Rain)</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">WIND VECTOR</span>
                <span className="font-bold">250° @ 28G42 KT</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">CEILING</span>
                <span className="font-bold text-rose-400">400 FT (BKN)</span>
              </div>
            </div>
            <div className="mt-2.5 p-2 rounded bg-black/60 border border-rose-900/40 text-[11px] text-zinc-300">
              METAR VABB 200800Z 25028G42KT 1200 +TSRA BKN004 CB FEW025CB 24/23 Q1008 NOSIG=
            </div>
          </div>

          {/* Delhi METAR */}
          <div className="p-3.5 rounded-xl bg-[#121824] border border-[#1E2736]">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-zinc-200 font-bold">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>DELHI (VIDP) // IGI AIRPORT</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                CAT III VMC
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2 text-zinc-300">
              <div>
                <span className="text-zinc-500 text-[10px] block">VISIBILITY</span>
                <span className="font-bold text-emerald-400">8,000 M</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">WIND</span>
                <span className="font-bold">090° @ 06 KT</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">TEMP / DEW</span>
                <span className="font-bold">18°C / 12°C</span>
              </div>
            </div>
          </div>

          {/* Bengaluru METAR */}
          <div className="p-3.5 rounded-xl bg-[#121824] border border-[#1E2736]">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-zinc-200 font-bold">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>BENGALURU (VOBL) // KIA AIRPORT</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                CAVOK (NOMINAL)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2 text-zinc-300">
              <div>
                <span className="text-zinc-500 text-[10px] block">VISIBILITY</span>
                <span className="font-bold text-emerald-400">10 KM+</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">WIND</span>
                <span className="font-bold">110° @ 08 KT</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">RUNWAY CONDITION</span>
                <span className="font-bold text-emerald-400">DRY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
