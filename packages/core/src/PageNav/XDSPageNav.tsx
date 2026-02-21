/**
 * @file XDSPageNav.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode, StyleX
 * @output Exports XDSPageNav component and XDSPageNavProps
 * @position Core implementation; consumed by index.ts, tested by XDSPageNav.test.tsx
 *
 * Sidebar navigation container with five zones: header (sticky), topContent (sticky),
 * children (scrollable), footer, and footerIcons.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/PageNav/README.md
 * - /packages/core/src/PageNav/XDSPageNav.test.tsx
 * - /packages/core/src/PageNav/index.ts
 * - /apps/storybook/stories/PageNav.stories.tsx
 */

'use client';

import {
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colorVars['--color-surface'],
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: colorVars['--color-surface'],
  },
  topContent: {
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: colorVars['--color-surface'],
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
  },
  scrollable: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
  },
  footer: {
    flexShrink: 0,
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
  },
  footerIcons: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    borderBlockStart: `1px solid ${colorVars['--color-divider']}`,
  },
});

// =============================================================================
// Module Augmentation
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    pageNav?: {
      /** Root container styles */
      root?: ThemeStyleXStyles;
    };
  }
}

// =============================================================================
// Types
// =============================================================================

export interface XDSPageNavProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className'
> {
  /**
   * Header area — typically XDSPageNavHeader. Sticky at top.
   */
  header?: ReactNode;
  /**
   * Content pinned below header (e.g., create button, top-level items). Sticky.
   */
  topContent?: ReactNode;
  /**
   * Navigation sections and items. Scrollable.
   */
  children: ReactNode;
  /**
   * Footer area above icon bar (e.g., promo cards).
   */
  footer?: ReactNode;
  /**
   * Footer icon bar (e.g., help, notifications, avatar).
   */
  footerIcons?: ReactNode;
  /**
   * StyleX overrides for the root container.
   */
  xstyle?: StyleXStyles;
  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Sidebar navigation container for application pages.
 *
 * Provides five zones stacked vertically: a sticky header, sticky action area,
 * scrollable nav content, footer, and footer icon bar.
 *
 * @example
 * ```tsx
 * <XDSPageNav
 *   header={<XDSPageNavHeader icon={<AppIcon />} title="My App" titleHref="/" />}
 *   topContent={<XDSButton label="Create new" variant="primary" />}
 *   footerIcons={<XDSButton icon={HelpIcon} variant="ghost" label="Help" />}
 * >
 *   <XDSPageNavSection title="Main">
 *     <XDSPageNavItem label="Dashboard" icon={HomeIcon} isSelected href="/dashboard" />
 *     <XDSPageNavItem label="Projects" icon={FolderIcon} href="/projects" />
 *   </XDSPageNavSection>
 * </XDSPageNav>
 * ```
 */
export const XDSPageNav = forwardRef<HTMLElement, XDSPageNavProps>(
  function XDSPageNav(
    {
      header,
      topContent,
      children,
      footer,
      footerIcons,
      xstyle,
      'data-testid': testId,
      ...props
    },
    ref,
  ) {
    const themeContext = useContext(ThemeContext);
    const rootOverride = themeContext?.theme.components?.pageNav?.root;

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Page navigation"
        data-testid={testId}
        {...stylex.props(styles.root, rootOverride, xstyle)}
        {...props}>
        {header && <div {...stylex.props(styles.header)}>{header}</div>}
        {topContent && (
          <div {...stylex.props(styles.topContent)}>{topContent}</div>
        )}
        <div {...stylex.props(styles.scrollable)}>{children}</div>
        {footer && <div {...stylex.props(styles.footer)}>{footer}</div>}
        {footerIcons && (
          <div {...stylex.props(styles.footerIcons)}>{footerIcons}</div>
        )}
      </nav>
    );
  },
);

XDSPageNav.displayName = 'XDSPageNav';
