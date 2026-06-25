// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useResizable.ts
 * @input Resize configuration (defaultSize, minSizePx, maxSizePx, collapsible, snaps)
 * @output Hook return: size, isCollapsed, collapse/expand/resize methods, props for handle
 * @position Public hook; consumed by layout components via `resizable` prop
 */

import {useCallback, useEffect, useRef, useState} from 'react';

// =============================================================================
// Types
// =============================================================================

export interface ResizableRegionConfig {
  /** Default size in pixels, or percentage string (e.g. '20%'). */
  defaultSize?: number | string;
  /** Minimum size in pixels. @default 50 */
  minSizePx?: number;
  /** Maximum size in pixels. @default Infinity */
  maxSizePx?: number;
  /** Whether this region can collapse to 0. @default false */
  collapsible?: boolean;
  /** Size in px at which dragging triggers collapse. @default 40 */
  collapsedSize?: number;
  /** Pixel values to snap to during resize. */
  snaps?: number[];
  /** Cascade priority — lower number shrinks first. */
  shrinkOrder?: number;
}

/**
 * Shared config shape for any component that integrates built-in resize
 * (e.g. SideNav `resizable` prop). Provides a simplified API surface
 * over the full ResizableRegionConfig.
 */
export interface ResizableConfig {
  /** Initial width in pixels. @default 260 */
  defaultWidth?: number;
  /** Minimum width in pixels. @default 180 */
  minWidth?: number;
  /** Maximum width in pixels. @default 480 */
  maxWidth?: number;
  /** localStorage key for persisting width. */
  autoSaveId?: string;
  /** Called when the width changes (on drag end). */
  onWidthChange?: (width: number) => void;
}

export interface UseResizableSingleConfig extends ResizableRegionConfig {
  /** Unique key for localStorage persistence. */
  autoSaveId?: string;
  /** Called when size changes during drag. */
  onSizeChange?: (size: number) => void;
  /** Called when collapse state changes (via drag or programmatic). */
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export interface UseResizableMultiConfig {
  /** Layout direction. @default 'horizontal' */
  direction?: 'horizontal' | 'vertical';
  /** Named region configurations. */
  regions: Record<string, ResizableRegionConfig>;
  /** Unique key for localStorage persistence. */
  autoSaveId?: string;
}

export interface ResizableRegion {
  /** Current size in pixels. */
  size: number;
  /** Whether the region is currently collapsed. */
  isCollapsed: boolean;
  /** Collapse the region (if collapsible). */
  collapse: () => void;
  /** Expand from collapsed state. */
  expand: () => void;
  /** Resize to a specific pixel value. */
  resize: (size: number) => void;
  /** Props to pass to a component's `resizable` prop or ResizeHandle. */
  props: ResizableProps;
}

export interface ResizableProps {
  _size: number;
  // eslint-disable-next-line @astryx/boolean-prop-naming
  _isCollapsed: boolean;
  _onResizeStart: () => void;
  _onResizeMove: (delta: number) => void;
  _onResizeEnd: () => void;
  _minSizePx: number;
  _maxSizePx: number;
  _snaps: number[];
  _collapsedSize: number;
  /** Whether the region supports collapsing. */
  // eslint-disable-next-line @astryx/boolean-prop-naming
  _collapsible: boolean;
  _isResizableProps: true;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_MIN = 50;
const DEFAULT_COLLAPSED_SIZE = 40;
const STORAGE_PREFIX = 'astryx-resizable:';

// =============================================================================
// Helpers
// =============================================================================

function clampSize(
  size: number,
  min: number,
  max: number,
  snaps: number[],
): number {
  const clamped = Math.min(max, Math.max(min, size));

  // When snap points are defined, always snap to the nearest one.
  // No intermediate positions — the panel can only rest at snap values.
  if (snaps.length > 0) {
    let nearest = snaps[0];
    let nearestDist = Math.abs(clamped - nearest);
    for (let i = 1; i < snaps.length; i++) {
      const dist = Math.abs(clamped - snaps[i]);
      if (dist < nearestDist) {
        nearest = snaps[i];
        nearestDist = dist;
      }
    }
    return Math.min(max, Math.max(min, nearest));
  }

  return clamped;
}

function loadPersistedSize(key: string): number | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw != null) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'number') {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function persistSize(key: string, size: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(size));
  } catch {
    /* ignore */
  }
}

function resolveDefaultSize(defaultSize: number | string | undefined): number {
  if (defaultSize == null) {
    return 250;
  }
  if (typeof defaultSize === 'number') {
    return defaultSize;
  }
  if (defaultSize.endsWith('%')) {
    const pct = parseFloat(defaultSize);
    if (!isNaN(pct)) {
      const approx = typeof window !== 'undefined' ? window.innerWidth : 1200;
      return Math.round((pct / 100) * approx);
    }
  }
  return 250;
}

// =============================================================================
// Single-region hook
// =============================================================================

function useSingleResizable(config: UseResizableSingleConfig): ResizableRegion {
  const {
    defaultSize,
    minSizePx = DEFAULT_MIN,
    maxSizePx = Infinity,
    collapsible = false,
    collapsedSize = DEFAULT_COLLAPSED_SIZE,
    snaps = [],
    autoSaveId,
    onSizeChange,
    onCollapseChange,
  } = config;

  const resolvedDefault = resolveDefaultSize(defaultSize);
  const persisted = autoSaveId ? loadPersistedSize(autoSaveId) : null;
  const initial = persisted ?? resolvedDefault;

  const [size, setSize] = useState(() =>
    clampSize(initial, minSizePx, maxSizePx, snaps),
  );
  const [isCollapsed, setIsCollapsed] = useState(
    () => persisted === 0 && collapsible,
  );
  const preCollapseSizeRef = useRef(size);
  const dragStartSizeRef = useRef(size);

  useEffect(() => {
    if (autoSaveId) {
      persistSize(autoSaveId, isCollapsed ? 0 : size);
    }
  }, [size, isCollapsed, autoSaveId]);

  const collapse = useCallback(() => {
    if (!collapsible) {
      return;
    }
    preCollapseSizeRef.current = size;
    setIsCollapsed(true);
    setSize(0);
    onCollapseChange?.(true);
    onSizeChange?.(0);
  }, [collapsible, size, onCollapseChange, onSizeChange]);

  const expand = useCallback(() => {
    setIsCollapsed(false);
    const restored = preCollapseSizeRef.current || resolvedDefault;
    const newSize = clampSize(restored, minSizePx, maxSizePx, snaps);
    setSize(newSize);
    onCollapseChange?.(false);
    onSizeChange?.(newSize);
  }, [
    resolvedDefault,
    minSizePx,
    maxSizePx,
    snaps,
    onCollapseChange,
    onSizeChange,
  ]);

  const resize = useCallback(
    (newSize: number) => {
      const clamped = clampSize(newSize, minSizePx, maxSizePx, snaps);
      setSize(clamped);
      setIsCollapsed(false);
      onSizeChange?.(clamped);
    },
    [minSizePx, maxSizePx, snaps, onSizeChange],
  );

  const onResizeStart = useCallback(() => {
    dragStartSizeRef.current = isCollapsed ? 0 : size;
  }, [size, isCollapsed]);

  const onResizeMove = useCallback(
    (delta: number) => {
      const raw = dragStartSizeRef.current + delta;
      if (collapsible && raw < collapsedSize) {
        if (!isCollapsed) {
          preCollapseSizeRef.current = size;
          onCollapseChange?.(true);
        }
        setIsCollapsed(true);
        setSize(0);
        onSizeChange?.(0);
        return;
      }
      if (isCollapsed && raw >= collapsedSize) {
        setIsCollapsed(false);
        onCollapseChange?.(false);
      }
      const clamped = clampSize(raw, minSizePx, maxSizePx, snaps);
      setSize(clamped);
      onSizeChange?.(clamped);
    },
    [
      collapsible,
      collapsedSize,
      isCollapsed,
      size,
      minSizePx,
      maxSizePx,
      snaps,
      onSizeChange,
      onCollapseChange,
    ],
  );

  const onResizeEnd = useCallback(() => {
    // Sizes already committed during move
  }, []);

  const props: ResizableProps = {
    _size: isCollapsed ? 0 : size,
    _isCollapsed: isCollapsed,
    _onResizeStart: onResizeStart,
    _onResizeMove: onResizeMove,
    _onResizeEnd: onResizeEnd,
    _minSizePx: minSizePx,
    _maxSizePx: maxSizePx,
    _snaps: snaps,
    _collapsedSize: collapsedSize,
    _collapsible: collapsible,
    _isResizableProps: true,
  };

  return {
    size: isCollapsed ? 0 : size,
    isCollapsed,
    collapse,
    expand,
    resize,
    props,
  };
}

// =============================================================================
// Multi-region hook
// =============================================================================

/**
 * Multi-region hook — delegates to individual useSingleResizable calls.
 * Region keys must be stable across renders (same count and order).
 * This is enforced by the caller providing a static `regions` object.
 */
// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- calls useSingleResizable in .map()
function useMultiResizable(
  config: UseResizableMultiConfig,
): Record<string, ResizableRegion> {
  const {regions, autoSaveId} = config;

  // Stable key order — callers must not change region keys between renders.
  // Using Object.keys is safe here because the regions object shape is static.
  const regionEntries = Object.entries(regions);

  // Call hooks unconditionally in stable order (same count every render).

  const regionResults = regionEntries.map(([key, regionConfig]) =>
    // eslint-disable-next-line @eslint-react/rules-of-hooks -- region count is stable (documented contract)
    useSingleResizable({
      ...regionConfig,
      autoSaveId: autoSaveId ? `${autoSaveId}:${key}` : undefined,
    }),
  );

  const result: Record<string, ResizableRegion> = {};
  regionEntries.forEach(([key], i) => {
    result[key] = regionResults[i];
  });
  return result;
}

// =============================================================================
// Public API
// =============================================================================

export function useResizable(config: UseResizableSingleConfig): ResizableRegion;
export function useResizable(
  config: UseResizableMultiConfig,
): Record<string, ResizableRegion>;
export function useResizable(
  config: UseResizableSingleConfig | UseResizableMultiConfig,
): ResizableRegion | Record<string, ResizableRegion> {
  if ('regions' in config) {
    // eslint-disable-next-line @eslint-react/rules-of-hooks, react-compiler/react-compiler -- branch is determined by call-site type (stable per call site)
    return useMultiResizable(config);
  }
  // eslint-disable-next-line @eslint-react/rules-of-hooks, react-compiler/react-compiler -- branch is determined by call-site type (stable per call site)
  return useSingleResizable(config);
}
