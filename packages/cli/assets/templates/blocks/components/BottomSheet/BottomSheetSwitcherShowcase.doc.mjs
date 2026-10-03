// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'BottomSheetSwitcher',
  name: 'Bottom Sheet Switcher',
  displayName: 'Bottom Sheet Switcher',
  description:
    'A three-step setup flow on the ordered activeSheets path: steps replace each other like the singular flow, and the first step pushes a stacked help sheet above itself — the covered step recedes, Back pops one level, and [] closes.',
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
