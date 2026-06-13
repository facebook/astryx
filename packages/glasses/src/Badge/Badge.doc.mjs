// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docs = {
  name: 'Badge',
  displayName: 'Badge',
  group: 'Glasses',
  category: 'Feedback & Status',
  keywords: ['glasses', 'hud', 'badge'],
  usage: {
    description: 'Badge displays a compact status or count on a glasses HUD. Use it when a word or number must remain recognizable against an additive-light background.',
    bestPractices: [
      {guidance: true, description: 'Design for one glanceable idea and preserve a clear voice or gaze path.'},
      {guidance: false, description: 'Do not copy dense desktop layouts directly into the HUD surface.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: 'Short visible badge text.', required: true},
    {name: 'variant', type: "'neutral' | 'info' | 'success' | 'warning' | 'error'", description: 'Status color treatment.', default: "'neutral'"},
  ],
};
