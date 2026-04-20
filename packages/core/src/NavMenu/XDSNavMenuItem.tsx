'use client';

/**
 * @file XDSNavMenuItem.tsx
 * @output Exports XDSNavMenuItem component
 * @position Sub-component; used inside nav heading menu popovers
 *
 * Interactive menu item with role="menuitem" for use in SideNavHeading
 * and TopNavHeading menu popovers. Keyboard navigation is handled by
 * useListFocus via the useXDSMenuHover hook on the parent container.
 */

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';
import {XDSText} from '../Text';
import {
  colorVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
  radiusVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useXDSNavMenuContext} from './XDSNavMenuContext';

const styles = stylex.create({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    padding: spacingVars['--spacing-2'],
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

export interface XDSNavMenuItemProps {
  /** Icon to display before the label. */
  icon?: XDSIconType;
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
  /** StyleX styles merged with the component's base styles. */
  xstyle?: StyleXStyles;
  /** CSS class name(s) appended to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: React.CSSProperties;
}

/**
 * A menu item for use inside nav heading menu popovers.
 *
 * Provides `role="menuitem"` for accessibility and integrates with
 * the nav menu context to dismiss the popover on click.
 *
 * @example
 * ```
 * <XDSSideNavHeading
 *   heading="Products"
 *   menu={
 *     <>
 *       <XDSNavMenuItem label="Dashboard" href="/dashboard" />
 *       <XDSNavMenuItem label="Analytics" href="/analytics" />
 *     </>
 *   }
 * />
 * ```
 */
export function XDSNavMenuItem({
  icon,
  label,
  description,
  href,
  onClick,
  isDisabled = false,
  xstyle,
  className,
  style,
}: XDSNavMenuItemProps) {
  const ctx = useXDSNavMenuContext();

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    onClick?.();
    ctx?.closeMenu();
  }, [isDisabled, onClick, ctx]);

  const Element = href ? 'a' : 'div';

  return (
    <Element
      role="menuitem"
      tabIndex={isDisabled ? undefined : -1}
      aria-disabled={isDisabled || undefined}
      href={href}
      onClick={handleClick}
      {...mergeProps(
        xdsClassName('nav-menu-item'),
        stylex.props(
          styles.root,
          isDisabled && styles.disabled,
          xstyle,
        ),
        className,
        style,
      )}>
      {icon && <XDSIcon icon={icon} size="sm" color="secondary" />}
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

XDSNavMenuItem.displayName = 'XDSNavMenuItem';
