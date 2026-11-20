import React, { useEffect } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { toHHMM } from '../engine/simulator';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Plane
} from 'lucide-react';

export const TimelineBar: React.FC = () => {
  const {
    currentTimeMin,
    setCurrentTime,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setSpeed,
    activeOutput
  } = useSimulationStore();

  const minTime = 300; // 05:00
  const maxTime = 1439; // 23:59

  // Active airborne flights right now
  const airborneFlights = Object.values(activeOutput.flights).filter(
    f => !f.is_cancelled && currentTimeMin >= f.actual_dep_min && currentTimeMin <= f.actual_arr_min
  );

  // Auto-advance loop when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextTime = currentTimeMin + playbackSpeed;
      if (nextTime >= maxTime) {
        togglePlay();
        setCurrentTime(minTime);
      } else {
        setCurrentTime(nextTime);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentTimeMin, setCurrentTime, togglePlay]);

  return (
    <div className="h-14 bg-surface border-t border-surface-border px-4 flex items-center justify-between z-20 select-none text-xs font-mono-numbers">
      {/* Left: Playback Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-cyan flex items-center justify-center transition active:scale-95"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => setCurrentTime(minTime)}
          title="Restart from 05:00"
          className="p-2 rounded bg-surface-subtle hover:bg-surface-hover border border-surface-border text-gray-400 hover:text-gray-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Speed Buttons */}
        <div className="flex items-center bg-surface-subtle rounded border border-surface-border p-0.5">
          {[1, 5, 15, 60].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                playbackSpeed === s
                  ? 'bg-sky-500/20 text-sky-cyan border border-sky-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Center: Scrubbable Timeline Track */}
      <div className="flex-1 max-w-2xl mx-6 flex flex-col justify-center">
        <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
          <span>05:00 IST</span>
          <div className="flex items-center space-x-2 text-sky-cyan font-bold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>SIMULATION TIME: {toHHMM(currentTimeMin)} IST</span>
          </div>
          <span>23:59 IST</span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={minTime}
            max={maxTime}
            value={currentTimeMin}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer h-1.5 bg-surface-subtle rounded"
          />

          {/* Closure Interval Pip */}
          {activeOutput.closure && (
            <div
              style={{
                left: `${((activeOutput.closure.start_min - minTime) / (maxTime - minTime)) * 100}%`,
                width: `${(activeOutput.closure.duration / (maxTime - minTime)) * 100}%`
              }}
              className="absolute h-2 bg-rose-500/40 border border-rose-500/60 rounded pointer-events-none -top-0.5"
            />
          )}
        </div>
      </div>

      {/* Right: Airborne Status Indicator */}
      <div className="flex items-center space-x-3 pr-2">
        <div className="flex items-center space-x-2 px-3 py-1 rounded bg-surface-subtle border border-surface-border text-xs">
          <Plane className="w-3.5 h-3.5 text-sky-cyan" />
          <span className="text-gray-400">ACTIVE AIRBORNE:</span>
          <span className="font-bold text-gray-100">{airborneFlights.length} SECTORS</span>
        </div>
      </div>
    </div>
  );
};
