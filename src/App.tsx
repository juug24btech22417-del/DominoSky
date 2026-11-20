import React from 'react';
import { Header } from './components/Header';
import { KpiStrip } from './components/KpiStrip';
import { MiniDock } from './components/MiniDock';
import { FleetAndAlerts } from './components/FleetAndAlerts';
import { AirspaceView } from './components/globe/AirspaceView';
import { FlightScheduleAndRecovery } from './components/FlightScheduleAndRecovery';
import { GanttTimeline } from './components/GanttTimeline';
import { JudgeTourModal } from './components/JudgeTourModal';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-gray-100 font-sans">
      {/* 1. Global Navigation Header */}
      <Header />

      {/* 2. Real-time KPI Statistics Strip */}
      <KpiStrip />

      {/* 3. Main Operational Command Center */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Mini Dock */}
        <MiniDock />

        {/* Fleet Availability Donut Charts & Disruption Console */}
        <FleetAndAlerts />

        {/* Center: Real-Time Airspace Monitor (Photorealistic Dark Satellite Map) */}
        <AirspaceView />

        {/* Right: Live Flight Schedule Table & AI Dispatcher Recovery Matrix */}
        <FlightScheduleAndRecovery />
      </div>

      {/* 4. Bottom: Timeline & Resource Allocation Gantt Chart */}
      <GanttTimeline />

      {/* 5. Floating Interactive Tour for Judges */}
      <JudgeTourModal />
    </div>
  );
};

export default App;
