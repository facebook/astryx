// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Stacked drill-in (siblings, not nested)',
  displayName: 'Stacked drill-in (siblings, not nested)',
  description:
    'Open an order, then inspect a line item in a second sibling drawer. The last-opened drawer stacks on top, and Escape closes that drawer first.',
  exampleFor: 'Drawer',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Drawer', 'Button', 'Section', 'VStack', 'Heading', 'Text'],
};
