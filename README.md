# AI Scorecard

A self-serve AI Scorecard you can host yourself, with two reports. Run one or both.

- **AI-Readiness** — are you equipped to build with AI? A weighted score across data, tools and
  team, a six-pillar radar chart, the two or three things worth doing first, an optional
  blast-radius check for anything that already runs unattended, and an honest note on where AI
  will not help you.
- **AI-Native Readiness** — is what you are building shaped to work, and is the business
  organised around it? It reads your main use case as rough-edged or sharp-edged, sets the
  reliability bar that implies, checks the human hand-off and trust calibration, and scores
  whether the workflow, metrics and learning loop are built around AI.

Run both and the results open on a combined read — the two scores side by side, never averaged —
with each report in its own tab.

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

### AI-Readiness

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

### AI-Native Readiness (13 questions)

The second report asks a question readiness cannot: whether the thing you are building with AI
is one today's models can do reliably, and whether the people and processes around it are
designed for it. It is scored separately, so it never moves the readiness score.

| Pillar | Weight | Covers |
| --- | --- | --- |
| Use-case fit | 35% | Rough- vs sharp-edged, cost of an error, automatic verifiability, chain length |
| Human + AI design | 35% | The AI's role, the hand-off, over-reliance, how affected people see it |
| Operating model | 30% | Workflow redesign, outcome metrics, correction loop, new-model routine, defensibility |

The scoring borrows the framework from Michael Bernstein's Stanford webinar
[*What AI Can and Cannot Do: Intelligence Augmentation in Practice*](https://www.youtube.com/watch?v=y4xvZnl102w):

- **Rough-edged vs sharp-edged.** Rough-edged work has many acceptable answers, so a draft that
  gets you 80% of the way is useful. Sharp-edged work has one right answer, so 80% is wrong.
  The report places your use case on that scale, combines it with the cost of an error into a
  **reliability bar**, and gives the play for today — use it now, lean on an automatic check, or
  reframe the decision as a brief for the person who decides.
- **The role has to fit the bar.** Letting the AI act alone scores well on a cheap, rough-edged
  task and badly on a sharp-edged, high-stakes one — unless every output is checked against a
  known answer, which is how coding agents handle sharp-edged work.
- **Sharp edges compound.** A long agent chain checked only at the end gets a worked example of
  how per-step accuracy multiplies.
- **The seam and trust.** Hand-offs without context, rubber-stamping, and AI framed as
  replacement each cost points; tracked override rates and co-design earn them.
- **Augmentation metrics.** Time-and-cost-saved metrics score below outcome metrics, and
  comparing people-plus-AI against people alone scores highest.

As with blast radius, one hard rule overrides the average: a sharp-edged, high-stakes task that
runs with no person and no automatic check is capped at *AI-Assisted* whatever else is in
place. Tiers run from *AI-Curious* (under 40) to *AI-Native* (80 and above).

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
repository link, an optional call-to-action button (set `ctaUrl` to `null` and no CTA is
rendered), and the next-step card under the results that points to the
[AI-Native Flow Blueprint](https://github.com/exponen-agi/ai-native-flow) (set `nextStep` to `null`
to hide it). The scoring engine has no branding in it at all, so a rebrand is that one file.

To change the AI-Readiness questions, edit `src/lib/scorecard.ts`:

- `QUESTIONS` — the core readiness questions. Each option carries a 0–10 `score` and a
  `category` that must match its question's.
- `BLAST_QUESTIONS` — the optional module, deliberately kept outside `QUESTIONS` so
  `calculateScorecard` provably cannot see it.
- `calculateScorecard` / `calculateBlastRadius` — weights, tier thresholds, priority-action
  rules, and the containment rules.

The AI-Native Readiness questions, the reliability-bar and role rules, the autopilot cap and the
combined read live in `src/lib/ai-native-scorecard.ts`.

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

import { calculateAiNative, combinedRead } from './lib/ai-native-scorecard';

const native = calculateAiNative({ use_case_shape: 'sharp', error_cost: 'harm' /* ... */ });
console.log(native.edge.title, native.edge.reliabilityBar, native.edge.play.title);
console.log(combinedRead(report.overallScore, native.overallScore).title);
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
  lib/scorecard.ts          AI-Readiness questions, scoring, and blast radius — no UI, no branding
  lib/ai-native-scorecard.ts  AI-Native Readiness questions, scoring, and the combined read
tests/                      engine tests (vitest)
```

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. Originally built by [ExponenLabs](https://www.exponenlabs.tech) and extracted from the
version running on their site.
