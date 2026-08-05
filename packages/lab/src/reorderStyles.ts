// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reorderStyles.ts
 * @input StyleX and Astryx semantic color, radius, and spacing tokens
 * @output Shared internal visual states for reorderable Lab components
 * @position Lab-internal drag-and-drop style contract; API arbitration required before public export
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const indicatorBase = {
  content: '""',
  position: 'absolute' as const,
  insetInline: 0,
  height: spacingVars['--spacing-0-5'],
  borderRadius: radiusVars['--radius-full'],
  backgroundColor: colorVars['--color-accent'],
  pointerEvents: 'none' as const,
  zIndex: 2,
};

/**
 * Default Lab reorder visuals. Keep interaction behavior component-owned until
 * vertical, horizontal, grid, and cross-list reorder APIs are reconciled.
 */
export const reorderStyles = stylex.create({
  source: {
    opacity: 0.5,
    userSelect: 'none',
  },
  preview: {
    position: 'fixed',
    top: 0,
    left: 0,
    opacity: 0.5,
    pointerEvents: 'none',
    userSelect: 'none',
    willChange: 'transform',
    zIndex: 1000,
  },
  dropBefore: {
    position: 'relative',
    '::before': {
      ...indicatorBase,
      insetBlockStart: `calc(-1 * ${spacingVars['--spacing-0-5']})`,
    },
  },
  dropAfter: {
    position: 'relative',
    '::after': {
      ...indicatorBase,
      insetBlockEnd: `calc(-1 * ${spacingVars['--spacing-0-5']})`,
    },
  },
  handle: {
    cursor: 'grab',
    touchAction: 'none',
  },
  handleActive: {
    cursor: 'grabbing',
    touchAction: 'none',
  },
});
