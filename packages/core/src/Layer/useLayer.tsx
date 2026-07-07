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
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefCallback,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {addAnchorName, removeAnchorName} from './anchorName';
import {typographyVars} from '../theme/tokens.stylex';

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
    fontFamily: typographyVars['--font-family-body'],
    // Override browser default [popover] background (canvas color)
    backgroundColor: 'transparent',
  },
  // Fixed positioning mode
  fixed: {
    position: 'fixed',
  },
});

/**
 * Position placement relative to anchor.
 * Logical: start/end resolve against the trigger's computed direction at
 * open time (RTL contexts mirror automatically).
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
   * `position-area`, `position-try-fallbacks`, and an RTL-only `justify-self`
   * — from the logical `placement`/`alignment`.
   *
   * `'custom'`: the consumer authors its own position styles via `style`
   * (e.g. explicit `anchor()` insets or an `anchor-size()` cover). The hook
   * keeps the popover behavior and the `position-anchor` wiring but emits no
   * placement-derived styles — including the RTL adjustments, so direction
   * handling becomes the consumer's responsibility. `placement`/`alignment`
   * are ignored.
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
   * ARIA role applied to the popover container (e.g. `'tooltip'`). Lets
   * consumers complete the ARIA pattern and gives test tooling a stable,
   * non-hashed selector for the layer.
   */
  role?: string;
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
   * Defaults to `'div'`. Pass `'span'` when the layer must render inline-safe
   * markup — e.g. a `HoverCard` wrapping inline text inside a `<p>`. A `<span>`
   * is phrasing content, so it stays put in the DOM tree instead of being
   * reparented out of a paragraph by the HTML parser, which keeps server and
   * client markup identical. The Popover API and CSS anchor positioning work
   * the same on either tag.
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

/**
 * Map placement and alignment to CSS position-area value.
 *
 * placement/alignment are LOGICAL (start = inline-start), but position-area
 * only supports physical keywords reliably (the logical/self keyword families
 * are unsupported in current Chrome, and an invalid position-area pins the
 * popover to the viewport corner because styles.base zeroes the UA margins).
 * So the mirroring happens here, from the trigger's computed direction.
 */
function getPositionArea(
  placement: LayerPlacement = 'above',
  alignment: LayerAlignment = 'center',
  isRtl = false,
): string {
  const placementMap: Record<LayerPlacement, string> = {
    above: 'top',
    below: 'bottom',
    start: isRtl ? 'right' : 'left',
    end: isRtl ? 'left' : 'right',
  };

  const cssPlacement = placementMap[placement];

  // For above/below, alignment is horizontal
  if (placement === 'above' || placement === 'below') {
    if (alignment === 'start') {
      return `${cssPlacement} ${isRtl ? 'span-left' : 'span-right'}`;
    }
    if (alignment === 'end') {
      return `${cssPlacement} ${isRtl ? 'span-right' : 'span-left'}`;
    }
    return cssPlacement; // center
  }

  // For start/end, alignment is vertical (direction-neutral)
  if (alignment === 'start') {
    return `${cssPlacement} span-bottom`;
  }
  if (alignment === 'end') {
    return `${cssPlacement} span-top`;
  }
  return `${cssPlacement} center`;
}

/**
 * Explicit physical inline-axis self-alignment, emitted in RTL only.
 *
 * position-area's implied "normal" alignment is what non-conformant engines
 * resolve against the popover's own inherited RTL direction (instead of the
 * containing block), which is how #3389's menu landed at the viewport mirror
 * of its trigger. An explicit physical value removes that direction-sensitive
 * resolution entirely; the flip-inline try tactic value-flips left/right, so
 * position-try fallbacks still hug the anchor. Omitted in LTR so the emitted
 * inline style stays byte-identical to the previous behavior.
 */
function getRtlJustifySelf(
  placement: LayerPlacement = 'above',
  alignment: LayerAlignment = 'center',
): string | undefined {
  if (placement === 'above' || placement === 'below') {
    // Area spans the anchor column plus one side; hug the anchor edge.
    if (alignment === 'start') {
      return 'right';
    }
    if (alignment === 'end') {
      return 'left';
    }
    return undefined; // center: implied anchor-center is symmetric
  }

  // Side placements: the area is a single column; hug the anchor-adjacent
  // edge (placement start renders in the right column under RTL, so the
  // anchor sits at its left edge, and vice versa).
  return placement === 'start' ? 'left' : 'right';
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
  const id = useId();
  const anchorId = `--astryx-layer-${id.replace(/:/g, '')}`;

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Whether the trigger renders in an RTL context. Resolved from computed
  // style at show time (not render time) so it works for both the dir
  // attribute and the CSS direction property, and tracks runtime direction
  // changes on the next open. Read from the trigger, not the popover: the
  // popover's computed style can be stale before top-layer promotion.
  const [isRtl, setIsRtl] = useState(false);

  // Ref mirrors isOpen for synchronous reads inside show/hide.
  // State drives re-renders; the ref lets the imperative calls avoid
  // stale-closure reads of the previous isOpen value.
  const isOpenRef = useRef(false);

  // Latest context render() position props, stashed so show() can re-derive
  // the direction-dependent styles synchronously. setIsRtl only schedules a
  // re-render while showPopover() promotes the popover immediately, so
  // without this the first RTL open would paint — and any @starting-style
  // entry animation would start — with the previous render's LTR mapping.
  // (flushSync is not an option: show() is called from passive effects —
  // Carousel, Selector isDefaultOpen — where it warns and degrades back to
  // the async behavior.)
  //
  // Two refs: render-prop functions only see their args at render time, but
  // a concurrent render pass can be discarded (aborted transition, Suspense
  // retry) after writing the stash. show() must only apply COMMITTED values —
  // a write derived from an abandoned render would stick forever, because
  // React's style diff never saw those values and won't emit a repair. So
  // renders write `pending`, and commit-time code (the popover ref callback
  // and the promote layout effect below) copies it to `committed`.
  //
  // Invariant this relies on: render() is invoked inline in the owner's JSX
  // on every render. Do NOT memoize the render() output (useMemo/memo child) —
  // a discarded pass could then refresh `pending` while the committed pass
  // reuses the memo, and the promote would publish never-committed values.
  type ContextPositionStash = {
    placement: LayerPlacement;
    alignment: LayerAlignment;
    positioning: 'anchor' | 'custom';
    style?: React.CSSProperties;
  };
  const pendingContextPositionRef = useRef<ContextPositionStash>({
    placement: 'above',
    alignment: 'center',
    positioning: 'anchor',
  });
  const contextPositionRef = useRef<ContextPositionStash>(
    pendingContextPositionRef.current,
  );

  const show = useCallback(() => {
    const popover = popoverRef.current;
    if (popover && !isOpenRef.current) {
      if (mode === 'context') {
        const isRtlNow =
          triggerRef.current != null &&
          getComputedStyle(triggerRef.current).direction === 'rtl';
        setIsRtl(isRtlNow);
        const {
          placement,
          alignment,
          positioning,
          style: consumerStyle,
        } = contextPositionRef.current;
        if (positioning !== 'custom') {
          // Write the direction-dependent styles before showPopover() so the
          // first paint is direction-correct; the post-open render re-emits
          // the same values, keeping the DOM and React's style prop in sync.
          // Consumer `style` merges after the derived styles in render, and
          // spread semantics make an OWN key authored even when its value is
          // an explicit `undefined` (the nulling idiom) — so guard on key
          // presence, not value. Writing over an explicit-undefined key
          // would stick forever: React's style diff (undefined === undefined)
          // never emits a clearing write.
          if (consumerStyle == null || !('positionArea' in consumerStyle)) {
            popover.style.positionArea = getPositionArea(
              placement,
              alignment,
              isRtlNow,
            );
          }
          if (consumerStyle == null || !('justifySelf' in consumerStyle)) {
            const justifySelf = isRtlNow
              ? getRtlJustifySelf(placement, alignment)
              : undefined;
            if (justifySelf != null) {
              popover.style.justifySelf = justifySelf;
            } else {
              // Clear a previous RTL open's value after a direction flip.
              popover.style.removeProperty('justify-self');
            }
          }
        }
      }
      popover.showPopover();
      isOpenRef.current = true;
      setIsOpen(true);
      onShow?.();
    }
  }, [mode, onShow]);

  const hide = useCallback(() => {
    if (isOpenRef.current) {
      popoverRef.current?.hidePopover();
      isOpenRef.current = false;
      setIsOpen(false);
      onHide?.();
    }
  }, [onHide]);

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
        isOpenRef.current = false;
        setIsOpen(false);
        onHide?.();
      }
    },
    [onHide],
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
      if (el) {
        // Ref callbacks run at commit, before effects — promote the stash
        // here too so a show() fired between first mount and the first
        // promote-effect run still sees this render's committed values.
        contextPositionRef.current = pendingContextPositionRef.current;
      }
      bindToggleListener(el, handleToggle);
    },
    [handleToggle, bindToggleListener],
  );

  // Promote the render-time position stash on every commit. Discarded
  // concurrent render passes write `pending` but never commit — this effect
  // only runs for committed renders. A LAYOUT effect specifically: it runs
  // synchronously inside the commit, before paint, so no event handler (and
  // no consumer passive effect) can ever call show() between a commit and
  // its promote — a passive effect would leave a gap where show() stamps the
  // previous commit's values and React's style diff never repairs them.
  useLayoutEffect(() => {
    contextPositionRef.current = pendingContextPositionRef.current;
  });

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
      const {
        placement = 'above',
        alignment = 'center',
        positioning = 'anchor',
        role,
        xstyle,
        className: extraClassName,
        style: extraStyle,
        as: Container = 'div',
        onMouseEnter,
        onMouseLeave,
      } = props || {};

      // Keep show()'s synchronous style application working from the same
      // values as this render. Render passes write the PENDING stash only;
      // commit-time code promotes it (see the refs' declaration).
      pendingContextPositionRef.current = {
        placement,
        alignment,
        positioning,
        style: extraStyle,
      };

      // CSS anchor positioning (dynamic, not in StyleX)
      const rtlJustifySelf = isRtl
        ? getRtlJustifySelf(placement, alignment)
        : undefined;
      const anchorStyle: React.CSSProperties =
        positioning === 'custom'
          ? // Consumer authors its own position styles via `style` — keep
            // only the anchor wiring, derive nothing from placement.
            {positionAnchor: anchorId}
          : {
              positionAnchor: anchorId,
              positionArea: getPositionArea(placement, alignment, isRtl),
              positionTryFallbacks:
                'flip-block, flip-inline, flip-block flip-inline',
              ...(rtlJustifySelf != null && {justifySelf: rtlJustifySelf}),
            };

      const stylexResult = stylex.props(styles.base, xstyle);
      const combinedClassName = extraClassName
        ? `${extraClassName} ${stylexResult.className ?? ''}`
        : stylexResult.className;

      // Render as the requested tag. A `span` keeps the layer phrasing content
      // so it is valid (and stays put on hydration) inside inline contexts like
      // a `<p>`; `div` remains the default for block layers.
      return (
        <Container
          ref={popoverRefCallback}
          id={id}
          role={role}
          popover={lightDismiss ? 'auto' : 'manual'}
          className={combinedClassName}
          style={{...stylexResult.style, ...anchorStyle, ...extraStyle}}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}>
          {children}
        </Container>
      );
    },
    [anchorId, id, isRtl, lightDismiss, popoverRefCallback],
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

      const stylexResult = stylex.props(styles.base, styles.fixed, xstyle);
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
