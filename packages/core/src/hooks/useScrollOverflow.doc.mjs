/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useScrollOverflow',
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
