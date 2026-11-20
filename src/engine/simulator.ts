import rawData from '../data/domino_dataset.json';
import {
  Dataset,
  SimulationOutput,
  FlightSimResult,
  ConnectionSimResult,
  CrewSimResult,
  DisruptionEvent,
  CausalStep
} from '../types';

export const DATASET: Dataset = rawData as Dataset;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function toHHMM(totalMinutes: number): string {
  // Normalize within 24h or keep past 24:00 if late night
  const normalized = Math.max(0, totalMinutes);
  const h = Math.floor(normalized / 60);
  const m = Math.floor(normalized % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface SimulationParams {
  closureAirport: string | null;
  closureStartStr: string; // "09:00"
  closureDurationMinutes: number; // 90
  overrideModifications?: {
    cancelledFlightIds?: string[];
    spareAircraftSwaps?: Array<{
      targetFlightId: string;
      spareTailId: string; // "VT-DS17" (at BLR) or "VT-DS18" (at DEL)
    }>;
  };
}

export function runSimulation(params: SimulationParams): SimulationOutput {
  const {
    closureAirport,
    closureStartStr,
    closureDurationMinutes,
    overrideModifications = {}
  } = params;

  const closureStart = closureAirport ? toMinutes(closureStartStr) : 0;
  const closureEnd = closureAirport ? closureStart + closureDurationMinutes : 0;
  const cancelledFlightIds = new Set(overrideModifications.cancelledFlightIds || []);
  const spareSwaps = new Map<string, string>();
  (overrideModifications.spareAircraftSwaps || []).forEach(s => {
    spareSwaps.set(s.targetFlightId, s.spareTailId);
  });

  const minTurnaround = DATASET.meta.min_turnaround_minutes; // 30
  const flightResults: Record<string, FlightSimResult> = {};
  const events: DisruptionEvent[] = [];

  // If there's an airport closure, record initial event
  if (closureAirport && closureDurationMinutes > 0) {
    events.push({
      time_min: closureStart,
      time_str: toHHMM(closureStart),
      severity: 'critical',
      title: `${closureAirport} Airport Closure Active`,
      details: `Runway operations halted for ${closureDurationMinutes} mins until ${toHHMM(closureEnd)}. Weather radar alert.`,
      airport: closureAirport
    });
  }

  // Group flights by original tail_id and sort by leg_order
  const tailGroups = new Map<string, typeof DATASET.flights>();
  for (const f of DATASET.flights) {
    if (!tailGroups.has(f.tail_id)) {
      tailGroups.set(f.tail_id, []);
    }
    tailGroups.get(f.tail_id)!.push(f);
  }

  for (const [, legs] of tailGroups) {
    legs.sort((a, b) => a.leg_order - b.leg_order);

    let prevArrival: number | null = null;
    let prevFlightId: string | null = null;
    let activeTail = legs[0].tail_id;

    for (const leg of legs) {
      const schedDepMin = toMinutes(leg.dep);
      const schedArrMin = toMinutes(leg.arr);
      const causalChain: CausalStep[] = [];

      // Check if spare aircraft is swapped in for this leg
      if (spareSwaps.has(leg.flight_id)) {
        activeTail = spareSwaps.get(leg.flight_id)!;
        causalChain.push({
          step: causalChain.length + 1,
          type: 'spare_swap',
          description: `Spare aircraft ${activeTail} injected at ${leg.origin}. Inbound rotational delay reset to zero.`,
          airport: leg.origin
        });
        // Reset rotational delay dependency
        prevArrival = null;
      }

      // Check cancellation
      if (cancelledFlightIds.has(leg.flight_id)) {
        flightResults[leg.flight_id] = {
          flight_id: leg.flight_id,
          tail_id: leg.tail_id,
          active_tail_id: activeTail,
          leg_order: leg.leg_order,
          origin: leg.origin,
          destination: leg.destination,
          sched_dep_min: schedDepMin,
          sched_arr_min: schedArrMin,
          sched_dep: leg.dep,
          sched_arr: leg.arr,
          actual_dep_min: schedDepMin,
          actual_arr_min: schedArrMin,
          actual_dep: '--:--',
          actual_arr: '--:--',
          dep_delay: 0,
          arr_delay: 0,
          is_delayed: false,
          is_cancelled: true,
          cancel_reason: 'Strategically cancelled by AI Dispatcher to rescue downstream network',
          pax: leg.pax,
          causal_chain: [
            {
              step: 1,
              type: 'closure',
              description: 'Flight cancelled by operational command'
            }
          ],
          primary_root_cause: 'Operational cancellation'
        };

        events.push({
          time_min: schedDepMin,
          time_str: leg.dep,
          severity: 'warning',
          title: `Flight ${leg.flight_id} Cancelled`,
          details: `Planned flight from ${leg.origin} to ${leg.destination} cancelled to restore fleet balance.`,
          flight_id: leg.flight_id,
          airport: leg.origin
        });

        // The aircraft remains at leg.origin
        prevArrival = null;
        continue;
      }

      // Earliest feasible departure based on schedule and previous arrival
      let earliestDep = schedDepMin;
      let primaryRootCause = 'On-time operations';

      // 1. Inbound turnaround constraint
      if (prevArrival !== null) {
        const requiredReadyTime = prevArrival + minTurnaround;
        if (requiredReadyTime > earliestDep) {
          const bufferLoss = requiredReadyTime - earliestDep;
          earliestDep = requiredReadyTime;
          primaryRootCause = `Reactionary tail delay from incoming flight ${prevFlightId} at ${leg.origin}`;
          causalChain.push({
            step: causalChain.length + 1,
            type: 'tail_propagation',
            description: `Inbound aircraft ${activeTail} (${prevFlightId}) arrived late. Turnaround window pushed departure by +${bufferLoss}m.`,
            impact_minutes: bufferLoss,
            flight_id: prevFlightId || undefined,
            airport: leg.origin
          });
        }
      }

      // 2. Origin airport closure constraint
      if (closureAirport && leg.origin === closureAirport) {
        if (earliestDep >= closureStart && earliestDep < closureEnd) {
          const closureDelay = closureEnd - earliestDep;
          earliestDep = closureEnd;
          primaryRootCause = `Direct ground halt at ${closureAirport} due to active airport closure`;
          causalChain.push({
            step: causalChain.length + 1,
            type: 'closure',
            description: `${closureAirport} airport closed until ${toHHMM(closureEnd)}. Held on ground for ${closureDelay}m.`,
            impact_minutes: closureDelay,
            airport: leg.origin
          });
        }
      }

      const actualDepMin = earliestDep;
      let actualArrMin = actualDepMin + leg.block_minutes;

      // 3. Destination airport closure constraint (airborne holding)
      if (closureAirport && leg.destination === closureAirport) {
        if (actualArrMin >= closureStart && actualArrMin < closureEnd) {
          const holdMinutes = closureEnd - actualArrMin;
          actualArrMin = closureEnd;
          causalChain.push({
            step: causalChain.length + 1,
            type: 'closure',
            description: `Destination ${closureAirport} closed during approach. Diverted/held airborne for ${holdMinutes}m.`,
            impact_minutes: holdMinutes,
            airport: leg.destination
          });
        }
      }

      const depDelay = Math.max(0, actualDepMin - schedDepMin);
      const arrDelay = Math.max(0, actualArrMin - schedArrMin);
      const isDelayed = depDelay > 0 || arrDelay > 0;

      if (isDelayed && causalChain.length === 0) {
        causalChain.push({
          step: 1,
          type: 'turnaround',
          description: `Operational departure delay of ${depDelay}m.`,
          impact_minutes: depDelay
        });
      }

      flightResults[leg.flight_id] = {
        flight_id: leg.flight_id,
        tail_id: leg.tail_id,
        active_tail_id: activeTail,
        leg_order: leg.leg_order,
        origin: leg.origin,
        destination: leg.destination,
        sched_dep_min: schedDepMin,
        sched_arr_min: schedArrMin,
        sched_dep: leg.dep,
        sched_arr: leg.arr,
        actual_dep_min: actualDepMin,
        actual_arr_min: actualArrMin,
        actual_dep: toHHMM(actualDepMin),
        actual_arr: toHHMM(actualArrMin),
        dep_delay: depDelay,
        arr_delay: arrDelay,
        is_delayed: isDelayed,
        is_cancelled: false,
        pax: leg.pax,
        causal_chain: causalChain,
        primary_root_cause: primaryRootCause
      };

      if (isDelayed) {
        events.push({
          time_min: actualDepMin,
          time_str: toHHMM(actualDepMin),
          severity: depDelay >= 60 ? 'critical' : 'warning',
          title: `Flight ${leg.flight_id} (${leg.origin}→${leg.destination}) Late +${depDelay}m`,
          details: primaryRootCause,
          flight_id: leg.flight_id,
          airport: leg.origin
        });
      }

      prevArrival = actualArrMin;
      prevFlightId = leg.flight_id;
    }
  }

  // Evaluate Passenger Connections
  const connectionResults: Record<string, ConnectionSimResult> = {};
  let strandedPassengers = 0;

  for (const cx of DATASET.connections) {
    const inbound = flightResults[cx.from_flight];
    const outbound = flightResults[cx.to_flight];

    let isBroken = false;
    let actualSlack = 0;

    if (!inbound || !outbound || inbound.is_cancelled || outbound.is_cancelled) {
      isBroken = true;
      actualSlack = -999;
    } else {
      const inboundArrMin = inbound.actual_arr_min;
      const outboundDepMin = outbound.actual_dep_min;
      const availableTransferTime = outboundDepMin - inboundArrMin;
      actualSlack = availableTransferTime - cx.min_connect_minutes;

      if (availableTransferTime < cx.min_connect_minutes) {
        isBroken = true;
      }
    }

    if (isBroken) {
      strandedPassengers += cx.passengers;
      events.push({
        time_min: outbound ? outbound.actual_dep_min : 720,
        time_str: outbound ? outbound.actual_dep : '12:00',
        severity: 'critical',
        title: `Missed Connection: ${cx.from_flight} ➔ ${cx.to_flight}`,
        details: `${cx.passengers} passengers stranded at ${cx.airport} (Transfer window deficit: ${Math.abs(actualSlack)}m)`,
        airport: cx.airport
      });
    }

    connectionResults[cx.connection_id] = {
      connection_id: cx.connection_id,
      airport: cx.airport,
      from_flight: cx.from_flight,
      to_flight: cx.to_flight,
      passengers: cx.passengers,
      min_connect_minutes: cx.min_connect_minutes,
      inbound_arr_min: inbound ? inbound.actual_arr_min : 0,
      outbound_dep_min: outbound ? outbound.actual_dep_min : 0,
      actual_slack_min: actualSlack,
      is_broken: isBroken
    };
  }

  // Evaluate Crew Legality (FDTL)
  const crewResults: Record<string, CrewSimResult> = {};
  let crewViolationsCount = 0;

  for (const crew of DATASET.crews) {
    const dutyStartMin = toMinutes(crew.duty_start);
    const lastFlightId = crew.flight_ids[crew.flight_ids.length - 1];
    const lastFlight = flightResults[lastFlightId];

    const actualDutyEndMin = lastFlight ? lastFlight.actual_arr_min : dutyStartMin;
    const totalDutyMins = actualDutyEndMin - dutyStartMin;
    const isViolation = totalDutyMins > crew.max_duty_mins;
    const excessMins = Math.max(0, totalDutyMins - crew.max_duty_mins);

    if (isViolation) {
      crewViolationsCount++;
      events.push({
        time_min: dutyStartMin + crew.max_duty_mins,
        time_str: toHHMM(dutyStartMin + crew.max_duty_mins),
        severity: 'critical',
        title: `Crew FDTL Legal Violation: Crew ${crew.crew_id}`,
        details: `Duty limit reached 600m (Actual duty: ${totalDutyMins}m, +${excessMins}m over legal cap) on flight ${lastFlightId}`,
        airport: crew.base
      });
    }

    crewResults[crew.crew_id] = {
      crew_id: crew.crew_id,
      tail_id: crew.tail_id,
      base: crew.base,
      duty_start_min: dutyStartMin,
      max_duty_mins: crew.max_duty_mins,
      duty_end_min: actualDutyEndMin,
      total_duty_mins: totalDutyMins,
      is_violation: isViolation,
      excess_mins: excessMins,
      last_flight_id: lastFlightId
    };
  }

  // Calculate Totals and Disruption Cost
  let totalDelayMinutes = 0;
  let delayedFlightsCount = 0;
  let cancelledFlightsCount = 0;
  let onTimeFlights = 0;

  let worstDelay = -1;
  let criticalFlightId: string | null = null;

  for (const f of Object.values(flightResults)) {
    if (f.is_cancelled) {
      cancelledFlightsCount++;
    } else if (f.is_delayed) {
      delayedFlightsCount++;
      totalDelayMinutes += f.dep_delay;
      if (f.dep_delay > worstDelay) {
        worstDelay = f.dep_delay;
        criticalFlightId = f.flight_id;
      }
    } else {
      onTimeFlights++;
    }
  }

  // Financial Cost Function (DGCA & Airline Operations standard):
  // 1. Pax compensation: ₹6,000 per stranded connection passenger (hotel + voucher + rebooking)
  // 2. Pax delay compensation: ₹2,000 per delayed flight passenger if dep_delay > 120m, ₹750 if > 60m
  // 3. Crew overtime/penalties: ₹3,50,000 per FDTL violation
  // 4. Fuel burn / ground operations idle: ₹1,500 per delay minute
  let paxCompensationInr = strandedPassengers * 6000;
  for (const f of Object.values(flightResults)) {
    if (f.is_delayed && !f.is_cancelled) {
      if (f.dep_delay >= 120) {
        paxCompensationInr += f.pax * 2000;
      } else if (f.dep_delay >= 60) {
        paxCompensationInr += f.pax * 750;
      }
    } else if (f.is_cancelled) {
      paxCompensationInr += f.pax * 5000;
    }
  }

  const crewOvertimeInr = crewViolationsCount * 350000;
  const fuelAndOpsInr = totalDelayMinutes * 1500;
  const totalCostInr = paxCompensationInr + crewOvertimeInr + fuelAndOpsInr;

  // Network Health Score (0 - 100)
  const healthDeduction = (delayedFlightsCount * 1.5) + (cancelledFlightsCount * 8) + (strandedPassengers * 0.15) + (crewViolationsCount * 12);
  const networkHealthScore = Math.max(12, Math.min(100, Math.round(100 - healthDeduction)));

  // Sort events chronologically
  events.sort((a, b) => a.time_min - b.time_min);

  return {
    closure: closureAirport ? {
      airport: closureAirport,
      start_min: closureStart,
      end_min: closureEnd,
      duration: closureDurationMinutes
    } : null,
    total_flights: DATASET.flights.length,
    on_time_flights: onTimeFlights,
    delayed_flights_count: delayedFlightsCount,
    cancelled_flights_count: cancelledFlightsCount,
    total_delay_minutes: totalDelayMinutes,
    stranded_passengers: strandedPassengers,
    crew_violations_count: crewViolationsCount,
    disruption_cost_inr: totalCostInr,
    cost_breakdown: {
      pax_compensation_inr: paxCompensationInr,
      crew_overtime_inr: crewOvertimeInr,
      fuel_and_ops_inr: fuelAndOpsInr
    },
    network_health_score: networkHealthScore,
    flights: flightResults,
    connections: connectionResults,
    crews: crewResults,
    events,
    critical_flight_id: criticalFlightId
  };
}

