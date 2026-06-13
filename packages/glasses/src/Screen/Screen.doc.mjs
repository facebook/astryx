// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docs = {
  name: 'Screen',
  displayName: 'Screen',
  group: 'Glasses',
  category: 'Layout',
  keywords: ['glasses', 'hud', 'screen'],
  usage: {
    description: 'Screen is the root surface for a smart-glasses HUD experience. Use it for glanceable, voice-friendly UI that fits inside the 600×600 projected display.',
    bestPractices: [
      {guidance: true, description: 'Design for one glanceable idea and preserve a clear voice or gaze path.'},
      {guidance: false, description: 'Do not copy dense desktop layouts directly into the HUD surface.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: 'Glanceable content rendered inside the HUD safe area.', required: true},
    {name: 'ambient', type: "'bright' | 'dim' | 'dark' | 'auto'", description: 'Ambient-light mode hint for additive-light rendering.', default: "'auto'"},
    {name: 'label', type: 'string', description: 'Short accessible description of the HUD screen.'},
  ],
};
