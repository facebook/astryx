// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useResizable.ts
 * @input Resize configuration (defaultSize, minSize, maxSize, legacy pixel
 *   aliases, snaps) and collapse configuration (collapsible,
 *   defaultIsCollapsed, isCollapsed)
 * @output Hook return: size, isCollapsed, collapse/expand/resize methods, props for handle
 * @position Public hook; consumed by layout components via `resizable` prop
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import {observeResize} from '../utils/sharedResizeObserver';
import {devWarn} from '../utils/devWarning';
import type {SizeValue} from '../utils/types';

// =============================================================================
// Types
// =============================================================================

/**
 * A Resizable bound: pixels, a percentage of its basis, or bounded recursive CSS
 * `min()` / `max()` over those string leaves. Runtime parsing validates the full
 * expression. Template literals reject unrelated top-level strings; runtime
 * parsing remains normative for non-negativity, finiteness, and function
 * interiors.
 */
export type ResizableConstraintValue =
  number | `${number}px` | `${number}%` | `min(${string})` | `max(${string})`;

/**
 * The minimum, in one of two spellings. Exactly one may be supplied: the union
 * makes passing both a type error, so a migration cannot leave a stale
 * deprecated value shadowing the new one (AST-010 API4).
 */
export type ResizableMinConfig =
  | {minSize?: ResizableConstraintValue; minSizePx?: never}
  | {minSize?: never; minSizePx?: number};

/** The maximum, in one of two spellings. See {@link ResizableMinConfig}. */
export type ResizableMaxConfig =
  | {maxSize?: ResizableConstraintValue; maxSizePx?: never}
  | {maxSize?: never; maxSizePx?: number};

export type ResizableDirection = 'horizontal' | 'vertical';

export interface ResizableRegionSizing {
  /**
   * Initial size. At runtime, accepts a non-negative pixel number, exact `Npx`,
   * exact `N%` from 0–100, or the same bounded recursive CSS `min()` / `max()`
   * grammar as {@link ResizableConstraintValue}. The public type remains the
   * released {@link SizeValue} (`number | string`) for compatibility, so runtime
   * validation is authoritative and unsupported strings use the documented
   * fallback and development warning.
   *
   * A basis-dependent value resolves ONCE into a pixel size — against the
   * container when `containerRef` is supplied, against the viewport otherwise.
   * It configures the initial selection; it does not make the region track its
   * basis afterwards.
   */
  defaultSize?: SizeValue;
  /** Whether this region can collapse to 0. @default false */
  collapsible?: boolean;
  /** Size in px at which dragging triggers collapse. @default 40 */
  collapsedSize?: number;
  /** Pixel values to snap to during resize. */
  snaps?: number[];
  /** Cascade priority — lower number shrinks first. */
  shrinkOrder?: number;
}

export type ResizableRegionConfig = ResizableRegionSizing &
  ResizableMinConfig &
  ResizableMaxConfig;

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
  /** localStorage key for persisting width and collapse state. */
  autoSaveId?: string;
  /** Called when the width changes (on drag end). */
  onWidthChange?: (width: number) => void;
  /** Start collapsed (uncontrolled). A persisted entry wins over this. */
  defaultIsCollapsed?: boolean;
  /** Controlled collapse state. Pair with `onCollapseChange`. */
  isCollapsed?: boolean;
  /** Called when collapse state changes (via drag or programmatic). */
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export interface UseResizableSingleOptions {
  /**
   * The element a percentage is a share of. Caller-owned: only the caller
   * knows which element is the intended layout container, so the hook never
   * infers one from the panel or the handle.
   *
   * Omitted, percentages keep the released viewport basis. Supplied, they use
   * this element's content-box size on the active axis. It changes the basis
   * only — it does not make a selected size responsive.
   */
  containerRef?: RefObject<HTMLElement | null>;
  /**
   * Which axis this region resizes along. Selects the container's inline or
   * block content-box size as the percentage basis, and must match the
   * `direction` given to `ResizeHandle`. @default 'horizontal'
   */
  direction?: ResizableDirection;
  /** Unique key for localStorage persistence. */
  autoSaveId?: string;
  /**
   * Initial collapse state (uncontrolled). A persisted entry wins over it,
   * so a restored session keeps the state the user left behind.
   * Only honored when `collapsible` is true.
   */
  defaultIsCollapsed?: boolean;
  /**
   * Controlled collapse state. When set, the caller owns collapse:
   * `collapse()`, `expand()` and a drag past the collapse threshold report
   * through `onCollapseChange` instead of changing state here.
   */
  isCollapsed?: boolean;
  /** Called when size changes during drag. */
  onSizeChange?: (size: number) => void;
  /** Called when collapse state changes (via drag or programmatic). */
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export type UseResizableSingleConfig = ResizableRegionConfig &
  UseResizableSingleOptions;

export interface UseResizableMultiConfig {
  /** Layout direction, shared by every region. @default 'horizontal' */
  direction?: ResizableDirection;
  /**
   * One container for every region's percentage basis. Regions stay
   * independently pixel-selected; sharing a basis adds no ratio or
   * total-100% invariant between them.
   */
  containerRef?: RefObject<HTMLElement | null>;
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
  /**
   * The gesture ended without completing — pointercancel, a lost pointer
   * capture, or a handle unmounted mid-drag. Separate from `_onResizeEnd`
   * because a cancelled drag deliberately does not signal a resize end (#5297),
   * but it must still release everything the gesture was holding.
   *
   * Optional: `ResizableProps` is exported, so a hand-built object from before
   * this existed has to keep compiling.
   */
  _onResizeCancel?: () => void;
  _minSizePx: number;
  _maxSizePx: number;
  _snaps: number[];
  _collapsedSize: number;
  /** Whether the region supports collapsing. */
  // eslint-disable-next-line @astryx/boolean-prop-naming
  _collapsible: boolean;
  /**
   * The hook's axis, so a handle can flag a direction mismatch.
   *
   * Optional for the same reason as `_onResizeCancel`: this type is exported,
   * and requiring a new field would break every object literal that already
   * satisfies it. Absent means "no axis to check", not "horizontal".
   */
  _direction?: ResizableDirection;
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

interface PersistedResizableState {
  /** Expanded size in px, or null when the entry carries no usable size. */
  size: number | null;
  /**
   * Collapse state when the entry was written, or null when the entry
   * predates collapse persistence and says nothing about it.
   */
  isCollapsed: boolean | null;
}

/**
 * Reads a persisted entry. Three formats exist in storage:
 * - `{size, isCollapsed}` — the current format; `size` is the expanded size,
 *   so the pre-collapse width survives a collapsed session
 * - a plain non-zero number — a legacy width-only entry that never recorded
 *   collapse, so `isCollapsed` is null (unknown)
 * - a plain `0` — written by legacy collapse, which restored the region as a
 *   zero-width expanded panel (#4790); read as "collapsed, no saved size"
 */
function loadPersistedState(key: string): PersistedResizableState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw == null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'number') {
      if (!Number.isFinite(parsed)) {
        return null;
      }
      return parsed === 0
        ? {size: null, isCollapsed: true}
        : {size: parsed, isCollapsed: null};
    }
    if (typeof parsed === 'object' && parsed != null) {
      const {size, isCollapsed} = parsed as {
        size?: unknown;
        isCollapsed?: unknown;
      };
      const hasSize =
        typeof size === 'number' && Number.isFinite(size) && size > 0;
      if (hasSize || isCollapsed === true) {
        return {
          size: hasSize ? size : null,
          isCollapsed: isCollapsed === true,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function persistState(key: string, state: PersistedResizableState): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/** The released compatibility basis when there is no window to measure. */
const SERVER_BASIS = 1200;
const DEFAULT_SIZE_FALLBACK = 250;
const MAX_CSS_MATH_DEPTH = 8;
const UNIFIED_SIZE_GUIDANCE =
  'Use a non-negative number of pixels, an exact "Npx" string, an exact ' +
  `"N%" string from 0% to 100%, or a recursive CSS min()/max() expression ` +
  `nested at most ${MAX_CSS_MATH_DEPTH} levels.`;
const LEGACY_PIXEL_GUIDANCE = 'Use a non-negative number of pixels.';
const LEGACY_MAX_PIXEL_GUIDANCE =
  'Use a non-negative number of pixels or explicit Infinity.';

/** Parsed, validated input. */
type ParsedSize =
  | {kind: 'px'; value: number}
  | {kind: 'percent'; value: number}
  | {kind: 'min' | 'max'; values: ParsedSize[]};

const PX_PATTERN = /^(\d+(?:\.\d+)?)px$/;
const PERCENT_PATTERN = /^(\d+(?:\.\d+)?)%$/;
const SIZE_TOKEN_PATTERN = /^(\d+(?:\.\d+)?)(px|%)/;
const CSS_WHITESPACE_PATTERN = /^[\t\n\f\r ]$/;

/**
 * Parses the complete string. Unified values additionally accept recursive,
 * comma-separated CSS `min()` and `max()` expressions. Nesting is bounded so a
 * configuration value cannot recurse without limit.
 */
function parseSizeString(
  value: string,
  allowCssMath: boolean,
): ParsedSize | null {
  // Preserve the released atomic fast path exactly. CSS math is additive, so a
  // plain px/% value should not pay for recursive parsing on every render.
  const px = PX_PATTERN.exec(value);
  if (px) {
    const parsed = Number(px[1]);
    return Number.isFinite(parsed) ? {kind: 'px', value: parsed} : null;
  }
  const percent = PERCENT_PATTERN.exec(value);
  if (percent) {
    const parsed = Number(percent[1]);
    return Number.isFinite(parsed) && parsed <= 100
      ? {kind: 'percent', value: parsed}
      : null;
  }
  if (!allowCssMath || value.trim() !== value) {
    return null;
  }

  let offset = 0;
  const skipWhitespace = () => {
    while (CSS_WHITESPACE_PATTERN.test(value[offset] ?? '')) {
      offset += 1;
    }
  };

  const parseExpression = (depth: number): ParsedSize | null => {
    skipWhitespace();

    const kind = value.startsWith('min(', offset)
      ? 'min'
      : value.startsWith('max(', offset)
        ? 'max'
        : null;
    if (kind != null) {
      if (!allowCssMath || depth >= MAX_CSS_MATH_DEPTH) {
        return null;
      }
      offset += 4;
      const values: ParsedSize[] = [];
      while (true) {
        const child = parseExpression(depth + 1);
        if (child == null) {
          return null;
        }
        values.push(child);
        skipWhitespace();
        if (value[offset] === ')') {
          offset += 1;
          return {kind, values};
        }
        if (value[offset] !== ',') {
          return null;
        }
        offset += 1;
      }
    }

    const token = SIZE_TOKEN_PATTERN.exec(value.slice(offset));
    if (token == null) {
      return null;
    }
    offset += token[0].length;
    const parsed = Number(token[1]);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return token[2] === '%'
      ? parsed <= 100
        ? {kind: 'percent', value: parsed}
        : null
      : {kind: 'px', value: parsed};
  };

  const parsed = parseExpression(0);
  skipWhitespace();
  return parsed != null && offset === value.length ? parsed : null;
}

function parseSize(value: unknown, allowCssMath = false): ParsedSize | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? {kind: 'px', value} : null;
  }
  return typeof value === 'string'
    ? parseSizeString(value, allowCssMath)
    : null;
}

function parseLegacyPixel(
  value: unknown,
  allowInfinity: boolean,
): ParsedSize | null {
  if (typeof value !== 'number' || value < 0) {
    return null;
  }
  if (Number.isFinite(value) || (allowInfinity && value === Infinity)) {
    return {kind: 'px', value};
  }
  return null;
}

/** Whether this parsed value must be recomputed when its basis changes. */
function dependsOnBasis(parsed: ParsedSize | null): boolean {
  if (parsed == null || parsed.kind === 'px') {
    return false;
  }
  if (parsed.kind === 'percent') {
    return true;
  }
  return parsed.values.some(dependsOnBasis);
}

/**
 * A parsed size in pixels, or `null` when it depends on a basis that is not
 * measurable yet. Percentage leaves round before CSS math is evaluated so
 * fractional geometry does not leak into ARIA or persistence.
 */
function toPixels(parsed: ParsedSize, basis: number | null): number | null {
  if (parsed.kind === 'px') {
    return parsed.value;
  }
  if (parsed.kind === 'percent') {
    return basis == null ? null : Math.round((parsed.value / 100) * basis);
  }

  let aggregate: number | null = null;
  for (const child of parsed.values) {
    const resolved = toPixels(child, basis);
    if (resolved == null) {
      return null;
    }
    aggregate =
      aggregate == null
        ? resolved
        : parsed.kind === 'min'
          ? Math.min(aggregate, resolved)
          : Math.max(aggregate, resolved);
  }
  return aggregate;
}

/**
 * Resolves one configured value, applying its role's fallback when the input is
 * not accepted. The warning remains development-only through `devWarn`; every
 * build takes the same deterministic fallback.
 */
function resolveBound(
  raw: unknown,
  parsed: ParsedSize | null,
  basis: number | null,
  fallback: number,
  label: string,
  accepted: string,
  didWarnRef: {current: boolean},
): number {
  if (raw === undefined) {
    return fallback;
  }
  if (parsed == null) {
    if (!didWarnRef.current) {
      didWarnRef.current = true;
      devWarn(
        'useResizable',
        `${label}: ${JSON.stringify(raw)} is not a size. ${accepted} ` +
          `Falling back to ${fallback}.`,
      );
    }
    return fallback;
  }
  return toPixels(parsed, basis) ?? fallback;
}

/**
 * The container's content-box size on the active axis.
 *
 * Content box, not border box: a bordered or padded container would otherwise
 * report a basis a few pixels larger than the space a percentage is actually a
 * share of, and that error lands in `aria-valuemax`. The observer entry
 * carries `contentBoxSize` natively, which is already writing-mode aware;
 * measuring the element is the fallback for the synthetic entry
 * `observeResize` fires on registration.
 */
function measureContentBox(
  element: HTMLElement,
  direction: ResizableDirection,
  entry?: ResizeObserverEntry,
): number | null {
  const box = entry?.contentBoxSize?.[0];
  if (box) {
    return direction === 'vertical' ? box.blockSize : box.inlineSize;
  }
  const style =
    typeof window === 'undefined' ? null : window.getComputedStyle(element);
  if (style == null) {
    return null;
  }
  const size =
    direction === 'vertical'
      ? element.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom)
      : element.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
  return Number.isFinite(size) ? size : null;
}

// =============================================================================
// Single-region hook
// =============================================================================

function useSingleResizable(config: UseResizableSingleConfig): ResizableRegion {
  const {
    defaultSize,
    minSize,
    maxSize,
    minSizePx,
    maxSizePx,
    containerRef,
    direction = 'horizontal',
    collapsible = false,
    collapsedSize = DEFAULT_COLLAPSED_SIZE,
    snaps: configuredSnaps,
    autoSaveId,
    defaultIsCollapsed,
    isCollapsed: controlledIsCollapsed,
    onSizeChange,
    onCollapseChange,
  } = config;
  const emptySnapsRef = useRef<number[]>([]);
  const snaps = configuredSnaps ?? emptySnapsRef.current;

  // The unified prop wins over its deprecated alias. The types make supplying
  // both an error, so reaching here means untyped JavaScript, an `any`, or a
  // spread — exactly the case where a stale alias hidden in an object would
  // otherwise silently beat the explicit migration target.
  const hasUnifiedMin = minSize !== undefined;
  const hasUnifiedMax = maxSize !== undefined;
  const minConflict = hasUnifiedMin && minSizePx !== undefined;
  const maxConflict = hasUnifiedMax && maxSizePx !== undefined;
  const rawMin = hasUnifiedMin ? minSize : minSizePx;
  const rawMax = hasUnifiedMax ? maxSize : maxSizePx;

  const parsedDefault = parseSize(defaultSize, true);
  const parsedMin = hasUnifiedMin
    ? parseSize(minSize, true)
    : parseLegacyPixel(minSizePx, false);
  const parsedMax = hasUnifiedMax
    ? parseSize(maxSize, true)
    : parseLegacyPixel(maxSizePx, true);
  const hasContainer = containerRef != null;
  const persisted = autoSaveId ? loadPersistedState(autoSaveId) : null;
  const initialDefaultRef = useRef<{px: number; isFinal: boolean} | null>(null);
  const [, setDefaultBasisCleanupTick] = useState(0);

  const defaultDependsOnBasis = dependsOnBasis(parsedDefault);
  const boundsDependOnBasis =
    dependsOnBasis(parsedMin) || dependsOnBasis(parsedMax);
  // A default needs a live container only until its initial pixel choice is
  // final. A persisted pixel choice wins without measuring the unused default.
  // Bounds are different: percentage leaves at any depth keep following the
  // basis so they can re-clamp the selected pixel size.
  const defaultNeedsInitialBasis =
    persisted?.size == null &&
    defaultDependsOnBasis &&
    initialDefaultRef.current?.isFinal !== true;
  const observeContainerBasis =
    hasContainer && (boundsDependOnBasis || defaultNeedsInitialBasis);
  const observeViewportBasis = !hasContainer && boundsDependOnBasis;

  // The container basis, read through the shared observer. `useSyncExternalStore`
  // rather than an effect: the store IS the measurement, so there is no render
  // that paints before the basis is known and no `setState` in an effect.
  //
  // The subscription depends on the ELEMENT, not on the ref object. A ref is
  // stable across an element swap, so `containerRef.current` can become a
  // different node — a remount behind the same ref, a conditional branch, a
  // portal moving — without any input to this hook changing. Keyed on the ref,
  // the old detached node stayed observed (and a detached node measures 0,
  // which is how a replacement zeroed the bounds) and the new one was never
  // observed at all.
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(
    null,
  );
  const containerBasisRef = useRef<number | null>(null);

  // Follow the ref to whatever element it points at now. No dependency array:
  // a ref mutation is invisible to React, and refs are assigned during commit,
  // so after every commit is the only moment this comparison can be made — the
  // deps the heuristic suggests ([containerRef]) would run this once and never
  // notice a swap. State is set only when the element actually changed, so it
  // settles in one extra render rather than looping.
  // eslint-disable-next-line @eslint-react/exhaustive-deps -- must run after every commit; a ref swap changes no dependency
  useEffect(() => {
    const element = containerRef?.current ?? null;
    if (element !== containerElement) {
      // The cached measurement belongs to the element being left behind.
      containerBasisRef.current = null;
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- the observed element is DOM identity, which exists only after commit
      setContainerElement(element);
    }
  });

  const subscribeToContainer = useCallback(
    (onStoreChange: () => void) => {
      if (!observeContainerBasis || containerElement == null) {
        return () => {};
      }
      // Unsubscribe by callback: several regions share one container, and any
      // number of unrelated hooks may observe the same node.
      return observeResize(containerElement, entry => {
        containerBasisRef.current = measureContentBox(
          containerElement,
          direction,
          entry,
        );
        onStoreChange();
      });
    },
    [containerElement, observeContainerBasis, direction],
  );
  const readContainerBasis = useCallback(() => {
    if (!observeContainerBasis || containerElement == null) {
      // An inactive subscription owns no current measurement. Clearing this is
      // important when a percentage bound is added later: the first active
      // render must measure the container as it is now, not clamp against the
      // last basis seen by a default-only subscription.
      containerBasisRef.current = null;
      return null;
    }
    // Cached in a ref so the snapshot is referentially stable between resizes;
    // returning a fresh measurement every call would loop the store.
    if (containerBasisRef.current == null) {
      containerBasisRef.current = measureContentBox(
        containerElement,
        direction,
      );
    }
    return containerBasisRef.current;
  }, [containerElement, observeContainerBasis, direction]);
  const containerBasis = useSyncExternalStore(
    subscribeToContainer,
    readContainerBasis,
    () => null,
  );

  // The viewport basis is always readable synchronously. Percentage-dependent
  // BOUNDS subscribe to later resizes (FR6); a default reads the initial
  // snapshot only, because it becomes a pixel choice immediately.
  const subscribeToViewport = useCallback(
    (onStoreChange: () => void) => {
      if (
        hasContainer ||
        !observeViewportBasis ||
        typeof window === 'undefined'
      ) {
        return () => {};
      }
      window.addEventListener('resize', onStoreChange);
      return () => window.removeEventListener('resize', onStoreChange);
    },
    [hasContainer, observeViewportBasis],
  );
  const viewportBasis = useSyncExternalStore(
    subscribeToViewport,
    () => (typeof window === 'undefined' ? SERVER_BASIS : window.innerWidth),
    () => SERVER_BASIS,
  );

  // With a container, its content box is the basis; without one, the released
  // viewport basis. Before a supplied container has been measured — the first
  // render, the server, and any moment it is display:none or detached — the
  // deterministic 1200px stands in, and the first real measurement replaces it.
  //
  // A zero measurement is not a measurement. A hidden or detached container
  // reports 0, and resolving `'50%'` against it produced a real maximum of 0:
  // the panel collapsed and, with `autoSaveId`, that 0 was written over a
  // perfectly good saved width. Treating 0 as unmeasured keeps the temporary
  // basis until the container is actually laid out (AST-010 Platform support).
  const needsContainerBasis = observeContainerBasis;
  const hasPositiveMeasurement = containerBasis != null && containerBasis > 0;
  const liveBasis = hasContainer
    ? hasPositiveMeasurement
      ? containerBasis
      : SERVER_BASIS
    : viewportBasis;
  const isBasisMeasured = needsContainerBasis ? hasPositiveMeasurement : true;

  // One stable basis per gesture. A container that resizes mid-drag would
  // otherwise move the bound under the pointer; the new basis applies once the
  // gesture ends.
  const gestureBasisRef = useRef<number | null>(null);
  // Only forces the render that releases the frozen basis when a gesture ends.
  const [gestureTick, setGestureTick] = useState(0);
  void gestureTick;
  const basis = gestureBasisRef.current ?? liveBasis;

  const didWarnMinRef = useRef(false);
  const didWarnMaxRef = useRef(false);
  const didWarnDefaultRef = useRef(false);
  const didWarnInvertedRef = useRef(false);
  const didWarnMinAliasRef = useRef(false);
  const didWarnMaxAliasRef = useRef(false);

  // Bounds re-resolve from the live basis on every render — that is the whole
  // point of a percentage bound — and clamp the pixel selection below.
  const resolvedMin = resolveBound(
    rawMin,
    parsedMin,
    basis,
    DEFAULT_MIN,
    hasUnifiedMin ? 'minSize' : 'minSizePx',
    hasUnifiedMin ? UNIFIED_SIZE_GUIDANCE : LEGACY_PIXEL_GUIDANCE,
    didWarnMinRef,
  );
  const resolvedMax = resolveBound(
    rawMax,
    parsedMax,
    basis,
    Infinity,
    hasUnifiedMax ? 'maxSize' : 'maxSizePx',
    hasUnifiedMax ? UNIFIED_SIZE_GUIDANCE : LEGACY_MAX_PIXEL_GUIDANCE,
    didWarnMaxRef,
  );

  // A basis-dependent default is resolved ONCE into a pixel size. Latched in a
  // ref (React's sanctioned lazy-init shape) rather than recomputed, because a
  // default that kept tracking its basis would be a second, responsive sizing
  // mode — the thing this API deliberately does not have.
  //
  // Not final while a supplied container is still unmeasured: that render used
  // the temporary 1200px stand-in, and the first real measurement replaces it.
  // Once final, a default-only subscription is removed. The correction is not a
  // user interaction, so it neither persists the placeholder nor fires
  // `onSizeChange`.
  if (initialDefaultRef.current == null || !initialDefaultRef.current.isFinal) {
    initialDefaultRef.current = {
      px: resolveBound(
        defaultSize,
        parsedDefault,
        basis,
        DEFAULT_SIZE_FALLBACK,
        'defaultSize',
        UNIFIED_SIZE_GUIDANCE,
        didWarnDefaultRef,
      ),
      isFinal: isBasisMeasured,
    };
  }
  const initialDefaultPx = initialDefaultRef.current.px;

  // The size the user has settled on, or null while a container-relative
  // default is still waiting for its first positive measurement. Once that
  // basis is real, the default becomes an ordinary pixel selection — including
  // any clamp applied at initialization. Leaving it represented by `null`
  // allowed the raw default to be re-read later: 321px first clamped to 200px
  // in a 400px container, then revived to 321px when the container grew.
  //
  // Initialized outright whenever the basis is already real on the first
  // render — every pixel-only configuration, and the no-container percentage
  // path. Only a supplied container needs a measurement that does not exist
  // until after commit, so only it starts null. Initializing lazily in all
  // cases cost every legacy pixel-only mount a second render pass, because the
  // adjustment below then had to run on the first render to fill the value in.
  const [chosenSize, setChosenSize] = useState<number | null>(() => {
    if (persisted?.size != null) {
      return persisted.size;
    }
    return isBasisMeasured
      ? clampSize(initialDefaultPx, resolvedMin, resolvedMax, snaps)
      : null;
  });

  if (
    hasContainer &&
    !boundsDependOnBasis &&
    isBasisMeasured &&
    defaultNeedsInitialBasis &&
    chosenSize != null
  ) {
    // A programmatic resize may have selected pixels while the container was
    // still unmeasured, so chosenSize can already be non-null here. Force the
    // render that re-evaluates and removes the now-finished default subscription.
    setDefaultBasisCleanupTick(tick => tick + 1);
  }

  if (isBasisMeasured && chosenSize == null) {
    // The supplied container has now been measured, so the selection latched
    // against the temporary basis is replaced by one against the real one.
    // Render-phase adjustment is deliberate: React re-runs this render before
    // paint, so the corrected selection, paint, persistence, and ARIA all see
    // the same pixel value. It fires no interaction callback.
    setChosenSize(clampSize(initialDefaultPx, resolvedMin, resolvedMax, snaps));
  }

  // A re-resolved bound clamps the SELECTION, not just the paint. Deriving
  // alone was not enough: the stored choice survived, so a container that
  // shrank and grew again revived the pre-clamp size — measured 320px
  // reviving to 560px. The clamp has to be committed to be permanent.
  //
  // Adjusting state during render (React's documented shape for "a prop
  // changed, so state must follow") rather than in an effect: React re-runs
  // this render before painting, so nothing shows at the stale size, and no
  // interaction callback fires for what is only a layout correction (FR10).
  //
  // Held until the basis is final. Before a supplied container is measured the
  // bounds come from the temporary 1200px stand-in, and committing against
  // that would move a persisted size to fit a basis that was never real.
  const [committedBounds, setCommittedBounds] = useState({
    min: resolvedMin,
    max: resolvedMax,
  });
  if (
    isBasisMeasured &&
    gestureBasisRef.current == null &&
    (committedBounds.min !== resolvedMin || committedBounds.max !== resolvedMax)
  ) {
    setCommittedBounds({min: resolvedMin, max: resolvedMax});
    setChosenSize(current =>
      current == null
        ? null
        : clampSize(current, resolvedMin, resolvedMax, snaps),
    );
  }

  // Derived for paint, so the clamp above and the rendered size agree on the
  // very render that observes a new basis.
  const size = clampSize(
    chosenSize ?? initialDefaultPx,
    resolvedMin,
    resolvedMax,
    snaps,
  );
  const [uncontrolledIsCollapsed, setUncontrolledIsCollapsed] = useState(
    () => persisted?.isCollapsed ?? defaultIsCollapsed ?? false,
  );

  const isControlled = controlledIsCollapsed !== undefined;
  const isCollapsed =
    collapsible &&
    (isControlled ? controlledIsCollapsed : uncontrolledIsCollapsed);
  const dragStartSizeRef = useRef(size);

  // Mirrors isCollapsed so the callbacks below read the live value instead of
  // the one their last render captured. Two cases reach them from a stale
  // closure: two imperative calls in one tick, and a drag — ResizeHandle
  // registers its pointermove listener once at pointer down, so a whole
  // gesture runs against one props snapshot.
  const isCollapsedRef = useRef(isCollapsed);
  isCollapsedRef.current = isCollapsed;

  // Controlled callers own the state; collapse() and a drag past the
  // threshold report through onCollapseChange and change nothing here.
  const setCollapsed = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        isCollapsedRef.current = value;
        setUncontrolledIsCollapsed(value);
      }
    },
    [isControlled],
  );

  // Configuration warnings live in an effect, not in render: render runs twice
  // under StrictMode and must stay free of side effects.
  useEffect(() => {
    if (minConflict && !didWarnMinAliasRef.current) {
      didWarnMinAliasRef.current = true;
      devWarn(
        'useResizable',
        'both `minSize` and `minSizePx` were supplied. `minSize` wins; the ' +
          'deprecated `minSizePx` is ignored.',
      );
    }
    if (maxConflict && !didWarnMaxAliasRef.current) {
      didWarnMaxAliasRef.current = true;
      devWarn(
        'useResizable',
        'both `maxSize` and `maxSizePx` were supplied. `maxSize` wins; the ' +
          'deprecated `maxSizePx` is ignored.',
      );
    }
  }, [minConflict, maxConflict]);

  useEffect(() => {
    if (resolvedMin > resolvedMax && !didWarnInvertedRef.current) {
      didWarnInvertedRef.current = true;
      devWarn(
        'useResizable',
        `the resolved minimum (${resolvedMin}px) is above the resolved ` +
          `maximum (${resolvedMax}px). The maximum wins, as it always has.`,
      );
    }
  }, [resolvedMin, resolvedMax]);

  useEffect(() => {
    // Nothing is written while the basis is still the temporary stand-in. The
    // size on such a render is a placeholder, and persisting it overwrites the
    // real saved size with a value derived from a basis that was never real
    // (AST-010 Platform support, FR9).
    if (autoSaveId && isBasisMeasured) {
      persistState(autoSaveId, {size, isCollapsed});
    }
  }, [size, isCollapsed, autoSaveId, isBasisMeasured]);

  const collapse = useCallback(() => {
    // The already-collapsed guard keeps a repeated call from re-notifying a
    // transition that already happened.
    if (!collapsible || isCollapsedRef.current) {
      return;
    }
    setCollapsed(true);
    onCollapseChange?.(true);
    onSizeChange?.(0);
  }, [collapsible, setCollapsed, onCollapseChange, onSizeChange]);

  const expand = useCallback(() => {
    const wasCollapsed = isCollapsedRef.current;
    setCollapsed(false);
    if (wasCollapsed) {
      onCollapseChange?.(false);
    }
    onSizeChange?.(size);
  }, [setCollapsed, size, onCollapseChange, onSizeChange]);

  const resize = useCallback(
    (newSize: number) => {
      // An invalid programmatic size repairs nothing — it must not replace a
      // legal selection with NaN, which would then reach paint, storage and
      // `aria-valuenow`.
      if (!Number.isFinite(newSize) || newSize < 0) {
        devWarn(
          'useResizable',
          `resize(${String(newSize)}) is not a pixel size. Keeping the ` +
            'current size. Percentages configure the hook; they are not a ' +
            'programmatic input.',
        );
        return;
      }
      const clamped = clampSize(newSize, resolvedMin, resolvedMax, snaps);
      const wasCollapsed = isCollapsedRef.current;
      setChosenSize(clamped);
      setCollapsed(false);
      // Resizing out of the collapsed state is an implicit expand — notify
      // like the drag path does when it crosses back over the threshold.
      if (wasCollapsed) {
        onCollapseChange?.(false);
      }
      onSizeChange?.(clamped);
    },
    [
      resolvedMin,
      resolvedMax,
      snaps,
      setCollapsed,
      onCollapseChange,
      onSizeChange,
    ],
  );

  const onResizeStart = useCallback(() => {
    // Freeze the basis for the whole gesture so a container resizing mid-drag
    // cannot move the bound out from under the pointer.
    gestureBasisRef.current = liveBasis;
    dragStartSizeRef.current = isCollapsedRef.current ? 0 : size;
  }, [size, liveBasis]);

  const onResizeMove = useCallback(
    (delta: number) => {
      const raw = dragStartSizeRef.current + delta;
      if (collapsible && raw < collapsedSize) {
        if (!isCollapsedRef.current) {
          setCollapsed(true);
          onCollapseChange?.(true);
          onSizeChange?.(0);
        }
        return;
      }
      if (isCollapsedRef.current && raw >= collapsedSize) {
        setCollapsed(false);
        onCollapseChange?.(false);
      }
      const clamped = clampSize(raw, resolvedMin, resolvedMax, snaps);
      setChosenSize(clamped);
      onSizeChange?.(clamped);
    },
    [
      collapsible,
      collapsedSize,
      setCollapsed,
      resolvedMin,
      resolvedMax,
      snaps,
      onSizeChange,
      onCollapseChange,
    ],
  );

  // Releasing the frozen basis needs a render to apply whatever the basis
  // became during the gesture.
  const releaseGestureBasis = useCallback(() => {
    if (gestureBasisRef.current != null) {
      gestureBasisRef.current = null;
      setGestureTick(tick => tick + 1);
    }
  }, []);

  const onResizeEnd = useCallback(() => {
    // Sizes are already committed during move; only the basis is held.
    releaseGestureBasis();
  }, [releaseGestureBasis]);

  // A gesture that is cancelled rather than completed — pointercancel, a lost
  // capture, a handle unmounted mid-drag — is still over. It does not signal a
  // resize end (that is #5297's contract, and the sizes were committed during
  // move anyway), but the basis it froze has to come back, or every later
  // percentage bound stays pinned to the container size at grab time.
  const onResizeCancel = releaseGestureBasis;

  const props: ResizableProps = {
    _size: isCollapsed ? 0 : size,
    _isCollapsed: isCollapsed,
    _onResizeStart: onResizeStart,
    _onResizeMove: onResizeMove,
    _onResizeEnd: onResizeEnd,
    _onResizeCancel: onResizeCancel,
    _minSizePx: resolvedMin,
    _maxSizePx: resolvedMax,
    _snaps: snaps,
    _collapsedSize: collapsedSize,
    _collapsible: collapsible,
    _direction: direction,
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
  const {regions, autoSaveId, containerRef, direction} = config;

  // Stable key order — callers must not change region keys between renders.
  // Using Object.keys is safe here because the regions object shape is static.
  const regionEntries = Object.entries(regions);

  // Call hooks unconditionally in stable order (same count every render).

  const regionResults = regionEntries.map(([key, regionConfig]) =>
    // eslint-disable-next-line @eslint-react/rules-of-hooks -- region count is stable (documented contract)
    useSingleResizable({
      ...regionConfig,
      // One container and one axis for every region (AST-010 FR11). Regions
      // stay independently pixel-selected; sharing a basis introduces no ratio
      // between them and no 100% total.
      containerRef,
      direction,
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
