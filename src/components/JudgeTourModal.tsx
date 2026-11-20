import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  X,
  Play
} from 'lucide-react';

export const JudgeTourModal: React.FC = () => {
  const {
    isJudgeTourRunning,
    stopJudgeTour,
    applyPreset,
    selectFlight,
    setActiveTab,
    applyRecovery,
    recoveryOptions,
    setCurrentTime
  } = useSimulationStore();

  const [step, setStep] = React.useState(1);

  if (!isJudgeTourRunning) return null;

  const steps = [
    {
      title: '01 / Nominal Airspace Baseline',
      subtitle: 'All 70 flights operating on schedule',
      text: 'Notice the live network state: 16 hubs, 16 aircraft tail chains, and 21 passenger connections. Network health is 100%, and standby aircraft VT-DS17 (BLR) and VT-DS18 (DEL) are ready on ground.',
      actionName: 'Set Clear Baseline',
      onRun: () => {
        applyPreset('clear');
        setCurrentTime(480); // 08:00
      }
    },
    {
      title: '02 / The Shock: Mumbai Thunderstorm',
      subtitle: '90-minute full ground stop at BOM',
      text: 'A thunderstorm closes Mumbai International (BOM) for 90 minutes. Watch the red weather radar cell pulse over Mumbai as departing flights are pinned to the ground.',
      actionName: 'Trigger Mumbai Storm',
      onRun: () => {
        applyPreset('mumbai_storm');
        setCurrentTime(540); // 09:00
      }
    },
    {
      title: '03 / The Domino Cascade Across India',
      subtitle: 'Delay ripples into cities with clear skies',
      text: 'Even though Bengaluru, Hyderabad, and Kolkata have clear weather, aircraft tails arriving late from Mumbai push subsequent flights into delay. Passenger connections break, and pilots reach DGCA duty caps.',
      actionName: 'Advance Simulation Clock',
      onRun: () => {
        setCurrentTime(780); // 13:00
      }
    },
    {
      title: '04 / Domino DNA: Causal Root-Cause',
      subtitle: 'Why is a flight delayed 5 hours later?',
      text: 'Look at the DOMINO DNA inspector. It exposes the exact mathematical chain: Origin ground stop ➔ Inbound arrival delay ➔ Turnaround buffer depleted ➔ Missed passenger connection ➔ Crew FDTL violation.',
      actionName: 'Inspect Flight DS0502',
      onRun: () => {
        selectFlight('DS0502');
        setActiveTab('domino_dna');
      }
    },
    {
      title: '05 / AI Dispatcher: The Solution',
      subtitle: 'Execute optimal spare aircraft swap',
      text: 'The AI Dispatcher evaluates all feasible interventions and recommends injecting spare VT-DS17 at Bengaluru. Watch the delay vanish, 100+ passengers rescued, and ₹1+ Crore saved!',
      actionName: 'Execute Recovery Plan',
      onRun: () => {
        setActiveTab('recovery_lab');
        if (recoveryOptions.length > 0) {
          applyRecovery(recoveryOptions[0].id);
        }
      }
    }
  ];

  const currentStepData = steps[step - 1];

  const handleNext = () => {
    if (step < steps.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      steps[nextStep - 1].onRun();
    } else {
      stopJudgeTour();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      steps[prevStep - 1].onRun();
    }
  };

  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl select-none px-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-4 text-xs font-mono-numbers space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center space-x-2 text-zinc-100">
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            <span className="font-semibold tracking-wider">JUDGE DEMONSTRATION TOUR</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">STEP {step} OF {steps.length}</span>
            <button
              onClick={stopJudgeTour}
              className="text-zinc-500 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="font-semibold text-sm text-zinc-100">{currentStepData.title}</div>
          <div className="text-[11px] text-zinc-400 font-medium">{currentStepData.subtitle}</div>
          <p className="text-zinc-300 text-xs font-sans leading-relaxed pt-1">
            {currentStepData.text}
          </p>
        </div>

        {/* Action & Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-3 py-1.5 rounded flex items-center space-x-1 transition ${
              step === 1
                ? 'opacity-40 cursor-not-allowed text-zinc-600'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>PREV</span>
          </button>

          <button
            onClick={currentStepData.onRun}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold flex items-center space-x-1.5 transition"
          >
            <Play className="w-3 h-3 fill-current text-amber-400" />
            <span>RUN: {currentStepData.actionName}</span>
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded bg-white text-black font-semibold flex items-center space-x-1 hover:bg-zinc-200 transition"
          >
            <span>{step === steps.length ? 'FINISH' : 'NEXT'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
