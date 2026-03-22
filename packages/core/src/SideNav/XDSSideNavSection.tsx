'use client';

/**
 * @file XDSSideNavSection.tsx
 * @input Uses React, StyleX
 * @output Exports XDSSideNavSection component and XDSSideNavSectionProps
 * @position Core implementation; used inside XDSSideNav children
 *
 * Section grouping for navigation items with optional title and end content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/XDSSideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 */


import {useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  fontWeightVars,
  lineHeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useXDSSideNavCollapse} from './XDSSideNavCollapseContext';
// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    paddingBlock: spacingVars['--spacing-1'],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    cursor: 'default',
    userSelect: 'none',
  },

  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  subtitle: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  endContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },

  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSSideNavSectionProps {
  /**
   * Section title.
   */
  title: string;
  /**
   * Section subtitle.
   */
  subtitle?: string;
  /**
   * Section items.
   */
  children: ReactNode;
  /**
   * Right-side content in the section header.
   */
  endContent?: ReactNode;
  /**
   * Whether the section header is visually hidden.
   * The section title is still accessible to screen readers.
   * @default false
   */
  isHeaderHidden?: boolean;
  /**
   * Test ID for the section element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Section grouping for XDSSideNav items.
 *
 * Renders a labeled group of navigation items.
 * Uses `role="group"` with `aria-labelledby` for accessibility.
 *
 * @example
 * ```
 * <XDSSideNavSection title="Main">
 *   <XDSSideNavItem label="Dashboard" icon={HomeIcon} isSelected />
 *   <XDSSideNavItem label="Projects" icon={FolderIcon} />
 * </XDSSideNavSection>
 * ```
 */
export function XDSSideNavSection({
  title,
  subtitle,
  children,
  endContent,
  isHeaderHidden = false,
  'data-testid': testId,
}: XDSSideNavSectionProps) {
  const {isCollapsed} = useXDSSideNavCollapse();
  const id = useId();
  const titleId = `${id}-title`;

  const headerContent = (
    <>
      <span {...stylex.props(styles.titleContainer)}>
        <span id={titleId} {...stylex.props(styles.title)}>
          {title}
        </span>
        {subtitle && <span {...stylex.props(styles.subtitle)}>{subtitle}</span>}
      </span>
      {endContent && (
        <span {...stylex.props(styles.endContent)}>{endContent}</span>
      )}
    </>
  );

  const shouldHideHeader = isHeaderHidden || isCollapsed;

  const visuallyHiddenStyle: React.CSSProperties = shouldHideHeader
    ? {
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }
    : {};

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('side-nav-section'),
        stylex.props(styles.root),
      )}>
      <div
        style={shouldHideHeader ? visuallyHiddenStyle : undefined}
        {...stylex.props(styles.header)}>
        {headerContent}
      </div>
      <div {...stylex.props(styles.items)}>{children}</div>
    </div>
  );
}

XDSSideNavSection.displayName = 'XDSSideNavSection';
