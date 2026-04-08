'use client';

/**
 * @file XDSChatMessageList.tsx
 * @input Uses React, StyleX, XDSChatListContext, XDSButton, theme tokens
 * @output Exports XDSChatMessageList component and XDSChatMessageListProps
 * @position Scrollable message container — holds XDSChatMessage children with auto-scroll
 *
 * Renders a scrollable container with role="log" for chat message histories.
 * Handles auto-scroll (pins to bottom during streaming), a "New messages"
 * indicator when scrolled up, and onScrollToTopAction for infinite scroll.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/Chat.stories.tsx
 */

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useTransition,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
  fontWeightVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {XDSChatListContext, type XDSChatDensity} from './XDSChatContext';
import {xdsClassName, mergeProps} from '../utils';
import {XDSSpinner} from '../Spinner';
import {useAutoScroll} from './useAutoScroll';

export interface XDSChatMessageListProps {
  /** Ref forwarded to the scrollable container element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Message elements — typically XDSChatMessage components.
   * Also accepts XDSDivider (date separators) or any ReactNode.
   */
  children: ReactNode;

  /**
   * Whether auto-scroll behavior is enabled.
   * When true (default), the list scrolls to bottom on new content
   * if the user is near the bottom. When false, no auto-scrolling
   * occurs — useful for static/view-only conversation history.
   * @default true
   */
  hasAutoScroll?: boolean;

  /**
   * Distance from bottom (in px) within which new content triggers auto-scroll.
   * Only applies when `hasAutoScroll` is true.
   * @default 12
   */
  scrollThreshold?: number;

  /**
   * Custom content when the list has no messages.
   */
  emptyState?: ReactNode;

  /**
   * Async action when the user scrolls to the top.
   * Use for loading older messages. Wrapped in useTransition —
   * shows a spinner at the top while pending.
   */
  onScrollToTopAction?: () => Promise<void>;

  /**
   * Visual density — flows to child messages via context.
   * Individual messages can override.
   * @default 'balanced'
   */
  density?: XDSChatDensity;

  /**
   * StyleX overrides.
   */
  xstyle?: StyleXStyles;
  /** CSS class name(s) appended to the root element. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
  /** Test ID. */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  outer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    overflowAnchor: 'auto',
    flex: 1,
    minHeight: 0,
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  gapCompact: {
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
  },
  gapBalanced: {
    gap: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
  },
  gapSpacious: {
    gap: spacingVars['--spacing-6'],
    paddingBlock: spacingVars['--spacing-6'],
    paddingInline: spacingVars['--spacing-6'],
  },
  spacer: {
    flex: 1,
    minHeight: 0,
  },
  loadingTop: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-3'],
  },
  newMessagesButton: {
    position: 'absolute',
    bottom: spacingVars['--spacing-3'],
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-1-5'],
    paddingInline: spacingVars['--spacing-3'],
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
    border: 'none',
    borderRadius: radiusVars['--radius-full'],
    cursor: 'pointer',
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transitionProperty: 'opacity, transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    zIndex: 1,
  },
  newMessagesHidden: {
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translate(-50%, 8px)',
  },
  newMessagesVisible: {
    opacity: 1,
    pointerEvents: 'auto',
    transform: 'translate(-50%, 0)',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Scrollable container for chat messages with auto-scroll and infinite scroll support.
 *
 * Pins to the bottom when the user is near the end. Shows a "New messages" button
 * when scrolled up. Supports loading older messages via `onScrollToTopAction`.
 *
 * @example
 * ```
 * <XDSChatMessageList>
 *   <XDSChatMessage sender="assistant" name="Navi" avatar={<XDSAvatar name="Navi" size="sm" />}>
 *     <XDSChatMessageBubble>Hello!</XDSChatMessageBubble>
 *   </XDSChatMessage>
 *   <XDSChatMessage sender="user" name="Cindy">
 *     <XDSChatMessageBubble>Hey there!</XDSChatMessageBubble>
 *   </XDSChatMessage>
 * </XDSChatMessageList>
 * ```
 */
export function XDSChatMessageList({
  children,
  hasAutoScroll = true,
  scrollThreshold = 12,
  emptyState,
  onScrollToTopAction,
  density = 'balanced',
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSChatMessageListProps) {
  const {
    scrollRef,
    showNewMessages,
    handleScroll,
    dismissNewMessages,
    onContentChange,
  } = useAutoScroll({enabled: hasAutoScroll, threshold: scrollThreshold});

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isLoadingTop, startTransition] = useTransition();

  // Track whether children exist (for empty state)
  const hasChildren =
    children != null &&
    children !== false &&
    !(Array.isArray(children) && children.length === 0);

  // Auto-scroll on new content (children change)
  useEffect(() => {
    onContentChange();
  }, [children, onContentChange]);

  // IntersectionObserver for scroll-to-top infinite scroll
  useEffect(() => {
    if (!onScrollToTopAction || !sentinelRef.current || !scrollRef.current)
      return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          startTransition(async () => {
            await onScrollToTopAction();
          });
        }
      },
      {root: scrollRef.current, threshold: 0},
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onScrollToTopAction, scrollRef]);

  const contextValue = useMemo(() => ({density}), [density]);

  const gapStyle =
    density === 'compact'
      ? styles.gapCompact
      : density === 'spacious'
        ? styles.gapSpacious
        : styles.gapBalanced;

  // Merge refs
  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    },
    [ref, scrollRef],
  );

  return (
    <XDSChatListContext.Provider value={contextValue}>
      <div {...stylex.props(styles.outer)}>
        <div
          ref={setRefs}
          role="log"
          aria-live="polite"
          tabIndex={0}
          data-testid={testId}
          onScroll={handleScroll}
          {...mergeProps(
            xdsClassName('chat-message-list', {density}),
            stylex.props(styles.root, xstyle),
            className,
            style,
          )}>
          <div {...stylex.props(styles.inner, gapStyle)}>
            {/* Sentinel for infinite scroll */}
            {onScrollToTopAction && <div ref={sentinelRef} aria-hidden />}

            {/* Loading spinner at top */}
            {isLoadingTop && (
              <div {...stylex.props(styles.loadingTop)}>
                <XDSSpinner size="sm" />
              </div>
            )}

            {/* Spacer pushes messages to bottom when list isn't full */}
            <div {...stylex.props(styles.spacer)} aria-hidden />

            {/* Messages or empty state */}
            {hasChildren ? (
              children
            ) : emptyState ? (
              <div {...stylex.props(styles.emptyState)}>{emptyState}</div>
            ) : null}
          </div>
        </div>

        {/* New messages button */}
        <button
          type="button"
          aria-label="New messages — scroll to bottom"
          onClick={dismissNewMessages}
          {...stylex.props(
            styles.newMessagesButton,
            showNewMessages
              ? styles.newMessagesVisible
              : styles.newMessagesHidden,
          )}>
          New messages ↓
        </button>
      </div>
    </XDSChatListContext.Provider>
  );
}

XDSChatMessageList.displayName = 'XDSChatMessageList';
