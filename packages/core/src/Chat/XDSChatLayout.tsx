'use client';

/**
 * @file XDSChatLayout.tsx
 * @input Uses React, StyleX, theme tokens, XDSChatMessageList
 * @output Exports XDSChatLayout component and XDSChatLayoutProps
 * @position Layout shell for full chat interfaces — messages in page flow, composer fixed to bottom
 *
 * Arranges a chat page: messages flow naturally in the page, composer is
 * fixed to the bottom with a frosted glass backdrop. Uses a ResizeObserver
 * to adapt spacing for narrow (panel/mobile) vs wide (desktop) containers.
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
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSChatLayoutContext} from './XDSChatContext';

// =============================================================================
// Types
// =============================================================================

type Density = 'compact' | 'balanced' | 'spacious';

export interface XDSChatLayoutProps {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Message content — flows naturally in the page, scrolls with the page.
   * Typically XDSChatMessage components.
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
   * Use when the layout is embedded in a page where the scroll
   * container is a parent element or the document body:
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
    // Normal page flow, not in a scroll container
    display: 'flex',
    flexDirection: 'column',
    marginInline: 'auto',
  },

  // Message area max-width per density
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

  // Message area bottom padding to clear the fixed dock
  messageAreaPadding: {
    // Will be set dynamically via inline style
  },

  // --- Empty state ---
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 200,
  },

  // --- Blur layer — purely visual, behind composer ---
  blurLayer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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

  // --- Composer dock — interactive, no blur/mask ---
  dock: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
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

  // --- Dock inner wrapper (max-width centered) ---
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
});

// =============================================================================
// Helpers
// =============================================================================

function getDensity(width: number): Density {
  if (width < 480) return 'compact';
  if (width <= 768) return 'balanced';
  return 'spacious';
}

function hasContent(children: ReactNode): boolean {
  if (children == null || children === false) return false;
  if (Array.isArray(children) && children.length === 0) return false;
  return true;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Layout shell for full chat interfaces.
 *
 * Messages flow naturally in the page (no fixed scroll container).
 * The composer is fixed to the bottom with a frosted glass dock
 * that adapts padding via container width observation.
 *
 * @example
 * ```
 * <XDSChatLayout
 *   composer={<XDSChatComposer onSubmit={handleSubmit} />}
 *   emptyState={<EmptyState />}
 * >
 *   {messages.map(msg => <XDSChatMessage key={msg.id} {...msg} />)}
 * </XDSChatLayout>
 * ```
 */
export function XDSChatLayout({
  children,
  composer,
  emptyState,
  scrollRef: externalScrollRef,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSChatLayoutProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef =
    externalScrollRef ?? (rootRef as React.RefObject<HTMLElement | null>);
  const isSelfScrolling = !externalScrollRef;
  const layoutContextValue = useMemo(
    () => ({
      scrollContainerRef,
    }),
    [scrollContainerRef],
  );
  const [density, setDensity] = useState<Density>('balanced');
  const [dockHeight, setDockHeight] = useState(0);

  // Observe root width for density breakpoints
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setDensity(getDensity(entry.contentRect.width));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Observe dock height to set message area bottom padding
  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setDockHeight(
          entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height,
        );
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Merge refs
  const setRootRef = useCallback(
    (el: HTMLDivElement | null) => {
      (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    },
    [ref],
  );

  const showEmpty = !hasContent(children);

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
        {/* Message area — normal page flow */}
        <div
          {...stylex.props(styles.messageArea, messageAreaStyle)}
          style={{paddingBlockEnd: dockHeight + 24}}>
          {showEmpty && emptyState ? (
            <div {...stylex.props(styles.emptyState)}>{emptyState}</div>
          ) : (
            children
          )}
        </div>

        {/* Frosted glass layer — behind composer, not interactive */}
        <div {...stylex.props(styles.blurLayer, blurLayerStyle)} />

        {/* Composer dock — interactive, no blur/mask */}
        <div ref={dockRef} {...stylex.props(styles.dock, dockStyle)}>
          <div {...stylex.props(styles.dockInner, dockInnerStyle)}>
            {composer}
          </div>
        </div>
      </div>
    </XDSChatLayoutContext.Provider>
  );
}

XDSChatLayout.displayName = 'XDSChatLayout';
