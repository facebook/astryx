/**
 * @file XDSNavIcon.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSNavIcon component and XDSNavIconProps
 * @position Shared icon container for navigation headers (TopNav, PageNav).
 *   Supports a circular accent background variant and an icon-only variant.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/NavIcon/README.md
 * - /packages/core/src/NavIcon/XDSNavIcon.test.tsx
 * - /packages/core/src/NavIcon/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 * - /apps/storybook/stories/PageNav.stories.tsx
 */

import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, sizeVars} from '../theme/tokens.stylex';

// =============================================================================
// Constants
// =============================================================================

const ICON_SIZE = 24;

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  circle: {
    borderRadius: '50%',
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-icon-on-media'],
    width: sizeVars['--size-lg'],
    height: sizeVars['--size-lg'],
  },
  icon: {
    color: colorVars['--color-icon-primary'],
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  iconInner: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSNavIconProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'style' | 'className'
> {
  /**
   * The icon element to render.
   * The icon is automatically sized to 24\u00d724px.
   */
  icon: ReactNode;

  /**
   * Visual variant.
   * - `circle`: 36px accent-colored circle with 24px icon (default)
   * - `icon`: 24px icon only, no background \u2014 uses primary icon color
   * @default 'circle'
   */
  variant?: 'circle' | 'icon';
}

/**
 * Icon container for navigation headers.
 *
 * Two variants:
 * - `circle` (default): 36px accent-colored circular background with a 24px icon.
 *   Suitable for app identity / logo in navigation headers.
 * - `icon`: 24px icon only, no background. Uses primary icon color.
 *   Suitable for lighter branding or when a background circle is too heavy.
 *
 * @example
 * ```tsx
 * import {HomeIcon} from '@heroicons/react/24/solid';
 *
 * // Circle variant (default) \u2014 36px circle with 24px icon
 * <XDSTopNavTitle
 *   title="Dashboard"
 *   logo={<XDSNavIcon icon={<HomeIcon />} />}
 * />
 *
 * // Icon-only variant \u2014 24px icon, no background
 * <XDSTopNavTitle
 *   title="Dashboard"
 *   logo={<XDSNavIcon icon={<HomeIcon />} variant="icon" />}
 * />
 * ```
 */
export const XDSNavIcon = forwardRef<HTMLSpanElement, XDSNavIconProps>(
  function XDSNavIcon({icon, variant = 'circle', ...props}, ref) {
    return (
      <span
        ref={ref}
        {...stylex.props(
          styles.base,
          variant === 'circle' ? styles.circle : styles.icon,
        )}
        {...props}>
        <span {...stylex.props(styles.iconInner)}>{icon}</span>
      </span>
    );
  },
);

XDSNavIcon.displayName = 'XDSNavIcon';
