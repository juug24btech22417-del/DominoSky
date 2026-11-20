import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { Play, Pause, Maximize2, Zap } from 'lucide-react';

export const MilestoneTimeline: React.FC = () => {
  const {
    currentTimeMin,
    setCurrentTime,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setSpeed,
    closureAirport,
    appliedRecoveryId,
    applyRecovery,
    recoveryOptions
  } = useSimulationStore();

  const minTime = 360;  // 06:00
  const maxTime = 960;  // 16:00 (10 hours span matching screenshot)
  const totalSpan = maxTime - minTime;

  const hours = [
    { label: '06:00', min: 360 },
    { label: '07:00', min: 420 },
    { label: '08:00', min: 480 },
    { label: '09:00', min: 540 },
    { label: '10:00', min: 600 },
    { label: '11:00', min: 660 },
    { label: '12:00', min: 720 },
    { label: '13:00', min: 780 },
    { label: '14:00', min: 840 },
    { label: '15:00', min: 900 },
    { label: '16:00', min: 960 }
  ];

  // Playback loop
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const next = currentTimeMin + playbackSpeed;
      if (next >= maxTime) {
        togglePlay();
        setCurrentTime(minTime);
      } else {
        setCurrentTime(next);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentTimeMin, setCurrentTime, togglePlay]);

  const currentPct = Math.max(0, Math.min(100, ((currentTimeMin - minTime) / totalSpan) * 100));

  return (
    <div className="h-24 bg-transparent px-8 flex items-center justify-between select-none font-mono-numbers relative z-30">
      {/* Left: Play/Pause & Speed */}
      <div className="flex items-center space-x-3 pr-4">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-[#10141D] hover:bg-[#1A2230] border border-zinc-700 text-white flex items-center justify-center transition shadow-lg active:scale-95"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>

        {/* Speed Selector */}
        <select
          value={playbackSpeed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="bg-transparent text-xs text-zinc-300 font-semibold focus:outline-none cursor-pointer pr-1"
        >
          <option value={1} className="bg-[#10141D]">1x</option>
          <option value={5} className="bg-[#10141D]">5x</option>
          <option value={10} className="bg-[#10141D]">10x</option>
          <option value={30} className="bg-[#10141D]">30x</option>
        </select>
      </div>

      {/* Center: Track with Floating Milestone Events */}
      <div className="flex-1 relative flex flex-col justify-center px-4">
        {/* Floating Milestones Above Track */}
        <div className="relative h-10 w-full mb-1">
          {/* Milestone 1: 08:00 BOM Closed */}
          <div
            style={{ left: `${((480 - minTime) / totalSpan) * 100}%` }}
            onClick={() => setCurrentTime(480)}
            className="absolute -top-1 transform -translate-x-1/2 cursor-pointer group z-10"
          >
            <div className="px-2.5 py-1 rounded-lg bg-[#3F1115] border border-[#7A1D24] text-rose-300 text-[10px] flex items-center space-x-1.5 shadow-lg whitespace-nowrap group-hover:scale-105 transition">
              <Zap className="w-3 h-3 text-rose-400 fill-current" />
              <span className="font-semibold">{closureAirport || 'BOM'} Closed</span>
              <span className="text-[9px] text-rose-400/80">08:00 – 09:30</span>
            </div>
            <div className="w-[1px] h-3 bg-rose-500 mx-auto" />
          </div>

          {/* Milestone 2: 09:50 Cascade Begins */}
          <div
            style={{ left: `${((590 - minTime) / totalSpan) * 100}%` }}
            onClick={() => setCurrentTime(590)}
            className="absolute top-2 transform -translate-x-1/2 cursor-pointer group text-center z-10"
          >
            <div className="flex items-center space-x-1 text-[10px] text-zinc-300 whitespace-nowrap group-hover:text-white transition">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="font-medium">Cascade Begins</span>
            </div>
            <div className="text-[9px] text-zinc-500">09:50</div>
          </div>

          {/* Milestone 3: 12:15 Peak Impact */}
          <div
            style={{ left: `${((735 - minTime) / totalSpan) * 100}%` }}
            onClick={() => setCurrentTime(735)}
            className="absolute top-2 transform -translate-x-1/2 cursor-pointer group text-center z-10"
          >
            <div className="flex items-center space-x-1 text-[10px] text-zinc-300 whitespace-nowrap group-hover:text-white transition">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="font-medium">Peak Impact</span>
            </div>
            <div className="text-[9px] text-zinc-500">12:15</div>
          </div>

          {/* Milestone 4: 14:10 Recovery Applied */}
          <div
            style={{ left: `${((850 - minTime) / totalSpan) * 100}%` }}
            onClick={() => {
              setCurrentTime(850);
              if (recoveryOptions.length > 0 && !appliedRecoveryId) {
                applyRecovery(recoveryOptions[0].id);
              }
            }}
            className="absolute top-2 transform -translate-x-1/2 cursor-pointer group text-center z-10"
          >
            <div className="flex items-center space-x-1 text-[10px] text-emerald-300 whitespace-nowrap group-hover:text-emerald-200 transition">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-medium">Recovery Applied</span>
            </div>
            <div className="text-[9px] text-zinc-500">14:10</div>
          </div>
        </div>

        {/* The Track Slider */}
        <div className="relative h-1.5 bg-[#18202C] rounded-full w-full flex items-center">
          {/* Cyan active fill */}
          <div
            style={{ width: `${currentPct}%` }}
            className="absolute top-0 bottom-0 left-0 bg-cyan-400 rounded-full"
          />

          {/* Scrubber thumb handle */}
          <div
            style={{ left: `${currentPct}%` }}
            className="absolute w-3.5 h-3.5 rounded-full bg-white border border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] -ml-1.5 cursor-pointer z-20"
          />

          {/* Native range input for dragging */}
          <input
            type="range"
            min={minTime}
            max={maxTime}
            value={currentTimeMin}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-30"
          />
        </div>

        {/* Hour Timestamps underneath */}
        <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1.5 font-mono-numbers">
          {hours.map((h) => (
            <span key={h.label} className="cursor-pointer hover:text-zinc-300" onClick={() => setCurrentTime(h.min)}>
              {h.label}
            </span>
          ))}
        </div>
      </div>

      {/* Right: Expand Fullscreen */}
      <div className="pl-4">
        <button
          onClick={() => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
          }}
          className="text-zinc-500 hover:text-white transition p-1"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

