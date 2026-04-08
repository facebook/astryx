/**
 * @file VegaChart.tsx
 * @input A Vega-Lite spec + optional Vega view config
 * @output A React component that compiles and renders a Vega-Lite spec via the Vega runtime
 * @position Primary component in @xds/vega; owns the Vega View lifecycle
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

import React, {useEffect, useRef} from 'react';
import {parse, View} from 'vega';
import {compile} from 'vega-lite';
import type {VegaChartProps} from './types';

/**
 * `VegaChart` compiles a Vega-Lite specification and renders it using the
 * Vega runtime directly — no vega-embed intermediary.
 *
 * The component owns the full `View` lifecycle: it creates the view on mount,
 * re-creates it when `spec` or `renderer` changes, exposes the live `View`
 * via `onReady`, and calls `view.finalize()` on cleanup to release all
 * runtime resources (timers, event listeners, WebGL contexts).
 *
 * Callbacks (`onReady`, `onError`) are stable across renders via refs —
 * you don't need to memoize them. Pass a stable `viewConfig` reference
 * (or `useMemo`) to avoid unnecessary re-renders.
 *
 * @example
 * ```
 * import {VegaChart} from '@xds/vega';
 *
 * const spec = {
 *   mark: 'bar',
 *   data: {values: [{a: 'A', b: 28}, {a: 'B', b: 55}]},
 *   encoding: {
 *     x: {field: 'a', type: 'ordinal'},
 *     y: {field: 'b', type: 'quantitative'},
 *   },
 * };
 *
 * <VegaChart spec={spec} onReady={view => console.log('view ready', view)} />
 * ```
 */
export function VegaChart({
  spec,
  viewConfig,
  renderer = 'svg',
  className,
  style,
  onReady,
  onError,
}: VegaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep callbacks in refs so they never need to be in the dep array.
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let view: View | null = null;
    let cancelled = false;

    try {
      // Compile Vega-Lite → Vega spec, then parse → Vega runtime.
      const vegaSpec = compile(spec).spec;
      const runtime = parse(vegaSpec, viewConfig);

      view = new View(runtime, {
        renderer,
        container,
        hover: true,
      });

      view
        .runAsync()
        .then(() => {
          if (cancelled) {
            view?.finalize();
            return;
          }
          onReadyRef.current?.(view!);
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            onErrorRef.current?.(err instanceof Error ? err : new Error(String(err)));
          }
        });
    } catch (err: unknown) {
      if (!cancelled) {
        onErrorRef.current?.(err instanceof Error ? err : new Error(String(err)));
      }
    }

    return () => {
      cancelled = true;
      view?.finalize();
    };
  // viewConfig is intentionally in the dep array. Callers should memoize it
  // if they want to avoid re-rendering on every parent render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, renderer, viewConfig]);

  return <div ref={containerRef} className={className} style={style} />;
}
