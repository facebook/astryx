'use client';

/**
 * @file XDSTabMenu.tsx
 * @input Uses React, StyleX, useXDSLayer, XDSTabListContext
 * @output Exports XDSTabMenu component, XDSTabMenuProps type, XDSTabMenuOption type
 * @position Menu trigger button; opens dropdown of overflow menu items
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/XDSTabList.test.tsx
 */

import React, {useCallback, useId} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';
import {
  colorVars,
  spacingVars,
  sizeVars,
  radiusVars,
  durationVars,
  easeVars,
  shadowVars,
  fontWeightVars,
  lineHeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useXDSLayer} from '../Layer/useXDSLayer';
import {useListFocus} from '../hooks/useListFocus';
import {XDSDivider} from '../Divider';
import {useXDSTabListContext} from './XDSTabListContext';
import type {XDSTabListSize} from './XDSTabListContext';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTabMenuOption {
  value: string;
  label: string;
  /**
   * Icon to display before the label.
   */
  icon?: XDSIconType;
}

export interface XDSTabMenuProps {
  /**
   * Label for the trigger button and dropdown heading.
   * Displayed as trigger text when no option is selected.
   */
  label: string;
  /**
   * Menu options rendered in the dropdown.
   */
  options: XDSTabMenuOption[];
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  trigger: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-3'],
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-2'],
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
    cursor: 'pointer',
    textDecoration: 'none',
    transitionProperty: 'color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-ring-focus']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  triggerSelected: {
    color: colorVars['--color-text-link'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  triggerLabel: {
    position: 'relative',
    display: 'inline-grid',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  triggerLabelText: {
    gridRowStart: 1,
    gridColumnStart: 1,
  },
  triggerLabelSizer: {
    gridRowStart: 1,
    gridColumnStart: 1,
    visibility: 'hidden',
    pointerEvents: 'none',
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  underline: {
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-rounded'],
    opacity: {
      default: 0,
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': 1,
      },
    },
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    pointerEvents: 'none',
  },
  chevron: {
    width: spacingVars['--spacing-4'],
    height: spacingVars['--spacing-4'],
    flexShrink: 0,
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1'],
    backgroundColor: colorVars['--color-surface'],
    borderRadius: radiusVars['--radius-2'],
    boxShadow: shadowVars['--shadow-menu'],
    minWidth: '160px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-1'],
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-ring-focus']}`,
    },
  },
  menuItemSelected: {
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  itemCheckmark: {
    flexShrink: 0,
    width: 16,
    height: 16,
    color: colorVars['--color-icon-primary'],
  },
});

const sizeStyles = stylex.create({
  sm: {height: sizeVars['--size-sm']},
  md: {height: sizeVars['--size-md']},
  lg: {height: sizeVars['--size-lg']},
});

/**
 * Tab menu trigger that opens a dropdown of additional tab options.
 * Shows the selected option's label as trigger text when an option is active.
 * Dropdown includes a heading showing the menu's label prop.
 *
 * @example
 * ```
 * <XDSTabList value={tab} onChange={setTab}>
 *   <XDSTab value="overview" label="Overview" />
 *   <XDSTabMenu label="More" options={[
 *     { value: "settings", label: "Settings" },
 *     { value: "history", label: "History" },
 *   ]} />
 * </XDSTabList>
 * ```
 */
export function XDSTabMenu({label, options}: XDSTabMenuProps) {
  const tabListCtx = useXDSTabListContext();
  const menuId = useId();

  const layer = useXDSLayer({
    mode: 'context',
    lightDismiss: true,
  });

  const {listRef, handleKeyDown: handleListKeyDown} = useListFocus({
    onEscape: () => layer.hide(),
  });

  const handleToggle = useCallback(() => {
    if (layer.isOpen) {
      layer.hide();
    } else {
      layer.show();
    }
  }, [layer]);

  const selectedOption = options.find(o => o.value === tabListCtx.value);
  const triggerLabel = selectedOption?.label ?? label;
  const hasSelectedOption = selectedOption != null;

  const size: XDSTabListSize = tabListCtx.size;

  const handleSelect = useCallback(
    (value: string) => {
      tabListCtx.onChange(value);
      layer.hide();
    },
    [tabListCtx, layer],
  );

  return (
    <>
      <button
        ref={layer.ref}
        type="button"
        aria-haspopup="menu"
        aria-expanded={layer.isOpen}
        aria-controls={menuId}
        onClick={handleToggle}
        {...mergeProps(
          xdsClassName('tab-menu'),
          stylex.props(
            styles.trigger,
            sizeStyles[size],
            hasSelectedOption && styles.triggerSelected,
            !hasSelectedOption && stylex.defaultMarker(),
          ),
        )}>
        <span
          {...stylex.props(
            styles.triggerLabel,
            hasSelectedOption && styles.underline,
          )}>
          <span {...stylex.props(styles.triggerLabelText)}>{triggerLabel}</span>
          <span aria-hidden="true" {...stylex.props(styles.triggerLabelSizer)}>
            {triggerLabel}
          </span>
          {!hasSelectedOption && (
            <span {...stylex.props(styles.hoverUnderline)} />
          )}
        </span>
        <span
          aria-hidden="true"
          {...stylex.props(styles.chevron, layer.isOpen && styles.chevronOpen)}>
          <XDSIcon icon="chevronDown" size="sm" color="inherit" />
        </span>
      </button>
      {layer.render(
        <div
          ref={listRef as React.RefObject<HTMLDivElement | null>}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleListKeyDown}
          {...mergeProps(
            xdsClassName('tab-menu-dropdown'),
            stylex.props(styles.dropdown),
          )}>
          <XDSDivider label={label} />
          {options.map(option => {
            const isSelected = tabListCtx.value === option.value;
            return (
              <div
                key={option.value}
                role="menuitem"
                tabIndex={0}
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => handleSelect(option.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(option.value);
                  }
                }}
                {...mergeProps(
                  xdsClassName('tab-menu-item'),
                  stylex.props(
                    styles.menuItem,
                    isSelected && styles.menuItemSelected,
                  ),
                )}>
                <span {...stylex.props(styles.menuItemContent)}>
                  {option.icon && (
                    <XDSIcon icon={option.icon} size="sm" color="secondary" />
                  )}
                  {option.label}
                </span>
                {isSelected && (
                  <XDSIcon icon="check" size="sm" color="accent" />
                )}
              </div>
            );
          })}
        </div>,
        {placement: 'below', alignment: 'start'},
      )}
    </>
  );
}

XDSTabMenu.displayName = 'XDSTabMenu';
