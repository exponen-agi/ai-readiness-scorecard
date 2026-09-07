import { ScorecardTool } from '@/components/scorecard/scorecard-tool';
import { siteConfig } from '@/config/site';
import { Database, Wrench, ShieldAlert } from 'lucide-react';

const highlights = [
  {
    icon: Database,
    title: 'A straight score',
    body: 'Where your data, tools, and team actually stand, weighted rather than averaged.',
  },
  {
    icon: Wrench,
    title: 'Two or three actions',
    body: 'The highest-leverage things worth doing first, picked from your specific gaps.',
  },
  {
    icon: ShieldAlert,
    title: 'An honest reality check',
    body: 'A plain note on where AI will not help you, and an optional blast-radius check.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className="flex-1 print:p-0">
        <section className="border-b border-border/60 bg-background pb-8 pt-10 sm:pt-14 print:hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                Open source &bull; Runs entirely in your browser
              </span>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                {siteConfig.name}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-foreground/80">
                Answer a few questions and get a straight read on where you stand before you build
                with AI. Nothing is uploaded, stored, or sent anywhere — the scoring runs locally
                and the page has no backend.
              </p>
            </div>

            <div className="mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-primary">{title}</h2>
                    <p className="mt-0.5 text-xs text-foreground/70">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-12 sm:py-16 print:m-0 print:bg-white print:py-0">
          <div className="container mx-auto px-4 md:px-6 print:max-w-none print:p-0">
            <ScorecardTool />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-8 print:hidden">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 text-xs text-foreground/60 sm:flex-row md:px-6">
          <p>
            {siteConfig.name} — MIT licensed, originally built by {siteConfig.organization}.
          </p>
          {siteConfig.repositoryUrl && (
            <a
              href={siteConfig.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              Source on GitHub
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
