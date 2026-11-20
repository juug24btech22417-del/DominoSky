import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { X, Sliders, Shield, RotateCcw } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    resetAll
  } = useSimulationStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#0E131C] border border-[#1E2736] rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 bg-[#121824] border-b border-[#1E2736] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Operations Configuration & Engine Parameters</h3>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="text-zinc-400 hover:text-white transition p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs font-mono-numbers">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold">Minimum Aircraft Turnaround Buffer</label>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Narrow-body (A320/B737)</span>
              <span className="text-white font-bold">45 minutes</span>
            </div>
            <input
              type="range"
              min="30"
              max="90"
              step="5"
              defaultValue="45"
              className="w-full accent-cyan-400 bg-[#1A2230] h-1.5 rounded-full cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#1E2736]">
            <label className="text-zinc-300 font-semibold">DGCA Flight Duty Time Limitation (FDTL) Max Duty</label>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>CAR Section 7 Series J Limit</span>
              <span className="text-white font-bold">10 hours (600 min)</span>
            </div>
            <input
              type="range"
              min="8"
              max="12"
              step="1"
              defaultValue="10"
              className="w-full accent-cyan-400 bg-[#1A2230] h-1.5 rounded-full cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#1E2736]">
            <label className="text-zinc-300 font-semibold">Statutory Pax Delay Compensation (DGCA CAR Sec 3)</label>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Per passenger over 2 hours delay</span>
              <span className="text-white font-bold">₹3,000 INR</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#1E2736]">
            <button
              onClick={() => {
                resetAll();
                setIsSettingsOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Engine Defaults</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition"
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
