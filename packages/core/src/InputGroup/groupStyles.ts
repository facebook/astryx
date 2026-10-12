// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file groupStyles.ts
 * @input Uses StyleX, theme tokens, and layer-aware group end-cap selectors
 * @output Exports shared group-aware styles for input components
 * @position Shared styles consumed by InputGroup-compatible controls
 */

import * as stylex from '@stylexjs/stylex';
import {radiusVars, borderVars} from '../theme/tokens.stylex';

// A grouped control may be followed by context-layer infrastructure rather
// than another control. Popovers, inert markers, and native dialog surfaces
// are not visual group members; skip them when finding the trailing edge.
const IS_LAST_ITEM = ':not(:has(~ *:not([popover]):not(template):not(dialog)))';

export const groupStyles = stylex.create({
  inGroup: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    marginInlineStart: {
      default: `calc(-1 * ${borderVars['--border-width']})`,
      ':first-child': 0,
    },
    borderStartStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderEndStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderStartEndRadius: {
      default: 0,
      [IS_LAST_ITEM]: radiusVars['--radius-element'],
    },
    borderEndEndRadius: {
      default: 0,
      [IS_LAST_ITEM]: radiusVars['--radius-element'],
    },
    ':focus-within': {
      zIndex: 1,
    },
  },
});
