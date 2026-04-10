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

import type {SVGIconDef} from './XDSSVGIcon';

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

/** All starter icons for convenience */
export const starterIcons: SVGIconDef[] = [
  xIcon,
  checkIcon,
  bellIcon,
  homeIcon,
  settingsIcon,
  calendarIcon,
  menuIcon,
];
