// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useScrollOverflow',
  displayName: 'useScrollOverflow',
  keywords: ['scroll', 'overflow', 'carousel', 'fade', 'edge', 'horizontal', 'scrollable', 'resize'],
  params: [],
  returns: [
    {
      name: 'scrollRef',
      type: 'React.RefCallback<HTMLElement>',
      description: 'Ref callback to attach to the horizontally scrollable container element.',
    },
    {
      name: 'overflowStart',
      type: 'boolean',
      description: 'Whether content overflows the start edge (left in LTR, right in RTL).',
    },
    {
      name: 'overflowEnd',
      type: 'boolean',
      description: 'Whether content overflows the end edge (right in LTR, left in RTL).',
    },
    {
      name: 'hasOverflow',
      type: 'boolean',
      description: 'Whether the container has any scroll overflow at all (scrollWidth > clientWidth).',
    },
  ],
  usage: {
    description:
      'Tracks scroll overflow state for a horizontally scrollable container. Returns a ref callback and state booleans that update as the user scrolls or the container resizes. Uses scroll event listeners and ResizeObserver for reactive updates. Tolerance of 1px is applied to avoid sub-pixel false positives.',
    bestPractices: [
      { guidance: true, description: 'Use to show/hide scroll navigation buttons or fade edges on carousels and horizontal lists.' },
      { guidance: true, description: 'Apply the scrollRef to a container with overflow-x: auto or overflow-x: scroll.' },
      { guidance: false, description: 'Use for vertical scroll tracking — this hook only measures horizontal overflow.' },
    ],
  },
  relatedComponents: ['Carousel'],
  relatedHooks: ['useOverflow'],
  importPath: '@xds/core/hooks',
  category: 'layout',
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Tracks horizontal scroll overflow state; returns ref callback + state booleans updating on scroll/resize. Uses scroll listeners + ResizeObserver. 1px tolerance avoids sub-pixel false positives.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Show/hide scroll nav buttons or fade edges on carousels + horizontal lists.' },
      { guidance: true, description: 'Apply scrollRef to container w/ overflow-x: auto/scroll.' },
      { guidance: false, description: 'Use for vertical scroll tracking — only measures horizontal overflow.' },
    ],
  },
  returnDescriptions: {
    scrollRef: 'Ref callback; attach to horizontally scrollable container element.',
    overflowStart: 'Content overflows start edge (left in LTR, right in RTL).',
    overflowEnd: 'Content overflows end edge (right in LTR, left in RTL).',
    hasOverflow: 'Container has any scroll overflow (scrollWidth > clientWidth).',
  },
};
