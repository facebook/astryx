'use client';

/**
 * @file XDSTabList.tsx
 * @input Uses React, StyleX, XDSTabListContext
 * @output Exports XDSTabList component and XDSTabListProps type
 * @position Nav wrapper; provides XDSTabListContext to XDSTab and XDSTabMenu children
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/XDSTabList.test.tsx
 */

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {borderVars, colorVars, spacingVars} from '../theme/tokens.stylex';
import {XDSBaseProps} from '../XDSBaseProps';
import {XDSTabListContext, DENSITY_TO_SIZE} from './XDSTabListContext';
import type {XDSTabListSize, XDSTabListDensity} from './XDSTabListContext';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTabListProps extends Omit<
  XDSBaseProps<HTMLElement>,
  'onChange'
> {
  /**
   * The currently selected tab value.
   */
  value: string;
  /**
   * Callback fired when a tab is selected.
   */
  onChange: (value: string) => void;
  /**
   * Density variant controlling vertical spacing of the tab strip.
   * - `'compact'`: sm hover target + 4px block padding (total 36px)
   * - `'balanced'`: md hover target + 4px block padding (total 40px)
   * - `'spacious'`: lg hover target + 4px block padding (total 44px)
   * @default 'balanced'
   */
  density?: XDSTabListDensity;
  /**
   * Size variant for all tabs.
   * @deprecated Use `density` instead. Maps: sm→compact, md→balanced, lg→spacious.
   * @default 'md'
   */
  size?: XDSTabListSize;
  /**
   * Layout mode for tab sizing.
   * - `'hug'` (default): each tab hugs its content width.
   * - `'fill'`: tabs stretch equally to fill the container width.
   * @default 'hug'
   */
  layout?: 'hug' | 'fill';
  /**
   * Whether to show a bottom divider under the tab list.
   * @default false
   */
  hasDivider?: boolean;
  /**
   * XDSTab and XDSTabMenu children.
   */
  children: ReactNode;
}

const styles = stylex.create({
  nav: {
    display: 'flex',
    alignItems: 'stretch',
    gap: spacingVars['--spacing-0-5'],
    paddingBlock: spacingVars['--spacing-1'],
    // Compensate for first/last tab's paddingInline so text aligns with surrounding content
    marginInline: `calc(-1 * ${spacingVars['--spacing-3']})`,
  },
  fill: {
    width: '100%',
  },
  divider: {
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
});

/**
 * Tab navigation wrapper. Provides context for value/onChange/size
 * to XDSTab and XDSTabMenu children.
 *
 * @example
 * ```
 * <XDSTabList value={activeTab} onChange={setActiveTab}>
 *   <XDSTab value="home" label="Home" />
 *   <XDSTab value="settings" label="Settings" />
 *   <XDSTabMenu label="More">
 *     <XDSTab value="analytics" label="Analytics" />
 *     <XDSTab value="reports" label="Reports" />
 *   </XDSTabMenu>
 * </XDSTabList>
 * ```
 */
export function XDSTabList({
  value,
  onChange,
  density: densityProp,
  size: sizeProp,
  layout = 'hug',
  hasDivider = false,
  xstyle,
  className,
  style,
  children,
  ...restProps
}: XDSTabListProps) {
  // Resolve density: explicit density prop wins, then map size→density, then default
  const SIZE_TO_DENSITY: Record<XDSTabListSize, XDSTabListDensity> = {
    sm: 'compact',
    md: 'balanced',
    lg: 'spacious',
  };
  const density: XDSTabListDensity =
    densityProp ?? (sizeProp ? SIZE_TO_DENSITY[sizeProp] : 'balanced');
  const size: XDSTabListSize = DENSITY_TO_SIZE[density];

  const contextValue = useMemo(
    () => ({value, onChange, size, density, layout}),
    [value, onChange, size, density, layout],
  );

  return (
    <XDSTabListContext.Provider value={contextValue}>
      <nav
        aria-label="Tabs"
        {...restProps}
        {...mergeProps(
          xdsClassName('tab-list', {density}),
          stylex.props(
            styles.nav,
            layout === 'fill' && styles.fill,
            hasDivider && styles.divider,
            xstyle,
          ),
          className,
          style,
        )}>
        {children}
      </nav>
    </XDSTabListContext.Provider>
  );
}

XDSTabList.displayName = 'XDSTabList';
