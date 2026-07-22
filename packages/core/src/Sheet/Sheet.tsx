// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Sheet.tsx
 * @input Uses React, StyleX, theme tokens, Icon/IconButton, useScrollLock,
 *   useOverlayStack, useSwipeToDismiss, mergeProps/mergeRefs, themeProps
 * @output Exports Sheet component and SheetProps
 * @position Core implementation; consumed by index.ts, tested by Sheet.test.tsx
 *
 * Edge-anchored overlay panel for inspectors, detail views, and sheets —
 * the "click a table row, see its details" pattern. Slides in from any of
 * the four edges: inline start/end (side panels) or block top/bottom
 * (full-width sheets).
 *
 * Uses the native `<dialog>` element (same precedent as Dialog):
 * - `showModal()` when `hasScrim` (default) — top-layer rendering, focus
 *   trapping, `::backdrop`, no z-index management.
 * - `show()` when `hasScrim={false}` — non-modal overlay; the page behind
 *   stays interactive (e.g. master-detail inspectors).
 *
 * Entry animation uses `@starting-style` + `transition-behavior:
 * allow-discrete` (see CLAUDE.md dialog-entry pattern); exit slides out
 * before a delayed `dialog.close()` releases the top layer and restores
 * focus to the element that opened the sheet.
 *
 * Layer integration: uses useOverlayStack for LIFO Escape ordering. Only
 * the top-most open overlay responds to Escape, whether modal or non-modal.
 * Non-modal overlays stack last-opened-on-top via stack-assigned z-indexes.
 *
 * Mobile swipe (opt-in): bottom/top sheets can be dismissed by swiping
 * along the block axis when `hasDragHandle` is set. A drag handle renders
 * at the leading edge of the panel; velocity and displacement thresholds
 * control dismissal.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Sheet/Sheet.doc.mjs (props table, features, usage)
 * - /packages/core/src/Sheet/Sheet.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Sheet/index.ts (exports if types change)
 * - /packages/core/src/index.ts (barrel export if added)
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
import {useOverlayStack, isTopOverlay} from '../hooks/useOverlayStack';
import {useSwipeToDismiss} from '../hooks/useSwipeToDismiss';
import type {SwipeDirection} from '../hooks/useSwipeToDismiss';
import {mergeProps, mergeRefs} from '../utils';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Constants
// =============================================================================

const RAIL_WIDTH = 44;

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  dialog: {
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
    display: 'none',
    transitionProperty: 'transform, max-width, display',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    transitionBehavior: 'allow-discrete',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  open: {
    display: 'flex',
  },
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
  collapsedRail: {
    maxWidth: RAIL_WIDTH,
  },
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
  contentHidden: {
    display: 'none',
  },
  controls: {
    position: 'absolute',
    insetBlockStart: spacingVars['--spacing-2'],
    insetInlineEnd: spacingVars['--spacing-2'],
    display: 'flex',
    gap: spacingVars['--spacing-1'],
    zIndex: 1,
  },
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
  dragHandle: {
    position: 'absolute',
    insetBlockStart: spacingVars['--spacing-1'],
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colorVars['--color-border'],
    cursor: 'grab',
    touchAction: 'none',
    userSelect: 'none',
  },
  dragHandleBottom: {
    insetBlockStart: spacingVars['--spacing-1'],
    insetBlockEnd: 'auto',
  },
  dragHandleTop: {
    insetBlockEnd: spacingVars['--spacing-1'],
    insetBlockStart: 'auto',
  },
});

const dynamicStyles = stylex.create({
  inlineSize: (s: string) => ({
    width: '100dvw',
    maxWidth: s,
  }),
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

export interface SheetProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the root <dialog> element */
  ref?: React.Ref<HTMLDialogElement>;

  /**
   * Whether the sheet is open. Fully controlled — pair with `onClose`.
   */
  isOpen: boolean;

  /**
   * Called when the sheet requests to be closed
   * (Escape key, scrim click, built-in close button, or swipe dismiss). The
   * caller owns the open state. When sibling overlays are open, Escape only
   * closes the top-most one.
   */
  onClose: () => void;

  /**
   * Which edge the sheet slides from.
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
   * smaller than the budget the sheet fills the axis.
   * @default 400
   */
  size?: number | string;

  /**
   * Accessible label for the sheet (required — the sheet has no
   * built-in heading to derive a name from). Also names the built-in
   * collapse/expand affordances and close button.
   */
  label: string;

  /**
   * Whether to render a modal scrim behind the sheet.
   * - `true` (default) — `showModal()`: top layer, focus trap, body scroll
   *   lock, click-outside-to-close.
   * - `false` — `show()`: non-modal overlay; the page behind stays
   *   interactive. Escape still closes while focus is inside the sheet.
   * @default true
   */
  hasScrim?: boolean;

  /**
   * Whether to render the built-in close button in the top-trailing
   * corner. Defaults to the `hasScrim` value: modal sheets get a close
   * button, non-modal sheets don't.
   * @default hasScrim
   */
  hasCloseButton?: boolean;

  /**
   * Collapse a non-modal side sheet to a narrow click-to-expand rail.
   * Only supported for non-modal (`hasScrim={false}`) sheets with
   * `side="start"/"end"`; ignored (with a dev warning) otherwise.
   * Controlled — pair with `onCollapsedChange`.
   */
  isCollapsed?: boolean;

  /**
   * Called when the built-in collapse/expand affordances are used.
   * Providing it renders a collapse toggle next to the close button while
   * expanded; the collapsed rail always expands on click.
   */
  onCollapsedChange?: (collapsed: boolean) => void;

  /**
   * Opt-in mobile swipe-to-dismiss. When true, a drag handle renders at
   * the leading edge of bottom/top sheets. Swiping along the block axis
   * beyond the dismiss threshold fires `onClose`. Ignored for
   * start/end side panels.
   * @default false
   */
  hasDragHandle?: boolean;

  /**
   * Sheet content. Rendered inside a full-height scrollable area.
   * Focus the element with `data-autofocus` on open, if present.
   */
  children: ReactNode;

  /** Test ID for the root element. */
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
 * Escape closes the top-most open overlay; focus returns to the element that
 * opened the sheet. Non-modal side sheets can collapse to a rail via
 * `isCollapsed`/`onCollapsedChange`. Bottom/top sheets optionally support
 * swipe-to-dismiss with a drag handle via `hasDragHandle`.
 *
 * @example
 * ```
 * const [selected, setSelected] = useState(null);
 * <Sheet
 *   isOpen={selected != null}
 *   onClose={() => setSelected(null)}
 *   label={`Details: ${selected?.name}`}>
 *   <HostDetails host={selected} />
 * </Sheet>
 * ```
 */
export function Sheet({
  isOpen,
  onClose,
  side = 'end',
  size = 400,
  label,
  hasScrim = true,
  hasCloseButton,
  isCollapsed,
  onCollapsedChange,
  hasDragHandle = false,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const sheetId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const isSheet = side === 'top' || side === 'bottom';
  const canCollapse = !hasScrim && !isSheet;
  const collapsed = canCollapse && isCollapsed === true;
  const showCloseButton = hasCloseButton ?? hasScrim;
  const hasSwipe = hasDragHandle && isSheet;

  // Layer system integration for coordinated Escape dismissal.
  // `isTopOverlay(sheetId)` is called directly in event handlers (not during
  // render) so the check reflects the registry state at event time — the
  // registration effect runs after render, so a render-time `isTop` boolean
  // would always be `false` on the first paint.
  const {zIndex: stackZ} = useOverlayStack({
    id: sheetId,
    isOpen,
    onClose,
    type: 'sheet',
  });

  const hasInvalidCollapse = isCollapsed != null && !canCollapse;
  useEffect(() => {
    if (hasInvalidCollapse) {
      console.error(
        '[Sheet] `isCollapsed` is only supported for non-modal sheets ' +
          '(hasScrim={false}) with side="start" or side="end". The prop ' +
          'is ignored.',
      );
    }
  }, [hasInvalidCollapse]);

  // Open/close the native dialog
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

  // Close the native dialog on unmount if still open
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  // Lock body scroll while modal
  useScrollLock(isOpen && hasScrim);

  // Escape closes — only when this sheet is the top of the overlay stack
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isTopOverlay(sheetId)) {
          onClose();
        }
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, sheetId]);

  // Native cancel event (browser Escape handling) — prevent default
  // and route through onClose so the caller's state stays the source
  // of truth. The top-stack check happens at event time.
  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (isTopOverlay(sheetId)) {
        onClose();
      }
    },
    [onClose, sheetId],
  );

  // Clicks on the ::backdrop target the <dialog> element itself
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget && hasScrim) {
        onClose();
      }
    },
    [hasScrim, onClose],
  );

  // Mobile swipe-to-dismiss
  const swipeDirection: SwipeDirection = side === 'top' ? 'up' : 'down';
  const {handleRef: swipeHandleRef, swipeStyle} = useSwipeToDismiss({
    onDismiss: onClose,
    direction: swipeDirection,
    enabled: hasSwipe,
  });

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
  const dragHandleStyle =
    side === 'bottom'
      ? styles.dragHandleBottom
      : side === 'top'
        ? styles.dragHandleTop
        : undefined;

  const {open: _open, ...safeProps} = props as Record<string, unknown>;

  return (
    <dialog
      ref={mergeRefs(ref, dialogRef)}
      aria-label={label}
      aria-modal={hasScrim ? 'true' : undefined}
      onClick={handleClick}
      onCancel={handleCancel}
      {...mergeProps(
        themeProps('sheet', {side}),
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
      style={{
        ...(hasSwipe && isOpen ? swipeStyle : {}),
        ...(style as React.CSSProperties),
      }}
      {...safeProps}>
      {/* Drag handle for mobile swipe-to-dismiss */}
      {hasSwipe && (
        <div
          ref={swipeHandleRef}
          {...stylex.props(
            styles.dragHandle,
            dragHandleStyle ?? styles.dragHandleBottom,
          )}
        />
      )}

      {/* Scrollable content area */}
      <div
        tabIndex={-1}
        {...stylex.props(styles.content, collapsed && styles.contentHidden)}>
        {children}
      </div>

      {collapsed ? (
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

Sheet.displayName = 'Sheet';
