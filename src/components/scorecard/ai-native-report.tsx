'use client';

import React from 'react';
import type { AiNativeReport } from '@/lib/ai-native-scorecard';
import { SpiderChart } from './spider-chart';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Gauge,
  Lightbulb,
  Link2,
  Radar,
  Scale,
  ShieldAlert,
  Target,
  UserCheck,
  Workflow,
} from 'lucide-react';

const toneText: Record<'good' | 'warn' | 'bad', string> = {
  good: 'text-emerald-600 dark:text-emerald-400',
  warn: 'text-amber-600 dark:text-amber-400',
  bad: 'text-rose-600 dark:text-rose-400',
};

const pillarIcons = {
  fit: Target,
  human: UserCheck,
  operating: Workflow,
} as const;

/** Short labels for the compact score bars under the headline score. */
const pillarShortLabels = {
  fit: 'Use-Case Fit',
  human: 'Human + AI',
  operating: 'Operating',
} as const;

const card =
  'rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-5 print:shadow-none';

/**
 * The AI-Native Readiness report. Rendered as its own tab next to the AI-Readiness report; the
 * scoring lives in `src/lib/ai-native-scorecard.ts`.
 */
export function AiNativeReportView({
  report,
  useCase,
}: {
  report: AiNativeReport;
  useCase: string;
}) {
  const { edge } = report;

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Hero score + spider chart */}
      <div className={`grid gap-6 lg:grid-cols-12 ${card}`}>
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="print:border print:border-neutral-300 print:text-black">
                {report.tier.badge}
              </Badge>
              {useCase && (
                <span className="text-xs text-foreground/60 print:text-neutral-600">
                  Use case: {useCase}
                </span>
              )}
            </div>
            <h2 className="mt-3 font-headline text-3xl font-bold text-primary sm:text-4xl">
              {report.tier.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
              {report.tier.summary}
            </p>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary font-headline text-3xl font-extrabold text-primary-foreground shadow-sm">
                {report.overallScore}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                  AI-Native Readiness Score
                </div>
                <div className="mt-0.5 text-sm font-semibold text-primary">
                  Weighted across use-case fit, human + AI design, and operating model
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {report.pillars.map((pillar) => (
                <div key={pillar.key} className="rounded-lg border border-border bg-background p-2.5">
                  <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-primary">
                    <span className="truncate">{pillarShortLabels[pillar.key]}</span>
                    <span className="font-mono">{pillar.score}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${pillar.score}%` }} />
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
              6-Pillar AI-Native Spider Chart
            </span>
            <span className="text-[10px] text-foreground/60">
              Visual dimension balance vs. 80% AI-native benchmark
            </span>
          </div>
          <SpiderChart dimensions={report.radarDimensions} size={360} showBenchmark={true} />
        </div>
      </div>

      {/* Edge profile: rough vs sharp, the reliability bar, and the play for today */}
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary print:text-black">
            <Scale className="h-5 w-5" />
            <h3 className="font-headline text-xl font-bold">Rough-Edged or Sharp-Edged?</h3>
          </div>
          <Badge variant="outline" className="print:border-neutral-400 print:text-black">
            {edge.title}
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground/75 print:text-neutral-700">
          {edge.explanation}
        </p>

        {/* Reliability-bar gauge */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-foreground/50">
            <span>Rough-edged, cheap mistakes</span>
            <span>Sharp-edged, costly mistakes</span>
          </div>
          <div className="relative mt-2 h-2.5 rounded-full bg-gradient-to-r from-emerald-500/60 via-amber-500/60 to-rose-500/60 print:border print:border-neutral-300">
            <div
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow print:border-white"
              style={{ left: `${Math.max(4, Math.min(96, edge.position))}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 flex items-start gap-2 text-sm">
            <Gauge className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/70" />
            <span>
              <span className="font-semibold text-primary print:text-black">Reliability bar: </span>
              <span className="text-foreground/80 print:text-neutral-800">{edge.reliabilityBar}</span>
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 print:border-neutral-300 print:bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary/70">
            The play for today
          </div>
          <h4 className="mt-1 text-base font-semibold text-primary print:text-black">{edge.play.title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-foreground/75 sm:text-sm print:text-neutral-700">
            {edge.play.description}
          </p>
        </div>

        {report.compounding && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 print:bg-white">
            <Link2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-foreground/80 sm:text-sm print:text-neutral-800">
              <span className="font-semibold">Sharp edges compound.</span> If each of{' '}
              {report.compounding.steps} steps is right {report.compounding.perStep}% of the time,
              the whole chain is right only about{' '}
              <span className="font-semibold">{report.compounding.endToEnd}%</span> of the time —
              roughly one run in {Math.max(2, Math.round(100 / (100 - report.compounding.endToEnd)))}{' '}
              goes wrong somewhere. (Illustrative figures; measure your own.)
            </p>
          </div>
        )}
      </div>

      {/* Pillar breakdown + trust */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 print:gap-3">
        {report.pillars.map((pillar) => {
          const Icon = pillarIcons[pillar.key];
          return (
            <div
              key={pillar.key}
              className="rounded-xl border border-border bg-card p-5 print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-4 print:shadow-none"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-primary print:text-black">
                  <Icon className="h-4 w-4 text-primary/70 print:text-black" />
                  {pillar.label}
                </span>
                <span className="font-mono font-bold text-primary print:text-black">{pillar.score}%</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/70 print:text-neutral-700">
                {pillar.description}
              </p>
            </div>
          );
        })}

        <div className="rounded-xl border border-border bg-card p-5 print:break-inside-avoid print:border print:border-neutral-300 print:bg-white print:p-4 print:shadow-none">
          <div className="mb-2 text-sm font-semibold text-primary print:text-black">Trust watch</div>
          <p className={`text-sm font-semibold ${toneText[report.trustRisk.tone]}`}>
            {report.trustRisk.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/70 print:text-neutral-700">
            {report.trustRisk.description}
          </p>
        </div>
      </div>

      {/* Priority actions */}
      <div className={card}>
        <div className="mb-2 flex items-center gap-2 text-primary print:text-black">
          <Lightbulb className="h-5 w-5" />
          <h3 className="font-headline text-xl font-bold">The 2 or 3 Moves Toward AI-Native</h3>
        </div>
        <p className="mb-6 text-sm text-foreground/70 print:mb-4 print:text-neutral-600">
          Picked from your answers, most urgent first:
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
                  <h4 className="text-base font-semibold text-primary print:text-black">{action.title}</h4>
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

      {/* Reality check */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 print:break-inside-avoid print:border print:border-amber-500/50 print:bg-white print:p-5 print:shadow-none">
        <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400 print:text-amber-700">
          <ShieldAlert className="h-5 w-5" />
          <h3 className="font-headline text-xl font-bold">What Going AI-Native Will Not Fix</h3>
        </div>
        <ul className="mt-4 space-y-3 print:space-y-2">
          {report.realityCheck.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80 print:text-neutral-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[11px] leading-relaxed text-foreground/55 print:text-neutral-500">
          The rough-edged / sharp-edged lens and the notes on hand-offs, over-reliance and
          augmentation draw on Michael Bernstein&apos;s Stanford webinar &ldquo;What AI Can and
          Cannot Do: Intelligence Augmentation in Practice&rdquo;.
        </p>
      </div>
    </div>
  );
}
