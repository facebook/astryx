// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Item.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens, useClickableContainer
 * @output Exports Item component, ItemProps and ItemVariant types
 * @position Core layout primitive; consumed by index.ts, tested by Item.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Item/Item.doc.mjs
 * - /packages/core/src/Item/Item.test.tsx
 * - /packages/core/src/Item/index.ts
 * - /apps/storybook/stories/Item.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Item/ (showcase blocks)
 */

import {useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  radiusVars,
  spacingVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps, mergeRefs} from '../utils';
import {computeTargetAndRel} from '../Link/computeTargetAndRel';
import {useLinkComponent} from '../Link/useLinkComponent';
import {useClickableContainer} from '../hooks/useClickableContainer';
import {useDevWarning} from '../hooks/useDevWarning';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

export type ItemAlign = 'center' | 'start';
export type ItemDensity = 'compact' | 'balanced' | 'spacious';

/**
 * Surface treatment for Item. The surfaced variants share Card's background
 * and border tokens so themes style the two consistently, but keep Item's
 * element-scale radius (`--radius-element`) rather than Card's container
 * radius.
 *
 * - `transparent`: no background, no border — paints only on hover/selected
 * - `outline`: visible border, no background fill
 * - `muted`: muted background, no border — mirrors Card `muted`
 *
 * `transparent` is the default: a standing surface would be surprising in the
 * lists and menus Item is mostly used in.
 */
export type ItemVariant = 'transparent' | 'outline' | 'muted';

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
   * Surface treatment: `transparent` (no surface), `outline` (border only),
   * or `muted` (muted background, no border). The surfaced variants use
   * Card's tokens at Item's element radius.
   * @default 'transparent'
   */
  variant?: ItemVariant;

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
   * Ref to a nested control inside the item (e.g. a checkbox in
   * `startContent`) that already provides the item's keyboard access and
   * action. When set, the item becomes an enlarged click/tap target that
   * delegates surface clicks to that control via the `useClickableContainer`
   * pattern: it renders no invisible button/anchor, so the row adds no second
   * tab stop (WCAG 4.1.2 — one focusable control per option). Clicks on the
   * control itself, and on any other nested interactive element, are left to
   * that element. Mutually exclusive with `onClick`/`href` — when
   * `interactiveRef` is set those are ignored (the nested control is the sole
   * action).
   */
  interactiveRef?: React.RefObject<HTMLElement | null>;

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
   * Selected state. Always applies the selected visual styling. When `role`
   * permits it (option, tab, row, gridcell, columnheader, rowheader, treeitem)
   * the state is exposed as `aria-selected`; otherwise (e.g. a listitem or a
   * bare div, where `aria-selected` is invalid ARIA) it falls back to
   * `aria-current="true"` so assistive tech is still told which item is
   * selected. A consumer-provided `aria-current` always wins.
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
// Constants
// =============================================================================

/**
 * Roles on which WAI-ARIA permits the aria-selected attribute.
 * https://www.w3.org/TR/wai-aria-1.2/#aria-selected
 */
const ARIA_SELECTED_ROLES = new Set([
  'option',
  'tab',
  'row',
  'gridcell',
  'columnheader',
  'rowheader',
  'treeitem',
]);

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    // Values come from the density styles below; the outline variant subtracts
    // the border width from these same vars.
    paddingInline: 'var(--_item-padding-inline)',
    paddingBlock: 'var(--_item-padding-block)',
    position: 'relative',
    boxSizing: 'border-box',
    textAlign: 'start',
    borderRadius: radiusVars['--radius-element'],
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  // Interaction overlays are painted as background-image layers rather than
  // background-color, so they composite *over* the variant surface (which owns
  // background-color) instead of replacing it. Without this, `muted` would show
  // no hover at all — --color-background-muted and --color-overlay-hover are the
  // same value in light mode. Same technique as TreeListItem and
  // AvatarGroupOverflow.
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'background-image',
    transitionDuration: durationVars['--duration-fast-min'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
  },
  // The border is drawn *inside* the padding — its width is subtracted from
  // each side — so the total inset (border + padding) equals the density's
  // padding token rather than exceeding it. Longhands on purpose: StyleX gives
  // shorthands lower specificity, so these reliably outrank the density
  // shorthand regardless of rule order. Mirrors Card's withBorder.
  withBorder: {
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    paddingInlineStart: `calc(var(--_item-padding-inline) - ${borderVars['--border-width']})`,
    paddingInlineEnd: `calc(var(--_item-padding-inline) - ${borderVars['--border-width']})`,
    paddingBlockStart: `calc(var(--_item-padding-block) - ${borderVars['--border-width']})`,
    paddingBlockEnd: `calc(var(--_item-padding-block) - ${borderVars['--border-width']})`,
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
    backgroundImage: `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
  },
  selected: {
    backgroundImage: `linear-gradient(${colorVars['--color-accent-muted']}, ${colorVars['--color-accent-muted']})`,
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

// Each density publishes its padding as local custom properties (consumed by
// `root`) so the outline variant can subtract the border width from whichever
// padding is in play, without duplicating a density × variant matrix.
const densityStyles = stylex.create({
  compact: {
    '--_item-padding-inline': spacingVars['--spacing-2'],
    '--_item-padding-block': spacingVars['--spacing-1'],
  },
  balanced: {
    '--_item-padding-inline': spacingVars['--spacing-2'],
    '--_item-padding-block': spacingVars['--spacing-2'],
  },
  spacious: {
    '--_item-padding-inline': spacingVars['--spacing-3'],
    '--_item-padding-block': spacingVars['--spacing-3'],
  },
});

// Variant surfaces own background-color — the layer *below* the interaction
// overlays. Card's tokens, so themes style Item and Card consistently.
// `transparent` paints nothing, so it has no entry here.
const variantStyles = stylex.create({
  outline: {
    backgroundColor: 'transparent',
  },
  muted: {
    backgroundColor: colorVars['--color-background-muted'],
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
  variant = 'transparent',
  labelLines,
  descriptionLines,
  onClick,
  interactiveRef,
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

  // Delegation mode: the row is an enlarged click/tap target for a nested
  // control (e.g. a checkbox) that owns the keyboard access and action. The
  // control is the row's only tab stop; the row proxies surface clicks to it.
  const isDelegate = interactiveRef != null;
  const containerRef = useRef<HTMLElement | null>(null);
  // Only onClick is needed: onMouseUp handles middle-click href navigation,
  // which delegation mode never has (href is ignored here).
  const {onClick: delegatedOnClick} = useClickableContainer({
    containerRef,
    interactiveRef: interactiveRef ?? undefined,
    disabled: isDisabled,
  });

  useDevWarning(
    'Item',
    '`interactiveRef` is mutually exclusive with `onClick`/`href`. In ' +
      'delegation mode the row only forwards clicks to the referenced control, ' +
      'so `onClick`/`href` are ignored. Drop one of them.',
    isDelegate && (onClick != null || href != null),
  );

  const isInteractive = onClick != null || href != null || isDelegate;
  const {target, rel} = computeTargetAndRel(targetFromProps, relFromProps);
  // When a semantic role is provided (e.g. "menuitem"), a parent component
  // handles keyboard access. Skip the invisible button/anchor and put
  // onClick directly on the root element instead.
  const hasParentRole = role != null;
  // aria-selected is only valid on selectable roles (option, tab, treeitem,
  // grid cells). On the default div/li root the attribute is invalid ARIA
  // (axe: aria-allowed-attr), so selection stays visual-only there — callers
  // that need selection semantics pass a permitted role.
  const allowsAriaSelected = role != null && ARIA_SELECTED_ROLES.has(role);

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

      {hasParentRole || isDelegate ? (
        // Delegation mode (and parent-role mode) put the label in a plain span:
        // keyboard access lives on the nested control, so no invisible
        // button/anchor is rendered and the row adds no second tab stop.
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
      ref={
        (isDelegate ? mergeRefs(ref, containerRef) : ref) as React.Ref<never>
      }
      {...restProps}
      aria-selected={(allowsAriaSelected && isSelected) || undefined}
      // aria-selected is invalid on roles that don't permit it (listitem, a
      // bare div, etc.). For those, convey selection via aria-current — valid
      // on any element — so the state still reaches AT. Written after
      // {...restProps} so it must defer to a consumer-provided aria-current.
      aria-current={
        restProps['aria-current'] ??
        (isSelected && !allowsAriaSelected ? true : undefined)
      }
      aria-disabled={isDisabled || undefined}
      {...mergeProps(
        themeProps('item', {density, align, variant}),
        stylex.props(
          styles.root,
          densityStyles[density],
          align === 'start' && styles.alignStart,
          variant !== 'transparent' && variantStyles[variant],
          isInteractive && styles.interactive,
          isInteractive && styles.focusVisibleOutline,
          isHighlighted && styles.highlighted,
          isSelected && styles.selected,
          // After the density padding so the border-inset calc wins; it reads
          // the --_item-padding-* vars published above.
          variant === 'outline' && styles.withBorder,
          isDisabled && !hasParentRole && styles.disabled,
          xstyle,
        ),
        className,
        style,
      )}
      role={role}
      onClick={
        isDelegate
          ? delegatedOnClick
          : hasParentRole
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
