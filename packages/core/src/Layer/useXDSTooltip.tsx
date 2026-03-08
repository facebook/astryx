/**
 * @file useXDSTooltip.tsx
 * @input Uses useXDSLayer, React hooks
 * @output Exports useXDSTooltip hook for hover/focus triggered tooltips
 * @position Layer hook; builds on useXDSLayer for tooltip behavior
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/Layer.doc.mjs
 * - /packages/core/src/Layer/index.ts
 */

'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type RefCallback,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  useXDSLayer,
  type ContextRenderProps,
  type LayerAlignment,
  type LayerPlacement,
} from './useXDSLayer';
import {
  colorVars,
  radiusVars,
  spacingVars,
  typographyVars,
  lineHeightVars,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  // Base container styles - inverted colors for high contrast
  container: {
    // Inverted color palette: dark background, light text
    backgroundColor: colorVars['--color-text-primary'],
    color: colorVars['--color-surface'],
    borderRadius: radiusVars['--radius-element'],
    // Typography
    fontFamily: typographyVars['--font-body'],
    fontSize: 14,
    lineHeight: lineHeightVars['--leading-base'],
    // Animation: closed state (default) and open state
    opacity: {
      default: 0,
      ':popover-open': 1,
    },
    transform: {
      default: 'scale(0.95)',
      ':popover-open': 'scale(1)',
    },
    // Transitions with allow-discrete for display/overlay
    transitionProperty: 'opacity, transform, overlay, display',
    transitionDuration: '0.1s',
    transitionTimingFunction: 'ease',
    transitionBehavior: 'allow-discrete',
    // Entry animation starting state
    '@starting-style': {
      opacity: 0,
      transform: 'scale(0.95)',
    },
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

export interface XDSTooltipOptions {
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
   * Callback fired when tooltip is shown
   */
  onShow?: () => void;

  /**
   * Callback fired when tooltip is hidden
   */
  onHide?: () => void;
}

export interface XDSTooltipReturn {
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
 * Builds on useXDSLayer to add:
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
 * const tooltip = useXDSTooltip({ placement: 'above' });
 *
 * <XDSButton ref={tooltip.ref} aria-describedby={tooltip.describedBy}>
 *   Hover me
 * </XDSButton>
 *
 * {tooltip.renderTooltip('Helpful tooltip text')}
 * ```
 */
export function useXDSTooltip(
  options: XDSTooltipOptions = {},
): XDSTooltipReturn {
  const {
    placement = 'above',
    alignment = 'center',
    delay = 200,
    hideDelay = 0,
    focusTrigger = 'auto',
    isEnabled = true,
    onShow,
    onHide,
  } = options;

  // Select margin style based on placement axis
  const marginStyle =
    placement === 'above' || placement === 'below'
      ? styles.marginBlock
      : styles.marginInline;

  const layer = useXDSLayer({
    mode: 'context',
    onShow,
    onHide,
  });

  // StyleX for the popover container
  const popoverXstyle = [styles.container, marginStyle];

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

  // Schedule show with delay
  const scheduleShow = useCallback(() => {
    if (!isEnabled) return;
    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      layer.show();
    }, delay);
  }, [isEnabled, clearTimeouts, layer, delay]);

  // Schedule hide with delay
  const scheduleHide = useCallback(() => {
    clearTimeouts();
    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        layer.hide();
      }, hideDelay);
    } else {
      layer.hide();
    }
  }, [clearTimeouts, layer, hideDelay]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    scheduleShow();
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handleFocusIn = useCallback(() => {
    if (!isEnabled) return;
    clearTimeouts();
    layer.show();
  }, [isEnabled, clearTimeouts, layer]);

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
    [layer.ref, interactionRef],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  // Render function that wraps layer.render with tooltip styling
  const renderTooltip = useCallback(
    (children: ReactNode, props?: ContextRenderProps) => {
      const renderProps = {
        placement: props?.placement ?? placement,
        alignment: props?.alignment ?? alignment,
        xstyle: popoverXstyle,
      };

      return layer.render(
        <div {...stylex.props(styles.content)}>{children}</div>,
        renderProps,
      );
    },
    [layer, placement, alignment, popoverXstyle],
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
