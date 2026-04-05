'use client';

/**
 * @file XDSListItem.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens
 * @output Exports XDSListItem component, XDSListItemProps type
 * @position Core implementation; consumed by XDSList, index.ts, tested by XDSList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/List/List.doc.mjs
 * - /packages/core/src/List/XDSList.test.tsx
 * - /packages/core/src/List/index.ts
 * - /apps/storybook/stories/List.stories.tsx
 */

import {useContext, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  durationVars,
  easeVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {XDSListContext} from './XDSListContext';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface XDSListItemProps extends XDSBaseProps<HTMLLIElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLIElement>;
  /**
   * Primary text label for the item.
   */
  label: string;

  /**
   * Secondary description below the label.
   *
   * Accepts a plain string (single-line truncation applied automatically)
   * or a ReactNode for rich/multi-line content (no wrapping constraints
   * applied — child components control their own text behavior).
   */
  description?: ReactNode;

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
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // <li> is always a flex container — markers are rendered as custom
  // components rather than native list-style (avoids cross-browser issues
  // with display:list-item + list-style-position:inside on mobile Safari).
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'start',
  },
  // When markers are active, bump the CSS counter
  withCounter: {
    counterIncrement: 'xds-list',
  },
  withRadius: {
    borderRadius: radiusVars['--radius-element'],
  },
  noRadius: {
    borderRadius: 0,
  },
  withDivider: {
    borderBlockEnd: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    ':last-child': {
      borderBlockEnd: 'none',
    },
  },
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast-min'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
      ':active': colorVars['--color-overlay-pressed'],
    },
  },
  focusWithinOutline: {
    outline: {
      default: 'none',
      ':focus-within': `2px solid ${colorVars['--color-accent']}`,
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
    backgroundColor: colorVars['--color-accent-muted'],
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
    minWidth: 0,
  },
  descriptionString: {
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
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
});

// =============================================================================
// Marker styles — custom-rendered markers instead of native list-style-type.
// Uses CSS counters for numbers (same pattern as WWW XDS).
// =============================================================================

const MARKER_DOT_SIZE = 6;

const markerStyles = stylex.create({
  container: {
    alignSelf: 'baseline',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: spacingVars['--spacing-3'],
    // Vertically center the dot/circle with the first line of text:
    // shift down by (lineHeight - dotSize) / 2
    marginTop: `calc((1em * ${typeScaleVars['--text-body-leading']} - ${MARKER_DOT_SIZE}px) / 2)`,
  },
  dot: {
    width: MARKER_DOT_SIZE,
    height: MARKER_DOT_SIZE,
    borderRadius: '50%',
    backgroundColor: colorVars['--color-text-primary'],
  },
  circle: {
    width: MARKER_DOT_SIZE,
    height: MARKER_DOT_SIZE,
    borderRadius: '50%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
  },
  number: {
    alignSelf: 'baseline',
    flexShrink: 0,
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    width: spacingVars['--spacing-3'],
    '::before': {
      content: 'counter(xds-list) "."',
    },
  },
});

const descriptionSizeStyles = stylex.create({
  compact: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  balanced: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  spacious: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
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
export function XDSListItem({
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
  className,
  style,
  'data-testid': testId,
  ref,
  ...restProps
}: XDSListItemProps) {
  const ctx = useContext(XDSListContext);
  const density = ctx?.density ?? 'balanced';
  const hasDividers = ctx?.hasDividers ?? false;
  const listStyle = ctx?.listStyle ?? 'none';
  const hasMarkers = listStyle !== 'none';
  const isInteractive = onClick != null || href != null;

  const isStringDescription = typeof description === 'string';

  const labelAndDescription = (
    <>
      <span {...stylex.props(styles.label)}>{label}</span>
      {description != null && (
        <span
          {...stylex.props(
            styles.description,
            isStringDescription && styles.descriptionString,
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

  const marker =
    listStyle === 'disc' ? (
      <span {...stylex.props(markerStyles.container)}>
        <span {...stylex.props(markerStyles.dot)} />
      </span>
    ) : listStyle === 'circle' ? (
      <span {...stylex.props(markerStyles.container)}>
        <span {...stylex.props(markerStyles.circle)} />
      </span>
    ) : listStyle === 'decimal' ? (
      <span {...stylex.props(markerStyles.number)} />
    ) : null;

  return (
    <li
      ref={ref}
      data-testid={testId}
      aria-selected={isSelected || undefined}
      aria-disabled={isDisabled || undefined}
      {...restProps}
      {...mergeProps(
        xdsClassName('list-item'),
        stylex.props(
          styles.item,
          hasMarkers && styles.withCounter,
          densityStyles[density],
          hasDividers ? styles.noRadius : styles.withRadius,
          hasDividers && styles.withDivider,
          isInteractive && styles.interactive,
          isInteractive && styles.focusWithinOutline,
          isDisabled && styles.disabled,
          isSelected && styles.selected,
          xstyle,
        ),
        className,
        style,
      )}
      onClick={isInteractive ? handleContainerClick : undefined}>
      {marker}
      {innerContent}
    </li>
  );
}

XDSListItem.displayName = 'XDSListItem';
