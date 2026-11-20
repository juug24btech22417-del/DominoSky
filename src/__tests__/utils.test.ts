import { describe, it, expect } from 'vitest';
import { toMinutes, toHHMM, runSimulation } from '../engine/simulator';

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Boundary & edge-case validation
// ─────────────────────────────────────────────────────────────────────────────
describe('Boundary & Edge Case Validation', () => {
  it('toMinutes(toHHMM(x)) is identity for all quarter-hour values in a day', () => {
    for (let m = 0; m < 1440; m += 15) {
      expect(toMinutes(toHHMM(m))).toBe(m);
    }
  });

  it('toHHMM pads single-digit hours and minutes correctly', () => {
    expect(toHHMM(5)).toBe('00:05');
    expect(toHHMM(65)).toBe('01:05');
    expect(toHHMM(601)).toBe('10:01');
  });

  it('zero-duration closure at BOM produces same result as null closure', () => {
    const zero = runSimulation({ closureAirport: 'BOM', closureStartStr: '08:00', closureDurationMinutes: 0 });
    const none = runSimulation({ closureAirport: null, closureStartStr: '08:00', closureDurationMinutes: 0 });
    expect(zero.delayed_flights_count).toBe(none.delayed_flights_count);
    expect(zero.total_delay_minutes).toBe(none.total_delay_minutes);
  });

  it('simulation output has all expected top-level keys', () => {
    const sim = runSimulation({ closureAirport: 'BOM', closureStartStr: '08:00', closureDurationMinutes: 90 });
    const keys = [
      'total_flights', 'on_time_flights', 'delayed_flights_count',
      'cancelled_flights_count', 'total_delay_minutes', 'stranded_passengers',
      'crew_violations_count', 'disruption_cost_inr', 'cost_breakdown',
      'network_health_score', 'flights', 'connections', 'crews', 'events'
    ] as const;
    for (const key of keys) {
      expect(sim).toHaveProperty(key);
    }
  });

  it('cost_breakdown components sum to total disruption_cost_inr', () => {
    const sim = runSimulation({ closureAirport: 'BOM', closureStartStr: '08:00', closureDurationMinutes: 90 });
    const { pax_compensation_inr, crew_overtime_inr, fuel_and_ops_inr } = sim.cost_breakdown;
    expect(pax_compensation_inr + crew_overtime_inr + fuel_and_ops_inr).toBe(sim.disruption_cost_inr);
  });

  it('on_time_flights + delayed_flights_count + cancelled_flights_count equals total_flights', () => {
    const sim = runSimulation({ closureAirport: 'BOM', closureStartStr: '08:00', closureDurationMinutes: 90 });
    expect(sim.on_time_flights + sim.delayed_flights_count + sim.cancelled_flights_count)
      .toBe(sim.total_flights);
  });

  it('network_health_score is clamped between 0 and 100', () => {
    const sims = [
      runSimulation({ closureAirport: null, closureStartStr: '08:00', closureDurationMinutes: 0 }),
      runSimulation({ closureAirport: 'BOM', closureStartStr: '08:00', closureDurationMinutes: 90 }),
      runSimulation({ closureAirport: 'DEL', closureStartStr: '06:00', closureDurationMinutes: 180 })
    ];
    for (const sim of sims) {
      expect(sim.network_health_score).toBeGreaterThanOrEqual(0);
      expect(sim.network_health_score).toBeLessThanOrEqual(100);
    }
  });
});
