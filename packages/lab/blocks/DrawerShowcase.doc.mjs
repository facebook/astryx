// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Basic',
  displayName: 'Basic',
  description:
    'Open a modal drawer from a single trigger. The scrim dims the page; Escape, a scrim click, or the header close button closes it, and focus returns to the trigger.',
  exampleFor: 'Drawer',
  isReady: true,
  isShowcase: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Drawer', 'Button', 'Section', 'DrawerHeader', 'Text'],
};
