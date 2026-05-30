// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSTab.tsx
 * @input Uses React, StyleX, XDSTabListContext
 * @output Exports XDSTab component and XDSTabProps type
 * @position Core tab item; renders as button or anchor in navigation
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/XDSTabList.test.tsx
 * - /packages/cli/templates/blocks/components/TabList/ (showcase blocks)
 */

import React, {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  sizeVars,
  radiusVars,
  durationVars,
  easeVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useXDSTabListContext} from './XDSTabListContext';
import type {XDSTabListSize} from './XDSTabListContext';
import {tabScope} from './tab.markers.stylex';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';
import {xdsClassName, mergeProps} from '../utils';
import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';

export interface XDSTabProps extends XDSBaseProps<HTMLButtonElement> {
  /**
   * Custom component to render instead of `<a>` for link tabs.
   * Overrides the provider-level default set by XDSLinkProvider.
   * Only applies when `href` is provided. Must accept href, className, style, and children props.
   */
  as?: XDSLinkComponentType;
  ref?: React.Ref<HTMLButtonElement>;
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
  /**
   * Content rendered after the label (e.g. a badge or status dot).
   */
  endContent?: ReactNode;
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
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transitionProperty: 'color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  hoverBg: {
    position: 'absolute',
    inset: 0,
    margin: 'auto',
    width: '100%',
    borderRadius: radiusVars['--radius-element'],
    pointerEvents: 'none',
    backgroundColor: {
      default: 'transparent',
      [stylex.when.ancestor(':hover', tabScope)]: {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  selected: {
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  indicator: {
    position: 'absolute',
    bottom: 'var(--_tab-indicator-bottom, -1px)',
    left: spacingVars['--spacing-3'],
    right: spacingVars['--spacing-3'],
    height: '2px',
    borderRadius: radiusVars['--radius-full'],
    pointerEvents: 'none',
    transitionProperty: 'opacity, background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  indicatorSelected: {
    backgroundColor: colorVars['--color-accent'],
    opacity: 1,
  },
  indicatorUnselected: {
    backgroundColor: 'transparent',
    opacity: 0,
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
  endContentWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  },
});

const sizeStyles = stylex.create({
  sm: {height: sizeVars['--size-element-sm']},
  md: {height: sizeVars['--size-element-md']},
  lg: {height: sizeVars['--size-element-lg']},
});

// Hover bg uses the standard element size (one step smaller than tab)
const hoverSizeStyles = stylex.create({
  sm: {height: sizeVars['--size-element-sm']},
  md: {height: sizeVars['--size-element-md']},
  lg: {height: sizeVars['--size-element-lg']},
});

const layoutStyles = stylex.create({
  fill: {
    flex: 1,
    justifyContent: 'center',
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
  ref,
  value,
  label,
  href,
  icon,
  selectedIcon,
  endContent,
  xstyle,
  className,
  style,
  ...restProps
}: XDSTabProps) {
  const tabListCtx = useXDSTabListContext();
  const LinkComponent = useXDSLinkComponent(as);

  const isSelected = tabListCtx.value === value;
  const size: XDSTabListSize = tabListCtx.size;
  const isFill = tabListCtx.layout === 'fill';
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
    ...restProps,
    [EDGE_COMP_ATTR]: '',
    'aria-current': isSelected ? ('page' as const) : undefined,
    ...mergeProps(
      xdsClassName('tab', {
        selected: isSelected ? 'selected' : null,
      }),
      stylex.props(
        styles.base,
        sizeStyles[size],
        isSelected && styles.selected,
        isFill && layoutStyles.fill,
        tabScope,
        xstyle,
      ),
      className,
      style,
    ),
  };

  const hoverBgElement = (
    <span
      aria-hidden="true"
      {...stylex.props(styles.hoverBg, hoverSizeStyles[size])}
    />
  );

  const indicatorElement = (
    <span
      {...mergeProps(
        xdsClassName('tab-indicator', {
          selected: isSelected ? 'selected' : null,
        }),
        stylex.props(
          styles.indicator,
          isSelected ? styles.indicatorSelected : styles.indicatorUnselected,
        ),
      )}
    />
  );

  const labelElement = (
    <span {...stylex.props(styles.labelContainer)}>
      <span {...stylex.props(styles.labelText)}>{label}</span>
      <span aria-hidden="true" {...stylex.props(styles.labelSizer)}>
        {label}
      </span>
    </span>
  );

  const endContentElement = endContent ? (
    <span {...stylex.props(styles.endContentWrapper)}>{endContent}</span>
  ) : null;

  if (href != null) {
    return (
      <LinkComponent
        ref={ref}
        href={href}
        onClick={handleSelect}
        {...sharedProps}>
        {hoverBgElement}
        {iconElement}
        {labelElement}
        {endContentElement}
        {indicatorElement}
      </LinkComponent>
    );
  }

  return (
    <button ref={ref} type="button" onClick={handleSelect} {...sharedProps}>
      {hoverBgElement}
      {iconElement}
      {labelElement}
      {endContentElement}
      {indicatorElement}
    </button>
  );
}

XDSTab.displayName = 'XDSTab';
