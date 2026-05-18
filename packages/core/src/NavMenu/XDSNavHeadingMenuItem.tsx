// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {renderIconSlot, type XDSIconType} from '../Icon';
import {XDSText} from '../Text';
import {
  colorVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
  radiusVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useXDSNavHeadingMenuContext} from './XDSNavMenuContext';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';

const styles = stylex.create({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    borderRadius: radiusVars['--radius-element'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    color: colorVars['--color-text-primary'],
    backgroundColor: {
      default: 'transparent',
      ':focus': colorVars['--color-overlay-hover'],
      ':hover': colorVars['--color-overlay-hover'],
    },
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    outline: 'none',
    textDecoration: 'none',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const sizeStyles = stylex.create({
  sm: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
  },
  md: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
  },
  lg: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
  },
});

export interface XDSNavHeadingMenuItemProps {
  /** Icon to display before the label. */
  icon?: ReactNode | XDSIconType;
  /** Primary label text. */
  label: ReactNode;
  /** Secondary description text displayed below the label. */
  description?: ReactNode;
  /** URL to navigate to. Renders as an anchor element when provided. */
  href?: string;
  /** Callback when the item is selected. */
  onClick?: () => void;
  /** Whether the item is disabled. @default false */
  isDisabled?: boolean;
  /**
   * StyleX styles for layout customization.
   * Must be a `stylex.create()` value.
   */
  xstyle?: StyleXStyles;
  /** CSS class name(s) appended to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: React.CSSProperties;
  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

/**
 * Menu item for nav heading popovers.
 *
 * Reads size from the parent XDSNavHeadingMenu for consistent padding.
 * Automatically dismisses the menu on click via context.
 * Renders as a link when `href` is provided.
 *
 * @example
 * ```
 * <XDSNavHeadingMenu>
 *   <XDSNavHeadingMenuItem label="Dashboard" href="/dashboard" />
 *   <XDSNavHeadingMenuItem label="Settings" icon={GearIcon} onClick={open} />
 * </XDSNavHeadingMenu>
 * ```
 */
export function XDSNavHeadingMenuItem({
  icon,
  label,
  description,
  href,
  onClick,
  isDisabled = false,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: XDSNavHeadingMenuItemProps) {
  const ctx = useXDSNavHeadingMenuContext();
  const size = ctx?.size ?? 'md';

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    onClick?.();
    ctx?.closeMenu();
  }, [isDisabled, onClick, ctx]);

  const LinkComponent = useXDSLinkComponent();
  const Element = href ? LinkComponent : 'div';

  return (
    <Element
      role="menuitem"
      tabIndex={isDisabled ? undefined : -1}
      aria-disabled={isDisabled || undefined}
      href={href}
      onClick={handleClick}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('nav-heading-menu-item', {size}),
        stylex.props(
          styles.root,
          sizeStyles[size],
          isDisabled && styles.disabled,
          xstyle,
        ),
        className,
        style,
      )}>
      {icon && renderIconSlot(icon, {size: 'sm', color: 'secondary'})}
      <span {...stylex.props(styles.content)}>
        {typeof label === 'string' ? (
          <XDSText type="body" maxLines={1}>
            {label}
          </XDSText>
        ) : (
          label
        )}
        {description && (
          <XDSText type="supporting" maxLines={1}>
            {description}
          </XDSText>
        )}
      </span>
    </Element>
  );
}

XDSNavHeadingMenuItem.displayName = 'XDSNavHeadingMenuItem';
