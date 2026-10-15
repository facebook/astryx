// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'BottomSheetStack',
  name: 'Bottom Sheet Stack',
  displayName: 'Bottom Sheet Stack',
  description:
    'An orders drill-in: a list sheet opens an order sheet, which opens an editor, each level receding beneath the next inside one shared dialog.',
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
    'TextInput',
  ],
};
