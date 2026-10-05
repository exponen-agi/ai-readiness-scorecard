import { describe, expect, it } from 'vitest';
import {
  NATIVE_QUESTIONS,
  calculateAiNative,
  combinedRead,
  isAutopilotMismatch,
  isNativeComplete,
  reliabilityBar,
  roleScore,
} from '@/lib/ai-native-scorecard';
import { QUESTIONS, BLAST_QUESTIONS, calculateScorecard } from '@/lib/scorecard';

/** Picks the option with the highest or lowest listed score for every AI-native question. */
function answerAll(extreme: 'best' | 'worst'): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const question of NATIVE_QUESTIONS) {
    const sorted = [...question.options].sort((a, b) => a.score - b.score);
    answers[question.id] = (extreme === 'best' ? sorted[sorted.length - 1] : sorted[0]).id;
  }
  return answers;
}

describe('AI-native question data', () => {
  it('gives every question and option a unique id, distinct from the readiness questions', () => {
    const nativeIds = NATIVE_QUESTIONS.map((q) => q.id);
    expect(new Set(nativeIds).size).toBe(nativeIds.length);

    const readinessIds = new Set([...QUESTIONS, ...BLAST_QUESTIONS].map((q) => q.id));
    for (const id of nativeIds) expect(readinessIds.has(id)).toBe(false);

    for (const question of NATIVE_QUESTIONS) {
      const optionIds = question.options.map((o) => o.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
    }
  });

  it('keeps every option score inside 0-10 and tagged with its question category', () => {
    for (const question of NATIVE_QUESTIONS) {
      for (const option of question.options) {
        expect(option.score).toBeGreaterThanOrEqual(0);
        expect(option.score).toBeLessThanOrEqual(10);
        expect(option.category).toBe(question.category);
      }
    }
  });
});

describe('calculateAiNative', () => {
  it('scores the best answers at the top tier and the worst at the bottom', () => {
    const best = calculateAiNative(answerAll('best'));
    expect(best.overallScore).toBeGreaterThanOrEqual(95);
    expect(best.tier.title).toBe('AI-Native');
    expect(best.edge.profile).toBe('rough');

    const worst = calculateAiNative(answerAll('worst'));
    expect(worst.overallScore).toBeLessThan(40);
    expect(worst.tier.title).toBe('AI-Curious');
    expect(worst.edge.profile).toBe('sharp');
  });

  it('returns between one and three actions, six radar pillars and three score pillars', () => {
    for (const extreme of ['best', 'worst'] as const) {
      const report = calculateAiNative(answerAll(extreme));
      expect(report.priorityActions.length).toBeGreaterThanOrEqual(1);
      expect(report.priorityActions.length).toBeLessThanOrEqual(3);
      expect(report.radarDimensions).toHaveLength(6);
      expect(report.pillars).toHaveLength(3);
      for (const d of report.radarDimensions) {
        expect(d.score).toBeGreaterThanOrEqual(0);
        expect(d.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('never moves the readiness score', () => {
    const readinessAnswers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.options[0].id]));
    const response = { track: 'existing-product' as const, stage: 'startup' as const };
    const before = calculateScorecard({ ...response, answers: readinessAnswers }).overallScore;
    const after = calculateScorecard({
      ...response,
      answers: { ...readinessAnswers, ...answerAll('best') },
    }).overallScore;
    expect(after).toBe(before);
  });

  it('scores partial answers without counting the unanswered questions against you', () => {
    const answers = answerAll('best');
    delete answers['workflow'];
    expect(isNativeComplete(answers)).toBe(false);
    expect(calculateAiNative(answers).overallScore).toBeGreaterThan(90);
  });
});

describe('rough-edged and sharp-edged rules', () => {
  it('raises the reliability bar with sharpness and error cost', () => {
    expect(reliabilityBar({ use_case_shape: 'rough', error_cost: 'cheap' })).toBe(0);
    expect(reliabilityBar({ use_case_shape: 'sharp', error_cost: 'harm' })).toBe(4);
  });

  it('rewards augmentation everywhere, and penalises unattended AI only when the bar is high', () => {
    const low = { use_case_shape: 'rough', error_cost: 'cheap' };
    const high = { use_case_shape: 'sharp', error_cost: 'harm' };
    expect(roleScore({ ...low, ai_role: 'augment' })).toBe(10);
    expect(roleScore({ ...high, ai_role: 'augment' })).toBe(10);
    expect(roleScore({ ...low, ai_role: 'replace' })).toBe(8);
    expect(roleScore({ ...high, ai_role: 'replace' })).toBe(1);
    // An automatic check against a known answer is what makes autonomy workable on sharp edges.
    expect(roleScore({ ...high, ai_role: 'replace', verifiability: 'ground_truth' })).toBe(6);
  });

  it('caps a sharp-edged, high-stakes task on autopilot below the top tiers', () => {
    const answers = {
      ...answerAll('best'),
      use_case_shape: 'sharp',
      error_cost: 'harm',
      verifiability: 'human_review',
      ai_role: 'replace',
    };
    expect(isAutopilotMismatch(answers)).toBe(true);
    const report = calculateAiNative(answers);
    expect(report.autopilotMismatch).toBe(true);
    expect(report.tier.title).toBe('AI-Assisted');
    expect(report.priorityActions[0].title).toContain('off autopilot');
    expect(report.edge.play.title).toBe('Turn the decision into a brief');
  });

  it('does not flag autopilot when every output is checked automatically', () => {
    const answers = {
      ...answerAll('best'),
      use_case_shape: 'sharp',
      error_cost: 'harm',
      verifiability: 'ground_truth',
      ai_role: 'replace',
    };
    expect(isAutopilotMismatch(answers)).toBe(false);
    expect(calculateAiNative(answers).edge.play.title).toContain('automatic check');
  });

  it('spells out compounding for long chains checked only at the end', () => {
    const report = calculateAiNative({ ...answerAll('best'), chain_length: 'long_unchecked' });
    expect(report.compounding).not.toBeNull();
    expect(report.compounding!.endToEnd).toBeLessThan(report.compounding!.perStep);
    expect(calculateAiNative(answerAll('best')).compounding).toBeNull();
  });
});

describe('combinedRead', () => {
  it('places each score pair in its own quadrant', () => {
    const titles = new Set([
      combinedRead(80, 80).title,
      combinedRead(80, 30).title,
      combinedRead(30, 80).title,
      combinedRead(30, 30).title,
    ]);
    expect(titles.size).toBe(4);
  });
});
