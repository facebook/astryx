// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'BottomSheetSwitcher',
  name: 'Bottom Sheet Switcher — Multi-step flow (singular form)',
  displayName: 'Bottom Sheet Switcher — Multi-step flow (singular form)',
  registry: {aliases: ['bottom-sheet-switcher/review-flow']},
  description:
    'A three-step flow on the released singular activeSheet form: each step replaces the previous sheet inside one shared dialog, with no stacking.',
  isReady: true,
  isShowcase: false,
  aspectRatio: 3 / 4,
  componentsUsed: [
    'BottomSheet',
    'BottomSheetSwitcher',
    'Button',
    'CheckboxInput',
    'Divider',
    'Heading',
    'RadioList',
    'Section',
    'Stack',
    'Text',
  ],
};
