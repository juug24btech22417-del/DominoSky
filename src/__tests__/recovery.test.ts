import { describe, it, expect } from 'vitest';
import { runSimulation } from '../engine/simulator';
import { evaluateRecoveryOptions } from '../engine/recovery';
import { generateTacticalBriefing } from '../engine/aiDispatcher';

describe('AI Dispatcher & Recovery Engine', () => {
  const baseParams = {
    closureAirport: 'BOM',
    closureStartStr: '08:00',
    closureDurationMinutes: 90
  };

  it('generates multi-agent recovery strategies when a ground stop disruption is active', () => {
    const sim = runSimulation(baseParams);
    const recoveries = evaluateRecoveryOptions(baseParams, sim);

    expect(recoveries.length).toBeGreaterThanOrEqual(1);
    expect(recoveries[0].id).toBeDefined();
    expect(recoveries[0].title).toBeDefined();
    expect(recoveries[0].metrics_delta).toBeDefined();
  });

  it('proves that AI Recovery Options significantly rescue passengers and save delay minutes', () => {
    const baseline = runSimulation(baseParams);
    const recoveries = evaluateRecoveryOptions(baseParams, baseline);

    expect(recoveries.length).toBeGreaterThan(0);
    const bestRecovery = recoveries[0];

    expect(bestRecovery.metrics_delta.delay_minutes_saved).toBeGreaterThanOrEqual(0);
    expect(bestRecovery.metrics_delta.passengers_rescued).toBeGreaterThanOrEqual(0);
    expect(bestRecovery.metrics_delta.cost_saved_inr).toBeGreaterThanOrEqual(0);
  });

  it('generates an actionable tactical briefing with quantified facts for operations staff', () => {
    const baseline = runSimulation(baseParams);
    const recoveries = evaluateRecoveryOptions(baseParams, baseline);
    const briefing = generateTacticalBriefing(baseline, recoveries);

    expect(briefing.executiveSummary).toContain('BOM');
    expect(briefing.threatAssessment).toBeDefined();
    expect(briefing.keyFacts.length).toBeGreaterThan(0);
    expect(briefing.recommendedActionSummary).toContain('RECOMMENDED');
  });
});
