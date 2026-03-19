/**
 * @file useXDSHoverCard.ts
 * @input Uses useXDSLayer, React hooks
 * @output Exports useXDSHoverCard hook for hover/focus triggered layers
 * @position Layer hook; builds on useXDSLayer for hover card behavior
 *
 * SYNC: When modified, update:
 * - /packages/core/src/HoverCard/index.ts
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
} from '../Layer/useXDSLayer';
import {
  colorVars,
  durationVars,
  easeVars,
  shadowVars,
  radiusVars,
  spacingVars,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  // Base container styles passed to useXDSLayer (includes animations)
  container: {
    backgroundColor: colorVars['--color-surface'],
    borderRadius: radiusVars['--radius-3'],
    boxShadow: shadowVars['--shadow-hover'],
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
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
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
  // Content wrapper for padding and mouse events
  content: {
    paddingBlockStart: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-3'],
    paddingInlineStart: spacingVars['--spacing-3'],
    paddingInlineEnd: spacingVars['--spacing-3'],
  },
});

/**
 * Focus trigger behavior for hover cards
 */
export type HoverCardFocusTrigger = 'auto' | 'always' | 'never';

export interface XDSHoverCardOptions {
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
   * @default 300
   */
  delay?: number;

  /**
   * Delay before hiding after mouse/focus leave (ms)
   * @default 200
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
  focusTrigger?: HoverCardFocusTrigger;

  /**
   * Whether the hover card is enabled.
   * When false, hover/focus triggers are disabled.
   *
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Callback fired when hover card is shown.
   * Wrap in useCallback for stable identity.
   */
  onShow?: () => void;

  /**
   * Callback fired when hover card is hidden.
   * Wrap in useCallback for stable identity.
   */
  onHide?: () => void;
}

export interface XDSHoverCardReturn {
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
   * Render function for hover card content.
   * Returns anchor-positioned popover element.
   */
  renderHoverCard: (
    children: ReactNode,
    props?: ContextRenderProps,
  ) => ReactNode;

  /**
   * Imperatively show the hover card (bypassing hover delay).
   */
  show: () => void;

  /**
   * Imperatively hide the hover card.
   */
  hide: () => void;
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
 * Hook for hover card behavior with hover/focus triggers.
 *
 * Builds on useXDSLayer to add:
 * - Hover triggers with configurable delay
 * - Focus triggers with auto-detection for focusable elements
 * - Stay-open behavior when mouse/focus moves into the hover card
 *
 * @example
 * ```
 * const hoverCard = useXDSHoverCard({ placement: 'above' });
 * <XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
 *   Hover me
 * </XDSButton>
 * {hoverCard.renderHoverCard(<ProfileCard user={user} />)}
 * ```
 */
export function useXDSHoverCard(
  options: XDSHoverCardOptions = {},
): XDSHoverCardReturn {
  const {
    placement = 'above',
    alignment = 'center',
    delay = 300,
    hideDelay = 200,
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
  const isHoveringContentRef = useRef(false);
  // Track when we're dismissing via Escape to prevent re-show on refocus
  const isEscapeDismissingRef = useRef(false);

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
    hideTimeoutRef.current = setTimeout(() => {
      // Don't hide if hovering content
      if (!isHoveringContentRef.current) {
        layer.hide();
      }
    }, hideDelay);
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
    // Skip showing if we're in the middle of an Escape dismiss
    if (isEscapeDismissingRef.current) {
      isEscapeDismissingRef.current = false;
      return;
    }
    clearTimeouts();
    layer.show();
  }, [isEnabled, clearTimeouts, layer]);

  const handleFocusOut = useCallback(
    (e: FocusEvent) => {
      // Check if focus is moving to the hover card content
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      const popoverElement = document.getElementById(layer.id);

      if (popoverElement?.contains(relatedTarget)) {
        // Focus moving into hover card, keep it open
        return;
      }

      scheduleHide();
    },
    [layer.id, scheduleHide],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Stop propagation so parent components don't react to the same Escape
        e.stopPropagation();
        // Hide immediately without refocusing (we're already on trigger)
        clearTimeouts();
        layer.hide();
      }
    },
    [clearTimeouts, layer],
  );

  // Interaction ref that handles event listeners only
  const interactionRef: RefCallback<HTMLElement> = useCallback(
    (el: HTMLElement | null) => {
      // Cleanup previous element
      if (triggerRef.current) {
        triggerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        triggerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        triggerRef.current.removeEventListener('focusin', handleFocusIn);
        triggerRef.current.removeEventListener(
          'focusout',
          handleFocusOut as EventListener,
        );
        triggerRef.current.removeEventListener('keydown', handleKeyDown);
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
          el.addEventListener('focusout', handleFocusOut as EventListener);
        }

        // Attach keydown for Escape handling
        el.addEventListener('keydown', handleKeyDown);
      }

      triggerRef.current = el;
    },
    [
      focusTrigger,
      handleMouseEnter,
      handleMouseLeave,
      handleFocusIn,
      handleFocusOut,
      handleKeyDown,
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

  // Render function that wraps layer.render with hover card behavior
  const renderHoverCard = useCallback(
    (children: ReactNode, props?: ContextRenderProps) => {
      const renderProps = {
        placement: props?.placement ?? placement,
        alignment: props?.alignment ?? alignment,
        xstyle: popoverXstyle,
      };

      return layer.render(
        <div
          {...stylex.props(styles.content)}
          onMouseEnter={() => {
            isHoveringContentRef.current = true;
            clearTimeouts();
          }}
          onMouseLeave={() => {
            isHoveringContentRef.current = false;
            scheduleHide();
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              // Stop propagation so parent components don't react to the same Escape
              e.stopPropagation();
              // Set flag to prevent re-show when we refocus trigger
              isEscapeDismissingRef.current = true;
              // Hide immediately
              clearTimeouts();
              layer.hide();
              // Refocus the trigger
              triggerRef.current?.focus();
            }
          }}
          onBlur={e => {
            // Check if focus is moving back to the trigger or staying within content
            const relatedTarget = e.relatedTarget as HTMLElement | null;
            const popoverElement = e.currentTarget;

            // If focus stays within the hover card, do nothing
            if (popoverElement.contains(relatedTarget)) {
              return;
            }

            // If focus is moving back to the trigger, do nothing
            if (triggerRef.current?.contains(relatedTarget)) {
              return;
            }

            // Focus is leaving the hover card entirely
            scheduleHide();
          }}>
          {children}
        </div>,
        renderProps,
      );
    },
    [layer, placement, alignment, clearTimeouts, scheduleHide, popoverXstyle],
  );

  return {
    ref,
    positionRef: layer.ref,
    interactionRef,
    anchorId: layer.anchorId,
    describedBy: layer.id,
    renderHoverCard,
    show: layer.show,
    hide: layer.hide,
  };
}
