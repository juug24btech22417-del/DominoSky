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
    <div className="w-11 bg-black border-r border-surface-border flex flex-col items-center py-3 space-y-3.5 select-none z-20">
      {/* 1. Dashboard */}
      <button
        onClick={() => setActiveDockView('dashboard')}
        title="Command Dashboard (Overview)"
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          activeDockView === 'dashboard'
            ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
      </button>

      {/* 2. Airspace / Radar */}
      <button
        onClick={() => setActiveDockView(activeDockView === 'airspace' ? 'dashboard' : 'airspace')}
        title={activeDockView === 'airspace' ? 'Exit Airspace View' : 'Focus Airspace Satellite Map'}
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          activeDockView === 'airspace'
            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <Plane className="w-4 h-4" />
      </button>

      {/* 3. Gantt Timeline */}
      <button
        onClick={() => setActiveDockView(activeDockView === 'gantt' ? 'dashboard' : 'gantt')}
        title={activeDockView === 'gantt' ? 'Exit Gantt View' : 'Fullscreen Fleet Rotations Gantt Timeline'}
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          activeDockView === 'gantt'
            ? 'bg-amber-950/80 text-amber-300 border-amber-700 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <Calendar className="w-4 h-4" />
      </button>

      {/* 4. Weather Radar */}
      <button
        onClick={() => setIsWeatherOpen(!isWeatherOpen)}
        title="Doppler Weather Radar & METAR Feed"
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          isWeatherOpen
            ? 'bg-blue-950/80 text-blue-300 border-blue-700 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <CloudRain className="w-4 h-4" />
      </button>

      {/* 5. AI Dispatcher Recovery & Domino DNA */}
      <button
        onClick={() => {
          setActiveScheduleTab(activeScheduleTab === 'recovery' ? 'dna' : 'recovery');
          setActiveDockView('dashboard');
        }}
        title="Open AI Dispatcher & Domino DNA Recovery"
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          activeScheduleTab === 'recovery' || activeScheduleTab === 'dna'
            ? 'bg-purple-950/80 text-purple-300 border-purple-700 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <Brain className="w-4 h-4" />
      </button>

      <div className="flex-1" />

      {/* 6. Settings */}
      <button
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        title="Operational Settings & Engine Parameters"
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          isSettingsOpen
            ? 'bg-zinc-800 text-white border-zinc-600'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};
