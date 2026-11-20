import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { toHHMM } from '../engine/simulator';
import {
  Plane,
  Bell,
  User,
  Zap,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentTimeMin,
    closureAirport,
    resetAll,
    startJudgeTour,
    isJudgeTourRunning,
    activeOutput
  } = useSimulationStore();

  return (
    <header className="h-12 bg-black border-b border-surface-border px-4 flex items-center justify-between select-none z-30">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
            <Plane className="w-4 h-4 transform -rotate-45" />
          </div>
          <div className="flex items-baseline space-x-1.5 font-mono-numbers">
            <span className="font-bold text-sm tracking-wider text-white">DOMINO</span>
            <span className="text-zinc-400 text-xs font-medium tracking-widest">/ SKY</span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-surface-border hidden md:block" />

        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono-numbers text-zinc-400">
          <span className="text-zinc-300 font-medium">OPERATIONS CONTROL CENTER</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">GLOBAL FLIGHT DIRECTOR</span>
        </div>
      </div>

      {/* Center: Large Operational Clock */}
      <div className="flex items-center space-x-3">
        <div className="px-3 py-1 rounded bg-zinc-950 border border-zinc-800 text-center">
          <div className="text-xs font-semibold text-zinc-100 tracking-wider font-mono-numbers">
            {toHHMM(currentTimeMin)}:00 IST <span className="text-zinc-500 text-[10px]">| 20 NOV 2026</span>
          </div>
        </div>

        {closureAirport && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px] font-mono-numbers">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">{closureAirport} GROUND STOP ACTIVE</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Notifications, Profile & Judge Tour */}
      <div className="flex items-center space-x-2.5">
        {/* Reset */}
        <button
          onClick={resetAll}
          title="Reset to clean baseline"
          className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <div className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition">
            <Bell className="w-3.5 h-3.5" />
          </div>
          {activeOutput.delayed_flights_count > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </div>

        {/* User / Dispatcher Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-zinc-800 text-xs font-mono-numbers">
          <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <User className="w-3 h-3" />
          </div>
          <span className="text-zinc-300 hidden sm:inline text-[11px]">CAPT. SHARMA</span>
        </div>

        {/* Judge Tour Button */}
        <button
          onClick={startJudgeTour}
          className={`px-3 py-1.5 rounded text-xs font-mono-numbers flex items-center space-x-1.5 transition font-medium border ${
            isJudgeTourRunning
              ? 'bg-amber-500 text-black border-amber-400 font-bold'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-100 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>JUDGE TOUR</span>
        </button>
      </div>
    </header>
  );
};
