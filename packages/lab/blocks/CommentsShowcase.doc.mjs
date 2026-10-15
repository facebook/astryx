// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Comments panel',
  displayName: 'Markdown document review',
  description:
    'A document review with a Comments side panel. Highlighted passages and controlled thread selection stay synchronized; selecting an unannotated passage starts a new quoted thread. Replies and resolution update the host-owned data.',
  exampleFor: 'Comments',
  isReady: true,
  isShowcase: true,
  aspectRatio: 3 / 2,
  componentsUsed: ['Button', 'Card', 'Comments', 'HStack', 'Text', 'VStack'],
};
