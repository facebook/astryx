'use client';

/**
 * @file XDSTopNav.tsx
 * @input Uses React, HTMLAttributes, ReactNode
 * @output Exports XDSTopNav component and XDSTopNavProps
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/XDSTopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 */


import {type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {edgeSignals} from '../Layout/edgeCompensation.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {TopNavSlotContext} from './TopNavContext';
import {useXDSTopNavRenderMode} from './XDSTopNavRenderContext';
import {useXDSTopNavMobileContent} from './XDSTopNavMobileContentContext';
import {XDSDivider} from '../Divider/XDSDivider';
import {XDSMobileNav} from '../MobileNav/XDSMobileNav';
import {XDSMobileNavToggle} from '../MobileNav/XDSMobileNavToggle';

/**
 * Base TopNav styles
 */
const styles = stylex.create({
  base: {
    alignItems: 'center',
    width: '100%',
    height: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-4'],
    boxSizing: 'border-box',
    // Publish inline padding for edge compensation (ghost buttons at edges).
    // Uses --container-padding-inline (not --container-padding) because TopNav
    // has no block padding (fixed height) — the isotropic variable would be misleading.
    '--container-padding-inline': spacingVars['--spacing-4'],
  },
  // Flex layout (default, used when no centerContent)
  baseFlex: {
    display: 'flex',
  },
  // Grid layout (used when centerContent is present)
  baseGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
    flex: '1 1 0%',
    minWidth: 0,
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  startContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  centerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacingVars['--spacing-1'],
  },
  endContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
  // Mobile bar mode — simplified top bar with heading + toggle + endContent
  mobileBar: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-4'],
    boxSizing: 'border-box',
  },
  mobileBarEnd: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    marginInlineStart: 'auto',
  },
  // Drawer mode — vertical list of nav items
  drawerItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  drawerDivider: {
    marginBlock: spacingVars['--spacing-2'],
  },
  drawerExtraContent: {},
});

export interface XDSTopNavProps extends XDSBaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Heading slot content — typically XDSTopNavHeading with logo and text.
   * Positioned at the left edge of the nav bar.
   */
  heading?: ReactNode;
  /**
   * Start content slot - typically navigation items or breadcrumbs.
   * Positioned after the title, left-aligned.
   */
  startContent?: ReactNode;
  /**
   * Center content slot - typically tabs, search bar, or primary navigation.
   * Positioned at the horizontal center of the nav bar.
   * When provided, the layout switches to a three-column CSS grid to ensure
   * true centering regardless of start/end content widths.
   */
  centerContent?: ReactNode;
  /**
   * End content slot - typically search, icons, user profile, utility menus.
   * Positioned at the right edge of the nav bar.
   */
  endContent?: ReactNode;
  /**
   * Accessible label for the navigation landmark.
   * Helps screen readers identify the navigation area.
   */
  label?: string;
}

/**
 * Top navigation bar for application headers.
 *
 * Slot-based layout with `heading`, `startContent`, `centerContent`, and
 * `endContent`. When `centerContent` is provided, the layout switches to a
 * three-column CSS grid to keep center content horizontally centered.
 *
 * @example
 * ```
 * <XDSTopNav
 *   label="Main navigation"
 *   heading={<XDSTopNavHeading heading="My App" />}
 *   startContent={<XDSTopNavItem label="Home" href="/" isSelected />}
 *   endContent={<XDSButton label="Search" variant="ghost" />}
 * />
 * ```
 */
export function XDSTopNav({
  heading,
  startContent,
  centerContent,
  endContent,
  label,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSTopNavProps) {
  const renderMode = useXDSTopNavRenderMode();
  const mobileContent = useXDSTopNavMobileContent();
  const hasCenterContent = centerContent != null;
  const hasCollapsibleContent = startContent != null || centerContent != null;

  // =========================================================================
  // Mobile bar mode — heading + endContent + toggle, hide nav items
  // =========================================================================
  if (renderMode === 'mobile-bar') {
    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label={label}
        {...mergeProps(
          xdsClassName('top-nav', {mode: 'mobile-bar'}),
          stylex.props(styles.mobileBar, xstyle),
          className,
          style,
        )}
        {...props}>
        {heading && <div {...stylex.props(styles.heading)}>{heading}</div>}
        <div {...stylex.props(styles.mobileBarEnd)}>
          {endContent}
          {hasCollapsibleContent && <XDSMobileNavToggle />}
        </div>
      </nav>
    );
  }

  // =========================================================================
  // Drawer mode — render nav items vertically inside a MobileNav,
  // plus any additional content passed via context (e.g. SideNav items)
  // =========================================================================
  if (renderMode === 'drawer') {
    // Only render if there are collapsible items or extra content
    if (!hasCollapsibleContent && !mobileContent) return null;

    return (
      <XDSMobileNav header={heading}>
        {hasCollapsibleContent && (
          <div {...stylex.props(styles.drawerItems)}>
            {startContent}
            {centerContent}
          </div>
        )}
        {hasCollapsibleContent && mobileContent && (
          <div {...stylex.props(styles.drawerDivider)}>
            <XDSDivider />
          </div>
        )}
        {mobileContent && (
          <div {...stylex.props(styles.drawerExtraContent)}>
            {mobileContent}
          </div>
        )}
      </XDSMobileNav>
    );
  }

  // =========================================================================
  // Default mode — full top bar
  // =========================================================================

  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label={label}
      {...mergeProps(
        xdsClassName('top-nav'),
        stylex.props(
          styles.base,
          hasCenterContent ? styles.baseGrid : styles.baseFlex,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      <div {...stylex.props(styles.leftSection, edgeSignals.start)}>
        {heading && <div {...stylex.props(styles.heading)}>{heading}</div>}
        {startContent && (
          <TopNavSlotContext value="start">
            <div {...stylex.props(styles.startContent)}>{startContent}</div>
          </TopNavSlotContext>
        )}
      </div>
      {hasCenterContent && (
        <TopNavSlotContext value="center">
          <div {...stylex.props(styles.centerContent)}>{centerContent}</div>
        </TopNavSlotContext>
      )}
      {hasCenterContent ? (
        <div {...stylex.props(styles.rightSection, edgeSignals.end)}>
          <TopNavSlotContext value="end">{endContent}</TopNavSlotContext>
        </div>
      ) : (
        endContent && (
          <div {...stylex.props(styles.endContent, edgeSignals.end)}>
            <TopNavSlotContext value="end">{endContent}</TopNavSlotContext>
          </div>
        )
      )}
    </nav>
  );
}

XDSTopNav.displayName = 'XDSTopNav';
