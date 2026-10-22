// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'BottomSheetSwitcher',
  name: 'Bottom Sheet Switcher',
  displayName: 'Bottom Sheet Switcher',
  description:
    'A three-step flow that transitions between content-hugging sheets of different heights, each step in its own native dialog with one scrim handed between them.',
  isReady: true,
  isShowcase: true,
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
