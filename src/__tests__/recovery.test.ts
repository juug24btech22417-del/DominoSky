import { describe, it, expect } from 'vitest';
import { runSimulation } from '../engine/simulator';
import { evaluateRecoveryOptions } from '../engine/recovery';
import { generateTacticalBriefing } from '../engine/aiDispatcher';

const BASE_PARAMS = {
  closureAirport: 'BOM',
  closureStartStr: '08:00',
  closureDurationMinutes: 90
};

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1: Recovery option generation
// ─────────────────────────────────────────────────────────────────────────────
describe('Recovery Engine: Option Generation', () => {
  const sim = runSimulation(BASE_PARAMS);
  const recoveries = evaluateRecoveryOptions(BASE_PARAMS, sim);

  it('generates at least one recovery strategy for an active ground stop', () => {
    expect(recoveries.length).toBeGreaterThanOrEqual(1);
  });

  it('every recovery option has required schema fields', () => {
    for (const r of recoveries) {
      expect(r.id).toBeDefined();
      expect(r.title).toBeDefined();
      expect(r.type).toBeDefined();
      expect(r.metrics_delta).toBeDefined();
      expect(r.before_summary).toBeDefined();
      expect(r.after_summary).toBeDefined();
      expect(r.strategy_tag).toBeDefined();
    }
  });

  it('metrics_delta values are non-negative numbers', () => {
    for (const r of recoveries) {
      expect(r.metrics_delta.delay_minutes_saved).toBeGreaterThanOrEqual(0);
      expect(r.metrics_delta.passengers_rescued).toBeGreaterThanOrEqual(0);
      expect(r.metrics_delta.cost_saved_inr).toBeGreaterThanOrEqual(0);
      expect(r.metrics_delta.crew_violations_prevented).toBeGreaterThanOrEqual(0);
    }
  });

  it('after_summary reflects reduced impact compared to before_summary', () => {
    for (const r of recoveries) {
      expect(r.after_summary.delay_minutes).toBeLessThanOrEqual(r.before_summary.delay_minutes);
    }
  });

  it('returns empty array for a nominal (no-disruption) simulation', () => {
    const nominalSim = runSimulation({ closureAirport: null, closureStartStr: '08:00', closureDurationMinutes: 0 });
    const nominalRecoveries = evaluateRecoveryOptions(
      { closureAirport: null, closureStartStr: '08:00', closureDurationMinutes: 0 },
      nominalSim
    );
    expect(nominalRecoveries).toHaveLength(0);
  });

  it('recovery IDs are unique across all options', () => {
    const ids = recoveries.map(r => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2: Tactical briefing generation
// ─────────────────────────────────────────────────────────────────────────────
describe('AI Dispatcher: Tactical Briefing', () => {
  const sim = runSimulation(BASE_PARAMS);
  const recoveries = evaluateRecoveryOptions(BASE_PARAMS, sim);
  const briefing = generateTacticalBriefing(sim, recoveries);

  it('executive summary references the closed airport', () => {
    expect(briefing.executiveSummary).toContain('BOM');
  });

  it('briefing has all required schema fields', () => {
    expect(briefing.threatAssessment).toBeDefined();
    expect(briefing.recommendedActionSummary).toBeDefined();
    expect(briefing.keyFacts).toBeDefined();
    expect(briefing.suggestedRecoveryId).toBeDefined();
  });

  it('key facts list is non-empty and each entry has label + value', () => {
    expect(briefing.keyFacts.length).toBeGreaterThan(0);
    for (const fact of briefing.keyFacts) {
      expect(fact.label).toBeDefined();
      expect(fact.value).toBeDefined();
    }
  });

  it('recommended action summary contains RECOMMENDED keyword for active disruption', () => {
    expect(briefing.recommendedActionSummary).toContain('RECOMMENDED');
  });

  it('nominal briefing reports 100% network health when no disruption', () => {
    const nomSim = runSimulation({ closureAirport: null, closureStartStr: '08:00', closureDurationMinutes: 0 });
    const nomBriefing = generateTacticalBriefing(nomSim, []);
    const healthFact = nomBriefing.keyFacts.find(f => f.label === 'Network Health');
    expect(healthFact?.value).toBe('100%');
  });

  it('suggested recovery ID is null for nominal schedule', () => {
    const nomSim = runSimulation({ closureAirport: null, closureStartStr: '08:00', closureDurationMinutes: 0 });
    const nomBriefing = generateTacticalBriefing(nomSim, []);
    expect(nomBriefing.suggestedRecoveryId).toBeNull();
  });

  it('DEL closure briefing references DEL airport in executive summary', () => {
    const delSim = runSimulation({ closureAirport: 'DEL', closureStartStr: '06:00', closureDurationMinutes: 120 });
    const delRecoveries = evaluateRecoveryOptions(
      { closureAirport: 'DEL', closureStartStr: '06:00', closureDurationMinutes: 120 }, delSim
    );
    const delBriefing = generateTacticalBriefing(delSim, delRecoveries);
    expect(delBriefing.executiveSummary).toContain('DEL');
  });
});
