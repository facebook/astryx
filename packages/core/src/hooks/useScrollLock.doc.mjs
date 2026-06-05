// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useScrollLock',
  displayName: 'useScrollLock',
  keywords: ['scroll', 'lock', 'modal', 'dialog', 'body', 'prevent', 'background', 'ios', 'safari', 'fixed'],
  params: [
    {
      name: 'isLocked',
      type: 'boolean',
      description: 'Whether body scroll should be locked.',
      required: true,
    },
  ],
  returns: [],
  usage: {
    description:
      'Locks body scroll when active by pinning the body with position: fixed. This prevents background scrolling behind modals and dialogs, which is necessary for iOS Safari where overscroll-behavior: contain does not work. Restores the original scroll position when unlocked.',
    bestPractices: [
      { guidance: true, description: 'Use when opening full-screen modals or dialogs to prevent background content from scrolling.' },
      { guidance: true, description: 'Pass the same boolean that controls dialog visibility (e.g., isOpen) as the isLocked parameter.' },
      { guidance: false, description: 'Use for non-modal overlays like popovers or tooltips — users should be able to scroll away from those.' },
    ],
  },
  relatedComponents: ['Dialog'],
  relatedHooks: ['useFocusTrap'],
  importPath: '@xds/core/hooks',
  category: 'layout',
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Locks body scroll via position: fixed; prevents background scrolling behind modals/dialogs. Required for iOS Safari where overscroll-behavior: contain fails. Restores original scroll position when unlocked.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Use when opening full-screen modals/dialogs to prevent background scrolling.' },
      { guidance: true, description: 'Pass same boolean controlling dialog visibility (e.g. isOpen) as isLocked.' },
      { guidance: false, description: 'Use for non-modal overlays like popovers/tooltips — users should be able to scroll away.' },
    ],
  },
  paramDescriptions: {
    isLocked: 'Body scroll locked state **(required)**',
  },
};
