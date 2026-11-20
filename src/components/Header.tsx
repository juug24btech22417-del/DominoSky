import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { toHHMM } from '../engine/simulator';
import {
  Plane,
  RotateCcw,
  ShieldAlert,
  Zap,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    currentTimeMin,
    closureAirport,
    resetAll,
    startJudgeTour,
    isJudgeTourRunning,
    setIsSettingsOpen
  } = useSimulationStore();

  const navItems: Array<{ id: 'operations' | 'network' | 'recovery' | 'insights'; label: string }> = [
    { id: 'operations', label: 'Operations' },
    { id: 'network', label: 'Network' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'insights', label: 'Insights' }
  ];

  return (
    <header className="h-14 bg-[#0A0D14] border-b border-[#1A2230] px-5 flex items-center justify-between select-none z-30 shrink-0">
      {/* 1. Left: Try-On + Brand & Subtitle */}
      <div className="flex items-center space-x-3.5">
        {/* Try-On Button (Matches screenshot) */}
        <button
          onClick={() => setActiveNavTab('operations')}
          className="px-2.5 py-1 rounded-md bg-[#141A24] hover:bg-[#1E2736] border border-[#232F42] text-[11px] text-zinc-300 flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="font-medium">Try-On</span>
        </button>

        {/* Brand */}
        <div className="flex items-baseline space-x-2">
          <span className="font-extrabold text-sm tracking-wider text-white">DOMINO SKY</span>
          <span className="text-[10px] text-zinc-400 font-sans tracking-tight hidden sm:inline">
            Network Operations Intelligence
          </span>
        </div>
      </div>

      {/* 2. Center: Navigation Tabs (Operations | Network | Recovery | Insights) */}
      <nav className="flex items-center p-1 rounded-full bg-[#121722] border border-[#1E2736]">
        {navItems.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNavTab(item.id)}
              className={`px-4 py-1 text-xs rounded-full font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#253043] text-white font-semibold shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1A2230]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 3. Right: Live Simulation Indicator + Clock + Actions + Profile */}
      <div className="flex items-center space-x-3">
        {/* Ground Stop Badge */}
        {closureAirport && (
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-950/50 border border-rose-800/60 text-rose-300 text-[11px] font-mono-numbers animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">{closureAirport} GROUND STOP</span>
          </div>
        )}

        {/* Live Simulation Pill */}
        <div className="flex items-center space-x-1.5 text-xs text-zinc-300 font-mono-numbers">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5" />
          <span className="text-[11px] font-medium text-zinc-300">Live Simulation</span>
        </div>

        <div className="h-4 w-[1px] bg-[#1E2736]" />

        {/* Operational Clock */}
        <div className="text-xs font-semibold text-zinc-100 tracking-wider font-mono-numbers">
          IST {toHHMM(currentTimeMin)}
        </div>

        {/* Judge Tour Button */}
        <button
          onClick={startJudgeTour}
          className={`px-2.5 py-1 rounded-md text-[11px] font-mono-numbers flex items-center space-x-1 transition font-medium border ${
            isJudgeTourRunning
              ? 'bg-amber-500 text-black border-amber-400 font-bold'
              : 'bg-[#141A24] hover:bg-[#1E2736] border-[#232F42] text-zinc-300 hover:text-white'
          }`}
          title="Interactive 5-step tour for judges"
        >
          <Zap className="w-3 h-3 text-amber-400 fill-current" />
          <span>Tour</span>
        </button>

        {/* Operational Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Operational Settings & Rules"
          className="p-1.5 rounded-md bg-[#141A24] hover:bg-[#1E2736] border border-[#232F42] text-zinc-400 hover:text-white transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Reset Baseline */}
        <button
          onClick={resetAll}
          title="Reset to clean baseline"
          className="p-1.5 rounded-md bg-[#141A24] hover:bg-[#1E2736] border border-[#232F42] text-zinc-400 hover:text-white transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* User Avatar Circle */}
        <div
          title="Capt. Sharma - Senior Flight Director"
          className="w-7 h-7 rounded-full bg-[#18202F] border border-[#29364C] flex items-center justify-center text-zinc-200 text-xs font-bold cursor-pointer hover:border-zinc-500 transition"
        >
          <Plane className="w-3.5 h-3.5 transform -rotate-45 text-cyan-400" />
        </div>
      </div>
    </header>
  );
};
