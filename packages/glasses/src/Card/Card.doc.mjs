// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docs = {
  name: 'Card',
  displayName: 'Card',
  group: 'Glasses',
  category: 'Container',
  keywords: ['glasses', 'hud', 'card'],
  usage: {
    description: 'Card is a translucent additive-light surface for one glanceable unit on glasses. Use cards sparingly to separate status, notification, or decision content from the real world behind it.',
    bestPractices: [
      {guidance: true, description: 'Design for one glanceable idea and preserve a clear voice or gaze path.'},
      {guidance: false, description: 'Do not copy dense desktop layouts directly into the HUD surface.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: 'Content rendered inside the card.'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: 'Internal padding using the spacing scale.', default: '4'},
    {name: 'variant', type: "'default' | 'floating' | 'highVisibility' | 'status'", description: 'Glasses surface treatment.', default: "'default'"},
  ],
};
