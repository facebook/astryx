// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatTypingIndicator.tsx
 * @input Uses React, StyleX (keyframes), theme tokens
 * @output Exports ChatTypingIndicator component and ChatTypingIndicatorProps
 * @position Animated "X is typing…" hint above a chat composer
 *
 * Three staggered bouncing dots (stylex.keyframes, reduced-motion safe)
 * with a grammar-aware label: "Ana is typing…", "Ana and Ben are typing…",
 * or "Ana and 2 others are typing…". Announced politely via role="status".
 * Renders dots only when no names are provided.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/core/src/Chat/ChatTypingIndicator.doc.mjs
 * - /packages/core/src/Chat/Chat.doc.mjs (components list)
 * - /packages/cli/templates/blocks/components/ChatTypingIndicator/ (block examples)
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import type {BaseProps} from '../BaseProps';

export interface ChatTypingIndicatorProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Names of people currently typing. Drives the label:
   * one name → "Ana is typing…", two → "Ana and Ben are typing…",
   * more → "Ana and 2 others are typing…". When omitted or empty,
   * only the animated dots render.
   */
  names?: string[];
}

// =============================================================================
// Styles
// =============================================================================

const bounceKeyframes = stylex.keyframes({
  '0%': {transform: 'translateY(0)', opacity: 0.35},
  '30%': {transform: 'translateY(-3px)', opacity: 1},
  '60%': {transform: 'translateY(0)', opacity: 0.35},
  '100%': {transform: 'translateY(0)', opacity: 0.35},
});

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    minHeight: 20,
  },
  dots: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-icon-secondary'],
    animationName: bounceKeyframes,
    animationDuration: durationVars['--duration-slow'],
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
  dot2: {
    animationDelay: '160ms',
  },
  dot3: {
    animationDelay: '320ms',
  },
  label: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
});

function typingLabel(names: string[] | undefined): string | null {
  if (names == null || names.length === 0) {
    return null;
  }
  if (names.length === 1) {
    return `${names[0]} is typing…`;
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]} are typing…`;
  }
  return `${names[0]} and ${names.length - 1} others are typing…`;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Animated three-dot typing hint with a name-aware label.
 *
 * The dots bounce with staggered delays (disabled under
 * prefers-reduced-motion) and the label is announced politely to
 * screen readers via role="status".
 *
 * @example
 * ```
 * <ChatTypingIndicator names={['Ana']} />
 * <ChatTypingIndicator names={['Ana', 'Ben', 'Casey']} />
 * ```
 */
export function ChatTypingIndicator({
  names,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref,
}: ChatTypingIndicatorProps) {
  const label = typingLabel(names);
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      data-testid={testId}
      {...mergeProps(
        themeProps('chat-typing-indicator'),
        stylex.props(styles.root, xstyle),
        className,
        styleProp,
      )}>
      <span aria-hidden="true" {...stylex.props(styles.dots)}>
        <span {...stylex.props(styles.dot)} />
        <span {...stylex.props(styles.dot, styles.dot2)} />
        <span {...stylex.props(styles.dot, styles.dot3)} />
      </span>
      {label != null && <span {...stylex.props(styles.label)}>{label}</span>}
    </div>
  );
}

ChatTypingIndicator.displayName = 'ChatTypingIndicator';
