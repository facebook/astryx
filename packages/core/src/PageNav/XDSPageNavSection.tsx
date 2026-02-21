/**
 * @file XDSPageNavSection.tsx
 * @input Uses React, StyleX, XDSCollapsibleConfig
 * @output Exports XDSPageNavSection component and XDSPageNavSectionProps
 * @position Core implementation; used inside XDSPageNav children
 *
 * Section grouping for navigation items with optional title, collapsible behavior,
 * and end content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/PageNav/README.md
 * - /packages/core/src/PageNav/XDSPageNav.test.tsx
 * - /packages/core/src/PageNav/index.ts
 * - /apps/storybook/stories/PageNav.stories.tsx
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
import type {XDSCollapsibleConfig} from './XDSPageNavItem';

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
  headerCollapsible: {
    cursor: 'pointer',
    borderRadius: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    textAlign: 'start',
    width: '100%',
    ':hover': {
      backgroundColor: colorVars['--color-hover-overlay'],
    },
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
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
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
  chevron: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    color: colorVars['--color-icon-secondary'],
    transition: 'transform 150ms ease',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  chevronClosed: {
    transform: 'rotate(0deg)',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSPageNavSectionProps {
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
   * Collapsible config from useXDSCollapsible.
   */
  collapsible?: XDSCollapsibleConfig;
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
// Chevron SVG
// =============================================================================

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true">
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * Section grouping for XDSPageNav items.
 *
 * Renders a labeled group of navigation items with optional collapsible behavior.
 * Uses `role="group"` with `aria-labelledby` for accessibility.
 *
 * @example
 * ```tsx
 * <XDSPageNavSection title="Main">
 *   <XDSPageNavItem label="Dashboard" icon={HomeIcon} isSelected />
 *   <XDSPageNavItem label="Projects" icon={FolderIcon} />
 * </XDSPageNavSection>
 *
 * <XDSPageNavSection title="Settings" collapsible={useXDSCollapsible()}>
 *   <XDSPageNavItem label="General" href="/settings/general" />
 *   <XDSPageNavItem label="Security" href="/settings/security" />
 * </XDSPageNavSection>
 * ```
 */
export function XDSPageNavSection({
  title,
  subtitle,
  children,
  collapsible,
  endContent,
  isHeaderHidden = false,
  'data-testid': testId,
}: XDSPageNavSectionProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const isCollapsible = !!collapsible;
  const isOpen = collapsible?.isOpen ?? true;

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
      {isCollapsible && (
        <span
          {...stylex.props(
            styles.chevron,
            isOpen ? styles.chevronOpen : styles.chevronClosed,
          )}>
          <ChevronDownIcon />
        </span>
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
      {isCollapsible ? (
        <button
          type="button"
          onClick={collapsible!.onToggle}
          aria-expanded={isOpen}
          style={isHeaderHidden ? visuallyHiddenStyle : undefined}
          {...stylex.props(styles.header, styles.headerCollapsible)}>
          {headerContent}
        </button>
      ) : (
        <div
          style={isHeaderHidden ? visuallyHiddenStyle : undefined}
          {...stylex.props(styles.header)}>
          {headerContent}
        </div>
      )}
      {isOpen && <div {...stylex.props(styles.items)}>{children}</div>}
    </div>
  );
}

XDSPageNavSection.displayName = 'XDSPageNavSection';
