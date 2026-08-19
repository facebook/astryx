// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'Step',
  name: 'Step — Indicator',
  displayName: 'Step — Indicator',
  description:
    'The four things the indicator prop accepts, one per step: the auto default, an always-number badge, a custom ReactNode, and none. Every variant occupies the same box, so a step swapping its number for a check as it completes never shifts the label beside it.',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['Stepper', 'Step', 'Icon'],
};
