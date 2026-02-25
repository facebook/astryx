/**
 * @file XDSSideNavSection.tsx
 * @input Uses React, StyleX
 * @output Exports XDSSideNavSection component and XDSSideNavSectionProps
 * @position Core implementation; used inside XDSSideNav children
 *
 * Section grouping for navigation items with optional title and end content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/README.md
 * - /packages/core/src/SideNav/XDSSideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 */

'use client';

import {useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
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
    paddingInline: spacingVars['--spacing-3'],
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
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  subtitle: {
    fontSize: textSizeVars['--text-xsm'],
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
 * ```tsx
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

  const visuallyHiddenStyle: React.CSSProperties = isHeaderHidden
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
      {...stylex.props(styles.root)}>
      <div
        style={isHeaderHidden ? visuallyHiddenStyle : undefined}
        {...stylex.props(styles.header)}>
        {headerContent}
      </div>
      <div {...stylex.props(styles.items)}>{children}</div>
    </div>
  );
}

XDSSideNavSection.displayName = 'XDSSideNavSection';
