// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CommentPin.tsx
 * @input Ordered participants (grouped pins show at most three circles),
 *   total and unread represented thread counts, controlled
 *   selected/dimmed/resolved/disabled state, and button DOM props
 * @output Exports the avatar-first CommentPin button and its public types
 * @position Lab collaboration primitive for annotation anchors over content or
 *   in content margins; callers own grouping, coordinates, and opened content
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/CommentPin/CommentPin.doc.mjs
 * - /packages/lab/src/CommentPin/CommentPin.spec.md
 * - /packages/lab/src/CommentPin/CommentPin.test.tsx
 * - /packages/lab/src/CommentPin/index.ts
 * - /apps/storybook/stories/CommentPin.stories.tsx
 * - /packages/lab/blocks/CommentPinShowcase.tsx
 */

import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {
  useDevWarning,
  useMergedRefs,
  usePressFeedback,
} from '@astryxdesign/core/hooks';
import {
  borderVars,
  colorVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  sizeVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {useTooltip} from '@astryxdesign/core/Tooltip';
import {
  focusOutlineProps,
  interactionOverlayStyles,
  mergeProps,
  themeProps,
} from '@astryxdesign/core/utils';

/** Identity data for one representative shown inside a CommentPin. */
export interface CommentPinParticipant {
  /** Stable identity used to remove duplicate representatives. */
  id: string;
  /** Display name used by Avatar for image fallback initials. */
  name: string;
  /** Optional image source passed to Avatar. */
  avatarSrc?: string;
}

export interface CommentPinProps extends Omit<
  BaseProps<HTMLButtonElement>,
  'children'
> {
  /** Ref forwarded to the marker button. */
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Accessible action name and visual hover/focus tooltip.
   * Include grouped, unread, or resolved context when it changes the action's
   * meaning.
   */
  label: string;
  /**
   * Ordered participants, lead first. A single marker shows the first. A
   * grouped marker shows distinct IDs as an AvatarGroup of at most three
   * circles: every participant when three or fewer are distinct, otherwise the
   * first two plus a `+N` overflow circle. Pass every distinct participant so
   * the overflow count is accurate.
   */
  participants: readonly [CommentPinParticipant, ...CommentPinParticipant[]];
  /**
   * Total number of threads represented by this marker. Values above one use
   * the grouped presentation and show the exact total.
   * @default 1
   */
  threadCount?: number;
  /**
   * Number of represented threads with unread activity. When above zero, an
   * accent badge shows this number in place of the thread total, on single
   * and grouped pins alike. Values above `threadCount` are capped.
   * @default 0
   */
  unreadCount?: number;
  /** Whether this pin is the currently selected annotation target. */
  isSelected?: boolean;
  /**
   * Whether another pin is selected in the host. Dims this pin without
   * disabling it, so it remains available to switch selection.
   */
  isDimmed?: boolean;
  /** Whether every thread represented by this pin is resolved. */
  isResolved?: boolean;
  /** Whether activation is unavailable. */
  isDisabled?: boolean;
}

const styles = stylex.create({
  root: {
    appearance: 'none',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    verticalAlign: 'middle',
    transformOrigin: {
      default: 'left bottom',
      ':is([dir="rtl"] *)': 'right bottom',
    },
    minWidth: sizeVars['--size-element-sm'],
    height: sizeVars['--size-element-sm'],
    margin: 0,
    padding: spacingVars['--spacing-0-5'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: 'transparent',
    // Speech-bubble silhouette: three fully rounded logical corners and a
    // fixed 4px logical bottom-start corner. The literal is intentional:
    // themes may enlarge `--radius-inner`, which would soften the anchor cue.
    // Logical longhands mirror the corner in RTL by construction.
    borderStartStartRadius: radiusVars['--radius-full'],
    borderStartEndRadius: radiusVars['--radius-full'],
    borderEndEndRadius: radiusVars['--radius-full'],
    borderEndStartRadius: '4px',
    backgroundColor: colorVars['--color-background-popover'],
    backgroundImage: 'none',
    boxShadow: shadowVars['--shadow-med'],
    color: colorVars['--color-text-secondary'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  withCount: {
    justifyContent: 'flex-start',
    gap: spacingVars['--spacing-1'],
    paddingInlineStart: spacingVars['--spacing-0-5'],
    paddingInlineEnd: spacingVars['--spacing-2'],
  },
  selected: {
    // Native buttons keep ButtonFace/ButtonText under forced colors unless the
    // selected state opts out of UA remapping; author both sides together.
    forcedColorAdjust: 'none',
    opacity: 1,
    // The border stays transparent so the selection reads as exactly one 2px
    // accent outline: the box-shadow ring below, drawn outside the pin.
    borderColor: {
      default: 'transparent',
      '@media (forced-colors: active)': 'Highlight',
    },
    backgroundColor: {
      default: colorVars['--color-background-popover'],
      '@media (forced-colors: active)': 'Highlight',
    },
    // A solid 2px accent outline outside the pin, layered with its resting
    // medium elevation. A box-shadow ring shifts no layout, follows the
    // speech-bubble corners, and leaves the shared focus outline (offset
    // farther out) as a separate cue.
    boxShadow: {
      default: `0 0 0 2px ${colorVars['--color-accent']}, ${shadowVars['--shadow-med']}`,
      '@media (forced-colors: active)': 'none',
    },
    color: {
      default: colorVars['--color-text-secondary'],
      '@media (forced-colors: active)': 'HighlightText',
    },
  },
  resolved: {
    // This state authors Canvas colors in forced-colors mode, so opt the native
    // button out of ButtonFace/ButtonText remapping and author both sides.
    forcedColorAdjust: 'none',
    borderColor: {
      default: 'transparent',
      '@media (forced-colors: active)': 'CanvasText',
    },
    backgroundColor: {
      default: colorVars['--color-background-muted'],
      '@media (forced-colors: active)': 'Canvas',
    },
    boxShadow: 'none',
    color: {
      default: colorVars['--color-text-secondary'],
      '@media (forced-colors: active)': 'CanvasText',
    },
    opacity: {
      default: 0.72,
      '@media (forced-colors: active)': 1,
    },
  },
  dimmed: {
    opacity: {
      default: 0.4,
      '@media (forced-colors: active)': 1,
    },
  },
  disabled: {
    cursor: 'default',
    opacity: {
      default: 0.45,
      '@media (forced-colors: active)': 1,
    },
    // Opacity does not survive forced colors, and an aria-disabled button gets
    // no system disabled paint; GrayText is the platform's disabled affordance.
    borderColor: {
      default: null,
      '@media (forced-colors: active)': 'GrayText',
    },
    color: {
      default: null,
      '@media (forced-colors: active)': 'GrayText',
    },
  },
  avatarRail: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  // AvatarGroupOverflow pads its count for multi-digit pills; inside this
  // compact pin a short `+N` must stay a circle the size of its sibling
  // Avatars, while longer counts still grow from the shared minimum width.
  overflowCircle: {
    paddingInline: 0,
  },
  count: {
    display: 'inline-block',
    minWidth: spacingVars['--spacing-3'],
    color: 'inherit',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
  },
  unreadBadge: {
    // Native buttons remap colors under forced colors; author the full pair.
    forcedColorAdjust: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    minWidth: spacingVars['--spacing-5'],
    height: spacingVars['--spacing-5'],
    paddingInline: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: {
      default: colorVars['--color-accent'],
      '@media (forced-colors: active)': 'Highlight',
    },
    color: {
      default: colorVars['--color-on-accent'],
      '@media (forced-colors: active)': 'HighlightText',
    },
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
});

function takeDistinctParticipants(
  participants: readonly CommentPinParticipant[],
  limit: number,
): CommentPinParticipant[] {
  const result: CommentPinParticipant[] = [];
  const seen = new Set<string>();

  for (const participant of participants) {
    if (seen.has(participant.id)) {
      continue;
    }
    seen.add(participant.id);
    result.push(participant);
    if (result.length === limit) {
      break;
    }
  }

  return result;
}

function isValidThreadCount(threadCount: number): boolean {
  return (
    Number.isFinite(threadCount) &&
    Number.isInteger(threadCount) &&
    threadCount >= 1
  );
}

function isValidUnreadCount(unreadCount: number): boolean {
  return (
    Number.isFinite(unreadCount) &&
    Number.isInteger(unreadCount) &&
    unreadCount >= 0
  );
}

/** Grouped pins never show more than this many circles, overflow included. */
const MAX_GROUP_CIRCLES = 3;

/**
 * Avatar-first annotation anchor for one thread or a caller-defined group.
 *
 * The caller owns grouping, representative selection, coordinates, collision
 * handling, and the content opened by activation. Absolute placement maps the
 * host anchor to the pin's logical bottom-start corner. The pin only owns its
 * compact button surface and controlled visual states.
 *
 * @example
 * ```
 * <CommentPin
 *   label="Open annotation from Ada"
 *   participants={[{id: 'ada', name: 'Ada Lovelace'}]}
 *   onClick={() => openThread('thread-1')}
 * />
 * ```
 *
 * @example
 * ```
 * <CommentPin
 *   label="Open 6 grouped annotations from Ada, Lin, and 3 others, 2 unread"
 *   participants={[ada, lin, mira, noah, sam]}
 *   threadCount={6}
 *   unreadCount={2}
 *   isSelected
 *   onClick={() => openCluster('cluster-1')}
 * />
 * ```
 */
export function CommentPin({
  label,
  participants,
  threadCount = 1,
  unreadCount = 0,
  isSelected = false,
  isDimmed = false,
  isResolved = false,
  isDisabled = false,
  onClick,
  ref,
  xstyle,
  className,
  style,
  ...rest
}: CommentPinProps): React.ReactNode {
  const validThreadCount = isValidThreadCount(threadCount);
  const resolvedThreadCount = validThreadCount ? threadCount : 1;
  const isGrouped = resolvedThreadCount > 1;
  const validUnreadCount = isValidUnreadCount(unreadCount);
  const resolvedUnreadCount = validUnreadCount
    ? Math.min(unreadCount, resolvedThreadCount)
    : 0;
  const hasUnread = resolvedUnreadCount > 0;

  // Grouped pins cap at MAX_GROUP_CIRCLES circles: every distinct participant
  // when they fit, otherwise one fewer Avatar plus a `+N` overflow circle.
  const distinctParticipants = takeDistinctParticipants(
    participants,
    isGrouped ? Number.POSITIVE_INFINITY : 1,
  );
  const hasOverflow =
    isGrouped && distinctParticipants.length > MAX_GROUP_CIRCLES;
  const visibleParticipants = hasOverflow
    ? distinctParticipants.slice(0, MAX_GROUP_CIRCLES - 1)
    : distinctParticipants;
  const overflowCount =
    distinctParticipants.length - visibleParticipants.length;

  useDevWarning(
    'CommentPin',
    '`participants` should contain at least one participant. Pass the lead participant for a single thread or every distinct participant for a group.',
    participants.length === 0,
  );
  useDevWarning(
    'CommentPin',
    '`threadCount` must be a finite positive integer. Invalid values fall back to 1.',
    !validThreadCount,
  );
  useDevWarning(
    'CommentPin',
    '`unreadCount` must be a finite non-negative integer no greater than `threadCount`. Invalid values are ignored and larger values are capped.',
    !validUnreadCount || unreadCount > resolvedThreadCount,
  );
  useDevWarning(
    'CommentPin',
    '`label` must be a non-empty accessible action name.',
    label.trim() === '',
  );

  const pressFeedback = usePressFeedback();
  const hasTooltip = !isDisabled && label.trim() !== '';
  const tooltip = useTooltip({
    placement: 'above',
    isEnabled: hasTooltip,
  });
  const mergedRef = useMergedRefs(ref, hasTooltip ? tooltip.ref : undefined);

  const avatarParticipants =
    visibleParticipants.length > 0
      ? visibleParticipants
      : [{id: '__anonymous__', name: '', avatarSrc: undefined}];

  const marker = (
    <button
      {...rest}
      {...pressFeedback}
      ref={mergedRef}
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      aria-disabled={isDisabled || undefined}
      onClick={event => {
        if (isDisabled) {
          // The disabled pin stays focusable (spec:AST-085 FR1), so the DOM
          // still dispatches its click: keep it from the caller and from an
          // ancestor's handler, as a natively disabled button would.
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
      {...mergeProps(
        themeProps('comment-pin', {
          grouped: isGrouped ? 'grouped' : null,
          unread: hasUnread ? 'unread' : null,
          selected: isSelected ? 'selected' : null,
          dimmed: isDimmed ? 'dimmed' : null,
          resolved: isResolved ? 'resolved' : null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        focusOutlineProps.focusVisible(
          styles.root,
          interactionOverlayStyles.backgroundImage,
          (isGrouped || hasUnread) && styles.withCount,
          isResolved && !isSelected && styles.resolved,
          isDimmed && !isSelected && styles.dimmed,
          isSelected && styles.selected,
          isDisabled && styles.disabled,
          xstyle,
        ),
        className,
        style,
      )}>
      <span aria-hidden="true" {...stylex.props(styles.avatarRail)}>
        {isGrouped ? (
          <AvatarGroup size="xsm">
            {avatarParticipants.map(participant => (
              <Avatar
                key={participant.id}
                name={participant.name}
                src={participant.avatarSrc}
                tooltip={false}
              />
            ))}
            {overflowCount > 0 ? (
              <AvatarGroupOverflow
                count={overflowCount}
                xstyle={styles.overflowCircle}
              />
            ) : null}
          </AvatarGroup>
        ) : (
          avatarParticipants.map(participant => (
            <Avatar
              key={participant.id}
              name={participant.name}
              src={participant.avatarSrc}
              size="xsm"
              tooltip={false}
            />
          ))
        )}
      </span>
      {hasUnread ? (
        <span aria-hidden="true" {...stylex.props(styles.unreadBadge)}>
          {resolvedUnreadCount}
        </span>
      ) : isGrouped ? (
        <span aria-hidden="true" {...stylex.props(styles.count)}>
          {resolvedThreadCount}
        </span>
      ) : null}
    </button>
  );

  return (
    <>
      {marker}
      {hasTooltip ? tooltip.renderTooltip(label) : null}
    </>
  );
}

CommentPin.displayName = 'CommentPin';
