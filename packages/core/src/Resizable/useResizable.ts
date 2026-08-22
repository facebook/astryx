// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useResizable.ts
 * @input Resize configuration (defaultSize, minSizePx, maxSizePx, collapsible, snaps)
 * @output Hook return: size, isCollapsed, collapse/expand/resize methods, props for handle
 * @position Public hook; consumed by layout components via `resizable` prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Resizable/useResizable.doc.mjs
 * - /packages/core/src/Resizable/useResizable.test.tsx
 * - /packages/core/src/Resizable/Resizable.doc.mjs
 * - /packages/core/src/Resizable/index.ts
 * - /apps/storybook/stories/useResizable.stories.tsx
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
  /** Called whenever the width changes, including when a narrowing maximum forces it down. */
  onWidthChange?: (width: number) => void;
}

export interface UseResizableSingleConfig extends ResizableRegionConfig {
  /** Unique key for localStorage persistence. */
  autoSaveId?: string;
  /** Called whenever the size changes, including when a narrowing band forces it. */
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

  // The band can move under a size the viewer already chose: a container that
  // narrows lowers maxSizePx. Only the illegal direction is corrected — a band
  // that widens again leaves the size alone, or the region rubber-bands as a
  // window is resized. Correcting during render rather than in an effect keeps
  // the out-of-band size from ever being committed; a collapsed region keeps
  // its zero, and expand() applies the current band when it restores.
  const [lastBounds, setLastBounds] = useState(() => ({
    min: minSizePx,
    max: maxSizePx,
    clampedTo: null as number | null,
  }));
  if (lastBounds.min !== minSizePx || lastBounds.max !== maxSizePx) {
    const legal = isCollapsed
      ? size
      : clampSize(size, minSizePx, maxSizePx, snaps);
    const hasMoved = legal !== size;
    setLastBounds({
      min: minSizePx,
      max: maxSizePx,
      clampedTo: hasMoved ? legal : null,
    });
    if (hasMoved) {
      setSize(legal);
    }
  }

  // An involuntary clamp is still a size change: a consumer mirroring `size`
  // has to hear about it, or it renders a size the region does not have.
  const notifiedBoundsRef = useRef(lastBounds);
  useEffect(() => {
    if (notifiedBoundsRef.current === lastBounds) {
      return;
    }
    notifiedBoundsRef.current = lastBounds;
    if (lastBounds.clampedTo != null) {
      onSizeChange?.(lastBounds.clampedTo);
    }
  }, [lastBounds, onSizeChange]);

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
