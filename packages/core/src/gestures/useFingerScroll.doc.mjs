// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useFingerScroll',
  displayName: 'useFingerScroll',
  stability: 'experimental',
  keywords: [
    'scroll',
    'finger',
    'touch',
    'momentum',
    'scrollend',
    'minimize',
    'tab bar',
    'program scroll',
  ],
  params: [
    {
      name: 'scroller',
      type: 'RefObject<Element | null> | Document',
      description:
        "The scroller to watch: a ref to a scrolling element, or the document for the page's own scroll.",
      required: true,
    },
  ],
  returns: [
    {
      name: 'isFingerScroll',
      type: '() => boolean',
      description:
        "A reader, stable across renders: true while the scroller's scroll is a finger's.",
    },
  ],
  usage: {
    description:
      "Experimental: this hook may change or be removed in a patch release. Proposed; pending owner review. A scroll is a finger's from a scroll event while a finger that landed inside the scroller is down, until the scroller's scrollend; the momentum after the lift is still the finger's. A scroll with no finger down is the program's, even right after a tap. No timers.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Read it from the scroll listener of a behavior that follows the person's scrolling only, such as a tab bar that minimizes as the page scrolls down.",
      },
      {
        guidance: false,
        description:
          'Tell a finger scroll from a programmatic one with your own touch listeners and a timer: it misreads momentum and a scroll that starts right after a tap.',
      },
    ],
  },
  relatedHooks: ['useGestureRecognizer'],
  importPath: '@astryxdesign/core/gestures/experimental',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    "Experimental (may change or be removed in a patch release). Whether a scroller's scroll is a finger's: from a scroll while a finger that landed inside is down, until scrollend. No timers.",
  paramDescriptions: {
    scroller: 'a ref to the scroller, or the document for the page.',
  },
  returnDescriptions: {
    isFingerScroll: "reader: true while the scroll is a finger's.",
  },
  usage: {
    description:
      "Experimental. Tells a finger's scroll (and its momentum) from the program's, without timers.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Read it in a scroll listener that follows the person's scrolling.",
      },
      {
        guidance: false,
        description:
          'Own touch listeners plus a timer to guess the scroll source.',
      },
    ],
  },
};
