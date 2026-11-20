import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { DATASET, toHHMM } from '../engine/simulator';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export const GanttTimeline: React.FC = () => {
  const {
    currentTimeMin,
    setCurrentTime,
    isPlaying,
    togglePlay,
    playbackSpeed,
    setSpeed,
    activeOutput,
    selectedFlightId,
    selectFlight
  } = useSimulationStore();

  const minDayMin = 360;  // 06:00 AM
  const maxDayMin = 1440; // 24:00 PM
  const totalSpan = maxDayMin - minDayMin; // 1080 mins

  const hours = [
    { label: '06 AM', min: 360 },
    { label: '08 AM', min: 480 },
    { label: '10 AM', min: 600 },
    { label: '12 PM', min: 720 },
    { label: '02 PM', min: 840 },
    { label: '04 PM', min: 960 },
    { label: '06 PM', min: 1080 },
    { label: '08 PM', min: 1200 },
    { label: '10 PM', min: 1320 },
    { label: '24 PM', min: 1440 }
  ];

  // All 16 aircraft tails
  const tailList = Array.from(new Set(DATASET.flights.map(f => f.tail_id)));

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const next = currentTimeMin + playbackSpeed;
      if (next >= maxDayMin) {
        togglePlay();
        setCurrentTime(minDayMin);
      } else {
        setCurrentTime(next);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentTimeMin, setCurrentTime, togglePlay]);

  return (
    <div className="h-44 bg-black border-t border-surface-border flex flex-col select-none text-xs font-mono-numbers">
      {/* Timeline Header Bar */}
      <div className="h-8 px-4 border-b border-surface-border flex items-center justify-between bg-zinc-950">
        <div className="flex items-center space-x-3">
          <span className="font-semibold tracking-wider text-[11px] text-zinc-200 uppercase">
            TIMELINE & RESOURCE ALLOCATION
          </span>
          <span className="text-[10px] text-zinc-400">FLEET ROTATIONS GANTT</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-3" role="toolbar" aria-label="Timeline Playback Toolbar">
          <div className="flex items-center space-x-1.5 bg-black px-2 py-0.5 rounded border border-zinc-800">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause simulation time machine' : 'Play simulation time machine'}
              className="p-1 text-zinc-300 hover:text-white transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" /> : <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />}
            </button>
            <button
              onClick={() => setCurrentTime(minDayMin)}
              aria-label="Reset clock to 06:00 AM"
              className="p-1 text-zinc-400 hover:text-white transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
              title="Reset Time to 06:00 AM"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>

          {/* Speed Toggles */}
          <div className="flex items-center bg-black rounded border border-zinc-800 p-0.5 text-[10px]" role="group" aria-label="Playback Speed Multiplier">
            {[1, 5, 15, 60].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                aria-label={`Set playback speed to ${s}x`}
                aria-pressed={playbackSpeed === s}
                className={`px-1.5 py-0.5 rounded transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
                  playbackSpeed === s ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center space-x-1">
            <Clock className="w-3 h-3 text-zinc-400" aria-hidden="true" />
            <span>{toHHMM(currentTimeMin)} IST</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Grid Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Aircraft Tail Column */}
        <div className="w-24 border-r border-surface-border bg-black divide-y divide-zinc-900 text-[10px] text-zinc-400 font-medium overflow-y-auto">
          <div className="h-6 px-2 flex items-center text-[9px] text-zinc-400 uppercase font-semibold">TAIL ID</div>
          {tailList.map(tail => (
            <div key={tail} className="h-7 px-2 flex items-center justify-between text-zinc-300">
              <span>{tail}</span>
            </div>
          ))}
        </div>

        {/* Right: Gantt Bars & Time Grid */}
        <div className="flex-1 relative overflow-x-hidden flex flex-col bg-black">
          {/* Hour markers row */}
          <div className="h-6 border-b border-surface-border relative bg-zinc-950/60">
            {hours.map(h => {
              const leftPct = ((h.min - minDayMin) / totalSpan) * 100;
              return (
                <div
                  key={h.label}
                  style={{ left: `${leftPct}%` }}
                  className="absolute top-0 bottom-0 border-l border-zinc-800 pl-1 text-[9px] text-zinc-400 flex items-center"
                >
                  {h.label}
                </div>
              );
            })}
          </div>

          {/* Aircraft Rotation Rows */}
          <div className="flex-1 relative divide-y divide-zinc-900/60 overflow-y-auto">
            {tailList.map(tail => {
              const flights = Object.values(activeOutput.flights).filter(f => f.tail_id === tail);

              return (
                <div key={tail} className="h-7 relative hover:bg-zinc-900/30 transition">
                  {/* Vertical Hour lines */}
                  {hours.map(h => {
                    const leftPct = ((h.min - minDayMin) / totalSpan) * 100;
                    return (
                      <div
                        key={h.label}
                        style={{ left: `${leftPct}%` }}
                        className="absolute top-0 bottom-0 border-l border-zinc-900/40 pointer-events-none"
                      />
                    );
                  })}

                  {/* Flight Segment Blocks */}
                  {flights.map(f => {
                    const startMin = f.actual_dep_min;
                    const endMin = f.actual_arr_min;
                    const leftPct = Math.max(0, ((startMin - minDayMin) / totalSpan) * 100);
                    const widthPct = Math.max(1.5, ((endMin - startMin) / totalSpan) * 100);

                    const isSelected = selectedFlightId === f.flight_id;
                    let bgColor = 'bg-blue-950/40 border-blue-900/60 text-blue-200';

                    if (f.is_cancelled) {
                      bgColor = 'bg-rose-950/40 border-rose-900/60 text-rose-300 border-dashed';
                    } else if (f.dep_delay >= 60) {
                      bgColor = 'bg-rose-950/50 border-rose-800 text-rose-200';
                    } else if (f.dep_delay > 0) {
                      bgColor = 'bg-amber-950/50 border-amber-800 text-amber-200';
                    }

                    if (isSelected) {
                      bgColor = 'bg-zinc-200 text-black font-bold border-white';
                    }

                    return (
                      <div
                        key={f.flight_id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Flight ${f.flight_id} from ${f.origin} to ${f.destination}, departure ${f.actual_dep}, arrival ${f.actual_arr}, ${f.dep_delay > 0 ? `delayed by ${f.dep_delay} minutes` : 'on time'}`}
                        onClick={() => selectFlight(f.flight_id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') selectFlight(f.flight_id);
                        }}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className={`absolute top-1 bottom-1 rounded-[2px] border px-1 flex items-center justify-between text-[9px] cursor-pointer hover:brightness-125 transition truncate z-10 focus-visible:ring-1 focus-visible:ring-cyan-400 outline-none ${bgColor}`}
                        title={`${f.flight_id} (${f.origin}→${f.destination}) ${f.actual_dep}-${f.actual_arr}`}
                      >
                        <span className="truncate">{f.flight_id}</span>
                        {f.dep_delay > 0 && <span className="text-[8px] font-semibold">+{f.dep_delay}m</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Live Time Scrubber Indicator Line */}
            {currentTimeMin >= minDayMin && currentTimeMin <= maxDayMin && (
              <div
                style={{ left: `${((currentTimeMin - minDayMin) / totalSpan) * 100}%` }}
                className="absolute top-0 bottom-0 w-[2px] bg-amber-400 z-30 pointer-events-none"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 -ml-[3px] -top-1 absolute" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
