// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  name: 'Wide desktop panel, full-width on mobile',
  displayName: 'Wide desktop panel, full-width on mobile',
  description:
    'Use a 560px desktop width and the experimental isFullWidthOnMobile option to fill the viewport below 640px, without the default page reveal. Options inside experimental may change or be removed in a patch release.',
  exampleFor: 'Drawer',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: [
    'Drawer',
    'Button',
    'Layout',
    'LayoutContent',
    'DrawerHeader',
    'Text',
  ],
};
