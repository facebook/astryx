'use client';

/**
 * @file XDSChatLayout.tsx
 * @input Uses React, StyleX, theme tokens, useAutoScroll
 * @output Exports XDSChatLayout component and XDSChatLayoutProps
 * @position Layout shell for full chat interfaces — messages in page flow, composer fixed to bottom
 *
 * Arranges a chat page: messages flow naturally in the page, composer is
 * fixed to the bottom with a frosted glass backdrop. Owns auto-scroll
 * behavior and the scroll-to-bottom button. Uses ResizeObserver on the
 * message content area to detect new content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/ChatLayout.stories.tsx
 */

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  shadowVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSChatLayoutContext} from './XDSChatContext';
import {useAutoScroll} from './useAutoScroll';
import {XDSIcon} from '../Icon';
import {XDSButton} from '../Button';

// =============================================================================
// Types
// =============================================================================

type Density = 'compact' | 'balanced' | 'spacious';

export interface XDSChatLayoutProps {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Message content — flows naturally in the page, scrolls with the page.
   * Typically XDSChatMessageList with XDSChatMessage children.
   */
  children: ReactNode;

  /**
   * Composer element — fixed to the bottom with a frosted glass dock.
   * Typically XDSChatComposer.
   */
  composer: ReactNode;

  /**
   * Content shown when children is empty.
   */
  emptyState?: ReactNode;

  /**
   * External scroll container ref. When provided, auto-scroll and
   * scroll-to-bottom target this element instead of the layout root.
   *
   * @example
   * ```
   * // Scroll with the page body
   * const scrollRef = useRef(document.documentElement);
   * <XDSChatLayout scrollRef={scrollRef} composer={...}>...</XDSChatLayout>
   * ```
   *
   * When omitted, the layout root itself is the scroll container
   * (`overflow-y: auto`). This is the default for full-page and
   * panel chat layouts.
   */
  scrollRef?: React.RefObject<HTMLElement | null>;

  /**
   * Whether auto-scroll behavior is enabled.
   * @default true
   */
  hasAutoScroll?: boolean;

  /**
   * Label shown in the scroll-to-bottom button when new messages arrive.
   * @default 'New messages'
   */
  newMessagesLabel?: string;

  /** StyleX overrides. */
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
    position: 'relative',
    containerType: 'inline-size',
    minHeight: 0,
    flex: 1,
  },
  rootScrollable: {
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  // --- Message area ---
  messageArea: {
    display: 'flex',
    flexDirection: 'column',
    marginInline: 'auto',
    minHeight: '100%',
    paddingBlockEnd: spacingVars['--spacing-6'],
  },
  messageAreaCompact: {
    maxWidth: '100%',
  },
  messageAreaBalanced: {
    maxWidth: '100%',
  },
  messageAreaSpacious: {
    maxWidth: 800,
    paddingInline: spacingVars['--spacing-4'],
  },

  // --- Empty state ---
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 200,
  },

  // --- Dock container — holds blur layer + composer as siblings ---
  dockContainer: {
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    isolation: 'isolate',
    pointerEvents: 'none',
  },
  dockContainerFixed: {
    position: 'fixed',
  },
  dockContainerSticky: {
    position: 'sticky',
  },

  // --- Blur layer (absolute within dock container) ---
  blurLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },

  blurLayerCompact: {
    height: 80,
    maskImage: 'linear-gradient(to bottom, transparent, black 24px)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 24px)',
  },
  blurLayerBalanced: {
    height: 100,
    maskImage: 'linear-gradient(to bottom, transparent, black 36px)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 36px)',
  },
  blurLayerSpacious: {
    height: 120,
    maskImage: 'linear-gradient(to bottom, transparent, black 48px)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 48px)',
  },

  // --- Composer dock ---
  dock: {
    position: 'relative',
    zIndex: 1,
    pointerEvents: 'auto',
  },

  dockCompact: {
    paddingInline: spacingVars['--spacing-2'],
    paddingBlockEnd: spacingVars['--spacing-2'],
  },
  dockBalanced: {
    paddingInline: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-3'],
  },
  dockSpacious: {
    paddingInline: spacingVars['--spacing-4'],
    paddingBlockEnd: spacingVars['--spacing-3'],
  },

  // --- Dock inner wrapper ---
  dockInner: {
    marginInline: 'auto',
  },
  dockInnerCompact: {
    maxWidth: '100%',
  },
  dockInnerBalanced: {
    maxWidth: '100%',
  },
  dockInnerSpacious: {
    maxWidth: 800,
  },

  // --- Scroll-to-bottom button ---
  // Wrapper centers the button above the composer inside the dock container.
  scrollButtonWrapper: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlockEnd: spacingVars['--spacing-3'],
  },
  scrollButtonContainer: {
    pointerEvents: 'auto',
    contain: 'layout style',
    overflow: 'hidden',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-popover'],
    boxShadow: shadowVars['--shadow-med'],
    height: '32px',
    transitionProperty: 'opacity, transform, max-width',
    transitionTimingFunction: easeVars['--ease-standard'],
    transitionDuration: durationVars['--duration-fast-max'],
  },
  scrollButtonContainerHidden: {
    opacity: 0,
    pointerEvents: 'none',
    maxWidth: '32px',
  },
  scrollButtonContainerVisible: {
    opacity: 1,
    pointerEvents: 'auto',
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
});

// =============================================================================
// Helpers
// =============================================================================

function getDensity(width: number): Density {
  if (width < 480) return 'compact';
  if (width <= 768) return 'balanced';
  return 'spacious';
}

function hasVisibleContent(children: ReactNode): boolean {
  if (children == null || children === false) return false;
  if (Array.isArray(children) && children.length === 0) return false;
  return true;
}

// =============================================================================
// Sub-components
// =============================================================================

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
      {...stylex.props(styles.scrollButtonWrapper)}>
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
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * Layout shell for full chat interfaces.
 *
 * Messages flow naturally in the page. The composer is fixed to
 * the bottom with a frosted glass dock. The layout owns auto-scroll
 * behavior — it observes the message content area via ResizeObserver
 * and scrolls to bottom when new content arrives (if the user is
 * near the bottom). Shows a scroll-to-bottom button when scrolled up.
 *
 * @example
 * ```
 * <XDSChatLayout
 *   composer={<XDSChatComposer onSubmit={handleSubmit} />}
 *   emptyState={<EmptyState />}
 * >
 *   <XDSChatMessageList>
 *     {messages.map(msg => <XDSChatMessage key={msg.id} {...msg} />)}
 *   </XDSChatMessageList>
 * </XDSChatLayout>
 * ```
 */
export function XDSChatLayout({
  children,
  composer,
  emptyState,
  scrollRef: externalScrollRef,
  hasAutoScroll = true,
  newMessagesLabel = 'New messages',
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSChatLayoutProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const scrollListenerRef = useRef<(() => void) | null>(null);

  const scrollContainerRef =
    externalScrollRef ?? (rootRef as React.RefObject<HTMLElement | null>);
  const isSelfScrolling = !externalScrollRef;

  const [density, setDensity] = useState<Density>('balanced');

  // --- Auto-scroll ---
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
    scrollContainerRef,
  });



  // Single ResizeObserver for both density (root width) and content
  // changes (new messages). Checks entry.target to dispatch.
  const lastMessageRef = useRef<Element | null>(null);

  // Single ResizeObserver on root — handles density + new message detection.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new ResizeObserver(() => {
      setDensity(getDensity(root.clientWidth));

      const messages = root.getElementsByClassName('xds-chat-message');
      const last =
        messages.length > 0 ? messages[messages.length - 1] : null;
      if (last && last !== lastMessageRef.current) {
        lastMessageRef.current = last;
        onContentChange();
      }
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [onContentChange]);

  // --- Layout context ---
  const layoutContextValue = useMemo(
    () => ({
      scrollContainerRef,
    }),
    [scrollContainerRef],
  );



  // --- Merge refs ---
  // Callback ref attaches scroll listener and triggers initial scroll.
  const setRootRef = useCallback(
    (el: HTMLDivElement | null) => {
      // Detach previous listener
      if (scrollListenerRef.current) {
        scrollListenerRef.current();
        scrollListenerRef.current = null;
      }

      (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = el;

      if (el) {
        const scrollEl = scrollRef.current;
        if (scrollEl) {
          scrollEl.addEventListener('scroll', handleScroll, {passive: true});
          scrollListenerRef.current = () =>
            scrollEl.removeEventListener('scroll', handleScroll);
          // Defer to next frame so content has laid out
          requestAnimationFrame(() => scrollToBottom(false));
        }
      }

      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    },
    [ref, scrollRef, handleScroll, scrollToBottom],
  );

  // --- Scroll button handler ---
  const handleButtonClick = useCallback(() => {
    if (hasNewMessages) {
      dismissNewMessages();
    } else {
      scrollToBottom();
    }
  }, [hasNewMessages, dismissNewMessages, scrollToBottom]);

  // --- Derived styles ---
  const showEmpty = !hasVisibleContent(children);

  const messageAreaStyle =
    density === 'compact'
      ? styles.messageAreaCompact
      : density === 'spacious'
        ? styles.messageAreaSpacious
        : styles.messageAreaBalanced;

  const blurLayerStyle =
    density === 'compact'
      ? styles.blurLayerCompact
      : density === 'spacious'
        ? styles.blurLayerSpacious
        : styles.blurLayerBalanced;

  const dockStyle =
    density === 'compact'
      ? styles.dockCompact
      : density === 'spacious'
        ? styles.dockSpacious
        : styles.dockBalanced;

  const dockInnerStyle =
    density === 'compact'
      ? styles.dockInnerCompact
      : density === 'spacious'
        ? styles.dockInnerSpacious
        : styles.dockInnerBalanced;

  return (
    <XDSChatLayoutContext.Provider value={layoutContextValue}>
      <div
        ref={setRootRef}
        data-testid={testId}
        data-density={density}
        {...mergeProps(
          xdsClassName('chat-layout', {density}),
          stylex.props(
            styles.root,
            isSelfScrolling && styles.rootScrollable,
            xstyle,
          ),
          className,
          style,
        )}>
        {/* Message area */}
        <div
          {...stylex.props(styles.messageArea, messageAreaStyle)}
>
          {showEmpty && emptyState ? (
            <div {...stylex.props(styles.emptyState)}>{emptyState}</div>
          ) : (
            children
          )}
        </div>

        {/* Dock container — sticky/fixed, holds blur + scroll button + composer */}
        <div
          ref={dockRef}
          {...stylex.props(
            styles.dockContainer,
            isSelfScrolling
              ? styles.dockContainerSticky
              : styles.dockContainerFixed,
          )}>
          {/* Frosted glass layer — behind composer */}
          <div {...stylex.props(styles.blurLayer, blurLayerStyle)} />

          {/* Scroll-to-bottom button */}
          <ScrollToBottomButton
            isScrolledUp={isScrolledUp}
            hasNewMessages={hasNewMessages}
            label={newMessagesLabel}
            onClick={handleButtonClick}
          />

          {/* Composer */}
          <div {...stylex.props(styles.dock, dockStyle)}>
            <div {...stylex.props(styles.dockInner, dockInnerStyle)}>
              {composer}
            </div>
          </div>
        </div>
      </div>
    </XDSChatLayoutContext.Provider>
  );
}

XDSChatLayout.displayName = 'XDSChatLayout';
