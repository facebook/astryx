// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSDialog.tsx
 * @input Uses React, DialogHTMLAttributes, ReactNode, container (Layout), DialogContext
 * @output Exports XDSDialog component, XDSDialogProps, XDSDialogVariant, XDSDialogPurpose types
 * @position Core implementation; consumed by index.ts, tested by XDSDialog.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Dialog/Dialog.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Dialog/XDSDialog.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Dialog/index.ts (exports if types change)
 * - /apps/storybook/stories/Dialog.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Dialog/ (showcase blocks)
 */

import {useEffect, useMemo, useRef, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {useScrollLock} from '../hooks/useScrollLock';
import {
  colorVars,
  radiusVars,
  durationVars,
  easeVars,
  shadowVars,
} from '../theme/tokens.stylex';
import {container} from '../Layout/container.stylex';
import type {SpacingToken} from '../Layout/container.stylex';
import {
  paddingStyles,
  containerPaddingInlineVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingBlockEndVarStyles,
  spacingStepToToken,
} from '../Layout/padding.stylex';
import type {SpacingStep} from '../utils/types';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import {DialogContext} from './DialogContext';

/**
 * Calculate a directional translate offset for dialog entry animation.
 * Returns a normalized vector from the trigger element toward the viewport
 * center, scaled to the given distance.
 */
function getDialogDirection(
  triggerEl: HTMLElement,
  distance = 16,
): {x: number; y: number} {
  const rect = triggerEl.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - window.innerWidth / 2;
  const dy = rect.top + rect.height / 2 - window.innerHeight / 2;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x: Math.round((dx / dist) * distance),
    y: Math.round((dy / dist) * distance),
  };
}

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

const enterDirectional = stylex.keyframes({
  from: {
    opacity: 0,
    transform:
      'translate(var(--dialog-dir-x, 0px), var(--dialog-dir-y, 16px)) scale(0.95)',
  },
  to: {opacity: 1, transform: 'translate(0, 0) scale(1)'},
});

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
    backgroundColor: colorVars['--color-background-surface'],
    '--_dialog-radius': radiusVars['--radius-container'],
    borderRadius: 'var(--_dialog-radius)',
    boxShadow: shadowVars['--shadow-high'],
    display: 'none',
    flexDirection: 'column',
    height: 'fit-content',
    overscrollBehavior: 'contain',
    opacity: 0,
    animationDuration: durationVars['--duration-medium-max'],
    animationTimingFunction: easeVars['--ease-standard'],
    animationFillMode: 'backwards' as const,
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  // Applied via isOpen prop — avoids :where([open]) attribute selectors
  // which have zero specificity and can lose to default styles depending
  // on CSS source order in the build output.
  open: {
    display: 'flex',
    opacity: 1,
    animationName: enterDirectional,
  },
  // Backdrop using ::backdrop pseudo-element
  backdrop: {
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      backdropFilter: 'blur(2px)',
    },
  },
  fullscreen: {
    width: '100dvw',
    height: '100dvh',
    maxWidth: '100dvw',
    maxHeight: '100dvh',
    borderRadius: 0,
    margin: 0,
    inset: 0,
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
    borderRadius: 'inherit',
  },
  // Inline wrapper mirrors the dialog's visual styles without <dialog> behavior
  inlineWrapper: {
    padding: 0,
    border: 'none',
    backgroundColor: colorVars['--color-background-surface'],
    '--_dialog-radius': radiusVars['--radius-container'],
    borderRadius: 'var(--_dialog-radius)',
    boxShadow: shadowVars['--shadow-high'],
    display: 'flex',
    flexDirection: 'column',
    height: 'fit-content',
    overscrollBehavior: 'contain',
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
    top: top !== undefined ? formatPosition(top) : 'auto',
    right: right !== undefined ? formatPosition(right) : 'auto',
    bottom: bottom !== undefined ? formatPosition(bottom) : 'auto',
    left: left !== undefined ? formatPosition(left) : 'auto',
  }),
});

/**
 * Format position value - numbers become pixels, strings pass through, undefined becomes null
 */
function formatPosition(value: number | string | undefined): string | null {
  if (value === undefined) {
    return null;
  }
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
   * Renders dialog content inline without the <dialog> element, backdrop,
   * modal behavior, or dialog-managed autofocus. Intended for documentation
   * previews and showcases only — not for production UIs. The dialog will not
   * trap focus or respond to Escape.
   * @default false
   */
  isInline?: boolean;

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
   * Internal padding of the dialog using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * When omitted, uses the theme default for dialogs.
   */
  padding?: SpacingStep;

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
  isInline = false,
  onOpenChange,
  width = 400,
  maxHeight = '75vh',
  position,
  variant = 'standard',
  purpose = 'info',
  padding,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSDialogProps) {
  // When no explicit padding prop, use theme default (--xds-dialog-padding)
  const useThemeDefault = padding == null;
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;

  const isFullscreen = variant === 'fullscreen';
  const dialogContextValue = useMemo(() => ({isInline}), [isInline]);

  const dialogRef = useRef<HTMLDialogElement>(null);

  // Capture the element that was focused when the dialog opened,
  // for directional animation origin and focus restoration on close.
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Derive dismissal behavior from purpose
  const allowEscape = purpose !== 'required';
  const allowBackdropClick = purpose === 'info';

  // Handle open/close state — skip for inline rendering
  useEffect(() => {
    if (isInline) {
      return;
    }
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen) {
      // Capture the currently focused element as the trigger — used for
      // directional animation origin and focus restoration on close.
      triggerElementRef.current = document.activeElement as HTMLElement | null;

      // Set directional CSS custom properties before opening
      const trigger = triggerElementRef.current;
      if (trigger && trigger !== document.body) {
        const dir = getDialogDirection(trigger);
        dialog.style.setProperty('--dialog-dir-x', `${dir.x}px`);
        dialog.style.setProperty('--dialog-dir-y', `${dir.y}px`);
      } else {
        dialog.style.setProperty('--dialog-dir-x', '0px');
        dialog.style.setProperty('--dialog-dir-y', '16px');
      }

      if (!dialog.open) {
        dialog.showModal();
        // React's autoFocus calls .focus() during commit, before showModal()
        // makes the dialog visible, so the focus silently fails.
        // Focus the first element with data-autofocus inside the dialog.
        const autofocusTarget =
          dialog.querySelector<HTMLElement>('[data-autofocus]');
        if (autofocusTarget) {
          autofocusTarget.focus();
        }
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      // Return focus to the element that opened the dialog
      triggerElementRef.current?.focus();
      triggerElementRef.current = null;
    }
  }, [isOpen, isInline]);

  // Lock body scroll when dialog is open (iOS Safari workaround)
  // Skip for inline rendering — no modal overlay to compensate for.
  useScrollLock(isOpen && !isInline);

  // Handle Escape key — skip for inline rendering
  useEffect(() => {
    if (isInline) {
      return;
    }
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) {
      return;
    }

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
  }, [isOpen, isInline, allowEscape, onOpenChange]);

  // Handle backdrop click — when the user clicks the ::backdrop pseudo-element,
  // the event target is the <dialog> element itself; clicks on child content
  // always target the child. This avoids false positives from native browser
  // popups (date pickers, selects, color pickers) that render outside the
  // dialog's bounding rect.
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && allowBackdropClick) {
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

  // Shared inner content wrapper
  const innerContent = (
    <div
      {...stylex.props(
        styles.inner,
        ...container(
          useThemeDefault
            ? {
                useThemeDefault: 'dialog',
                maxHeight: isFullscreen
                  ? undefined
                  : typeof maxHeight === 'number'
                    ? `${maxHeight}px`
                    : maxHeight,
              }
            : {
                paddingInnerX: paddingToken,
                paddingInnerY: paddingToken,
                paddingOuterX: paddingToken,
                paddingOuterY: paddingToken,
                maxHeight: isFullscreen
                  ? undefined
                  : typeof maxHeight === 'number'
                    ? `${maxHeight}px`
                    : maxHeight,
              },
        ),
        !useThemeDefault &&
          effectivePadding !== 4 &&
          paddingStyles[effectivePadding],
        !useThemeDefault &&
          effectivePadding !== 4 &&
          containerPaddingInlineVarStyles[effectivePadding],
        !useThemeDefault &&
          effectivePadding !== 4 &&
          containerPaddingBlockStartVarStyles[effectivePadding],
        !useThemeDefault &&
          effectivePadding !== 4 &&
          containerPaddingBlockEndVarStyles[effectivePadding],
      )}>
      <DialogContext value={dialogContextValue}>{children}</DialogContext>
    </div>
  );

  // --- Inline rendering path (for documentation previews) ---
  if (isInline) {
    if (!isOpen) {
      return null;
    }

    return (
      <div
        {...mergeProps(
          xdsClassName('dialog', {variant}),
          stylex.props(
            styles.inlineWrapper,
            !isFullscreen && dynamicStyles.sizing(width, maxHeight),
            isFullscreen && styles.fullscreen,
            xstyle,
          ),
          className,
          style,
        )}
        data-testid={
          (props as Record<string, unknown>)['data-testid'] as
            | string
            | undefined
        }>
        {innerContent}
      </div>
    );
  }

  // --- Standard modal rendering path ---
  const hasPosition = position != null && !isFullscreen;

  // Filter out native open to prevent InvalidStateError when accidentally passed
  const {open: _open, ...safeProps} = props as Record<string, unknown>;

  return (
    <dialog
      ref={mergeRefs(ref, dialogRef)}
      onClick={handleClick}
      onCancel={handleCancel}
      aria-modal="true"
      role={purpose === 'required' ? 'alertdialog' : undefined}
      {...mergeProps(
        xdsClassName('dialog', {variant}),
        stylex.props(
          styles.dialog,
          isOpen && styles.open,
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
      {...safeProps}>
      {innerContent}
    </dialog>
  );
}

XDSDialog.displayName = 'XDSDialog';
