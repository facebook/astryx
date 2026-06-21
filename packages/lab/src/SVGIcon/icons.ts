// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icons.ts
 * @input Lucide icon SVG paths
 * @output SVGIconDef objects with per-element roles
 * @position Icon library consumed by stories and tests
 *
 * Each shape has a role:
 * - "fill": closed shapes that switch between stroke (linear) and fill (bold)
 * - "stroke": lines/strokes that always render as strokes
 *
 * The role defaults to "fill" if omitted.
 */

import type {SVGIconDef} from './SVGIcon';

/** Simple stroke-only: X / Close — both lines are stroke-role */
export const xIcon: SVGIconDef = {
  name: 'X',
  primary: [
    {
      type: 'line',
      attrs: {x1: '18', y1: '6', x2: '6', y2: '18'},
      role: 'stroke',
    },
    {
      type: 'line',
      attrs: {x1: '6', y1: '6', x2: '18', y2: '18'},
      role: 'stroke',
    },
  ],
};

/** Simple stroke-only: Check */
export const checkIcon: SVGIconDef = {
  name: 'Check',
  primary: [{type: 'path', attrs: {d: 'M20 6 9 17l-5-5'}, role: 'stroke'}],
};

/** Two-layer with mixed roles: Bell body is fill, clapper is stroke */
export const bellIcon: SVGIconDef = {
  name: 'Bell',
  primary: [
    {
      type: 'path',
      attrs: {d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'},
      role: 'fill',
    },
  ],
  secondary: [
    {
      type: 'path',
      attrs: {d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0'},
      role: 'stroke',
    },
  ],
};

/**
 * Two-layer: Home — house outline is fill, door is fill (secondary).
 * In bold mode the door gets masked out of the house body.
 */
export const homeIcon: SVGIconDef = {
  name: 'Home',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      },
      role: 'fill',
    },
  ],
  secondary: [
    {
      type: 'path',
      attrs: {d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'},
      role: 'fill',
    },
  ],
};

/** Complex: Settings — gear body is fill, center circle is fill (secondary, masked in bold) */
export const settingsIcon: SVGIconDef = {
  name: 'Settings',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
      },
      role: 'fill',
    },
  ],
  secondary: [
    {type: 'circle', attrs: {cx: '12', cy: '12', r: '3'}, role: 'fill'},
  ],
};

/** Mixed roles: Calendar frame is fill, pegs are stroke, divider line is stroke */
export const calendarIcon: SVGIconDef = {
  name: 'Calendar',
  primary: [
    {
      type: 'rect',
      attrs: {width: '18', height: '18', x: '3', y: '4', rx: '2'},
      role: 'fill',
    },
    {
      type: 'line',
      attrs: {x1: '16', y1: '2', x2: '16', y2: '6'},
      role: 'stroke',
    },
    {type: 'line', attrs: {x1: '8', y1: '2', x2: '8', y2: '6'}, role: 'stroke'},
  ],
  secondary: [
    {
      type: 'line',
      attrs: {x1: '3', y1: '10', x2: '21', y2: '10'},
      role: 'stroke',
    },
  ],
};

/** Stroke-only: Menu / Hamburger — all lines are stroke-role */
export const menuIcon: SVGIconDef = {
  name: 'Menu',
  primary: [
    {
      type: 'line',
      attrs: {x1: '4', y1: '6', x2: '20', y2: '6'},
      role: 'stroke',
    },
    {
      type: 'line',
      attrs: {x1: '4', y1: '12', x2: '20', y2: '12'},
      role: 'stroke',
    },
    {
      type: 'line',
      attrs: {x1: '4', y1: '18', x2: '20', y2: '18'},
      role: 'stroke',
    },
  ],
};

/** Single curved path: Heart */
export const heartIcon: SVGIconDef = {
  name: 'Heart',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5',
      },
      role: 'fill',
    },
  ],
};

/** Nested shapes: Eye — outer shape (fill) + pupil (fill, secondary) */
export const eyeIcon: SVGIconDef = {
  name: 'Eye',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
      },
      role: 'fill',
    },
  ],
  secondary: [
    {type: 'circle', attrs: {cx: '12', cy: '12', r: '3'}, role: 'fill'},
  ],
};

/** Complex single path: Star */
export const starIcon: SVGIconDef = {
  name: 'Star',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z',
      },
      role: 'fill',
    },
  ],
};

/** Single panel: Folder */
export const folderIcon: SVGIconDef = {
  name: 'Folder',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
      },
      role: 'fill',
    },
  ],
};

/** Single path: Shield */
export const shieldIcon: SVGIconDef = {
  name: 'Shield',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      },
      role: 'fill',
    },
  ],
};

/** Mixed: Search — glass (fill) + handle (stroke, secondary) */
export const searchIcon: SVGIconDef = {
  name: 'Search',
  primary: [
    {type: 'circle', attrs: {cx: '11', cy: '11', r: '8'}, role: 'stroke'},
    {
      type: 'path',
      attrs: {d: 'm21 21-4.34-4.34'},
      role: 'stroke',
    },
  ],
};

/** Mixed: Mail — body (fill) + flap line (stroke, secondary) */
export const mailIcon: SVGIconDef = {
  name: 'Mail',
  primary: [
    {
      type: 'rect',
      attrs: {x: '2', y: '4', width: '20', height: '16', rx: '2'},
      role: 'fill',
    },
  ],
  secondary: [
    {
      type: 'path',
      attrs: {d: 'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7'},
      role: 'stroke',
    },
  ],
};

/** Mixed: Lock — body (fill) + shackle (stroke) */
export const lockIcon: SVGIconDef = {
  name: 'Lock',
  primary: [
    {
      type: 'rect',
      attrs: {width: '18', height: '11', x: '3', y: '11', rx: '2'},
      role: 'fill',
    },
    {type: 'path', attrs: {d: 'M7 11V7a5 5 0 0 1 10 0v4'}, role: 'stroke'},
  ],
};

/** All starter icons for convenience */
export const starterIcons: SVGIconDef[] = [
  xIcon,
  checkIcon,
  bellIcon,
  homeIcon,
  settingsIcon,
  calendarIcon,
  menuIcon,
  heartIcon,
  eyeIcon,
  starIcon,
  folderIcon,
  shieldIcon,
  searchIcon,
  mailIcon,
  lockIcon,
];
