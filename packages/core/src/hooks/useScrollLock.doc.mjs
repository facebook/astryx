// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useScrollLock',
  displayName: 'useScrollLock',
  keywords: ['scroll', 'lock', 'modal', 'dialog', 'page', 'prevent', 'background', 'ios', 'safari', 'touch', 'scrollbar', 'gutter', 'layout shift', 'reflow'],
  params: [
    {
      name: 'isLocked',
      type: 'boolean',
      description: 'whether page scroll should be locked.',
      required: true,
    },
  ],
  returns: [],
  usage: {
    description:
      'Locks page scroll while active and keeps the page where it is. The root gets overflow: hidden, which stops wheel, keyboard and scrollbar scrolling. On touch screens a one-finger pan that would scroll the page is cancelled, because iOS Safari before 26.4 scrolls an overflow: hidden page under a finger; pans that a scroller inside the overlay can take, and pinch-zoom, still work. The scroll offset never changes, so nothing jumps when the lock starts or ends, and iOS Safari keeps its toolbar as it was. Where the hidden scrollbar takes layout space (desktop), the hook holds its gutter open with scrollbar-gutter: stable, so the page, including any position: fixed chrome, does not shift sideways.',
    bestPractices: [
      { guidance: true, description: 'Use when opening full-screen modals or dialogs to prevent background content from scrolling.' },
      { guidance: true, description: 'Pass the same boolean that controls dialog visibility (e.g., isOpen) as the isLocked parameter.' },
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
    'Locks page scroll while active, page stays where it is: root overflow: hidden (wheel, keyboard, scrollbar) + cancels 1-finger pans that would scroll the page (iOS Safari <26.4 scrolls overflow: hidden pages under a finger); overlay scrollers + pinch-zoom still work. Offset never changes: no jump, iOS toolbar unchanged. Holds the hidden scrollbar\'s gutter open (scrollbar-gutter: stable) so the page (incl. position: fixed chrome) does not shift sideways.',
  paramDescriptions: {
    isLocked: 'whether page scroll should be locked.',
  },
  usage: {
    description:
      'Locks page scroll while active, page stays where it is: root overflow: hidden (wheel, keyboard, scrollbar) + cancels 1-finger pans that would scroll the page (iOS Safari <26.4 scrolls overflow: hidden pages under a finger); overlay scrollers + pinch-zoom still work. Offset never changes: no jump, iOS toolbar unchanged. Holds the hidden scrollbar\'s gutter open (scrollbar-gutter: stable) so the page (incl. position: fixed chrome) does not shift sideways.',
    bestPractices: [
      { guidance: true, description: 'Use when opening full-screen modals / dialogs to prevent background content from scrolling.' },
      { guidance: true, description: 'Pass same boolean that controls dialog visibility (e.g. isOpen) as isLocked parameter.' },
      { guidance: false, description: 'Use for non-modal overlays like popovers / tooltips; users should be able to scroll away from those.' },
    ],
  },
};
