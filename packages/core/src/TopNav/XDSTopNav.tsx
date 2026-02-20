/**
 * @file XDSTopNav.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSTopNav component and XDSTopNavProps
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/README.md
 * - /packages/core/src/TopNav/XDSTopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 */

import {
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';

/**
 * Base TopNav styles
 */
const styles = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-navbar'],
    borderBlockEnd: `1px solid ${colorVars['--color-divider']}`,
    boxSizing: 'border-box',
  },
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  fixed: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
    flex: '1 1 auto',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  startContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  endContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
});

// =============================================================================
// Module Augmentation - Register component styles with ComponentStyles
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    topNav?: {
      /** Root nav bar styles */
      root?: ThemeStyleXStyles;
    };
  }
}
export interface XDSTopNavProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className' | 'title'
> {
  /**
   * Title slot content - typically XDSTopNavTitle with logo and text.
   * Positioned at the left edge of the nav bar.
   */
  title?: ReactNode;
  /**
   * Start content slot - typically navigation items or breadcrumbs.
   * Positioned after the title, left-aligned.
   */
  startContent?: ReactNode;
  /**
   * End content slot - typically search, icons, user profile, utility menus.
   * Positioned at the right edge of the nav bar.
   */
  endContent?: ReactNode;
  /**
   * Position behavior of the nav bar.
   * - `static`: Normal document flow (default)
   * - `sticky`: Sticks to top on scroll
   * - `fixed`: Fixed to viewport top
   * @default 'static'
   */
  position?: 'static' | 'sticky' | 'fixed';
  /**
   * Accessible label for the navigation landmark.
   * Helps screen readers identify the navigation area.
   */
  label?: string;
}

/**
 * Top navigation bar component for application headers.
 *
 * Uses a slot-based API with `title`, `startContent`, and `endContent` props
 * for flexible layout. Title and startContent are left-aligned, endContent
 * is right-aligned.
 *
 * @example
 * ```tsx
 * <XDSTopNav
 *   label="Main navigation"
 *   title={<XDSTopNavTitle title="My App" logo={<Logo />} />}
 *   startContent={
 *     <>
 *       <XDSTopNavItem label="Home" href="/" isSelected />
 *       <XDSTopNavItem label="Products" href="/products" />
 *     </>
 *   }
 *   endContent={
 *     <>
 *       <XDSButton label="Search" icon={<SearchIcon />} variant="ghost" />
 *       <Avatar />
 *     </>
 *   }
 * />
 * ```
 */
export const XDSTopNav = forwardRef<HTMLElement, XDSTopNavProps>(
  function XDSTopNav(
    {title, startContent, endContent, position = 'static', label, ...props},
    ref,
  ) {
    const themeContext = useContext(ThemeContext);
    const rootOverride = themeContext?.theme.components?.topNav?.root;

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label={label}
        {...stylex.props(
          styles.base,
          position === 'sticky' && styles.sticky,
          position === 'fixed' && styles.fixed,
          rootOverride,
        )}
        {...props}>
        <div {...stylex.props(styles.leftSection)}>
          {title && <div {...stylex.props(styles.title)}>{title}</div>}
          {startContent && (
            <div {...stylex.props(styles.startContent)}>{startContent}</div>
          )}
        </div>
        {endContent && (
          <div {...stylex.props(styles.endContent)}>{endContent}</div>
        )}
      </nav>
    );
  },
);

XDSTopNav.displayName = 'XDSTopNav';
