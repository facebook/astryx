// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useMergedRefs',
  displayName: 'useMergedRefs',
  keywords: [
    'ref',
    'refs',
    'merge',
    'forwardRef',
    'callback ref',
    'stable ref',
  ],
  params: [
    {
      name: 'refs',
      type: 'Array<Ref<T> | undefined>',
      description: 'Up to six refs that should all receive the same element.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'RefCallback<T>',
      description:
        'A merged callback ref that remains stable until an input ref changes.',
    },
  ],
  usage: {
    description:
      'Combines multiple object or callback refs into one stable callback ref. Use it when a component must forward a consumer ref while also attaching internal refs. Unlike calling mergeRefs during render, the callback identity stays stable across unrelated rerenders, so React does not detach and reattach the element.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use useMergedRefs when one element must receive both a forwarded ref and one or more internal refs.',
      },
      {
        guidance: false,
        description:
          'Call mergeRefs directly in a JSX ref prop; that creates a new callback on every render and forces unnecessary detach and attach work.',
      },
    ],
  },
  relatedComponents: [],
  relatedHooks: [],
  importPath: '@astryxdesign/core/hooks',
  category: 'utility',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Combines object/callback refs into one stable callback ref. Identity changes only when an input ref changes, avoiding detach/attach churn from inline mergeRefs calls.',
  paramDescriptions: {
    refs: 'refs that should all receive the same element.',
  },
  returnDescriptions: {
    ref: 'stable merged callback ref; changes only when an input ref changes.',
  },
  usage: {
    description:
      'Use when one element needs a forwarded consumer ref plus internal refs. Keeps the callback stable across unrelated rerenders.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for a forwarded ref plus internal measurement, focus, or anchor refs.',
      },
      {
        guidance: false,
        description:
          'Call mergeRefs inline in JSX; it forces ref detach/attach on every render.',
      },
    ],
  },
};
