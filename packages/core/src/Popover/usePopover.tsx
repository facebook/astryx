// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePopover.tsx
 * @input Uses useLayer, useFocusTrap, React hooks
 * @output Exports usePopover hook for popover dialogs with focus trapping
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
import {useLayer, type ContextRenderProps} from '../Layer/useLayer';
import {useFocusTrap} from '../hooks/useFocusTrap';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  shadowVars,
} from '../theme/tokens.stylex';
import {Button} from '../Button';
import {useTranslator} from '../i18n';

const styles = stylex.create({
  // Default popover surface — background, radius, shadow.
  // Applied automatically unless hasSurface is false.
  // Consumers that need a raw positioned layer should use useLayer instead.
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
 * Options for usePopover
 */
export interface UsePopoverOptions {
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
   * Whether pressing Escape dismisses the popover.
   *
   * Takes effect together with `hasLightDismiss: false`: with light dismiss
   * on, the native popover uses `popover="auto"`, whose browser-level light
   * dismiss also closes on Escape, so Escape handling stays registered to
   * keep topmost-only dismissal intact. Set both to `false` for
   * explicit-dismiss-only surfaces like onboarding coachmarks.
   *
   * @default true
   */
  hasEscapeDismiss?: boolean;

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
   * Required for screen readers to announce the dialog purpose
   * (only applies when `role` is `'dialog'`).
   */
  dialogLabel?: string;

  /**
   * ARIA role stamped on the popover content wrapper.
   *
   * - `'dialog'` (default): the wrapper is a `role="dialog"` and, when
   *   `isModal` is true, carries `aria-modal`. Use for genuine dialog content.
   * - `'none'`: the wrapper carries no role or `aria-modal`, so the popup's own
   *   content role (e.g. a child `role="listbox"` or `role="menu"`) is the
   *   exposed semantics. Use for comboboxes, listboxes, and menus — their
   *   trigger keeps DOM focus, so announcing an unnamed modal dialog around
   *   them is incorrect.
   *
   * @default 'dialog'
   */
  role?: 'dialog' | 'none';

  /**
   * Whether the dialog is modal (`aria-modal`). Only applies when `role` is
   * `'dialog'`. Set to `false` for non-modal dialogs that do not inert the rest
   * of the page.
   *
   * @default true
   */
  isModal?: boolean;

  /**
   * Whether to apply the default popover surface (background, border-radius,
   * box-shadow) to the content wrapper.
   *
   * Set to false when the popover content provides its own surface styling
   * (e.g., mega menus with custom layouts). If you find yourself opting out,
   * consider whether useLayer is a better fit.
   *
   * @default true
   */
  hasSurface?: boolean;
}

/**
 * Return type for usePopover
 */
export interface UsePopoverReturn {
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
    'aria-haspopup': 'dialog' | 'true';
    'aria-expanded': boolean;
    'aria-controls': string;
  };
}

/**
 * Hook for creating popover dialogs with focus trapping.
 *
 * Combines:
 * - `useLayer` for popover positioning using CSS anchor positioning
 * - `useFocusTrap` for trapping focus within the popover content
 * - Auto-focus first element on open
 * - Escape key to close (configurable via hasEscapeDismiss)
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
 *   const popover = usePopover({
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
export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
  const {
    onShow,
    onHide,
    xstyle,
    hasLightDismiss = true,
    hasEscapeDismiss = true,
    hasAutoFocus = true,
    hasSurface = true,
    hasCloseButton = true,
    closeButtonLabel: closeButtonLabelFromProps,
    dialogLabel,
    role = 'dialog',
    isModal = true,
  } = options;

  const t = useTranslator();
  const closeButtonLabel =
    closeButtonLabelFromProps ?? t('@astryx.popover.close');

  // Track the trigger element for returning focus
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Track whether to skip auto-focus for the current open event
  const skipAutoFocusRef = useRef(false);

  // Core layer for popover positioning
  const layer = useLayer({
    mode: 'context',
    lightDismiss: hasLightDismiss,
    onShow,
    onHide,
  });

  // Focus trap for the popover content. Escape stays registered while light
  // dismiss is on (native popover="auto" closes on Escape regardless), so a
  // host Dialog keeps deferring to this trap instead of double-dismissing.
  const {containerRef: contentRef, focusFirst} = useFocusTrap<HTMLDivElement>({
    isActive: layer.isOpen,
    onEscape: hasEscapeDismiss || hasLightDismiss ? layer.hide : undefined,
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
    'aria-haspopup':
      role === 'dialog' ? ('dialog' as const) : ('true' as const),
    'aria-expanded': layer.isOpen,
    'aria-controls': layer.id,
  };

  // Dev-time guardrail: a dialog popover should always be labeled. Warn once
  // per hook instance (in an effect) rather than on every render.
  const warnedUnnamedDialogRef = useRef(false);
  useEffect(() => {
    if (role === 'dialog' && !dialogLabel && !warnedUnnamedDialogRef.current) {
      warnedUnnamedDialogRef.current = true;
      console.warn(
        'usePopover: role="dialog" without a `dialogLabel` renders an unnamed ' +
          'dialog. Pass `dialogLabel`, or use `role: "none"` for listbox/menu ' +
          'popups whose content already carries its own role.',
      );
    }
  }, [role, dialogLabel]);

  // Wrapped render function that includes surface styles and optional hidden close button
  const render = useCallback(
    (children: ReactNode, props?: ContextRenderProps): ReactNode => {
      return layer.render(
        <div
          ref={contentRef}
          role={role === 'dialog' ? 'dialog' : undefined}
          aria-modal={role === 'dialog' && isModal ? true : undefined}
          aria-label={role === 'dialog' ? dialogLabel : undefined}
          {...stylex.props(
            styles.contentWrapper,
            hasSurface && styles.surface,
            xstyle,
          )}>
          {children}
          {hasCloseButton && (
            <div {...stylex.props(styles.closeButtonWrapper)}>
              <Button
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
      role,
      isModal,
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
