// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableWindow.ts
 * @input Parent-admitted data/keys, parent-owned shared geometry source and DOM refs
 * @output Private stable row/gap plan, one focus island and fixed-mode status
 * @position Table pre-cell planner; owns no scroll listener, observer or frame
 */
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import {useIsomorphicLayoutEffect} from '../../../hooks/useIsomorphicLayoutEffect';
import {focusForLastInput, isFocusDetached} from '../../../utils/focusReturn';
import {useInteractionModalityTracking} from '../../../utils/interactionModality';
import {devWarn} from '../../../utils/devWarning';
import {
  calculateTableWindow,
  createTableWindowSegments,
  isPositiveFinite,
  reconcileTableAnchor,
  type TableWindowPlan,
  type WindowSegment,
} from './tableWindow';
import {
  getTableVirtualizationConfig,
  type TableVirtualizationCapability,
  type UseTableVirtualizationConfig,
} from './useTableVirtualization';

export interface TableWindowGeometry {
  /** Actual unobscured body viewport height; sticky occlusion is accounted for once by Table. */
  viewportHeight: number;
  scrollTop: number;
  /** Effective body origin in the same coordinate space as scrollTop. */
  bodyOffset: number;
  isMeasured: boolean;
}
export interface TableWindowGeometrySource {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => TableWindowGeometry;
  getServerSnapshot: () => TableWindowGeometry;
}
export interface UseTableWindowOptions<T> {
  capability: TableVirtualizationCapability | undefined;
  data: T[];
  keys: (string | number)[];
  isAdmitted: boolean;
  viewport: RefObject<HTMLDivElement | null>;
  body: RefObject<HTMLTableSectionElement | null>;
  table: RefObject<HTMLTableElement | null>;
  geometry: TableWindowGeometrySource;
}
export interface TableWindowResult {
  segments: WindowSegment[];
  isWindowed: boolean;
  isFixedHeight: boolean;
  onRowFocus: (key: string | number) => void;
  /** Parent invokes only for genuine departure, including its recognized layer ownership. */
  onRowBlur: () => void;
}
interface CommittedWindow {
  data: unknown[];
  keys: (string | number)[];
  config: Readonly<UseTableVirtualizationConfig>;
  geometry: TableWindowGeometry;
  plan: TableWindowPlan;
}
interface Violation {
  data: unknown[];
  keys: (string | number)[];
  config: Readonly<UseTableVirtualizationConfig>;
  reason: string;
}
const EMPTY_GEOMETRY: TableWindowGeometry = Object.freeze({
  viewportHeight: 0,
  scrollTop: 0,
  bodyOffset: 0,
  isMeasured: false,
});
const getEmptyGeometry = () => EMPTY_GEOMETRY;
const subscribeToNothing = () => () => {};

/** Diagnostics inspect only mounted native rows/cells; all observers belong to Table. */
function getGeometryViolation(
  body: HTMLTableSectionElement,
  viewport: HTMLDivElement,
  table: HTMLTableElement,
  rowHeight: number,
  totalHeight: number,
): string | undefined {
  if (
    !body.isConnected ||
    !viewport.isConnected ||
    !table.isConnected ||
    !table.contains(body) ||
    !viewport.contains(table) ||
    viewport.clientHeight <= 0
  ) {
    return undefined;
  }
  const bodyHeight = body.getBoundingClientRect().height;
  if (!isPositiveFinite(bodyHeight)) {
    return undefined;
  }
  if (
    Math.abs(bodyHeight - totalHeight) > 1 ||
    (viewport.scrollHeight > 0 && totalHeight > viewport.scrollHeight + 1)
  ) {
    return 'The browser cannot represent the declared body extent or fixed row pitch.';
  }
  for (const row of Array.from(body.rows)) {
    if (row.getAttribute('aria-hidden') === 'true') {
      continue;
    }
    const height = row.getBoundingClientRect().height;
    if (height > 0 && Math.abs(height - rowHeight) > 0.75) {
      return 'Mounted row pitch does not match rowHeight.';
    }
    for (const cell of Array.from(row.cells)) {
      if (cell.clientHeight > 0 && cell.scrollHeight > cell.clientHeight + 1) {
        return 'Mounted cell content exceeds the declared fixed height.';
      }
    }
  }
  return undefined;
}

export function useTableWindow<T>({
  capability,
  data,
  keys,
  isAdmitted,
  viewport,
  body,
  table,
  geometry,
}: UseTableWindowOptions<T>): TableWindowResult {
  const [violation, setViolation] = useState<Violation | undefined>();
  const config = getTableVirtualizationConfig(capability);
  const hasValidConfig =
    config !== undefined &&
    calculateTableWindow({
      rowCount: data.length,
      rowHeight: config.rowHeight,
      viewportHeight: config.viewportHeight,
      scrollTop: 0,
      bodyOffset: 0,
      isMeasured: false,
    }) !== null;
  const isRejected =
    violation?.data === data &&
    violation.keys === keys &&
    violation.config === config;
  const canWindow =
    isAdmitted &&
    hasValidConfig &&
    !isRejected &&
    keys.length === data.length &&
    data.length > 0;
  const snapshot = useSyncExternalStore(
    canWindow ? geometry.subscribe : subscribeToNothing,
    canWindow ? geometry.getSnapshot : getEmptyGeometry,
    canWindow ? geometry.getServerSnapshot : getEmptyGeometry,
  );
  const [focusedKey, setFocusedKey] = useState<string | number | undefined>();
  const previous = useRef<CommittedWindow | undefined>(undefined);
  const pendingAnchor = useRef<
    | {
        source: TableWindowGeometrySource;
        from: number;
        to: number;
        viewport: HTMLDivElement | null;
      }
    | undefined
  >(undefined);
  const warned = useRef(new Set<string>());
  const temporaryFocus = useRef<
    {node: HTMLDivElement; dispose: () => void} | undefined
  >(undefined);
  useInteractionModalityTracking();

  // This is the only full-data pass owned here, and never runs on a scroll snapshot.
  const keyIndices = useMemo(() => {
    const indices = new Map<string | number, number>();
    if (hasValidConfig && isAdmitted) {
      for (let index = 0; index < keys.length; index++) {
        indices.set(keys[index], index);
      }
    }
    return indices;
  }, [keys, hasValidConfig, isAdmitted]);
  const focusIndex =
    focusedKey === undefined ? undefined : keyIndices.get(focusedKey);
  const last = previous.current;
  const hasCurrentMeasurement =
    snapshot.isMeasured &&
    isPositiveFinite(snapshot.viewportHeight) &&
    Number.isFinite(snapshot.scrollTop) &&
    Number.isFinite(snapshot.bodyOffset) &&
    snapshot.bodyOffset >= 0;
  const effectiveGeometry = hasCurrentMeasurement
    ? snapshot
    : last != null && last.config === config
      ? last.geometry
      : {
          viewportHeight: config?.viewportHeight ?? 0,
          scrollTop: 0,
          bodyOffset: 0,
          isMeasured: false,
        };
  const hasChangedInputs =
    last !== undefined &&
    (last.data !== data ||
      last.keys !== keys ||
      last.config.rowHeight !== config?.rowHeight ||
      last.config.viewportHeight !== config?.viewportHeight);
  const anchorScroll =
    canWindow && !isRejected && hasChangedInputs && config && last
      ? reconcileTableAnchor({
          previousKeys: last.keys,
          keys,
          keyIndices,
          firstVisibleIndex: last.plan.firstVisibleIndex,
          offset: (last.plan.offset / last.config.rowHeight) * config.rowHeight,
          rowHeight: config.rowHeight,
          viewportHeight: effectiveGeometry.viewportHeight,
          bodyOffset: effectiveGeometry.bodyOffset,
        })
      : undefined;
  const pending = pendingAnchor.current;
  const isAwaitingAnchor =
    pending?.source === geometry &&
    pending.from === snapshot.scrollTop &&
    pending.viewport === viewport.current;
  const resolvedScroll =
    anchorScroll ??
    (isAwaitingAnchor ? pending.to : effectiveGeometry.scrollTop);
  const plan =
    canWindow && !isRejected && config
      ? calculateTableWindow({
          rowCount: data.length,
          rowHeight: config.rowHeight,
          viewportHeight: effectiveGeometry.viewportHeight,
          scrollTop: resolvedScroll,
          bodyOffset: effectiveGeometry.bodyOffset,
          isMeasured: effectiveGeometry.isMeasured,
          focusIndex,
        })
      : null;
  const isWindowed = plan !== null;
  const start = plan?.start ?? 0;
  const end = plan?.end ?? data.length;
  const rowHeight = config?.rowHeight ?? 0;
  // Range snapshots within the same mounted interval retain the exact segment array.
  const segments = useMemo<WindowSegment[]>(() => {
    if (!isWindowed) {
      return data.length === 0
        ? []
        : [{type: 'rows', start: 0, end: data.length}];
    }
    return createTableWindowSegments(
      data.length,
      rowHeight,
      start,
      end,
      focusIndex,
    );
  }, [isWindowed, start, end, data.length, rowHeight, focusIndex]);

  const onRowFocus = useCallback(
    (key: string | number) => setFocusedKey(key),
    [],
  );
  const onRowBlur = useCallback(() => setFocusedKey(undefined), []);

  useIsomorphicLayoutEffect(() => {
    if (
      temporaryFocus.current &&
      temporaryFocus.current.node !== viewport.current
    ) {
      temporaryFocus.current.dispose();
      temporaryFocus.current = undefined;
    }
    if (focusedKey !== undefined && focusIndex === undefined) {
      const node = viewport.current;
      if (node && isFocusDetached(node.ownerDocument)) {
        if (!node.hasAttribute('tabindex')) {
          node.setAttribute('tabindex', '-1');
          const dispose = () => {
            node.removeEventListener('blur', dispose);
            if (node.getAttribute('tabindex') === '-1') {
              node.removeAttribute('tabindex');
            }
          };
          temporaryFocus.current = {node, dispose};
          node.addEventListener('blur', dispose, {once: true});
        }
        focusForLastInput(node, {preventScroll: true});
      }
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- removed logical focus releases the island after commit
      setFocusedKey(undefined);
    }
    if (!isWindowed || !config || !plan) {
      previous.current = undefined;
      pendingAnchor.current = undefined;
      return;
    }
    if (anchorScroll !== undefined) {
      pendingAnchor.current = {
        source: geometry,
        from: snapshot.scrollTop,
        to: anchorScroll,
        viewport: viewport.current,
      };
    } else if (!isAwaitingAnchor) {
      pendingAnchor.current = undefined;
    }
    if (
      anchorScroll !== undefined &&
      viewport.current &&
      Math.abs(viewport.current.scrollTop - anchorScroll) > 0.5
    ) {
      viewport.current.scrollTop = anchorScroll;
    }
    previous.current = {
      data,
      keys,
      config,
      geometry: {
        ...effectiveGeometry,
        scrollTop: resolvedScroll,
      },
      plan,
    };
    if (body.current && viewport.current && table.current) {
      const reason = getGeometryViolation(
        body.current,
        viewport.current,
        table.current,
        config.rowHeight,
        plan.totalHeight,
      );
      if (reason) {
        if (!warned.current.has(reason)) {
          warned.current.add(reason);
          devWarn(
            'Table',
            `${reason} Rendering all rows without fixed constraints.`,
          );
        }
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- bounded mounted-DOM validation disables invalid fixed geometry in all builds
        setViolation({data, keys, config, reason});
      }
    }
  });
  useIsomorphicLayoutEffect(
    () => () => {
      temporaryFocus.current?.dispose();
      temporaryFocus.current = undefined;
      previous.current = undefined;
      pendingAnchor.current = undefined;
    },
    [],
  );

  return useMemo(
    () => ({
      segments,
      isWindowed,
      isFixedHeight: isWindowed,
      onRowFocus,
      onRowBlur,
    }),
    [segments, isWindowed, onRowFocus, onRowBlur],
  );
}
