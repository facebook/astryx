// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'ScrollableArea',
  name: 'ScrollableArea — Nested Log',
  displayName: 'Scrollable Area — Nested Log',
  description:
    'A two-axis log viewer nested in a scrolling panel; overscroll="contain" keeps a gesture that reaches the log\'s edge from scrolling the panel behind it.',
  isReady: true,
  aspectRatio: 3 / 4,
  componentsUsed: [
    'ScrollableArea',
    'Card',
    'MetadataList',
    'MetadataListItem',
    'StatusDot',
  ],
};
