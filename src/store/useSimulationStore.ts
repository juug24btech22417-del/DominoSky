import { create } from 'zustand';
import {
  SimulationOutput,
  RecoveryAction
} from '../types';
import { runSimulation, SimulationParams, toMinutes } from '../engine/simulator';
import { evaluateRecoveryOptions } from '../engine/recovery';
import { generateTacticalBriefing, DispatcherBriefing } from '../engine/aiDispatcher';

interface SimulationState {
  // Navigation Tab matching the new UI: 'operations' | 'network' | 'recovery' | 'insights'
  activeNavTab: 'operations' | 'network' | 'recovery' | 'insights';
  setActiveNavTab: (tab: 'operations' | 'network' | 'recovery' | 'insights') => void;

  // MiniDock / Side Dock State
  activeDockItem: 'operations' | 'network' | 'gantt' | 'weather' | 'recovery' | 'settings';
  setActiveDockItem: (item: 'operations' | 'network' | 'gantt' | 'weather' | 'recovery' | 'settings') => void;

  // Modals & Overlays
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isWeatherOverlayActive: boolean;
  setIsWeatherOverlayActive: (active: boolean) => void;

  // Scenario Config
  closureAirport: string | null;
  closureStartStr: string;
  closureDuration: number;
  disruptionReason: string;
  appliedRecoveryId: string | null;
  activeOverrides: SimulationParams['overrideModifications'];

  // Simulation Outputs
  baselineOutput: SimulationOutput;
  activeOutput: SimulationOutput;
  recoveryOptions: RecoveryAction[];
  briefing: DispatcherBriefing;

  // Visual / Selection State
  selectedFlightId: string | null;
  selectedAirportId: string | null;
  viewMode: '3d' | '2d';
  activeTab: 'intelligence' | 'domino_dna' | 'recovery_lab';

  // Time Machine Playback
  currentTimeMin: number; // 480 = 08:00
  isPlaying: boolean;
  playbackSpeed: number;

  // Judge Presentation Mode
  isJudgeTourRunning: boolean;
  tourStep: number;

  // Actions
  setClosure: (airport: string | null, startStr: string, duration: number, reason?: string) => void;
  applyPreset: (preset: 'mumbai_storm' | 'delhi_fog' | 'blr_halt' | 'clear') => void;
  applyRecovery: (actionId: string | null) => void;
  resetAll: () => void;
  selectFlight: (flightId: string | null) => void;
  selectAirport: (airportId: string | null) => void;
  setViewMode: (mode: '3d' | '2d') => void;
  setActiveTab: (tab: 'intelligence' | 'domino_dna' | 'recovery_lab') => void;
  setCurrentTime: (timeMin: number) => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  startJudgeTour: () => void;
  stopJudgeTour: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => {
  // Start by default with Mumbai storm 90m scenario matching the user's screenshot!
  const defaultParams: SimulationParams = {
    closureAirport: 'BOM',
    closureStartStr: '08:00',
    closureDurationMinutes: 90
  };

  const initialSim = runSimulation(defaultParams);
  const initialRecoveries = evaluateRecoveryOptions(defaultParams, initialSim);
  const initialBriefing = generateTacticalBriefing(initialSim, initialRecoveries);

  return {
    activeNavTab: 'operations',
    setActiveNavTab: (tab) => set({ activeNavTab: tab }),

    activeDockItem: 'operations',
    setActiveDockItem: (item) => {
      set({ activeDockItem: item });
      if (item === 'operations') set({ activeNavTab: 'operations' });
      else if (item === 'network') set({ activeNavTab: 'network' });
      else if (item === 'recovery') set({ activeNavTab: 'recovery' });
      else if (item === 'settings') set({ isSettingsOpen: true });
      else if (item === 'weather') set({ isWeatherOverlayActive: true });
    },

    isSettingsOpen: false,
    setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),

    isWeatherOverlayActive: false,
    setIsWeatherOverlayActive: (active) => set({ isWeatherOverlayActive: active }),

    closureAirport: 'BOM',
    closureStartStr: '08:00',
    closureDuration: 90,
    disruptionReason: 'Thunderstorm',
    appliedRecoveryId: null,
    activeOverrides: {},

    baselineOutput: initialSim,
    activeOutput: initialSim,
    recoveryOptions: initialRecoveries,
    briefing: initialBriefing,

    selectedFlightId: 'DS0103', // default selected flight matching the screenshot!
    selectedAirportId: 'BOM',
    viewMode: '3d',
    activeTab: 'intelligence',

    currentTimeMin: 480, // 08:00 AM
    isPlaying: false,
    playbackSpeed: 10,

    isJudgeTourRunning: false,
    tourStep: 0,

    setClosure: (airport, startStr, duration, reason = 'Thunderstorm') => {
      const baseParams: SimulationParams = {
        closureAirport: airport,
        closureStartStr: startStr,
        closureDurationMinutes: duration
      };

      const baseline = runSimulation(baseParams);
      const recoveries = evaluateRecoveryOptions(baseParams, baseline);
      const briefing = generateTacticalBriefing(baseline, recoveries);

      // Select first delayed flight if available
      const firstDelayed = Object.values(baseline.flights).find(f => f.dep_delay > 0)?.flight_id || 'DS0103';

      set({
        closureAirport: airport,
        closureStartStr: startStr,
        closureDuration: duration,
        disruptionReason: reason,
        appliedRecoveryId: null,
        activeOverrides: {},
        baselineOutput: baseline,
        activeOutput: baseline,
        recoveryOptions: recoveries,
        briefing: briefing,
        currentTimeMin: airport ? toMinutes(startStr) : get().currentTimeMin,
        selectedFlightId: firstDelayed
      });
    },

    applyPreset: (preset) => {
      if (preset === 'mumbai_storm') {
        get().setClosure('BOM', '08:00', 90, 'Thunderstorm');
      } else if (preset === 'delhi_fog') {
        get().setClosure('DEL', '06:00', 120, 'Dense Fog');
      } else if (preset === 'blr_halt') {
        get().setClosure('BLR', '11:00', 60, 'Runway Maintenance');
      } else {
        get().setClosure(null, '08:00', 0, 'Clear Weather');
      }
    },

    applyRecovery: (actionId) => {
      const state = get();
      if (!actionId) {
        set({
          appliedRecoveryId: null,
          activeOverrides: {},
          activeOutput: state.baselineOutput,
          briefing: generateTacticalBriefing(state.baselineOutput, state.recoveryOptions)
        });
        return;
      }

      const action = state.recoveryOptions.find(r => r.id === actionId);
      if (!action) return;

      let newOverrides: SimulationParams['overrideModifications'] = {};
      if (action.type === 'spare_swap') {
        const spareTail = action.target_airport === 'BLR' ? 'VT-DS17' : 'VT-DS18';
        newOverrides = {
          spareAircraftSwaps: [
            { targetFlightId: action.target_flight_id, spareTailId: spareTail }
          ]
        };
      } else if (action.type === 'strategic_cancel') {
        newOverrides = {
          cancelledFlightIds: [action.target_flight_id]
        };
      }

      const activeParams: SimulationParams = {
        closureAirport: state.closureAirport,
        closureStartStr: state.closureStartStr,
        closureDurationMinutes: state.closureDuration,
        overrideModifications: newOverrides
      };

      const recoveredOutput = runSimulation(activeParams);
      const updatedBriefing = generateTacticalBriefing(recoveredOutput, state.recoveryOptions);

      set({
        appliedRecoveryId: actionId,
        activeOverrides: newOverrides,
        activeOutput: recoveredOutput,
        briefing: updatedBriefing
      });
    },

    resetAll: () => {
      get().setClosure(null, '08:00', 0, 'Nominal');
      set({
        selectedFlightId: null,
        selectedAirportId: null,
        currentTimeMin: 480,
        isPlaying: false,
        isJudgeTourRunning: false
      });
    },

    selectFlight: (flightId) => {
      set({
        selectedFlightId: flightId,
        activeTab: flightId ? 'domino_dna' : get().activeTab
      });
    },

    selectAirport: (airportId) => set({ selectedAirportId: airportId }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setCurrentTime: (timeMin) => set({ currentTimeMin: timeMin }),
    togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),
    setSpeed: (speed) => set({ playbackSpeed: speed }),

    startJudgeTour: () => set({ isJudgeTourRunning: true, tourStep: 1 }),
    stopJudgeTour: () => set({ isJudgeTourRunning: false, tourStep: 0 })
  };
});
