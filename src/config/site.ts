/**
 * Everything a fork needs to rebrand this tool, in one file.
 *
 * The scoring engine in `src/lib/scorecard.ts` is deliberately free of branding, so changing
 * the values here is enough to run the scorecard under your own name without touching a
 * component. Set `ctaUrl` to null and no call-to-action is rendered at all.
 */
export const siteConfig = {
  /** Browser tab, page heading, and the header of the printed report. */
  name: 'AI Scorecard',
  /** Organisation running this instance. Appears on the printed report header. */
  organization: 'ExponenLabs',
  description:
    'A self-serve AI Scorecard with two reports. AI-Readiness: a straight read on your data, tools and team, with an optional agent blast-radius check. AI-Native Readiness: whether your main use case is rough- or sharp-edged, whether the human hand-off is designed, and whether the work is built around AI. Each comes with the two or three things worth doing first.',
  /** Public URL of this deployment. Used for metadata and the footer of the copied summary. */
  url: 'https://exponen-agi.github.io/ai-readiness-scorecard',
  /** Where the source lives. Rendered in the footer; set to null to hide the link. */
  repositoryUrl: 'https://github.com/exponen-agi/ai-readiness-scorecard',
  /** Optional conversion link shown under the results. */
  ctaUrl: null as string | null,
  ctaLabel: 'Discuss these results on a call',
  /**
   * The follow-on tool: this scorecard says where you stand, the next tool says how AI should
   * run once you get there. Offered in the hero as step 2 of the journey, and again under the
   * priority actions with a headline matched to the reader's score. Set to null to hide both.
   */
  nextStep: {
    /** Short name used in the hero journey strip and the copied summary. */
    name: 'AI-Native Flow Blueprint',
    /** Small label above the results card. */
    eyebrow: 'Step 2 · Turn this score into an operating plan',
    /**
     * Headline under the results, picked by overall score: the first entry whose `minScore`
     * the score reaches. Keep them ordered from highest to lowest.
     */
    leadsByScore: [
      {
        minScore: 80,
        text: 'You are ready to scale. Next, design how AI runs the whole business, not just the product.',
      },
      {
        minScore: 60,
        text: 'You are close. Map which work AI takes over, and where a person still decides, before you scale.',
      },
      {
        minScore: 40,
        text: 'Fix the foundations with a plan: what AI should take on first, and in what order.',
      },
      {
        minScore: 0,
        text: 'Start small, on purpose. Find the one repeating workflow worth handing to AI first.',
      },
    ],
    body: 'The AI-Native Flow Blueprint turns a few answers about your business into an operating model: which repeating work to hand to AI, where a person should still decide, the tools that fit your stage, and the order to roll it out. Free, and it runs in your browser too.',
    label: 'Build my AI-Native Flow Blueprint',
    url: 'https://exponen-agi.github.io/ai-native-flow/',
  } as {
    name: string;
    eyebrow: string;
    leadsByScore: { minScore: number; text: string }[];
    body: string;
    label: string;
    url: string;
  } | null,
} as const;
