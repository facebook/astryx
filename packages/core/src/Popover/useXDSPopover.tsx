// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useXDSPopover.tsx
 * @input Uses useXDSLayer, useFocusTrap, React hooks
 * @output Exports useXDSPopover hook for popover dialogs with focus trapping
 * @position Higher-level layer utility; used by DatePicker, Combobox, etc.
 *
 * Combines popover layer behavior with focus trap for dialog-like popovers.
 * Use this for interactive popover content that should trap focus.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Popover/index.ts
 */

import React, {useCallback, useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSLayer, type ContextRenderProps} from '../Layer/useXDSLayer';
import {useFocusTrap} from '../hooks/useFocusTrap';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  shadowVars,
} from '../theme/tokens.stylex';
import {XDSButton} from '../Button';

const styles = stylex.create({
  // Default popover surface — background, radius, shadow.
  // Applied automatically unless hasSurface is false.
  // Consumers that need a raw positioned layer should use useXDSLayer instead.
  surface: {
    backgroundColor: colorVars['--color-background-popover'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: shadowVars['--shadow-low'],
  },
  // Focus trap container
  contentWrapper: {
    position: 'relative',
  },
  // Hidden close button wrapper - sr-only until focused, then positioned below popover
  closeButtonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translate(-50%, 100%)',
    zIndex: 1,
    // sr-only by default
    width: {
      default: 1,
      ':focus-within': 'auto',
    },
    height: {
      default: 1,
      ':focus-within': 'auto',
    },
    overflow: {
      default: 'hidden',
      ':focus-within': 'visible',
    },
    clipPath: {
      default: 'inset(50%)',
      ':focus-within': 'none',
    },
    pointerEvents: {
      default: 'none',
      ':focus-within': 'auto',
    },
    paddingBlockStart: {
      default: 0,
      ':focus-within': spacingVars['--spacing-1'],
    },
  },
});

/**
 * Options for useXDSPopover
 */
export interface UseXDSPopoverOptions {
  /**
   * Callback fired when popover is shown.
   * Wrap in useCallback for stable identity.
   */
  onShow?: () => void;

  /**
   * Callback fired when popover is hidden.
   * Use this to return focus to the trigger element.
   * Wrap in useCallback for stable identity.
   */
  onHide?: () => void;

  /**
   * StyleX styles applied to the popover's content wrapper.
   * Merges after the surface styles (when hasSurface is true), so these
   * can override background, radius, etc.
   *
   * For styles on the layer's positioned element (e.g., animations using
   * `:popover-open`), pass `xstyle` via the `render()` call's props instead.
   */
  xstyle?: StyleXStyles;

  /**
   * Whether clicking outside should dismiss the popover.
   * @default true
   */
  hasLightDismiss?: boolean;

  /**
   * Whether to automatically focus the first focusable element when opened.
   * @default true
   */
  hasAutoFocus?: boolean;

  /**
   * Whether to include a hidden close button for accessibility.
   * The button appears when keyboard users tab past the last element.
   * @default true
   */
  hasCloseButton?: boolean;

  /**
   * Label for the hidden close button.
   * @default "Close popover"
   */
  closeButtonLabel?: string;

  /**
   * Accessible label for the dialog.
   * Required for screen readers to announce the dialog purpose.
   */
  dialogLabel?: string;

  /**
   * Whether to apply the default popover surface (background, border-radius,
   * box-shadow) to the content wrapper.
   *
   * Set to false when the popover content provides its own surface styling
   * (e.g., mega menus with custom layouts). If you find yourself opting out,
   * consider whether useXDSLayer is a better fit.
   *
   * @default true
   */
  hasSurface?: boolean;
}

/**
 * Return type for useXDSPopover
 */
export interface UseXDSPopoverReturn {
  /**
   * Ref callback to attach to the trigger element.
   * Sets up CSS anchor positioning.
   */
  triggerRef: (el: HTMLElement | null) => void;

  /**
   * Ref for the popover content container (used internally for focus trapping).
   * You typically don't need to use this directly - the render function
   * automatically wraps content in a focus trap container.
   */
  contentRef: React.RefObject<HTMLDivElement | null>;

  /**
   * The CSS anchor name to use for positioning.
   * Use when you need to set anchorName manually (e.g., display:contents wrapper).
   */
  anchorId: string;

  /**
   * Show the popover.
   * @param options.skipAutoFocus - If true, don't auto-focus the first element.
   *   Useful when triggered by mouse click on an input that should retain focus.
   */
  show: (options?: {skipAutoFocus?: boolean}) => void;

  /**
   * Hide the popover
   */
  hide: () => void;

  /**
   * Toggle the popover open/closed
   */
  toggle: () => void;

  /**
   * Whether the popover is currently open
   */
  isOpen: boolean;

  /**
   * Unique ID for aria-describedby or aria-controls
   */
  id: string;

  /**
   * Render function for popover content.
   * Automatically wraps content in a focus trap container with a hidden close button.
   *
   * @example
   * ```
   * {popover.render(
   *   <Calendar />,
   *   { placement: 'below', alignment: 'start' }
   * )}
   * ```
   */
  render: (children: ReactNode, props?: ContextRenderProps) => ReactNode;

  /**
   * ARIA attributes to spread on the trigger element
   */
  triggerProps: {
    'aria-haspopup': 'dialog';
    'aria-expanded': boolean;
    'aria-controls': string;
  };
}

/**
 * Hook for creating popover dialogs with focus trapping.
 *
 * Combines:
 * - `useXDSLayer` for popover positioning using CSS anchor positioning
 * - `useFocusTrap` for trapping focus within the popover content
 * - Auto-focus first element on open
 * - Escape key to close
 * - Hidden close button that reveals on focus for accessibility
 *
 * The render function automatically wraps your content in a focus trap container
 * and appends a hidden close button. The button appears at the end of the popover,
 * is visually hidden until focused, then shows a tooltip-like message (default: "Close popover").
 *
 * @example
 * ```
 * function DatePickerExample() {
 *   const inputRef = useRef<HTMLInputElement>(null);
 *   const popover = useXDSPopover({
 *     onHide: () => inputRef.current?.focus(),
 *     closeButtonLabel: 'Close calendar',
 *   });
 *   return (
 *     <>
 *       <input ref={inputRef} />
 *       <button
 *         ref={popover.triggerRef}
 *         onClick={popover.toggle}
 *         {...popover.triggerProps}>
 *         Open Calendar
 *       </button>
 *       {popover.render(
 *         <Calendar />,
 *         { placement: 'below', alignment: 'start' }
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useXDSPopover(
  options: UseXDSPopoverOptions = {},
): UseXDSPopoverReturn {
  const {
    onShow,
    onHide,
    xstyle,
    hasLightDismiss = true,
    hasAutoFocus = true,
    hasSurface = true,
    hasCloseButton = true,
    closeButtonLabel = 'Close popover',
    dialogLabel,
  } = options;

  // Track the trigger element for returning focus
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Track whether to skip auto-focus for the current open event
  const skipAutoFocusRef = useRef(false);

  // Core layer for popover positioning
  const layer = useXDSLayer({
    mode: 'context',
    lightDismiss: hasLightDismiss,
    onShow,
    onHide,
  });

  // Focus trap for the popover content
  const {containerRef: contentRef, focusFirst} = useFocusTrap<HTMLDivElement>({
    isActive: layer.isOpen,
    onEscape: layer.hide,
  });

  // Auto-focus first element when popover opens (unless skipped)
  useEffect(() => {
    if (layer.isOpen && hasAutoFocus && !skipAutoFocusRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        focusFirst();
      });
    }
    // Reset the skip flag after the effect runs
    if (!layer.isOpen) {
      skipAutoFocusRef.current = false;
    }
  }, [layer.isOpen, hasAutoFocus, focusFirst]);

  // Combined ref for trigger element (layer anchor + our ref)
  const triggerRef = useCallback(
    (el: HTMLElement | null) => {
      triggerElementRef.current = el;
      layer.ref(el);
    },
    [layer],
  );

  // Show function with optional skipAutoFocus
  const show = useCallback(
    (showOptions?: {skipAutoFocus?: boolean}) => {
      skipAutoFocusRef.current = showOptions?.skipAutoFocus ?? false;
      layer.show();
    },
    [layer],
  );

  // Toggle function
  const toggle = useCallback(() => {
    if (layer.isOpen) {
      layer.hide();
    } else {
      show();
    }
  }, [layer, show]);

  // ARIA attributes for the trigger
  const triggerProps = {
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': layer.isOpen,
    'aria-controls': layer.id,
  };

  // Wrapped render function that includes surface styles and optional hidden close button
  const render = useCallback(
    (children: ReactNode, props?: ContextRenderProps) => {
      return layer.render(
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="true"
          aria-label={dialogLabel}
          {...stylex.props(
            styles.contentWrapper,
            hasSurface && styles.surface,
            xstyle,
          )}>
          {children}
          {hasCloseButton && (
            <div {...stylex.props(styles.closeButtonWrapper)}>
              <XDSButton
                variant="secondary"
                label={closeButtonLabel}
                onClick={layer.hide}
              />
            </div>
          )}
        </div>,
        {...props, xstyle: props?.xstyle},
      );
    },
    [
      layer,
      hasCloseButton,
      hasSurface,
      closeButtonLabel,
      contentRef,
      dialogLabel,
      xstyle,
    ],
  );

  return {
    triggerRef,
    contentRef,
    anchorId: layer.anchorId,
    show,
    hide: layer.hide,
    toggle,
    isOpen: layer.isOpen,
    id: layer.id,
    render,
    triggerProps,
  };
}
