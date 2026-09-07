# AI Readiness Scorecard

A self-serve AI readiness audit you can host yourself. Answer fourteen questions and get a
straight read on where you stand before you build with AI: a weighted score across data, tools
and team, a six-pillar radar chart, the two or three things worth doing first, an optional
blast-radius check for anything that already runs unattended, and an honest note on where AI
will not help you.

Everything runs in the browser. There is no backend, no database, no analytics, and no network
call — the scoring is a pure function over your answers, and the page is a static export.

## What it scores

**Core readiness (8 questions, always asked)**

| Category | Weight | Covers |
| --- | --- | --- |
| Data foundation | 30% | Structure and accessibility of domain data, privacy and retention policy |
| Tools & infrastructure | 35% | Evals and regression testing, architecture and RAG, cost/latency observability |
| Team & execution | 35% | AI engineering practice, human-in-the-loop guardrails, problem validation |

The overall score maps to one of four tiers, from *Exploration Phase* (under 40) to *AI-Native
Accelerators* (80 and above). Six radar pillars break the same answers down by engineering
dimension: data and indexing, privacy and policy, evals and testing, architecture and RAG,
tracing and observability, guardrails and SDLC.

**Agent blast-radius check (optional, 1–6 questions)**

Readiness asks whether you are in a position to build the thing. Blast radius asks the separate
question of how far it gets when it misbehaves at 2am, so it is scored independently — mixing
the two would move every readiness score, and a team can be entirely ready to build and still
have nothing bounding a runaway loop.

The module opens with a single gate question: what your AI can do without a human approving it
first. Answer "nothing runs unattended" and the rest retires — there is no autonomous blast
radius to bound. Otherwise five control questions follow (measured run cost, spend caps, loop
bounding, detection, kill switch) and produce a containment score, a plain-language worst case
for one run and one day, and up to three fixes.

Exposure raises the bar rather than the score: the same controls that are fine for a drafting
assistant are not enough for an agent that can spend money or message customers. Two hard rules
override the average — no spend cap plus no loop bound is reported as *Unbounded* whatever else
is in place, and a setup found out by the invoice never reads as fully contained.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build` (static export to `out/`), `npm run lint`, `npm run typecheck`,
`npm test`.

Requires Node 20 or newer.

## Deploying

`npm run build` writes a static site to `out/` that any web server or object store can host.

- **GitHub Pages** — the included `.github/workflows/deploy-pages.yml` builds with the right
  base path and publishes on every push to `main`. The site lands at
  `https://<owner>.github.io/<repo>`; put that in `siteConfig.url`.

  The repository's Pages **source must be set to "GitHub Actions"** (Settings → Pages → Build
  and deployment). The workflow turns Pages on by itself if it is off entirely, but it cannot
  convert a site that is already set to "Deploy from a branch" — and that is the default when
  Pages is enabled by hand. If the source stays on a branch, GitHub runs its own Jekyll build
  alongside this workflow, and since there is no `index.html` at the repository root, Jekyll
  renders `README.md` instead. Both then publish to the same URL and the last one to finish
  wins, so the site flips between this documentation and the actual app. Switching the source
  to GitHub Actions stops the Jekyll build and makes the workflow the only publisher.
- **Anywhere else** — serve `out/` as-is. Deploying under a sub-path needs
  `NEXT_PUBLIC_BASE_PATH=/your-path` at build time.

## Making it yours

`src/config/site.ts` holds every piece of branding: name, organisation, description, public URL,
repository link, and an optional call-to-action button (set `ctaUrl` to `null` and no CTA is
rendered). The scoring engine has no branding in it at all, so a rebrand is that one file.

To change the questions, edit `src/lib/scorecard.ts`:

- `QUESTIONS` — the core readiness questions. Each option carries a 0–10 `score` and a
  `category` that must match its question's.
- `BLAST_QUESTIONS` — the optional module, deliberately kept outside `QUESTIONS` so
  `calculateScorecard` provably cannot see it.
- `calculateScorecard` / `calculateBlastRadius` — weights, tier thresholds, priority-action
  rules, and the containment rules.

Run `npm test` after editing. The suite checks the invariants that are easy to break by hand:
unique ids, scores inside 0–10, options tagged with their question's category, a perfect answer
set scoring 100, at most three priority actions, and — the one that matters most — that no
result ever reports a gap without offering something to do about it.

## Using the engine on its own

`src/lib/scorecard.ts` has no React or Next imports and can be lifted into any TypeScript
project:

```ts
import { calculateScorecard, calculateBlastRadius } from './lib/scorecard';

const report = calculateScorecard({
  track: 'existing-product',      // or 'ai-native'
  stage: 'startup',               // founder | micro | smb | startup
  answers: { data_structure: 'basic_db', eval_and_testing: 'manual_vibe' /* ... */ },
});

console.log(report.overallScore, report.maturityTier.title);

const blast = calculateBlastRadius({ agent_autonomy: 'internal_writes' /* ... */ });
```

Unanswered questions are skipped rather than counted as zero, so a partial run still produces a
usable score.

## Your data

Nothing you type leaves the browser. There is no server component, no storage, and no
telemetry. "Copy summary" writes plain text to your clipboard, "Download JSON" produces a local
file with your answers and the full report, and "Print / Save PDF" uses the browser's own print
path — the results dashboard has print styling so the PDF is the report.

## Project layout

```
src/
  app/                      layout, page, global styles
  components/scorecard/     the questionnaire and results UI, and the radar chart
  components/ui/            button and badge primitives
  config/site.ts            all branding, in one file
  lib/scorecard.ts          questions, scoring, and report generation — no UI, no branding
tests/                      engine tests (vitest)
```

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. Originally built by [ExponenLabs](https://www.exponenlabs.tech) and extracted from the
version running on their site.
