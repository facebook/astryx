// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'ScrollableArea',
  name: 'ScrollableArea — Sticky Passthrough',
  displayName: 'Scrollable Area — Sticky Passthrough',
  description:
    'A nested area whose content fits clips instead of scrolling, so its sticky heading passes outward and pins to the panel edge. The second queue sets stickyContainment="always" and keeps the heading in its own box.',
  isReady: true,
  aspectRatio: 1,
  componentsUsed: ['ScrollableArea', 'Card', 'Item', 'Badge', 'StatusDot'],
};
