/**
 * @file icons.ts
 * @input Lucide icon SVG paths
 * @output SVGIconDef objects for starter icons
 * @position Icon library consumed by stories and tests
 *
 * Each icon has primary (main shapes) and secondary (detail) layers,
 * extracted from Lucide's 24×24 SVG icon set.
 */

import type {SVGIconDef} from './XDSSVGIcon';

/** Simple single-layer: X / Close */
export const xIcon: SVGIconDef = {
  name: 'X',
  primary: [
    {type: 'line', attrs: {x1: '18', y1: '6', x2: '6', y2: '18'}},
    {type: 'line', attrs: {x1: '6', y1: '6', x2: '18', y2: '18'}},
  ],
};

/** Simple single-layer: Check */
export const checkIcon: SVGIconDef = {
  name: 'Check',
  primary: [{type: 'path', attrs: {d: 'M20 6 9 17l-5-5'}}],
};

/** Two-layer: Bell */
export const bellIcon: SVGIconDef = {
  name: 'Bell',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9',
      },
    },
  ],
  secondary: [
    {
      type: 'path',
      attrs: {d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0'},
    },
  ],
};

/** Two-layer: Home */
export const homeIcon: SVGIconDef = {
  name: 'Home',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
      },
    },
    {
      type: 'path',
      attrs: {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      },
    },
  ],
  secondary: [
    {
      type: 'path',
      attrs: {d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'},
    },
  ],
};

/** Complex multi-path: Settings / Gear */
export const settingsIcon: SVGIconDef = {
  name: 'Settings',
  primary: [
    {
      type: 'path',
      attrs: {
        d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
      },
    },
  ],
  secondary: [{type: 'circle', attrs: {cx: '12', cy: '12', r: '3'}}],
};

/** Complex: Calendar */
export const calendarIcon: SVGIconDef = {
  name: 'Calendar',
  primary: [
    {
      type: 'rect',
      attrs: {width: '18', height: '18', x: '3', y: '4', rx: '2'},
    },
    {type: 'line', attrs: {x1: '16', y1: '2', x2: '16', y2: '6'}},
    {type: 'line', attrs: {x1: '8', y1: '2', x2: '8', y2: '6'}},
  ],
  secondary: [{type: 'line', attrs: {x1: '3', y1: '10', x2: '21', y2: '10'}}],
};

/** All starter icons for convenience */
export const starterIcons: SVGIconDef[] = [
  xIcon,
  checkIcon,
  bellIcon,
  homeIcon,
  settingsIcon,
  calendarIcon,
];
