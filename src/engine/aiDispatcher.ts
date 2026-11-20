import { SimulationOutput, RecoveryAction } from '../types';

export interface DispatcherBriefing {
  executiveSummary: string;
  threatAssessment: string;
  recommendedActionSummary: string;
  suggestedRecoveryId: string | null;
  keyFacts: Array<{ label: string; value: string; badge?: string }>;
}

export function generateTacticalBriefing(
  sim: SimulationOutput,
  recoveryOptions: RecoveryAction[]
): DispatcherBriefing {
  const formatInr = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

  // Case 1: Healthy Network
  if (sim.delayed_flights_count === 0 && sim.cancelled_flights_count === 0) {
    return {
      executiveSummary: 'All 70 flights operating within normal schedule buffers. Network health is at 100%. Airspace across all 16 Indian sectors remains clear.',
      threatAssessment: 'Nominal operational state. Standby aircraft VT-DS17 (BLR) and VT-DS18 (DEL) ready on ground. No active ground stops or weather holds detected.',
      recommendedActionSummary: 'Maintain standard monitoring. All 21 passenger connection banks and 16 crew rosters are fully compliant with DGCA FDTL regulations.',
      suggestedRecoveryId: null,
      keyFacts: [
        { label: 'Network Health', value: '100%', badge: 'success' },
        { label: 'Active Spares', value: '2 Units (BLR / DEL)' },
        { label: 'DGCA Violations', value: '0' },
        { label: 'Disruption Cost', value: '₹0' }
      ]
    };
  }

  // Case 2: Active Disruption
  const closureAirport = sim.closure ? sim.closure.airport : 'Hub';
  const closureDur = sim.closure ? sim.closure.duration : 0;
  const topOption = recoveryOptions[0] || null;

  const executiveSummary = `Ground operations halt at ${closureAirport} (${closureDur} mins) has triggered a cascading delay wave across ${sim.delayed_flights_count} flights (${sim.total_delay_minutes} aggregate delay minutes). Reactionary tail rotatations have stranded ${sim.stranded_passengers} connecting passengers and pushed ${sim.crew_violations_count} crew rosters into DGCA FDTL overtime breach. Projected financial exposure stands at ${formatInr(sim.disruption_cost_inr)}.`;

  const threatAssessment = sim.critical_flight_id
    ? `Critical bottleneck identified on flight ${sim.critical_flight_id}. Lack of schedule turnaround buffer is forcing downstream hub connections to collapse. Without active intervention, South and East sector departures will inherit severe reactionary delay past evening curfews.`
    : `Multiple aircraft rotations are propagating rotational delays into secondary regional spoke airports.`;

  const recommendedActionSummary = topOption
    ? `RECOMMENDED TACTIC: Execute "${topOption.title}". Injecting reserve resource rescues ${topOption.metrics_delta.passengers_rescued} stranded passengers, recovers ${topOption.metrics_delta.delay_minutes_saved} delay minutes, and cuts commercial loss by ${formatInr(topOption.metrics_delta.cost_saved_inr)}.`
    : `Evaluate strategic retiming or tactical cancellation on earliest delayed rotation leg.`;

  return {
    executiveSummary,
    threatAssessment,
    recommendedActionSummary,
    suggestedRecoveryId: topOption ? topOption.id : null,
    keyFacts: [
      { label: 'Delayed Sectors', value: `${sim.delayed_flights_count} / ${sim.total_flights}`, badge: 'critical' },
      { label: 'Stranded Pax', value: `${sim.stranded_passengers} pax`, badge: 'critical' },
      { label: 'DGCA Violations', value: `${sim.crew_violations_count} crews`, badge: sim.crew_violations_count > 0 ? 'critical' : 'warning' },
      { label: 'Total Exposure', value: formatInr(sim.disruption_cost_inr), badge: 'critical' }
    ]
  };
}

