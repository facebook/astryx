// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatEmojiPicker.tsx
 * @input Uses React, StyleX, theme tokens, Popover, TextInput, useGridFocus
 * @output Exports ChatEmojiPicker component, ChatEmojiPickerProps,
 *   ChatEmojiOption, and DEFAULT_CHAT_EMOJIS
 * @position Popover emoji grid for chat reactions; wraps a trigger button
 *
 * Renders a Popover around a trigger element: a shortname filter input over
 * a fixed 8-column emoji grid. Arrow keys move focus through the grid
 * (left/right by one, up/down by a row) via useGridFocus; picking an emoji
 * calls onSelect and closes the popover, which restores focus to the
 * trigger. Ships with a small default emoji set; pass `emojis` to override.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/core/src/Chat/ChatEmojiPicker.doc.mjs
 * - /packages/core/src/Chat/Chat.doc.mjs (components list)
 */

import type {ReactNode} from 'react';
import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {Popover} from '../Popover';
import {TextInput} from '../TextInput';
import {useGridFocus} from '../hooks/useGridFocus';

export interface ChatEmojiOption {
  /** The emoji character, e.g. "🎉". */
  emoji: string;
  /** Shortname used for filtering and accessible labels, e.g. "tada". */
  name: string;
}

/**
 * Small default emoji set (two grid rows) covering the common
 * reaction vocabulary. Override via the `emojis` prop.
 */
export const DEFAULT_CHAT_EMOJIS: ReadonlyArray<ChatEmojiOption> = [
  {emoji: '👍', name: 'thumbs up'},
  {emoji: '❤️', name: 'heart'},
  {emoji: '😂', name: 'joy'},
  {emoji: '🎉', name: 'tada'},
  {emoji: '😮', name: 'wow'},
  {emoji: '😢', name: 'cry'},
  {emoji: '🔥', name: 'fire'},
  {emoji: '👀', name: 'eyes'},
  {emoji: '✅', name: 'check'},
  {emoji: '🙏', name: 'pray'},
  {emoji: '💯', name: 'hundred'},
  {emoji: '🚀', name: 'rocket'},
  {emoji: '😍', name: 'heart eyes'},
  {emoji: '🤔', name: 'thinking'},
  {emoji: '👋', name: 'wave'},
  {emoji: '⭐', name: 'star'},
];

const GRID_COLUMNS = 8;

export interface ChatEmojiPickerProps {
  /**
   * Called with the picked emoji character.
   * The popover closes itself after selection.
   */
  onSelect: (emoji: string) => void;

  /**
   * Emoji options rendered in the grid (8 per row).
   * @default DEFAULT_CHAT_EMOJIS
   */
  emojis?: ReadonlyArray<ChatEmojiOption>;

  /**
   * Accessible label for the popover dialog.
   * @default 'Pick an emoji'
   */
  label?: string;

  /**
   * Placeholder and hidden label for the filter input.
   * @default 'Search emoji'
   */
  searchLabel?: string;

  /**
   * Trigger element — must contain a `<button>` (Popover wires it up).
   */
  children: ReactNode;

  /** Test ID for the popover content. */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    width: GRID_COLUMNS * 34 + 8,
    boxSizing: 'border-box',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
    gap: spacingVars['--spacing-0-5'],
  },
  cell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: radiusVars['--radius-inner'],
    borderStyle: 'none',
    padding: 0,
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        default: 'transparent',
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: 1,
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: -2,
    transitionProperty: 'background-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  empty: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Popover emoji grid with shortname filtering and arrow-key navigation.
 *
 * Wraps its trigger button in a Popover. Typing in the filter input narrows
 * the grid by shortname; arrow keys move focus between emoji; picking one
 * calls `onSelect` and closes the popover (focus returns to the trigger).
 *
 * @example
 * ```
 * <ChatEmojiPicker onSelect={(emoji) => addReaction(emoji)}>
 *   <button type="button" aria-label="Add reaction">🙂</button>
 * </ChatEmojiPicker>
 * ```
 */
export function ChatEmojiPicker({
  onSelect,
  emojis = DEFAULT_CHAT_EMOJIS,
  label = 'Pick an emoji',
  searchLabel = 'Search emoji',
  children,
  'data-testid': testId,
}: ChatEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const {gridRef, handleKeyDown} = useGridFocus<HTMLDivElement>({
    columns: GRID_COLUMNS,
  });

  const trimmed = query.trim().toLowerCase();
  const visible =
    trimmed === ''
      ? emojis
      : emojis.filter(
          option =>
            option.name.toLowerCase().includes(trimmed) ||
            option.emoji === trimmed,
        );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setQuery('');
    }
  };

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    handleOpenChange(false);
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      label={label}
      placement="below"
      alignment="start"
      data-testid={testId}
      content={
        <div
          {...mergeProps(
            themeProps('chat-emoji-picker'),
            stylex.props(styles.panel),
          )}>
          <TextInput
            label={searchLabel}
            isLabelHidden
            size="sm"
            placeholder={searchLabel}
            value={query}
            onChange={setQuery}
            hasClear
          />
          {visible.length === 0 ? (
            <div {...stylex.props(styles.empty)}>
              No emoji match “{query.trim()}”.
            </div>
          ) : (
            <div
              ref={gridRef}
              role="group"
              aria-label="Emoji"
              onKeyDown={handleKeyDown}
              {...stylex.props(styles.grid)}>
              {visible.map(option => (
                <button
                  key={option.emoji}
                  type="button"
                  data-emoji={option.emoji}
                  aria-label={`React with ${option.name}`}
                  onClick={() => handleSelect(option.emoji)}
                  {...stylex.props(styles.cell)}>
                  <span aria-hidden="true">{option.emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      }>
      {children}
    </Popover>
  );
}

ChatEmojiPicker.displayName = 'ChatEmojiPicker';
