// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Non-modal inspector (page stays interactive)',
  displayName: 'Non-modal inspector (page stays interactive)',
  description:
    'Open a non-modal inspector while keeping the page behind it interactive. In a master-detail flow, derive isOpen from the selection and retain the last content during close.',
  exampleFor: 'Drawer',
  isReady: true,
  isShowcase: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Drawer', 'Button', 'Section', 'VStack', 'Heading', 'Text'],
};
