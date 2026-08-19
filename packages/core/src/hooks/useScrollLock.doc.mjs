// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useScrollLock',
  displayName: 'useScrollLock',
  keywords: ['scroll', 'lock', 'modal', 'dialog', 'body', 'prevent', 'background', 'ios', 'safari', 'fixed', 'scrollbar', 'gutter', 'layout shift'],
  params: [
    {
      name: 'isLocked',
      type: 'boolean',
      description: 'whether body scroll should be locked.',
      required: true,
    },
  ],
  returns: [],
  usage: {
    description:
      'Locks body scroll when active by pinning the body with position: fixed. This prevents background scrolling behind modals and dialogs, which is necessary for iOS Safari where overscroll-behavior: contain does not work. Restores the original scroll position when unlocked. Pinning hides the document scrollbar, so where that scrollbar takes layout space (desktop) its width is reserved as body padding for the duration of the lock and the page does not shift sideways.',
    bestPractices: [
      { guidance: true, description: 'Use when opening full-screen modals or dialogs to prevent background content from scrolling.' },
      { guidance: true, description: 'Pass the same boolean that controls dialog visibility (e.g., isOpen) as the isLocked parameter.' },
      { guidance: true, description: 'Compensate your own position: fixed chrome with padding-right: var(--astryx-scrollbar-gutter, 0px) — the hook sets that custom property while locked, and body padding only holds content that is in the document flow.' },
      { guidance: false, description: 'Use for non-modal overlays like popovers or tooltips; users should be able to scroll away from those.' },
    ],
  },
  relatedComponents: ['Dialog'],
  relatedHooks: ['useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'layout',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Locks body scroll when active by pinning body w/ position: fixed. Prevents background scrolling behind modals + dialogs, necessary for iOS Safari where overscroll-behavior: contain does not work. Restores original scroll position when unlocked. Reserves the hidden scrollbar\'s width as body padding so the page does not shift sideways.',
  paramDescriptions: {
    isLocked: 'whether body scroll should be locked.',
  },
  usage: {
    description:
      'Locks body scroll when active by pinning body w/ position: fixed. Prevents background scrolling behind modals + dialogs, necessary for iOS Safari where overscroll-behavior: contain does not work. Restores original scroll position when unlocked. Reserves the hidden scrollbar\'s width as body padding so the page does not shift sideways.',
    bestPractices: [
      { guidance: true, description: 'Use when opening full-screen modals / dialogs to prevent background content from scrolling.' },
      { guidance: true, description: 'Pass same boolean that controls dialog visibility (e.g. isOpen) as isLocked parameter.' },
      { guidance: true, description: 'Compensate own position: fixed chrome w/ padding-right: var(--astryx-scrollbar-gutter, 0px) — hook sets that custom property while locked; body padding only holds in-flow content.' },
      { guidance: false, description: 'Use for non-modal overlays like popovers / tooltips; users should be able to scroll away from those.' },
    ],
  },
};
