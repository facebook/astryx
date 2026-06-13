// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docs = {
  name: 'List',
  displayName: 'List',
  group: 'Glasses',
  category: 'Table & List',
  keywords: ['glasses', 'hud', 'list'],
  usage: {
    description: 'List renders a short set of glanceable rows on glasses. Use it instead of a table when a HUD needs to show recent notifications, choices, or status items.',
    bestPractices: [
      {guidance: true, description: 'Design for one glanceable idea and preserve a clear voice or gaze path.'},
      {guidance: false, description: 'Do not copy dense desktop layouts directly into the HUD surface.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: 'ListItem children.'},
    {name: 'gap', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: 'Space between rows.', default: '1'},
  ],
};
