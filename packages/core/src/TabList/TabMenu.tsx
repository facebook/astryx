// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabMenu.tsx
 * @input Uses React, StyleX, usePopover, TabListContext
 * @output Exports TabMenu component, TabMenuProps type, TabMenuOption type
 * @position Menu trigger button; opens dropdown of overflow menu items and
 *   mirrors selected tab indicator positioning
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/TabList.test.tsx
 * - /packages/cli/templates/blocks/components/TabList/ (showcase blocks)
 */

import React, {useCallback, useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon} from '../Icon';
import {renderIconSlot, type IconType} from '../Icon';
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
import {usePopover} from '../Popover/usePopover';
import {useListFocus} from '../hooks/useListFocus';
import {useTabListContext} from './TabListContext';
import type {TabListSize} from './TabListContext';
import {tabScope} from './tab.markers.stylex';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

export interface TabMenuOption {
  value: string;
  label: string;
  /**
   * Icon to display before the label.
   */
  icon?: ReactNode | IconType;
}

export interface TabMenuProps extends Pick<
  BaseProps<HTMLButtonElement>,
  'xstyle' | 'className' | 'style'
> {
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Label for the trigger button and dropdown heading.
   * Displayed as trigger text when no option is selected.
   */
  label: string;
  /**
   * Menu options rendered in the dropdown.
   */
  options: TabMenuOption[];
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
    borderRadius: radiusVars['--radius-element'],
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
    cursor: 'pointer',
    textDecoration: 'none',
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
  triggerSelected: {
    color: colorVars['--color-text-primary'],
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
  indicator: {
    position: 'absolute',
    bottom: '-1px',
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
    backgroundColor: colorVars['--color-icon-primary'],
    opacity: 1,
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
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-element'],
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
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
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
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
  menuHeading: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-secondary'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-3'],
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

/**
 * Tab menu trigger that opens a dropdown of additional tab options.
 * Shows the selected option's label as trigger text when an option is active.
 * Dropdown includes a heading showing the menu's label prop.
 *
 * @example
 * ```
 * <TabList value={tab} onChange={setTab}>
 *   <Tab value="overview" label="Overview" />
 *   <TabMenu label="More" options={[
 *     { value: "settings", label: "Settings" },
 *     { value: "history", label: "History" },
 *   ]} />
 * </TabList>
 * ```
 */
export function TabMenu({
  ref,
  label,
  options,
  xstyle,
  className,
  style,
}: TabMenuProps) {
  const tabListCtx = useTabListContext();
  const menuId = useId();

  const popover = usePopover({
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
  });

  const {listRef, handleKeyDown: handleListKeyDown} =
    useListFocus<HTMLDivElement>({
      onEscape: () => popover.hide(),
    });

  const handleToggle = useCallback(() => {
    if (popover.isOpen) {
      popover.hide();
    } else {
      popover.show();
    }
  }, [popover]);

  const selectedOption = options.find(o => o.value === tabListCtx.value);
  const triggerLabel = selectedOption?.label ?? label;
  const hasSelectedOption = selectedOption != null;

  const size: TabListSize = tabListCtx.size;

  const handleSelect = useCallback(
    (value: string) => {
      tabListCtx.onChange(value);
      popover.hide();
    },
    [tabListCtx, popover],
  );

  const setButtonRef = mergeRefs<HTMLButtonElement>(popover.triggerRef, ref);

  return (
    <>
      <button
        ref={setButtonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={popover.isOpen}
        aria-controls={menuId}
        onClick={handleToggle}
        {...mergeProps(
          themeProps('tab-menu'),
          stylex.props(
            styles.trigger,
            sizeStyles[size],
            hasSelectedOption && styles.triggerSelected,
            tabScope,
            xstyle,
          ),
          className,
          style,
        )}>
        <span
          aria-hidden="true"
          {...stylex.props(styles.hoverBg, hoverSizeStyles[size])}
        />
        <span {...stylex.props(styles.triggerLabel)}>
          <span {...stylex.props(styles.triggerLabelText)}>{triggerLabel}</span>
          <span aria-hidden="true" {...stylex.props(styles.triggerLabelSizer)}>
            {triggerLabel}
          </span>
        </span>
        <span
          aria-hidden="true"
          {...stylex.props(
            styles.chevron,
            popover.isOpen && styles.chevronOpen,
          )}>
          <Icon icon="chevronDown" size="sm" color="inherit" />
        </span>
        {hasSelectedOption && (
          <span
            {...mergeProps(
              themeProps('tab-indicator', {selected: 'selected'}),
              stylex.props(styles.indicator, styles.indicatorSelected),
            )}
          />
        )}
      </button>
      {popover.render(
        <div
          ref={listRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleListKeyDown}
          {...mergeProps(
            themeProps('tab-menu-dropdown'),
            stylex.props(styles.dropdown),
          )}>
          <span role="presentation" {...stylex.props(styles.menuHeading)}>
            {label}
          </span>
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
                  themeProps('tab-menu-item'),
                  stylex.props(
                    styles.menuItem,
                    isSelected && styles.menuItemSelected,
                  ),
                )}>
                <span {...stylex.props(styles.menuItemContent)}>
                  {option.icon &&
                    renderIconSlot(option.icon, {
                      size: 'sm',
                      color: 'secondary',
                    })}
                  {option.label}
                </span>
                {isSelected && (
                  <Icon icon="check" size="sm" color="accent" />
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

TabMenu.displayName = 'TabMenu';
