// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Drawer.tsx
 * @input Uses React, StyleX, theme tokens, Icon/IconButton, useScrollLock/useDrawerDialogPresence, BaseProps, mergeProps/mergeRefs, themeProps
 * @output Exports Drawer component and DrawerProps
 * @position Lab implementation; consumed by index.ts, tested by Drawer.test.tsx, demonstrated in Storybook
 *
 * Overlay panel for inspectors and detail views — the "click a table row,
 * see its details" pattern. Slides in from the inline start or end edge and
 * floats above the page content: unlike a docked panel it never reflows the
 * layout underneath, it overlays it (with or without a scrim).
 *
 * Inline axis only (start/end). Block-axis sheets are BottomSheet's job;
 * a drawer is always a full-height side panel.
 *
 * Sizing is viewport-aware: `width` is the desktop budget, and below
 * the mobile breakpoint it preserves a 56px reveal of the page behind, capped
 * by the requested width (or fills the viewport with `isFullWidthOnMobile`).
 *
 * Uses the native `<dialog>` element (same precedent as Dialog/MobileNav):
 * - `showModal()` when `hasScrim` (default) — top-layer rendering, focus
 *   trapping, `::backdrop`, no z-index management.
 * - `show()` when `hasScrim={false}` — non-modal overlay; the page behind
 *   stays interactive (e.g. master-detail inspectors).
 *
 * Entry animation uses `@starting-style`; exit slides out before
 * `dialog.close()` releases the top layer and restores focus to the element
 * that opened the drawer. React owns `display` for both legs rather than a
 * discrete `display` transition, so the panel stops painting in the same
 * commit as `close()` — see the `rendered` style for why that matters.
 *
 * Sibling drawers coordinate through a module-level LIFO registry: Escape
 * closes only the top (last-opened) drawer, and non-modal drawers stack
 * last-opened-on-top via registry-assigned z-indexes.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Drawer/Drawer.doc.mjs (props table, features, usage)
 * - /packages/lab/src/Drawer/Drawer.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/Drawer/index.ts (exports if types change)
 * - /apps/storybook/stories/Drawer.stories.tsx (examples and visual coverage)
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  shadowVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {useScrollLock} from '@astryxdesign/core/hooks';
import {
  composeEventHandlers,
  mergeProps,
  mergeRefs,
  themeProps,
} from '@astryxdesign/core/utils';
import {overlayPaddingReset} from '@astryxdesign/core/Layout';
import {useDrawerDialogPresence} from './useDrawerDialogPresence';

// =============================================================================
// LIFO stacking registry (internal)
// =============================================================================

// Module-level registry of currently open drawers, in open order (last entry
// is the top of the stack). SSR-safe: only mutated inside effects. Escape
// handling consults isTopDrawer() so sibling drawers close innermost-first,
// and non-modal (show()) drawers get incrementing z-indexes so the
// last-opened one paints on top; modal drawers rely on the native top
// layer's chronological stacking instead.
type DrawerRegistryEntry = {id: string; close: () => void};

// Without the top layer (hasScrim={false} uses show(), not showModal())
// the panel needs explicit stacking. No z-index token exists in the theme;
// 1000 matches the app-level drawer convention.
const NON_MODAL_BASE_Z = 1000;

const openDrawerStack: DrawerRegistryEntry[] = [];
let registrationCounter = 0;

function registerDrawer(id: string, close: () => void): number {
  openDrawerStack.push({id, close});
  registrationCounter += 1;
  return NON_MODAL_BASE_Z + registrationCounter - 1;
}

function unregisterDrawer(id: string): void {
  const index = openDrawerStack.findIndex(entry => entry.id === id);
  if (index !== -1) {
    openDrawerStack.splice(index, 1);
  }
  if (openDrawerStack.length === 0) {
    registrationCounter = 0;
  }
}

function isTopDrawer(id: string): boolean {
  return openDrawerStack[openDrawerStack.length - 1]?.id === id;
}

// =============================================================================
// Styles
// =============================================================================

// Below this viewport width the drawer preserves a fixed reveal of the page
// behind instead of growing proportionally with the viewport. 640px is the
// repo's mobile breakpoint.
const MOBILE_BREAKPOINT = 640;

// Material's established mobile drawer pattern leaves a 56dp reveal. Using
// the same value in CSS pixels gives the overlay a stable visual relationship
// to the page behind while the requested width remains an upper bound.
const MOBILE_PAGE_REVEAL = 56;
const MOBILE_WIDTH_FULL = '100dvw';

const styles = stylex.create({
  dialog: {
    // Reset native <dialog> defaults — the dialog element IS the panel.
    position: 'fixed',
    margin: 0,
    padding: 0,
    border: 'none',
    // Square corners: the drawer is flush with the viewport edge on three
    // sides, so a radius would only ever cut the two edge-adjacent corners.
    borderRadius: 0,
    maxWidth: 'none',
    maxHeight: 'none',
    boxSizing: 'border-box',
    flexDirection: 'column',
    backgroundColor: colorVars['--color-background-surface'],
    boxShadow: shadowVars['--shadow-high'],
    overflow: 'hidden',
    overscrollBehavior: 'contain',
    outline: 'none',
    // Full-height side panel, pinned across the block axis.
    insetBlockStart: 0,
    insetBlockEnd: 0,
    height: '100dvh',
    // Closed state. `display` is owned by React (see `rendered`), not by a
    // discrete `display` transition, so only `transform` animates here.
    display: 'none',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  // Rendered while the drawer is open AND while it slides out. Applied from
  // React state, not from a discrete `display` transition: `close()` drops the
  // dialog out of the top layer, and any ancestor that establishes a
  // containing block for fixed positioning (transform, filter, container-type,
  // contain) then becomes the origin for the panel's `position: fixed`. A
  // panel still painting after `close()` therefore snaps back INTO the layout
  // and covers the page for the rest of the hold. Owning `display` lets the
  // hide land in the same commit as `close()`, so no frame is ever painted
  // outside the top layer.
  //
  // Applied via the isOpen/exit state, not :where([open]) — attribute
  // selectors have zero specificity and can lose to default styles
  // depending on CSS source order (same rationale as Dialog/MobileNav).
  rendered: {
    display: 'flex',
  },
  // start/end transforms flip under RTL so the panel always slides in from
  // the edge it is anchored to.
  end: {
    insetInlineEnd: 0,
    insetInlineStart: 'auto',
    borderInlineStartWidth: borderVars['--border-width'],
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
    transform: {
      default: 'translateX(100%)',
      ':is([dir="rtl"] *)': 'translateX(-100%)',
    },
  },
  endOpen: {
    transform: {
      default: 'translateX(0)',
      '@starting-style': {
        default: 'translateX(100%)',
        ':is([dir="rtl"] *)': 'translateX(-100%)',
      },
    },
  },
  start: {
    insetInlineStart: 0,
    insetInlineEnd: 'auto',
    borderInlineEndWidth: borderVars['--border-width'],
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
    transform: {
      default: 'translateX(-100%)',
      ':is([dir="rtl"] *)': 'translateX(100%)',
    },
  },
  startOpen: {
    transform: {
      default: 'translateX(0)',
      '@starting-style': {
        default: 'translateX(-100%)',
        ':is([dir="rtl"] *)': 'translateX(100%)',
      },
    },
  },
  // Scrim via the browser's ::backdrop pseudo-element (top layer).
  scrim: {
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      backdropFilter: 'blur(2px)',
      opacity: 0,
      transitionProperty: 'opacity',
      transitionDuration: durationVars['--duration-medium'],
      transitionTimingFunction: easeVars['--ease-standard'],
    },
    '@media (prefers-reduced-motion: reduce)': {
      '::backdrop': {
        transitionDuration: '0.01s',
      },
    },
  },
  scrimOpen: {
    '::backdrop': {
      opacity: {
        default: 1,
        '@starting-style': 0,
      },
    },
  },
  // Scrollable content area — full-bleed; consumers compose their own
  // header/body/footer padding.
  // touch-action + overscroll containment keep momentum scrolling inside
  // the panel on touch devices; the safe-area inset keeps the last row of
  // content clear of the home indicator.
  content: {
    flexGrow: 1,
    minHeight: 0,
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    touchAction: 'pan-y',
    paddingBlockEnd: 'env(safe-area-inset-bottom, 0px)',
    outline: 'none',
  },
  // Close affordance floats in the top-trailing corner, above the
  // scrollable content.
  controls: {
    position: 'absolute',
    insetBlockStart: spacingVars['--spacing-2'],
    insetInlineEnd: spacingVars['--spacing-2'],
    display: 'flex',
    gap: spacingVars['--spacing-1'],
    zIndex: 1,
  },
});

const dynamicStyles = stylex.create({
  // Width budget: the `width` prop on desktop, a share of the viewport below
  // the mobile breakpoint. maxWidth keeps a large desktop budget from
  // overflowing a narrow window.
  inlineSize: (desktopWidth: string, mobileWidth: string) => ({
    width: {
      default: desktopWidth,
      [`@media (max-width: ${MOBILE_BREAKPOINT}px)`]: mobileWidth,
    },
    maxWidth: '100dvw',
  }),
  stackZ: (z: number) => ({
    zIndex: z,
  }),
});

// =============================================================================
// Types
// =============================================================================

export interface DrawerProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the root <dialog> element */
  ref?: React.Ref<HTMLDialogElement>;

  /**
   * Whether the drawer is open. Fully controlled — pair with `onOpenChange`.
   */
  isOpen: boolean;

  /**
   * Called when the drawer requests an open-state change. Escape, scrim
   * click, and the built-in close button call it with `false`. The caller owns
   * the open state. When sibling drawers are open, Escape only closes the top
   * (last-opened) drawer.
   */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Which edge the drawer slides from.
   * - `'end'` — inline-end edge (right in LTR) — the inspector convention
   * - `'start'` — inline-start edge (left in LTR)
   * @default 'end'
   */
  side?: 'start' | 'end';

  /**
   * Desktop width budget. A number is pixels; a string is any CSS length
   * (`'50%'`, `'32rem'`). Below the mobile breakpoint (640px), this
   * remains the maximum while the drawer preserves a 56px reveal of the page
   * behind — see `isFullWidthOnMobile`.
   * @default 400
   */
  width?: number | string;

  /**
   * Whether the drawer covers the full viewport width on mobile
   * (below 640px) instead of preserving the default 56px reveal of the page
   * behind. The reveal makes the drawer read as an overlay rather than a
   * navigation.
   * @default false
   */
  isFullWidthOnMobile?: boolean;

  /**
   * Accessible label for the drawer (required — the drawer has no
   * built-in heading to derive a name from).
   */
  label: string;

  /**
   * Whether to render a modal scrim behind the drawer.
   * - `true` (default) — `showModal()`: top layer, focus trap, body scroll
   *   lock, click-outside-to-close.
   * - `false` — `show()`: non-modal overlay; the page behind stays
   *   interactive. Escape still closes while focus is inside the drawer.
   * @default true
   */
  hasScrim?: boolean;

  /**
   * Whether to render the built-in close button in the top-trailing
   * corner. Enabled by default for both modal and non-modal drawers so every
   * overlay has an obvious dismissal affordance.
   * @default true
   */
  hasCloseButton?: boolean;

  /**
   * Drawer content. Rendered inside a full-height scrollable area.
   * Focus the element with `data-autofocus` on open, if present.
   */
  children: ReactNode;

  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * An overlay panel for inspectors and detail views.
 *
 * Slides in from the logical start or end edge and floats above the page
 * using the native `<dialog>` element: modal with a scrim by default, or a
 * non-modal overlay with `hasScrim={false}` that leaves the page behind
 * interactive. `width` is the desktop budget; below 640px the panel preserves
 * a 56px page reveal without exceeding that budget (or fills the viewport
 * with `isFullWidthOnMobile`). Escape
 * closes the top-most open drawer; focus returns to the element that
 * opened it.
 *
 * @example
 * ```
 * const [selected, setSelected] = useState(null);
 * <Drawer
 *   isOpen={selected != null}
 *   onOpenChange={isOpen => !isOpen && setSelected(null)}
 *   label={`Details: ${selected?.name}`}>
 *   <HostDetails host={selected} />
 * </Drawer>
 * ```
 */
export function Drawer({
  isOpen,
  onOpenChange,
  side = 'end',
  width = 400,
  isFullWidthOnMobile = false,
  label,
  hasScrim = true,
  hasCloseButton = true,
  children,
  xstyle,
  className,
  style,
  onClick: onClickProp,
  onKeyDown: onKeyDownProp,
  ref,
  ...props
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Registry identity + latest onOpenChange (stable across re-renders so the
  // registration effect doesn't churn on every onOpenChange identity change).
  const drawerId = useId();
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);
  // z-index assigned by the registry on open (non-modal stacking only).
  const [stackZ, setStackZ] = useState(NON_MODAL_BASE_Z);
  // Whether the panel paints: true while open and for the whole slide-out.
  const [isRendered, setIsRendered] = useState(isOpen);

  // Adjusted during render, not in an effect: the panel has to be rendered in
  // the same commit that targets the open transform, or @starting-style has
  // nothing to animate from.
  if (isOpen && !isRendered) {
    setIsRendered(true);
  }

  useDrawerDialogPresence({
    dialogRef,
    isOpen,
    isModal: hasScrim,
    setIsRendered,
  });

  // LIFO registry membership: register on open, unregister on close or
  // unmount. The returned z-index stacks non-modal siblings in open order.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const z = registerDrawer(drawerId, () => onOpenChangeRef.current(false));
    setStackZ(z);
    return () => unregisterDrawer(drawerId);
  }, [isOpen, drawerId]);

  // Lock body scroll while a modal drawer is open (iOS Safari workaround).
  useScrollLock(isOpen && hasScrim);

  // Escape closes. The native `cancel` event only fires for showModal();
  // this React keydown handler covers the non-modal show() path too. Only the
  // top of the drawer stack closes, so stacked siblings peel off
  // innermost-first.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDialogElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isTopDrawer(drawerId)) {
          onOpenChange(false);
        }
      }
    },
    [onOpenChange, drawerId],
  );

  // Native cancel event (browser Escape handling) — prevent the browser
  // from closing the dialog directly and route through onOpenChange so the
  // caller's state stays the source of truth. Same top-of-stack rule as
  // the keydown path.
  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (isTopDrawer(drawerId)) {
        onOpenChange(false);
      }
    },
    [onOpenChange, drawerId],
  );

  // Clicks on the ::backdrop target the <dialog> element itself; clicks on
  // drawer content always target a child (the content area fills the panel).
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget && hasScrim) {
        onOpenChange(false);
      }
    },
    [hasScrim, onOpenChange],
  );

  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const mobileWidth = isFullWidthOnMobile
    ? MOBILE_WIDTH_FULL
    : `min(${widthValue}, calc(100dvw - ${MOBILE_PAGE_REVEAL}px))`;

  // The side the panel is ANCHORED to, which is the side it must slide back
  // out to. Latched at open, because a consumer commonly derives `side` from
  // the same state that drives `isOpen` (`side={selected?.side ?? 'end'}`):
  // that state clears on close, so the live prop flips mid-exit and the panel
  // teleports to the other edge and slides out the wrong way. Children stay
  // mounted for the exit for the same reason; so does the anchor.
  const exitSideRef = useRef(side);
  if (isOpen) {
    exitSideRef.current = side;
  }
  const anchoredSide = isOpen ? side : exitSideRef.current;

  const sideStyle = anchoredSide === 'start' ? styles.start : styles.end;
  const sideOpenStyle =
    anchoredSide === 'start' ? styles.startOpen : styles.endOpen;

  // Filter out native `open` to prevent InvalidStateError when passed
  const {open: _open, ...safeProps} = props as Record<string, unknown>;

  return (
    <dialog
      ref={mergeRefs(ref, dialogRef)}
      {...mergeProps(
        themeProps('drawer', {side: anchoredSide}),
        stylex.props(
          styles.dialog,
          overlayPaddingReset.reset,
          sideStyle,
          dynamicStyles.inlineSize(widthValue, mobileWidth),
          isRendered && styles.rendered,
          isOpen && sideOpenStyle,
          hasScrim ? styles.scrim : dynamicStyles.stackZ(stackZ),
          hasScrim && isOpen && styles.scrimOpen,
          xstyle,
        ),
        className,
        style,
      )}
      {...safeProps}
      aria-label={label}
      aria-modal={hasScrim ? 'true' : undefined}
      onClick={composeEventHandlers(onClickProp, handleClick)}
      onKeyDown={composeEventHandlers(onKeyDownProp, handleKeyDown)}
      onCancel={handleCancel}>
      {/* Scrollable content area — tabIndex so the dialog's focusing steps
          land on the panel body rather than the first button inside. */}
      <div tabIndex={-1} {...stylex.props(styles.content)}>
        {children}
      </div>
      {hasCloseButton && (
        <div {...stylex.props(styles.controls)}>
          <IconButton
            icon={<Icon icon="close" size="sm" color="inherit" />}
            label="Close"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          />
        </div>
      )}
    </dialog>
  );
}

Drawer.displayName = 'Drawer';
