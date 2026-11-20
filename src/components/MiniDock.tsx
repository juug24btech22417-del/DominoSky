import React from 'react';
import {
  LayoutDashboard,
  Plane,
  Calendar,
  CloudRain,
  Brain,
  Settings
} from 'lucide-react';

export const MiniDock: React.FC = () => {
  return (
    <div className="w-11 bg-black border-r border-surface-border flex flex-col items-center py-3 space-y-3.5 select-none z-20">
      <button className="w-7 h-7 rounded bg-zinc-800 text-white flex items-center justify-center transition border border-zinc-700">
        <LayoutDashboard className="w-4 h-4" />
      </button>

      <button className="w-7 h-7 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 flex items-center justify-center transition">
        <Plane className="w-4 h-4" />
      </button>

      <button className="w-7 h-7 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 flex items-center justify-center transition">
        <Calendar className="w-4 h-4" />
      </button>

      <button className="w-7 h-7 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 flex items-center justify-center transition">
        <CloudRain className="w-4 h-4" />
      </button>

      <button className="w-7 h-7 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 flex items-center justify-center transition">
        <Brain className="w-4 h-4" />
      </button>

      <div className="flex-1" />

      <button className="w-7 h-7 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 flex items-center justify-center transition">
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};
