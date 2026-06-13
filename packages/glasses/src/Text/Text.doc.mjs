// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docs = {
  name: 'Text',
  displayName: 'Text',
  group: 'Glasses',
  category: 'Content',
  keywords: ['glasses', 'hud', 'text'],
  usage: {
    description: 'Text renders short additive-light copy on a glasses HUD. Use it for glanceable labels, status summaries, and one-line explanations.',
    bestPractices: [
      {guidance: true, description: 'Design for one glanceable idea and preserve a clear voice or gaze path.'},
      {guidance: false, description: 'Do not copy dense desktop layouts directly into the HUD surface.'},
    ],
  },
  props: [
    {name: 'children', type: 'ReactNode', description: 'Text content.'},
    {name: 'type', type: "'body' | 'supporting' | 'caption'", description: 'Typographic role.', default: "'body'"},
    {name: 'weight', type: "'regular' | 'medium' | 'bold'", description: 'Font weight emphasis.', default: "'regular'"},
  ],
};
