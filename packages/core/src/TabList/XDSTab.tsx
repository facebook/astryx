/**
 * @file XDSTab.tsx
 * @input Uses React, StyleX, XDSTabListContext
 * @output Exports XDSTab component and XDSTabProps type
 * @position Core tab item; renders as button or anchor in navigation
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/README.md
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/XDSTabList.test.tsx
 */

'use client';

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  sizeVars,
  radiusVars,
  transitionVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {useXDSTabListContext} from './XDSTabListContext';
import type {XDSTabListSize} from './XDSTabListContext';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';

export interface XDSTabProps {
  /**
   * Custom component to render instead of `<a>` for link tabs.
   * Overrides the provider-level default set by XDSLinkProvider.
   * Only applies when `href` is provided. Must accept href, className, style, and children props.
   */
  as?: XDSLinkComponentType;
  /**
   * Unique value for this tab. Matched against XDSTabListContext.value.
   */
  value: string;
  /**
   * Visible label text for this tab.
   */
  label: string;
  /**
   * URL to navigate to. When provided, renders as an anchor element.
   */
  href?: string;
  /**
   * Icon element shown when tab is not selected.
   */
  icon?: ReactNode;
  /**
   * Icon element shown when tab is selected. Falls back to `icon` if not provided.
   */
  selectedIcon?: ReactNode;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-3'],
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-element'],
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
    cursor: 'pointer',
    textDecoration: 'none',
    transitionProperty: 'color',
    transitionDuration: transitionVars['--transition-fast'],
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  selected: {
    color: colorVars['--color-accent-text'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  underlineSelected: {
    '::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: spacingVars['--spacing-3'],
      right: spacingVars['--spacing-3'],
      height: '2px',
      backgroundColor: colorVars['--color-accent'],
      borderRadius: radiusVars['--radius-rounded'],
    },
  },
  hoverUnderline: {
    position: 'absolute',
    bottom: 0,
    left: spacingVars['--spacing-3'],
    right: spacingVars['--spacing-3'],
    height: '2px',
    backgroundColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-rounded'],
    opacity: {
      default: 0,
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': 1,
      },
    },
    transitionProperty: 'opacity',
    transitionDuration: transitionVars['--transition-fast'],
    pointerEvents: 'none',
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  labelContainer: {
    display: 'inline-grid',
  },
  labelText: {
    gridRowStart: 1,
    gridColumnStart: 1,
  },
  labelSizer: {
    gridRowStart: 1,
    gridColumnStart: 1,
    visibility: 'hidden',
    pointerEvents: 'none',
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
});

const sizeStyles = stylex.create({
  sm: {height: sizeVars['--size-sm']},
  md: {height: sizeVars['--size-md']},
  lg: {height: sizeVars['--size-lg']},
});

const iconSizeStyles = stylex.create({
  sm: {width: '14px', height: '14px'},
  md: {width: '16px', height: '16px'},
  lg: {width: '18px', height: '18px'},
});

/**
 * Tab item component. Renders as an anchor when `href` is provided,
 * otherwise as a button.
 *
 * @example
 * ```
 * <XDSTabList value={tab} onChange={setTab}>
 *   <XDSTab value="general" label="General" />
 *   <XDSTab value="advanced" label="Advanced" />
 * </XDSTabList>
 * ```
 */
export function XDSTab({
  as,
  value,
  label,
  href,
  icon,
  selectedIcon,
}: XDSTabProps) {
  const tabListCtx = useXDSTabListContext();
  const LinkComponent = useXDSLinkComponent(as);

  const isSelected = tabListCtx.value === value;
  const size: XDSTabListSize = tabListCtx.size;
  const displayIcon = isSelected && selectedIcon ? selectedIcon : icon;

  const handleSelect = useCallback(() => {
    tabListCtx.onChange(value);
  }, [tabListCtx, value]);

  const iconElement = displayIcon ? (
    <span {...stylex.props(styles.icon, iconSizeStyles[size])}>
      {displayIcon}
    </span>
  ) : null;

  const sharedProps = {
    'aria-current': isSelected ? ('page' as const) : undefined,
    ...stylex.props(
      styles.base,
      sizeStyles[size],
      isSelected && styles.selected,
      isSelected && styles.underlineSelected,
      !isSelected && stylex.defaultMarker(),
    ),
  };

  const hoverUnderlineElement = !isSelected ? (
    <span {...stylex.props(styles.hoverUnderline)} />
  ) : null;

  const labelElement = (
    <span {...stylex.props(styles.labelContainer)}>
      <span {...stylex.props(styles.labelText)}>{label}</span>
      <span aria-hidden="true" {...stylex.props(styles.labelSizer)}>
        {label}
      </span>
    </span>
  );

  if (href != null) {
    return (
      <LinkComponent href={href} onClick={handleSelect} {...sharedProps}>
        {iconElement}
        {labelElement}
        {hoverUnderlineElement}
      </LinkComponent>
    );
  }

  return (
    <button type="button" onClick={handleSelect} {...sharedProps}>
      {iconElement}
      {labelElement}
      {hoverUnderlineElement}
    </button>
  );
}

XDSTab.displayName = 'XDSTab';
