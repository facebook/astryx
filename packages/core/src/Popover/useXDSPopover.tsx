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

'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  useXDSLayer,
  type ContextRenderProps,
  type LayerPlacement,
  type LayerAlignment,
} from '../Layer/useXDSLayer';
import {useFocusTrap} from '../hooks/useFocusTrap';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  // Focus trap container
  contentWrapper: {
    position: 'relative',
  },
  // Hidden close button - visually hidden until focused
  closeButton: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
    pointerEvents: 'none', // Prevent mouse clicks when hidden
  },
  // Revealed state when focused - positioned bottom center, outside popover
  closeButtonFocused: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translate(-50%, 100%)',
    width: 'auto',
    height: 'auto',
    padding: spacingVars['--spacing-2'],
    margin: 0,
    overflow: 'visible',
    clip: 'auto',
    whiteSpace: 'nowrap',
    // Inverted color palette (like tooltip): dark background, light text
    backgroundColor: colorVars['--color-text-primary'],
    color: colorVars['--color-surface'],
    fontSize: textSizeVars['--text-sm'],
    borderRadius: radiusVars['--radius-2'],
    cursor: 'pointer',
    borderWidth: 0,
    borderStyle: 'none',
    outline: `2px solid ${colorVars['--color-ring-focus']}`,
    outlineOffset: 2,
    zIndex: 1,
    pointerEvents: 'auto', // Re-enable mouse clicks when visible
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
   * StyleX styles for the popover container
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
   * Set to false for menus or selectors with different focus behavior.
   * @default true
   */
  hasCloseButton?: boolean;

  /**
   * Label for the hidden close button.
   * Only used when hasCloseButton is true.
   * @default "Close popover"
   */
  closeButtonLabel?: string;

  /**
   * Accessible label for the dialog.
   * Required for screen readers to announce the dialog purpose.
   */
  dialogLabel?: string;
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
  contentRef: React.RefObject<HTMLElement | null>;

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
    hasCloseButton = true,
    closeButtonLabel = 'Close popover',
    dialogLabel,
  } = options;

  // Track whether close button is focused (to show tooltip)
  const [isCloseButtonFocused, setIsCloseButtonFocused] = useState(false);

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
  const {containerRef: contentRef, focusFirst} = useFocusTrap({
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

  // Reset close button focus state when popover closes
  useEffect(() => {
    if (!layer.isOpen) {
      setIsCloseButtonFocused(false);
    }
  }, [layer.isOpen]);

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

  // Wrapped render function that includes optional hidden close button
  const render = useCallback(
    (children: ReactNode, props?: ContextRenderProps) => {
      return layer.render(
        <div
          ref={contentRef as React.RefObject<HTMLDivElement | null>}
          role="dialog"
          aria-modal="true"
          aria-label={dialogLabel}
          {...stylex.props(styles.contentWrapper)}>
          {children}
          {hasCloseButton && (
            <button
              type="button"
              onClick={layer.hide}
              onFocus={() => setIsCloseButtonFocused(true)}
              onBlur={() => setIsCloseButtonFocused(false)}
              aria-label={closeButtonLabel}
              {...stylex.props(
                styles.closeButton,
                isCloseButtonFocused && styles.closeButtonFocused,
              )}>
              {closeButtonLabel}
            </button>
          )}
        </div>,
        {...props, xstyle: xstyle ?? props?.xstyle},
      );
    },
    [
      layer,
      hasCloseButton,
      closeButtonLabel,
      isCloseButtonFocused,
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
