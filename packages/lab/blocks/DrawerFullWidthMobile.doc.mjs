// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Wide desktop panel, full-width on mobile',
  displayName: 'Wide desktop panel, full-width on mobile',
  description:
    'Use a 560px desktop width and isFullWidthOnMobile to fill the viewport below 640px, without the default page reveal.',
  exampleFor: 'Drawer',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Drawer', 'Button', 'Section', 'VStack', 'Heading', 'Text'],
};
