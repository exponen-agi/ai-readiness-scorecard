/* ------------------------------------------------------------------ *
 * AI-Native Readiness Scorecard (second report)
 *
 * The AI-Readiness scorecard asks "are you in a position to build with AI": data, tools, team.
 * This one asks a different question: "is the thing you are building with AI shaped to work,
 * and is the business organised around it". A team can have excellent infrastructure and still
 * point it at a problem today's models cannot do reliably, or bolt it onto a workflow nobody
 * redesigned. So, like the Blast-Radius module, it is scored separately and never moves the
 * readiness score.
 *
 * The scoring borrows a framework from Michael Bernstein's Stanford webinar "What AI Can and
 * Cannot Do: Intelligence Augmentation in Practice" (2026):
 *
 *  - Rough-edged problems have many acceptable answers (drafts, summaries, designs), so getting
 *    80% of the way is still useful. Sharp-edged problems have one right answer (a decision, a
 *    routing, a reorder quantity), so 80% right is simply wrong. AI is deployable on rough
 *    edges long before sharp ones, and every task moves from unsolved, to solved-rough, to
 *    solved-sharp as models improve. It never jumps straight to sharp.
 *  - A sharp-edged problem works today only above a reliability threshold set by how costly an
 *    error is, or when a wrong answer can be caught automatically, or when it is reframed as a
 *    rough-edged one (a brief for a person who decides, instead of the decision itself).
 *  - Agents chain sharp edges together, so per-step reliability compounds.
 *  - Failures cluster at the seam: the hand-off between the AI and the person.
 *  - The goal is complementarity (person plus AI beats either alone). Over-reliance and its
 *    rebound, algorithm aversion, are what stop it; replacement framing gets AI resisted.
 *  - Replacement metrics (time and cost saved) measure the wrong thing for augmentation.
 *
 * Everything below is a pure function over the answers, as in `scorecard.ts`.
 * ------------------------------------------------------------------ */

export type NativeCategory = 'fit' | 'human' | 'operating';

export interface NativeOption {
  id: string;
  label: string;
  sublabel?: string;
  /** 0 - 10. For `ai_role` this is only the low-stakes value; see `roleScore`. */
  score: number;
  category: NativeCategory;
}

export interface NativeQuestion {
  id: string;
  category: NativeCategory;
  title: string;
  description: string;
  options: NativeOption[];
}

export const NATIVE_SECTIONS: Array<{
  id: NativeCategory;
  title: string;
  blurb: string;
  weight: number;
}> = [
  {
    id: 'fit',
    title: 'Use-Case Fit',
    blurb: 'Is your main AI use case rough-edged or sharp-edged, and can a wrong answer be caught?',
    weight: 0.35,
  },
  {
    id: 'human',
    title: 'Human + AI Design',
    blurb: 'Who decides, what the hand-off looks like, and whether people trust it the right amount.',
    weight: 0.35,
  },
  {
    id: 'operating',
    title: 'AI-Native Operating Model',
    blurb: 'Whether the work, the metrics and the learning loop are built around AI or bolted on.',
    weight: 0.3,
  },
];

export const NATIVE_QUESTIONS: NativeQuestion[] = [
  // USE-CASE FIT
  {
    id: 'use_case_shape',
    category: 'fit',
    title: 'What does a good answer look like in your main AI use case?',
    description:
      'Rough-edged work has many acceptable answers, so a decent draft is still useful. Sharp-edged work has one right answer, so "nearly right" is wrong.',
    options: [
      {
        id: 'rough',
        label: 'Many answers would be fine',
        sublabel: 'Drafting, summarising, brainstorming, research, design options, suggested replies.',
        score: 10,
        category: 'fit',
      },
      {
        id: 'mixed',
        label: 'A mix of both',
        sublabel: 'A draft that also contains facts, figures or citations that must be exactly right.',
        score: 7,
        category: 'fit',
      },
      {
        id: 'sharp',
        label: 'There is one right answer',
        sublabel: 'A decision, classification, routing, prediction, calculation or transaction.',
        score: 4,
        category: 'fit',
      },
    ],
  },
  {
    id: 'error_cost',
    category: 'fit',
    title: 'If the AI got one case in twenty wrong, what would happen?',
    description:
      'This sets the reliability bar. The cheaper a mistake, the earlier AI is good enough to use.',
    options: [
      {
        id: 'cheap',
        label: 'Someone fixes it in a minute',
        sublabel: 'The output is a starting point and a person edits it anyway.',
        score: 10,
        category: 'fit',
      },
      {
        id: 'rework',
        label: 'Rework or an awkward moment',
        sublabel: 'Noticed internally, costs time or a little goodwill, nothing lasting.',
        score: 7,
        category: 'fit',
      },
      {
        id: 'harm',
        label: 'Real harm',
        sublabel: 'A customer is wronged, money moves, or there is a legal, safety or health consequence.',
        score: 3,
        category: 'fit',
      },
    ],
  },
  {
    id: 'verifiability',
    category: 'fit',
    title: 'Can a wrong answer be caught automatically?',
    description:
      'Coding agents handle sharp-edged work when tests tell them they are wrong. Without a check like that, a person has to catch every error.',
    options: [
      {
        id: 'no_check',
        label: 'No, it is hard to tell',
        sublabel: 'Someone would need to redo the work to know whether it was right.',
        score: 2,
        category: 'fit',
      },
      {
        id: 'human_review',
        label: 'Only by a person reviewing it',
        sublabel: 'An expert can tell by reading it, but nothing checks it automatically.',
        score: 5,
        category: 'fit',
      },
      {
        id: 'partial_auto',
        label: 'Partly: schema, rule or test checks',
        sublabel: 'Format, totals or business rules are validated, but not whether it is correct overall.',
        score: 8,
        category: 'fit',
      },
      {
        id: 'ground_truth',
        label: 'Yes: checked against a known answer',
        sublabel: 'Tests, reconciliation or a source of truth confirms every output before it is used.',
        score: 10,
        category: 'fit',
      },
    ],
  },
  {
    id: 'chain_length',
    category: 'fit',
    title: 'How many steps have to go right before the result is used?',
    description:
      'An agent that looks something up, decides, then acts chains several sharp edges. Each step that can fail multiplies the risk.',
    options: [
      {
        id: 'single',
        label: 'One step',
        sublabel: 'The AI produces one output and that is the result.',
        score: 10,
        category: 'fit',
      },
      {
        id: 'few',
        label: 'A few steps',
        sublabel: 'Two to four steps, and a person sees the final result.',
        score: 7,
        category: 'fit',
      },
      {
        id: 'long_checked',
        label: 'A long chain, each step checked',
        sublabel: 'Five or more steps, with a check after each one before the next starts.',
        score: 8,
        category: 'fit',
      },
      {
        id: 'long_unchecked',
        label: 'A long chain, checked at the end',
        sublabel: 'Five or more steps run by an agent, and only the outcome is looked at.',
        score: 3,
        category: 'fit',
      },
    ],
  },

  // HUMAN + AI DESIGN
  {
    id: 'ai_role',
    category: 'human',
    title: 'What role does the AI play in that work?',
    description:
      'Replacing the person is one option among several, and rarely the one that performs best. The right role depends on the reliability bar above.',
    options: [
      {
        id: 'replace',
        label: 'It does the job on its own',
        sublabel: 'No person is involved in a normal case.',
        score: 8,
        category: 'human',
      },
      {
        id: 'approve',
        label: 'It does the job, a person approves',
        sublabel: 'The AI produces the finished result and someone signs it off.',
        score: 8,
        category: 'human',
      },
      {
        id: 'augment',
        label: 'It drafts, a person decides',
        sublabel: 'The AI proposes options or a first version; the person edits and owns the outcome.',
        score: 10,
        category: 'human',
      },
      {
        id: 'background',
        label: 'It advises quietly in the background',
        sublabel: 'Flags, context and suggestions alongside the person’s own work, easy to ignore.',
        score: 9,
        category: 'human',
      },
    ],
  },
  {
    id: 'handoff',
    category: 'human',
    title: 'When the AI hands over to a person, what do they get?',
    description:
      'Errors cluster at the seam between AI and person: a hand-off with no context is where a good AI and a capable person still fail together.',
    options: [
      {
        id: 'raw',
        label: 'Just the output',
        sublabel: 'The person sees the answer, with no sources, confidence or reasoning to check.',
        score: 3,
        category: 'human',
      },
      {
        id: 'context',
        label: 'Output with sources and confidence',
        sublabel: 'They can see where it came from and how sure the system is.',
        score: 7,
        category: 'human',
      },
      {
        id: 'designed',
        label: 'A designed escalation path',
        sublabel: 'Uncertain cases are routed to a named person with the context needed to decide fast.',
        score: 10,
        category: 'human',
      },
      {
        id: 'no_handoff',
        label: 'There is no hand-off',
        sublabel: 'The AI acts on its own and nobody sees individual cases.',
        score: 5,
        category: 'human',
      },
    ],
  },
  {
    id: 'reliance',
    category: 'human',
    title: 'How do you stop people rubber-stamping the AI?',
    description:
      'Over-reliance is when reviewers stop really checking, and a long, confident explanation makes it worse. The first visible mistake then swings people to distrusting it entirely.',
    options: [
      {
        id: 'trust',
        label: 'We mostly trust it',
        sublabel: 'If the output looks reasonable, it goes through.',
        score: 2,
        category: 'human',
      },
      {
        id: 'spot_checks',
        label: 'Occasional spot checks',
        sublabel: 'Someone looks closely now and then, without a set routine.',
        score: 5,
        category: 'human',
      },
      {
        id: 'tracked',
        label: 'We track acceptance and override rates',
        sublabel: 'We know how often people change or reject the AI’s output, and review it.',
        score: 8,
        category: 'human',
      },
      {
        id: 'calibrated',
        label: 'Review is designed to catch errors',
        sublabel: 'Sources shown by default, seeded test cases, and regular calibration on known answers.',
        score: 10,
        category: 'human',
      },
    ],
  },
  {
    id: 'adoption',
    category: 'human',
    title: 'How do the people whose work changes see it?',
    description:
      'When AI is pitched as replacing people, they drag their feet, game it and publicise its mistakes. When it makes them better at their job, they adopt it.',
    options: [
      {
        id: 'replacement',
        label: 'As something that replaces them',
        sublabel: 'It was introduced as headcount or cost reduction.',
        score: 2,
        category: 'human',
      },
      {
        id: 'imposed',
        label: 'As a tool they were handed',
        sublabel: 'Neutral, but they were not involved in shaping it.',
        score: 5,
        category: 'human',
      },
      {
        id: 'co_designed',
        label: 'As something that makes them better',
        sublabel: 'They helped design it, and they own the outcomes it contributes to.',
        score: 10,
        category: 'human',
      },
    ],
  },

  // AI-NATIVE OPERATING MODEL
  {
    id: 'workflow',
    category: 'operating',
    title: 'Was the workflow redesigned around AI, or was AI added to it?',
    description:
      'AI-native means the process assumes AI does the first pass and people spend their time on judgement, not that a chat panel sits next to the old process.',
    options: [
      {
        id: 'bolt_on',
        label: 'Added on the side',
        sublabel: 'A chatbot or AI button next to an unchanged process.',
        score: 3,
        category: 'operating',
      },
      {
        id: 'automated_steps',
        label: 'Some steps automated',
        sublabel: 'AI takes over individual tasks, but the flow around them is the same.',
        score: 6,
        category: 'operating',
      },
      {
        id: 'redesigned',
        label: 'Redesigned around AI',
        sublabel: 'AI does the first pass by default; roles and hand-offs were changed to fit.',
        score: 9,
        category: 'operating',
      },
      {
        id: 'ai_first',
        label: 'Designed AI-first from day one',
        sublabel: 'The product or process would not exist in this form without AI.',
        score: 10,
        category: 'operating',
      },
    ],
  },
  {
    id: 'success_metric',
    category: 'operating',
    title: 'How do you know the AI is working?',
    description:
      'Time and cost saved are replacement metrics: easy to report, but capped at the cost of the task. Augmentation shows up in better outcomes.',
    options: [
      {
        id: 'none',
        label: 'We do not measure it yet',
        sublabel: 'Anecdotes and impressions.',
        score: 1,
        category: 'operating',
      },
      {
        id: 'time_cost',
        label: 'Time or cost saved',
        sublabel: 'Hours saved, tickets deflected, headcount avoided.',
        score: 5,
        category: 'operating',
      },
      {
        id: 'outcomes',
        label: 'Quality of outcomes',
        sublabel: 'Fewer errors, better products, higher conversion or satisfaction.',
        score: 8,
        category: 'operating',
      },
      {
        id: 'complementarity',
        label: 'Outcomes, with and without AI',
        sublabel: 'We compare people-plus-AI against people alone, so we know the combination wins.',
        score: 10,
        category: 'operating',
      },
    ],
  },
  {
    id: 'feedback_loop',
    category: 'operating',
    title: 'What happens to the corrections people make?',
    description:
      'Every edit a person makes to AI output is a free example of what "right" looks like. AI-native teams keep them.',
    options: [
      {
        id: 'lost',
        label: 'They are lost',
        sublabel: 'People fix the output and move on.',
        score: 2,
        category: 'operating',
      },
      {
        id: 'ad_hoc',
        label: 'Occasional prompt tweaks',
        sublabel: 'Someone adjusts the prompt when a complaint comes in.',
        score: 5,
        category: 'operating',
      },
      {
        id: 'reviewed',
        label: 'Collected and reviewed regularly',
        sublabel: 'Corrections are logged and reviewed on a schedule to improve prompts and data.',
        score: 8,
        category: 'operating',
      },
      {
        id: 'continuous',
        label: 'Each one becomes a test case',
        sublabel: 'Corrections feed the eval set automatically, so the same mistake is caught next time.',
        score: 10,
        category: 'operating',
      },
    ],
  },
  {
    id: 'model_watch',
    category: 'operating',
    title: 'When a new model ships, how do you find out what it changes for you?',
    description:
      'Each model generation moves some tasks from "almost works" to "works". Teams with a list of near-misses and a way to re-test them move first.',
    options: [
      {
        id: 'none',
        label: 'We do not really track it',
        sublabel: 'We use whatever model we picked at the start.',
        score: 2,
        category: 'operating',
      },
      {
        id: 'news',
        label: 'We read about it',
        sublabel: 'Someone follows announcements and tries things informally.',
        score: 4,
        category: 'operating',
      },
      {
        id: 'backlog',
        label: 'We keep an "almost works" list',
        sublabel: 'Use cases that nearly worked are written down to revisit.',
        score: 7,
        category: 'operating',
      },
      {
        id: 'rerun',
        label: 'We re-run our tests on each new model',
        sublabel: 'Within a week we know what got better, including the "almost works" list.',
        score: 10,
        category: 'operating',
      },
    ],
  },
  {
    id: 'defensibility',
    category: 'operating',
    title: 'If your model provider shipped your feature tomorrow, what would still be yours?',
    description:
      'A thin wrapper around someone else’s model can be absorbed overnight. Workflow integration, proprietary data and the loop between them are harder to copy.',
    options: [
      {
        id: 'thin',
        label: 'Not much',
        sublabel: 'It is mostly a prompt and an interface on top of a general model.',
        score: 2,
        category: 'operating',
      },
      {
        id: 'ux',
        label: 'The experience and workflow fit',
        sublabel: 'It is woven into how our users already work.',
        score: 6,
        category: 'operating',
      },
      {
        id: 'data_ux',
        label: 'Our data plus the workflow',
        sublabel: 'Proprietary data and feedback that a general model does not have.',
        score: 9,
        category: 'operating',
      },
      {
        id: 'internal_only',
        label: 'It is for our own operations',
        sublabel: 'An internal capability rather than a product, so the edge is in how we run.',
        score: 8,
        category: 'operating',
      },
    ],
  },
];

/** Every question the AI-Native report needs before it can be generated. */
export function isNativeComplete(answers: Record<string, string>): boolean {
  return NATIVE_QUESTIONS.every((question) => Boolean(answers[question.id]));
}

export type EdgeProfile = 'rough' | 'mixed' | 'sharp';

export interface NativePillar {
  key: NativeCategory;
  label: string;
  score: number;
  description: string;
}

export interface AiNativeReport {
  overallScore: number;
  tier: {
    title: string;
    badge: string;
    summary: string;
    tone: 'good' | 'warn' | 'bad';
  };
  /** True when the answers trip the "sharp-edged autopilot" rule, which caps the tier. */
  autopilotMismatch: boolean;
  pillars: NativePillar[];
  radarDimensions: Array<{
    key: string;
    label: string;
    score: number;
    fullMark: number;
    description: string;
  }>;
  edge: {
    profile: EdgeProfile;
    title: string;
    /** 0 - 100 position on the rough → sharp scale, for the gauge. */
    position: number;
    reliabilityBar: string;
    explanation: string;
    play: { title: string; description: string };
  };
  /** Present only when a long, end-checked chain makes compounding worth spelling out. */
  compounding: { steps: number; perStep: number; endToEnd: number } | null;
  trustRisk: {
    title: string;
    description: string;
    tone: 'good' | 'warn' | 'bad';
  };
  priorityActions: Array<{
    title: string;
    description: string;
    timing: 'Immediate (Week 1-2)' | 'Next (Week 3-4)' | 'Mid-term (Month 2)';
  }>;
  realityCheck: string[];
}

function optionScore(answers: Record<string, string>, questionId: string): number | null {
  const question = NATIVE_QUESTIONS.find((q) => q.id === questionId);
  const option = question?.options.find((o) => o.id === answers[questionId]);
  return option ? option.score : null;
}

/**
 * The reliability bar: 0 for a rough-edged task where mistakes are cheap, up to 4 for a
 * sharp-edged one where a mistake does real harm. Unanswered inputs count as the middle.
 */
export function reliabilityBar(answers: Record<string, string>): number {
  const shape = answers['use_case_shape'];
  const cost = answers['error_cost'];
  const shapeRisk = shape === 'rough' ? 0 : shape === 'sharp' ? 2 : 1;
  const costRisk = cost === 'cheap' ? 0 : cost === 'harm' ? 2 : 1;
  return shapeRisk + costRisk;
}

/**
 * How well the AI's role fits the bar. Handing a high-bar task to the AI on its own is the
 * classic "interface writes a check the AI cannot cash" failure, unless every output is checked
 * against a known answer — which is how coding agents get away with sharp-edged work.
 */
export function roleScore(answers: Record<string, string>): number | null {
  const role = answers['ai_role'];
  if (!role) return null;
  const bar = reliabilityBar(answers);
  const autoVerified = answers['verifiability'] === 'ground_truth';

  if (role === 'augment') return 10;
  if (role === 'background') return 9;
  if (role === 'approve') return bar >= 3 ? 7 : 8;
  // replace
  if (bar <= 1) return 8;
  if (autoVerified) return bar >= 3 ? 6 : 7;
  return bar >= 3 ? 1 : 4;
}

function average(values: Array<number | null>): number | null {
  const present = values.filter((v): v is number => v !== null);
  if (present.length === 0) return null;
  return present.reduce((a, b) => a + b, 0) / present.length;
}

/** 0 - 10 average → 0 - 100, with 50 for a pillar nobody has answered yet. */
function toPercent(value: number | null): number {
  return value === null ? 50 : Math.round(value * 10);
}

/** Sharp-edged, high-stakes, nothing checks it, and nobody is in the loop. */
export function isAutopilotMismatch(answers: Record<string, string>): boolean {
  const unattended = answers['ai_role'] === 'replace' || answers['handoff'] === 'no_handoff';
  return (
    reliabilityBar(answers) >= 3 &&
    unattended &&
    answers['verifiability'] !== 'ground_truth' &&
    answers['verifiability'] !== 'partial_auto'
  );
}

export function calculateAiNative(answers: Record<string, string>): AiNativeReport {
  const s = (id: string) => optionScore(answers, id);

  const fitRaw = average([s('use_case_shape'), s('error_cost'), s('verifiability'), s('chain_length')]);
  const humanRaw = average([roleScore(answers), s('handoff'), s('reliance'), s('adoption')]);
  const operatingRaw = average([
    s('workflow'),
    s('success_metric'),
    s('feedback_loop'),
    s('model_watch'),
    s('defensibility'),
  ]);

  const fitScore = toPercent(fitRaw);
  const humanScore = toPercent(humanRaw);
  const operatingScore = toPercent(operatingRaw);

  const overallScore = Math.round(fitScore * 0.35 + humanScore * 0.35 + operatingScore * 0.3);

  // Tiers
  type TierKey = 'native' | 'augmented' | 'assisted' | 'curious';
  let tierKey: TierKey =
    overallScore >= 80 ? 'native' : overallScore >= 60 ? 'augmented' : overallScore >= 40 ? 'assisted' : 'curious';

  // Hard rule, as in the blast-radius check: a good average elsewhere does not make a
  // sharp-edged, high-stakes task safe to run on autopilot with nothing checking it.
  const autopilotMismatch = isAutopilotMismatch(answers);
  if (autopilotMismatch && (tierKey === 'native' || tierKey === 'augmented')) tierKey = 'assisted';

  const tierCopy: Record<TierKey, AiNativeReport['tier']> = {
    native: {
      title: 'AI-Native',
      badge: 'Built around AI (Tier 1)',
      summary:
        'Your use case suits what AI does well today, people and AI each do the part they are best at, and the work, metrics and learning loop are organised around it. The job now is to keep re-testing as models improve and widen the loop to the next workflow.',
      tone: 'good',
    },
    augmented: {
      title: 'AI-Augmented',
      badge: 'Augmenting people well (Tier 2)',
      summary:
        'AI is genuinely making people better at the work, and the use case is shaped sensibly. What separates you from AI-native is usually the operating loop: outcome metrics, corrections that feed back in, and a routine for each new model.',
      tone: 'good',
    },
    assisted: {
      title: 'AI-Assisted',
      badge: 'AI added to the old way of working (Tier 3)',
      summary: autopilotMismatch
        ? 'Parts of this are well set up, but a sharp-edged, high-stakes task is running without a person or an automatic check. That caps the rating here regardless of the rest, because it is the setup most likely to produce the visible mistake that makes everyone stop trusting it.'
        : 'AI is helping with tasks, but the work around it has not changed much and there is little to tell you whether people with AI now do better than people without it. That is where most teams are; the gains come from redesigning one workflow properly.',
      tone: 'warn',
    },
    curious: {
      title: 'AI-Curious',
      badge: 'Early days (Tier 4)',
      summary:
        'Either the main use case is one today’s AI struggles to do reliably, or the human side has not been designed yet. Start with a rough-edged task where a decent draft is already useful, and design the hand-off before widening it.',
      tone: 'bad',
    },
  };

  const pillars: NativePillar[] = [
    {
      key: 'fit',
      label: 'Use-Case Fit',
      score: fitScore,
      description:
        fitScore >= 75
          ? 'A use case today’s AI can do reliably, or one where wrong answers are caught before they matter.'
          : fitScore >= 50
            ? 'Workable, but the reliability bar is high relative to how errors are caught.'
            : 'A sharp-edged, high-stakes use case with little to catch errors. Hard to make work today as specified.',
    },
    {
      key: 'human',
      label: 'Human + AI Design',
      score: humanScore,
      description:
        humanScore >= 75
          ? 'The AI’s role matches the stakes, hand-offs carry context, and review is designed to catch errors.'
          : humanScore >= 50
            ? 'Sensible roles, but the hand-off or the review routine leaves room for rubber-stamping.'
            : 'The human side is undesigned: raw hand-offs, unchecked trust, or AI framed as a replacement.',
    },
    {
      key: 'operating',
      label: 'Operating Model',
      score: operatingScore,
      description:
        operatingScore >= 75
          ? 'Workflow redesigned around AI, outcomes measured, and corrections and new models feed a learning loop.'
          : operatingScore >= 50
            ? 'Some redesign, but metrics are replacement-style or corrections are not captured.'
            : 'AI sits beside an unchanged process with no measure of whether it helps.',
    },
  ];

  const pair = (a: number | null, b: number | null, c: number | null = null) => toPercent(average([a, b, c]));
  const radarDimensions: AiNativeReport['radarDimensions'] = [
    {
      key: 'problem_fit',
      label: 'Problem Fit',
      score: pair(s('use_case_shape'), s('error_cost')),
      fullMark: 100,
      description: 'Rough-edged work and cheap mistakes score high; sharp-edged, high-stakes work scores low.',
    },
    {
      key: 'verifiability',
      label: 'Verifiability',
      score: pair(s('verifiability'), s('chain_length')),
      fullMark: 100,
      description: 'Whether wrong answers are caught automatically, and at every step of a chain.',
    },
    {
      key: 'handoff',
      label: 'Human Hand-off',
      score: pair(roleScore(answers), s('handoff')),
      fullMark: 100,
      description: 'Whether the AI’s role fits the stakes, and the seam between AI and person carries context.',
    },
    {
      key: 'trust',
      label: 'Trust Calibration',
      score: pair(s('reliance'), s('adoption')),
      fullMark: 100,
      description: 'Avoiding both rubber-stamping and the swing to distrust after a visible mistake.',
    },
    {
      key: 'workflow_metrics',
      label: 'Workflow & Metrics',
      score: pair(s('workflow'), s('success_metric')),
      fullMark: 100,
      description: 'Work redesigned around AI, and success measured in outcomes, not only time saved.',
    },
    {
      key: 'learning_moat',
      label: 'Learning & Moat',
      score: pair(s('feedback_loop'), s('model_watch'), s('defensibility')),
      fullMark: 100,
      description: 'Corrections and new models feed back in, building something a model release cannot copy.',
    },
  ];

  // Edge profile: the rough → sharp read, the reliability bar, and the play for today.
  const shape = answers['use_case_shape'];
  const cost = answers['error_cost'];
  const verify = answers['verifiability'];
  const profile: EdgeProfile = shape === 'sharp' ? 'sharp' : shape === 'rough' ? 'rough' : 'mixed';
  const bar = reliabilityBar(answers);
  const autoChecked = verify === 'ground_truth' || verify === 'partial_auto';

  const reliabilityText =
    profile === 'rough'
      ? cost === 'harm'
        ? 'Useful as a draft, but every draft needs a careful read'
        : 'Useful once it gets you most of the way (around 80%)'
      : profile === 'mixed'
        ? 'The draft can be rough; the facts inside it cannot'
        : cost === 'harm'
          ? 'Needs 99%+ on your own cases, and several nines in places'
          : cost === 'cheap'
            ? 'Needs roughly 95% before it saves more time than it costs'
            : 'Needs high-90s accuracy on your own cases';

  const edgeTitle =
    profile === 'rough' ? 'Rough-edged' : profile === 'mixed' ? 'Mixed: rough draft, sharp details' : 'Sharp-edged';

  const edgeExplanation =
    profile === 'rough'
      ? 'Many different answers would be acceptable, so getting most of the way is still a real head start. This is where AI earns its keep earliest, and where people plus AI most often beat either alone.'
      : profile === 'mixed'
        ? 'The overall output is forgiving, but it contains details — figures, names, citations — that are either right or wrong. Those details are where the embarrassing failures come from.'
        : 'There is one right answer, so a nearly-right output is simply wrong. AI is usable here only above a reliability threshold, and that threshold is usually higher than the first demo suggests.';

  let play: AiNativeReport['edge']['play'];
  if (profile === 'rough') {
    play = {
      title: 'Use today’s models now, and iterate',
      description:
        'Run twenty of your real cases through a current model this week. If the output is a useful starting point, ship it as a draft that a person finishes, and measure how much better the finished work gets.',
    };
  } else if (autoChecked) {
    play = {
      title: 'Let the automatic check do the heavy lifting',
      description:
        'Because a wrong answer can be caught by a check, the AI can retry until it passes — the same reason coding agents work with tests. Widen what the check covers before you widen what the AI is allowed to do.',
    };
  } else if (profile === 'mixed') {
    play = {
      title: 'Separate the rough part from the sharp part',
      description:
        'Let the AI write the draft, but source every figure, name and citation from your own systems and verify them mechanically before anything leaves the building. The draft can be creative; the facts cannot.',
    };
  } else {
    play = {
      title: 'Turn the decision into a brief',
      description:
        'Instead of having the AI make the call, have it lay out the evidence, the risk factors and its suggestion for the person who decides. That is a rough-edged version of the same problem, and it works today. Revisit full automation when your measured accuracy clears the bar.',
    };
  }

  // Compounding, spelled out only where it changes the picture.
  const chain = answers['chain_length'];
  let compounding: AiNativeReport['compounding'] = null;
  if (chain === 'long_unchecked' || (chain === 'few' && profile === 'sharp')) {
    const steps = chain === 'few' ? 4 : 6;
    const perStep = 95;
    compounding = { steps, perStep, endToEnd: Math.round(Math.pow(perStep / 100, steps) * 100) };
  }

  // Trust: rubber-stamping on one side, rejection on the other.
  const reliance = answers['reliance'];
  const adoption = answers['adoption'];
  let trustRisk: AiNativeReport['trustRisk'];
  if (reliance === 'trust' && adoption === 'replacement') {
    trustRisk = {
      title: 'Both trust failures at once',
      description:
        'Reviewers wave output through, and the people affected see it as a threat. The first visible mistake will be caught by the people with the most reason to publicise it, and trust swings from too much to none.',
      tone: 'bad',
    };
  } else if (reliance === 'trust' || (reliance === 'spot_checks' && bar >= 3)) {
    trustRisk = {
      title: 'Over-reliance risk',
      description:
        'Output that looks reasonable goes through, and longer AI explanations make wrong answers more convincing, not less. Expect a mistake to slip past review — then an over-correction to distrust.',
      tone: bar >= 2 ? 'bad' : 'warn',
    };
  } else if (adoption === 'replacement') {
    trustRisk = {
      title: 'Rejection risk',
      description:
        'People who see AI as replacing them tend to work around it and point out its errors. Trust in an algorithm is more brittle than trust in a colleague: one visible mistake can end adoption.',
      tone: 'warn',
    };
  } else if (reliance === 'tracked' || reliance === 'calibrated') {
    trustRisk = {
      title: 'Calibrated',
      description:
        'You measure how often people accept or override the AI, so you will see rubber-stamping or quiet abandonment in the numbers before it shows up as an incident.',
      tone: 'good',
    };
  } else {
    trustRisk = {
      title: 'Unmeasured',
      description:
        'Nothing is obviously wrong, but without acceptance and override rates you cannot tell whether people are rubber-stamping the AI or quietly ignoring it.',
      tone: 'warn',
    };
  }

  // Priority actions, most urgent first.
  const actions: AiNativeReport['priorityActions'] = [];

  if (autopilotMismatch) {
    actions.push({
      title: 'Take the sharp-edged decision off autopilot',
      description:
        'Put a person back on the final call, with the AI writing the brief they decide from. Do not let the interface promise more reliability than the model delivers on your cases; restore autonomy only once measured accuracy clears your bar.',
      timing: 'Immediate (Week 1-2)',
    });
  }

  if (profile !== 'rough' && (verify === 'no_check' || verify === 'human_review')) {
    actions.push({
      title: 'Write the automatic check before widening autonomy',
      description:
        'Pick the one property a correct answer always has — totals reconcile, the cited record exists, the route matches a rule — and check it in code on every output. A check that catches half the errors still halves the review load.',
      timing: 'Immediate (Week 1-2)',
    });
  }

  if (chain === 'long_unchecked') {
    actions.push({
      title: 'Check each link of the chain, not just the end',
      description:
        'Add a validation after every step that can be wrong in only one way (the right record, the right quantity, the right address). Fail the run at the first broken link instead of discovering it in the outcome.',
      timing: 'Immediate (Week 1-2)',
    });
  }

  if (answers['handoff'] === 'raw') {
    actions.push({
      title: 'Design the hand-off, not just the model',
      description:
        'Give whoever receives the AI’s output its sources, its confidence, and a one-click way to send it back. Most AI failures happen at that seam, not inside the model.',
      timing: 'Next (Week 3-4)',
    });
  }

  if (reliance === 'trust' || reliance === 'spot_checks') {
    actions.push({
      title: 'Track how often people override the AI',
      description:
        'Log accept, edit and reject on every reviewed output. A falling edit rate on a task you know is hard means rubber-stamping; a rising reject rate means trust is collapsing. Both show up here first.',
      timing: 'Next (Week 3-4)',
    });
  }

  if (adoption === 'replacement') {
    actions.push({
      title: 'Reframe it with the people doing the work',
      description:
        'Ask the people affected which part of their job they would hand over first, and let them own the quality bar. Augmentation they designed gets used; replacement imposed on them gets gamed.',
      timing: 'Next (Week 3-4)',
    });
  }

  if (answers['success_metric'] === 'none' || answers['success_metric'] === 'time_cost') {
    actions.push({
      title: 'Measure outcomes, with and without AI',
      description:
        'Alongside time saved, pick one outcome that matters — error rate, quality score, conversion — and compare a sample done with AI against one done without. If the combination does not win, you have learned something cheaply.',
      timing: 'Next (Week 3-4)',
    });
  }

  if (answers['feedback_loop'] === 'lost' || answers['feedback_loop'] === 'ad_hoc') {
    actions.push({
      title: 'Turn every correction into a test case',
      description:
        'Store the AI output and the human-corrected version side by side. Fifty of those is a better eval set than anything you could write from scratch, and it grows on its own.',
      timing: 'Mid-term (Month 2)',
    });
  }

  if (answers['workflow'] === 'bolt_on') {
    actions.push({
      title: 'Redesign one workflow end to end',
      description:
        'Pick the workflow where AI already helps most and redraw it assuming AI does the first pass. Change who reviews what and when, rather than adding another AI button to the old process.',
      timing: 'Mid-term (Month 2)',
    });
  }

  if (answers['model_watch'] === 'none' || answers['model_watch'] === 'news') {
    actions.push({
      title: 'Keep an "almost works" list and re-test it',
      description:
        'Write down every use case that was nearly good enough. When a new model ships, re-run them against your test set: tasks move from rough-edged to sharp-edged one model generation at a time.',
      timing: 'Mid-term (Month 2)',
    });
  }

  if (answers['defensibility'] === 'thin') {
    actions.push({
      title: 'Build what a model release cannot copy',
      description:
        'Invest in the parts a general model does not have: your data, your corrections, and how deeply the tool sits in your users’ workflow. A prompt and an interface can be absorbed in a single launch.',
      timing: 'Mid-term (Month 2)',
    });
  }

  if (actions.length === 0) {
    actions.push({
      title: 'Promote your best rough-edged win',
      description:
        'Take the use case where AI already helps most and measure its accuracy against a bar you set in advance. When it clears it, give it more autonomy; when it does not, you have a precise list of what to fix.',
      timing: 'Mid-term (Month 2)',
    });
  }

  // Reality check: the Bernstein points that apply whatever the score.
  const realityCheck: string[] = [];
  if (profile !== 'rough') {
    realityCheck.push(
      'A better model will not fix a sharp-edged task on its own. Reliability gains are slower than capability gains, and a chain is only as reliable as its weakest step.'
    );
  }
  realityCheck.push(
    'An explanation is not evidence. The longer and more confident the AI’s reasoning, the more plausible a wrong answer looks to a reviewer.'
  );
  if (answers['success_metric'] === 'time_cost') {
    realityCheck.push(
      'Time-saved metrics cap the upside at the cost of the task you replaced. The larger gains come from people doing better work, which only outcome metrics show.'
    );
  }
  realityCheck.push(
    'Trust in AI is brittle. People forgive a colleague’s mistake faster than a system’s, so launch where mistakes are cheap and earn the right to the harder cases.'
  );
  if (answers['defensibility'] === 'thin') {
    realityCheck.push(
      'A wrapper around a general model is a short-term position. Good UX is a real advantage, but the model provider can ship the same feature.'
    );
  }

  return {
    overallScore,
    tier: tierCopy[tierKey],
    autopilotMismatch,
    pillars,
    radarDimensions,
    edge: {
      profile,
      title: edgeTitle,
      position: Math.min(100, Math.round((bar / 4) * 100)),
      reliabilityBar: reliabilityText,
      explanation: edgeExplanation,
      play,
    },
    compounding,
    trustRisk,
    priorityActions: actions.slice(0, 3),
    realityCheck: realityCheck.slice(0, 4),
  };
}

/* ------------------------------------------------------------------ *
 * Combined read across the two scorecards
 * ------------------------------------------------------------------ */

export interface CombinedRead {
  title: string;
  summary: string;
}

/**
 * The two scores answer different questions, so they are never averaged. The combined read is a
 * quadrant: equipped to build (readiness) against built around AI (AI-native).
 */
export function combinedRead(readinessScore: number, nativeScore: number): CombinedRead {
  const ready = readinessScore >= 60;
  const native = nativeScore >= 60;
  if (ready && native) {
    return {
      title: 'Equipped and AI-native',
      summary:
        'You have the foundations to build, and you are pointing them at the right problems in the right way. Scale the pattern to the next workflow, and keep the blast radius bounded as autonomy grows.',
    };
  }
  if (ready && !native) {
    return {
      title: 'Well equipped, not yet AI-native',
      summary:
        'The data, tooling and team are there, but the use case, the human hand-off or the operating loop is holding the value back. The fastest gains are in the AI-Native report, not more infrastructure.',
    };
  }
  if (!ready && native) {
    return {
      title: 'Right design, thin foundations',
      summary:
        'You are aiming AI at the right problems and designing the human side well, but the data, evals and observability underneath will not hold up at scale. Fix the foundations before widening the rollout.',
    };
  }
  return {
    title: 'Early: start with one rough-edged win',
    summary:
      'Both the foundations and the design are early. Pick one task where a decent draft is already useful, put a person in charge of the result, and measure whether the work gets better. Build the rest from there.',
  };
}
