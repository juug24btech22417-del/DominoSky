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
    activeNavTab,
    setActiveNavTab,
    setIsSettingsOpen,
    setIsWeatherOverlayActive
  } = useSimulationStore();

  return (
    <div className="w-11 bg-[#0A0D14] border-r border-[#1A2230] flex flex-col items-center py-3 space-y-3.5 select-none z-20 shrink-0">
      {/* 1. Dashboard / Operations */}
      <button
        onClick={() => setActiveNavTab('operations')}
        title="Operations Command Center"
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          activeNavTab === 'operations'
            ? 'bg-[#1C2636] text-white border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#141A26] border-transparent'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
      </button>

      {/* 2. Airspace / Network */}
      <button
        onClick={() => setActiveNavTab('network')}
        title="Network & Airspace Radar"
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          activeNavTab === 'network'
            ? 'bg-[#1C2636] text-white border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#141A26] border-transparent'
        }`}
      >
        <Plane className="w-4 h-4" />
      </button>

      {/* 3. Gantt Fleet Rotations */}
      <button
        onClick={() => setActiveNavTab('recovery')}
        title="Fleet Rotations & Gantt Recovery"
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          activeNavTab === 'recovery'
            ? 'bg-[#1C2636] text-white border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#141A26] border-transparent'
        }`}
      >
        <Calendar className="w-4 h-4" />
      </button>

      {/* 4. Weather Radar */}
      <button
        onClick={() => setIsWeatherOverlayActive(true)}
        title="Doppler Weather Radar & METAR"
        className="w-7 h-7 rounded text-zinc-500 hover:text-zinc-200 hover:bg-[#141A26] flex items-center justify-center transition border border-transparent"
      >
        <CloudRain className="w-4 h-4" />
      </button>

      {/* 5. Intelligence / Insights */}
      <button
        onClick={() => setActiveNavTab('insights')}
        title="Domino DNA & Executive Insights"
        className={`w-7 h-7 rounded flex items-center justify-center transition border ${
          activeNavTab === 'insights'
            ? 'bg-[#1C2636] text-white border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#141A26] border-transparent'
        }`}
      >
        <Brain className="w-4 h-4" />
      </button>

      <div className="flex-1" />

      {/* 6. Settings */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        title="Operational Settings & DGCA Rules"
        className="w-7 h-7 rounded text-zinc-500 hover:text-zinc-200 hover:bg-[#141A26] flex items-center justify-center transition border border-transparent"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};
