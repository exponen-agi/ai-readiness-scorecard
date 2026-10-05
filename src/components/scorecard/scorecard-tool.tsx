'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  QUESTIONS,
  STAGE_OPTIONS,
  applicableBlastQuestions,
  isBlastModuleComplete,
  calculateBlastRadius,
  calculateScorecard,
  type AssessmentTrack,
  type OrganizationStage,
  type ScorecardResponse,
  type ScorecardReport,
  type BlastRadiusReport,
} from '@/lib/scorecard';
import {
  NATIVE_QUESTIONS,
  NATIVE_SECTIONS,
  calculateAiNative,
  combinedRead,
  type AiNativeReport,
  type NativeCategory,
} from '@/lib/ai-native-scorecard';
import { SpiderChart } from './spider-chart';
import { AiNativeReportView } from './ai-native-report';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/config/site';
import {
  Sparkles,
  ArrowRight,
  Workflow,
  ArrowDown,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Download,
  CheckCircle2,
  ChevronDown,
  Printer,
  Calendar,
  Layers,
  Database,
  Wrench,
  Users,
  Compass,
  Radar,
  Edit3,
  Target,
  UserCheck,
  Gauge,
  Rocket,
} from 'lucide-react';

/** Sections of the questionnaire, in the order they are worked through. */
type SectionId = 'context' | 'data' | 'tools' | 'team' | 'blast' | NativeCategory;

/** Which of the two scorecards the reader is running. */
type ScorecardScope = 'both' | 'readiness' | 'native';

type ReportTab = 'readiness' | 'native';

const READINESS_SECTIONS: SectionId[] = ['data', 'tools', 'team', 'blast'];
const NATIVE_SECTION_IDS: SectionId[] = NATIVE_SECTIONS.map((section) => section.id);

const SCOPE_OPTIONS: Array<{
  id: ScorecardScope;
  label: string;
  time: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'both',
    label: 'Full AI Scorecard',
    time: '≈ 6 min',
    description: 'Both reports, plus a combined read of where you stand.',
    icon: Radar,
  },
  {
    id: 'readiness',
    label: 'AI-Readiness only',
    time: '≈ 3 min',
    description: 'Are your data, tools and team ready to build with AI?',
    icon: Gauge,
  },
  {
    id: 'native',
    label: 'AI-Native Readiness only',
    time: '≈ 3 min',
    description: 'Is your use case, and the work around it, shaped for AI?',
    icon: Rocket,
  },
];

/** Example use cases, one click to fill the optional free-text field. */
const USE_CASE_EXAMPLES = [
  'Drafting replies to support tickets',
  'Routing inbound leads',
  'Summarising sales calls',
  'Approving expense claims',
  'Writing product descriptions',
  'Reordering stock automatically',
];

/** The minimal question shape a collapsible group renders; both scorecards' questions fit it. */
interface GroupQuestion {
  id: string;
  title: string;
  description: string;
  options: Array<{ id: string; label: string; sublabel?: string }>;
}

/** A thin divider that labels which scorecard the sections below it belong to. */
function ScorecardBand({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 px-1 pt-4">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="font-headline text-sm font-bold uppercase tracking-wider text-primary">{title}</div>
        <div className="text-xs text-foreground/60">{subtitle}</div>
      </div>
      <div className="ml-2 h-px flex-1 bg-border" />
    </div>
  );
}

const toneText: Record<'good' | 'warn' | 'bad', string> = {
  good: 'text-emerald-600 dark:text-emerald-400',
  warn: 'text-amber-600 dark:text-amber-400',
  bad: 'text-rose-600 dark:text-rose-400',
};

/**
 * One collapsible group of questions.
 *
 * The questionnaire used to render every section expanded at once. That was tolerable at eight
 * questions and stopped being tolerable when the optional Blast-Radius module took it to
 * fourteen: the page reads as long before it reads as useful, and length is what makes people
 * abandon a self-audit. Collapsing a finished section to a one-line summary means the page
 * gets *shorter* as you progress, and every answer stays one click away for review.
 */
function QuestionGroup({
  step,
  title,
  blurb,
  icon: Icon,
  questions,
  answers,
  onSelect,
  isOpen,
  onToggle,
  columns,
  optional,
  optionalNote,
  intro,
}: {
  step: number;
  title: string;
  blurb: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: GroupQuestion[];
  answers: Record<string, string>;
  onSelect: (questionId: string, optionId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  columns: string;
  optional?: boolean;
  optionalNote?: string;
  /** Extra input rendered above the questions, such as the optional use-case field. */
  intro?: React.ReactNode;
}) {
  const answeredHere = questions.filter((q) => answers[q.id]).length;
  const isComplete = answeredHere === questions.length;

  // Shown on the collapsed header so a finished section can be checked without reopening it.
  const chosenLabels = questions
    .map((q) => q.options.find((o) => o.id === answers[q.id])?.label)
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={`rounded-2xl border bg-card shadow-sm transition-colors ${
        isOpen ? 'border-primary/30' : 'border-border'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 p-5 text-left sm:p-6"
      >
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
            isComplete ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
          }`}
        >
          {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-headline text-base font-bold text-primary sm:text-lg">
              {step}. {title}
            </h3>
            {optional && (
              <Badge variant="outline" className="text-[10px] font-medium text-foreground/60">
                Optional
              </Badge>
            )}
          </div>

          {isOpen ? (
            <p className="mt-0.5 text-xs text-foreground/70">{blurb}</p>
          ) : isComplete && chosenLabels ? (
            <p className="mt-0.5 truncate text-xs text-foreground/60">{chosenLabels}</p>
          ) : (
            <p className="mt-0.5 text-xs text-foreground/60">
              {answeredHere} of {questions.length} answered
            </p>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2.5">
          <span className="hidden text-[11px] font-medium text-foreground/50 sm:inline">
            {answeredHere}/{questions.length}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-foreground/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border px-5 pb-6 pt-6 sm:px-6">
          {optionalNote && (
            <p className="mb-6 rounded-lg border-l-2 border-primary/40 bg-muted/40 px-3.5 py-2.5 text-xs leading-relaxed text-foreground/70">
              {optionalNote}
            </p>
          )}

          {intro}

          <div className="space-y-8">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-primary sm:text-base">
                      {step}.{qIndex + 1}. {q.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-foreground/65">{q.description}</p>
                  </div>
                  {answers[q.id] && (
                    <Badge
                      variant="outline"
                      className="flex-shrink-0 border-emerald-500/30 text-[10px] text-emerald-600"
                    >
                      Selected
                    </Badge>
                  )}
                </div>

                <div className={`grid gap-2.5 ${columns}`}>
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSelect(q.id, opt.id)}
                        className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                            : 'border-border bg-background hover:border-primary/40 hover:bg-muted/20'
                        }`}
                      >
                        <div className="flex w-full items-center gap-2">
                          <div
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-foreground/30 bg-background'
                            }`}
                          >
                            {isSelected && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-primary sm:text-sm">
                            {opt.label}
                          </span>
                        </div>
                        {opt.sublabel && (
                          <p className="mt-1.5 pl-5 text-[11px] leading-relaxed text-foreground/70 sm:text-xs">
                            {opt.sublabel}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ScorecardTool() {
  const [scope, setScope] = useState<ScorecardScope>('both');
  const [track, setTrack] = useState<AssessmentTrack>('existing-product');
  const [stage, setStage] = useState<OrganizationStage>('founder');
  const [useCase, setUseCase] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ReportTab>('readiness');
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<SectionId | null>('context');

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const includesReadiness = scope !== 'native';
  const includesNative = scope !== 'readiness';

  const dataQuestions = useMemo(() => QUESTIONS.filter((q) => q.category === 'data'), []);
  const toolsQuestions = useMemo(() => QUESTIONS.filter((q) => q.category === 'tools'), []);
  const teamQuestions = useMemo(() => QUESTIONS.filter((q) => q.category === 'team'), []);
  const nativeQuestionsBySection = useMemo(
    () =>
      Object.fromEntries(
        NATIVE_SECTIONS.map((section) => [
          section.id,
          NATIVE_QUESTIONS.filter((q) => q.category === section.id),
        ])
      ) as Record<NativeCategory, typeof NATIVE_QUESTIONS>,
    []
  );
  const blastQuestions = applicableBlastQuestions(answers);

  // Progress counts the required questions of the scorecards being run. The Blast-Radius module
  // is optional, so folding it in here would leave the bar unable to reach 100% for anyone who
  // skips it.
  const requiredQuestions = useMemo(
    () => [...(includesReadiness ? QUESTIONS : []), ...(includesNative ? NATIVE_QUESTIONS : [])],
    [includesReadiness, includesNative]
  );
  const totalQuestions = requiredQuestions.length;
  const answeredCount = requiredQuestions.filter((q) => answers[q.id]).length;
  const isComplete = answeredCount === totalQuestions;
  const blastComplete = isBlastModuleComplete(answers);

  const report: ScorecardReport | null = useMemo(() => {
    if (!hasCalculated || !includesReadiness) return null;
    const response: ScorecardResponse = { track, stage, answers };
    return calculateScorecard(response);
  }, [hasCalculated, includesReadiness, track, stage, answers]);

  const blastReport: BlastRadiusReport | null = useMemo(
    () => (includesReadiness && blastComplete ? calculateBlastRadius(answers) : null),
    [includesReadiness, blastComplete, answers]
  );

  const nativeReport: AiNativeReport | null = useMemo(
    () => (hasCalculated && includesNative ? calculateAiNative(answers) : null),
    [hasCalculated, includesNative, answers]
  );

  const combined = report && nativeReport ? combinedRead(report.overallScore, nativeReport.overallScore) : null;

  // The tab on screen, falling back to whichever report exists when only one was run.
  const shownTab: ReportTab = !report ? 'native' : !nativeReport ? 'readiness' : activeTab;

  const sectionOrder: SectionId[] = [
    'context',
    ...(includesReadiness ? READINESS_SECTIONS : []),
    ...(includesNative ? NATIVE_SECTION_IDS : []),
  ];

  const sectionIsComplete = (id: SectionId, current: Record<string, string>): boolean => {
    if (id === 'context') return true; // scope, track and stage always carry a default
    if (id === 'data') return dataQuestions.every((q) => current[q.id]);
    if (id === 'tools') return toolsQuestions.every((q) => current[q.id]);
    if (id === 'team') return teamQuestions.every((q) => current[q.id]);
    if (id === 'blast') return isBlastModuleComplete(current);
    return nativeQuestionsBySection[id].every((q) => current[q.id]);
  };

  /** Step numbers follow the sections actually shown, so they never skip. */
  const stepOf = (id: SectionId) => sectionOrder.indexOf(id) + 1;

  /**
   * Finishing a section collapses it and opens the next unfinished one, so there is normally a
   * single section expanded and the answered ones stack up as compact summaries above it. No
   * forced scrolling: the collapse itself lifts the next section into view.
   */
  const handleSelectOption = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);

    if (!openSection || !sectionIsComplete(openSection, next)) return;
    const following = sectionOrder.find(
      (id) => id !== openSection && !sectionIsComplete(id, next)
    );
    setOpenSection(following ?? null);
  };

  const handleGenerateReport = () => {
    if (!hasCalculated) setActiveTab(includesReadiness ? 'readiness' : 'native');
    setHasCalculated(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleContinueFromContext = () => {
    setOpenSection(sectionOrder.find((id) => id !== 'context' && !sectionIsComplete(id, answers)) ?? null);
  };

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Headline for the next-step card, matched to the score. Null hides the card. */
  const headlineScore = report?.overallScore ?? nativeReport?.overallScore ?? null;
  const nextStepLead =
    headlineScore !== null
      ? siteConfig.nextStep?.leadsByScore.find((l) => headlineScore >= l.minScore)?.text ?? null
      : null;

  const handleCopySummary = () => {
    if (!report && !nativeReport) return;
    const blastText = blastReport
      ? `\n\nAgent Blast-Radius Check: ${blastReport.tier.title}${
          blastReport.notApplicable ? '' : ` (${blastReport.containmentScore}/100 containment)`
        }\n${blastReport.containment.map((c) => `- ${c.label}: ${c.value}`).join('\n')}${
          blastReport.fixes.length
            ? `\nFixes:\n${blastReport.fixes.map((f) => `• ${f.title}`).join('\n')}`
            : ''
        }`
      : '';

    const readinessText = report
      ? `

== AI-READINESS SCORECARD ==
Overall Score: ${report.overallScore}/100 (${report.maturityTier.title})

6-Pillar Radar Breakdown:
${report.radarDimensions.map((d) => `- ${d.label}: ${d.score}%`).join('\n')}

Category Scores:
- Data Foundation: ${report.categoryScores.data.score}/100
- Tools & Infrastructure: ${report.categoryScores.tools.score}/100
- Team & Execution: ${report.categoryScores.team.score}/100

Top Recommendations:
${report.priorityActions.map((a, i) => `${i + 1}. ${a.title} (${a.timing})\n   ${a.description}`).join('\n')}

Where AI Will NOT Help:
${report.whereAiWillNotHelp.map((w) => `• ${w}`).join('\n')}${blastText}`
      : '';

    const nativeText = nativeReport
      ? `

== AI-NATIVE READINESS SCORECARD ==
Overall Score: ${nativeReport.overallScore}/100 (${nativeReport.tier.title})${useCase ? `\nUse case: ${useCase}` : ''}
Edge profile: ${nativeReport.edge.title}
Reliability bar: ${nativeReport.edge.reliabilityBar}
The play for today: ${nativeReport.edge.play.title}
Trust watch: ${nativeReport.trustRisk.title}

Pillars:
${nativeReport.pillars.map((p) => `- ${p.label}: ${p.score}%`).join('\n')}

6-Pillar Radar Breakdown:
${nativeReport.radarDimensions.map((d) => `- ${d.label}: ${d.score}%`).join('\n')}

Moves Toward AI-Native:
${nativeReport.priorityActions.map((a, i) => `${i + 1}. ${a.title} (${a.timing})\n   ${a.description}`).join('\n')}

What Going AI-Native Will Not Fix:
${nativeReport.realityCheck.map((w) => `• ${w}`).join('\n')}`
      : '';

    const summaryText = `${siteConfig.name}:${combined ? `\nCombined read: ${combined.title}` : ''}
Track: ${track === 'existing-product' ? 'Adopting AI into an existing product / business operations' : 'Building an AI-native product from scratch'}
Stage: ${STAGE_OPTIONS.find((s) => s.id === stage)?.label}${readinessText}${nativeText}

Audit run at: ${siteConfig.url}${
      siteConfig.nextStep
        ? `\nNext step, the ${siteConfig.nextStep.name}: ${siteConfig.nextStep.url}`
        : ''
    }`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /**
   * The whole assessment as a JSON file: raw answers alongside the derived reports, so a result
   * can be diffed against a later run or fed into something else. Nothing leaves the browser
   * otherwise — there is no backend in this project by design.
   */
  const handleDownloadJson = () => {
    if (!report && !nativeReport) return;
    const payload = {
      generatedAt: new Date().toISOString(),
      tool: siteConfig.name,
      input: { scope, track, stage, useCase, answers },
      combinedRead: combined,
      report,
      blastRadius: blastReport,
      aiNativeReport: nativeReport,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-scorecard-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setAnswers({});
    setUseCase('');
    setHasCalculated(false);
    setOpenSection('context');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleSection = (id: SectionId) => setOpenSection((prev) => (prev === id ? null : id));

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4" ref={formRef}>
      {/* Questionnaire (hidden in print once a report exists) */}
      <div className={`space-y-4 ${hasCalculated ? 'print:hidden' : ''}`}>
        {/* 1. Context & Objectives */}
        <div
          className={`rounded-2xl border bg-card shadow-sm transition-colors ${
            openSection === 'context' ? 'border-primary/30' : 'border-border'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection('context')}
            aria-expanded={openSection === 'context'}
            className="flex w-full items-center gap-3 p-5 text-left sm:p-6"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Compass className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-headline text-base font-bold text-primary sm:text-lg">
                1. Your Scorecard, Objective &amp; Stage
              </h3>
              {openSection === 'context' ? (
                <p className="mt-0.5 text-xs text-foreground/70">
                  Pick the report you want, then set the context the scoring uses.
                </p>
              ) : (
                <p className="mt-0.5 truncate text-xs text-foreground/60">
                  {SCOPE_OPTIONS.find((o) => o.id === scope)?.label}
                  {' · '}
                  {track === 'existing-product' ? 'Existing product / ops' : 'AI-native from scratch'}
                  {' · '}
                  {STAGE_OPTIONS.find((s) => s.id === stage)?.label}
                </p>
              )}
            </div>
            <div className="flex flex-shrink-0 items-center gap-2.5">
              <span className="hidden rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground/70 sm:inline">
                {answeredCount}/{totalQuestions} answered
              </span>
              <ChevronDown
                className={`h-4 w-4 text-foreground/50 transition-transform ${
                  openSection === 'context' ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openSection === 'context' && (
            <div className="space-y-6 border-t border-border px-5 pb-6 pt-6 sm:px-6">
              {/* Which scorecard */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-foreground/60">
                  Which AI Scorecard?
                </label>
                <p className="mb-2.5 text-xs text-foreground/60">
                  AI-Readiness asks whether you are equipped to build with AI. AI-Native Readiness
                  asks whether what you are building, and the work around it, is shaped for AI.
                </p>
                <div className="grid gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Which AI Scorecard">
                  {SCOPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = scope === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setScope(opt.id)}
                        className={`flex flex-col rounded-xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                            : 'border-border bg-background hover:border-primary/40'
                        }`}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Icon className="h-4 w-4" />
                            {opt.label}
                          </span>
                          <span className="flex-shrink-0 text-[10px] font-medium text-foreground/50">
                            {opt.time}
                          </span>
                        </span>
                        <span className="mt-1 text-[11px] leading-snug text-foreground/65">
                          {opt.description}
                        </span>
                        {opt.id === 'both' && (
                          <span className="mt-2 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Recommended
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Track */}
              <div>
                <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-foreground/60">
                  Primary AI Objective
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTrack('existing-product')}
                    className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
                      track === 'existing-product'
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                        : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary">
                        Upgrade Existing Product / Ops
                      </div>
                      <div className="mt-0.5 text-xs text-foreground/70">
                        Adding search, agentic automations, or LLM features into an existing
                        business/software.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrack('ai-native')}
                    className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
                      track === 'ai-native'
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                        : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary">
                        Build AI-Native from Scratch
                      </div>
                      <div className="mt-0.5 text-xs text-foreground/70">
                        Designing a net-new product where AI reasoning and agent loops are the core
                        value driver.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Stage */}
              <div>
                <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-foreground/60">
                  Team Scale &amp; Stage
                </label>
                <div className="grid gap-2.5 sm:grid-cols-4">
                  {STAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStage(opt.id)}
                      className={`flex flex-col rounded-lg border p-3 text-left transition-all ${
                        stage === opt.id
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                          : 'border-border bg-background hover:border-primary/40'
                      }`}
                    >
                      <span className="text-xs font-semibold text-primary">{opt.label}</span>
                      <span className="mt-1 text-[11px] leading-tight text-foreground/60">
                        {opt.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={handleContinueFromContext}>
                  Continue
                  <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {includesReadiness && (
          <>
            <ScorecardBand
              icon={Gauge}
              title="AI-Readiness Scorecard"
              subtitle="Are your data, tools and team ready to build with AI?"
            />

            <QuestionGroup
              step={stepOf('data')}
              title="Data & Privacy Foundation"
              blurb="Clean, structured context and safe zero-retention policies."
              icon={Database}
              questions={dataQuestions}
              answers={answers}
              onSelect={handleSelectOption}
              isOpen={openSection === 'data'}
              onToggle={() => toggleSection('data')}
              columns="sm:grid-cols-2"
            />

            <QuestionGroup
              step={stepOf('tools')}
              title="Tools, Architecture & Observability"
              blurb="Evaluation benchmarks, modular agentic workflows, and token tracing."
              icon={Wrench}
              questions={toolsQuestions}
              answers={answers}
              onSelect={handleSelectOption}
              isOpen={openSection === 'tools'}
              onToggle={() => toggleSection('tools')}
              columns="sm:grid-cols-3"
            />

            <QuestionGroup
              step={stepOf('team')}
              title="Team Capability & Risk Guardrails"
              blurb="AI engineering proficiency, human-in-the-loop validation, and problem-solution fit."
              icon={Users}
              questions={teamQuestions}
              answers={answers}
              onSelect={handleSelectOption}
              isOpen={openSection === 'team'}
              onToggle={() => toggleSection('team')}
              columns="sm:grid-cols-3"
            />

            <QuestionGroup
              step={stepOf('blast')}
              title="Agent Blast-Radius Check"
              blurb="What happens when something that runs on its own goes wrong at 2am."
              icon={ShieldCheck}
              questions={blastQuestions}
              answers={answers}
              onSelect={handleSelectOption}
              isOpen={openSection === 'blast'}
              onToggle={() => toggleSection('blast')}
              columns="sm:grid-cols-2"
              optional
              optionalNote="Optional, and only relevant if something already runs without a person watching it. The first answer decides whether the rest applies — if nothing runs unattended, you are done in one click."
            />
          </>
        )}

        {includesNative && (
          <>
            <ScorecardBand
              icon={Rocket}
              title="AI-Native Readiness Scorecard"
              subtitle="Is your main AI use case, and the work around it, shaped for AI?"
            />

            {NATIVE_SECTIONS.map((section) => (
              <QuestionGroup
                key={section.id}
                step={stepOf(section.id)}
                title={section.title}
                blurb={section.blurb}
                icon={section.id === 'fit' ? Target : section.id === 'human' ? UserCheck : Workflow}
                questions={nativeQuestionsBySection[section.id]}
                answers={answers}
                onSelect={handleSelectOption}
                isOpen={openSection === section.id}
                onToggle={() => toggleSection(section.id)}
                columns="sm:grid-cols-2"
                optionalNote={
                  section.id === 'fit'
                    ? 'Answer these for the one AI use case that matters most to you right now — the one you are building, or the one you most want to.'
                    : undefined
                }
                intro={
                  section.id === 'fit' ? (
                    <div className="mb-8 space-y-2.5">
                      <label
                        htmlFor="ai-use-case"
                        className="block text-sm font-semibold text-primary sm:text-base"
                      >
                        In a few words, what do you want AI to do?{' '}
                        <span className="text-xs font-normal text-foreground/50">(optional)</span>
                      </label>
                      <input
                        id="ai-use-case"
                        type="text"
                        value={useCase}
                        maxLength={120}
                        onChange={(e) => setUseCase(e.target.value)}
                        placeholder="e.g. Drafting replies to support tickets"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {USE_CASE_EXAMPLES.map((example) => (
                          <button
                            key={example}
                            type="button"
                            onClick={() => setUseCase(example)}
                            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                              useCase === example
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border text-foreground/65 hover:border-primary/40 hover:text-primary'
                            }`}
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-foreground/50">
                        Shown on your report so you remember which use case you scored. It stays in
                        your browser.
                      </p>
                    </div>
                  ) : undefined
                }
              />
            ))}
          </>
        )}
      </div>

      {/* Sticky progress + generate */}
      <div className="sticky bottom-4 z-40 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-xl backdrop-blur-md sm:flex-row print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.round((answeredCount / totalQuestions) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-foreground/80">
            {answeredCount} of {totalQuestions} answered
          </span>
          {isComplete && (
            <span className="hidden text-xs font-medium text-emerald-600 sm:inline-flex">
              &bull; Ready to generate
            </span>
          )}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          {hasCalculated && (
            <Button variant="outline" size="sm" onClick={handleReset} className="text-foreground/70">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          )}

          <Button
            size="default"
            onClick={handleGenerateReport}
            className="group w-full font-semibold sm:w-auto"
          >
            <Radar className="mr-2 h-4 w-4" />
            {hasCalculated ? 'Update AI Scorecard' : 'Generate AI Scorecard'}
            <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </Button>
        </div>
      </div>

      {/* RESULTS DASHBOARD */}
      {hasCalculated && (report || nativeReport) && (
        <div
          ref={resultsRef}
          className="space-y-8 border-t-2 border-primary/20 pt-6 animate-in fade-in duration-500 print:space-y-6 print:border-none print:pt-0"
        >
          {/* Print-only executive header */}
          <div className="mb-6 hidden border-b border-black pb-4 text-black print:block">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-headline text-xl font-bold uppercase tracking-tight">
                  {siteConfig.organization}
                </div>
                <div className="text-xs text-neutral-600">{siteConfig.url}</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold">AI Scorecard Report</div>
                <div className="text-neutral-600">Date: {todayStr}</div>
              </div>
            </div>

            <div className="mt-3 flex gap-4 font-mono text-xs text-neutral-700">
              <span>
                Track: {track === 'existing-product' ? 'Existing Product Upgrade' : 'AI-Native from Scratch'}
              </span>
              <span>&bull;</span>
              <span>Stage: {STAGE_OPTIONS.find((s) => s.id === stage)?.label}</span>
              {useCase && (
                <>
                  <span>&bull;</span>
                  <span>Use case: {useCase}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between print:hidden">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Radar className="h-3.5 w-3.5" />
              Your AI Scorecard
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleScrollToForm}
              className="text-xs text-foreground/70 hover:text-primary"
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5" />
              Edit Answers
            </Button>
          </div>

          {/* Combined read: the two scores side by side, never averaged */}
          {report && nativeReport && combined && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm sm:p-8 print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-5 print:shadow-none">
              <div className="text-[11px] font-bold uppercase tracking-wider text-primary/70">
                Combined read
              </div>
              <h2 className="mt-1 font-headline text-2xl font-bold text-primary sm:text-3xl">
                {combined.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75 print:text-neutral-700">
                {combined.summary}
              </p>
              <p className="mt-2 text-xs text-foreground/55 print:text-neutral-500">
                The two scores answer different questions, so they are shown side by side rather
                than averaged.
              </p>
            </div>
          )}

          {/* Report tabs, only when both scorecards were run */}
          {report && nativeReport && (
            <div
              role="tablist"
              aria-label="AI Scorecard reports"
              className="grid gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-sm sm:grid-cols-2 print:hidden"
            >
              {(
                [
                  ['readiness', Gauge, 'AI-Readiness', report.overallScore, report.maturityTier.title],
                  ['native', Rocket, 'AI-Native Readiness', nativeReport.overallScore, nativeReport.tier.title],
                ] as const
              ).map(([id, Icon, label, score, tierTitle]) => {
                const isActive = shownTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`tab-${id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${id}`}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-primary hover:bg-muted/60'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-headline text-lg font-extrabold ${
                        isActive ? 'bg-primary-foreground/15' : 'bg-primary/10'
                      }`}
                    >
                      {score}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                      <div
                        className={`truncate text-xs ${isActive ? 'text-primary-foreground/80' : 'text-foreground/60'}`}
                      >
                        {tierTitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {report && (
            <div
              role="tabpanel"
              id="panel-readiness"
              aria-labelledby={nativeReport ? 'tab-readiness' : undefined}
              className={`space-y-8 print:block print:space-y-6 ${shownTab === 'readiness' ? '' : 'hidden'}`}
            >
              <h2 className="hidden font-headline text-xl font-bold text-black print:block">
                AI-Readiness Scorecard
              </h2>

              {/* Hero score + spider chart */}
              <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-12 print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-5 print:shadow-none">
                <div className="flex flex-col justify-between lg:col-span-7">
                  <div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="print:border print:border-neutral-300 print:text-black">
                        {report.maturityTier.badge}
                      </Badge>
                      <span className="text-xs text-foreground/60 print:text-neutral-600">
                        Track: {track === 'existing-product' ? 'Existing Product' : 'New AI Product'}
                      </span>
                    </div>

                    <h2 className="mt-3 font-headline text-3xl font-bold text-primary sm:text-4xl">
                      {report.maturityTier.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
                      {report.maturityTier.summary}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary font-headline text-3xl font-extrabold text-primary-foreground shadow-sm">
                        {report.overallScore}
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                          Overall Readiness Score
                        </div>
                        <div className="mt-0.5 text-sm font-semibold text-primary">
                          Weighted across Data, Tooling, Architecture, and Team
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {(
                        [
                          ['Data', report.categoryScores.data.score],
                          ['Tools', report.categoryScores.tools.score],
                          ['Team', report.categoryScores.team.score],
                        ] as const
                      ).map(([label, score]) => (
                        <div key={label} className="rounded-lg border border-border bg-background p-2.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-primary">
                            <span>{label}</span>
                            <span className="font-mono">{score}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-primary" style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-background/50 p-4 lg:col-span-5">
                  <div className="mb-2 text-center">
                    <span className="flex items-center justify-center gap-1.5 font-headline text-sm font-bold text-primary">
                      <Radar className="h-4 w-4 text-primary/80" />
                      6-Pillar Engineering Spider Chart
                    </span>
                    <span className="text-[10px] text-foreground/60">
                      Visual dimension balance vs. 80% production readiness
                    </span>
                  </div>

                  <SpiderChart dimensions={report.radarDimensions} size={360} showBenchmark={true} />
                </div>
              </div>

              {/* Category breakdown */}
              <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3 print:gap-3">
                {(
                  [
                    [Database, 'Data Foundation', report.categoryScores.data],
                    [Wrench, 'Tools & Evals', report.categoryScores.tools],
                    [Users, 'Team & SDLC', report.categoryScores.team],
                  ] as const
                ).map(([Icon, label, cat]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-card p-5 print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-4 print:shadow-none"
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-semibold text-primary print:text-black">
                        <Icon className="h-4 w-4 text-primary/70 print:text-black" />
                        {label}
                      </span>
                      <span className="font-mono font-bold text-primary print:text-black">
                        {cat.score}%
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/70 print:text-neutral-700">
                      {cat.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Agent Blast-Radius Check — only when the optional module was completed */}
              {blastReport && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-5 print:shadow-none">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-primary print:text-black">
                      <ShieldCheck className="h-5 w-5" />
                      <h3 className="font-headline text-xl font-bold">Agent Blast-Radius Check</h3>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {!blastReport.notApplicable && (
                        <span className="font-mono text-sm font-bold text-primary print:text-black">
                          {blastReport.containmentScore}/100
                        </span>
                      )}
                      <Badge variant="outline" className="print:border-neutral-400 print:text-black">
                        {blastReport.tier.badge}
                      </Badge>
                    </div>
                  </div>

                  <p className={`mt-3 text-base font-semibold ${toneText[blastReport.tier.tone]}`}>
                    {blastReport.tier.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/75 print:text-neutral-700">
                    {blastReport.tier.summary}
                  </p>

                  {blastReport.containment.length > 0 && (
                    <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                      {blastReport.containment.map((row) => (
                        <div
                          key={row.label}
                          className="rounded-lg border border-border bg-background p-3 print:border-neutral-300 print:bg-white"
                        >
                          <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">
                            {row.label}
                          </div>
                          <div className={`mt-1 text-sm font-semibold ${toneText[row.tone]}`}>
                            {row.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {blastReport.fixes.length > 0 && (
                    <div className="mt-6 border-t border-border pt-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                        Close these first
                      </h4>
                      <div className="mt-3 space-y-3">
                        {blastReport.fixes.map((fix, idx) => (
                          <div key={fix.title} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground print:bg-black print:text-white">
                              {idx + 1}
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-primary print:text-black">
                                {fix.title}
                              </h5>
                              <p className="mt-0.5 text-xs leading-relaxed text-foreground/70 print:text-neutral-700">
                                {fix.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Priority actions */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-5 print:shadow-none">
                <div className="mb-2 flex items-center gap-2 text-primary print:text-black">
                  <Lightbulb className="h-5 w-5" />
                  <h3 className="font-headline text-xl font-bold">The 2 or 3 Things Worth Doing First</h3>
                </div>
                <p className="mb-6 text-sm text-foreground/70 print:mb-4 print:text-neutral-600">
                  Highest-leverage engineering actions tailored to your score gaps and project stage:
                </p>

                <div className="space-y-4 print:space-y-3">
                  {report.priorityActions.map((action, idx) => (
                    <div
                      key={action.title}
                      className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-background p-5 sm:flex-row sm:items-center print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-3.5"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground print:bg-black print:text-white">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-primary print:text-black">
                            {action.title}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-foreground/70 sm:text-sm print:text-neutral-700">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="flex-shrink-0 self-start sm:self-center print:border-neutral-400 print:text-black"
                      >
                        {action.timing}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Honest note */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 print:break-inside-avoid print:border print:border-amber-500/50 print:bg-white print:p-5 print:shadow-none">
                <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400 print:text-amber-700">
                  <ShieldAlert className="h-5 w-5" />
                  <h3 className="font-headline text-xl font-bold">
                    An Honest Note: Where AI Will NOT Help You
                  </h3>
                </div>
                <p className="mb-4 text-sm text-foreground/75 print:text-neutral-700">
                  AI solves specific leverage points but fails when applied to the wrong problems:
                </p>

                <ul className="space-y-3 print:space-y-2">
                  {report.whereAiWillNotHelp.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-sm text-foreground/80 print:text-neutral-800"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {nativeReport && (
            <div
              role="tabpanel"
              id="panel-native"
              aria-labelledby={report ? 'tab-native' : undefined}
              className={`print:block ${shownTab === 'native' ? '' : 'hidden'} ${
                report ? 'print:mt-8 print:break-before-page' : ''
              }`}
            >
              <h2 className="mb-6 hidden font-headline text-xl font-bold text-black print:block">
                AI-Native Readiness Scorecard
              </h2>
              <AiNativeReportView report={nativeReport} useCase={useCase} />
            </div>
          )}

          {/* Next step: the follow-on tool, configured in site.ts. It sits right after the
              actions because that is the moment the reader asks "and then what?" */}
          {siteConfig.nextStep && nextStepLead && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm sm:p-8 print:hidden">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Workflow className="h-5 w-5" />
                  </div>
                  <div className="max-w-2xl">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-primary/70">
                      {siteConfig.nextStep.eyebrow}
                    </div>
                    <h3 className="mt-1 font-headline text-lg font-bold text-primary sm:text-xl">
                      {nextStepLead}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
                      {siteConfig.nextStep.body}
                    </p>
                  </div>
                </div>
                <Button asChild className="group w-full flex-shrink-0 font-semibold lg:w-auto">
                  <a href={siteConfig.nextStep.url} target="_blank" rel="noopener noreferrer">
                    {siteConfig.nextStep.label}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadJson}
                className="inline-flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                Download JSON
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleScrollToForm}
                className="inline-flex items-center gap-1.5 text-foreground/70"
              >
                <Edit3 className="h-4 w-4" />
                Adjust Answers
              </Button>
            </div>

            {siteConfig.ctaUrl && (
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <Button asChild size="default" className="w-full sm:w-auto">
                  <a href={siteConfig.ctaUrl} target="_blank" rel="noopener noreferrer">
                    <Calendar className="mr-2 h-4 w-4" />
                    {siteConfig.ctaLabel}
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
