// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docs = {
  name: 'ListItem',
  displayName: 'ListItem',
  group: 'Glasses',
  category: 'Table & List',
  keywords: ['glasses', 'hud', 'listitem'],
  usage: {
    description: 'ListItem is a single glanceable row with title, optional subtitle, and optional meta text. Use it to compress tabular desktop data into a HUD-friendly row.',
    bestPractices: [
      {guidance: true, description: 'Design for one glanceable idea and preserve a clear voice or gaze path.'},
      {guidance: false, description: 'Do not copy dense desktop layouts directly into the HUD surface.'},
    ],
  },
  props: [
    {name: 'title', type: 'string', description: 'Primary row text.', required: true},
    {name: 'subtitle', type: 'string', description: 'Secondary row text.'},
    {name: 'meta', type: 'string', description: 'Compact trailing status, count, or time.'},
    {name: 'status', type: "'neutral' | 'info' | 'success' | 'warning' | 'error'", description: 'Status color for the meta text.', default: "'neutral'"},
  ],
};
