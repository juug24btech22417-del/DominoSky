import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import {
  LayoutDashboard,
  Plane,
  Calendar,
  CloudRain,
  Brain,
  Settings
} from 'lucide-react';

export const MiniDock: React.FC = () => {
  const {
    activeDockView,
    setActiveDockView,
    activeScheduleTab,
    setActiveScheduleTab,
    isWeatherOpen,
    setIsWeatherOpen,
    isSettingsOpen,
    setIsSettingsOpen
  } = useSimulationStore();

  return (
    <div
      role="toolbar"
      aria-label="Operations Navigation Dock"
      className="w-11 bg-black border-r border-surface-border flex flex-col items-center py-3 space-y-3.5 select-none z-20 h-full"
    >
      {/* 1. Dashboard */}
      <button
        onClick={() => setActiveDockView('dashboard')}
        aria-label="Operations Command Dashboard Overview"
        aria-pressed={activeDockView === 'dashboard'}
        title="Command Dashboard (Overview)"
        className={`w-7 h-7 rounded flex items-center justify-center transition border focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
          activeDockView === 'dashboard'
            ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* 2. Airspace / Radar */}
      <button
        onClick={() => setActiveDockView(activeDockView === 'airspace' ? 'dashboard' : 'airspace')}
        aria-label={activeDockView === 'airspace' ? 'Exit Airspace View' : 'Focus Airspace Satellite Map'}
        aria-pressed={activeDockView === 'airspace'}
        title={activeDockView === 'airspace' ? 'Exit Airspace View' : 'Focus Airspace Satellite Map'}
        className={`w-7 h-7 rounded flex items-center justify-center transition border focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
          activeDockView === 'airspace'
            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <Plane className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* 3. Gantt Timeline */}
      <button
        onClick={() => setActiveDockView(activeDockView === 'gantt' ? 'dashboard' : 'gantt')}
        aria-label={activeDockView === 'gantt' ? 'Exit Gantt View' : 'Fullscreen Fleet Rotations Gantt Timeline'}
        aria-pressed={activeDockView === 'gantt'}
        title={activeDockView === 'gantt' ? 'Exit Gantt View' : 'Fullscreen Fleet Rotations Gantt Timeline'}
        className={`w-7 h-7 rounded flex items-center justify-center transition border focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
          activeDockView === 'gantt'
            ? 'bg-amber-950/80 text-amber-300 border-amber-700 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <Calendar className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* 4. Weather Radar */}
      <button
        onClick={() => setIsWeatherOpen(!isWeatherOpen)}
        aria-label="Doppler Weather Radar and METAR Feed"
        aria-expanded={isWeatherOpen}
        title="Doppler Weather Radar & METAR Feed"
        className={`w-7 h-7 rounded flex items-center justify-center transition border focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
          isWeatherOpen
            ? 'bg-blue-950/80 text-blue-300 border-blue-700 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <CloudRain className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* 5. AI Dispatcher Recovery & Domino DNA */}
      <button
        onClick={() => {
          setActiveScheduleTab(activeScheduleTab === 'recovery' ? 'dna' : 'recovery');
          setActiveDockView('dashboard');
        }}
        aria-label="Open AI Dispatcher and Domino DNA Recovery"
        aria-pressed={activeScheduleTab === 'recovery' || activeScheduleTab === 'dna'}
        title="Open AI Dispatcher & Domino DNA Recovery"
        className={`w-7 h-7 rounded flex items-center justify-center transition border focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
          activeScheduleTab === 'recovery' || activeScheduleTab === 'dna'
            ? 'bg-purple-950/80 text-purple-300 border-purple-700 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <Brain className="w-4 h-4" aria-hidden="true" />
      </button>

      <div className="flex-1" />

      {/* 6. Settings */}
      <button
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        aria-label="Operational Settings and Engine Parameters"
        aria-expanded={isSettingsOpen}
        title="Operational Settings & Engine Parameters"
        className={`w-7 h-7 rounded flex items-center justify-center transition border focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
          isSettingsOpen
            ? 'bg-zinc-800 text-white border-zinc-600'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <Settings className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};
