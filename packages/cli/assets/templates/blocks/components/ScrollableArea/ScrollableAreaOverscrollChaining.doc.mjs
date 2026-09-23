// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'ScrollableArea',
  name: 'ScrollableArea — Overscroll Chaining',
  displayName: 'Scrollable Area — Overscroll Chaining',
  description:
    'The default overscroll="allow": reaching the end of the nested item list hands the gesture to the order panel behind it, so one flick keeps reading instead of stopping dead.',
  isReady: true,
  aspectRatio: 3 / 4,
  componentsUsed: ['ScrollableArea', 'Card', 'Item', 'Avatar', 'Divider'],
};
