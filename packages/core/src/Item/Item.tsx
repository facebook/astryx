// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Item.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens
 * @output Exports Item component, ItemProps type
 * @position Core layout primitive; consumed by index.ts, tested by Item.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Item/Item.doc.mjs
 * - /packages/core/src/Item/Item.test.tsx
 * - /packages/core/src/Item/index.ts
 * - /apps/storybook/stories/Item.stories.tsx
 * - /packages/cli/templates/blocks/components/Item/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {computeTargetAndRel} from '../Link/computeTargetAndRel';
import {useLinkComponent} from '../Link/useLinkComponent';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

export type ItemAlign = 'center' | 'start';
export type ItemDensity = 'compact' | 'balanced' | 'spacious';

export interface ItemProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLElement>;

  /**
   * HTML element to render as the root.
   * @default 'div'
   */
  as?: 'div' | 'li' | 'span';

  /**
   * Marker rendered before startContent as a direct flex child.
   * Use for list bullets/counters that need custom baseline alignment.
   */
  marker?: ReactNode;

  /**
   * Content rendered before the label/description area.
   * Use for leading icons, avatars, or checkboxes.
   */
  startContent?: ReactNode;

  /**
   * Primary text identifying this item. Required.
   * Accepts string (auto-styled) or ReactNode (for rich content).
   */
  label: ReactNode;

  /**
   * Secondary text — subtitle, description, or supporting info.
   */
  description?: ReactNode;

  /**
   * Content rendered after the label/description area.
   * Use for badges, metadata, timestamps, or action buttons.
   */
  endContent?: ReactNode;

  /**
   * Vertical alignment of the start/end content slots.
   * @default 'center'
   */
  align?: ItemAlign;

  /**
   * Density: "compact" (4px block padding), "balanced" (8px block padding),
   * or "spacious" (12px block and inline padding).
   * @default 'balanced'
   */
  density?: ItemDensity;

  /**
   * Max lines before label truncates. When set, overflow is hidden
   * and text-overflow: ellipsis is applied.
   */
  labelLines?: number;

  /**
   * Max lines before description truncates. When set, overflow is hidden
   * and text-overflow: ellipsis is applied.
   */
  descriptionLines?: number;

  /**
   * Click handler. Makes the item clickable with button semantics.
   */
  onClick?: (event: React.MouseEvent) => void;

  /**
   * Link URL. Makes the item a link via an invisible anchor element.
   */
  href?: string;

  /**
   * Link target (e.g., '_blank'). Only used with href.
   */
  target?: '_blank' | '_self';

  /**
   * Link relationship. Automatically includes noopener noreferrer when
   * target is "_blank".
   */
  rel?: string;

  /**
   * Highlighted state (hover/keyboard focus appearance).
   * @default false
   */
  isHighlighted?: boolean;

  /**
   * Selected state.
   * @default false
   */
  isSelected?: boolean;

  /**
   * Disabled state.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'start',
    borderRadius: radiusVars['--radius-element'],
  },
  alignStart: {
    alignItems: 'flex-start',
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
  focusVisibleOutline: {
    outline: {
      default: 'none',
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '2px',
    },
  },
  highlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  selected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  disabled: {
    cursor: 'not-allowed',
    pointerEvents: 'none' as const,
  },
  disabledContent: {
    opacity: 0.5,
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
    outline: 'none',
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
    outline: 'none',
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
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  labelSingleTruncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  labelMultiTruncate: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
  },
  description: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  descriptionSingleTruncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  descriptionMultiTruncate: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
  },
  startContent: {
    flex: '0 0 auto',
    display: 'flex',
  },
  endContent: {
    flex: '0 0 auto',
    display: 'flex',
    marginInlineStart: 'auto',
  },
});

const dynamicStyles = stylex.create({
  lineClamp: (lines: number) => ({
    WebkitLineClamp: lines,
  }),
});

const densityStyles = stylex.create({
  compact: {
    paddingBlock: spacingVars['--spacing-1'],
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A universal item primitive that unifies the "start content + label +
 * description + end content" layout pattern. Use as a building block for list items,
 * menu items, contact rows, notification items, and more.
 *
 * @example
 * ```
 * <Item
 *   startContent={<Avatar src={user.avatar} size="sm" />}
 *   label={user.name}
 *   description={user.role}
 *   endContent={<Badge>Admin</Badge>}
 *   onClick={() => navigate(`/users/${user.id}`)}
 * />
 * ```
 */
export function Item({
  as: Component = 'div',
  marker,
  startContent,
  label,
  description,
  endContent,
  align = 'center',
  density = 'balanced',
  labelLines,
  descriptionLines,
  onClick,
  href,
  target: targetFromProps,
  rel: relFromProps,
  isHighlighted = false,
  isSelected = false,
  isDisabled = false,
  xstyle,
  className,
  style,
  ref,
  role,
  ...restProps
}: ItemProps) {
  const LinkComponent = useLinkComponent();
  const isInteractive = onClick != null || href != null;
  const {target, rel} = computeTargetAndRel(targetFromProps, relFromProps);
  // When a semantic role is provided (e.g. "menuitem"), a parent component
  // handles keyboard access. Skip the invisible button/anchor and put
  // onClick directly on the root element instead.
  const hasParentRole = role != null;

  const isStringLabel = typeof label === 'string';
  const isStringDescription = typeof description === 'string';

  const labelTruncateStyle =
    labelLines != null
      ? labelLines === 1
        ? styles.labelSingleTruncate
        : styles.labelMultiTruncate
      : isStringLabel
        ? styles.labelSingleTruncate
        : null;

  const descriptionTruncateStyle =
    descriptionLines != null
      ? descriptionLines === 1
        ? styles.descriptionSingleTruncate
        : styles.descriptionMultiTruncate
      : isStringDescription
        ? styles.descriptionSingleTruncate
        : null;

  const labelAndDescription = (
    <>
      <span
        {...stylex.props(
          styles.label,
          labelTruncateStyle,
          labelLines != null &&
            labelLines > 1 &&
            dynamicStyles.lineClamp(labelLines),
        )}>
        {label}
      </span>
      {description != null && (
        <span
          {...stylex.props(
            styles.description,
            descriptionTruncateStyle,
            descriptionLines != null &&
              descriptionLines > 1 &&
              dynamicStyles.lineClamp(descriptionLines),
          )}>
          {description}
        </span>
      )}
    </>
  );

  const handleContainerClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      return;
    }
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea')) {
      return;
    }
    onClick?.(e);
  };

  const innerContent = (
    <>
      {marker}
      {startContent != null && (
        <span {...stylex.props(styles.startContent)}>{startContent}</span>
      )}

      {hasParentRole ? (
        <span
          {...stylex.props(
            styles.content,
            isDisabled && styles.disabledContent,
          )}>
          {labelAndDescription}
        </span>
      ) : href != null ? (
        <LinkComponent
          href={href}
          target={target}
          rel={rel}
          aria-disabled={isDisabled || undefined}
          tabIndex={isDisabled ? -1 : undefined}
          {...stylex.props(
            styles.invisibleAnchor,
            isDisabled && styles.disabledContent,
          )}>
          {labelAndDescription}
        </LinkComponent>
      ) : onClick != null ? (
        <button
          type="button"
          onClick={onClick}
          disabled={isDisabled}
          {...stylex.props(
            styles.invisibleButton,
            isDisabled && styles.disabledContent,
          )}>
          {labelAndDescription}
        </button>
      ) : (
        <span
          {...stylex.props(
            styles.content,
            isDisabled && styles.disabledContent,
          )}>
          {labelAndDescription}
        </span>
      )}

      {endContent != null && (
        <span
          {...stylex.props(
            styles.endContent,
            isDisabled && styles.disabledContent,
          )}>
          {endContent}
        </span>
      )}
    </>
  );

  return (
    <Component
      ref={ref as React.Ref<never>}
      aria-selected={isSelected || undefined}
      aria-disabled={isDisabled || undefined}
      {...restProps}
      {...mergeProps(
        themeProps('item', {density, align}),
        stylex.props(
          styles.root,
          densityStyles[density],
          align === 'start' && styles.alignStart,
          isInteractive && styles.interactive,
          isInteractive && styles.focusVisibleOutline,
          isHighlighted && styles.highlighted,
          isSelected && styles.selected,
          isDisabled && !hasParentRole && styles.disabled,
          xstyle,
        ),
        className,
        style,
      )}
      role={role}
      onClick={
        hasParentRole
          ? onClick
          : isInteractive
            ? handleContainerClick
            : undefined
      }>
      {innerContent}
    </Component>
  );
}

Item.displayName = 'Item';
