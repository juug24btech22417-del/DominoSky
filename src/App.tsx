import React from 'react';
import { useSimulationStore } from './store/useSimulationStore';
import { Header } from './components/Header';
import { KpiStrip } from './components/KpiStrip';
import { MiniDock } from './components/MiniDock';
import { SimulateDisruptionPanel } from './components/SimulateDisruptionPanel';
import { NightGlobeView } from './components/globe/NightGlobeView';
import { FlightInspectorCard } from './components/FlightInspectorCard';
import { MilestoneTimeline } from './components/MilestoneTimeline';
import { NetworkView } from './components/views/NetworkView';
import { RecoveryView } from './components/views/RecoveryView';
import { InsightsView } from './components/views/InsightsView';
import { JudgeTourModal } from './components/JudgeTourModal';
import { SettingsModal } from './components/SettingsModal';
import { WeatherModal } from './components/WeatherModal';

export const App: React.FC = () => {
  const { activeNavTab } = useSimulationStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-gray-100 font-sans select-none">
      {/* 1. Global Navigation Header */}
      <Header />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Icon Dock */}
        <MiniDock />

        {/* Dynamic View Switcher */}
        {activeNavTab === 'operations' && (
          <div className="flex-1 flex flex-col overflow-hidden relative bg-black">
            {/* Real-time KPI Statistics Strip matching screenshot */}
            <KpiStrip />

            {/* Center Command Area: Left Disruption Panel + Center Globe + Right Flight Card */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Left: Disruption Simulator Panel */}
              <div className="absolute left-0 top-0 bottom-0 z-20 pointer-events-auto">
                <SimulateDisruptionPanel />
              </div>

              {/* Center: High-Fidelity 3D Night Globe View (India Prominent) */}
              <div className="absolute inset-0 z-10">
                <NightGlobeView />
              </div>

              {/* Right: Flight Inspector Card */}
              <div className="absolute right-6 top-4 z-20 pointer-events-auto">
                <FlightInspectorCard />
              </div>
            </div>

            {/* Bottom: Milestone Playback Timeline */}
            <div className="border-t border-[#1A2230] bg-[#0A0D14]/90 backdrop-blur-md">
              <MilestoneTimeline />
            </div>
          </div>
        )}

        {/* View 2: Network Operations & Airspace Radar */}
        {activeNavTab === 'network' && <NetworkView />}

        {/* View 3: AI Dispatcher Recovery & 24h Rotation Gantt */}
        {activeNavTab === 'recovery' && <RecoveryView />}

        {/* View 4: Domino DNA & Executive Insights */}
        {activeNavTab === 'insights' && <InsightsView />}
      </div>

      {/* 3. Global Interactive Modals */}
      <JudgeTourModal />
      <SettingsModal />
      <WeatherModal />
    </div>
  );
};

export default App;
