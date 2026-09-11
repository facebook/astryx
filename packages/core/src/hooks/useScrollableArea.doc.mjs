// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useScrollableArea',
  displayName: 'useScrollableArea',
  keywords: ['scroll', 'overflow', 'logical axis', 'keyboard', 'overscroll', 'sticky', 'resize'],
  params: [
    {name: 'options', type: 'UseScrollableAreaOptions', description: 'Logical scroll intent, keyboard owner, and chaining policy.', required: true},
  ],
  returns: [
    {name: 'getViewportProps', type: '<E extends HTMLElement>(props?: ScrollableElementProps<E>) => ScrollableElementProps<E>', description: 'Composes caller viewport props and refs with measurement, accessibility, chaining, and owner registration.'},
    {name: 'getContentProps', type: '<E extends HTMLElement>(props?: ScrollableElementProps<E>) => ScrollableElementProps<E>', description: 'Composes caller content-box props and refs with content observation.'},
    {name: 'state', type: 'ScrollableAreaState', description: 'Stable inline and block effective-scroll and logical-edge state.'},
  ],
  usage: {
    description: 'Adds canonical axis-aware scroll behavior to structure owned by the caller. An axis is effective only when its computed overflow is scroll-capable and geometry exceeds the shared 1px tolerance. Both viewport and content boxes are observed.',
    bestPractices: [
      {guidance: true, description: 'Pass already-resolved props and refs through both prop getters, then spread each returned object once.'},
      {guidance: true, description: 'Use viewport keyboard ownership only when the viewport itself should enter the tab order; provide a concise accessible label.'},
      {guidance: true, description: 'Use content keyboard ownership when an existing focusable descendant gives keyboard users access to all overflowed content.'},
      {guidance: false, description: 'Attach only the viewport getter. A real observed content box is required for live overflow changes.'},
    ],
  },
  relatedComponents: ['ScrollableArea'],
  relatedHooks: ['useScrollOverflow'],
  importPath: '@astryxdesign/core/hooks',
  category: 'layout',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description: 'Composes logical-axis scrolling into caller-owned viewport/content elements with stable effective-axis and edge state.',
  paramDescriptions: {options: 'axis, keyboard owner, and allow/contain chaining policy.'},
  returnDescriptions: {
    getViewportProps: 'safe viewport prop/ref composition with behavior-owned accessibility and chaining.',
    getContentProps: 'safe observed content-box prop/ref composition.',
    state: 'inline/block isScrollable, atStart, and atEnd state.',
  },
  usage: {
    description: 'Use for existing structures that need ScrollableArea behavior without another wrapper.',
    bestPractices: [
      {guidance: true, description: 'Spread each prop getter result once on its owner element.'},
      {guidance: false, description: 'Skip the real content-box getter.'},
    ],
  },
};
