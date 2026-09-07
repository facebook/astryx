// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'BottomSheetStack',
  name: 'Bottom Sheet Stack',
  displayName: 'Bottom Sheet Stack',
  description:
    'A drill-down flow that keeps the previous sheet mounted and visibly scaled beneath the active sheet.',
  isReady: true,
  isShowcase: true,
  aspectRatio: 3 / 4,
  componentsUsed: [
    'BottomSheet',
    'BottomSheetStack',
    'Button',
    'Divider',
    'Heading',
    'Section',
    'Stack',
    'Text',
  ],
};
