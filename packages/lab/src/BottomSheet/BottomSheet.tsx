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

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {Drawer} from '../Drawer';
import {useSheetGestures} from './useSheetGestures';

/**
 * Height budget for each named size. `medium`/`tall` track the viewport so
 * the sheet scales with the device; `short` is a fixed peek height. `auto`
 * is handled separately (fits content, capped at the `tall` budget).
 */
const HEIGHT_BUDGETS = {
  short: '240px',
  medium: '50dvh',
  tall: '90dvh',
  auto: '90dvh',
} as const;

export type BottomSheetHeight = keyof typeof HEIGHT_BUDGETS;

// Sheets on wide touch devices (tablets) shouldn't stretch edge to edge;
// cap and center them. Matches the `sm` layout breakpoint. On phones the
// viewport is narrower than this, so the sheet stays full-width.
const MAX_SHEET_WIDTH = 640;

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
    paddingBlockEnd: `env(safe-area-inset-bottom, 0px)`,
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
  handleBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-2'],
    touchAction: 'none',
    cursor: 'grab',
  },
  handlePill: {
    width: 36,
    height: 4,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-border'],
  },
  body: {
    flexGrow: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  // `auto` fits content instead of filling the height budget; the budget
  // becomes an upper bound. Applied to the <dialog> (overrides Drawer's
  // block-size treatment, which is applied earlier in the props chain).
  autoHeight: {
    height: 'fit-content',
    maxHeight: HEIGHT_BUDGETS.auto,
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
   * How tall the sheet is:
   * - `'short'` — a fixed peek height
   * - `'medium'` — half the viewport
   * - `'tall'` — nearly the full viewport
   * - `'auto'` — fits its content, capped at the `'tall'` budget
   *
   * On viewports shorter than the budget the sheet fills the available
   * height.
   * @default 'medium'
   */
  height?: BottomSheetHeight;

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
  height = 'medium',
  xstyle,
  ...props
}: BottomSheetProps) {
  const close = () => onOpenChange(false);
  const {contentProps, handleProps} = useSheetGestures({
    isOpen,
    onDismiss: close,
  });

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      side="bottom"
      size={HEIGHT_BUDGETS[height]}
      label={label}
      hasScrim
      hasCloseButton={false}
      xstyle={[styles.dialogSurface, height === 'auto' && styles.autoHeight]}
      {...props}>
      <div
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
        <div {...stylex.props(styles.body)}>{children}</div>
      </div>
    </Drawer>
  );
}

BottomSheet.displayName = 'BottomSheet';
