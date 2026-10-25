// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file topNavStyles.ts
 * @input Uses StyleX and spacing tokens
 * @output Exports topNavStyles and getTopNavRootProps
 * @position Server-safe styles of TopNav's bar, mobile bar and drawer. Shared
 *   by the client TopNav (TopNav.tsx) and the server shell (TopNavShell.tsx),
 *   so both render the same desktop bar.
 *
 * SYNC: When modified, update TopNav.tsx and TopNavShell.tsx.
 */

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {CSSProperties} from 'react';
import {spacingVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * Base TopNav styles
 */
export const topNavStyles = stylex.create({
  base: {
    alignItems: 'center',
    width: '100%',
    padding: spacingVars['--spacing-2'],
    boxSizing: 'border-box',
  },
  // Flex layout (default, used when no centerContent)
  baseFlex: {
    display: 'flex',
  },
  // Grid layout (used when centerContent is present)
  baseGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
    flex: '1 1 0%',
    minWidth: 0,
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  startContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  centerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacingVars['--spacing-1'],
  },
  endContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
  // Mobile bar mode — simplified top bar with heading + toggle + endContent
  mobileBar: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: spacingVars['--spacing-2'],
    boxSizing: 'border-box',
  },
  // The heading gives up space first so the end content and toggle stay in view
  mobileBarHeading: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 1 auto',
    minWidth: 0,
  },
  mobileBarEnd: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
  // Drawer mode — vertical list of nav items
  drawerItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  drawerDivider: {
    marginBlock: spacingVars['--spacing-2'],
  },
  drawerExtraContent: {},
});

/**
 * The desktop bar's `className`, `style` and theme attributes, for the server
 * shell. TopNav.tsx composes the same parts inline (its `themeProps('top-nav')`
 * call is what tooling reads to map the `top-nav` target to TopNav);
 * TopNavShell.test.tsx holds the two equal.
 */
export function getTopNavRootProps({
  hasCenterContent,
  xstyle,
  className,
  style,
}: {
  hasCenterContent: boolean;
  xstyle: StyleXStyles | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
}) {
  return mergeProps(
    themeProps('top-nav'),
    stylex.props(
      topNavStyles.base,
      hasCenterContent ? topNavStyles.baseGrid : topNavStyles.baseFlex,
      xstyle,
    ),
    className,
    style,
  );
}
