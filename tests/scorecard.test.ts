import { describe, expect, it } from 'vitest';
import {
  BLAST_QUESTIONS,
  BLAST_GATE_ID,
  QUESTIONS,
  applicableBlastQuestions,
  calculateBlastRadius,
  calculateScorecard,
  isBlastModuleComplete,
  type ScorecardResponse,
} from '@/lib/scorecard';

/** Picks the option with the highest or lowest score for every core question. */
function answerAll(extreme: 'best' | 'worst'): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const question of QUESTIONS) {
    const sorted = [...question.options].sort((a, b) => a.score - b.score);
    answers[question.id] = (extreme === 'best' ? sorted[sorted.length - 1] : sorted[0]).id;
  }
  return answers;
}

const baseResponse = (answers: Record<string, string>): ScorecardResponse => ({
  track: 'existing-product',
  stage: 'startup',
  answers,
});

describe('question data', () => {
  it('gives every question and option a unique id', () => {
    const questionIds = QUESTIONS.map((q) => q.id);
    expect(new Set(questionIds).size).toBe(questionIds.length);

    for (const question of [...QUESTIONS, ...BLAST_QUESTIONS]) {
      const optionIds = question.options.map((o) => o.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
    }
  });

  it('keeps every option score inside the 0-10 range the maths assumes', () => {
    for (const question of [...QUESTIONS, ...BLAST_QUESTIONS]) {
      for (const option of question.options) {
        expect(option.score).toBeGreaterThanOrEqual(0);
        expect(option.score).toBeLessThanOrEqual(10);
      }
    }
  });

  it('tags every option with its own question category', () => {
    for (const question of [...QUESTIONS, ...BLAST_QUESTIONS]) {
      for (const option of question.options) {
        expect(option.category).toBe(question.category);
      }
    }
  });
});

describe('calculateScorecard', () => {
  it('scores a perfect set of answers at 100 and the worst at the bottom tier', () => {
    const best = calculateScorecard(baseResponse(answerAll('best')));
    expect(best.overallScore).toBe(100);
    expect(best.maturityTier.badge).toContain('Tier 1');

    const worst = calculateScorecard(baseResponse(answerAll('worst')));
    expect(worst.overallScore).toBeLessThan(40);
    expect(worst.maturityTier.badge).toContain('Tier 4');
  });

  it('returns at most three priority actions, and always at least one', () => {
    for (const extreme of ['best', 'worst'] as const) {
      const report = calculateScorecard(baseResponse(answerAll(extreme)));
      expect(report.priorityActions.length).toBeGreaterThanOrEqual(1);
      expect(report.priorityActions.length).toBeLessThanOrEqual(3);
    }
  });

  it('scores partial answers without counting the unanswered questions against you', () => {
    const answers = answerAll('best');
    delete answers[QUESTIONS[0].id];
    const report = calculateScorecard(baseResponse(answers));
    expect(report.overallScore).toBeGreaterThan(90);
  });

  it('produces six radar pillars, each within 0-100', () => {
    const report = calculateScorecard(baseResponse(answerAll('best')));
    expect(report.radarDimensions).toHaveLength(6);
    for (const dimension of report.radarDimensions) {
      expect(dimension.score).toBeGreaterThanOrEqual(0);
      expect(dimension.score).toBeLessThanOrEqual(100);
    }
  });

  it('leads the reality check with the buzz warning when AI is being added for pressure', () => {
    const answers = { ...answerAll('best'), problem_validation: 'fomo_or_investors' };
    const report = calculateScorecard(baseResponse(answers));
    expect(report.whereAiWillNotHelp[0]).toContain('investor buzz');
  });

  it('ignores blast-radius answers entirely', () => {
    const answers = answerAll('best');
    const withBlast = { ...answers, [BLAST_GATE_ID]: 'external_actions', spend_caps: 'no_caps' };
    expect(calculateScorecard(baseResponse(withBlast)).overallScore).toBe(
      calculateScorecard(baseResponse(answers)).overallScore
    );
  });
});

describe('blast radius module', () => {
  it('shows only the gate until it is answered, and retires the rest on "nothing unattended"', () => {
    expect(applicableBlastQuestions({})).toHaveLength(1);
    expect(applicableBlastQuestions({ [BLAST_GATE_ID]: 'none' })).toHaveLength(1);
    expect(isBlastModuleComplete({ [BLAST_GATE_ID]: 'none' })).toBe(true);

    expect(applicableBlastQuestions({ [BLAST_GATE_ID]: 'internal_writes' })).toHaveLength(
      BLAST_QUESTIONS.length
    );
    expect(isBlastModuleComplete({ [BLAST_GATE_ID]: 'internal_writes' })).toBe(false);
  });

  it('returns the not-applicable result when nothing runs unattended', () => {
    const report = calculateBlastRadius({ [BLAST_GATE_ID]: 'none' });
    expect(report?.notApplicable).toBe(true);
    expect(report?.fixes).toHaveLength(0);
  });

  it('calls an uncapped, unbounded agent unbounded regardless of the other controls', () => {
    const report = calculateBlastRadius({
      [BLAST_GATE_ID]: 'external_actions',
      run_cost_baseline: 'measured_tail',
      spend_caps: 'no_caps',
      loop_bounding: 'unbounded',
      detection: 'named_owner',
      kill_switch: 'documented_switch',
    });
    expect(report?.tier.title).toBe('Unbounded');
    expect(report?.fixes.length).toBeGreaterThan(0);
  });

  it('holds a fully controlled setup at contained, with nothing left to fix', () => {
    const report = calculateBlastRadius({
      [BLAST_GATE_ID]: 'external_actions',
      run_cost_baseline: 'measured_tail',
      spend_caps: 'per_run',
      loop_bounding: 'step_and_budget',
      detection: 'named_owner',
      kill_switch: 'documented_switch',
    });
    expect(report?.containmentScore).toBe(100);
    expect(report?.tier.title).toBe('Contained');
    expect(report?.fixes).toHaveLength(0);
  });

  it('never reports a gap without something to do about it', () => {
    // Decent controls, high stakes: the average clears every "missing control" rule but still
    // sits under the bar for an agent that can act on the outside world.
    const report = calculateBlastRadius({
      [BLAST_GATE_ID]: 'external_actions',
      run_cost_baseline: 'measured_avg',
      spend_caps: 'per_run',
      loop_bounding: 'step_cap',
      detection: 'channel_alert',
      kill_switch: 'revoke_key',
    });
    expect(report?.tier.title).not.toBe('Contained');
    expect(report?.fixes.length).toBeGreaterThan(0);
  });

  it('returns null until the gate has been answered', () => {
    expect(calculateBlastRadius({})).toBeNull();
  });
});
