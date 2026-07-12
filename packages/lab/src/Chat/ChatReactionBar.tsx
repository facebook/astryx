// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatReactionBar.tsx
 * @input Uses React, StyleX, theme tokens, Tooltip, ChatEmojiPicker
 * @output Exports ChatReactionBar component, ChatReactionBarProps, ChatReaction
 * @position Row of emoji reaction pills under a chat message
 *
 * Renders reaction pills (emoji + count) with a pressed state for the
 * current user's own reactions, optional tooltips listing reactors, and an
 * optional trailing add-reaction button that opens a ChatEmojiPicker
 * popover. Data flows in via `reactions`; toggles flow out via `onToggle`
 * and new reactions via `onAdd`.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Chat/index.ts (exports)
 * - /packages/lab/src/Chat/ChatReactionBar.doc.mjs
 * - /apps/storybook/stories/ChatAdditions.stories.tsx (examples)
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  typographyVars,
  typeScaleVars,
  fontWeightVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import type {BaseProps} from '@astryxdesign/core';
import {mergeProps} from '@astryxdesign/core/utils';
import {themeProps} from '@astryxdesign/core/utils';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {ChatEmojiPicker} from './ChatEmojiPicker';
import type {ChatEmojiOption} from './ChatEmojiPicker';

export interface ChatReaction {
  /** The emoji character, e.g. "🎉". */
  emoji: string;
  /** Number of people who reacted with this emoji. */
  count: number;
  /**
   * Whether the current user has reacted — accent border, tinted
   * background, and `aria-pressed="true"` on the pill.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Human-readable description used as the pill's tooltip and accessible
   * label, e.g. "Ana and Dana reacted with 🎉". Falls back to a count-based
   * label when omitted.
   */
  label?: string;
}

export interface ChatReactionBarProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onToggle'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /** Reactions to render, in display order. */
  reactions: ChatReaction[];

  /** Called with the pill's emoji when the user toggles a reaction. */
  onToggle?: (emoji: string) => void;

  /**
   * Called with the picked emoji when the user adds a reaction from the
   * emoji picker. The trailing add-reaction button renders only when
   * this is provided.
   */
  onAdd?: (emoji: string) => void;

  /**
   * Emoji options for the add-reaction picker.
   * @default DEFAULT_CHAT_EMOJIS
   */
  emojis?: ReadonlyArray<ChatEmojiOption>;

  /**
   * Accessible label for the add-reaction button.
   * @default 'Add reaction'
   */
  addLabel?: string;

  /**
   * Accessible label for the reaction group.
   * @default 'Reactions'
   */
  label?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    height: 24,
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-full'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'transparent',
      ':hover': {
        default: 'transparent',
        '@media (hover: hover)': colorVars['--color-border-emphasized'],
      },
    },
    backgroundColor: colorVars['--color-background-muted'],
    cursor: 'pointer',
    fontFamily: typographyVars['--font-family-body'],
    boxSizing: 'border-box',
    transitionProperty: 'border-color, background-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  pillSelected: {
    backgroundColor: colorVars['--color-accent-muted'],
    borderColor: {
      default: colorVars['--color-accent'],
      ':hover': {
        default: colorVars['--color-accent'],
        '@media (hover: hover)': colorVars['--color-accent'],
      },
    },
  },
  emoji: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  count: {
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    fontVariantNumeric: 'tabular-nums',
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  countSelected: {
    color: colorVars['--color-text-accent'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 24,
    borderRadius: radiusVars['--radius-full'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: 'transparent',
      ':hover': {
        default: 'transparent',
        '@media (hover: hover)': colorVars['--color-border-emphasized'],
      },
    },
    backgroundColor: colorVars['--color-background-muted'],
    color: colorVars['--color-icon-secondary'],
    cursor: 'pointer',
    boxSizing: 'border-box',
    fontSize: 15,
    lineHeight: typeScaleVars['--text-supporting-leading'],
    padding: 0,
  },
});

function pillLabel(reaction: ChatReaction): string {
  if (reaction.label != null) {
    return reaction.label;
  }
  const noun = reaction.count === 1 ? 'reaction' : 'reactions';
  return `${reaction.count} ${noun} with ${reaction.emoji}`;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Row of emoji reaction pills under a chat message.
 *
 * Each pill shows an emoji and count; the current user's own reactions get
 * an accent tint and `aria-pressed`. Provide `onAdd` to render a trailing
 * add-reaction button that opens a ChatEmojiPicker popover.
 *
 * @example
 * ```
 * <ChatReactionBar
 *   reactions={[
 *     {emoji: '🎉', count: 4, isSelected: true, label: 'You and Dana reacted with 🎉'},
 *     {emoji: '👀', count: 2},
 *   ]}
 *   onToggle={(emoji) => toggleReaction(emoji)}
 *   onAdd={(emoji) => addReaction(emoji)}
 * />
 * ```
 */
export function ChatReactionBar({
  reactions,
  onToggle,
  onAdd,
  emojis,
  addLabel = 'Add reaction',
  label = 'Reactions',
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref,
}: ChatReactionBarProps) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      data-testid={testId}
      {...mergeProps(
        themeProps('chat-reaction-bar'),
        stylex.props(styles.root, xstyle),
        className,
        styleProp,
      )}>
      {reactions.map(reaction => {
        const isSelected = reaction.isSelected === true;
        const pill = (
          <button
            key={reaction.emoji}
            type="button"
            aria-pressed={isSelected}
            aria-label={pillLabel(reaction)}
            onClick={() => onToggle?.(reaction.emoji)}
            {...stylex.props(styles.pill, isSelected && styles.pillSelected)}>
            <span aria-hidden="true" {...stylex.props(styles.emoji)}>
              {reaction.emoji}
            </span>
            <span
              {...stylex.props(
                styles.count,
                isSelected && styles.countSelected,
              )}>
              {reaction.count}
            </span>
          </button>
        );
        return reaction.label != null ? (
          <Tooltip key={reaction.emoji} content={reaction.label}>
            {pill}
          </Tooltip>
        ) : (
          pill
        );
      })}
      {onAdd != null && (
        <ChatEmojiPicker emojis={emojis} onSelect={onAdd} label={addLabel}>
          <Tooltip content={addLabel}>
            <button
              type="button"
              aria-label={addLabel}
              {...stylex.props(styles.addButton)}>
              +
            </button>
          </Tooltip>
        </ChatEmojiPicker>
      )}
    </div>
  );
}

ChatReactionBar.displayName = 'ChatReactionBar';
