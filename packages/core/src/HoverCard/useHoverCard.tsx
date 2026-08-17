// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useHoverCard.ts
 * @input Uses useLayer, React hooks
 * @output Exports useHoverCard hook for hover/focus triggered layers
 * @position Layer hook; builds on useLayer for hover card behavior
 *
 * SYNC: When modified, update:
 * - /packages/core/src/HoverCard/index.ts
 */

import {
  useCallback,
  useEffect,
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
import {
  colorVars,
  shadowVars,
  radiusVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  // Base container styles passed to useLayer
  container: {
    backgroundColor: colorVars['--color-background-surface'],
    '--_hovercard-radius': radiusVars['--radius-container'],
    borderRadius: 'var(--_hovercard-radius)',
    boxShadow: shadowVars['--shadow-med'],
  },
  // Content wrapper for padding and interaction events.
  content: {
    display: 'block',
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

/**
 * Touch trigger behavior for hover cards
 */
export type HoverCardTouchTrigger = 'auto' | 'always' | 'never';

/**
 * Elements whose activation a tap belongs to. A tap that lands on one of these
 * is the user asking for its action, so `touchTrigger: 'auto'` leaves it alone.
 */
const ACTIVATION_SELECTOR =
  'a[href], button, input, select, textarea, summary, [role="button"], [role="link"], [role="menuitem"], [role="tab"], [contenteditable=""], [contenteditable="true"]';

function isActivationTap(target: EventTarget | null): boolean {
  return (
    target instanceof Element && target.closest(ACTIVATION_SELECTOR) !== null
  );
}

export interface HoverCardOptions {
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
   * How a touch tap on the trigger behaves. There is no hover on touch, so a
   * tap has to stand in for it — and a tap is also how the trigger's own
   * action is invoked:
   * - `auto`: the card opens on the first tap only when the tap is not an
   *   activation of something (a link, a button). On a link or button the card
   *   stays closed and the tap does what it looks like it does.
   * - `always`: the two-tap contract on any trigger — the first tap opens the
   *   card and is consumed, the second tap activates the trigger. Costs every
   *   touch user a tap, so it is opt-in.
   * - `never`: taps never open the card.
   *
   * @default 'auto'
   */
  touchTrigger?: HoverCardTouchTrigger;

  /**
   * Whether the hover card is enabled.
   * When false, hover/focus triggers are disabled.
   *
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Accessible name for the hover card popup.
   *
   * When provided, the popup is exposed to assistive technology as a named
   * `role="dialog"`. When omitted, the popup falls back to `role="group"` —
   * a group may validly be unnamed, an unnamed dialog may not.
   */
  label?: string;

  /**
   * Controlled open state. When provided, overrides hover/focus triggers:
   * - `true`: force-show the hover card (hover/focus hide is suppressed)
   * - `false`: force-hide the hover card
   * - `undefined`: uncontrolled — hover/focus triggers manage visibility
   */
  isOpen?: boolean;

  /**
   * Whether the hover card should be shown on mount.
   * The hover card is still dismissible — this just opens it initially.
   */
  isDefaultOpen?: boolean;

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

export interface HoverCardReturn {
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
   *
   * `positioning` is excluded: the hover card always derives its position
   * from placement/alignment, so accepting the custom opt-out here would be
   * a silent no-op.
   */
  renderHoverCard: (
    children: ReactNode,
    props?: Omit<ContextRenderProps, 'positioning'>,
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
 * Builds on useLayer to add:
 * - Hover triggers with configurable delay
 * - Focus triggers with auto-detection for focusable elements
 * - Stay-open behavior when mouse/focus moves into the hover card
 *
 * @example
 * ```
 * const hoverCard = useHoverCard({ placement: 'above' });
 * <Button ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
 *   Hover me
 * </Button>
 * {hoverCard.renderHoverCard(<ProfileCard user={user} />)}
 * ```
 */
export function useHoverCard(options: HoverCardOptions = {}): HoverCardReturn {
  const {
    placement = 'above',
    alignment = 'center',
    delay = 300,
    hideDelay = 200,
    focusTrigger = 'auto',
    touchTrigger = 'auto',
    isEnabled = true,
    label,
    isOpen,
    isDefaultOpen = false,
    onShow,
    onHide,
  } = options;

  // Mirrors the layer's open state synchronously, and records whether the
  // open card came from a tap: the second tap of the touch contract has to
  // read both while the gesture is still in flight.
  const isCardOpenRef = useRef(false);
  const isTouchOpenRef = useRef(false);

  const handleLayerShow = useCallback(() => {
    isCardOpenRef.current = true;
    onShow?.();
  }, [onShow]);

  const handleLayerHide = useCallback(() => {
    isCardOpenRef.current = false;
    isTouchOpenRef.current = false;
    onHide?.();
  }, [onHide]);

  const layer = useLayer({
    mode: 'context',
    lazyMount: true,
    onShow: handleLayerShow,
    onHide: handleLayerHide,
  });

  const popoverXstyle = styles.container;

  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isHoveringContentRef = useRef(false);
  // Track when we're dismissing via Escape to prevent re-show on refocus
  const isEscapeDismissingRef = useRef(false);
  // Pointer type of the interaction currently on the trigger. Read by the
  // hover, focus and click handlers so a touch gesture and a mouse gesture
  // can be told apart on the same element (a hybrid device has both).
  const pointerTypeRef = useRef<string | null>(null);

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

  // Schedule hide with delay (suppressed when isOpen is true)
  const scheduleHide = useCallback(() => {
    if (isOpen === true) {
      return;
    }
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      // Don't hide if hovering content
      if (!isHoveringContentRef.current) {
        layer.hide();
      }
    }, hideDelay);
  }, [isOpen, clearTimeouts, layer, hideDelay]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    // On touch the browser synthesizes this from the tap itself, so honoring
    // it would open the card as a side effect of activating the trigger.
    // Touch opens go through the tap contract in handleClick instead.
    if (pointerTypeRef.current === 'touch') {
      return;
    }
    scheduleShow();
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handleFocusIn = useCallback(() => {
    if (!isEnabled) {
      return;
    }
    // A tap focuses the trigger too; that focus is not a request to preview.
    if (pointerTypeRef.current === 'touch') {
      return;
    }
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
      // A key press ends any pointer gesture's claim on the trigger, so a
      // keyboard interaction after a tap is never read as touch.
      pointerTypeRef.current = null;
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

  const handlePointerEnter = useCallback((e: PointerEvent) => {
    pointerTypeRef.current = e.pointerType;
  }, []);

  // The touch contract. A tap is the only gesture touch has, and the trigger
  // may already own it, so the card only takes a tap when it is not taking an
  // activation with it (`auto`) or when the consumer opted in (`always`).
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (pointerTypeRef.current !== 'touch') {
        return;
      }
      if (!isEnabled || touchTrigger === 'never' || isOpen !== undefined) {
        return;
      }

      if (isCardOpenRef.current) {
        // Second tap: the trigger's action runs and the card steps aside.
        clearTimeouts();
        layer.hide();
        return;
      }

      if (touchTrigger === 'auto' && isActivationTap(e.target)) {
        return;
      }

      // First tap: preview instead of activating. Capture-phase, so a consumer
      // click handler on the trigger does not run either.
      e.preventDefault();
      e.stopPropagation();
      clearTimeouts();
      isTouchOpenRef.current = true;
      layer.show();
    },
    [isEnabled, touchTrigger, isOpen, clearTimeouts, layer],
  );

  // Interaction ref that handles event listeners only
  const interactionRef: RefCallback<HTMLElement> = useCallback(
    (el: HTMLElement | null) => {
      // Cleanup previous element
      if (triggerRef.current) {
        triggerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        triggerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        triggerRef.current.removeEventListener(
          'pointerenter',
          handlePointerEnter as EventListener,
        );
        triggerRef.current.removeEventListener(
          'click',
          handleClick as EventListener,
          true,
        );
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

        // Touch: which gesture is on the trigger, and the tap contract.
        el.addEventListener(
          'pointerenter',
          handlePointerEnter as EventListener,
        );
        el.addEventListener('click', handleClick as EventListener, true);

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
      handlePointerEnter,
      handleClick,
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
    [layer, interactionRef],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  // A tap-opened card cannot rely on pointer-leave to close it: touch has no
  // leave, and the mouseleave the browser synthesizes from the next tap is not
  // a contract. Dismiss on the first touch outside the trigger and the card.
  useEffect(() => {
    if (!layer.isOpen || !isTouchOpenRef.current) {
      return;
    }
    const handleOutsidePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        return;
      }
      const target = e.target as Node | null;
      if (triggerRef.current?.contains(target ?? null)) {
        return;
      }
      if (document.getElementById(layer.id)?.contains(target ?? null)) {
        return;
      }
      clearTimeouts();
      layer.hide();
    };
    document.addEventListener(
      'pointerdown',
      handleOutsidePointerDown as EventListener,
      true,
    );
    return () => {
      document.removeEventListener(
        'pointerdown',
        handleOutsidePointerDown as EventListener,
        true,
      );
    };
  }, [layer, clearTimeouts]);

  // Show on mount when isDefaultOpen is true
  useEffect(() => {
    if (isDefaultOpen) {
      layer.show();
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps -- intentionally only on mount
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

  // Render function that wraps layer.render with hover card behavior
  const renderHoverCard = useCallback(
    (
      children: ReactNode,
      props?: Omit<ContextRenderProps, 'positioning'>,
    ): ReactNode => {
      const renderPlacement = props?.placement ?? placement;
      const themeClassName = themeProps('hovercard').className;
      const renderProps = {
        placement: renderPlacement,
        alignment: props?.alignment ?? alignment,
        offset: spacingVars['--spacing-1'],
        // A named dialog when a label is provided; otherwise a group. A group
        // may validly be unnamed, an unnamed dialog may not — and hover cards
        // are non-modal, so group is honest semantics without a name.
        role: label ? 'dialog' : 'group',
        'aria-label': label || undefined,
        // Consumer surface style props land on the layer container — the
        // themed surface (bg/radius/shadow) where the theme class lives — so
        // customizing the card targets the same element as the theme. The inner
        // div keeps `styles.content` for padding.
        xstyle: [
          popoverXstyle,
          layerAnimations[renderPlacement],
          props?.xstyle,
        ],
        className: props?.className
          ? `${themeClassName} ${props.className}`
          : themeClassName,
        style: props?.style,
        // useLayer mounts only after it has verified or corrected the parent,
        // so rich HoverCard content can use block-safe markup.
        as: 'div' as const,
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
    [
      layer,
      placement,
      alignment,
      label,
      clearTimeouts,
      scheduleHide,
      popoverXstyle,
    ],
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
