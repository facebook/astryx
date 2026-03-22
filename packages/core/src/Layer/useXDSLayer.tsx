'use client';

/**
 * @file useXDSLayer.tsx
 * @input Uses React hooks, Popover API, CSS anchor positioning
 * @output Exports useXDSLayer hook for layer positioning and visibility
 * @position Core layer utility; used by useXDSHoverCard, useXDSTooltip, etc.
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

// Extend React's HTMLAttributes to include popover API attributes
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    popover?: 'auto' | 'manual' | 'hint' | '';
  }
}

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
   * Use with xdsClassName() for theme targeting.
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
   * Use with xdsClassName() for theme targeting.
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
    if (alignment === 'start') return `${cssPlacement} span-right`;
    if (alignment === 'end') return `${cssPlacement} span-left`;
    return cssPlacement; // center
  }

  // For start/end, alignment is vertical
  if (alignment === 'start') return `${cssPlacement} span-bottom`;
  if (alignment === 'end') return `${cssPlacement} span-top`;
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
 * // Context mode (anchor positioning)
 * const layer = useXDSLayer({ mode: 'context' });
 *
 * <button ref={layer.ref}>Trigger</button>
 * {layer.render(<Content />, { placement: 'above', alignment: 'center' })}
 *
 * // Fixed mode (positioned at coordinates)
 * const layer = useXDSLayer({ mode: 'fixed' });
 *
 * layer.show();
 * {layer.render(<Content />, { x: mouseX, y: mouseY })}
 * ```
 */
export function useXDSLayer(options: ContextLayerOptions): ContextLayerReturn;
export function useXDSLayer(options: FixedLayerOptions): FixedLayerReturn;
export function useXDSLayer(
  options: ContextLayerOptions | FixedLayerOptions,
): ContextLayerReturn | FixedLayerReturn {
  const {mode, onShow, onHide, lightDismiss = false} = options;
  const id = useId();
  const anchorId = `--xds-layer-${id.replace(/:/g, '')}`;

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    if (popoverRef.current && !popoverRef.current.matches(':popover-open')) {
      popoverRef.current.showPopover();
      setIsOpen(true);
      onShow?.();
    }
  }, [onShow]);

  const hide = useCallback(() => {
    if (popoverRef.current?.matches(':popover-open')) {
      popoverRef.current.hidePopover();
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

  // Handle popover toggle events (for sync with browser-initiated close)
  const handleToggle = useCallback(
    (e: Event) => {
      const toggleEvent = e as ToggleEvent;
      if (toggleEvent.newState === 'closed') {
        setIsOpen(false);
        onHide?.();
      } else if (toggleEvent.newState === 'open') {
        setIsOpen(true);
        onShow?.();
      }
    },
    [onShow, onHide],
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
      } as React.CSSProperties;

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
