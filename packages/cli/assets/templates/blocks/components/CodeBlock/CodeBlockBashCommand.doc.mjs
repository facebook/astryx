// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'CodeBlock',
  name: 'Code — Snippet',
  displayName: 'Code — Snippet',
  description:
    'Short terminal commands with a copy button and no line numbers. Use for install instructions or one-liner commands that readers will paste directly.',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['CodeBlock', 'Stack'],
};
