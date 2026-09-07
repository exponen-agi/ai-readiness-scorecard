# Contributing

Thanks for taking a look. This is a small project, so the process is short.

## Getting set up

```bash
npm install
npm run dev
```

Node 20 or newer. Before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

CI runs exactly those four.

## What is most useful

- **Question wording.** The questions are only as good as the options people can honestly pick.
  If an option does not describe any real setup you have seen, that is worth an issue.
- **Scoring judgement.** Weights, tier thresholds and the blast-radius rules are opinions, not
  measurements. Arguments against them are welcome — bring the reasoning, not just the number.
- **Accessibility and print output.** The results page doubles as a printed report, and both
  paths are easy to regress.

## House rules for changes to the engine

`src/lib/scorecard.ts` is the whole product; the UI just renders it.

- Keep it free of React, Next, and branding. It should stay liftable into any TypeScript project.
- Option scores are 0–10, and an option's `category` must match its question's.
- The blast-radius questions stay outside `QUESTIONS` so `calculateScorecard` cannot see them.
  Adding one to `QUESTIONS` silently moves every existing readiness score.
- No result should ever report a gap and then offer nothing to do about it. There is a test for
  this; keep it passing.
- Add or update a test in `tests/scorecard.test.ts` alongside any scoring change.

## Pull requests

One concern per pull request, and say what problem it solves in the description. If it changes
scoring, include an example of an answer set whose result changes and why the new one is more
honest.
