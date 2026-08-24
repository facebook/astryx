// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLayer.tsx
 * @input Uses React hooks, Popover API, CSS anchor positioning, typography tokens
 * @output Exports useLayer hook for layer positioning and visibility
 * @position Core layer utility; used by useHoverCard, useTooltip, etc.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/useLayer.doc.mjs
 * - /packages/core/src/Layer/useLayer.test.tsx
 * - /packages/core/src/Layer/index.ts
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefCallback,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {createPortal} from 'react-dom';
import {addAnchorName, removeAnchorName} from './anchorName';
import {resolveLayerPortalTarget} from './layerHost';
import {typeScaleVars, typographyVars} from '../theme/tokens.stylex';
import {overlayPaddingReset} from '../Layout/padding.stylex';

const styles = stylex.create({
  // Base reset for all layers
  base: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    borderWidth: 0,
    borderStyle: 'none',
    overflow: 'visible',
    // A layer is hosted wherever its trigger happens to sit, so type that is
    // inherited rather than declared makes the same component render at a
    // different size in different callers.
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    // Override browser default [popover] background (canvas color)
    backgroundColor: 'transparent',
  },
  // Fixed positioning mode
  fixed: {
    position: 'fixed',
  },
  // Clearance from the anchor. Set on BOTH edges of the placement axis, not
  // just the one facing the anchor: `position-try-fallbacks` can flip the
  // layer to the opposite side at paint time, and a single-edge margin then
  // lands on the far side and the gap vanishes (#4803).
  offsetBlock: (offset: string) => ({
    marginBlockStart: offset,
    marginBlockEnd: offset,
  }),
  offsetInline: (offset: string) => ({
    marginInlineStart: offset,
    marginInlineEnd: offset,
  }),
});

/**
 * Position placement relative to anchor.
 * Logical: start/end resolve against the popover's own inherited direction
 * via CSS (RTL contexts mirror automatically, no JS involved).
 */
export type LayerPlacement = 'above' | 'below' | 'start' | 'end';

/**
 * Alignment along the placement axis
 */
export type LayerAlignment = 'start' | 'center' | 'end';

/**
 * Render props for context mode (anchor positioning)
 */
export interface ContextRenderProps {
  /**
   * Who authors the layer's position styles.
   *
   * `'anchor'` (default): the hook derives CSS anchor-positioning styles —
   * `position-area` and `position-try-fallbacks` — from the logical
   * `placement`/`alignment`.
   *
   * `'custom'`: the consumer authors its own position styles via `style`
   * (e.g. explicit `anchor()` insets or an `anchor-size()` cover). The hook
   * keeps the popover behavior and the `position-anchor` wiring but emits no
   * placement-derived styles, so direction handling becomes the consumer's
   * responsibility. `placement`/`alignment` are ignored.
   *
   * @default 'anchor'
   */
  positioning?: 'anchor' | 'custom';
  /**
   * Logical placement relative to the anchor. Ignored when `positioning`
   * is `'custom'`.
   */
  placement?: LayerPlacement;
  /**
   * Alignment along the placement axis. Ignored when `positioning`
   * is `'custom'`.
   */
  alignment?: LayerAlignment;
  /**
   * Clearance between the layer and its anchor, as a CSS length (a number is
   * treated as `px`). Applied along the placement axis and flip-safe, so the
   * gap survives a `position-try-fallbacks` flip to the opposite side.
   *
   * Layers sit flush by default: the hook zeroes the UA margins so anchor
   * positioning has a clean box, and clearance is a deliberate choice per
   * surface. `var(--spacing-1)` is the system's standard clearance.
   *
   * Ignored when `positioning` is `'custom'` — that mode owns its own insets.
   *
   * @default 0
   */
  offset?: number | string;
  /**
   * ARIA role applied to the popover container (e.g. `'tooltip'`). Lets
   * consumers complete the ARIA pattern and gives test tooling a stable,
   * non-hashed selector for the layer.
   */
  role?: string;
  /**
   * Accessible name applied to the popover container via `aria-label`.
   * Pair with `role` so layers with a named role (e.g. `'dialog'`) expose a
   * proper name to assistive technology.
   */
  'aria-label'?: string;
  /**
   * StyleX styles for the popover container.
   */
  xstyle?: StyleXStyles;
  /**
   * Additional CSS class name(s) for the popover container.
   * Use with themeProps() for theme targeting when reflecting visual props.
   */
  className?: string;
  /**
   * Inline styles for the popover container.
   * Merged after StyleX and anchor positioning styles.
   */
  style?: React.CSSProperties;
  /**
   * HTML tag to render the popover container as.
   *
   * Defaults to `'div'`. Context layers render an inert `<template>` marker at
   * the JSX position. The marker's parent is checked before the requested
   * container mounts there or portals outside ancestors that cannot safely
   * contain it. The marker remains available to detect a new parent if the
   * render call moves. With `lazyMount`, the first check waits until `show()`.
   *
   * @default 'div'
   */
  as?: 'div' | 'span';
  /**
   * Pointer-enter handler attached to the popover container itself. Lets a
   * consumer keep a hover-driven layer open while the pointer is over the
   * surface (e.g. Tooltip/HoverCard "hoverable" behavior — WCAG 1.4.13).
   */
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  /**
   * Pointer-leave handler attached to the popover container itself.
   */
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
}

/**
 * Render props for fixed mode (manual coordinates)
 */
export interface FixedRenderProps {
  x: number;
  y: number;
  /**
   * StyleX styles for the popover container.
   */
  xstyle?: StyleXStyles;
  /**
   * Additional CSS class name(s) for the popover container.
   * Use with themeProps() for theme targeting when reflecting visual props.
   */
  className?: string;
  /**
   * Inline styles for the popover container.
   * Merged after StyleX and position styles.
   */
  style?: React.CSSProperties;
}

/**
 * Base options shared by both modes
 */
interface BaseLayerOptions {
  /**
   * Callback fired when layer is shown.
   * Wrap in useCallback for stable identity.
   */
  onShow?: () => void;

  /**
   * Callback fired when layer is hidden.
   * Wrap in useCallback for stable identity.
   */
  onHide?: () => void;

  /**
   * Whether clicking outside should dismiss the layer.
   * When true, uses popover="auto" for native light-dismiss behavior.
   * @default false
   */
  lightDismiss?: boolean;
}

/**
 * Options for context mode (CSS anchor positioning)
 */
export interface ContextLayerOptions extends BaseLayerOptions {
  mode: 'context';
  /**
   * Defer mounting the final layer and resolving its inline/portal position
   * until `show()` is requested. Hiding unmounts it while the inert marker
   * remains at the JSX position. Use this when rich content must never enter
   * an unsafe ancestor, even briefly, and does not need to exist while closed.
   *
   * @default false
   */
  lazyMount?: boolean;
}

/**
 * Options for fixed mode (manual positioning)
 */
export interface FixedLayerOptions extends BaseLayerOptions {
  mode: 'fixed';
}

/**
 * Return type for context mode
 */
export interface ContextLayerReturn {
  /**
   * Ref to attach to trigger element.
   * Injects anchorName style for CSS anchor positioning.
   */
  ref: RefCallback<HTMLElement>;

  /**
   * The CSS anchor name to use for positioning.
   * Use this when you need to set anchorName manually (e.g., display:contents wrapper).
   */
  anchorId: string;

  /**
   * Show the layer
   */
  show: () => void;

  /**
   * Hide the layer
   */
  hide: () => void;

  /**
   * Whether the layer is currently open
   */
  isOpen: boolean;

  /**
   * Unique ID for aria-describedby
   */
  id: string;

  /**
   * Render function for layer content.
   * Pass placement and alignment for anchor positioning.
   */
  render: (children: ReactNode, props?: ContextRenderProps) => ReactNode;
}

/**
 * Return type for fixed mode
 */
export interface FixedLayerReturn {
  /**
   * Ref is undefined in fixed mode (no anchor element needed)
   */
  ref: undefined;

  /**
   * Show the layer
   */
  show: () => void;

  /**
   * Hide the layer
   */
  hide: () => void;

  /**
   * Whether the layer is currently open
   */
  isOpen: boolean;

  /**
   * Unique ID for aria-describedby
   */
  id: string;

  /**
   * Render function for layer content.
   * Pass x and y coordinates for fixed positioning.
   */
  render: (children: ReactNode, props: FixedRenderProps) => ReactNode;
}

function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

interface ContextLayerMount {
  /** Null means the marker's parent is safe and the layer stays inline. */
  portalTarget: HTMLElement | null;
  /** Logical writing context lost when moving outside an unsafe ancestor. */
  portalStyle: React.CSSProperties;
}

function readPortalWritingContext(
  element: HTMLElement,
  portalTarget: HTMLElement,
): React.CSSProperties {
  const view = element.ownerDocument.defaultView;
  if (!view) {
    return {};
  }
  const sourceStyle = view.getComputedStyle(element);
  const targetStyle = view.getComputedStyle(portalTarget);

  // Do not snapshot custom properties here. The portal target is the closest
  // safe ancestor, so theme variables continue to inherit and update there.
  // These two properties can be set on the unsafe chain itself and directly
  // affect the logical anchor-positioning keywords used by the layer. Only
  // override values the portal would actually lose; matching values should
  // keep inheriting from the target so later direction changes remain live.
  return {
    ...(sourceStyle.direction !== targetStyle.direction && {
      direction: sourceStyle.direction as React.CSSProperties['direction'],
    }),
    ...(sourceStyle.writingMode !== targetStyle.writingMode && {
      writingMode:
        sourceStyle.writingMode as React.CSSProperties['writingMode'],
    }),
  };
}

/**
 * Map logical placement/alignment to a CSS position-area value.
 *
 * Uses the self-* logical keyword family: the inline axis resolves against
 * the popover's own direction (inherited inline or preserved when portaled),
 * so it mirrors in RTL without placement-specific JS. The block axis is
 * direction-neutral but must come from the same keyword family — mixing
 * physical `top` with `self-inline-*` produces an invalid position-area
 * (computes to `none`, which pins the popover to the viewport corner because
 * styles.base zeroes the UA margins).
 *
 * Note the plain logical family (`inline-start`, no `self-`) is NOT a
 * substitute: it resolves against the containing block — the page root for
 * a top-layer popover — so it ignores `direction` set on a subtree, which
 * is exactly #3389's repro.
 */
function getPositionArea(
  placement: LayerPlacement = 'above',
  alignment: LayerAlignment = 'center',
): string {
  if (placement === 'above' || placement === 'below') {
    const block = placement === 'above' ? 'self-block-start' : 'self-block-end';
    if (alignment === 'start') {
      return `${block} span-self-inline-end`;
    }
    if (alignment === 'end') {
      return `${block} span-self-inline-start`;
    }
    return block; // center
  }

  const inline =
    placement === 'start' ? 'self-inline-start' : 'self-inline-end';
  if (alignment === 'start') {
    return `${inline} span-self-block-end`;
  }
  if (alignment === 'end') {
    return `${inline} span-self-block-start`;
  }
  return inline; // center
}

/**
 * Compute the `position-try-fallbacks` list for a placement/alignment pair.
 *
 * Flips alone cannot rescue a centered layer — flipping along the alignment
 * axis maps center → center, so overflow on that axis renders clipped
 * (#3671). Centered alignments therefore append span-based fallbacks letting
 * the browser slide the layer along the alignment axis as a last resort
 * (same-side spans first). Flips already resolve non-centered alignments.
 */
export function getPositionTryFallbacks(
  placement: LayerPlacement = 'above',
  alignment: LayerAlignment = 'center',
): string {
  const flips = 'flip-block, flip-inline, flip-block flip-inline';

  if (alignment !== 'center') {
    return flips;
  }

  if (placement === 'above' || placement === 'below') {
    const [same, opposite] =
      placement === 'above' ? ['top', 'bottom'] : ['bottom', 'top'];
    return `${flips}, ${same} span-left, ${same} span-right, ${opposite} span-left, ${opposite} span-right`;
  }

  const [same, opposite] =
    placement === 'start' ? ['left', 'right'] : ['right', 'left'];
  return `${flips}, ${same} span-top, ${same} span-bottom, ${opposite} span-top, ${opposite} span-bottom`;
}

/**
 * Core layer hook that handles popover behavior and positioning.
 *
 * Supports two positioning modes with type-safe render props:
 * - `context`: CSS anchor positioning relative to a trigger element
 * - `fixed`: Fixed positioning at specified coordinates
 *
 * @example
 * ```
 * const layer = useLayer({ mode: 'context' });
 * <button ref={layer.ref}>Trigger</button>
 * {layer.render(<Content />, { placement: 'above', alignment: 'center' })}
 * ```
 */
export function useLayer(options: ContextLayerOptions): ContextLayerReturn;
export function useLayer(options: FixedLayerOptions): FixedLayerReturn;
export function useLayer(
  options: ContextLayerOptions | FixedLayerOptions,
): ContextLayerReturn | FixedLayerReturn {
  const {mode, onShow, onHide, lightDismiss = false} = options;
  const lazyMount = mode === 'context' ? (options.lazyMount ?? false) : false;
  const id = useId();
  const anchorId = `--astryx-layer-${id.replace(/:/g, '')}`;

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLElement | null>(null);
  // The DOM element on which the current logical open state was applied.
  // A portal target change replaces the popover element; retaining the old
  // reference lets the ref callback recognize and reopen its replacement.
  const openedPopoverRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Context layers place a persistent inert marker at their real JSX position.
  // Its parent tells us whether the final layer can stay inline or needs a
  // corrective portal, including after the render call moves.
  const sentinelRef = useRef<HTMLTemplateElement | null>(null);
  const contextMountRef = useRef<ContextLayerMount | null>(null);
  const [contextMount, setContextMount] = useState<ContextLayerMount | null>(
    null,
  );
  // A show() that arrives before the final layer mounts is replayed when its
  // popover ref attaches.
  const pendingShowRef = useRef(false);

  // Ref mirrors isOpen for synchronous reads inside show/hide.
  // State drives re-renders; the ref lets the imperative calls avoid
  // stale-closure reads of the previous isOpen value.
  const isOpenRef = useRef(false);

  const showPopoverElement = useCallback((popover: HTMLElement) => {
    // Finding infra-4: the Popover API is unsupported on Safari <17 and
    // Firefox <125. On those browsers `showPopover` does not exist, so fall
    // back to plain visibility instead of throwing.
    if (typeof popover.showPopover === 'function') {
      // The trigger is passed as the popover's invoker `source`: a layer
      // hosted away from its trigger then still takes its sequential focus
      // order (and its popover nesting) from the trigger rather than from its
      // own DOM position. Browsers without the option ignore it.
      popover.showPopover({source: triggerRef.current ?? undefined});
    } else {
      popover.style.display = 'block';
    }
    openedPopoverRef.current = popover;
  }, []);

  const isCurrentContextPopover = useCallback(
    (popover: HTMLElement): boolean => {
      if (mode !== 'context') {
        return true;
      }
      const mount = contextMountRef.current;
      if (mount === null) {
        return false;
      }
      const expectedParent =
        mount.portalTarget ?? sentinelRef.current?.parentElement ?? null;
      return popover.parentElement === expectedParent;
    },
    [mode],
  );

  const requestContextMount = useCallback(() => {
    if (mode !== 'context') {
      return;
    }

    const sentinel = sentinelRef.current;
    const inlineParent = sentinel?.parentElement ?? null;
    if (!sentinel || !inlineParent) {
      return;
    }

    const portalTarget = resolveLayerPortalTarget(inlineParent);
    const mount: ContextLayerMount = {
      portalTarget,
      portalStyle: portalTarget
        ? readPortalWritingContext(sentinel, portalTarget)
        : {},
    };
    contextMountRef.current = mount;
    setContextMount(mount);
  }, [mode]);

  const clearContextMount = useCallback(() => {
    if (mode !== 'context' || !lazyMount) {
      return;
    }
    contextMountRef.current = null;
    setContextMount(null);
  }, [mode, lazyMount]);

  const show = useCallback(() => {
    // A context popover left over until React commits a previous hide must not
    // be reopened. The synchronous mount ref is the source of truth.
    const candidate = popoverRef.current;
    const popover =
      candidate && isCurrentContextPopover(candidate) ? candidate : null;
    if (!popover) {
      pendingShowRef.current = true;
      requestContextMount();
      return;
    }
    if (!isOpenRef.current) {
      showPopoverElement(popover);
      isOpenRef.current = true;
      setIsOpen(true);
      onShow?.();
    }
  }, [
    onShow,
    requestContextMount,
    showPopoverElement,
    isCurrentContextPopover,
  ]);

  const hide = useCallback(() => {
    pendingShowRef.current = false;
    if (isOpenRef.current) {
      const el = popoverRef.current;
      // See finding infra-4 note in `show`: mirror the same guard on hide so
      // unsupported browsers degrade gracefully instead of throwing.
      if (el) {
        if (typeof el.hidePopover === 'function') {
          el.hidePopover();
        } else {
          el.style.display = 'none';
        }
      }
      openedPopoverRef.current = null;
      isOpenRef.current = false;
      setIsOpen(false);
      onHide?.();
    }
    clearContextMount();
  }, [onHide, clearContextMount]);

  // Ref for trigger element (context mode only)
  const ref: RefCallback<HTMLElement> | undefined =
    mode === 'context'
      ? (el: HTMLElement | null) => {
          // Remove only THIS layer's anchor name from the previous element so
          // other layers sharing the same trigger keep their anchors.
          if (triggerRef.current && triggerRef.current !== el) {
            removeAnchorName(triggerRef.current, anchorId);
          }

          if (el) {
            addAnchorName(el, anchorId);
          }

          triggerRef.current = el;
        }
      : undefined;

  // Reconcile browser-initiated closes (light-dismiss, popover="auto" stack
  // eviction). These are the only cases where the DOM mutates without going
  // through our show/hide — we sync React state back to match.
  //
  // No "open" case: the browser never spontaneously opens a popover. Opens
  // only happen via showPopover() which we always call from show().
  //
  // The isOpenRef guard prevents double-firing: when our hide() already set
  // the ref to false, the subsequent toggle event (which the browser fires
  // as a side-effect of hidePopover) sees false and skips.
  const handleToggle = useCallback(
    (e: Event) => {
      const toggleEvent = e as ToggleEvent;
      if (toggleEvent.newState === 'closed' && isOpenRef.current) {
        openedPopoverRef.current = null;
        isOpenRef.current = false;
        setIsOpen(false);
        onHide?.();
        clearContextMount();
      }
    },
    [onHide, clearContextMount],
  );

  // Ref callback for popover element — sets up the `toggle` listener.
  // Tracks the element + handler currently bound so the listener is removed
  // when the element detaches or when `handleToggle`'s identity changes (a new
  // `onHide` prop), preventing stale-closure listeners from accumulating on the
  // same element (infra-10).
  const listenedElRef = useRef<HTMLElement | null>(null);
  const listenedHandlerRef = useRef<((e: Event) => void) | null>(null);

  const bindToggleListener = useCallback(
    (el: HTMLElement | null, handler: (e: Event) => void) => {
      if (
        listenedElRef.current &&
        listenedHandlerRef.current &&
        (listenedElRef.current !== el || listenedHandlerRef.current !== handler)
      ) {
        listenedElRef.current.removeEventListener(
          'toggle',
          listenedHandlerRef.current,
        );
        listenedElRef.current = null;
        listenedHandlerRef.current = null;
      }
      if (el && listenedElRef.current !== el) {
        el.addEventListener('toggle', handler);
        listenedElRef.current = el;
        listenedHandlerRef.current = handler;
      }
    },
    [],
  );

  const popoverRefCallback = useCallback(
    (el: HTMLElement | null) => {
      popoverRef.current = el;
      bindToggleListener(el, handleToggle);
      if (el && pendingShowRef.current) {
        pendingShowRef.current = false;
        show();
      } else if (
        el &&
        isOpenRef.current &&
        openedPopoverRef.current !== el &&
        isCurrentContextPopover(el)
      ) {
        // Changing a portal target remounts the popover. Preserve the logical
        // open state without firing onShow again for the replacement element.
        showPopoverElement(el);
      }
    },
    [
      handleToggle,
      bindToggleListener,
      show,
      showPopoverElement,
      isCurrentContextPopover,
    ],
  );

  const sentinelRefCallback = useCallback(
    (el: HTMLTemplateElement | null) => {
      sentinelRef.current = el;
      if (el && (!lazyMount || pendingShowRef.current || isOpenRef.current)) {
        // The render call may have moved while the hook stayed mounted.
        // Resolve again from the newly attached marker rather than reusing a
        // portal target from its previous JSX position.
        requestContextMount();
      }
    },
    [lazyMount, requestContextMount],
  );

  // Re-bind when the handler identity changes while the element stays mounted,
  // and detach on unmount.
  useEffect(() => {
    if (popoverRef.current) {
      bindToggleListener(popoverRef.current, handleToggle);
    }
    return () => {
      if (listenedElRef.current && listenedHandlerRef.current) {
        listenedElRef.current.removeEventListener(
          'toggle',
          listenedHandlerRef.current,
        );
        listenedElRef.current = null;
        listenedHandlerRef.current = null;
      }
    };
  }, [handleToggle, bindToggleListener]);

  // Render function for context mode
  const renderContext = useCallback(
    (children: ReactNode, props?: ContextRenderProps) => {
      // Keep the marker mounted after resolving the layer. Apart from giving
      // us the real JSX parent on first show, this lets its ref report when a
      // persistent hook's render call moves to a different host.
      const sentinel = <template ref={sentinelRefCallback} />;

      if (contextMount === null) {
        return <>{sentinel}</>;
      }

      const {
        placement = 'above',
        alignment = 'center',
        positioning = 'anchor',
        offset,
        role,
        'aria-label': ariaLabel,
        xstyle,
        className: extraClassName,
        style: extraStyle,
        as: Container = 'div',
        onMouseEnter,
        onMouseLeave,
      } = props || {};

      // CSS anchor positioning (dynamic, not in StyleX)
      const anchorStyle: React.CSSProperties =
        positioning === 'custom'
          ? // Consumer authors its own position styles via `style` — keep
            // only the anchor wiring, derive nothing from placement.
            {positionAnchor: anchorId}
          : {
              positionAnchor: anchorId,
              positionArea: getPositionArea(placement, alignment),
              positionTryFallbacks: getPositionTryFallbacks(
                placement,
                alignment,
              ),
            };

      const offsetStyle =
        positioning === 'anchor' && offset
          ? placement === 'above' || placement === 'below'
            ? styles.offsetBlock(toCssLength(offset))
            : styles.offsetInline(toCssLength(offset))
          : null;

      const stylexResult = stylex.props(
        styles.base,
        overlayPaddingReset.reset,
        offsetStyle,
        xstyle,
      );
      const combinedClassName = extraClassName
        ? `${extraClassName} ${stylexResult.className ?? ''}`
        : stylexResult.className;

      // The marker gives us the actual JSX parent without mounting arbitrary
      // children there. Safe positions preserve the existing DOM order and
      // cascade; unsafe positions use the nearest corrective portal target.
      const layer = (
        <Container
          ref={popoverRefCallback}
          id={id}
          role={role}
          aria-label={ariaLabel}
          popover={lightDismiss ? 'auto' : 'manual'}
          className={combinedClassName}
          style={{
            ...stylexResult.style,
            ...anchorStyle,
            ...contextMount.portalStyle,
            ...extraStyle,
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}>
          {children}
        </Container>
      );

      return (
        <>
          {sentinel}
          {contextMount.portalTarget
            ? createPortal(layer, contextMount.portalTarget)
            : layer}
        </>
      );
    },
    [
      anchorId,
      contextMount,
      id,
      lightDismiss,
      popoverRefCallback,
      sentinelRefCallback,
    ],
  );

  // Render function for fixed mode
  const renderFixed = useCallback(
    (children: ReactNode, props: FixedRenderProps) => {
      const {
        x,
        y,
        xstyle,
        className: extraClassName,
        style: extraStyle,
      } = props;

      // Dynamic position values
      const positionStyle: React.CSSProperties = {
        top: y,
        left: x,
      };

      const stylexResult = stylex.props(
        styles.base,
        overlayPaddingReset.reset,
        styles.fixed,
        xstyle,
      );
      const combinedClassName = extraClassName
        ? `${extraClassName} ${stylexResult.className ?? ''}`
        : stylexResult.className;

      return (
        <div
          ref={popoverRefCallback}
          id={id}
          popover={lightDismiss ? 'auto' : 'manual'}
          className={combinedClassName}
          style={{...stylexResult.style, ...positionStyle, ...extraStyle}}>
          {children}
        </div>
      );
    },
    [popoverRefCallback, id, lightDismiss],
  );

  if (mode === 'context') {
    return {
      ref: ref as RefCallback<HTMLElement>,
      anchorId,
      show,
      hide,
      isOpen,
      id,
      render: renderContext,
    };
  }

  return {
    ref: undefined,
    show,
    hide,
    isOpen,
    id,
    render: renderFixed,
  };
}
