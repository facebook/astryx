'use client';

/**
 * @file XDSChatMessageList.tsx
 * @input Uses React, StyleX, XDSChatListContext, theme tokens
 * @output Exports XDSChatMessageList component and XDSChatMessageListProps
 * @position Presentational message container — holds XDSChatMessage children
 *
 * Renders a container with role="log" for chat message histories.
 * Handles density context, empty state, a spacer that pushes messages
 * to the bottom, and an infinite scroll sentinel.
 *
 * Auto-scroll and the scroll-to-bottom button are owned by
 * XDSChatLayout. When used standalone (without a layout), the list
 * is purely presentational — compose useXDSChatStreamScroll yourself if needed.
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
import {spacingVars} from '../theme/tokens.stylex';
import {XDSChatListContext, type XDSChatDensity, useXDSChatLayoutContext} from './XDSChatContext';
import {xdsClassName, mergeProps} from '../utils';
import {XDSSpinner} from '../Spinner';

export interface XDSChatMessageListProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Message elements — typically XDSChatMessage components.
   * Also accepts XDSDivider (date separators) or any ReactNode.
   */
  children: ReactNode;

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

// =============================================================================
// Component
// =============================================================================

/**
 * Presentational container for chat messages.
 *
 * Renders messages in a flex column with density-based spacing.
 * A spacer pushes content to the bottom when the list isn't full.
 * Supports loading older messages via `onScrollToTopAction`.
 *
 * Auto-scroll and the scroll-to-bottom button are owned by
 * XDSChatLayout. Use useXDSChatStreamScroll for standalone scroll control.
 *
 * @example
 * ```
 * <XDSChatMessageList>
 *   <XDSChatMessage sender="assistant" name="Navi" avatar={<XDSAvatar name="Navi" size="md" />}>
 *     <XDSChatMessageBubble>Hello!</XDSChatMessageBubble>
 *   </XDSChatMessage>
 * </XDSChatMessageList>
 * ```
 */
export function XDSChatMessageList({
  children,
  emptyState,
  onScrollToTopAction,
  density = 'balanced',
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSChatMessageListProps) {
  const layoutContext = useXDSChatLayoutContext();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isLoadingTop, startTransition] = useTransition();

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

  // IntersectionObserver for scroll-to-top infinite scroll
  useEffect(() => {
    const scrollContainer = layoutContext?.scrollContainerRef?.current;
    if (!onScrollToTopAction || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          startTransition(async () => {
            await onScrollToTopAction();
          });
        }
      },
      {root: scrollContainer ?? null, threshold: 0},
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onScrollToTopAction, layoutContext]);

  const contextValue = useMemo(() => ({density}), [density]);

  const gapStyle =
    density === 'compact'
      ? styles.gapCompact
      : density === 'spacious'
        ? styles.gapSpacious
        : styles.gapBalanced;

  return (
    <XDSChatListContext.Provider value={contextValue}>
      <div
        ref={ref}
        role="log"
        aria-live="polite"
        tabIndex={0}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('chat-message-list', {density}),
          stylex.props(styles.root, xstyle),
          className,
          style,
        )}>
        <div ref={innerRef} {...stylex.props(styles.inner, gapStyle)}>
          {/* Sentinel for infinite scroll */}
          {onScrollToTopAction && <div ref={sentinelRef} aria-hidden />}

          {/* Loading spinner at top */}
          {isLoadingTop && (
            <div {...stylex.props(styles.loadingTop)}>
              <XDSSpinner size="md" />
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
    </XDSChatListContext.Provider>
  );
}

XDSChatMessageList.displayName = 'XDSChatMessageList';
