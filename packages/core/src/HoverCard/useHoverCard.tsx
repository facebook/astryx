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
  useState,
  type CSSProperties,
  type ReactNode,
  type RefCallback,
} from 'react';
import {createPortal} from 'react-dom';
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
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';

const styles = stylex.create({
  // Base container styles passed to useLayer
  container: {
    backgroundColor: colorVars['--color-background-surface'],
    '--_hovercard-radius': radiusVars['--radius-container'],
    borderRadius: 'var(--_hovercard-radius)',
    boxShadow: shadowVars['--shadow-med'],
  },
  // Position-based margin styles
  // Lazily mounted content wrapper for padding and mouse events.
  // `display: block` keeps the wrapper a block box even though the shell and
  // wrapper render as spans.
  content: {
    display: 'block',
    paddingBlockStart: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-3'],
    paddingInlineStart: spacingVars['--spacing-3'],
    paddingInlineEnd: spacingVars['--spacing-3'],
  },
});

function readPortalStyles(element: HTMLElement): CSSProperties {
  const computedStyle =
    element.ownerDocument.defaultView?.getComputedStyle(element);
  if (!computedStyle) {
    return {};
  }

  const customProperties: Record<string, string> = {};
  for (let index = 0; index < computedStyle.length; index++) {
    const property = computedStyle.item(index);
    if (property.startsWith('--')) {
      customProperties[property] = computedStyle.getPropertyValue(property);
    }
  }

  return {
    ...customProperties,
    // Logical anchor-positioning keywords resolve against the popover's own
    // writing mode, so preserve these inherited values across the portal too.
    direction: computedStyle.direction as CSSProperties['direction'],
    writingMode: computedStyle.writingMode as CSSProperties['writingMode'],
  };
}

/**
 * Focus trigger behavior for hover cards
 */
export type HoverCardFocusTrigger = 'auto' | 'always' | 'never';

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
    isEnabled = true,
    label,
    isOpen,
    isDefaultOpen = false,
    onShow,
    onHide,
  } = options;

  const layer = useLayer({
    mode: 'context',
    onShow,
    onHide,
  });

  const popoverXstyle = styles.container;

  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isHoveringContentRef = useRef(false);
  const [shouldRenderContent, setShouldRenderContent] = useState(false);
  const isContentRenderedRef = useRef(false);
  const pendingShowRef = useRef(false);
  const portalTargetRef = useRef<HTMLElement | null>(null);
  const portalStyleRef = useRef<CSSProperties>({});
  // Track when we're dismissing via Escape to prevent re-show on refocus
  const isEscapeDismissingRef = useRef(false);

  // Commit consumer content before opening the already-mounted popover shell.
  // The shell is phrasing-safe and can participate in SSR/hydration; arbitrary
  // card content is omitted until an interaction actually requests the card.
  useIsomorphicLayoutEffect(() => {
    isContentRenderedRef.current = shouldRenderContent;
    if (shouldRenderContent && pendingShowRef.current) {
      pendingShowRef.current = false;
      layer.show();
    }
  }, [shouldRenderContent, layer]);

  const show = useCallback(() => {
    if (isContentRenderedRef.current) {
      layer.show();
      return;
    }

    // Inspect the empty inline shell before mounting consumer content. If the
    // shell lives in a paragraph, unsafe content can be committed directly to
    // a portal without ever producing an invalid <p> descendant.
    const ownerDocument = triggerRef.current?.ownerDocument;
    const inlineLayer = ownerDocument?.getElementById(layer.id);
    const paragraph = inlineLayer?.closest('p');
    if (inlineLayer && paragraph?.parentElement) {
      // Render beside the paragraph rather than at the end of the document.
      // This gives rich content valid ancestry while keeping it inside any
      // nested Theme scope that contains the paragraph.
      portalTargetRef.current = paragraph.parentElement;
      portalStyleRef.current = readPortalStyles(inlineLayer);
    } else {
      portalTargetRef.current = null;
      portalStyleRef.current = {};
    }

    pendingShowRef.current = true;
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- controlled/default-open effects intentionally request the same lazy content transition as pointer and focus events
    setShouldRenderContent(true);
  }, [layer]);

  const hide = useCallback(() => {
    pendingShowRef.current = false;
    layer.hide();
    isContentRenderedRef.current = false;
    portalTargetRef.current = null;
    portalStyleRef.current = {};
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- controlled close intentionally removes lazily rendered content after closing the popover
    setShouldRenderContent(false);
  }, [layer]);

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
      show();
    }, delay);
  }, [isEnabled, isOpen, clearTimeouts, show, delay]);

  // Schedule hide with delay (suppressed when isOpen is true)
  const scheduleHide = useCallback(() => {
    if (isOpen === true) {
      return;
    }
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      // Don't hide if hovering content
      if (!isHoveringContentRef.current) {
        hide();
      }
    }, hideDelay);
  }, [isOpen, clearTimeouts, hide, hideDelay]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    scheduleShow();
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handleFocusIn = useCallback(() => {
    if (!isEnabled) {
      return;
    }
    // Skip showing if we're in the middle of an Escape dismiss
    if (isEscapeDismissingRef.current) {
      isEscapeDismissingRef.current = false;
      return;
    }
    clearTimeouts();
    show();
  }, [isEnabled, clearTimeouts, show]);

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
        hide();
      }
    },
    [clearTimeouts, hide],
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
    [layer, interactionRef],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      pendingShowRef.current = false;
    };
  }, [clearTimeouts]);

  // Show on mount when isDefaultOpen is true
  useEffect(() => {
    if (isDefaultOpen) {
      show();
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
      show();
    } else {
      clearTimeouts();
      hide();
    }
  }, [isOpen, clearTimeouts, show, hide]);

  // Render function that wraps layer.render with hover card behavior
  const renderHoverCard = useCallback(
    (
      children: ReactNode,
      props?: Omit<ContextRenderProps, 'positioning'>,
    ): ReactNode => {
      const renderPlacement = props?.placement ?? placement;
      const themeClassName = themeProps('hovercard').className;
      const portalTarget = portalTargetRef.current;
      const shouldPortal = shouldRenderContent && portalTarget !== null;
      const ContentWrapper = shouldPortal ? 'div' : 'span';
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
        // customizing the card targets the same element as the theme. The
        // inner wrapper keeps `styles.content` for padding.
        xstyle: [
          popoverXstyle,
          layerAnimations[renderPlacement],
          props?.xstyle,
        ],
        className: props?.className
          ? `${themeClassName} ${props.className}`
          : themeClassName,
        // Moving beside the paragraph leaves paragraph-local inheritance, so
        // snapshot every computed custom property from the inline shell and
        // apply it to the popover. Explicit consumer styles remain
        // authoritative.
        style: shouldPortal
          ? {...portalStyleRef.current, ...props?.style}
          : props?.style,
        // The closed shell is inline-safe and hydration-stable. Once moved
        // outside the paragraph, use a block container so rich content has
        // valid ancestry.
        as: shouldPortal ? ('div' as const) : ('span' as const),
      };

      const renderedLayer = layer.render(
        shouldRenderContent ? (
          <ContentWrapper
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
                hide();
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
          </ContentWrapper>
        ) : null,
        renderProps,
      );

      return shouldPortal
        ? createPortal(renderedLayer, portalTarget)
        : renderedLayer;
    },
    [
      layer,
      placement,
      alignment,
      label,
      shouldRenderContent,
      clearTimeouts,
      scheduleHide,
      hide,
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
    show,
    hide,
  };
}
