// Copyright (c) Meta Platforms, Inc. and affiliates.

export const docs = {
  name: 'AccessibilityOverlayFixture',
  displayName: 'Accessibility Overlay Fixture',
  category: 'Test',
  usage: {
    description: 'Base description.',
    bestPractices: [
      {
        guidance: true,
        description: 'Base-only best practice.',
      },
    ],
    accessibility: [
      {
        name: 'Accessible name',
        description: 'Provide an accessible name.',
      },
    ],
    anatomy: [
      {
        name: 'Base-only anatomy',
        required: true,
        description: 'This must not leak into translated output.',
      },
    ],
  },
  props: [],
};

export const docsDense = {
  usage: {
    description: 'Dense description.',
  },
  props: [],
};
