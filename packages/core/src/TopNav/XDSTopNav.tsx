/**
 * @file XDSTopNav.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSTopNav component and XDSTopNavProps
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/XDSTopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 */

'use client';

import {forwardRef, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {edgeSignals} from '../Layout/edgeCompensation.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Base TopNav styles
 */
const styles = stylex.create({
  base: {
    alignItems: 'center',
    width: '100%',
    height: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-navbar'],
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
    gap: spacingVars['--spacing-2'],
  },
  endContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
});

export interface XDSTopNavProps extends Omit<
  XDSBaseProps<HTMLElement>,
  'title'
> {
  /**
   * Title slot content — typically XDSTopNavTitle with logo and text.
   * Positioned at the left edge of the nav bar.
   *
   * Note: named `title` for now but will be renamed to `heading` to avoid
   * collision with the HTML `title` attribute. See follow-up PR.
   */
  title?: ReactNode;
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
 * Slot-based layout with `title`, `startContent`, `centerContent`, and
 * `endContent`. When `centerContent` is provided, the layout switches to a
 * three-column CSS grid to keep center content horizontally centered.
 *
 * @example
 * ```
 * <XDSTopNav
 *   label="Main navigation"
 *   title={<XDSTopNavTitle title="My App" />}
 *   startContent={<XDSTopNavItem label="Home" href="/" isSelected />}
 *   endContent={<XDSButton label="Search" variant="ghost" />}
 * />
 * ```
 */
export const XDSTopNav = forwardRef<HTMLElement, XDSTopNavProps>(
  function XDSTopNav(
    {
      title,
      startContent,
      centerContent,
      endContent,
      label,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const hasCenterContent = centerContent != null;

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
          ),
          className,
          style,
        )}
        {...props}>
        <div {...stylex.props(styles.leftSection, edgeSignals.start)}>
          {title && <div {...stylex.props(styles.title)}>{title}</div>}
          {startContent && (
            <div {...stylex.props(styles.startContent)}>{startContent}</div>
          )}
        </div>
        {hasCenterContent && (
          <div {...stylex.props(styles.centerContent)}>{centerContent}</div>
        )}
        {hasCenterContent ? (
          <div {...stylex.props(styles.rightSection, edgeSignals.end)}>
            {endContent}
          </div>
        ) : (
          endContent && (
            <div {...stylex.props(styles.endContent, edgeSignals.end)}>
              {endContent}
            </div>
          )
        )}
      </nav>
    );
  },
);

XDSTopNav.displayName = 'XDSTopNav';
