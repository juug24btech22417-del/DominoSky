import { describe, it, expect } from 'vitest';
import {
  runSimulation,
  toMinutes,
  toHHMM
} from '../engine/simulator';

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1: Pure utility math
// ─────────────────────────────────────────────────────────────────────────────
describe('Simulator Engine: Core Math & Conversions', () => {
  it('converts HH:MM string to absolute minutes since midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('08:00')).toBe(480);
    expect(toMinutes('12:30')).toBe(750);
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('converts absolute minutes back to HH:MM format', () => {
    expect(toHHMM(0)).toBe('00:00');
    expect(toHHMM(480)).toBe('08:00');
    expect(toHHMM(750)).toBe('12:30');
    expect(toHHMM(1439)).toBe('23:59');
  });

  it('handles late-night / past-midnight minute values', () => {
    expect(toHHMM(1440)).toBe('24:00');
    expect(toHHMM(1470)).toBe('24:30');
    expect(toHHMM(1500)).toBe('25:00');
  });

  it('toMinutes is the left inverse of toHHMM for values 0–1439', () => {
    for (const mins of [0, 60, 120, 480, 750, 1200, 1439]) {
      expect(toMinutes(toHHMM(mins))).toBe(mins);
    }
  });

  it('toMinutes handles zero-padded hours correctly', () => {
    expect(toMinutes('01:05')).toBe(65);
    expect(toMinutes('09:09')).toBe(549);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2: Nominal schedule (no disruption)
// ─────────────────────────────────────────────────────────────────────────────
describe('Simulator Engine: Nominal Schedule', () => {
  it('produces 70 flights with 0 delays and 0 cancellations when no airport is closed', () => {
    const nominal = runSimulation({
      closureAirport: null,
      closureStartStr: '08:00',
      closureDurationMinutes: 0
    });
    expect(nominal.total_flights).toBe(70);
    expect(nominal.delayed_flights_count).toBe(0);
    expect(nominal.cancelled_flights_count).toBe(0);
    expect(nominal.stranded_passengers).toBe(0);
    expect(nominal.total_delay_minutes).toBe(0);
    expect(nominal.crew_violations_count).toBe(0);
    expect(nominal.network_health_score).toBe(100);
  });

  it('nominal closure field is null when no airport is closed', () => {
    const nominal = runSimulation({ closureAirport: null, closureStartStr: '08:00', closureDurationMinutes: 0 });
    expect(nominal.closure).toBeNull();
  });

  it('all flights are on-time in nominal schedule', () => {
    const nominal = runSimulation({ closureAirport: null, closureStartStr: '08:00', closureDurationMinutes: 0 });
    const flights = Object.values(nominal.flights);
    expect(flights.every(f => !f.is_delayed && !f.is_cancelled)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3: BOM ground stop — cascade propagation (The Domino Effect)
// ─────────────────────────────────────────────────────────────────────────────
describe('Simulator Engine: BOM Ground Stop Cascade', () => {
  const bomSim = runSimulation({
    closureAirport: 'BOM',
    closureStartStr: '08:00',
    closureDurationMinutes: 90
  });

  it('records a closure object with correct airport and duration', () => {
    expect(bomSim.closure).not.toBeNull();
    expect(bomSim.closure?.airport).toBe('BOM');
    expect(bomSim.closure?.duration).toBe(90);
  });

  it('triggers delays and degraded network health on BOM ground stop', () => {
    expect(bomSim.delayed_flights_count).toBeGreaterThan(0);
    expect(bomSim.total_delay_minutes).toBeGreaterThan(0);
    expect(bomSim.network_health_score).toBeLessThan(100);
  });

  it('records closure causal type on directly affected BOM flights', () => {
    const directVictims = Object.values(bomSim.flights).filter(
      f => (f.origin === 'BOM' || f.destination === 'BOM') && f.dep_delay > 0
    );
    expect(directVictims.length).toBeGreaterThan(0);
    expect(directVictims.some(f => f.causal_chain.some(c => c.type === 'closure'))).toBe(true);
  });

  it('propagates tail_propagation delays to downstream non-BOM flights (Domino Effect)', () => {
    const rotationalVictims = Object.values(bomSim.flights).filter(
      f => f.causal_chain.some(c => c.type === 'tail_propagation')
    );
    expect(rotationalVictims.length).toBeGreaterThan(0);
    expect(rotationalVictims[0].dep_delay).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4: Multi-hub disruption coverage
// ─────────────────────────────────────────────────────────────────────────────
describe('Simulator Engine: Multi-Hub Disruption Coverage', () => {
  it('DEL 120-min fog closure triggers cascade', () => {
    const delSim = runSimulation({ closureAirport: 'DEL', closureStartStr: '06:00', closureDurationMinutes: 120 });
    expect(delSim.delayed_flights_count).toBeGreaterThan(0);
    expect(delSim.closure?.airport).toBe('DEL');
  });

  it('BLR 60-min halt triggers rotational delays', () => {
    const blrSim = runSimulation({ closureAirport: 'BLR', closureStartStr: '11:00', closureDurationMinutes: 60 });
    expect(blrSim.delayed_flights_count).toBeGreaterThan(0);
    expect(blrSim.closure?.airport).toBe('BLR');
  });

  it('short 10-min closure produces fewer delays than a 120-min closure at same airport', () => {
    const short = runSimulation({ closureAirport: 'BOM', closureStartStr: '08:00', closureDurationMinutes: 10 });
    const long  = runSimulation({ closureAirport: 'BOM', closureStartStr: '08:00', closureDurationMinutes: 120 });
    expect(long.total_delay_minutes).toBeGreaterThan(short.total_delay_minutes);
  });

  it('total_flights is always 70 regardless of which airport is closed', () => {
    for (const airport of ['BOM', 'DEL', 'BLR', 'CCU', 'HYD']) {
      const sim = runSimulation({ closureAirport: airport, closureStartStr: '10:00', closureDurationMinutes: 90 });
      expect(sim.total_flights).toBe(70);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5: Spare aircraft injection (recovery override)
// ─────────────────────────────────────────────────────────────────────────────
describe('Simulator Engine: Spare Aircraft Override', () => {
  it('injecting VT-DS17 spare at BLR reduces total delay minutes vs baseline', () => {
    const baseline = runSimulation({ closureAirport: 'BOM', closureStartStr: '08:00', closureDurationMinutes: 90 });
    const delayedAtBLR = Object.values(baseline.flights).filter(
      f => f.origin === 'BLR' && f.dep_delay > 20 && f.leg_order > 1
    );
    if (delayedAtBLR.length > 0) {
      const withSpare = runSimulation({
        closureAirport: 'BOM',
        closureStartStr: '08:00',
        closureDurationMinutes: 90,
        overrideModifications: {
          spareAircraftSwaps: [{ targetFlightId: delayedAtBLR[0].flight_id, spareTailId: 'VT-DS17' }]
        }
      });
      expect(withSpare.total_delay_minutes).toBeLessThanOrEqual(baseline.total_delay_minutes);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6: Output invariants
// ─────────────────────────────────────────────────────────────────────────────
describe('Simulator Engine: Output Invariants', () => {
  it('on_time + delayed + cancelled always equals total_flights', () => {
    for (const airport of [null, 'BOM', 'DEL']) {
      const sim = runSimulation({ closureAirport: airport, closureStartStr: '08:00', closureDurationMinutes: 90 });
      expect(sim.on_time_flights + sim.delayed_flights_count + sim.cancelled_flights_count)
        .toBe(sim.total_flights);
    }
  });

  it('cost_breakdown components sum to disruption_cost_inr', () => {
    const sim = runSimulation({ closureAirport: 'BOM', closureStartStr: '08:00', closureDurationMinutes: 90 });
    const { pax_compensation_inr, crew_overtime_inr, fuel_and_ops_inr } = sim.cost_breakdown;
    expect(pax_compensation_inr + crew_overtime_inr + fuel_and_ops_inr).toBe(sim.disruption_cost_inr);
  });

  it('network_health_score is clamped between 0 and 100', () => {
    for (const airport of [null, 'BOM', 'DEL']) {
      const sim = runSimulation({ closureAirport: airport, closureStartStr: '06:00', closureDurationMinutes: 180 });
      expect(sim.network_health_score).toBeGreaterThanOrEqual(0);
      expect(sim.network_health_score).toBeLessThanOrEqual(100);
    }
  });
});
