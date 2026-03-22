'use client';

/**
 * @file XDSDialog.tsx
 * @input Uses React, DialogHTMLAttributes, ReactNode
 * @output Exports XDSDialog component, XDSDialogProps, XDSDialogVariant, XDSDialogPurpose types
 * @position Core implementation; consumed by index.ts, tested by XDSDialog.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Dialog/Dialog.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Dialog/XDSDialog.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Dialog/index.ts (exports if types change)
 * - /apps/storybook/stories/Dialog.stories.tsx (storybook stories)
 */


import {useEffect, useRef, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  durationVars,
  easeVars,
  shadowVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Extensible variant map for XDSDialog.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/Dialog' {
 *   interface XDSDialogVariantMap {
 *     'drawer': true;
 *   }
 * }
 * ```
 */
export interface XDSDialogVariantMap {
  standard: true;
  fullscreen: true;
}

/**
 * Dialog variant type
 * - standard: Normal dialog with configurable width/height
 * - fullscreen: Takes up the entire viewport
 *
 * Extensible via module augmentation of XDSDialogVariantMap.
 */
export type XDSDialogVariant = keyof XDSDialogVariantMap;

/**
 * Dialog purpose type - controls dismissal behavior
 * - required: Mandatory flows (security, permissions) - disables all exit methods
 * - form: User forms/flows - prevents backdrop click, allows escape
 * - info: Informational flows - allows all exit methods
 */
export type XDSDialogPurpose = 'required' | 'form' | 'info';

/**
 * Position configuration for static dialog positioning
 */
export interface XDSDialogPosition {
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  top?: number | string;
}

/**
 * Dialog styles using native <dialog> element
 * Uses ::backdrop pseudo-element for overlay
 */
const styles = stylex.create({
  dialog: {
    position: 'fixed',
    margin: 'auto',
    padding: 0,
    border: 'none',
    backgroundColor: colorVars['--color-surface'],
    '--dialog-radius': radiusVars['--radius-3'],
    borderRadius: 'var(--dialog-radius)',
    boxShadow: shadowVars['--shadow-dialog'],
    display: {
      default: 'none',
      ':where([open])': 'flex',
    },
    flexDirection: 'column',
    overflow: 'hidden',
    height: 'fit-content',
    // Animation for opening
    opacity: {
      default: 0,
      ':where([open])': 1,
    },
    transform: {
      default: 'scale(0.95) translateY(8px)',
      ':where([open])': 'scale(1) translateY(0)',
    },
    transitionProperty: 'opacity, transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-ring-focus']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  // Backdrop using ::backdrop pseudo-element
  backdrop: {
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      backdropFilter: 'blur(2px)',
    },
  },
  fullscreen: {
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh',
    borderRadius: 0,
    margin: 0,
    inset: 0,
  },
});

// Dynamic styles for width, maxHeight, and position
const dynamicStyles = stylex.create({
  sizing: (width: number | string, maxHeight: number | string) => ({
    width: typeof width === 'number' ? `${width}px` : width,
    maxWidth: '90vw',
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
  }),
  position: (
    top: number | string | undefined,
    right: number | string | undefined,
    bottom: number | string | undefined,
    left: number | string | undefined,
  ) => ({
    // When position is set, disable auto margin and use fixed positioning
    margin: 0,
    top: formatPosition(top),
    right: formatPosition(right),
    bottom: formatPosition(bottom),
    left: formatPosition(left),
  }),
});

/**
 * Format position value - numbers become pixels, strings pass through, undefined becomes null
 */
function formatPosition(value: number | string | undefined): string | null {
  if (value === undefined) return null;
  return typeof value === 'number' ? `${value}px` : value;
}

export interface XDSDialogProps extends XDSBaseProps<HTMLDialogElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDialogElement>;
  /**
   * Whether the dialog is open.
   */
  isOpen: boolean;

  /**
   * Callback fired when the dialog visibility changes.
   * Called with `false` when the dialog requests to be hidden.
   * Behavior depends on the `purpose` prop:
   * - required: Never called automatically
   * - form: Called on Escape key only
   * - info: Called on Escape key and backdrop click
   */
  onOpenChange: (isOpen: boolean) => unknown;

  /**
   * The width of the dialog.
   * Numbers are treated as pixels, strings are used as-is.
   * Ignored when variant is 'fullscreen'.
   * @default 400
   */
  width?: number | string;

  /**
   * The maximum height of the dialog.
   * The actual height will be the height of its content.
   * Numbers are treated as pixels, strings are used as-is.
   * Ignored when variant is 'fullscreen'.
   * @default '75vh'
   */
  maxHeight?: number | string;

  /**
   * Static position for the dialog on screen.
   * By default, the dialog will be centered.
   * Ignored when variant is 'fullscreen'.
   */
  position?: Readonly<XDSDialogPosition>;

  /**
   * The variant of the dialog.
   * - standard: Normal dialog with configurable dimensions
   * - fullscreen: Takes up the entire viewport
   * @default 'standard'
   */
  variant?: XDSDialogVariant;

  /**
   * Configures how the dialog enables dismissals.
   * - required: Disables all exit methods (for mandatory flows)
   * - form: Prevents backdrop click, allows Escape key
   * - info: Allows all exit methods (Escape and backdrop click)
   * @default 'info'
   */
  purpose?: XDSDialogPurpose;

  /**
   * The content of the dialog.
   * Typically an XDSLayout with header, content, and footer slots.
   */
  children: ReactNode;
}

/**
 * A dialog component using the native <dialog> element.
 *
 * Designed to be used with XDSLayout as its child for structured content.
 * Uses the browser's built-in modal behavior for optimal accessibility.
 *
 * @example
 * ```
 * const [isOpen, setIsOpen] = useState(false);
 * <XDSDialog isOpen={isOpen} onOpenChange={open => setIsOpen(open)}>
 *   <XDSLayout
 *     header={<XDSDialogHeader title="Title" onOpenChange={open => setIsOpen(open)} />}
 *     content={<XDSLayoutContent>Content</XDSLayoutContent>}
 *     footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
 *   />
 * </XDSDialog>
 * ```
 */
export function XDSDialog({
  isOpen,
  onOpenChange,
  width = 400,
  maxHeight = '75vh',
  position,
  variant = 'standard',
  purpose = 'info',
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Derive dismissal behavior from purpose
  const allowEscape = purpose !== 'required';
  const allowBackdropClick = purpose === 'info';

  // Merge refs
  const setRefs = (element: HTMLDialogElement | null) => {
    (dialogRef as React.MutableRefObject<HTMLDialogElement | null>).current =
      element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  // Handle open/close state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (allowEscape) {
          onOpenChange(false);
        }
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allowEscape, onOpenChange]);

  // Handle backdrop click
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Check if click was on the backdrop (dialog element itself, not content)
    const rect = dialog.getBoundingClientRect();
    const isBackdropClick =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (isBackdropClick && allowBackdropClick) {
      onOpenChange(false);
    }
  };

  // Handle native cancel event (browser Escape handling)
  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (allowEscape) {
      onOpenChange(false);
    }
  };

  const isFullscreen = variant === 'fullscreen';
  const hasPosition = position != null && !isFullscreen;

  return (
    <dialog
      ref={setRefs}
      onClick={handleClick}
      onCancel={handleCancel}
      aria-modal="true"
      {...mergeProps(
        xdsClassName('dialog', {variant}),
        stylex.props(
          styles.dialog,
          styles.backdrop,
          !isFullscreen && dynamicStyles.sizing(width, maxHeight),
          hasPosition &&
            dynamicStyles.position(
              position?.top,
              position?.right,
              position?.bottom,
              position?.left,
            ),
          isFullscreen && styles.fullscreen,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {children}
    </dialog>
  );
}

XDSDialog.displayName = 'XDSDialog';
