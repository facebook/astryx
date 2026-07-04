// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file groupStyles.ts
 * @input Uses StyleX, theme tokens
 * @output Exports shared group-aware styles for input components
 * @position Shared styles consumed by InputGroup-compatible controls
 */

import * as stylex from '@stylexjs/stylex';
import {radiusVars, borderVars} from '../theme/tokens.stylex';

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
      ':last-child': radiusVars['--radius-element'],
      ':has(+ [popover]:last-child)': radiusVars['--radius-element'],
      ':has(+ [popover] + [popover]:last-child)':
        radiusVars['--radius-element'],
    },
    borderEndEndRadius: {
      default: 0,
      ':last-child': radiusVars['--radius-element'],
      ':has(+ [popover]:last-child)': radiusVars['--radius-element'],
      ':has(+ [popover] + [popover]:last-child)':
        radiusVars['--radius-element'],
    },
    ':focus-within': {
      zIndex: 1,
    },
  },
});
