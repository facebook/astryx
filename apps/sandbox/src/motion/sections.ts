// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sections.ts
 * @input none
 * @output The lab's section registry, used by the rail and the overview
 * @position Motion Lab data module
 *
 * One list, so adding a page means adding a row here rather than editing a
 * rail, an overview grid and a set of prev/next links separately.
 */

export type MotionSection = {
  readonly href: string;
  readonly title: string;
  readonly group: string;
  /** What a reader can decide after spending time on this page. */
  readonly decides: string;
};

export const MOTION_SECTIONS: ReadonlyArray<MotionSection> = [
  {
    href: '/motion',
    title: 'Overview',
    group: 'Start',
    decides:
      'Whether the audit in the brief matches the code, and which decisions are actually blocking.',
  },
  {
    href: '/motion/published',
    title: 'Against the published page',
    group: 'Start',
    decides:
      'Which proposals are bug fixes and which are reversals of guidance Astryx publishes today.',
  },
  {
    href: '/motion/tokens',
    title: 'Semantic tokens',
    group: 'Foundation',
    decides:
      'Whether six easings and eight durations are the right vocabulary, and what each value should be.',
  },
  {
    href: '/motion/springs',
    title: 'Springs',
    group: 'Foundation',
    decides:
      'Whether the four named springs feel right, and whether they belong in the theme contract.',
  },
  {
    href: '/motion/js-mirror',
    title: 'JS token mirror',
    group: 'Foundation',
    decides:
      'What the mirror has to expose for charts, canvas and motion libraries.',
  },
  {
    href: '/motion/export',
    title: 'Export tuning',
    group: 'Foundation',
    decides:
      'Nothing — it emits whatever the rest of the lab has been tuned to.',
  },
  {
    href: '/motion/exit-gap',
    title: 'The exit gap',
    group: 'Presence',
    decides:
      'Whether presence surfaces should animate out at all, and what enter and exit cost.',
  },
  {
    href: '/motion/bugs',
    title: 'Small bugs',
    group: 'Presence',
    decides:
      'Which of the structural findings are real once you look at the code.',
  },
  {
    href: '/motion/violations',
    title: 'Hardcoded values',
    group: 'Enforcement',
    decides:
      'What each hardcoded site becomes, and whether the swap is visible at all.',
  },
  {
    href: '/motion/rubric',
    title: 'Rubric bench',
    group: 'Enforcement',
    decides:
      'Whether each criterion is checkable, and what a pass and a fail look like.',
  },
  {
    href: '/motion/reduced-motion',
    title: 'Reduced motion',
    group: 'Enforcement',
    decides: 'Degrade or delete. The decision the 36-file sweep is waiting on.',
  },
  {
    href: '/motion/previews',
    title: 'Live previews',
    group: 'Coverage',
    decides:
      'The coverage work: indicators, disclosure, chips, skeletons, lists.',
  },
  {
    href: '/motion/preview-plan',
    title: 'Preview plan',
    group: 'Coverage',
    decides:
      'What every remaining preview has to show before it is worth building.',
  },
  {
    href: '/motion/library',
    title: 'Motion library',
    group: 'Compatibility',
    decides:
      'The three blockers, and whether Button keeps its press transition.',
  },
  {
    href: '/motion/plan',
    title: 'Plan & open questions',
    group: 'Plan',
    decides: 'Sequence, gates, and who has to answer what.',
  },
];
