// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheet.tsx
 * @input Uses React, StyleX, theme tokens, Drawer, useSheetGestures, themeProps
 * @output Exports BottomSheet component and BottomSheetProps
 * @position Lab implementation; consumed by index.ts, tested by BottomSheet.test.tsx, demonstrated in Storybook
 *
 * A mobile touch surface that rises from the bottom edge: grab handle,
 * swipe-to-dismiss, and optional snap points. It is built ON TOP OF the
 * lab Drawer's native `<dialog>` engine (`side="bottom"`) rather than
 * forking it — Drawer owns showModal/show, the open/close slide animation,
 * focus trap + restore, scroll lock, the Escape/scrim contract, and the
 * LIFO overlay registry. BottomSheet layers the grab handle and the
 * reusable `useSheetGestures` drag machinery on top, inside the dialog.
 *
 * The gesture logic lives in `useSheetGestures` (not here) so Drawer, a
 * future Dialog-as-sheet, or PowerSearch mobile can consume the same
 * primitive. This component only wires it to a handle + content wrapper.
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
// SYNC: focus-ring convention mirrors core Button — 2px solid --color-accent.
import {themeProps} from '@astryxdesign/core/utils';
import {Drawer} from '../Drawer';
import {useSheetGestures} from './useSheetGestures';

const styles = stylex.create({
  // Inner wrapper that carries the live drag translate. Drawer owns the
  // open/close slide on the <dialog> itself; this wrapper adds the gesture
  // offset so the two transforms don't fight. Safe-area padding clears the
  // home indicator on notched devices.
  sheet: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
    paddingBlockEnd: `env(safe-area-inset-bottom, 0px)`,
    willChange: 'transform',
  },
  handleBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-2'],
    outline: 'none',
    touchAction: 'none',
  },
  handlePill: {
    width: 36,
    height: 4,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-border'],
  },
  handleFocusRing: {
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: 2,
    borderRadius: radiusVars['--radius-full'],
  },
  body: {
    flexGrow: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
});

export interface BottomSheetProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the underlying <dialog> element. */
  ref?: React.Ref<HTMLDialogElement>;

  /** Whether the sheet is open. Fully controlled — pair with `onClose`. */
  isOpen: boolean;

  /**
   * Called when the sheet requests to be closed (Escape, scrim click,
   * built-in close button, or a swipe past the dismiss threshold). The
   * caller owns the open state.
   */
  onClose: () => void;

  /**
   * Accessible label for the sheet (required — the sheet has no built-in
   * heading to derive a name from).
   */
  label: string;

  /** Sheet content, rendered below the grab handle in a scrollable area. */
  children: ReactNode;

  /**
   * Detents the sheet can settle to, ordered most-collapsed to
   * most-expanded (e.g. `[0.3, 0.6, 1]` for peek / half / full). A number
   * in (0, 1] is a fraction of the height budget; a string is any CSS
   * length. Omit for a single-height sheet.
   */
  snapPoints?: Array<number | string>;

  /** Controlled active detent index. Pair with `onSnapChange`. */
  snapIndex?: number;

  /** Called when the active detent changes (drag settle or keyboard nav). */
  onSnapChange?: (index: number) => void;

  /**
   * Height budget when `snapPoints` is not provided. A number is pixels; a
   * string is any CSS length. On shorter viewports the sheet fills the
   * available height.
   * @default '50dvh'
   */
  size?: number | string;

  /** Render the visual grab handle at the top. @default true */
  hasDragHandle?: boolean;

  /**
   * Allow swipe / drag to dismiss and resize. When false the drag wiring is
   * inert (use for sheets with a text form). @default true
   */
  hasSwipeToDismiss?: boolean;

  /** Render a modal scrim behind the sheet. @default true */
  hasScrim?: boolean;

  /** Render the built-in close button. Defaults to the `hasScrim` value. */
  hasCloseButton?: boolean;

  /** Test ID for the root element. */
  'data-testid'?: string;
}

/**
 * A mobile touch sheet that rises from the bottom edge, with a grab handle,
 * swipe-to-dismiss, and optional snap points. Built on the lab Drawer's
 * `<dialog>` engine (`side="bottom"`): Drawer owns the open/close slide,
 * focus trap + restore, scroll lock, and the Escape/scrim contract, while
 * the reusable `useSheetGestures` hook supplies the drag machinery.
 *
 * @example
 * ```
 * const [isOpen, setIsOpen] = useState(false);
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   label="Filters"
 *   snapPoints={[0.4, 1]}>
 *   <FilterControls />
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  isOpen,
  onClose,
  label,
  children,
  snapPoints,
  snapIndex,
  onSnapChange,
  size = '50dvh',
  hasDragHandle = true,
  hasSwipeToDismiss = true,
  hasScrim = true,
  hasCloseButton,
  xstyle,
  ...props
}: BottomSheetProps) {
  const {contentProps, handleProps} = useSheetGestures({
    isOpen,
    onDismiss: onClose,
    snapPoints,
    snapIndex,
    onSnapChange,
    enabled: hasSwipeToDismiss,
    axis: 'bottom',
  });

  const {style: gestureStyle, ...gestureContentProps} = contentProps;
  const sheetProps = stylex.props(styles.sheet, xstyle);
  const handleRingProps = stylex.props(styles.handleFocusRing);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="bottom"
      size={size}
      label={label}
      hasScrim={hasScrim}
      hasCloseButton={hasCloseButton}
      {...props}>
      <div
        data-astryx-sheet=""
        {...themeProps('bottom-sheet')}
        {...gestureContentProps}
        {...sheetProps}
        style={{...sheetProps.style, ...gestureStyle}}>
        {hasDragHandle && (
          <div {...stylex.props(styles.handleBar)}>
            <div
              {...handleProps}
              {...handleRingProps}
              style={{...handleRingProps.style, ...handleProps.style}}>
              <div {...stylex.props(styles.handlePill)} aria-hidden="true" />
            </div>
          </div>
        )}
        <div {...stylex.props(styles.body)}>{children}</div>
      </div>
    </Drawer>
  );
}

BottomSheet.displayName = 'BottomSheet';
