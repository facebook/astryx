/**
 * @file XDSCommandPalette.tsx
 * @input Uses React, StyleX, XDSDialog
 * @output Exports XDSCommandPalette root component and props
 * @position Core root component; dialog shell with slots for sub-components
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 */

'use client';

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSDialog} from '../Dialog';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
});

// =============================================================================
// Module Augmentation - Register CommandPalette's style surfaces
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    commandPalette?: {
      root?: import('../theme/types').StyleXStyles;
    };
  }
}

export interface XDSCommandPaletteProps {
  /**
   * Whether the command palette is open.
   */
  isOpen: boolean;

  /**
   * Called when the command palette visibility changes.
   * Called with `false` when the palette requests to close
   * (via Escape key or backdrop click).
   */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Accessible label for the command palette dialog.
   * @default 'Command palette'
   */
  label?: string;

  /**
   * Width of the command palette dialog.
   * Numbers are treated as pixels, strings are used as-is.
   * @default 640
   */
  width?: number | string;

  /**
   * Maximum height of the command palette dialog.
   * Numbers are treated as pixels, strings are used as-is.
   * @default 480
   */
  maxHeight?: number | string;

  /**
   * Composable content slots.
   * Typically includes XDSCommandPaletteInput, a list area, and XDSCommandPaletteFooter.
   *
   * @example
   * ```
   * <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
   *   <XDSCommandPaletteInput placeholder="Search commands..." />
   *   <XDSCommandPaletteList>
   *     <XDSCommandPaletteItem value="home">Go Home</XDSCommandPaletteItem>
   *   </XDSCommandPaletteList>
   *   <XDSCommandPaletteFooter />
   * </XDSCommandPalette>
   * ```
   */
  children: ReactNode;
}

/**
 * Command palette dialog shell.
 *
 * A modal dialog pre-configured for command palette usage.
 * Renders an XDSDialog with appropriate defaults (centered, info purpose,
 * no close button) and a flex column layout for composable children.
 *
 * This component is purely structural — it provides the dialog container
 * and layout. State management (search, filtering, selection, keyboard
 * navigation) is handled by a separate context provider.
 *
 * @compositionHint Compose with XDSCommandPaletteInput (search),
 *   XDSCommandPaletteList (scrollable items), and XDSCommandPaletteFooter
 *   (keyboard hints) as children.
 *
 * @example
 * ```
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <input placeholder="Type a command..." />
 *   <div>Item list goes here</div>
 * </XDSCommandPalette>
 * ```
 */
export function XDSCommandPalette({
  isOpen,
  onOpenChange,
  label = 'Command palette',
  width = 640,
  maxHeight = 480,
  children,
}: XDSCommandPaletteProps) {
  return (
    <XDSDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width={width}
      maxHeight={maxHeight}
      purpose="info"
      aria-label={label}>
      <div {...stylex.props(styles.wrapper)}>{children}</div>
    </XDSDialog>
  );
}

XDSCommandPalette.displayName = 'XDSCommandPalette';
