import { describe, it, expect } from 'vitest';
import {
  runSimulation,
  toMinutes,
  toHHMM
} from '../engine/simulator';

describe('Simulator Engine: Core Math & Conversions', () => {
  it('correctly converts HH:MM string to absolute minutes since midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('08:00')).toBe(480);
    expect(toMinutes('12:30')).toBe(750);
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('correctly converts absolute minutes back to HH:MM format', () => {
    expect(toHHMM(0)).toBe('00:00');
    expect(toHHMM(480)).toBe('08:00');
    expect(toHHMM(750)).toBe('12:30');
    expect(toHHMM(1439)).toBe('23:59');
  });

  it('handles late night minute calculations accurately', () => {
    expect(toHHMM(1440)).toBe('24:00');
    expect(toHHMM(1470)).toBe('24:30');
  });
});

describe('Simulator Engine: Deterministic Aviation Model', () => {
  it('produces 100% nominal schedule with 0 delays when no closures are applied', () => {
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
  });

  it('models ground stop disruption with upstream holding and downstream rotational propagation', () => {
    const stormSim = runSimulation({
      closureAirport: 'BOM',
      closureStartStr: '08:00',
      closureDurationMinutes: 90
    });

    // Delays must be triggered
    expect(stormSim.delayed_flights_count).toBeGreaterThan(0);
    expect(stormSim.total_delay_minutes).toBeGreaterThan(0);

    // Direct ground stop flights at BOM must record 'closure' in their causal chain
    const directVictims = Object.values(stormSim.flights).filter(
      f => (f.origin === 'BOM' || f.destination === 'BOM') && f.dep_delay > 0
    );
    expect(directVictims.length).toBeGreaterThan(0);
    expect(directVictims.some(f => f.causal_chain.some(c => c.type === 'closure'))).toBe(true);
  });

  it('correctly models cascading rotational slip (The Domino Effect)', () => {
    const stormSim = runSimulation({
      closureAirport: 'BOM',
      closureStartStr: '08:00',
      closureDurationMinutes: 90
    });

    // Downstream flights that inherit late inbound aircraft must record 'tail_propagation'
    const rotationalVictims = Object.values(stormSim.flights).filter(
      f => f.causal_chain.some(c => c.type === 'tail_propagation')
    );

    expect(rotationalVictims.length).toBeGreaterThan(0);
    expect(rotationalVictims[0].dep_delay).toBeGreaterThan(0);
  });
});
