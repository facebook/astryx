// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Drawer.tsx
 * @input Uses React, StyleX, theme tokens, Icon/IconButton, useScrollLock, BaseProps, mergeProps/mergeRefs, themeProps
 * @output Exports Drawer component and DrawerProps
 * @position Core implementation; consumed by index.ts, tested by Drawer.test.tsx
 *
 * Edge-anchored overlay panel for inspectors, detail views, and sheets —
 * the "click a table row, see its details" pattern. Slides in from any of
 * the four edges: inline start/end (side panels) or block top/bottom
 * (full-width sheets).
 *
 * Uses the native `<dialog>` element (same precedent as Dialog/MobileNav):
 * - `showModal()` when `hasScrim` (default) — top-layer rendering, focus
 *   trapping, `::backdrop`, no z-index management.
 * - `show()` when `hasScrim={false}` — non-modal overlay; the page behind
 *   stays interactive (e.g. master-detail inspectors).
 *
 * Entry animation uses `@starting-style` + `transition-behavior:
 * allow-discrete` (see CLAUDE.md dialog-entry pattern); exit slides out
 * before a delayed `dialog.close()` releases the top layer and restores
 * focus to the element that opened the drawer.
 *
 * Sibling drawers coordinate through a module-level LIFO registry: Escape
 * closes only the top (last-opened) drawer, and non-modal drawers stack
 * last-opened-on-top via registry-assigned z-indexes.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Drawer/Drawer.doc.mjs (props table, features, usage)
 * - /packages/core/src/Drawer/Drawer.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Drawer/index.ts (exports if types change)
 * - /packages/cli/templates/blocks/components/Drawer/ (showcase blocks)
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
import type {BaseProps} from '../BaseProps';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  shadowVars,
  spacingVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {Icon} from '../Icon';
import {IconButton} from '../IconButton';
import {useScrollLock} from '../hooks/useScrollLock';
import {mergeProps, mergeRefs} from '../utils';
import {themeProps} from '../utils/themeProps';

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

// Structural rail width when collapsed — wide enough for a 44px touch
// target, matching the raw-number convention used for the size default.
const RAIL_WIDTH = 44;

const styles = stylex.create({
  dialog: {
    // Reset native <dialog> defaults — the dialog element IS the panel.
    position: 'fixed',
    margin: 0,
    padding: 0,
    border: 'none',
    maxWidth: 'none',
    maxHeight: 'none',
    boxSizing: 'border-box',
    flexDirection: 'column',
    backgroundColor: colorVars['--color-background-surface'],
    boxShadow: shadowVars['--shadow-high'],
    overflow: 'hidden',
    overscrollBehavior: 'contain',
    outline: 'none',
    // Closed state. `display` participates in the transition with
    // allow-discrete so it flips to none only after the slide-out finishes
    // (@starting-style covers the none -> flex entry). max-width animates
    // the collapse-to-rail transition.
    display: 'none',
    transitionProperty: 'transform, max-width, display',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    transitionBehavior: 'allow-discrete',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  // Open state applied via isOpen prop, not :where([open]) — attribute
  // selectors have zero specificity and can lose to default styles
  // depending on CSS source order (same rationale as Dialog/MobileNav).
  open: {
    display: 'flex',
  },
  // Inline-axis panels (start/end): full height, pinned to one inline edge.
  // start/end transforms flip under RTL; top/bottom (block axis) need no
  // flip because the block axis is direction-safe.
  end: {
    insetBlockStart: 0,
    insetBlockEnd: 0,
    insetInlineEnd: 0,
    insetInlineStart: 'auto',
    height: '100dvh',
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
    insetBlockStart: 0,
    insetBlockEnd: 0,
    insetInlineStart: 0,
    insetInlineEnd: 'auto',
    height: '100dvh',
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
  // Block-axis sheets (top/bottom): full width, pinned to one block edge.
  // width must be explicit — the UA stylesheet gives <dialog>
  // `width: fit-content`, which beats the insetInline: 0 stretch and
  // would leave the sheet content-width in a corner.
  top: {
    width: '100dvw',
    insetInlineStart: 0,
    insetInlineEnd: 0,
    insetBlockStart: 0,
    insetBlockEnd: 'auto',
    borderBlockEndWidth: borderVars['--border-width'],
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-border'],
    transform: 'translateY(-100%)',
  },
  topOpen: {
    transform: {
      default: 'translateY(0)',
      '@starting-style': 'translateY(-100%)',
    },
  },
  bottom: {
    width: '100dvw',
    insetInlineStart: 0,
    insetInlineEnd: 0,
    insetBlockEnd: 0,
    insetBlockStart: 'auto',
    borderBlockStartWidth: borderVars['--border-width'],
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border'],
    transform: 'translateY(100%)',
  },
  bottomOpen: {
    transform: {
      default: 'translateY(0)',
      '@starting-style': 'translateY(100%)',
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
  // Collapsed rail: the whole panel shrinks to a narrow strip; max-width
  // participates in the base transition so expand/collapse animates.
  collapsedRail: {
    maxWidth: RAIL_WIDTH,
  },
  // Scrollable content area — full-bleed; consumers compose their own
  // header/body/footer padding (see Drawer blocks for the pattern).
  content: {
    flexGrow: 1,
    minHeight: 0,
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    touchAction: 'pan-y',
    outline: 'none',
  },
  // Children stay mounted while collapsed (state is preserved); only the
  // presentation is hidden.
  contentHidden: {
    display: 'none',
  },
  // Close/collapse affordances float in the top-trailing corner, above the
  // scrollable content.
  controls: {
    position: 'absolute',
    insetBlockStart: spacingVars['--spacing-2'],
    insetInlineEnd: spacingVars['--spacing-2'],
    display: 'flex',
    gap: spacingVars['--spacing-1'],
    zIndex: 1,
  },
  // Full-size expand button shown while collapsed. The label reads
  // vertically (vertical-rl matches right-side rail convention; flipped
  // 180deg on the start side so the text still reads top-down).
  railButton: {
    appearance: 'none',
    borderStyle: 'none',
    margin: 0,
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-1'],
    flexGrow: 1,
    width: '100%',
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': colorVars['--color-background-muted'],
    },
    color: colorVars['--color-text-secondary'],
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: typeScaleVars['--text-label-weight'],
    lineHeight: typeScaleVars['--text-label-leading'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    writingMode: 'vertical-rl',
    outline: 'none',
  },
  railButtonStart: {
    transform: 'rotate(180deg)',
  },
});

const dynamicStyles = stylex.create({
  // Inline-axis budget (start/end): full width on viewports narrower than
  // the budget (reference drawers collapse to a full overlay on small
  // screens).
  inlineSize: (s: string) => ({
    width: '100dvw',
    maxWidth: s,
  }),
  // Block-axis budget (top/bottom sheets): height caps at the budget,
  // full-height on shorter viewports — mirrors the inline-axis approach.
  // (Full-bleed width lives in the static top/bottom side styles.)
  blockSize: (s: string) => ({
    height: '100dvh',
    maxHeight: s,
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
   * Whether the drawer is open. Fully controlled — pair with `onClose`.
   */
  isOpen: boolean;

  /**
   * Called when the drawer requests to be closed
   * (Escape key, scrim click, built-in close button). The caller owns the
   * open state. When sibling drawers are open, Escape only closes the
   * top (last-opened) drawer.
   */
  onClose: () => void;

  /**
   * Which edge the drawer slides from.
   * - `'end'` — inline-end edge (right in LTR) — the inspector convention
   * - `'start'` — inline-start edge (left in LTR)
   * - `'top'` / `'bottom'` — full-width sheets on the block axis
   * @default 'end'
   */
  side?: 'start' | 'end' | 'top' | 'bottom';

  /**
   * Size budget of the panel along its slide axis: width for
   * `side="start"/"end"`, height for `side="top"/"bottom"`. A number is
   * pixels; a string is any CSS length (`'50%'`, `'40dvh'`). On viewports
   * smaller than the budget the drawer fills the axis.
   * @default 400
   */
  size?: number | string;

  /**
   * Accessible label for the drawer (required — the drawer has no
   * built-in heading to derive a name from). Also names the built-in
   * collapse/expand affordances.
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
   * corner. Defaults to the `hasScrim` value: modal drawers get a close
   * button, non-modal drawers don't.
   * @default hasScrim
   */
  hasCloseButton?: boolean;

  /**
   * Collapse the drawer to a narrow click-to-expand rail. Only supported
   * for non-modal (`hasScrim={false}`) drawers with `side="start"/"end"`;
   * ignored (with a dev warning) otherwise. Controlled — pair with
   * `onCollapsedChange`.
   */
  isCollapsed?: boolean;

  /**
   * Called when the built-in collapse/expand affordances are used.
   * Providing it renders a collapse toggle next to the close button while
   * expanded; the collapsed rail always expands on click.
   */
  onCollapsedChange?: (collapsed: boolean) => void;

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
 * An edge-anchored overlay panel for inspectors, detail views, and sheets.
 *
 * Slides in from the logical start/end edge (side panel) or the top/bottom
 * edge (full-width sheet) using the native `<dialog>` element: modal with a
 * scrim by default, or a non-modal inline overlay with `hasScrim={false}`.
 * Escape closes the top-most open drawer; focus returns to the element that
 * opened the drawer. Non-modal side drawers can collapse to a rail via
 * `isCollapsed`/`onCollapsedChange`.
 *
 * @example
 * ```
 * const [selected, setSelected] = useState(null);
 * <Drawer
 *   isOpen={selected != null}
 *   onClose={() => setSelected(null)}
 *   label={`Details: ${selected?.name}`}>
 *   <HostDetails host={selected} />
 * </Drawer>
 * ```
 */
export function Drawer({
  isOpen,
  onClose,
  side = 'end',
  size = 400,
  label,
  hasScrim = true,
  hasCloseButton,
  isCollapsed,
  onCollapsedChange,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  // Element focused when the drawer opened — restored on close.
  const triggerElementRef = useRef<HTMLElement | null>(null);
  // Registry identity + latest onClose (stable across re-renders so the
  // registration effect doesn't churn on every onClose identity change).
  const drawerId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  // z-index assigned by the registry on open (non-modal stacking only).
  const [stackZ, setStackZ] = useState(NON_MODAL_BASE_Z);

  const isSheet = side === 'top' || side === 'bottom';
  // Collapse only makes sense for a persistent (non-modal) side panel.
  const canCollapse = !hasScrim && !isSheet;
  const collapsed = canCollapse && isCollapsed === true;
  const showCloseButton = hasCloseButton ?? hasScrim;

  // Dev warning for unsupported collapse combinations (repo idiom:
  // console.error, see BaseTable plugin errors).
  const hasInvalidCollapse = isCollapsed != null && !canCollapse;
  useEffect(() => {
    if (hasInvalidCollapse) {
      console.error(
        '[Drawer] `isCollapsed` is only supported for non-modal drawers ' +
          '(hasScrim={false}) with side="start" or side="end". The prop is ' +
          'ignored.',
      );
    }
  }, [hasInvalidCollapse]);

  // Open/close the native dialog. close() is delayed so the slide-out
  // transition can play; focus restore happens after close() because a
  // modal dialog makes the rest of the document inert (focus() on the
  // trigger would silently fail while the dialog is still open).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (isOpen) {
      if (!dialog.open) {
        triggerElementRef.current =
          document.activeElement as HTMLElement | null;
        if (hasScrim) {
          dialog.showModal();
        } else {
          dialog.show();
        }
        // React's autoFocus calls .focus() during commit, before the dialog
        // is shown, so it silently fails — honor data-autofocus instead
        // (same contract as Dialog).
        const autofocusTarget =
          dialog.querySelector<HTMLElement>('[data-autofocus]');
        if (autofocusTarget) {
          autofocusTarget.focus();
        }
      }
    } else if (dialog.open) {
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches
        ? 10
        : 250;
      closeTimeoutRef.current = setTimeout(() => {
        dialog.close();
        // Return focus to the element that opened the drawer.
        triggerElementRef.current?.focus();
        triggerElementRef.current = null;
      }, duration);
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [isOpen, hasScrim]);

  // Close the native dialog on unmount if it's still open. When the drawer
  // is mounted inside an <Activity> that flips to mode="hidden", React runs
  // effect cleanups (with a stale isOpen) instead of re-running the effect
  // with isOpen=false — leaving the <dialog> `open` would skip showModal()
  // on the next open and the drawer could never be re-opened (see
  // MobileNavReopen.test.tsx for the original repro). This must be a
  // separate unmount-only effect: putting it in the open/close effect above
  // would close the dialog on every isOpen flip and cut off the delayed
  // slide-out close.
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  // LIFO registry membership: register on open, unregister on close or
  // unmount. The returned z-index stacks non-modal siblings in open order.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const z = registerDrawer(drawerId, () => onCloseRef.current());
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- stack position is only known once the registry assigns it on open
    setStackZ(z);
    return () => unregisterDrawer(drawerId);
  }, [isOpen, drawerId]);

  // Lock body scroll while a modal drawer is open (iOS Safari workaround).
  useScrollLock(isOpen && hasScrim);

  // Escape closes. The native `cancel` event only fires for showModal();
  // this keydown handler covers the non-modal show() path too. Only the
  // top of the drawer stack closes, so stacked siblings peel off
  // innermost-first.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isTopDrawer(drawerId)) {
          onClose();
        }
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, drawerId]);

  // Native cancel event (browser Escape handling) — prevent the browser
  // from closing the dialog directly and route through onClose so the
  // caller's state stays the source of truth. Same top-of-stack rule as
  // the keydown path.
  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (isTopDrawer(drawerId)) {
        onClose();
      }
    },
    [onClose, drawerId],
  );

  // Clicks on the ::backdrop target the <dialog> element itself; clicks on
  // drawer content always target a child (the content area fills the panel).
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget && hasScrim) {
        onClose();
      }
    },
    [hasScrim, onClose],
  );

  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  const sideStyle = {
    start: styles.start,
    end: styles.end,
    top: styles.top,
    bottom: styles.bottom,
  }[side];
  const sideOpenStyle = {
    start: styles.startOpen,
    end: styles.endOpen,
    top: styles.topOpen,
    bottom: styles.bottomOpen,
  }[side];

  // Filter out native `open` to prevent InvalidStateError when passed
  const {open: _open, ...safeProps} = props as Record<string, unknown>;

  return (
    <dialog
      ref={mergeRefs(ref, dialogRef)}
      aria-label={label}
      aria-modal={hasScrim ? 'true' : undefined}
      onClick={handleClick}
      onCancel={handleCancel}
      {...mergeProps(
        themeProps('drawer', {side}),
        stylex.props(
          styles.dialog,
          sideStyle,
          isSheet
            ? dynamicStyles.blockSize(sizeValue)
            : dynamicStyles.inlineSize(sizeValue),
          isOpen && styles.open,
          isOpen && sideOpenStyle,
          hasScrim ? styles.scrim : dynamicStyles.stackZ(stackZ),
          hasScrim && isOpen && styles.scrimOpen,
          collapsed && styles.collapsedRail,
          xstyle,
        ),
        className,
        style,
      )}
      {...safeProps}>
      {/* Scrollable content area — tabIndex so the dialog's focusing steps
          land on the panel body rather than the first button inside.
          Children stay mounted while collapsed so their state survives. */}
      <div
        tabIndex={-1}
        {...stylex.props(styles.content, collapsed && styles.contentHidden)}>
        {children}
      </div>
      {collapsed ? (
        // Collapsed rail: one full-size expand button with the label
        // reading vertically.
        <button
          type="button"
          aria-label={`Expand ${label}`}
          onClick={() => onCollapsedChange?.(false)}
          {...stylex.props(
            styles.railButton,
            side === 'start' && styles.railButtonStart,
          )}>
          {label}
        </button>
      ) : (
        (showCloseButton || (canCollapse && onCollapsedChange != null)) && (
          <div {...stylex.props(styles.controls)}>
            {canCollapse && onCollapsedChange != null && (
              <IconButton
                icon={
                  <Icon
                    icon={side === 'start' ? 'chevronLeft' : 'chevronRight'}
                    size="sm"
                    color="inherit"
                  />
                }
                label={`Collapse ${label}`}
                variant="ghost"
                onClick={() => onCollapsedChange(true)}
              />
            )}
            {showCloseButton && (
              <IconButton
                icon={<Icon icon="close" size="sm" color="inherit" />}
                label="Close"
                variant="ghost"
                onClick={onClose}
              />
            )}
          </div>
        )
      )}
    </dialog>
  );
}

Drawer.displayName = 'Drawer';
