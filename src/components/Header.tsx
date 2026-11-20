import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { toHHMM } from '../engine/simulator';
import {
  Plane,
  Bell,
  User,
  Zap,
  RotateCcw,
  ShieldAlert,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentTimeMin,
    closureAirport,
    resetAll,
    startJudgeTour,
    isJudgeTourRunning,
    activeOutput,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isProfileOpen,
    setIsProfileOpen,
    setActiveScheduleTab
  } = useSimulationStore();

  return (
    <header
      role="banner"
      aria-label="Global Operations Header"
      className="h-12 bg-black border-b border-surface-border px-4 flex items-center justify-between select-none z-30 relative"
    >
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
            <Plane className="w-4 h-4 transform -rotate-45" aria-hidden="true" />
          </div>
          <div className="flex items-baseline space-x-1.5 font-mono-numbers">
            <h1 className="font-bold text-sm tracking-wider text-white">DOMINO</h1>
            <span className="text-zinc-400 text-xs font-medium tracking-widest">/ SKY</span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-surface-border hidden md:block" aria-hidden="true" />

        <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono-numbers text-zinc-400">
          <span className="text-zinc-300 font-medium">OPERATIONS CONTROL CENTER</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">GLOBAL FLIGHT DIRECTOR</span>
        </div>
      </div>

      {/* Center: Large Operational Clock */}
      <div className="flex items-center space-x-3" role="status" aria-label="Current Operational Clock">
        <div className="px-3 py-1 rounded bg-zinc-950 border border-zinc-800 text-center">
          <div className="text-xs font-semibold text-zinc-100 tracking-wider font-mono-numbers">
            {toHHMM(currentTimeMin)}:00 IST <span className="text-zinc-400 text-[10px]">| 20 NOV 2026</span>
          </div>
        </div>

        {closureAirport && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px] font-mono-numbers"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
            <span className="font-semibold">{closureAirport} GROUND STOP ACTIVE</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Notifications, Profile & Judge Tour */}
      <div className="flex items-center space-x-2.5 relative">
        {/* Reset */}
        <button
          onClick={resetAll}
          aria-label="Reset all disruptions to clean baseline"
          title="Reset to clean baseline"
          className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            aria-label={`Flight alerts: ${activeOutput.delayed_flights_count} active delays`}
            aria-expanded={isNotificationsOpen}
            aria-haspopup="dialog"
            title="Operational Alerts"
            className="p-1.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
          >
            <Bell className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          {activeOutput.delayed_flights_count > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
          )}

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div
              role="region"
              aria-label="Active Flight Alerts Panel"
              className="absolute right-0 top-9 w-80 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-3 z-50 text-xs font-mono-numbers space-y-2.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="font-bold text-zinc-200">ACTIVE FLIGHT ALERTS</span>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  aria-label="Close alerts panel"
                  className="text-zinc-400 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {activeOutput.delayed_flights_count > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto" role="list">
                  {Object.values(activeOutput.flights)
                    .filter(f => f.dep_delay > 0)
                    .slice(0, 5)
                    .map(f => (
                      <div
                        key={f.flight_id}
                        role="listitem"
                        tabIndex={0}
                        onClick={() => {
                          setActiveScheduleTab('recovery');
                          setIsNotificationsOpen(false);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setActiveScheduleTab('recovery');
                            setIsNotificationsOpen(false);
                          }
                        }}
                        className="p-2 rounded bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
                      >
                        <div className="flex items-center justify-between font-bold text-zinc-200">
                          <span>{f.flight_id} ({f.origin} → {f.destination})</span>
                          <span className="text-rose-400">+{f.dep_delay} min</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Tail: {f.tail_id} • Pax: {f.pax}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-zinc-400 text-center py-4">No active flight alerts. Nominal flow.</div>
              )}
            </div>
          )}
        </div>

        {/* User / Dispatcher Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            aria-label="Dispatcher Profile Capt. Sharma"
            aria-expanded={isProfileOpen}
            aria-haspopup="dialog"
            className="flex items-center space-x-2 pl-2 border-l border-zinc-800 text-xs font-mono-numbers cursor-pointer hover:opacity-80 transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
          >
            <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <User className="w-3 h-3" aria-hidden="true" />
            </div>
            <span className="text-zinc-300 hidden sm:inline text-[11px]">CAPT. SHARMA</span>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div
              role="region"
              aria-label="Dispatcher Profile Details"
              className="absolute right-0 top-9 w-64 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-3 z-50 text-xs font-mono-numbers space-y-2"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="font-bold text-zinc-200">DISPATCHER PROFILE</span>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  aria-label="Close profile panel"
                  className="text-zinc-400 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="text-[11px] text-zinc-300 space-y-1">
                <div><span className="text-zinc-400">ID:</span> DS-OCC-9481</div>
                <div><span className="text-zinc-400">Role:</span> Lead Network Dispatcher</div>
                <div><span className="text-zinc-400">Duty Shift:</span> 06:00 – 14:00 IST</div>
                <div><span className="text-zinc-400">Authorization:</span> DGCA Level 4 Dispatch</div>
              </div>
            </div>
          )}
        </div>

        {/* Judge Tour Button */}
        <button
          onClick={startJudgeTour}
          aria-label="Start interactive judge demonstration tour"
          className={`px-3 py-1.5 rounded text-xs font-mono-numbers flex items-center space-x-1.5 transition font-medium border focus-visible:ring-2 focus-visible:ring-amber-400 outline-none ${
            isJudgeTourRunning
              ? 'bg-amber-500 text-black border-amber-400 font-bold'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-100 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" aria-hidden="true" />
          <span>JUDGE TOUR</span>
        </button>
      </div>
    </header>
  );
};
