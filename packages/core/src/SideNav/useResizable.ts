'use client';

/**
 * @file useResizable.ts
 * @input Resizable configuration (enabled, defaultWidth, onWidthChange)
 * @output Hook return: width state, containerRef, drag handle props, showHandle flag
 * @position Internal hook; consumed by XDSSideNav.tsx
 *
 * Extracts all resize-related state and pointer event listeners into a
 * standalone hook so event listeners are only registered when resizable
 * is enabled.
 */

import {useCallback, useEffect, useRef, useState} from 'react';

const MIN_WIDTH = 180;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 260;

export interface ResizableConfig {
  defaultWidth?: number;
  onWidthChange?: (width: number) => void;
}

export interface UseResizableOptions {
  /** Whether resizing is enabled */
  enabled: boolean;
  /** Resizable configuration (defaultWidth, onWidthChange) */
  config: ResizableConfig;
  /** Whether the sidebar is collapsed (hides the handle) */
  collapsed: boolean;
}

export interface UseResizableReturn {
  /** Current width in pixels */
  width: number;
  /** Ref to attach to the resizable container div */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Whether the drag handle should be rendered */
  showHandle: boolean;
  /** Props to spread onto the drag handle element */
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
  };
  /** Whether the handle is currently hovered */
  isHandleHovered: boolean;
}

export function useResizable({
  enabled,
  config,
  collapsed,
}: UseResizableOptions): UseResizableReturn {
  const {defaultWidth = DEFAULT_WIDTH, onWidthChange} = config;

  const [width, setWidth] = useState(
    Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, defaultWidth)),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const [isHandleHovered, setIsHandleHovered] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      e.preventDefault();
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      document.body.style.cursor = 'col-resize';

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!isDraggingRef.current) return;
        const delta = moveEvent.clientX - startXRef.current;
        const newWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, startWidthRef.current + delta),
        );
        if (containerRef.current) {
          containerRef.current.style.width = `${newWidth}px`;
        }
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);

        const delta = upEvent.clientX - startXRef.current;
        const finalWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, startWidthRef.current + delta),
        );
        setWidth(finalWidth);
        onWidthChange?.(finalWidth);
      };

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    },
    [enabled, width, onWidthChange],
  );

  // Clean up listeners if component unmounts during drag
  useEffect(() => {
    return () => {
      if (isDraggingRef.current) {
        document.body.style.cursor = '';
      }
    };
  }, []);

  const showHandle = enabled && !collapsed;

  const handleProps = {
    onPointerDown: handlePointerDown,
    onPointerEnter: () => setIsHandleHovered(true),
    onPointerLeave: () => {
      if (!isDraggingRef.current) setIsHandleHovered(false);
    },
  };

  return {
    width,
    containerRef,
    showHandle,
    handleProps,
    isHandleHovered,
  };
}
