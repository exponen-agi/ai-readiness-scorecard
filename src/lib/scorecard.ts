export type AssessmentTrack = 'existing-product' | 'ai-native';

export type OrganizationStage = 'founder' | 'micro' | 'smb' | 'startup';

/**
 * `blast` belongs to the optional Blast-Radius module, which is scored separately from the
 * readiness categories. Nothing in `QUESTIONS` uses it, so `calculateScorecard` never sees it.
 */
export type ScorecardCategory = 'data' | 'tools' | 'team' | 'blast';

export interface ScorecardOption {
  id: string;
  label: string;
  sublabel?: string;
  score: number; // 0 - 10
  category: ScorecardCategory;
  insight?: string;
}

export interface ScorecardQuestion {
  id: string;
  category: ScorecardCategory;
  title: string;
  description: string;
  appliesTo?: AssessmentTrack[];
  options: ScorecardOption[];
}

export interface ScorecardResponse {
  track: AssessmentTrack;
  stage: OrganizationStage;
  answers: Record<string, string>; // questionId -> optionId
}

export interface CategoryResult {
  score: number;
  label: string;
  description: string;
  strengths: string[];
  gaps: string[];
}

export interface RadarDimension {
  key: string;
  label: string;
  score: number; // 0 - 100
  fullMark: number;
  description: string;
}

export interface ScorecardReport {
  overallScore: number;
  maturityTier: {
    title: string;
    badge: string;
    summary: string;
    color: string;
  };
  categoryScores: {
    data: CategoryResult;
    tools: CategoryResult;
    team: CategoryResult;
  };
  radarDimensions: RadarDimension[];
  priorityActions: Array<{
    title: string;
    description: string;
    timing: 'Immediate (Week 1-2)' | 'Next (Week 3-4)' | 'Mid-term (Month 2)';
  }>;
  whereAiWillNotHelp: string[];
  trackSummary: string;
}

export const STAGE_OPTIONS: Array<{ id: OrganizationStage; label: string; description: string }> = [
  {
    id: 'founder',
    label: 'Solo Founder / Pre-Seed',
    description: '1-3 people, building an initial MVP or validating market problem.',
  },
  {
    id: 'micro',
    label: 'Micro Business (2-10 team)',
    description: 'Small agile team with active customers or working product.',
  },
  {
    id: 'smb',
    label: 'SMB (11-50 team)',
    description: 'Established business looking to automate operations or upgrade core software.',
  },
  {
    id: 'startup',
    label: 'Funded / Scaling Startup',
    description: 'Engineering team scaling product features and AI capabilities rapidly.',
  },
];

export const QUESTIONS: ScorecardQuestion[] = [
  // DATA CATEGORY
  {
    id: 'data_structure',
    category: 'data',
    title: 'How structured and accessible is your domain data?',
    description: 'AI models are only as good as the context and proprietary data you feed them.',
    options: [
      {
        id: 'no_data',
        label: 'Scattered or uncollected',
        sublabel: 'Data sits across disparate docs, PDFs, emails, or has not been collected yet.',
        score: 2,
        category: 'data',
      },
      {
        id: 'basic_db',
        label: 'Standard relational DB / APIs',
        sublabel: 'Clean Postgres/MySQL databases and standard SaaS APIs, but no dedicated vector/search index.',
        score: 6,
        category: 'data',
      },
      {
        id: 'hybrid_indexed',
        label: 'Curated, searchable & indexed',
        sublabel: 'Structured tables + searchable knowledge base with clean schemas and metadata.',
        score: 9,
        category: 'data',
      },
      {
        id: 'realtime_pipeline',
        label: 'Production data pipelines with validation',
        sublabel: 'Automated ingestion, versioned datasets, and access control policies in place.',
        score: 10,
        category: 'data',
      },
    ],
  },
  {
    id: 'data_privacy',
    category: 'data',
    title: 'How do you handle customer data privacy & compliance?',
    description: 'Enterprise readiness depends on data isolation, PII sanitization, and model policies.',
    options: [
      {
        id: 'no_policy',
        label: 'No formal AI data policy yet',
        sublabel: 'Using public AI web interfaces or default API endpoints without data retention agreements.',
        score: 2,
        category: 'data',
      },
      {
        id: 'zero_retention',
        label: 'Commercial zero-data-retention APIs',
        sublabel: 'Using verified enterprise API endpoints (Anthropic / OpenAI / Gemini zero-retention).',
        score: 7,
        category: 'data',
      },
      {
        id: 'strict_sanitized',
        label: 'Anonymized context & strict tenant isolation',
        sublabel: 'PII stripping before prompt generation, per-tenant vector partitioning, and audit logging.',
        score: 10,
        category: 'data',
      },
    ],
  },

  // TOOLS & INFRASTRUCTURE CATEGORY
  {
    id: 'eval_and_testing',
    category: 'tools',
    title: 'How do you test and evaluate AI outputs?',
    description: 'Without automated evals, prompt changes can break production silently.',
    options: [
      {
        id: 'manual_vibe',
        label: 'Manual "vibe checks"',
        sublabel: 'Testing by typing prompts by hand and judging if the response looks decent.',
        score: 2,
        category: 'tools',
      },
      {
        id: 'basic_unit_tests',
        label: 'Basic golden datasets & regression tests',
        sublabel: 'A curated list of 20-50 real questions/inputs tested before major releases.',
        score: 6,
        category: 'tools',
      },
      {
        id: 'automated_eval_pipeline',
        label: 'Automated CI/CD eval suite with LLM-as-judge',
        sublabel: 'Continuous evaluation on accuracy, latency, toxicity, and hallucinations on every build.',
        score: 10,
        category: 'tools',
      },
    ],
  },
  {
    id: 'tool_architecture',
    category: 'tools',
    title: 'What is your AI architecture & tooling setup?',
    description: 'From simple direct API calls to modular agent frameworks and hybrid RAG.',
    options: [
      {
        id: 'single_prompt',
        label: 'Direct monolithic API calls',
        sublabel: 'Single prompts sent directly to a single provider with minimal retry or fallback logic.',
        score: 3,
        category: 'tools',
      },
      {
        id: 'rag_basic',
        label: 'Standard RAG or LangChain/LlamaIndex stack',
        sublabel: 'Vector search embeddings piped into an LLM context window.',
        score: 7,
        category: 'tools',
      },
      {
        id: 'modular_agents',
        label: 'Modular Agentic Workflows / Hybrid Search',
        sublabel: 'Deterministically orchestrated agents, hybrid semantic+keyword search, and fallback routers.',
        score: 10,
        category: 'tools',
      },
    ],
  },
  {
    id: 'observability',
    category: 'tools',
    title: 'How do you monitor AI costs, latency, and failure rates?',
    description: 'Production AI requires token tracking, latency monitoring, and tracing.',
    options: [
      {
        id: 'no_monitoring',
        label: 'Monthly billing check only',
        sublabel: 'No tracing for failed prompts, token usage per user, or latency spikes.',
        score: 2,
        category: 'tools',
      },
      {
        id: 'basic_logging',
        label: 'Log collection & basic error alerts',
        sublabel: 'Logging prompt errors and tracking general API consumption in server logs.',
        score: 6,
        category: 'tools',
      },
      {
        id: 'full_tracing',
        label: 'Granular tracing (Langfuse, Arize, Helicone, or OpenTelemetry)',
        sublabel: 'Full trace graphs, per-feature token breakdown, latency heatmaps, and user feedback loops.',
        score: 10,
        category: 'tools',
      },
    ],
  },

  // TEAM & EXECUTION CATEGORY
  {
    id: 'team_ai_proficiency',
    category: 'team',
    title: 'How does your engineering team build with AI today?',
    description: 'AI-native teams combine disciplined software engineering with agentic tooling.',
    options: [
      {
        id: 'beginners',
        label: 'Occasional Chatbot / Copilot use',
        sublabel: 'Engineers use ChatGPT for code snippets, but product architecture is 100% traditional.',
        score: 3,
        category: 'team',
      },
      {
        id: 'intermediate',
        label: 'Building prototypes with APIs & SDKs',
        sublabel: 'Developers have built working AI features but lack formal guardrails, evals, and agent design patterns.',
        score: 6,
        category: 'team',
      },
      {
        id: 'advanced_sdlc',
        label: 'AI-assisted SDLC & Agent Engineering',
        sublabel: 'Team uses coding agents, rigorous prompt versioning, automated testing, and human-in-the-loop review.',
        score: 10,
        category: 'team',
      },
    ],
  },
  {
    id: 'human_loop_guardrails',
    category: 'team',
    title: 'How do you handle AI mistakes, fallbacks, and human review?',
    description: 'All AI models make errors. The difference between success and disaster is how you handle them.',
    options: [
      {
        id: 'direct_to_user',
        label: 'Direct unfiltered output to users',
        sublabel: 'Outputs go straight to customers without validation or safety guardrails.',
        score: 2,
        category: 'team',
      },
      {
        id: 'human_approval',
        label: 'Human-in-the-loop for high-risk actions',
        sublabel: 'AI generates drafts or suggestions; humans verify before execution or sending.',
        score: 7,
        category: 'team',
      },
      {
        id: 'multi_tier_guardrails',
        label: 'Multi-layer validation + human escalation',
        sublabel: 'Deterministic schema verification, confidence gating, automated fallbacks, and human review queue.',
        score: 10,
        category: 'team',
      },
    ],
  },
  {
    id: 'problem_validation',
    category: 'team',
    title: 'What is the primary business reason for adding AI?',
    description: 'AI works wonders on specific leverage points, but cannot fix broken product-market fit.',
    options: [
      {
        id: 'fomo_or_investors',
        label: 'Investor/Market pressure or general "AI feature"',
        sublabel: 'Adding AI because everyone else is doing it, without a proven customer pain point.',
        score: 3,
        category: 'team',
      },
      {
        id: 'efficiency_boost',
        label: '10x speedup of existing validated workflow',
        sublabel: 'Automating high-frequency tasks where users already spend hours doing manual work.',
        score: 8,
        category: 'team',
      },
      {
        id: 'net_new_capability',
        label: 'Enabling an experience impossible without AI',
        sublabel: 'Unlocking unstructured data synthesis, autonomous workflows, or real-time intelligent agents.',
        score: 10,
        category: 'team',
      },
    ],
  },
];

export function calculateScorecard(response: ScorecardResponse): ScorecardReport {
  let dataTotal = 0;
  let dataCount = 0;
  let toolsTotal = 0;
  let toolsCount = 0;
  let teamTotal = 0;
  let teamCount = 0;

  const userAnswers = response.answers;

  for (const question of QUESTIONS) {
    const selectedOptionId = userAnswers[question.id];
    if (!selectedOptionId) continue;

    const option = question.options.find((o) => o.id === selectedOptionId);
    if (!option) continue;

    if (question.category === 'data') {
      dataTotal += option.score;
      dataCount += 1;
    } else if (question.category === 'tools') {
      toolsTotal += option.score;
      toolsCount += 1;
    } else if (question.category === 'team') {
      teamTotal += option.score;
      teamCount += 1;
    }
  }

  const dataScore = dataCount > 0 ? Math.round((dataTotal / (dataCount * 10)) * 100) : 50;
  const toolsScore = toolsCount > 0 ? Math.round((toolsTotal / (toolsCount * 10)) * 100) : 50;
  const teamScore = teamCount > 0 ? Math.round((teamTotal / (teamCount * 10)) * 100) : 50;

  // Overall Weighted Score: 30% Data, 35% Tools, 35% Team
  const overallScore = Math.round(dataScore * 0.3 + toolsScore * 0.35 + teamScore * 0.35);

  // Tier Classification
  let maturityTier: ScorecardReport['maturityTier'];
  if (overallScore >= 80) {
    maturityTier = {
      title: 'AI-Native Accelerators',
      badge: 'Production Ready (Tier 1)',
      summary:
        'Your team has strong fundamentals, solid infrastructure, and disciplined engineering practices. You are ready to ship advanced multi-agent workflows and complex AI capabilities.',
      color: 'text-emerald-600 dark:text-emerald-400',
    };
  } else if (overallScore >= 60) {
    maturityTier = {
      title: 'Emerging & Capable',
      badge: 'Ready with Guardrails (Tier 2)',
      summary:
        'You have working prototypes and good engineering momentum, but need formal evaluation suites and tighter data hygiene before scaling to high-stakes traffic.',
      color: 'text-blue-600 dark:text-blue-400',
    };
  } else if (overallScore >= 40) {
    maturityTier = {
      title: 'Foundational Builder',
      badge: 'Foundations Needed (Tier 3)',
      summary:
        'You have clear product ambition, but reliance on manual "vibe checks" or unstructured data will cause reliability and cost issues. Fix the core pipelines first.',
      color: 'text-amber-600 dark:text-amber-400',
    };
  } else {
    maturityTier = {
      title: 'Exploration Phase',
      badge: 'High Risk / Early Discovery (Tier 4)',
      summary:
        'You are at the very beginning. Adding AI before defining clear workflows and data boundaries will waste runway. Start with small, non-critical automations.',
      color: 'text-rose-600 dark:text-rose-400',
    };
  }

  // Category Findings
  const dataResult: CategoryResult = {
    score: dataScore,
    label: 'Data Foundation',
    description:
      dataScore >= 75
        ? 'High data clarity. Structured access, clear privacy boundaries, and ready for semantic search.'
        : dataScore >= 50
          ? 'Moderate data readiness. Basic databases exist, but indexing and PII policies need formalization.'
          : 'Data bottleneck. Information is fragmented across unstructured documents with no retrieval pipeline.',
    strengths:
      dataScore >= 70
        ? ['Good database foundation and privacy awareness']
        : ['Clear understanding of current data silos'],
    gaps:
      dataScore < 70
        ? ['Lack of hybrid keyword + semantic indexing', 'Unclear zero-retention data boundaries']
        : [],
  };

  const toolsResult: CategoryResult = {
    score: toolsScore,
    label: 'Tools & Infrastructure',
    description:
      toolsScore >= 75
        ? 'Robust tooling stack. Automated evals, tracing, and multi-model fallback routing.'
        : toolsScore >= 50
          ? 'Basic prototype setup. Missing automated regression evals or token-level observability.'
          : 'High risk of silent failures. Relies on manual testing and unmonitored API calls.',
    strengths:
      toolsScore >= 70
        ? ['Systematic evaluation and monitoring in place']
        : ['Working API integrations'],
    gaps:
      toolsScore < 70
        ? ['Manual "vibe check" testing instead of automated golden datasets', 'No token/latency tracing']
        : [],
  };

  const teamResult: CategoryResult = {
    score: teamScore,
    label: 'Team & Execution',
    description:
      teamScore >= 75
        ? 'High-velocity AI engineering team with human-in-the-loop validation and strong SDLC.'
        : teamScore >= 50
          ? 'Solid developers learning AI patterns; needs structured agentic workflows and guardrails.'
          : 'Early learning curve. Need guidance on prompt engineering architectures and error recovery.',
    strengths:
      teamScore >= 70
        ? ['Human verification built into high-risk paths']
        : ['Active engineering curiosity and problem validation'],
    gaps:
      teamScore < 70
        ? ['Missing deterministic fallback guardrails', 'Over-reliance on LLM raw text responses']
        : [],
  };

  // 2-3 High Leverage Priority Actions
  const priorityActions: ScorecardReport['priorityActions'] = [];

  if (userAnswers['eval_and_testing'] === 'manual_vibe') {
    priorityActions.push({
      title: 'Build a Golden Dataset of 30 Real Edge-Cases',
      description:
        'Stop testing by hand in browser chats. Collect 30 realistic customer queries and expected outputs into a JSON file, and run an automated script before making prompt changes.',
      timing: 'Immediate (Week 1-2)',
    });
  }

  if (userAnswers['data_structure'] === 'no_data' || userAnswers['data_structure'] === 'basic_db') {
    priorityActions.push({
      title: 'Implement Hybrid Keyword + Semantic Search (Hybrid RAG)',
      description:
        'Pure vector search misses product IDs, names, and exact terms. Combine exact keyword match (Postgres FTS / BM25) with vector embeddings to stop AI hallucinations.',
      timing: 'Immediate (Week 1-2)',
    });
  }

  if (userAnswers['observability'] === 'no_monitoring' || userAnswers['observability'] === 'basic_logging') {
    priorityActions.push({
      title: 'Plug In Real-time Tracing & Cost Monitoring',
      description:
        'Integrate a lightweight tracing layer (e.g. Langfuse, OpenTelemetry, or Helicone) to measure token spend, p95 latency, and identify failing prompts before users report them.',
      timing: 'Next (Week 3-4)',
    });
  }

  if (userAnswers['human_loop_guardrails'] === 'direct_to_user') {
    priorityActions.push({
      title: 'Add Schema Validation & Human Approval Queues',
      description:
        'Enforce structured JSON output (e.g. Zod / Pydantic). Never let raw model text trigger sensitive DB mutations without schema verification and human confirmation.',
      timing: 'Immediate (Week 1-2)',
    });
  }

  if (priorityActions.length < 3) {
    if (response.track === 'ai-native') {
      priorityActions.push({
        title: 'Establish Single-Responsibility Agent Boundaries',
        description:
          'Deconstruct giant "all-in-one" prompts into small, deterministic sub-agents with clear inputs, strict tools, and repeatable mock test suites.',
        timing: 'Next (Week 3-4)',
      });
    } else {
      priorityActions.push({
        title: 'Focus AI on a Single High-Friction User Bottleneck',
        description:
          'Pick one workflow where users spend >15 minutes of repetitive work. Ship a focused assistive tool rather than a generic sidebar chatbot.',
        timing: 'Mid-term (Month 2)',
      });
    }
  }

  // Where AI Will NOT Help You (Honest, pragmatic reality check)
  const whereAiWillNotHelp: string[] = [
    'AI cannot fix an unclear value proposition. If users do not want the underlying software or service, adding an AI chatbot will not create product-market fit.',
    'AI cannot compensate for missing, dirty, or corrupted data. LLMs generate plausible-sounding guesses when your database lacks clean source records.',
    'AI should not replace deterministic business logic. Pricing algorithms, access permission checks, and billing math belong in traditional, testable code — not prompts.',
  ];

  if (userAnswers['problem_validation'] === 'fomo_or_investors') {
    whereAiWillNotHelp.unshift(
      'Building AI purely for marketing or investor buzz leads to high API churn. If you cannot measure time saved or errors prevented for a customer, pause development until the problem is proven.'
    );
  }

  // Radar dimensions (6 key engineering pillars)
  const getQuestionScore = (qId: string, fallback = 5) => {
    const selected = userAnswers[qId];
    if (!selected) return fallback * 10;
    const q = QUESTIONS.find((question) => question.id === qId);
    const opt = q?.options.find((o) => o.id === selected);
    return opt ? opt.score * 10 : fallback * 10;
  };

  const radarDimensions: RadarDimension[] = [
    {
      key: 'data_foundation',
      label: 'Data & Indexing',
      score: getQuestionScore('data_structure'),
      fullMark: 100,
      description: 'Proprietary knowledge structuring, schemas, and semantic search readiness.',
    },
    {
      key: 'privacy_governance',
      label: 'Privacy & Policy',
      score: getQuestionScore('data_privacy'),
      fullMark: 100,
      description: 'Tenant isolation, PII sanitization, and enterprise zero-retention compliance.',
    },
    {
      key: 'evals_testing',
      label: 'Evals & Testing',
      score: getQuestionScore('eval_and_testing'),
      fullMark: 100,
      description: 'Golden datasets, automated regression tests, and LLM-as-judge benchmarks.',
    },
    {
      key: 'architecture_rag',
      label: 'Architecture & RAG',
      score: getQuestionScore('tool_architecture'),
      fullMark: 100,
      description: 'Hybrid search (lexical + vector), agent decomposition, and fallback routing.',
    },
    {
      key: 'observability',
      label: 'Tracing & Observability',
      score: getQuestionScore('observability'),
      fullMark: 100,
      description: 'Token tracking, latency heatmaps, user feedback, and error tracing.',
    },
    {
      key: 'guardrails_sdlc',
      label: 'Guardrails & SDLC',
      score: Math.round(
        (getQuestionScore('team_ai_proficiency') +
          getQuestionScore('human_loop_guardrails') +
          getQuestionScore('problem_validation')) /
          3
      ),
      fullMark: 100,
      description: 'Structured schema outputs, human review queues, and AI-native SDLC practices.',
    },
  ];

  const trackSummary =
    response.track === 'existing-product'
      ? 'Adopting AI into an existing product / business operations'
      : 'Building an AI-native product from scratch';

  return {
    overallScore,
    maturityTier,
    categoryScores: {
      data: dataResult,
      tools: toolsResult,
      team: teamResult,
    },
    radarDimensions,
    priorityActions: priorityActions.slice(0, 3),
    whereAiWillNotHelp: whereAiWillNotHelp.slice(0, 4),
    trackSummary,
  };
}

/* ------------------------------------------------------------------ *
 * Blast-Radius Check (optional second module)
 *
 * Readiness asks "are you in a position to build this". Blast radius asks the separate
 * question "when the thing you built misbehaves at 2am, how far does it get". They are
 * scored independently on purpose: mixing them would move every existing readiness score,
 * and a team can be entirely ready to build and still have nothing bounding a runaway loop.
 *
 * These questions live outside `QUESTIONS` so `calculateScorecard` is provably unaffected.
 * ------------------------------------------------------------------ */

/** Answering this decides whether the rest of the module applies at all. */
export const BLAST_GATE_ID = 'agent_autonomy';

export const BLAST_QUESTIONS: ScorecardQuestion[] = [
  {
    id: BLAST_GATE_ID,
    category: 'blast',
    title: 'What can your AI do without a human approving it first?',
    description:
      'Blast radius is set by what an agent is allowed to touch. Everything else in this section depends on this answer.',
    options: [
      {
        id: 'none',
        label: 'Nothing runs unattended',
        sublabel:
          'Every output is read by a person before it goes anywhere. No scheduled jobs, no background agents.',
        score: 10,
        category: 'blast',
      },
      {
        id: 'read_only',
        label: 'Reads and drafts only',
        sublabel:
          'Agents can search, summarise and draft, but a human sends, saves or executes everything.',
        score: 8,
        category: 'blast',
      },
      {
        id: 'internal_writes',
        label: 'Writes to internal systems',
        sublabel:
          'Can update records, files or tickets on its own. Nothing customer-facing, no spending.',
        score: 5,
        category: 'blast',
      },
      {
        id: 'external_actions',
        label: 'Acts on the outside world',
        sublabel:
          'Sends customer messages, moves money, calls paid APIs, or changes production systems unattended.',
        score: 2,
        category: 'blast',
      },
    ],
  },
  {
    id: 'run_cost_baseline',
    category: 'blast',
    title: 'Do you know what a normal run costs?',
    description:
      'You cannot set a meaningful limit on a number you have never measured. This is the prerequisite for every cap below.',
    options: [
      {
        id: 'unknown',
        label: 'No idea',
        sublabel: 'Cost is only ever visible as a monthly provider bill.',
        score: 2,
        category: 'blast',
      },
      {
        id: 'rough',
        label: 'Roughly, from the monthly bill',
        sublabel: 'Spend divided by volume gives an average, but not per agent and not per run.',
        score: 5,
        category: 'blast',
      },
      {
        id: 'measured_avg',
        label: 'Measured per agent',
        sublabel: 'Per-agent cost is tracked, so a typical run cost is known.',
        score: 8,
        category: 'blast',
      },
      {
        id: 'measured_tail',
        label: 'Measured, including the tail',
        sublabel:
          'Median and worst-case run cost known per agent, so limits can be set against real numbers.',
        score: 10,
        category: 'blast',
      },
    ],
  },
  {
    id: 'spend_caps',
    category: 'blast',
    title: 'Which spending limits are actually in place?',
    description:
      'A monthly budget is a lagging control: it trips after the money is gone. The per-run cap is the one that bounds a single bad task.',
    options: [
      {
        id: 'no_caps',
        label: 'None',
        sublabel: 'Nothing stops spend except the provider account limit.',
        score: 1,
        category: 'blast',
      },
      {
        id: 'monthly_only',
        label: 'A monthly budget only',
        sublabel: 'A cap on the card or provider account, noticed well after the fact.',
        score: 4,
        category: 'blast',
      },
      {
        id: 'per_window',
        label: 'Monthly plus daily or hourly',
        sublabel: 'A shorter window catches retry storms, but a single run is still unbounded.',
        score: 7,
        category: 'blast',
      },
      {
        id: 'per_run',
        label: 'Per-run cap as well',
        sublabel: 'Each run has a maximum cost, so one bad task cannot run away on its own.',
        score: 10,
        category: 'blast',
      },
    ],
  },
  {
    id: 'loop_bounding',
    category: 'blast',
    title: 'Is there a hard limit on how long one run can go?',
    description:
      'Most runaway cost is a cheap call repeated, not one expensive call. A step ceiling stops the loop while it is still looping.',
    options: [
      {
        id: 'unbounded',
        label: 'No limit',
        sublabel:
          'An agent keeps calling tools until it decides it is finished, or until something else breaks.',
        score: 1,
        category: 'blast',
      },
      {
        id: 'timeout',
        label: 'A wall-clock timeout',
        sublabel: 'Runs are killed after a set time, though a fast loop can do a lot inside it.',
        score: 5,
        category: 'blast',
      },
      {
        id: 'step_cap',
        label: 'A step or tool-call ceiling',
        sublabel: 'Runs stop after a set number of iterations and report that they hit the ceiling.',
        score: 9,
        category: 'blast',
      },
      {
        id: 'step_and_budget',
        label: 'Step ceiling plus per-run budget',
        sublabel: 'Both a step count and a cost ceiling, whichever trips first.',
        score: 10,
        category: 'blast',
      },
    ],
  },
  {
    id: 'detection',
    category: 'blast',
    title: 'When something goes wrong, how do you find out?',
    description:
      'An alert nobody owns is not a control. The question is who specifically finds out, and how fast.',
    options: [
      {
        id: 'invoice',
        label: 'The invoice, or a customer',
        sublabel: 'A surprise on the monthly bill, or somebody outside the team telling us.',
        score: 1,
        category: 'blast',
      },
      {
        id: 'dashboard',
        label: 'Someone checks a dashboard',
        sublabel: 'The data is there if a person goes looking, but nothing pushes an alert.',
        score: 4,
        category: 'blast',
      },
      {
        id: 'channel_alert',
        label: 'An alert into a shared channel',
        sublabel: 'Automated alerts fire, but no named person owns them out of hours.',
        score: 6,
        category: 'blast',
      },
      {
        id: 'named_owner',
        label: 'A named person is paged',
        sublabel: 'Alerts route to a specific person expected to act, including out of hours.',
        score: 10,
        category: 'blast',
      },
    ],
  },
  {
    id: 'kill_switch',
    category: 'blast',
    title: 'How fast can you stop a misbehaving agent?',
    description:
      'Stopping one agent should be something a single person can do in under a minute, without shipping code.',
    options: [
      {
        id: 'needs_deploy',
        label: 'It needs a code change and a deploy',
        sublabel: 'The fastest possible stop is measured in hours.',
        score: 2,
        category: 'blast',
      },
      {
        id: 'manual_infra',
        label: 'Manually, by someone who knows the infrastructure',
        sublabel: 'Possible in minutes, but only for the one or two people who know where to look.',
        score: 5,
        category: 'blast',
      },
      {
        id: 'revoke_key',
        label: 'Revoke a scoped key or disable a route',
        sublabel: 'Any on-call engineer can cut one agent off in about a minute, with no deploy.',
        score: 9,
        category: 'blast',
      },
      {
        id: 'documented_switch',
        label: 'A documented switch anyone on call can flip',
        sublabel: 'Written down, tested, and usable by whoever is on duty without asking for help.',
        score: 10,
        category: 'blast',
      },
    ],
  },
];

export interface BlastRadiusReport {
  /** True when nothing runs unattended, so the control questions do not apply. */
  notApplicable: boolean;
  /** 0 - 100, averaged across the five control questions. */
  containmentScore: number;
  tier: {
    title: string;
    badge: string;
    summary: string;
    tone: 'good' | 'warn' | 'bad';
  };
  /** Plain-language worst case, four rows: one run, one day, detection, time to stop. */
  containment: Array<{ label: string; value: string; tone: 'good' | 'warn' | 'bad' }>;
  fixes: Array<{ title: string; description: string }>;
}

/** The five control questions; the gate sets the stakes rather than scoring as a control. */
const BLAST_CONTROL_IDS = [
  'run_cost_baseline',
  'spend_caps',
  'loop_bounding',
  'detection',
  'kill_switch',
] as const;

/**
 * The questions that apply given the answers so far.
 *
 * The module opens showing only the gate, and the five control questions appear once it is
 * answered. Two reasons: a section that opens as six questions reads as a chore before the
 * reader knows whether any of it applies to them, and answering the gate with "nothing runs
 * unattended" retires the rest entirely rather than making somebody decline five controls for
 * agents they do not run.
 */
export function applicableBlastQuestions(answers: Record<string, string>): ScorecardQuestion[] {
  const gate = answers[BLAST_GATE_ID];
  if (!gate || gate === 'none') {
    return BLAST_QUESTIONS.filter((question) => question.id === BLAST_GATE_ID);
  }
  return BLAST_QUESTIONS;
}

export function isBlastModuleComplete(answers: Record<string, string>): boolean {
  const applicable = applicableBlastQuestions(answers);
  return applicable.length > 0 && applicable.every((question) => Boolean(answers[question.id]));
}

function blastScore(answers: Record<string, string>, questionId: string): number {
  const question = BLAST_QUESTIONS.find((q) => q.id === questionId);
  const option = question?.options.find((o) => o.id === answers[questionId]);
  return option ? option.score : 0;
}

export function calculateBlastRadius(answers: Record<string, string>): BlastRadiusReport | null {
  const autonomy = answers[BLAST_GATE_ID];
  if (!autonomy) return null;

  if (autonomy === 'none') {
    return {
      notApplicable: true,
      containmentScore: 100,
      tier: {
        title: 'Nothing runs unattended',
        badge: 'Not applicable yet',
        summary:
          'Every AI output passes a person before it does anything, so there is no autonomous blast radius to bound today. Worth re-running this the moment you schedule the first job or let an agent write to a real system — that is the point at which these controls stop being optional.',
        tone: 'good',
      },
      containment: [],
      fixes: [],
    };
  }

  const scores = BLAST_CONTROL_IDS.map((id) => blastScore(answers, id));
  const containmentScore = Math.round((scores.reduce((a, b) => a + b, 0) / (scores.length * 10)) * 100);

  const caps = answers['spend_caps'];
  const loop = answers['loop_bounding'];
  const detect = answers['detection'];
  const stop = answers['kill_switch'];
  const baseline = answers['run_cost_baseline'];

  // Exposure raises the bar: the same controls that are fine for a drafting assistant are not
  // enough for something that can spend money or message customers.
  const threshold =
    autonomy === 'external_actions' ? 85 : autonomy === 'internal_writes' ? 70 : 50;

  let tierKey: 'contained' | 'partly' | 'exposed' | 'unbounded';
  if (containmentScore >= threshold) tierKey = 'contained';
  else if (containmentScore >= threshold - 20) tierKey = 'partly';
  else tierKey = 'exposed';

  // Hard rules dominate the average. A good score elsewhere does not compensate for a loop
  // that nothing bounds, and saying otherwise would be the comfortable answer rather than
  // the true one.
  const nothingBoundsARun = (caps === 'no_caps' || caps === 'monthly_only') && (loop === 'unbounded' || loop === 'timeout');
  if (caps === 'no_caps' && loop === 'unbounded') tierKey = 'unbounded';
  else if (autonomy === 'external_actions' && nothingBoundsARun) tierKey = 'unbounded';
  else if (detect === 'invoice' && tierKey === 'contained') tierKey = 'partly';

  const tierCopy: Record<typeof tierKey, BlastRadiusReport['tier']> = {
    contained: {
      title: 'Contained',
      badge: 'Bounded blast radius',
      summary:
        'A single bad run is bounded, and somebody would find out while it was still happening. Keep the caps under review as the agents take on more, because the bar rises with what they are allowed to touch.',
      tone: 'good',
    },
    partly: {
      title: 'Partly contained',
      badge: 'Gaps worth closing',
      summary:
        'Some controls are real, but there is at least one path where a run can go further than you would want before anyone notices. The gaps below are the ones that matter for what your agents are allowed to do.',
      tone: 'warn',
    },
    exposed: {
      title: 'Exposed',
      badge: 'Under-protected for this autonomy level',
      summary:
        'Your agents can do more than your controls can currently bound. This is a common place to be, and it is usually a few days of work to fix — the controls themselves are commodity, the decisions about them are not.',
      tone: 'bad',
    },
    unbounded: {
      title: 'Unbounded',
      badge: 'No effective ceiling on one run',
      summary:
        'Nothing meaningfully limits how far a single run can go, and the monthly bill is not a control — it reports the damage after the fact. This is the one result on this page we would tell you to act on this week rather than this quarter.',
      tone: 'bad',
    },
  };

  const containment: BlastRadiusReport['containment'] = [
    {
      label: 'Worst case, one run',
      value:
        loop === 'unbounded' && (caps === 'no_caps' || caps === 'monthly_only')
          ? 'Effectively unbounded'
          : caps === 'per_run'
            ? 'Capped in cost'
            : loop === 'step_cap' || loop === 'step_and_budget'
              ? 'Capped in steps, not cost'
              : 'Bounded only by a timeout',
      tone:
        caps === 'per_run' || loop === 'step_and_budget'
          ? 'good'
          : loop === 'unbounded' && caps !== 'per_run'
            ? 'bad'
            : 'warn',
    },
    {
      label: 'Worst case, one day',
      value:
        caps === 'no_caps'
          ? 'No ceiling at all'
          : caps === 'monthly_only'
            ? 'A whole month of budget, in a day'
            : 'Capped by a daily or hourly limit',
      tone: caps === 'no_caps' ? 'bad' : caps === 'monthly_only' ? 'warn' : 'good',
    },
    {
      label: 'How you would find out',
      value:
        detect === 'invoice'
          ? 'The invoice, or a customer'
          : detect === 'dashboard'
            ? 'Only if someone looks'
            : detect === 'channel_alert'
              ? 'An alert nobody owns out of hours'
              : 'A named person is paged',
      tone: detect === 'named_owner' ? 'good' : detect === 'invoice' ? 'bad' : 'warn',
    },
    {
      label: 'Time to stop it',
      value:
        stop === 'needs_deploy'
          ? 'Hours — it needs a deploy'
          : stop === 'manual_infra'
            ? 'Minutes, if the right person is awake'
            : 'About a minute, by whoever is on call',
      tone: stop === 'needs_deploy' ? 'bad' : stop === 'manual_infra' ? 'warn' : 'good',
    },
  ];

  const fixes: BlastRadiusReport['fixes'] = [];

  if (baseline === 'unknown' || baseline === 'rough') {
    fixes.push({
      title: 'Measure the median cost of one run, per agent',
      description:
        'Every cap below is a multiple of this number, so it comes first. A tracing layer you already have access to will do it — Langfuse, Helicone or your gateway. Do not pick a round number before you have looked at the real one.',
    });
  }

  if (loop === 'unbounded' || loop === 'timeout') {
    fixes.push({
      title: 'Put a step ceiling on every agent that loops',
      description:
        'A hard cap on tool calls or iterations per run, after which the agent stops and says so rather than quietly trying again. This is the control that actually stops a runaway; a cost cap only reacts once the money is spent.',
    });
  }

  if (caps === 'no_caps' || caps === 'monthly_only') {
    fixes.push({
      title: 'Add a per-run cost cap, then a daily one',
      description:
        'Set the per-run cap at roughly ten to twenty times your measured median. Lower and normal variance trips it constantly until someone stops reading the alerts; higher and a stuck agent has room to do real damage.',
    });
  }

  if (detect === 'invoice' || detect === 'dashboard') {
    fixes.push({
      title: 'Give every limit a named owner',
      description:
        'Decide who specifically gets alerted when a cap trips, on what device, and what they are allowed to do about it at 2am. A limit that reports into a channel nobody owns overnight is a record, not a control.',
    });
  }

  if (stop === 'needs_deploy') {
    fixes.push({
      title: 'Make stopping one agent a one-minute job',
      description:
        'Route agent traffic through a gateway with per-agent scoped keys, so revoking a key is the kill switch. Anything that needs a deploy to stop is not a switch you can use in the moment you need it.',
    });
  }

  // A setup can clear every "missing control" rule above and still sit under the bar for what
  // its agents are allowed to touch — decent controls, higher stakes. Saying "partly contained"
  // and then offering nothing to do about it is the one result that would deserve the
  // complaint, so fall back to tightening whichever control is currently weakest.
  if (fixes.length === 0 && tierKey !== 'contained') {
    const weakest = BLAST_CONTROL_IDS.map((id) => ({ id, score: blastScore(answers, id) })).sort(
      (a, b) => a.score - b.score
    )[0];

    const upgrades: Record<string, { title: string; description: string }> = {
      run_cost_baseline: {
        title: 'Measure the tail, not just the average',
        description:
          'An average run cost hides the runs that matter. Capture the worst case per agent as well, so the per-run cap is set against the expensive end of the distribution rather than the middle of it.',
      },
      spend_caps: {
        title: 'Add a per-run cap on top of the window limits',
        description:
          'Daily and hourly caps bound a storm of runs but not a single long one. At this autonomy level one run should have its own ceiling, set at roughly ten to twenty times your measured median.',
      },
      loop_bounding: {
        title: 'Pair the step ceiling with a per-run cost ceiling',
        description:
          'A step cap stops a loop but says nothing about how expensive each step was. Running both, whichever trips first, closes the case where a small number of very large calls does the damage.',
      },
      detection: {
        title: 'Put a named owner behind the alerts',
        description:
          'Alerts land somewhere, but nobody specific owns them outside working hours. For agents that can act on the outside world, decide who is paged, on what device, and what they may do about it at 2am.',
      },
      kill_switch: {
        title: 'Write the stop procedure down and test it',
        description:
          'Stopping an agent currently depends on the right person being available. Document the switch, make sure whoever is on call can use it without asking, and rehearse it once so it is known to work.',
      },
    };

    const upgrade = upgrades[weakest.id];
    if (upgrade) fixes.push(upgrade);
  }

  return {
    notApplicable: false,
    containmentScore,
    tier: tierCopy[tierKey],
    containment,
    fixes: fixes.slice(0, 3),
  };
}
