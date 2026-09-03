// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'Layout',
  name: 'Layout — Content Width',
  displayName: 'Layout — Content Width',
  description:
    'A layout using contentWidth to align header, body, and footer content while natural-height LayoutContent participates in the full-width middle scrollport.',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'LayoutFooter',
    'Button',
    'HStack',
    'VStack',
    'Text',
    'Heading',
  ],
};
