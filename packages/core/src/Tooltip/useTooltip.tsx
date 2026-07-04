// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTooltip.tsx
 * @input Uses useLayer, React hooks
 * @output Exports useTooltip hook for hover/focus triggered tooltips
 * @position Layer hook; builds on useLayer for tooltip behavior
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Tooltip/index.ts
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefCallback,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  useLayer,
  type ContextRenderProps,
  type LayerAlignment,
  type LayerPlacement,
} from '../Layer/useLayer';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {themeProps} from '../utils/themeProps';
import {
  colorVars,
  radiusVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';

/**
 * Grace period (ms) before hiding on pointer-leave when no explicit `hideDelay`
 * is set, so the pointer can travel across the small gap from the trigger onto
 * the tooltip surface without the tooltip disappearing (WCAG 1.4.13 hoverable).
 */
const HOVER_BRIDGE_DELAY = 100;

const styles = stylex.create({
  // Base container styles - inverted colors for high contrast
  container: {
    // Inverted color palette: dark background, light text
    backgroundColor: colorVars['--color-text-primary'],
    color: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-container'],
    // Typography
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  // Position-based margin styles
  marginBlock: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
    marginInlineStart: 0,
    marginInlineEnd: 0,
  },
  marginInline: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: spacingVars['--spacing-1'],
    marginInlineEnd: spacingVars['--spacing-1'],
  },
  // Content wrapper for padding
  content: {
    paddingBlockStart: spacingVars['--spacing-1'],
    paddingBlockEnd: spacingVars['--spacing-1'],
    paddingInlineStart: spacingVars['--spacing-2'],
    paddingInlineEnd: spacingVars['--spacing-2'],
    maxWidth: 300,
    wordBreak: 'break-word',
  },
});

/**
 * Focus trigger behavior for tooltips
 */
export type TooltipFocusTrigger = 'auto' | 'always' | 'never';

export interface TooltipOptions {
  /**
   * Position placement relative to anchor
   * @default 'above'
   */
  placement?: LayerPlacement;

  /**
   * Alignment along the placement axis
   * @default 'center'
   */
  alignment?: LayerAlignment;

  /**
   * Delay before showing on hover (ms)
   * @default 200
   */
  delay?: number;

  /**
   * Delay before hiding after mouse/focus leave (ms)
   * @default 0
   */
  hideDelay?: number;

  /**
   * When to trigger on focus:
   * - `auto`: Only if element is naturally focusable
   * - `always`: Always attach focus listeners
   * - `never`: Never attach focus listeners (for composite widgets)
   *
   * @default 'auto'
   */
  focusTrigger?: TooltipFocusTrigger;

  /**
   * Whether the tooltip is enabled.
   * When false, hover/focus triggers are disabled.
   *
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Controlled open state. When provided, overrides hover/focus triggers:
   * - `true`: force-show the tooltip (hover/focus hide is suppressed)
   * - `false`: force-hide the tooltip
   * - `undefined`: uncontrolled — hover/focus triggers manage visibility
   */
  isOpen?: boolean;

  /**
   * Whether the tooltip should be shown on mount.
   * The tooltip is still dismissible — this just opens it initially.
   */
  isDefaultOpen?: boolean;

  /**
   * Callback fired when tooltip is shown.
   * Wrap in useCallback for stable identity.
   */
  onShow?: () => void;

  /**
   * Callback fired when tooltip is hidden.
   * Wrap in useCallback for stable identity.
   */
  onHide?: () => void;
}

export interface TooltipReturn {
  /**
   * Combined ref that sets both position and interaction on the same element.
   * Shorthand for calling both positionRef and interactionRef.
   */
  ref: RefCallback<HTMLElement>;

  /**
   * Ref for the positioning anchor element.
   * Injects anchorName style for CSS anchor positioning.
   */
  positionRef: RefCallback<HTMLElement>;

  /**
   * Ref for the interaction element.
   * Attaches hover/focus event listeners via addEventListener.
   * Can be the same element as positionRef or different.
   */
  interactionRef: RefCallback<HTMLElement>;

  /**
   * The CSS anchor name to use for positioning.
   * Use this when you need to set anchorName manually (e.g., display:contents wrapper).
   */
  anchorId: string;

  /**
   * ID for aria-describedby on the trigger element.
   * Caller should compose with other IDs using mergeIds utility.
   */
  describedBy: string;

  /**
   * Render function for tooltip content.
   * Returns anchor-positioned popover element.
   */
  renderTooltip: (children: ReactNode, props?: ContextRenderProps) => ReactNode;
}

/**
 * Check if an element is naturally focusable
 */
function isFocusable(element: HTMLElement): boolean {
  // Elements with explicit tabindex
  if (element.hasAttribute('tabindex')) {
    return element.tabIndex >= 0;
  }

  // Naturally focusable elements
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  if (focusableTags.includes(element.tagName)) {
    return !(element as HTMLButtonElement).disabled;
  }

  // Elements with contenteditable
  if (element.isContentEditable) {
    return true;
  }

  return false;
}

/**
 * Hook for tooltip behavior with hover/focus triggers.
 *
 * Builds on useLayer to add:
 * - Hover triggers with configurable delay
 * - Focus triggers with auto-detection for focusable elements
 * - Inverted color palette for high contrast
 *
 * Unlike HoverCard, tooltips:
 * - Don't stay open when hovering the tooltip content
 * - Have shorter delays
 * - Use inverted colors (dark background, light text)
 * - Are typically used for short, non-interactive text
 *
 * @example
 * ```
 * const tooltip = useTooltip({ placement: 'above' });
 * <Button ref={tooltip.ref} aria-describedby={tooltip.describedBy}>
 *   Hover me
 * </Button>
 * {tooltip.renderTooltip('Helpful tooltip text')}
 * ```
 */
export function useTooltip(options: TooltipOptions = {}): TooltipReturn {
  const {
    placement = 'above',
    alignment = 'center',
    delay = 200,
    hideDelay = 0,
    focusTrigger = 'auto',
    isEnabled = true,
    isOpen,
    isDefaultOpen = false,
    onShow,
    onHide,
  } = options;

  // Select margin style based on placement axis
  const marginStyle =
    placement === 'above' || placement === 'below'
      ? styles.marginBlock
      : styles.marginInline;

  const layer = useLayer({
    mode: 'context',
    onShow,
    onHide,
  });

  const popoverXstyle = useMemo(
    () => [styles.container, marginStyle],
    [marginStyle],
  );

  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Schedule show with delay (suppressed when isOpen is false)
  const scheduleShow = useCallback(() => {
    if (!isEnabled || isOpen === false) {
      return;
    }
    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      layer.show();
    }, delay);
  }, [isEnabled, isOpen, clearTimeouts, layer, delay]);

  // Schedule hide with delay (suppressed when isOpen is true).
  // A small hover bridge (when hideDelay is 0) lets the pointer travel from the
  // trigger onto the tooltip surface without the tooltip vanishing — required
  // for WCAG 1.4.13 (Content on Hover or Focus: hoverable).
  const scheduleHide = useCallback(() => {
    if (isOpen === true) {
      return;
    }
    clearTimeouts();
    const effectiveHideDelay = hideDelay > 0 ? hideDelay : HOVER_BRIDGE_DELAY;
    hideTimeoutRef.current = setTimeout(() => {
      layer.hide();
    }, effectiveHideDelay);
  }, [isOpen, clearTimeouts, layer, hideDelay]);

  // Cancel a pending hide (e.g. the pointer entered the tooltip surface).
  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    // Suppress tooltips on touch devices — hover is simulated and eats a tap
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: none)').matches
    ) {
      return;
    }
    scheduleShow();
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handleFocusIn = useCallback(
    (e: Event) => {
      if (!isEnabled) {
        return;
      }
      // Only show tooltip for keyboard focus (:focus-visible),
      // not programmatic focus (e.g. dialog auto-focus, touch tap)
      const target = e.target as HTMLElement;
      if (!target.matches(':focus-visible')) {
        return;
      }
      clearTimeouts();
      layer.show();
    },
    [isEnabled, clearTimeouts, layer],
  );

  const handleFocusOut = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  // Interaction ref that handles event listeners only
  const interactionRef: RefCallback<HTMLElement> = useCallback(
    (el: HTMLElement | null) => {
      // Cleanup previous element
      if (triggerRef.current) {
        triggerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        triggerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        triggerRef.current.removeEventListener('focusin', handleFocusIn);
        triggerRef.current.removeEventListener('focusout', handleFocusOut);
      }

      if (el) {
        // Attach hover listeners
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);

        // Attach focus listeners based on focusTrigger option
        const shouldAttachFocus =
          focusTrigger === 'always' ||
          (focusTrigger === 'auto' && isFocusable(el));

        if (shouldAttachFocus) {
          el.addEventListener('focusin', handleFocusIn);
          el.addEventListener('focusout', handleFocusOut);
        }
      }

      triggerRef.current = el;
    },
    [
      focusTrigger,
      handleMouseEnter,
      handleMouseLeave,
      handleFocusIn,
      handleFocusOut,
    ],
  );

  // Combined ref - shorthand for calling both positionRef and interactionRef
  const ref: RefCallback<HTMLElement> = useCallback(
    (el: HTMLElement | null) => {
      layer.ref(el);
      interactionRef(el);
    },
    [layer, interactionRef],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  // Show on mount when isDefaultOpen is true
  useEffect(() => {
    if (isDefaultOpen) {
      layer.show();
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- mount-only: isDefaultOpen is not reactive
  }, []);

  // Controlled open state — overrides hover/focus triggers
  useEffect(() => {
    if (isOpen === undefined) {
      return;
    }
    if (isOpen) {
      clearTimeouts();
      layer.show();
    } else {
      clearTimeouts();
      layer.hide();
    }
  }, [isOpen, clearTimeouts, layer]);

  // Dismiss on Escape (WCAG 1.4.13 — dismissible). Uncontrolled tooltips only;
  // a controlled tooltip's visibility is owned by the consumer. The listener is
  // mounted for the lifetime of an uncontrolled tooltip rather than gated on
  // `layer.isOpen` (React state, which can lag a frame behind the DOM) —
  // `layer.hide()` self-guards and no-ops when the layer is already closed.
  // Guarded against IME composition-cancel.
  useEffect(() => {
    if (isOpen !== undefined) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') {
        return;
      }
      if (e.isComposing || e.keyCode === 229) {
        return;
      }
      clearTimeouts();
      layer.hide();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, layer, clearTimeouts]);

  // Render function that wraps layer.render with tooltip styling
  const renderTooltip = useCallback(
    (children: ReactNode, props?: ContextRenderProps): ReactNode => {
      const renderPlacement = props?.placement ?? placement;
      const renderProps = {
        placement: renderPlacement,
        alignment: props?.alignment ?? alignment,
        role: 'tooltip',
        xstyle: [popoverXstyle, layerAnimations[renderPlacement]],
        className: themeProps('tooltip').className,
        // Keep the tooltip open while the pointer is over the surface itself
        // (WCAG 1.4.13 hoverable). These sit on the layer container — the
        // element the user actually hovers — not the inner content div, since
        // mouseenter/leave do not bubble.
        onMouseEnter: cancelHide,
        onMouseLeave: scheduleHide,
      };

      return layer.render(
        <div {...stylex.props(styles.content)}>{children}</div>,
        renderProps,
      );
    },
    [layer, placement, alignment, popoverXstyle, cancelHide, scheduleHide],
  );

  return {
    ref,
    positionRef: layer.ref,
    interactionRef,
    anchorId: layer.anchorId,
    describedBy: layer.id,
    renderTooltip,
  };
}
