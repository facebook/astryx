// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Inline comments',
  displayName: 'Inline comments',
  description:
    'Your app owns anchoring: pass the selected passage as composerAnchor to quote it in the composer, store it on the posted thread, and sync selectedThreadId with the passage you highlight.',
  exampleFor: 'Comments',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Comments', 'Card', 'Button', 'Text', 'HStack', 'VStack'],
};
