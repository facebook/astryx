/**
 * @file XDSPageNavItem.tsx
 * @input Uses React forwardRef, ReactNode, StyleX, XDSIcon, XDSIconType
 * @output Exports XDSPageNavItem component and XDSPageNavItemProps
 * @position Core implementation; used inside XDSPageNav children
 *
 * Navigation item with icon, selected state, and nesting.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/PageNav/README.md
 * - /packages/core/src/PageNav/XDSPageNav.test.tsx
 * - /packages/core/src/PageNav/index.ts
 * - /apps/storybook/stories/PageNav.stories.tsx
 */

'use client';

import {forwardRef, useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    paddingInline: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: lineHeightVars['--leading-base'],
    textAlign: 'start',
    boxSizing: 'border-box',
    ':hover': {
      backgroundColor: colorVars['--color-hover-overlay'],
    },
  },
  selected: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    ':hover': {
      backgroundColor: colorVars['--color-accent-deemphasized'],
    },
  },
  disabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  label: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  endContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  children: {
    paddingInlineStart: spacingVars['--spacing-6'],
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSPageNavItemProps {
  /**
   * Item label.
   */
  label: string;
  /**
   * Icon (outline variant).
   */
  icon?: XDSIconType;
  /**
   * Icon when selected (filled variant).
   */
  selectedIcon?: XDSIconType;
  /**
   * Current page indicator.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Navigation URL.
   */
  href?: string;
  /**
   * Click handler.
   */
  onClick?: (e: React.MouseEvent) => void;
  /**
   * Right-side content (badges, counts).
   */
  endContent?: ReactNode;
  /**
   * Sub-items for nesting.
   */
  children?: ReactNode;
  /**
   * Test ID for the item element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Navigation item for XDSPageNav.
 *
 * Supports icons, selected state, nesting, and end content like badges or counts.
 *
 * @example
 * ```tsx
 * <XDSPageNavItem
 *   label="Dashboard"
 *   icon={HomeIcon}
 *   selectedIcon={HomeIconSolid}
 *   isSelected
 *   href="/dashboard"
 * />
 *
 * <XDSPageNavItem label="Settings" icon={CogIcon}>
 *   <XDSPageNavItem label="General" href="/settings/general" />
 *   <XDSPageNavItem label="Security" href="/settings/security" />
 * </XDSPageNavItem>
 * ```
 */
export const XDSPageNavItem = forwardRef<HTMLElement, XDSPageNavItemProps>(
  function XDSPageNavItem(
    {
      label,
      icon,
      selectedIcon,
      isSelected = false,
      isDisabled = false,
      href,
      onClick,
      endContent,
      children,
      'data-testid': testId,
    },
    ref,
  ) {
    const id = useId();
    const hasChildren = !!children;

    const displayIcon = isSelected && selectedIcon ? selectedIcon : icon;

    const handleClick = (e: React.MouseEvent) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const itemContent = (
      <>
        {displayIcon && (
          <XDSIcon
            icon={displayIcon}
            size="sm"
            color={
              isSelected ? 'accent' : isDisabled ? 'disabled' : 'secondary'
            }
          />
        )}
        <span {...stylex.props(styles.label)}>{label}</span>
        {endContent && (
          <span {...stylex.props(styles.endContent)}>{endContent}</span>
        )}
      </>
    );

    const ariaProps = {
      'aria-current': isSelected ? ('page' as const) : undefined,
      'aria-disabled': isDisabled || undefined,
      'data-testid': testId,
    };

    const itemElement =
      href && !isDisabled ? (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={handleClick}
          {...ariaProps}
          {...stylex.props(
            styles.item,
            isSelected && styles.selected,
            isDisabled && styles.disabled,
          )}>
          {itemContent}
        </a>
      ) : (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={handleClick}
          disabled={isDisabled}
          {...ariaProps}
          {...stylex.props(
            styles.item,
            isSelected && styles.selected,
            isDisabled && styles.disabled,
          )}>
          {itemContent}
        </button>
      );

    return (
      <div {...stylex.props(styles.root)}>
        {itemElement}
        {hasChildren && (
          <div
            role="group"
            aria-labelledby={`${id}-label`}
            {...stylex.props(styles.children)}>
            <span id={`${id}-label`} hidden>
              {label}
            </span>
            {children}
          </div>
        )}
      </div>
    );
  },
);

XDSPageNavItem.displayName = 'XDSPageNavItem';
