// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSChatLayout.tsx
 * @input Uses React, StyleX, theme tokens, useXDSChatStreamScroll, useXDSChatNewMessages
 * @output Exports XDSChatLayout component and XDSChatLayoutProps
 * @position Layout shell for full chat interfaces — messages in page flow, composer fixed to bottom
 *
 * Structural layout only — scroll behavior is delegated to hooks.
 * Provides the scroll container ref and content ref, renders the
 * scroll-to-bottom button, frosted glass dock, and message area.
 *
 * Density (compact/balanced/spacious) is handled entirely via CSS
 * container queries — no JS measurement or ResizeObserver needed.
 * This eliminates layout flashes on mount/remount.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/ChatLayout.stories.tsx
 * - /packages/cli/templates/blocks/components/ChatLayout/ (block examples)
 */

import {type ReactNode, useMemo, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import {useXDSChatStreamScroll} from './useXDSChatStreamScroll';
import {useXDSChatNewMessages} from './useXDSChatNewMessages';
import {XDSChatLayoutScrollButton} from './XDSChatLayoutScrollButton';
import {XDSChatLayoutContext} from './XDSChatContext';

// =============================================================================
// Types
// =============================================================================

type Density = 'compact' | 'balanced' | 'spacious';

/** Imperative handle for XDSChatLayout scroll controls. */
export interface XDSChatLayoutHandle {
  /** Scroll a message to the top and unlock for stream-in. */
  /** Scroll to bottom and re-lock. */
  scrollToBottom: () => void;
  /** Navigate to a message, no lock change. */
  scrollToMessage: (el: HTMLElement) => void;
  /** Scroll to the last message. */
  scrollToLastMessage: () => void;
}

export interface XDSChatLayoutProps extends XDSBaseProps<HTMLDivElement> {
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
   * Scroll-to-bottom button rendered above the composer in the dock.
   * Defaults to XDSChatLayoutScrollButton with useXDSChatStreamScroll.
   * Pass a custom ReactNode to override, or `null` to hide.
   */
  scrollButton?: ReactNode | null;

  /**
   * External scroll container ref. When provided, auto-scroll and
   * scroll-to-bottom target this element instead of the layout root.
   *
   * @example
   * ```
   * const scrollRef = useRef(document.documentElement);
   * <XDSChatLayout scrollRef={scrollRef} composer={...}>...</XDSChatLayout>
   * ```
   *
   * When omitted, the layout root itself is the scroll container.
   */
  scrollRef?: React.RefObject<HTMLElement | null>;

  /**
   * Override the automatic density. When set, forces the layout to use
   * the specified density regardless of container width.
   *
   * When omitted, density is determined automatically via CSS container
   * queries (compact < 480px, balanced 480–768px, spacious > 768px).
   */
  density?: Density;
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
    // Hide scrollbar during programmatic scroll animation
    // to prevent flash. Restored when animation settles.
    scrollbarWidth: {
      default: null,
      ':is([data-xds-scrolling])': 'none',
    },
  },

  messageArea: {
    display: 'flex',
    flexDirection: 'column',
    marginInline: 'auto',
    minHeight: '100%',
    paddingBlockEnd: spacingVars['--spacing-6'],
    width: '100%',
    maxWidth: 800,
    paddingInline: {
      default: 0,
      '@container (min-width: 769px)': spacingVars['--spacing-4'],
    },
  },

  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 200,
  },

  // --- Dock container ---
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

  blurLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    height: {
      default: 100,
      '@container (max-width: 479px)': 80,
      '@container (min-width: 769px)': 120,
    },
    maskImage: {
      default: 'linear-gradient(to bottom, transparent, black 36px)',
      '@container (max-width: 479px)':
        'linear-gradient(to bottom, transparent, black 24px)',
      '@container (min-width: 769px)':
        'linear-gradient(to bottom, transparent, black 48px)',
    },
    WebkitMaskImage: {
      default: 'linear-gradient(to bottom, transparent, black 36px)',
      '@container (max-width: 479px)':
        'linear-gradient(to bottom, transparent, black 24px)',
      '@container (min-width: 769px)':
        'linear-gradient(to bottom, transparent, black 48px)',
    },
  },

  dock: {
    position: 'relative',
    zIndex: 1,
    pointerEvents: 'auto',
    paddingInline: {
      default: spacingVars['--spacing-3'],
      '@container (max-width: 479px)': spacingVars['--spacing-2'],
      '@container (min-width: 769px)': spacingVars['--spacing-4'],
    },
    paddingBlockEnd: {
      default: spacingVars['--spacing-3'],
      '@container (max-width: 479px)': spacingVars['--spacing-2'],
    },
  },

  dockInner: {
    marginInline: 'auto',
    width: '100%',
    maxWidth: 800,
  },

  // --- Forced density overrides (disable container queries) ---
  messageAreaCompact: {
    maxWidth: '100%',
    paddingInline: 0,
  },
  messageAreaBalanced: {
    maxWidth: '100%',
    paddingInline: 0,
  },
  messageAreaSpacious: {
    maxWidth: 800,
    paddingInline: spacingVars['--spacing-4'],
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

  dockInnerCompact: {
    maxWidth: '100%',
  },
  dockInnerBalanced: {
    maxWidth: '100%',
  },
  dockInnerSpacious: {
    maxWidth: 800,
  },
});

// =============================================================================
// Helpers
// =============================================================================

function hasVisibleContent(children: ReactNode): boolean {
  if (children == null || children === false) {
    return false;
  }
  if (Array.isArray(children) && children.length === 0) {
    return false;
  }
  return true;
}

// =============================================================================
// Component
// =============================================================================

export function XDSChatLayout({
  children,
  composer,
  density,
  emptyState,
  scrollButton,
  scrollRef: externalScrollRef,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSChatLayoutProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const scrollContainerRef = externalScrollRef ?? rootRef;
  const isSelfScrolling = !externalScrollRef;

  // --- Default scroll behavior ---
  const scroll = useXDSChatStreamScroll({scrollRef: scrollContainerRef});
  const newMsgs = useXDSChatNewMessages({
    isLocked: scroll.isLocked,
    onResize: scroll.scrollIfLocked,
  });

  const defaultScrollButton = (
    <XDSChatLayoutScrollButton
      isVisible={scroll.isScrolledUp || newMsgs.hasNewMessages}
      label={newMsgs.hasNewMessages ? 'New messages' : undefined}
      onClick={() => {
        newMsgs.dismiss();
        scroll.scrollToBottom();
      }}
    />
  );

  // --- Layout context ---
  const layoutContext = useMemo(
    () => ({scrollContainerRef, contentRef: newMsgs.contentRef}),
    [scrollContainerRef, newMsgs.contentRef],
  );

  // --- Derived styles ---
  const showEmpty = !hasVisibleContent(children);

  const messageAreaStyle = density
    ? density === 'compact'
      ? styles.messageAreaCompact
      : density === 'spacious'
        ? styles.messageAreaSpacious
        : styles.messageAreaBalanced
    : null;

  const blurLayerStyle = density
    ? density === 'compact'
      ? styles.blurLayerCompact
      : density === 'spacious'
        ? styles.blurLayerSpacious
        : styles.blurLayerBalanced
    : null;

  const dockStyle = density
    ? density === 'compact'
      ? styles.dockCompact
      : density === 'spacious'
        ? styles.dockSpacious
        : styles.dockBalanced
    : null;

  const dockInnerStyle = density
    ? density === 'compact'
      ? styles.dockInnerCompact
      : density === 'spacious'
        ? styles.dockInnerSpacious
        : styles.dockInnerBalanced
    : null;

  return (
    <XDSChatLayoutContext value={layoutContext}>
      <div
        ref={mergeRefs(ref, rootRef)}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('chat-layout', density ? {density} : undefined),
          stylex.props(
            styles.root,
            isSelfScrolling && styles.rootScrollable,
            xstyle,
          ),
          className,
          style,
        )}>
        {/* Message area */}
        <div {...stylex.props(styles.messageArea, messageAreaStyle)}>
          {showEmpty && emptyState ? (
            <div {...stylex.props(styles.emptyState)}>{emptyState}</div>
          ) : (
            children
          )}
        </div>

        {/* Dock container — sticky/fixed, holds blur + scroll button + composer */}
        <div
          {...stylex.props(
            styles.dockContainer,
            isSelfScrolling
              ? styles.dockContainerSticky
              : styles.dockContainerFixed,
          )}>
          {/* Scroll-to-bottom button */}
          {scrollButton === undefined ? defaultScrollButton : scrollButton}

          {/* Frosted glass layer */}
          <div {...stylex.props(styles.blurLayer, blurLayerStyle)} />

          {/* Composer */}
          <div {...stylex.props(styles.dock, dockStyle)}>
            <div {...stylex.props(styles.dockInner, dockInnerStyle)}>
              {composer}
            </div>
          </div>
        </div>
      </div>
    </XDSChatLayoutContext>
  );
}

XDSChatLayout.displayName = 'XDSChatLayout';
