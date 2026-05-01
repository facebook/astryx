/**
 * @file xif-examples.ts
 * @description Example icons demonstrating XIF spec features
 *
 * Each example showcases a different capability:
 * - Simple stroke-only (check)
 * - Two-layer with bold knockout (home)
 * - Composable with slots (file, shield)
 * - Animated (bell)
 * - Personality override (star)
 * - Bold geometry override (bell-override)
 */

import type {XIFIcon} from './xif-types';

// =============================================================================
// Simple stroke-only
// =============================================================================

export const xifCheck: XIFIcon = {
  name: 'check',
  paths: [{type: 'path', attrs: {d: 'M5 13l4 4L19 7'}, role: 'stroke'}],
  tags: ['action', 'confirm'],
};

// =============================================================================
// Two-layer with bold knockout
// =============================================================================

export const xifHome: XIFIcon = {
  name: 'home',
  paths: [
    {
      type: 'path',
      attrs: {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      },
      role: 'fill',
      layer: 'primary',
    },
    {
      type: 'path',
      attrs: {d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'},
      role: 'fill',
      layer: 'secondary',
    },
  ],
  tags: ['navigation'],
};

// =============================================================================
// Composable icon with slot
// =============================================================================

export const xifFile: XIFIcon = {
  name: 'file',
  paths: [
    {
      type: 'path',
      attrs: {
        d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
      },
      role: 'fill',
      layer: 'primary',
    },
    {
      type: 'path',
      attrs: {d: 'M14 2v4a2 2 0 0 0 2 2h4'},
      role: 'stroke',
      layer: 'secondary',
    },
  ],
  slots: [{name: 'badge', position: {x: 0.5, y: 0.65}, size: 0.35}],
  tags: ['file', 'document'],
};

export const xifShield: XIFIcon = {
  name: 'shield',
  paths: [
    {
      type: 'path',
      attrs: {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
      role: 'fill',
      layer: 'primary',
    },
  ],
  slots: [{name: 'badge', position: 'center', size: 0.42}],
  tags: ['security', 'protection'],
};

// =============================================================================
// Animated icon
// =============================================================================

export const xifBell: XIFIcon = {
  name: 'bell',
  paths: [
    {
      type: 'path',
      attrs: {d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'},
      role: 'fill',
      layer: 'primary',
      animate: {type: 'scale', sequence: 1},
    },
    {
      type: 'path',
      attrs: {d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0'},
      role: 'stroke',
      layer: 'secondary',
      animate: {type: 'draw', sequence: 2},
    },
  ],
  tags: ['notification', 'alert'],
};

// =============================================================================
// Personality override — star keeps sharp points
// =============================================================================

export const xifStar: XIFIcon = {
  name: 'star',
  paths: [
    {
      type: 'path',
      attrs: {
        d: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z',
      },
      role: 'fill',
      layer: 'primary',
      personality: {cornerRounding: 0},
    },
  ],
  tags: ['rating', 'favorite'],
};

// =============================================================================
// Bold geometry override
// =============================================================================

export const xifBellOverride: XIFIcon = {
  name: 'bell-override',
  paths: [
    {
      type: 'path',
      attrs: {d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'},
      role: 'fill',
      layer: 'primary',
    },
    {
      type: 'path',
      attrs: {d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0'},
      role: 'stroke',
      layer: 'secondary',
    },
  ],
  overrides: {
    bold: [
      {
        type: 'path',
        attrs: {d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'},
        role: 'fill',
        layer: 'primary',
      },
      {
        type: 'path',
        attrs: {d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0'},
        role: 'fill',
        layer: 'secondary',
      },
    ],
  },
  tags: ['notification'],
};

// =============================================================================
// All examples
// =============================================================================

export const xifExamples: XIFIcon[] = [
  xifCheck,
  xifHome,
  xifFile,
  xifShield,
  xifBell,
  xifStar,
  xifBellOverride,
];
