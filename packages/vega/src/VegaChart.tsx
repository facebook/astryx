/**
 * @file VegaChart.tsx
 * @input A Vega or Vega-Lite spec (distinguished by $schema) + optional view config
 * @output A React component that renders the spec via the Vega runtime
 * @position Primary component in @xds/vega; owns the Vega View lifecycle
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

import React, {useEffect, useRef} from 'react';
import {parse, View} from 'vega';
import {compile} from 'vega-lite';
import {parseSchema} from './schema';
import type {VegaChartProps, VegaSpec} from './types';

/**
 * `VegaChart` renders a Vega or Vega-Lite specification using the Vega runtime.
 *
 * The component inspects `spec.$schema` to determine how to handle the spec:
 * - `vega-lite` schema -> compiled to Vega via `vega-lite`'s `compile()`, then rendered
 * - `vega` schema -> rendered directly without compilation
 * - Invalid / missing `$schema` -> calls `onError` and renders nothing
 *
 * It owns the full `View` lifecycle: creates the view on mount, re-creates it
 * when `spec`, `renderer`, or `viewConfig` changes, and calls `view.finalize()`
 * on cleanup to release all runtime resources.
 *
 * Callbacks (`onReady`, `onError`) are stable across renders via refs --
 * you don't need to memoize them. Pass a stable `viewConfig` reference
 * (or `useMemo`) to avoid unnecessary re-embeds.
 *
 * @example
 * ```
 * import {VegaChart} from '@xds/vega';
 *
 * // Vega-Lite spec -- compiled automatically
 * <VegaChart
 *   spec={{
 *     $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
 *     mark: 'bar',
 *     data: {values: [{a: 'A', b: 28}, {a: 'B', b: 55}]},
 *     encoding: {
 *       x: {field: 'a', type: 'ordinal'},
 *       y: {field: 'b', type: 'quantitative'},
 *     },
 *   }}
 * />
 *
 * // Vega spec -- rendered directly
 * <VegaChart
 *   spec={{
 *     $schema: 'https://vega.github.io/schema/vega/v5.json',
 *     marks: [],
 *   }}
 * />
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

  // Keep callbacks in refs so they don't need to be in the dep array.
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let view: View | null = null;
    let cancelled = false;

    const fail = (err: unknown) => {
      if (!cancelled) {
        onErrorRef.current?.(err instanceof Error ? err : new Error(String(err)));
      }
    };

    try {
      // Validate $schema and resolve the library kind.
      const schemaResult = parseSchema(spec.$schema);
      if (!schemaResult.ok) {
        fail(new Error(schemaResult.error));
        return;
      }

      // Compile Vega-Lite -> Vega if needed; otherwise use the spec directly.
      const vegaSpec: VegaSpec =
        schemaResult.library === 'vega-lite'
          ? compile(spec).spec
          : (spec as VegaSpec);

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
        .catch(fail);
    } catch (err) {
      fail(err);
    }

    return () => {
      cancelled = true;
      view?.finalize();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, renderer, viewConfig]);

  return <div ref={containerRef} className={className} style={style} />;
}
