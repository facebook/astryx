// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docs = {
  name: 'Heading',
  displayName: 'Heading',
  group: 'Glasses',
  category: 'Content',
  keywords: ['glasses', 'hud', 'heading'],
  usage: {
    description: 'Heading renders short title text for a glasses HUD card or screen. Use it to identify the single idea the user should understand first.',
    bestPractices: [
      {guidance: true, description: 'Design for one glanceable idea and preserve a clear voice or gaze path.'},
      {guidance: false, description: 'Do not copy dense desktop layouts directly into the HUD surface.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: 'Heading content.'},
    {name: 'level', type: '1 | 2 | 3', description: 'Heading level and visual size.', default: '2'},
  ],
};
