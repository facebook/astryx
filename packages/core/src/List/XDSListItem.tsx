/**
 * @file XDSListItem.tsx
 * @input Uses React forwardRef, ReactNode, StyleXStyles, theme tokens
 * @output Exports XDSListItem component, XDSListItemProps type
 * @position Core implementation; consumed by XDSList, index.ts, tested by XDSList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/List/README.md
 * - /packages/core/src/List/XDSList.test.tsx
 * - /packages/core/src/List/index.ts
 * - /apps/storybook/stories/List.stories.tsx
 */

'use client';

import {forwardRef, useContext, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  textSizeVars,
  lineHeightVars,
  transitionVars,
} from '../theme/tokens.stylex';
import {XDSListContext} from './XDSListContext';

// =============================================================================
// Types
// =============================================================================

export interface XDSListItemProps {
  /**
   * Primary text label for the item.
   */
  label: string;

  /**
   * Secondary description text below the label.
   */
  description?: string;

  /**
   * Content rendered before the item (icon, avatar, checkbox).
   * Uses start/end naming for RTL support.
   */
  startContent?: ReactNode;

  /**
   * Content rendered after the item (badge, action button, chevron).
   */
  endContent?: ReactNode;

  /**
   * Click handler for interactive items.
   * Automatically enables hover/press styles when provided.
   */
  onClick?: (e: React.MouseEvent) => void;

  /**
   * URL for link items. Renders an invisible anchor element.
   * Automatically enables hover/press styles when provided.
   */
  href?: string;

  /**
   * Link target (e.g., '_blank'). Only used with href.
   */
  target?: string;

  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the item is currently selected.
   * @default false
   */
  isSelected?: boolean;

  /**
   * StyleX styles to apply to the list item.
   */
  xstyle?: StyleXStyles;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // Default layout: <li> is the flex container
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'start',
  },
  // When list has markers (disc/decimal/circle), <li> must be list-item
  // so the browser renders the ::marker. Flex layout moves to inner wrapper.
  itemWithMarker: {
    display: 'list-item',
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'start',
  },
  // Inner flex wrapper used when markers are shown
  innerWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
  },
  withRadius: {
    borderRadius: radiusVars['--radius-content'],
  },
  noRadius: {
    borderRadius: 0,
  },
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'background-image',
    transitionDuration: transitionVars['--transition-fast'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
  },
  focusWithinOutline: {
    outline: {
      default: 'none',
      ':focus-within': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-within': '2px',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
  selected: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
  },
  invisibleButton: {
    all: 'unset',
    cursor: 'inherit',
    font: 'inherit',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    textAlign: 'start',
  },
  invisibleAnchor: {
    all: 'unset',
    cursor: 'inherit',
    font: 'inherit',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    textAlign: 'start',
    textDecoration: 'none',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    textAlign: 'start',
  },
  label: {
    color: colorVars['--color-text-primary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    color: colorVars['--color-text-secondary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  startContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  endContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    marginInlineStart: 'auto',
  },
});

const densityStyles = stylex.create({
  compact: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-normal'],
  },
});

const descriptionSizeStyles = stylex.create({
  compact: {
    fontSize: textSizeVars['--text-2xs'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  balanced: {
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  spacious: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-normal'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A list item component for use within XDSList.
 *
 * Renders structured content with label, description, start/end content areas.
 * When `onClick` is provided, uses the invisible button pattern for accessibility.
 * When `href` is provided, uses an invisible anchor pattern.
 *
 * @example
 * ```
 * <XDSListItem label="Settings" description="Manage your preferences" />
 * <XDSListItem label="Profile" onClick={() => navigate('/profile')} />
 * <XDSListItem label="Docs" href="/docs" target="_blank" />
 * ```
 */
export const XDSListItem = forwardRef<HTMLLIElement, XDSListItemProps>(
  (
    {
      label,
      description,
      startContent,
      endContent,
      onClick,
      href,
      target,
      isDisabled = false,
      isSelected = false,
      xstyle,
      'data-testid': testId,
    },
    ref,
  ) => {
    const ctx = useContext(XDSListContext);
    const density = ctx?.density ?? 'balanced';
    const hasDividers = ctx?.hasDividers ?? false;
    const hasMarkers = ctx?.hasMarkers ?? false;
    const isInteractive = onClick != null || href != null;

    const labelAndDescription = (
      <>
        <span {...stylex.props(styles.label)}>{label}</span>
        {description != null && (
          <span
            {...stylex.props(
              styles.description,
              descriptionSizeStyles[density],
            )}>
            {description}
          </span>
        )}
      </>
    );

    const handleContainerClick = (e: React.MouseEvent) => {
      if (isDisabled) return;
      const target = e.target as HTMLElement;
      // Don't fire onClick if click originated from an interactive child
      if (target.closest('button, a, input, select, textarea')) return;
      onClick?.(e);
    };

    const innerContent = (
      <>
        {startContent != null && (
          <span {...stylex.props(styles.startContent)}>{startContent}</span>
        )}

        {href != null ? (
          <a
            href={href}
            target={target}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? -1 : undefined}
            {...stylex.props(styles.invisibleAnchor)}>
            {labelAndDescription}
          </a>
        ) : onClick != null ? (
          <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            {...stylex.props(styles.invisibleButton)}>
            {labelAndDescription}
          </button>
        ) : (
          <span {...stylex.props(styles.content)}>{labelAndDescription}</span>
        )}

        {endContent != null && (
          <span {...stylex.props(styles.endContent)}>{endContent}</span>
        )}
      </>
    );

    return (
      <li
        ref={ref}
        data-testid={testId}
        aria-selected={isSelected || undefined}
        aria-disabled={isDisabled || undefined}
        {...stylex.props(
          hasMarkers ? styles.itemWithMarker : styles.item,
          densityStyles[density],
          hasDividers ? styles.noRadius : styles.withRadius,
          isInteractive && styles.interactive,
          isInteractive && styles.focusWithinOutline,
          isDisabled && styles.disabled,
          isSelected && styles.selected,
          xstyle,
        )}
        onClick={isInteractive ? handleContainerClick : undefined}>
        {hasMarkers ? (
          <div {...stylex.props(styles.innerWrapper)}>{innerContent}</div>
        ) : (
          innerContent
        )}
      </li>
    );
  },
);

XDSListItem.displayName = 'XDSListItem';
