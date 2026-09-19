// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Item.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens, useClickableContainer
 * @output Exports Item component, ItemProps type
 * @position Core layout primitive; consumed by index.ts, tested by Item.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Item/Item.doc.mjs
 * - /packages/core/src/Item/Item.test.tsx
 * - /packages/core/src/Item/index.ts
 * - /apps/storybook/stories/Item.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Item/ (showcase blocks)
 */

import {useId, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  durationVars,
  easeVars,
  fontWeightVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {isRenderable, mergeProps} from '../utils';
import {ItemDescriptionContext} from './ItemDescriptionContext';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {computeTargetAndRel} from '../Link/computeTargetAndRel';
import {useLinkComponent} from '../Link/useLinkComponent';
import {useClickableContainer} from '../hooks/useClickableContainer';
import {useDevWarning} from '../hooks/useDevWarning';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {useMediaQuery} from '../hooks/useMediaQuery';
import {useSwipeAction, type SwipeActionDirection} from './useSwipeAction';

// =============================================================================
// Types
// =============================================================================

export type ItemAlign = 'center' | 'start';
export type ItemDensity = 'compact' | 'balanced' | 'spacious';

/** The tone of a revealed swipe panel: a state colour, never decoration. */
export type ItemSwipeActionTone = 'accent' | 'success' | 'warning' | 'error';

export interface ItemSwipeAction {
  /** The panel's verb, e.g. "Archive": what releasing here will do. */
  label: ReactNode;
  /** The verb's glyph, drawn beside the label. */
  icon?: ReactNode;
  /** Fired once, after the row has slid out. */
  onAction: () => void;
  /** @default 'accent' */
  tone?: ItemSwipeActionTone;
}

export interface ItemSwipeActions {
  /** Revealed by a drag toward the inline end (rightward in LTR). */
  leading: ItemSwipeAction;
  /** Revealed by a drag toward the inline start; omitted, that drag is not this row's gesture. */
  trailing?: ItemSwipeAction;
}

const swipeToneStyles = stylex.create({
  accent: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  success: {
    backgroundColor: colorVars['--color-success'],
    color: colorVars['--color-on-success'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
    color: colorVars['--color-on-warning'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
});

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
   * How the label and description sit together. `stacked` puts the description
   * on its own line below the label; `inline` keeps both on one line, with the
   * description ellipsizing first, so the row fits a fixed-height host.
   *
   * @default 'stacked'
   */
  layout?: 'stacked' | 'inline';

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
   * Unread emphasis, for a row that stands for something the person has not
   * seen yet (an inbox row). The label takes the semibold weight and the
   * description the primary text colour; the row's ground is left to the
   * theme through the `unread` state of the `item` target, so an app paints
   * its own unread tint without a call-site colour.
   * @default false
   */
  isUnread?: boolean;

  /**
   * Swipe actions for touch: drag the row sideways and a labelled panel is
   * revealed behind it; release past the commit point (a third of the row,
   * within 72–160 px) or fling to fire it, and the row slides out. Touch
   * only, and each action must exist somewhere a pointer and a keyboard can
   * reach it: the gesture is an accelerator for a verb the row already has,
   * never the only way to reach one. With this set the row is wrapped in a
   * plain container that clips the slide; `ref`, `role` and every other
   * attribute still land on the row itself.
   */
  swipeActions?: ItemSwipeActions;

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
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast-min'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  highlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  selected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  disabled: {
    cursor: 'default',
    pointerEvents: 'none' as const,
  },
  disabledContent: {
    opacity: 0.5,
  },
  invisibleButton: {
    all: 'unset',
    cursor: {
      default: 'inherit',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
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
    cursor: {
      default: 'inherit',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
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
  // `layout="inline"`: label and description share one line, so the row fits a
  // fixed-height host such as a Selector trigger inside an InputGroup.
  inlineContent: {
    flexDirection: 'row',
    // Centered, not baseline-aligned: two different font sizes on a shared
    // baseline make a line box taller than either line, which would push a
    // fixed-height host (a Selector trigger) a pixel off its size token.
    alignItems: 'center',
    columnGap: spacingVars['--spacing-1'],
  },
  inlineLabel: {
    flexShrink: 0,
  },
  // The description yields width first, so the label — the part that identifies
  // the item — is the last thing to ellipsize.
  inlineDescription: {
    flexShrink: 1,
    minWidth: 0,
  },
  // Unread: the weight says it; the ground is the theme's (`item` target,
  // `unread` state), so no row colour is decided here.
  unreadLabel: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  unreadDescription: {
    color: `var(--_item-description-color, ${colorVars['--color-text-primary']})`,
  },
  // Swipe actions. The container clips the slide and owns the gesture; the
  // row translates inside it; the panel behind is exactly as wide as the
  // row has moved, so nothing needs an opaque cover.
  swipeContainer: {
    position: 'relative',
    // `pan-y` lets the browser keep scrolling the list vertically while the
    // row owns horizontal movement, without fighting the scroller from a
    // passive listener.
    touchAction: 'pan-y',
  },
  swipeContainerActive: {
    overflow: 'hidden',
  },
  swipePanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    paddingInline: spacingVars['--spacing-3'],
    overflow: 'hidden',
    pointerEvents: 'none',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    whiteSpace: 'nowrap',
    // Below the commit point the panel is provisional; past it, it reads as
    // "let go now".
    opacity: 0.7,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  swipePanelArmed: {
    opacity: 1,
  },
  swipePanelLeading: {
    insetInlineStart: 0,
    justifyContent: 'flex-start',
  },
  swipePanelTrailing: {
    insetInlineEnd: 0,
    justifyContent: 'flex-end',
  },
  swipePanelContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  label: {
    // Falls back to the primary text token; a parent (e.g. a destructive menu
    // item) can recolor the label by setting --_item-label-color.
    color: `var(--_item-label-color, ${colorVars['--color-text-primary']})`,
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
    // Companion to --_item-label-color for the secondary line.
    color: `var(--_item-description-color, ${colorVars['--color-text-secondary']})`,
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
  layout = 'stacked',
  onClick,
  interactiveRef,
  href,
  target: targetFromProps,
  rel: relFromProps,
  isHighlighted = false,
  isSelected = false,
  isUnread = false,
  isDisabled = false,
  swipeActions,
  xstyle,
  className,
  style,
  ref,
  role,
  ...restProps
}: ItemProps) {
  const pressable = usePressFeedback();
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

  // The description element's id, published through ItemDescriptionContext so a
  // control Item renders in a slot can point at it with `aria-describedby`.
  // `isRenderable` rather than `!= null` so the common empty values — `null`,
  // `undefined`, `false`, `''` — publish no id and leave a consumer with no
  // dangling reference. It is a shallow check: content that renders nothing
  // only once React runs it, such as an empty fragment, still publishes an id.
  const descriptionID = useId();
  const hasRenderableDescription = isRenderable(description);

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

  // Inline rows are one line by definition, so the description always
  // ellipsizes there — a ReactNode description cannot wrap the row open.
  const isInline = layout === 'inline' && description != null;

  const descriptionTruncateStyle =
    descriptionLines != null
      ? descriptionLines === 1
        ? styles.descriptionSingleTruncate
        : styles.descriptionMultiTruncate
      : isStringDescription || isInline
        ? styles.descriptionSingleTruncate
        : null;

  const labelAndDescription = (
    <>
      <span
        {...stylex.props(
          styles.label,
          isUnread && styles.unreadLabel,
          isInline && styles.inlineLabel,
          labelTruncateStyle,
          labelLines != null &&
            labelLines > 1 &&
            dynamicStyles.lineClamp(labelLines),
        )}>
        {label}
      </span>
      {description != null && (
        <span
          id={hasRenderableDescription ? descriptionID : undefined}
          {...stylex.props(
            styles.description,
            isUnread && styles.unreadDescription,
            isInline && styles.inlineDescription,
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
            isInline && styles.inlineContent,
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
            isInline && styles.inlineContent,
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
            isInline && styles.inlineContent,
            isDisabled && styles.disabledContent,
          )}>
          {labelAndDescription}
        </button>
      ) : (
        <span
          {...stylex.props(
            styles.content,
            isInline && styles.inlineContent,
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

  const mergedRef = useMergedRefs(ref, containerRef);

  // Swipe actions: the gesture lives on a wrapper that clips the slide, the
  // row itself translates, and the panel behind grows to the revealed width.
  const swipeContainerRef = useRef<HTMLElement | null>(null);
  const swipeRowRef = useRef<HTMLElement | null>(null);
  const swipePanelRef = useRef<HTMLElement | null>(null);
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hasSwipe = swipeActions != null && !isDisabled;
  const swipe = useSwipeAction({
    isEnabled: hasSwipe,
    onCommit: () => swipeActions?.leading.onAction(),
    onCommitTrailing:
      swipeActions?.trailing != null
        ? () => swipeActions.trailing?.onAction()
        : undefined,
    isReducedMotion,
    containerRef: swipeContainerRef,
    rowRef: swipeRowRef,
    onReveal: width => {
      if (swipePanelRef.current != null) {
        swipePanelRef.current.style.width = `${width}px`;
      }
    },
  });
  const swipeRef = useMergedRefs(
    (isDelegate ? mergedRef : ref) as React.Ref<HTMLElement>,
    swipeActions != null ? swipeRowRef : undefined,
  );

  // A row with a parent-supplied role and an `href` is the link itself. The
  // role owner (a menu) handles keyboard access, so no invisible inner anchor
  // is rendered; the root has to be the anchor for the address to reach the
  // browser at all (modifier and middle clicks open it in a new tab, the
  // status bar shows it, "copy link" works), through the LinkProvider's
  // component so client-side routing applies.
  const isLinkRoot = hasParentRole && !isDelegate && href != null;
  const Root: React.ElementType = isLinkRoot ? LinkComponent : Component;

  const row = (
    <Root
      ref={swipeRef as React.Ref<never>}
      // A disabled link row keeps its element but drops the address, the way
      // Link does, so the browser cannot follow it.
      {...(isLinkRoot
        ? {href: isDisabled ? undefined : href, target, rel}
        : undefined)}
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
      {...(isInteractive ? pressable : undefined)}
      {...mergeProps(
        themeProps('item', {
          density,
          align,
          unread: isUnread ? 'unread' : null,
        }),
        focusOutlineProps.focusWithin(
          styles.root,
          densityStyles[density],
          align === 'start' && styles.alignStart,
          isInteractive && styles.interactive,
          isInteractive && interactionOverlayStyles.backgroundColor,
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
        isDelegate
          ? delegatedOnClick
          : hasParentRole
            ? onClick
            : isInteractive
              ? handleContainerClick
              : undefined
      }>
      <ItemDescriptionContext
        value={hasRenderableDescription ? descriptionID : null}>
        {innerContent}
      </ItemDescriptionContext>
    </Root>
  );

  if (swipeActions == null) {
    return row;
  }

  const revealed: ItemSwipeAction | undefined =
    swipe.state.direction === 'trailing'
      ? swipeActions.trailing
      : swipeActions.leading;
  const isSwiping = swipe.state.phase !== 'idle';
  const direction: SwipeActionDirection = swipe.state.direction;

  return (
    <div
      ref={swipeContainerRef as React.Ref<HTMLDivElement>}
      {...stylex.props(
        styles.swipeContainer,
        isSwiping && styles.swipeContainerActive,
      )}
      {...(hasSwipe ? swipe.handlers : undefined)}>
      {/* Always in the tree while swipeable, at zero width until a drag reveals
          it: the gesture writes the width per frame, and a panel mounted
          mid-drag would paint its full label for a frame first. */}
      {hasSwipe && revealed != null ? (
        <div
          ref={swipePanelRef as React.Ref<HTMLDivElement>}
          aria-hidden="true"
          {...stylex.props(
            styles.swipePanel,
            direction === 'trailing'
              ? styles.swipePanelTrailing
              : styles.swipePanelLeading,
            swipeToneStyles[revealed.tone ?? 'accent'],
            swipe.state.isArmed && styles.swipePanelArmed,
          )}>
          <span {...stylex.props(styles.swipePanelContent)}>
            {revealed.icon}
            {revealed.label}
          </span>
        </div>
      ) : null}
      {row}
    </div>
  );
}

Item.displayName = 'Item';
