/**
 * @file EventLayer.tsx
 * @output Single event capture rect that dispatches to registered interactions
 * @position Last child inside XDSChart's plot area <g>
 *
 * Solves the overlapping-rect problem: tooltip, brush, zoom, and select
 * all need pointer events but can't each have their own capture rect.
 * This component renders one rect and routes gestures by type:
 *
 *   - pointerMove (no button) → tooltip/crosshair
 *   - pointerDown + drag → brush OR pan (based on which is registered)
 *   - wheel / pinch → zoom
 *   - click (no drag) → select
 */

import {useCallback, useRef} from 'react';
import {useChart} from './ChartContext';

export interface GestureHandlers {
  /** Hover / touch scrub — tooltip + crosshair */
  onHover?: (e: React.PointerEvent<SVGRectElement>) => void;
  onHoverEnd?: () => void;

  /** Drag gesture — brush selection */
  onDragStart?: (e: React.PointerEvent<SVGRectElement>) => void;
  onDragMove?: (e: React.PointerEvent<SVGRectElement>) => void;
  onDragEnd?: (e: React.PointerEvent<SVGRectElement>) => void;

  /** Wheel / pinch — zoom */
  onWheel?: (e: React.WheelEvent<SVGRectElement>) => void;
  onPinchStart?: (e: React.PointerEvent<SVGRectElement>) => void;
  onPinchMove?: (e: React.PointerEvent<SVGRectElement>) => void;
  onPinchEnd?: (e: React.PointerEvent<SVGRectElement>) => void;

  /** Click (no drag) — select */
  onClick?: (e: React.PointerEvent<SVGRectElement>) => void;
}

const DRAG_THRESHOLD = 4; // px — below this it's a click, not a drag

export function EventLayer({handlers}: {handlers: GestureHandlers}) {
  const {width, height} = useChart();

  const dragging = useRef(false);
  const dragStartPos = useRef({x: 0, y: 0});
  const pointerDown = useRef(false);
  const pointersRef = useRef<Map<number, {x: number; y: number}>>(new Map());
  const pinching = useRef(false);
  const touchActive = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      e.preventDefault(); // prevent text selection on touch

      pointersRef.current.set(e.pointerId, {x: e.clientX, y: e.clientY});

      // Two fingers → pinch
      if (pointersRef.current.size === 2) {
        pinching.current = true;
        dragging.current = false;
        pointerDown.current = false;
        handlers.onPinchStart?.(e);
        return;
      }

      // Single pointer
      pointerDown.current = true;
      dragging.current = false;
      dragStartPos.current = {x: e.clientX, y: e.clientY};

      if (e.pointerType !== 'mouse') {
        touchActive.current = true;
        // Touch: show tooltip immediately on tap
        handlers.onHover?.(e);
      }
    },
    [handlers],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      pointersRef.current.set(e.pointerId, {x: e.clientX, y: e.clientY});

      // Pinch zoom
      if (pinching.current && pointersRef.current.size === 2) {
        handlers.onPinchMove?.(e);
        return;
      }

      // Check if we've exceeded drag threshold
      if (pointerDown.current && !dragging.current) {
        const dx = Math.abs(e.clientX - dragStartPos.current.x);
        const dy = Math.abs(e.clientY - dragStartPos.current.y);
        if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
          dragging.current = true;
          handlers.onDragStart?.(e);
        }
      }

      // Active drag
      if (dragging.current) {
        handlers.onDragMove?.(e);
        // Also update tooltip during drag (for brush + crosshair combo)
        handlers.onHover?.(e);
        return;
      }

      // Plain hover (mouse) or touch scrub (after tap)
      if (e.pointerType === 'mouse' || touchActive.current) {
        handlers.onHover?.(e);
      }
    },
    [handlers],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      pointersRef.current.delete(e.pointerId);

      if (pinching.current) {
        if (pointersRef.current.size < 2) {
          pinching.current = false;
          handlers.onPinchEnd?.(e);
        }
        return;
      }

      if (dragging.current) {
        dragging.current = false;
        pointerDown.current = false;
        handlers.onDragEnd?.(e);
      } else if (pointerDown.current) {
        // No drag happened → it's a click
        pointerDown.current = false;
        handlers.onClick?.(e);
      }

      // Touch: dismiss tooltip on lift
      if (e.pointerType !== 'mouse') {
        touchActive.current = false;
        handlers.onHoverEnd?.();
      }
    },
    [handlers],
  );

  const handlePointerLeave = useCallback(
    (_e: React.PointerEvent<SVGRectElement>) => {
      if (!pointerDown.current && !touchActive.current) {
        handlers.onHoverEnd?.();
      }
    },
    [handlers],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGRectElement>) => {
      e.preventDefault();
      handlers.onWheel?.(e);
    },
    [handlers],
  );

  return (
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill="transparent"
      style={
        {
          touchAction: 'none',
          userSelect: 'none',
          cursor: 'crosshair',
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onWheel={handleWheel}
    />
  );
}
