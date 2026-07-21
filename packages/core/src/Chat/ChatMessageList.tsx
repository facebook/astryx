// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatMessageList.tsx
 * @input Uses React, StyleX, ChatListContext, useIsomorphicLayoutEffect, theme tokens, spacing step utilities
 * @output Exports ChatMessageList component and ChatMessageListProps
 * @position Presentational message container — holds ChatMessage children
 *
 * Renders a container with role="log" for chat message histories.
 * Handles density context, configurable gap, empty state,
 * a spacer that pushes messages to the bottom, and an infinite scroll
 * sentinel. Loading earlier messages is single-flight and preserves the
 * reader's viewport position across the prepend (native scroll anchoring
 * is suppressed at scrollTop 0, where the sentinel fires).
 *
 * Auto-scroll and the scroll-to-bottom button are owned by
 * ChatLayout. When used standalone (without a layout), the list
 * is purely presentational — compose useChatStreamScroll yourself if needed.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/Chat.stories.tsx
 * - /apps/storybook/stories/ChatLayout.stories.tsx (load-earlier story)
 * - /packages/cli/templates/blocks/components/ChatMessageList/ (block examples)
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
import {spacingVars} from '../theme/tokens.stylex';
import {
  ChatListContext,
  type ChatDensity,
  useChatLayoutContext,
} from './ChatContext';
import {mergeProps} from '../utils';
import {Spinner} from '../Spinner';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {BaseProps} from '../BaseProps';
import type {SpacingStep} from '../utils/types';
import {themeProps} from '../utils/themeProps';

export interface ChatMessageListProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Message elements — typically ChatMessage components.
   * Also accepts Divider (date separators) or any ReactNode.
   */
  children: ReactNode;

  /**
   * Custom content when the list has no messages.
   */
  emptyState?: ReactNode;

  /**
   * Async action when the user scrolls to the top.
   * Use for loading older messages. Wrapped in useTransition —
   * shows a spinner at the top while pending. Only one load runs at a
   * time, the log is marked `aria-busy` while it runs, and the reader's
   * viewport position is preserved when earlier messages prepend. While
   * the list is too short to scroll, further pages load automatically
   * until it overflows.
   *
   * Apply the loaded messages to state before the returned promise
   * resolves, keep stable keys across prepends, and pass `undefined`
   * once no earlier history remains.
   */
  scrollToTopAction?: () => Promise<void>;

  /**
   * Visual density — flows to child messages via context.
   * Individual messages can override.
   * @default 'balanced'
   */
  density?: ChatDensity;

  /**
   * Gap between top-level message rows, using the spacing scale.
   * Defaults to the selected density's gap. Override this when each
   * row is independent (for example, LLM event streams where messages cannot
   * be grouped) and row spacing should be tuned separately from density.
   */
  gap?: SpacingStep;

  /**
   * Whether an assistant message is actively streaming into the list.
   *
   * The list is a `role="log"` / `aria-live="polite"` region, so while a
   * message streams in token-by-token, screen readers would otherwise
   * re-announce the accumulating partial text on every mutation. Set
   * `isStreaming` to `true` for the duration of a stream: it marks the log
   * `aria-busy="true"` so assistive tech waits and announces the completed
   * message once, when `isStreaming` returns to `false`.
   *
   * @default false
   */
  isStreaming?: boolean;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
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
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
  },
});

const gapStyles = stylex.create({
  0: {
    gap: spacingVars['--spacing-0'],
  },
  0.5: {
    gap: spacingVars['--spacing-0-5'],
  },
  1: {
    gap: spacingVars['--spacing-1'],
  },
  1.5: {
    gap: spacingVars['--spacing-1-5'],
  },
  2: {
    gap: spacingVars['--spacing-2'],
  },
  3: {
    gap: spacingVars['--spacing-3'],
  },
  4: {
    gap: spacingVars['--spacing-4'],
  },
  5: {
    gap: spacingVars['--spacing-5'],
  },
  6: {
    gap: spacingVars['--spacing-6'],
  },
  8: {
    gap: spacingVars['--spacing-8'],
  },
  10: {
    gap: spacingVars['--spacing-10'],
  },
});

// =============================================================================
// Helpers
// =============================================================================

/**
 * Nearest scrollable ancestor — used only when the list renders outside a
 * ChatLayout, so scroll compensation targets the scroller that actually
 * clips the list rather than the page.
 */
function findScrollContainer(el: Element | null): Element | null {
  for (let node = el?.parentElement; node != null; node = node.parentElement) {
    const {overflowY} = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return node;
    }
  }
  return null;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Presentational container for chat messages.
 *
 * Renders messages in a flex column with density-based spacing.
 * Override gap to tune row spacing separately from density.
 * A spacer pushes content to the bottom when the list isn't full.
 * Supports loading older messages via `scrollToTopAction`.
 *
 * Auto-scroll and the scroll-to-bottom button are owned by
 * ChatLayout. Use useChatStreamScroll for standalone scroll control.
 *
 * @example
 * ```
 * <ChatMessageList>
 *   <ChatMessage sender="assistant" name="Navi" avatar={<Avatar name="Navi" size="md" />}>
 *     <ChatMessageBubble>Hello!</ChatMessageBubble>
 *   </ChatMessage>
 * </ChatMessageList>
 * ```
 */
export function ChatMessageList({
  children,
  emptyState,
  scrollToTopAction,
  density = 'balanced',
  gap,
  isStreaming = false,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...rest
}: ChatMessageListProps) {
  const layoutContext = useChatLayoutContext();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [isLoadingTop, startTransition] = useTransition();

  const scrollToTopActionRef = useRef(scrollToTopAction);
  scrollToTopActionRef.current = scrollToTopAction;
  const hasScrollToTopAction = scrollToTopAction != null;
  const loadEarlierInFlightRef = useRef(false);
  const prependAnchorRef = useRef<{
    element: Element;
    container: Element;
    top: number;
    expectedScrollTop: number;
  } | null>(null);

  // Register inner content element with the layout for height observation
  useEffect(() => {
    if (layoutContext?.contentRef && innerRef.current) {
      layoutContext.contentRef(innerRef.current);
      return () => layoutContext.contentRef(null);
    }
  }, [layoutContext]);

  const hasChildren =
    children != null &&
    children !== false &&
    !(Array.isArray(children) && children.length === 0);

  // Start one load-earlier cycle: anchor the first content element so the
  // viewport can be restored after the prepend (native scroll anchoring is
  // suppressed at scrollTop 0, which is exactly where the sentinel fires),
  // then run the action inside a transition. Single-flight.
  const beginLoadEarlier = useCallback((container: Element | null) => {
    if (loadEarlierInFlightRef.current) {
      return;
    }
    const action = scrollToTopActionRef.current;
    if (!action) {
      return;
    }
    loadEarlierInFlightRef.current = true;

    const resolvedContainer = container ?? document.scrollingElement;
    const anchor = spacerRef.current?.nextElementSibling;
    if (resolvedContainer && anchor) {
      prependAnchorRef.current = {
        element: anchor,
        container: resolvedContainer,
        top:
          anchor.getBoundingClientRect().top -
          resolvedContainer.getBoundingClientRect().top,
        expectedScrollTop: resolvedContainer.scrollTop,
      };
    } else {
      prependAnchorRef.current = null;
    }

    startTransition(async () => {
      try {
        await action();
      } finally {
        loadEarlierInFlightRef.current = false;
      }
    });
  }, []);

  // IntersectionObserver for scroll-to-top infinite scroll. The action
  // lives in a ref so an inline callback doesn't reconnect the observer
  // on every render.
  useEffect(() => {
    if (!hasScrollToTopAction || !sentinelRef.current) {
      return;
    }
    const scrollContainer = layoutContext?.scrollContainerRef?.current;
    // Compensation target: the layout's scroller, or — standalone — the
    // scroller that actually clips the list, not the page.
    const captureContainer =
      scrollContainer ?? findScrollContainer(sentinelRef.current);

    const observer = new IntersectionObserver(
      entries => {
        // Entries are oldest-first; only the latest state matters.
        if (entries[entries.length - 1]?.isIntersecting) {
          beginLoadEarlier(captureContainer);
        }
      },
      {root: scrollContainer ?? null, threshold: 0},
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasScrollToTopAction, layoutContext, beginLoadEarlier]);

  // Keep the anchor at its captured viewport offset while a load-earlier
  // cycle settles. Runs per commit; measured, not assumed — if native
  // anchoring already kept the anchor in place, the delta is 0. The anchor
  // disarms only after the prepend actually committed (the action may
  // resolve before the consumer's state lands) — or when the reader
  // scrolled away, which hands stability back to native anchoring.
  useIsomorphicLayoutEffect(() => {
    const anchor = prependAnchorRef.current;
    if (!anchor || loadEarlierInFlightRef.current) {
      return;
    }
    const {container, element} = anchor;

    if (Math.abs(container.scrollTop - anchor.expectedScrollTop) > 1) {
      prependAnchorRef.current = null;
      return;
    }
    if (!element.isConnected) {
      prependAnchorRef.current = null;
      return;
    }

    const delta =
      element.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      anchor.top;
    if (delta !== 0) {
      container.scrollTop += delta;
      anchor.expectedScrollTop = container.scrollTop;
    }

    const prepended = spacerRef.current?.nextElementSibling !== element;
    if (prepended && !isLoadingTop) {
      prependAnchorRef.current = null;
      // Underfilled list: still pinned at the top after a successful page
      // means there is no room to scroll — keep filling until it overflows.
      if (container.scrollTop === 0) {
        beginLoadEarlier(container);
      }
    }
  });

  const contextValue = useMemo(() => ({density}), [density]);

  const densityGapStyle =
    density === 'compact'
      ? styles.gapCompact
      : density === 'spacious'
        ? styles.gapSpacious
        : styles.gapBalanced;
  const gapOverrideStyle = gap == null ? null : gapStyles[gap];

  return (
    <ChatListContext value={contextValue}>
      <div
        {...rest}
        ref={ref}
        role="log"
        aria-live="polite"
        aria-busy={isStreaming || isLoadingTop || undefined}
        tabIndex={0}
        data-testid={testId}
        {...mergeProps(
          themeProps('chat-message-list', {density}),
          stylex.props(styles.root, xstyle),
          className,
          style,
        )}>
        <div
          ref={innerRef}
          {...stylex.props(styles.inner, densityGapStyle, gapOverrideStyle)}>
          {/* Sentinel for infinite scroll */}
          {scrollToTopAction && <div ref={sentinelRef} aria-hidden />}

          {/* Loading spinner at top */}
          {isLoadingTop && (
            <div {...stylex.props(styles.loadingTop)}>
              <Spinner size="md" />
            </div>
          )}

          {/* Spacer pushes messages to bottom when list isn't full */}
          <div ref={spacerRef} {...stylex.props(styles.spacer)} aria-hidden />

          {/* Messages or empty state */}
          {hasChildren ? (
            children
          ) : emptyState ? (
            <div {...stylex.props(styles.emptyState)}>{emptyState}</div>
          ) : null}
        </div>
      </div>
    </ChatListContext>
  );
}

ChatMessageList.displayName = 'ChatMessageList';
