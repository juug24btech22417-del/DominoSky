import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { X, Sliders, RotateCcw } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    resetAll
  } = useSimulationStore();

  if (!isSettingsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div className="w-full max-w-lg bg-[#0E131C] border border-[#1E2736] rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 bg-[#121824] border-b border-[#1E2736] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <h2 id="settings-modal-title" className="text-sm font-bold text-white">Operations Configuration & Engine Parameters</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            aria-label="Close settings dialog"
            className="text-zinc-400 hover:text-white transition p-1 focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none rounded"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs font-mono-numbers">
          <div className="space-y-1.5">
            <label htmlFor="turnaround-buffer-slider" className="text-zinc-300 font-semibold block">Minimum Aircraft Turnaround Buffer</label>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Narrow-body (A320/B737)</span>
              <span className="text-white font-bold">45 minutes</span>
            </div>
            <input
              id="turnaround-buffer-slider"
              type="range"
              aria-label="Minimum aircraft turnaround buffer in minutes"
              aria-valuemin={30}
              aria-valuemax={90}
              aria-valuenow={45}
              aria-valuetext="45 minutes"
              min="30"
              max="90"
              step="5"
              defaultValue="45"
              className="w-full accent-cyan-400 bg-[#1A2230] h-1.5 rounded-full cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#1E2736]">
            <label htmlFor="fdtl-max-duty-slider" className="text-zinc-300 font-semibold block">DGCA Flight Duty Time Limitation (FDTL) Max Duty</label>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>CAR Section 7 Series J Limit</span>
              <span className="text-white font-bold">10 hours (600 min)</span>
            </div>
            <input
              id="fdtl-max-duty-slider"
              type="range"
              aria-label="DGCA Flight Duty Time Limitation maximum duty in hours"
              aria-valuemin={8}
              aria-valuemax={12}
              aria-valuenow={10}
              aria-valuetext="10 hours"
              min="8"
              max="12"
              step="1"
              defaultValue="10"
              className="w-full accent-cyan-400 bg-[#1A2230] h-1.5 rounded-full cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#1E2736]">
            <span className="text-zinc-300 font-semibold block">Statutory Pax Delay Compensation (DGCA CAR Sec 3)</span>
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
              aria-label="Reset simulation engine defaults"
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs flex items-center space-x-1.5 transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Engine Defaults</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(false)}
              aria-label="Save settings and close"
              className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
