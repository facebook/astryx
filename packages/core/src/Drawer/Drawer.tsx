// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Drawer.tsx
 * @input Uses React, StyleX, theme tokens, Icon/IconButton, shared focus/dismissal/depth primitives, i18n, scroll locking/dialog presence, BaseProps, merged refs/props, themeProps
 * @output Exports Drawer component and DrawerProps
 * @position Core implementation; consumed by index.ts, tested by Drawer.test.tsx, demonstrated in Storybook
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
 * - `showPopover()` when `hasScrim={false}` — non-modal top-layer overlay;
 *   the page behind stays interactive (e.g. master-detail inspectors).
 *
 * Entry animation uses `@starting-style`; exit slides out before the active
 * modal-dialog or manual-popover host releases the top layer and focus returns
 * to the element that opened the drawer. React owns `display` for both legs
 * rather than a discrete `display` transition, so the panel stops painting in
 * the same commit as the host closes — see the `rendered` style for why.
 *
 * Sibling drawers use the shared layer dismissal stack for topmost-only Escape
 * handling and the browser top layer's chronological paint order.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Drawer/Drawer.doc.mjs (props table, features, usage)
 * - /packages/core/src/Drawer/Drawer.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Drawer/index.ts (exports if types change)
 * - /apps/storybook/stories/Drawer.stories.tsx (examples and visual coverage)
 * - /packages/cli/assets/templates/blocks/components/Drawer/DrawerShowcase.tsx
 * - /packages/cli/assets/templates/blocks/components/Drawer/DrawerRowInspector.tsx
 */

import {useCallback, useRef, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  shadowVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {Icon} from '../Icon';
import {IconButton} from '../IconButton';
import {useFocusTrap, useMergedRefs, useScrollLock} from '../hooks';
import {LayerDepthProvider, useLayerDismissal} from '../Layer';
import {useTranslator} from '../i18n';
import {composeEventHandlers, mergeProps, themeProps} from '../utils';
import {overlayPaddingReset} from '../Layout';
import {useDrawerDialogPresence} from './useDrawerDialogPresence';

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
  // React state, not from a discrete `display` transition: leaving either
  // native top-layer host drops the panel back into its ordinary containing
  // context, and any ancestor that establishes a containing block for fixed
  // positioning (transform, filter, container-type, contain) then becomes the
  // origin for the panel's `position: fixed`. A panel still painting after host
  // release therefore snaps back INTO the layout and covers the page for the
  // rest of the hold. Owning `display` lets the hide land in the same commit, so
  // no frame is ever painted outside the top layer.
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
   * - `false` — `showPopover()`: non-modal top-layer overlay; the page behind
   *   stays interactive. Escape still closes through the shared layer stack.
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
  const {containerRef: focusTrapRef} = useFocusTrap<HTMLDialogElement>({
    isActive: isOpen && hasScrim,
  });
  const mergedDialogRef = useMergedRefs(ref, dialogRef, focusTrapRef);
  const t = useTranslator();
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

  const handleDismiss = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // The shared stack owns Escape delivery across every overlay family. The
  // provider below gives layers opened from Drawer content a greater logical
  // depth even when they render elsewhere in the DOM or browser top layer.
  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    // The native host stays present through the slide-out. Keep this entry on
    // the stack until the same commit that hides the host, so a second Escape
    // cannot fall through to a lower layer during the exit animation.
    isActive: isRendered,
    onDismiss: handleDismiss,
    getContainer: () => dialogRef.current,
  });

  // Lock body scroll while a modal drawer is open (iOS Safari workaround).
  useScrollLock(isOpen && hasScrim);

  // A modal dialog's native cancel event is a platform close request (for
  // example Android Back). Keep controlled state authoritative and apply the
  // same top-most/IME rules as the shared Escape listener.
  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (shouldDismissOnCloseRequest()) {
        handleDismiss();
      }
    },
    [handleDismiss, shouldDismissOnCloseRequest],
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
      ref={mergedDialogRef}
      {...mergeProps(
        themeProps('drawer', {side: anchoredSide}),
        stylex.props(
          styles.dialog,
          overlayPaddingReset.reset,
          sideStyle,
          dynamicStyles.inlineSize(widthValue, mobileWidth),
          isRendered && styles.rendered,
          isOpen && sideOpenStyle,
          hasScrim && styles.scrim,
          hasScrim && isOpen && styles.scrimOpen,
          xstyle,
        ),
        className,
        style,
      )}
      {...safeProps}
      popover={hasScrim ? undefined : 'manual'}
      aria-label={label}
      aria-modal={hasScrim ? 'true' : undefined}
      onClick={composeEventHandlers(onClickProp, handleClick)}
      onKeyDown={onKeyDownProp}
      onCancel={handleCancel}>
      <LayerDepthProvider>
        {/* Scrollable content area — tabIndex so the dialog's focusing steps
            land on the panel body rather than the first button inside. */}
        <div tabIndex={-1} {...stylex.props(styles.content)}>
          {children}
        </div>
        {hasCloseButton && (
          <div {...stylex.props(styles.controls)}>
            <IconButton
              icon={<Icon icon="close" size="sm" color="inherit" />}
              label={t('@astryx.dialog.close')}
              variant="ghost"
              onClick={handleDismiss}
            />
          </div>
        )}
      </LayerDepthProvider>
    </dialog>
  );
}

Drawer.displayName = 'Drawer';
