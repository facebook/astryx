// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheet.tsx
 * @input Uses React, StyleX, theme tokens, Drawer, useSheetGestures, themeProps
 * @output Exports BottomSheet component and BottomSheetProps
 * @position Lab implementation; consumed by index.ts, tested by BottomSheet.test.tsx, demonstrated in Storybook
 *
 * A mobile touch surface that rises from the bottom edge with a grab handle
 * and swipe-to-dismiss. Built ON TOP OF the lab Drawer's native `<dialog>`
 * engine (`side="bottom"`) rather than forking it — Drawer owns
 * showModal/show, the open/close slide animation, focus trap + restore,
 * scroll lock, the Escape/scrim contract, and the LIFO overlay registry.
 * BottomSheet layers the grab handle and the drag-to-dismiss gesture on top,
 * inside the dialog.
 *
 * The gesture translate is applied to an inner sheet wrapper, not the
 * `<dialog>` itself, so Drawer owns the open/close slide and the drag
 * translates within it without the two transforms fighting.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/BottomSheet/BottomSheet.doc.mjs (props table, features, usage)
 * - /packages/lab/src/BottomSheet/BottomSheet.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/BottomSheet/index.ts (exports if types change)
 * - /apps/storybook/stories/BottomSheet.stories.tsx (examples and visual coverage)
 */

import {useCallback, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {
  colorVars,
  radiusVars,
  sizeVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {Drawer} from '../Drawer';
import {useSheetGestures} from './useSheetGestures';

// Detent fractions of the viewport the sheet can rest at, ascending
// (peek <-> mid <-> full). Near-duplicate detents (e.g. a content-hugging
// height that lands next to one of these) are de-duped downstream, so it's
// safe to offer a full set; the gesture hook keeps only those shorter than
// the rendered sheet.
const SNAP_FRACTIONS = [0.3, 0.6, 0.92];

/**
 * Height budget for each named size, as a fraction of the viewport:
 * - `hug` — fits its content, never taller than 90%.
 * - `capped` — a scrolling mid-height panel (62%).
 * - `tall` — a pinned near-full panel (92%); use when content streams in so
 *   the sheet doesn't resize under the user.
 */
const HEIGHT_BUDGETS = {
  hug: '90dvh', // upper bound only; the sheet hugs its content beneath it
  capped: '62dvh',
  tall: '92dvh',
} as const;

export type BottomSheetHeight = keyof typeof HEIGHT_BUDGETS;

// Sheets on wide touch devices (tablets) shouldn't stretch edge to edge;
// cap and center them. Matches the `sm` layout breakpoint. On phones the
// viewport is narrower than this, so the sheet stays full-width.
const MAX_SHEET_WIDTH = 640;

// Overscroll allowance (px): the sheet extends this much lower than the
// viewport as reserved bottom padding, so a small upward drag past fully-open
// reveals padding instead of clipping the top. Passed to the gesture hook as
// its overscroll cap so the drag limit and the reserved padding stay in step.
const OVERSCROLL_PADDING = 48;

// Grab-handle sizing, on the spacing scale. The pill sits in a short reserved
// row right under the sheet's rounded top, but the pointer hit box is a
// comfortable 44px (`--spacing-11`; Apple HIG, well above WCAG 2.2 SC 2.5.8's
// 24px floor). The hit box is anchored at the top so the pill stays visible;
// its extra height overlaps the content via a negative bottom margin — so the
// large target reserves only a short row in layout. That reserved space was
// the gap between the handle and the heading.
// Grab-handle sizing, on the spacing scale. The pill sits in a short reserved
// row right under the sheet's rounded top, but the pointer hit box is a tall,
// full-width 48px strip (`--spacing-12`; twice WCAG 2.2 SC 2.5.8's 24px floor)
// so it's easy to land on. The <dialog> clips overflow above the rounded top,
// so the extra target height extends DOWNWARD, overlapping the top of the
// content via a negative bottom margin — the hit box grows without reserving
// layout space or leaving a gap before the heading.
const HANDLE_HIT_HEIGHT = spacingVars['--spacing-12']; // 48px target strip
const HANDLE_PILL_INSET = spacingVars['--spacing-3']; // 12px above the pill
// Overlap = hit height − reserved row (48 − 20). Expressed as tokens so it
// tracks the scale rather than a magic pixel value.
const HANDLE_OVERLAP = `calc(-1 * (${spacingVars['--spacing-12']} - ${spacingVars['--spacing-5']}))`;

/**
 * Default snap detents in px, resolved against the *visual* viewport (like
 * iOS detents), so a mid rest point is ~half the screen regardless of the
 * sheet's own height budget. Read lazily at drag start — no persistent
 * listener — so it reflects the live viewport after a rotation or the
 * virtual keyboard opening. SSR-safe: returns `[]` off the client, so the
 * gesture hook simply has no extra detents until the first interaction. The
 * hook keeps only detents shorter than the measured sheet and always treats
 * the full height as the tallest detent.
 */
function defaultSnapHeights(): number[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const vh = window.visualViewport?.height ?? window.innerHeight;
  return SNAP_FRACTIONS.map(f => f * vh);
}

const styles = stylex.create({
  // Inner wrapper that carries the live drag translate AND the visible sheet
  // surface (background, rounded top, width cap). The translate must live on
  // the painted surface — not the <dialog> — so the whole sheet follows the
  // swipe instead of the content sliding out of a fixed white panel. Drawer
  // owns the open/close slide on the <dialog>; this wrapper adds the gesture
  // offset within it so the two transforms don't fight. Safe-area padding
  // clears the home indicator on notched devices.
  sheet: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
    width: '100%',
    maxWidth: MAX_SHEET_WIDTH,
    marginInline: 'auto',
    backgroundColor: colorVars['--color-background-surface'],
    borderStartStartRadius: radiusVars['--radius-page'],
    borderStartEndRadius: radiusVars['--radius-page'],
    overflow: 'hidden',
    // Home-indicator clearance plus an overscroll allowance: the sheet extends
    // OVERSCROLL_MAX px lower than the viewport so a small upward drag past
    // fully-open reveals this reserved padding instead of clipping the top.
    paddingBlockEnd: `calc(env(safe-area-inset-bottom, 0px) + ${OVERSCROLL_PADDING}px)`,
    willChange: 'transform',
  },
  // Neutralize Drawer's <dialog> surface so only the swipeable wrapper paints.
  // Without this the dialog's white background + shadow stay fixed while the
  // wrapper slides, leaving a static panel behind the drag. The scrim behind
  // the sheet provides the depth separation a shadow would.
  dialogSurface: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderBlockStartWidth: 0,
  },
  // Scrim fade hint: the scrim is Drawer's ::backdrop. We override its opacity
  // with a custom property (default 1, so the resting/open scrim is unchanged)
  // that the drag handler lowers toward 0 as the sheet enters the close zone —
  // a live cue that releasing will dismiss. Drawer's own opacity transition on
  // the ::backdrop eases the value back when the drag ends.
  scrimFade: {
    '::backdrop': {
      opacity: 'var(--_sheet-scrim-opacity, 1)',
    },
  },
  handleBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    // 44px pointer hit box that overlaps into the top of the content via a
    // negative bottom margin, so only a short row is reserved in layout — no
    // gap before the heading. The pill is anchored near the top of the box.
    height: HANDLE_HIT_HEIGHT,
    paddingBlockStart: HANDLE_PILL_INSET,
    marginBlockEnd: HANDLE_OVERLAP,
    touchAction: 'none',
    cursor: 'grab',
  },
  handlePill: {
    width: sizeVars['--size-element-lg'],
    height: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-border'],
  },
  body: {
    flexGrow: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    // Allow native vertical scrolling of the content; the overscroll-at-top
    // pull-down is handled via pointer events, not by blocking touch-action.
    touchAction: 'pan-y',
  },
  // `hug` fits the content instead of filling the height budget; the budget
  // becomes an upper bound (90%). Applied to the <dialog> (overrides Drawer's
  // block-size treatment, which is applied earlier in the props chain).
  hugHeight: {
    height: 'fit-content',
    maxHeight: HEIGHT_BUDGETS.hug,
  },
});
export interface BottomSheetProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the underlying <dialog> element. */
  ref?: React.Ref<HTMLDialogElement>;

  /** Whether the sheet is open. Fully controlled — pair with `onOpenChange`. */
  isOpen: boolean;

  /**
   * Called when the sheet opens or closes. The boolean is the requested
   * next state (`false` on Escape, scrim click, or a swipe past the dismiss
   * threshold). The caller owns the open state.
   */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Accessible label for the sheet (required — the sheet has no built-in
   * heading to derive a name from).
   */
  label: string;

  /** Sheet content, rendered below the grab handle in a scrollable area. */
  children: ReactNode;

  /**
   * How tall the sheet is. A named budget, or any explicit height:
   * - `'hug'` — fits its content, never taller than 90% of the viewport.
   * - `'capped'` — a scrolling mid-height panel (~62%).
   * - `'tall'` — a pinned near-full panel (~92%); use when content streams in
   *   so the sheet doesn't resize under the user.
   * - a `number` (px) or CSS length string (e.g. `'70dvh'`, `480`) for a
   *   custom budget, mirroring `Drawer`'s `size` / `Dialog`'s `maxHeight`.
   *
   * The user can still drag between snap points regardless of the starting
   * height. On viewports shorter than the budget the sheet fills the
   * available height.
   * @default 'capped'
   */
  height?: BottomSheetHeight | number | string;

  /** Test ID for the root element. */
  'data-testid'?: string;
}

/**
 * A mobile touch sheet that rises from the bottom edge, with a grab handle
 * and swipe-to-dismiss. Built on the lab Drawer's `<dialog>` engine
 * (`side="bottom"`): Drawer owns the open/close slide, focus trap + restore,
 * scroll lock, and the Escape/scrim contract, while BottomSheet layers the
 * grab handle and drag-to-dismiss on top.
 *
 * @example
 * ```
 * const [isOpen, setIsOpen] = useState(false);
 * <BottomSheet
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   label="Filters">
 *   <FilterControls />
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  isOpen,
  onOpenChange,
  label,
  children,
  height = 'capped',
  xstyle,
  ...props
}: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Drive the scrim opacity from drag progress via a CSS variable on the
  // <dialog>, set imperatively so a 60fps drag doesn't re-render React. The
  // scrim (Drawer's ::backdrop) reads this var, fading out as the drag enters
  // the close zone to signal that releasing will dismiss.
  const handleDragProgress = useCallback((dismissProgress: number) => {
    dialogRef.current?.style.setProperty(
      '--_sheet-scrim-opacity',
      String(1 - dismissProgress),
    );
  }, []);

  const {contentProps, handleProps, bodyProps, isDragging, sheetRef} =
    useSheetGestures({
      isOpen,
      onDismiss: close,
      snapHeights: defaultSnapHeights,
      onDragProgress: handleDragProgress,
    });

  // Resolve the height budget: a named key maps to its viewport fraction, and
  // any other value (px number or CSS length) passes straight through to
  // Drawer's `size`. `hug` is the only budget that fits content beneath the
  // cap rather than filling it.
  const isNamed = typeof height === 'string' && height in HEIGHT_BUDGETS;
  const sizeValue = isNamed
    ? HEIGHT_BUDGETS[height as BottomSheetHeight]
    : height;
  const isHug = height === 'hug';

  return (
    <Drawer
      ref={dialogRef}
      isOpen={isOpen}
      onClose={close}
      side="bottom"
      size={sizeValue}
      label={label}
      hasScrim
      hasCloseButton={false}
      xstyle={[
        styles.dialogSurface,
        // Only override the scrim opacity while dragging, so Drawer's own
        // @starting-style entrance fade runs untouched on open.
        isDragging && styles.scrimFade,
        isHug && styles.hugHeight,
      ]}
      {...props}>
      <div
        ref={sheetRef}
        data-astryx-sheet=""
        {...mergeProps(
          themeProps('bottom-sheet'),
          stylex.props(styles.sheet, xstyle),
          contentProps.style,
        )}>
        <div
          data-astryx-sheet-handle=""
          {...stylex.props(styles.handleBar)}
          {...handleProps}
          aria-hidden="true">
          <div {...stylex.props(styles.handlePill)} />
        </div>
        <div
          data-astryx-sheet-body=""
          {...stylex.props(styles.body)}
          {...bodyProps}>
          {children}
        </div>
      </div>
    </Drawer>
  );
}

BottomSheet.displayName = 'BottomSheet';
