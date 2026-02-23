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

export interface XDSTabProps {
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
    fontStyle: 'normal',
    fontVariant: 'normal',
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
  labelSelected: {
    color: colorVars['--color-accent-text'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  underlineSelected: {
    '::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: colorVars['--color-accent'],
      borderRadius: radiusVars['--radius-rounded'],
    },
  },
  hoverUnderline: {
    ':hover::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: colorVars['--color-divider'],
      borderRadius: radiusVars['--radius-rounded'],
      transitionProperty: 'opacity',
      transitionDuration: transitionVars['--transition-fast'],
      pointerEvents: 'none',
    },
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconSelected: {
    color: colorVars['--color-accent-text'],
  },
  labelContainer: {
    display: 'inline-grid',
    alignItems: 'center',
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
  sm: {
    height: sizeVars['--size-sm'],
  },
  md: {
    height: sizeVars['--size-md'],
  },
  lg: {
    height: sizeVars['--size-lg'],
  },
});

const fontSizeStyles = stylex.create({
  sm: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-base'],
  },
  md: {
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
  },
  lg: {
    fontSize: textSizeVars['--text-lg'],
    lineHeight: lineHeightVars['--leading-normal'],
  },
});

const iconSizeStyles = stylex.create({
  sm: {width: '14px', height: '14px'},
  md: {width: '16px', height: '16px'},
  lg: {width: '18px', height: '18px'},
});

/**
 * Tab item component. Renders as an anchor when `href` is provided,
 * otherwise as a button.
 */
export function XDSTab({value, label, href, icon, selectedIcon}: XDSTabProps) {
  const tabListCtx = useXDSTabListContext();

  const isSelected = tabListCtx.value === value;
  const size: XDSTabListSize = tabListCtx.size;
  const displayIcon = isSelected && selectedIcon ? selectedIcon : icon;

  const handleSelect = useCallback(() => {
    tabListCtx.onChange(value);
  }, [tabListCtx, value]);

  const iconElement = displayIcon ? (
    <span
      {...stylex.props(
        styles.icon,
        iconSizeStyles[size],
        isSelected && styles.iconSelected,
      )}>
      {displayIcon}
    </span>
  ) : null;

  const sharedProps = {
    'aria-current': isSelected ? ('page' as const) : undefined,
    ...stylex.props(
      styles.base,
      sizeStyles[size],
      isSelected && styles.underlineSelected,
      !isSelected && styles.hoverUnderline,
    ),
  };

  const labelElement = (
    <span
      {...stylex.props(
        styles.labelContainer,
        fontSizeStyles[size],
        isSelected && styles.labelSelected,
      )}>
      <span {...stylex.props(styles.labelText)}>{label}</span>
      <span aria-hidden="true" {...stylex.props(styles.labelSizer)}>
        {label}
      </span>
    </span>
  );

  if (href != null) {
    return (
      <a href={href} onClick={handleSelect} {...sharedProps}>
        {iconElement}
        {labelElement}
      </a>
    );
  }

  return (
    <button type="button" onClick={handleSelect} {...sharedProps}>
      {iconElement}
      {labelElement}
    </button>
  );
}

XDSTab.displayName = 'XDSTab';
