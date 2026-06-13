// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docs = {
  name: 'Button',
  displayName: 'Button',
  group: 'Glasses',
  category: 'Action',
  keywords: ['glasses', 'hud', 'button'],
  usage: {
    description: 'Button is a voice/gaze-friendly action chip for glasses. Use it for the one primary action a user can confirm from the HUD, plus one or two secondary actions when necessary.',
    bestPractices: [
      {guidance: true, description: 'Design for one glanceable idea and preserve a clear voice or gaze path.'},
      {guidance: false, description: 'Do not copy dense desktop layouts directly into the HUD surface.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: 'Short visible and speakable action label.', required: true},
    {name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'destructive'", description: 'Action emphasis.', default: "'secondary'"},
    {name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Action chip size.', default: "'md'"},
    {name: 'action', type: 'string', description: 'Stable action identifier for native routing or voice command dispatch.'},
    {name: 'isDisabled', type: 'boolean', description: 'Disables the action.', default: 'false'},
  ],
};
