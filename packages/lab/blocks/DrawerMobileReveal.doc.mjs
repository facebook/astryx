// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Mobile: the 56px page reveal (default)',
  displayName: 'Mobile: the 56px page reveal (default)',
  description:
    'Below 640px, the default drawer leaves at least 56px of the page visible while respecting its width budget. Open this example in a narrow viewport to see the reveal.',
  exampleFor: 'Drawer',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Drawer', 'Button', 'Section', 'DrawerHeader', 'Text'],
};
