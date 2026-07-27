// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'LogStream',
  displayName: 'Log Stream',
  group: 'LogStream',
  category: 'Content',

  usage: {
    description:
      'Experimental streaming log viewer: mono grid rows (timestamp | level | source | message) with token-derived level accents, expandable per-row detail panels, follow-scroll live tailing with a "Jump to latest" affordance, and an always-dark terminal variant. Appended rows fade in via @starting-style (instant under prefers-reduced-motion). No virtualization; window streams beyond a few thousand rows in the caller.',
  },

  props: [],
};
