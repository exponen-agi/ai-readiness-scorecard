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
  type ScorecardQuestion,
  type ScorecardResponse,
  type ScorecardReport,
  type BlastRadiusReport,
} from '@/lib/scorecard';
import { SpiderChart } from './spider-chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/config/site';
import {
  Sparkles,
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
} from 'lucide-react';

/** Sections of the questionnaire, in the order they are worked through. */
type SectionId = 'context' | 'data' | 'tools' | 'team' | 'blast';

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
}: {
  step: number;
  title: string;
  blurb: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: ScorecardQuestion[];
  answers: Record<string, string>;
  onSelect: (questionId: string, optionId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  columns: string;
  optional?: boolean;
  optionalNote?: string;
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
  const [track, setTrack] = useState<AssessmentTrack>('existing-product');
  const [stage, setStage] = useState<OrganizationStage>('founder');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<SectionId | null>('context');

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const dataQuestions = useMemo(() => QUESTIONS.filter((q) => q.category === 'data'), []);
  const toolsQuestions = useMemo(() => QUESTIONS.filter((q) => q.category === 'tools'), []);
  const teamQuestions = useMemo(() => QUESTIONS.filter((q) => q.category === 'team'), []);
  const blastQuestions = applicableBlastQuestions(answers);

  // Progress counts the core readiness questions only. The Blast-Radius module is optional, so
  // folding it in here would leave the bar unable to reach 100% for anyone who skips it.
  const totalQuestions = QUESTIONS.length;
  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length;
  const isComplete = answeredCount === totalQuestions;
  const blastComplete = isBlastModuleComplete(answers);

  const report: ScorecardReport | null = useMemo(() => {
    if (!hasCalculated && !isComplete) return null;
    const response: ScorecardResponse = { track, stage, answers };
    return calculateScorecard(response);
  }, [hasCalculated, isComplete, track, stage, answers]);

  const blastReport: BlastRadiusReport | null = useMemo(
    () => (blastComplete ? calculateBlastRadius(answers) : null),
    [blastComplete, answers]
  );

  const sectionIsComplete = (id: SectionId, current: Record<string, string>): boolean => {
    if (id === 'context') return true; // track and stage always carry a default
    if (id === 'data') return dataQuestions.every((q) => current[q.id]);
    if (id === 'tools') return toolsQuestions.every((q) => current[q.id]);
    if (id === 'team') return teamQuestions.every((q) => current[q.id]);
    return isBlastModuleComplete(current);
  };

  const SECTION_ORDER: SectionId[] = ['context', 'data', 'tools', 'team', 'blast'];

  /**
   * Finishing a section collapses it and opens the next unfinished one, so there is normally a
   * single section expanded and the answered ones stack up as compact summaries above it. No
   * forced scrolling: the collapse itself lifts the next section into view.
   */
  const handleSelectOption = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);

    if (!openSection || !sectionIsComplete(openSection, next)) return;
    const following = SECTION_ORDER.find(
      (id) => id !== openSection && !sectionIsComplete(id, next)
    );
    setOpenSection(following ?? null);
  };

  const handleGenerateReport = () => {
    setHasCalculated(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCopySummary = () => {
    if (!report) return;
    const blastText = blastReport
      ? `\n\nAgent Blast-Radius Check: ${blastReport.tier.title}${
          blastReport.notApplicable ? '' : ` (${blastReport.containmentScore}/100 containment)`
        }\n${blastReport.containment.map((c) => `- ${c.label}: ${c.value}`).join('\n')}${
          blastReport.fixes.length
            ? `\nFixes:\n${blastReport.fixes.map((f) => `• ${f.title}`).join('\n')}`
            : ''
        }`
      : '';

    const summaryText = `${siteConfig.name}:
Overall Score: ${report.overallScore}/100 (${report.maturityTier.title})
Track: ${report.trackSummary}
Stage: ${STAGE_OPTIONS.find((s) => s.id === stage)?.label}

6-Pillar Radar Breakdown:
${report.radarDimensions.map((d) => `- ${d.label}: ${d.score}%`).join('\n')}

Category Scores:
- Data Foundation: ${report.categoryScores.data.score}/100
- Tools & Infrastructure: ${report.categoryScores.tools.score}/100
- Team & Execution: ${report.categoryScores.team.score}/100

Top Recommendations:
${report.priorityActions.map((a, i) => `${i + 1}. ${a.title} (${a.timing})\n   ${a.description}`).join('\n')}

Where AI Will NOT Help:
${report.whereAiWillNotHelp.map((w) => `• ${w}`).join('\n')}${blastText}

Audit run at: ${siteConfig.url}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /**
   * The whole assessment as a JSON file: raw answers alongside the derived report, so a result
   * can be diffed against a later run or fed into something else. Nothing leaves the browser
   * otherwise — there is no backend in this project by design.
   */
  const handleDownloadJson = () => {
    if (!report) return;
    const payload = {
      generatedAt: new Date().toISOString(),
      tool: siteConfig.name,
      input: { track, stage, answers },
      report,
      blastRadius: blastReport,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-readiness-scorecard-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setAnswers({});
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
                1. Objective &amp; Organization Stage
              </h3>
              {openSection === 'context' ? (
                <p className="mt-0.5 text-xs text-foreground/70">
                  Sets the scoring weights and diagnostic benchmarks.
                </p>
              ) : (
                <p className="mt-0.5 truncate text-xs text-foreground/60">
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
                <Button size="sm" variant="outline" onClick={() => setOpenSection('data')}>
                  Continue
                  <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <QuestionGroup
          step={2}
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
          step={3}
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
          step={4}
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
          step={5}
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
            {hasCalculated ? 'Update Scorecard & Spider Chart' : 'Generate AI Readiness Scorecard'}
            <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </Button>
        </div>
      </div>

      {/* RESULTS DASHBOARD */}
      {hasCalculated && report && (
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
                <div className="font-semibold">AI Readiness Assessment Report</div>
                <div className="text-neutral-600">Date: {todayStr}</div>
              </div>
            </div>

            <div className="mt-3 flex gap-4 font-mono text-xs text-neutral-700">
              <span>
                Track: {track === 'existing-product' ? 'Existing Product Upgrade' : 'AI-Native from Scratch'}
              </span>
              <span>&bull;</span>
              <span>Stage: {STAGE_OPTIONS.find((s) => s.id === stage)?.label}</span>
            </div>
          </div>

          <div className="flex items-center justify-between print:hidden">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Radar className="h-3.5 w-3.5" />
              Audit Results &amp; Spider Chart
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

          {/* Hero score + spider chart */}
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-12 print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-5 print:shadow-none">
            <div className="flex flex-col justify-between lg:col-span-7">
              <div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="print:border print:border-neutral-300 print:text-black">
                    {report.maturityTier.badge}
                  </Badge>
                  <span className="text-xs text-foreground/60 print:text-neutral-600">
                    Track: {track === 'existing-product' ? 'Existing Product' : 'AI-Native'}
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
