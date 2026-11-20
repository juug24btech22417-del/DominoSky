import React from 'react';
import { useSimulationStore } from './store/useSimulationStore';
import { Header } from './components/Header';
import { KpiStrip } from './components/KpiStrip';
import { MiniDock } from './components/MiniDock';
import { FleetAndAlerts } from './components/FleetAndAlerts';
import { AirspaceView } from './components/globe/AirspaceView';
import { FlightScheduleAndRecovery } from './components/FlightScheduleAndRecovery';
import { GanttTimeline } from './components/GanttTimeline';
import { JudgeTourModal } from './components/JudgeTourModal';
import { WeatherModal } from './components/WeatherModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const {
    activeDockView,
    setActiveDockView,
    isWeatherOpen,
    isSettingsOpen
  } = useSimulationStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-gray-100 font-sans select-none">
      {/* 1. Global Navigation Header */}
      <Header />

      {/* 2. Real-time KPI Statistics Strip */}
      <section aria-label="Key Performance Indicators">
        <KpiStrip />
      </section>

      {/* 3. Main Operational Command Center */}
      <main id="main-content" tabIndex={-1} role="main" aria-label="Aviation Operations Command Center" className="flex-1 flex overflow-hidden relative">
        {/* Left Mini Dock */}
        <nav aria-label="Operations Side Dock">
          <MiniDock />
        </nav>

        {/* Normal Dashboard Layout */}
        {activeDockView === 'dashboard' && (
          <>
            {/* Fleet Availability Donut Charts & Disruption Console */}
            <section aria-label="Fleet Status and Disruption Controls" className="h-full">
              <FleetAndAlerts />
            </section>

            {/* Center: Real-Time Airspace Monitor (Photorealistic Dark Satellite Map) */}
            <section aria-label="Live Airspace Satellite Radar" className="flex-1 relative h-full">
              <AirspaceView />
            </section>

            {/* Right: Live Flight Schedule Table & AI Dispatcher Recovery Matrix */}
            <aside aria-label="Flight Schedule and AI Recovery" className="h-full">
              <FlightScheduleAndRecovery />
            </aside>
          </>
        )}

        {/* Focused Airspace Radar View */}
        {activeDockView === 'airspace' && (
          <div className="flex-1 relative flex overflow-hidden">
            <section aria-label="Expanded Airspace Radar" className="flex-1 relative h-full">
              <AirspaceView />
            </section>
            <aside aria-label="Flight Schedule" className="h-full">
              <FlightScheduleAndRecovery />
            </aside>
          </div>
        )}

        {/* Fullscreen Fleet Rotations Gantt */}
        {activeDockView === 'gantt' && (
          <section aria-label="Fullscreen Fleet Rotations Gantt Timeline" className="flex-1 flex flex-col overflow-hidden bg-black p-3">
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-900 rounded-t-lg text-xs font-mono-numbers">
              <h2 className="font-bold text-zinc-200">
                FULLSCREEN FLEET ROTATIONS GANTT TIMELINE // ALL 16 AIRCRAFT TAILS
              </h2>
              <button
                onClick={() => setActiveDockView('dashboard')}
                aria-label="Exit fullscreen gantt timeline"
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
              >
                Close Fullscreen
              </button>
            </div>
            <div className="flex-1 border border-zinc-900 border-t-0 rounded-b-lg overflow-hidden">
              <GanttTimeline />
            </div>
          </section>
        )}
      </main>

      {/* 4. Bottom: Timeline & Resource Allocation Gantt Chart */}
      {activeDockView !== 'gantt' && (
        <section aria-label="24-Hour Fleet Timeline and Playback Controls">
          <GanttTimeline />
        </section>
      )}

      {/* 5. Modals & Overlays */}
      <JudgeTourModal />
      {isWeatherOpen && <WeatherModal />}
      {isSettingsOpen && <SettingsModal />}
    </div>
  );
};

export default App;
