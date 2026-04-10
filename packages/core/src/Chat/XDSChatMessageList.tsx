'use client';

/**
 * @file XDSChatMessageList.tsx
 * @input Uses React, StyleX, XDSChatListContext, XDSIcon, theme tokens, useAutoScroll
 * @output Exports XDSChatMessageList component and XDSChatMessageListProps
 * @position Scrollable message container — holds XDSChatMessage children with auto-scroll
 *
 * Renders a scrollable container with role="log" for chat message histories.
 * Handles auto-scroll (pins to bottom during streaming), a floating
 * scroll-to-bottom button when scrolled up, and a "New messages" label
 * that expands into the button via width animation when new content arrives.
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
  durationVars,
  easeVars,
  shadowVars,
} from '../theme/tokens.stylex';
import {XDSChatListContext, type XDSChatDensity} from './XDSChatContext';
import {xdsClassName, mergeProps} from '../utils';
import {XDSSpinner} from '../Spinner';
import {XDSIcon} from '../Icon';
import {XDSButton} from '../Button';
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
   * Distance from bottom (in px) beyond which the scroll-to-bottom button appears.
   * @default 100
   */
  scrollUpThreshold?: number;

  /**
   * Label shown in the scroll-to-bottom button when new messages arrive.
   * Revealed via a width animation on the button.
   * @default 'New messages'
   */
  newMessagesLabel?: string;

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

  // --- Scroll-to-bottom button ---
  // Container controls dimensions and clips content. The XDSButton inside
  // is always full-size; the container's width transition reveals the label.
  // Opaque popover bg on the container prevents hover tint bleed-through.
  // `contain: layout style` isolates reflow from the scroll area.
  scrollButtonContainer: {
    position: 'absolute',
    bottom: spacingVars['--spacing-3'],
    left: '50%',
    contain: 'layout style',
    overflow: 'hidden',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-popover'],
    boxShadow: shadowVars['--shadow-med'],
    height: '32px',
    zIndex: 1,
    transitionProperty: 'opacity, transform, max-width',
    transitionTimingFunction: easeVars['--ease-standard'],
    transitionDuration: durationVars['--duration-fast-max'],
  },
  scrollButtonContainerHidden: {
    opacity: 0,
    pointerEvents: 'none',
    maxWidth: '32px',
    transform: 'translate(-50%, 8px)',
    transitionDelay: '0ms',
  },
  scrollButtonContainerVisible: {
    opacity: 1,
    pointerEvents: 'auto',
    transform: 'translate(-50%, 0)',
    transitionDelay: '150ms',
  },
  scrollButtonCollapsed: {
    maxWidth: '32px',
  },
  scrollButtonExpanded: {
    maxWidth: '200px',
  },
  scrollButton: {
    [radiusVars['--radius-element'] as string]: radiusVars['--radius-full'],
    whiteSpace: 'nowrap',
    paddingInline: spacingVars['--spacing-2'],
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
// Sub-components
// =============================================================================

/**
 * Animated scroll-to-bottom button.
 *
 * - Icon-only ghost XDSButton (chevron down) when the user is scrolled up
 * - Expands via max-width animation to reveal label when new messages arrive
 * - Container provides opaque popover surface so ghost hover tint doesn't bleed
 *
 * Structure: container (positioning, fade, opaque surface) → XDSButton (ghost)
 * The label is always in the DOM but clipped by `max-width: 0` + `overflow: hidden`.
 * `contain: layout style` on the container isolates reflow from the scroll area.
 */
function ScrollToBottomButton({
  isScrolledUp,
  hasNewMessages,
  label,
  onClick,
}: {
  isScrolledUp: boolean;
  hasNewMessages: boolean;
  label: string;
  onClick: () => void;
}) {
  const isVisible = isScrolledUp || hasNewMessages;

  return (
    <div
      {...stylex.props(
        styles.scrollButtonContainer,
        isVisible
          ? styles.scrollButtonContainerVisible
          : styles.scrollButtonContainerHidden,
        hasNewMessages
          ? styles.scrollButtonExpanded
          : styles.scrollButtonCollapsed,
      )}>
      <XDSButton
        label={hasNewMessages ? label : 'Scroll to bottom'}
        aria-label={hasNewMessages ? label : 'Scroll to bottom'}
        icon={<XDSIcon icon="chevronDown" size="md" />}
        variant="ghost"
        size="md"
        onClick={onClick}
        xstyle={styles.scrollButton}>
        {hasNewMessages ? label : undefined}
      </XDSButton>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * Scrollable container for chat messages with auto-scroll and infinite scroll support.
 *
 * Pins to the bottom when the user is near the end. Shows a muted
 * scroll-to-bottom icon button when scrolled up. When new messages
 * arrive while scrolled up, the button expands to show a
 * "New messages" label. Supports loading older messages via
 * `onScrollToTopAction`.
 *
 * @example
 * ```
 * <XDSChatMessageList>
 *   <XDSChatMessage sender="assistant" name="Navi" avatar={<XDSAvatar name="Navi" size="md" />}>
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
  scrollUpThreshold = 100,
  newMessagesLabel = 'New messages',
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
    isScrolledUp,
    hasNewMessages,
    handleScroll,
    scrollToBottom,
    dismissNewMessages,
    onContentChange,
  } = useAutoScroll({
    enabled: hasAutoScroll,
    threshold: scrollThreshold,
    scrollUpThreshold,
  });

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

  // Click handler: dismiss new messages (scrolls to bottom) or just scroll
  const handleButtonClick = useCallback(() => {
    if (hasNewMessages) {
      dismissNewMessages();
    } else {
      scrollToBottom();
    }
  }, [hasNewMessages, dismissNewMessages, scrollToBottom]);

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

        {/* Scroll-to-bottom button: icon-only when scrolled up, expands with label on new messages */}
        <ScrollToBottomButton
          isScrolledUp={isScrolledUp}
          hasNewMessages={hasNewMessages}
          label={newMessagesLabel}
          onClick={handleButtonClick}
        />
      </div>
    </XDSChatListContext.Provider>
  );
}

XDSChatMessageList.displayName = 'XDSChatMessageList';
