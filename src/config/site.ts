/**
 * Everything a fork needs to rebrand this tool, in one file.
 *
 * The scoring engine in `src/lib/scorecard.ts` is deliberately free of branding, so changing
 * the values here is enough to run the scorecard under your own name without touching a
 * component. Set `ctaUrl` to null and no call-to-action is rendered at all.
 */
export const siteConfig = {
  /** Browser tab, page heading, and the header of the printed report. */
  name: 'AI Readiness Scorecard',
  /** Organisation running this instance. Appears on the printed report header. */
  organization: 'ExponenLabs',
  description:
    'A self-serve AI readiness audit. Answer a few questions and get a straight read on your data, tools, and team, the two or three things worth doing first, an optional agent blast-radius check, and an honest note on where AI will not help you.',
  /** Public URL of this deployment. Used for metadata and the footer of the copied summary. */
  url: 'https://exponen-agi.github.io/ai-readiness-scorecard',
  /** Where the source lives. Rendered in the footer; set to null to hide the link. */
  repositoryUrl: 'https://github.com/exponen-agi/ai-readiness-scorecard',
  /** Optional conversion link shown under the results. */
  ctaUrl: null as string | null,
  ctaLabel: 'Discuss these results on a call',
} as const;
