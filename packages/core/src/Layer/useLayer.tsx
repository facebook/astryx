// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLayer.tsx
 * @input Uses React hooks, Popover API, CSS anchor positioning, typography tokens
 * @output Exports useLayer hook for layer positioning and visibility
 * @position Core layer utility; used by useHoverCard, useTooltip, etc.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/Layer.doc.mjs
 * - /packages/core/src/Layer/index.ts
 */

import React, {
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefCallback,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
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
 * Position placement relative to anchor
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
  placement?: LayerPlacement;
  alignment?: LayerAlignment;
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
 */
function getPositionArea(
  placement: LayerPlacement = 'above',
  alignment: LayerAlignment = 'center',
): string {
  const placementMap: Record<LayerPlacement, string> = {
    above: 'top',
    below: 'bottom',
    start: 'left',
    end: 'right',
  };

  const cssPlacement = placementMap[placement];

  // For above/below, alignment is horizontal
  if (placement === 'above' || placement === 'below') {
    if (alignment === 'start') {
      return `${cssPlacement} span-right`;
    }
    if (alignment === 'end') {
      return `${cssPlacement} span-left`;
    }
    return cssPlacement; // center
  }

  // For start/end, alignment is vertical
  if (alignment === 'start') {
    return `${cssPlacement} span-bottom`;
  }
  if (alignment === 'end') {
    return `${cssPlacement} span-top`;
  }
  return `${cssPlacement} center`;
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

  // Ref mirrors isOpen for synchronous reads inside show/hide.
  // State drives re-renders; the ref lets the imperative calls avoid
  // stale-closure reads of the previous isOpen value.
  const isOpenRef = useRef(false);

  const show = useCallback(() => {
    if (popoverRef.current && !isOpenRef.current) {
      popoverRef.current.showPopover();
      isOpenRef.current = true;
      setIsOpen(true);
      onShow?.();
    }
  }, [onShow]);

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
          // Cleanup previous element
          if (triggerRef.current) {
            (
              triggerRef.current.style as unknown as Record<string, string>
            ).anchorName = '';
          }

          if (el) {
            (el.style as unknown as Record<string, string>).anchorName =
              anchorId;
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

  // Ref callback for popover element — sets up toggle listener
  const popoverRefCallback = useCallback(
    (el: HTMLElement | null) => {
      popoverRef.current = el;
      if (el) {
        el.addEventListener('toggle', handleToggle);
      }
    },
    [handleToggle],
  );

  // Render function for context mode
  const renderContext = useCallback(
    (children: ReactNode, props?: ContextRenderProps) => {
      const {
        placement = 'above',
        alignment = 'center',
        xstyle,
        className: extraClassName,
        style: extraStyle,
      } = props || {};

      // CSS anchor positioning (dynamic, not in StyleX)
      const anchorStyle: React.CSSProperties = {
        positionAnchor: anchorId,
        positionArea: getPositionArea(placement, alignment),
        positionTryFallbacks: 'flip-block, flip-inline, flip-block flip-inline',
      };

      const stylexResult = stylex.props(styles.base, xstyle);
      const combinedClassName = extraClassName
        ? `${extraClassName} ${stylexResult.className ?? ''}`
        : stylexResult.className;

      return (
        <div
          ref={popoverRefCallback}
          id={id}
          popover={lightDismiss ? 'auto' : 'manual'}
          className={combinedClassName}
          style={{...stylexResult.style, ...anchorStyle, ...extraStyle}}>
          {children}
        </div>
      );
    },
    [anchorId, id, lightDismiss, popoverRefCallback],
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
