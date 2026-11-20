import { SimulationParams, runSimulation } from './simulator';
import { SimulationOutput, RecoveryAction } from '../types';

export function evaluateRecoveryOptions(
  baselineParams: SimulationParams,
  baselineOutput: SimulationOutput
): RecoveryAction[] {
  // If there's no disruption or very low delay, return empty or maintenance standby
  if (baselineOutput.delayed_flights_count === 0 && baselineOutput.stranded_passengers === 0) {
    return [];
  }

  const actions: RecoveryAction[] = [];

  // Option 1: Spare Aircraft Injection at BLR (VT-DS17)
  // Find delayed flights departing from BLR that have a spare available
  const delayedBlrFlights = Object.values(baselineOutput.flights)
    .filter(f => f.origin === 'BLR' && f.dep_delay > 20 && f.leg_order > 1)
    .sort((a, b) => b.dep_delay - a.dep_delay);

  if (delayedBlrFlights.length > 0) {
    const target = delayedBlrFlights[0];
    const candidateParams: SimulationParams = {
      ...baselineParams,
      overrideModifications: {
        ...baselineParams.overrideModifications,
        spareAircraftSwaps: [
          ...(baselineParams.overrideModifications?.spareAircraftSwaps || []),
          { targetFlightId: target.flight_id, spareTailId: 'VT-DS17' }
        ]
      }
    };

    const simAfter = runSimulation(candidateParams);
    const delaySaved = Math.max(0, baselineOutput.total_delay_minutes - simAfter.total_delay_minutes);
    const paxRescued = Math.max(0, baselineOutput.stranded_passengers - simAfter.stranded_passengers);
    const costSaved = Math.max(0, baselineOutput.disruption_cost_inr - simAfter.disruption_cost_inr);
    const crewSaved = Math.max(0, baselineOutput.crew_violations_count - simAfter.crew_violations_count);

    if (delaySaved > 0 || paxRescued > 0 || costSaved > 0) {
      actions.push({
        id: 'rec_spare_blr',
        type: 'spare_swap',
        title: `Inject Spare VT-DS17 at Kempegowda (BLR)`,
        tagline: `Absorb rotational delay for Flight ${target.flight_id} (${target.origin}→${target.destination})`,
        description: `Deploy reserve Airbus A320 (VT-DS17) stationed at Bengaluru hub to take over flight ${target.flight_id}. Decouples downstream South India network from delayed incoming inbound tail.`,
        target_flight_id: target.flight_id,
        target_airport: 'BLR',
        resource_used: 'Standby Aircraft VT-DS17 (BLR Base)',
        metrics_delta: {
          delay_minutes_saved: delaySaved,
          passengers_rescued: paxRescued,
          cost_saved_inr: costSaved,
          crew_violations_prevented: crewSaved
        },
        before_summary: {
          delay_minutes: baselineOutput.total_delay_minutes,
          stranded_pax: baselineOutput.stranded_passengers,
          cost_inr: baselineOutput.disruption_cost_inr,
          crew_violations: baselineOutput.crew_violations_count
        },
        after_summary: {
          delay_minutes: simAfter.total_delay_minutes,
          stranded_pax: simAfter.stranded_passengers,
          cost_inr: simAfter.disruption_cost_inr,
          crew_violations: simAfter.crew_violations_count
        },
        strategy_tag: 'Schedule Integrity'
      });
    }
  }

  // Option 2: Spare Aircraft Injection at DEL (VT-DS18)
  const delayedDelFlights = Object.values(baselineOutput.flights)
    .filter(f => f.origin === 'DEL' && f.dep_delay > 20 && f.leg_order > 1)
    .sort((a, b) => b.dep_delay - a.dep_delay);

  if (delayedDelFlights.length > 0) {
    const target = delayedDelFlights[0];
    const candidateParams: SimulationParams = {
      ...baselineParams,
      overrideModifications: {
        ...baselineParams.overrideModifications,
        spareAircraftSwaps: [
          ...(baselineParams.overrideModifications?.spareAircraftSwaps || []),
          { targetFlightId: target.flight_id, spareTailId: 'VT-DS18' }
        ]
      }
    };

    const simAfter = runSimulation(candidateParams);
    const delaySaved = Math.max(0, baselineOutput.total_delay_minutes - simAfter.total_delay_minutes);
    const paxRescued = Math.max(0, baselineOutput.stranded_passengers - simAfter.stranded_passengers);
    const costSaved = Math.max(0, baselineOutput.disruption_cost_inr - simAfter.disruption_cost_inr);
    const crewSaved = Math.max(0, baselineOutput.crew_violations_count - simAfter.crew_violations_count);

    if (delaySaved > 0 || paxRescued > 0 || costSaved > 0) {
      actions.push({
        id: 'rec_spare_del',
        type: 'spare_swap',
        title: `Deploy Mega-Hub Spare VT-DS18 at Delhi (DEL)`,
        tagline: `Reset schedule for Flight ${target.flight_id} (${target.origin}→${target.destination})`,
        description: `Activate Indira Gandhi International reserve aircraft VT-DS18 for Flight ${target.flight_id}. Prevents evening hub wave delay spillover into trunk routes.`,
        target_flight_id: target.flight_id,
        target_airport: 'DEL',
        resource_used: 'Standby Aircraft VT-DS18 (DEL Base)',
        metrics_delta: {
          delay_minutes_saved: delaySaved,
          passengers_rescued: paxRescued,
          cost_saved_inr: costSaved,
          crew_violations_prevented: crewSaved
        },
        before_summary: {
          delay_minutes: baselineOutput.total_delay_minutes,
          stranded_pax: baselineOutput.stranded_passengers,
          cost_inr: baselineOutput.disruption_cost_inr,
          crew_violations: baselineOutput.crew_violations_count
        },
        after_summary: {
          delay_minutes: simAfter.total_delay_minutes,
          stranded_pax: simAfter.stranded_passengers,
          cost_inr: simAfter.disruption_cost_inr,
          crew_violations: simAfter.crew_violations_count
        },
        strategy_tag: 'Passenger First'
      });
    }
  }

  // Option 3: Strategic Flight Cancellation (Circuit Breaker)
  // Find a flight whose cancellation drastically stops the bleeding for remaining legs
  const candidatesForCancel = Object.values(baselineOutput.flights)
    .filter(f => f.dep_delay >= 40 && !f.is_cancelled && f.leg_order >= 2 && f.leg_order <= 4)
    .sort((a, b) => b.dep_delay - a.dep_delay);

  if (candidatesForCancel.length > 0) {
    const target = candidatesForCancel[0];
    const candidateParams: SimulationParams = {
      ...baselineParams,
      overrideModifications: {
        ...baselineParams.overrideModifications,
        cancelledFlightIds: [
          ...(baselineParams.overrideModifications?.cancelledFlightIds || []),
          target.flight_id
        ]
      }
    };

    const simAfter = runSimulation(candidateParams);
    const delaySaved = Math.max(0, baselineOutput.total_delay_minutes - simAfter.total_delay_minutes);
    const paxRescued = Math.max(0, baselineOutput.stranded_passengers - simAfter.stranded_passengers);
    const costSaved = Math.max(0, baselineOutput.disruption_cost_inr - simAfter.disruption_cost_inr);
    const crewSaved = Math.max(0, baselineOutput.crew_violations_count - simAfter.crew_violations_count);

    actions.push({
      id: 'rec_strategic_cancel',
      type: 'strategic_cancel',
      title: `Tactical Circuit-Breaker: Cancel Flight ${target.flight_id}`,
      tagline: `Sacrifice ${target.origin}→${target.destination} to protect evening rotations`,
      description: `Cancel heavily delayed short sector ${target.flight_id} (${target.origin}→${target.destination}). Reclaims schedule slack, realigns pilot duty to avoid DGCA FDTL violation, and protects remaining flights.`,
      target_flight_id: target.flight_id,
      target_airport: target.origin,
      resource_used: 'Schedule Circuit-Breaker / Turnaround Buffer Reclaim',
      metrics_delta: {
        delay_minutes_saved: delaySaved,
        passengers_rescued: paxRescued,
        cost_saved_inr: costSaved,
        crew_violations_prevented: crewSaved
      },
      before_summary: {
        delay_minutes: baselineOutput.total_delay_minutes,
        stranded_pax: baselineOutput.stranded_passengers,
        cost_inr: baselineOutput.disruption_cost_inr,
        crew_violations: baselineOutput.crew_violations_count
      },
      after_summary: {
        delay_minutes: simAfter.total_delay_minutes,
        stranded_pax: simAfter.stranded_passengers,
        cost_inr: simAfter.disruption_cost_inr,
        crew_violations: simAfter.crew_violations_count
      },
      strategy_tag: 'Cost Minimizer'
    });
  }

  // Sort actions by cost saved / impact
  actions.sort((a, b) => b.metrics_delta.cost_saved_inr - a.metrics_delta.cost_saved_inr);
  return actions;
}

