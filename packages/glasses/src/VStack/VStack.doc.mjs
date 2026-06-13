// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docs = {
  name: 'VStack',
  displayName: 'VStack',
  group: 'Glasses',
  category: 'Layout',
  keywords: ['glasses', 'hud', 'vstack'],
  usage: {
    description: 'VStack arranges HUD content vertically with tokenized gaps. Use it as the default layout primitive for readable glasses experiences.',
    bestPractices: [
      {guidance: true, description: 'Design for one glanceable idea and preserve a clear voice or gaze path.'},
      {guidance: false, description: 'Do not copy dense desktop layouts directly into the HUD surface.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: 'Stack children.'},
    {name: 'gap', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: 'Space between children.', default: '2'},
    {name: 'hAlign', type: "'start' | 'center' | 'end' | 'stretch'", description: 'Horizontal alignment.', default: "'stretch'"},
    {name: 'vAlign', type: "'start' | 'center' | 'end' | 'between'", description: 'Vertical distribution.', default: "'start'"},
  ],
};
