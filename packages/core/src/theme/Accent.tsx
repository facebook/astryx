// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Accent.tsx
 * @input color prop (#RRGGBB seed) + children
 * @output Wrapper div that re-accents its subtree
 * @position Theme system component; sibling to MediaTheme
 *
 * Scoped accent context — re-accents a subtree without building a second
 * theme (#3495). Derives the accent-family tokens (--color-accent,
 * --color-accent-muted, --color-on-accent, --color-text-accent,
 * --color-icon-accent) from a single seed via the same HCT formulas
 * themes use (deriveAccentFamily), and declares them on the wrapper.
 *
 * Why a component instead of overriding --color-accent in CSS: var()
 * references inside custom properties substitute at the element that
 * declares them — descendants inherit the *resolved* value, so a subtree
 * override of the base token can never cascade into derived tokens that
 * were declared higher up. Re-declaring the family at the wrapper is the
 * mechanism that works at any depth, and it recomputes --color-on-accent
 * contrast, which no CSS var() indirection can express.
 *
 * @example
 * ```
 * <Accent color="#FDBA74">
 *   <Text color="accent">/ SECTION</Text>
 *   <Button label="Get started" />
 * </Accent>
 * ```
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import {deriveAccentFamily, type AccentFamilyTokens} from './expandColorScale';

const styles = stylex.create({
  root: {
    display: 'contents',
  },
  family: (tokens: AccentFamilyTokens) => ({
    '--color-accent': tokens['--color-accent'],
    '--color-accent-muted': tokens['--color-accent-muted'],
    '--color-on-accent': tokens['--color-on-accent'],
    '--color-text-accent': tokens['--color-text-accent'],
    '--color-icon-accent': tokens['--color-icon-accent'],
  }),
});

export interface AccentProps {
  /** Accent seed color as hex (#RRGGBB). */
  color: string;
  /** Content to render with the scoped accent */
  children: React.ReactNode;
}

/** Same input contract as ColorScaleConfig.accent — HCT needs #RRGGBB. */
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Scoped accent context.
 *
 * Wraps children with the accent-family tokens re-derived from `color`,
 * so accent text, icons, muted surfaces, and on-accent content all follow.
 * Nest to re-accent inner sections; the innermost Accent wins.
 */
export function Accent({color, children}: AccentProps): React.ReactElement {
  const isValid = HEX_COLOR.test(color);
  if (!isValid) {
    console.warn(
      `[Astryx] Accent: color "${color}" is not a #RRGGBB hex color. ` +
        'Accent overrides are skipped.',
    );
  }
  const family = React.useMemo(
    () => (isValid ? deriveAccentFamily(color) : null),
    [color, isValid],
  );
  return (
    <div {...stylex.props(styles.root, family && styles.family(family))}>
      {children}
    </div>
  );
}

Accent.displayName = 'Accent';
