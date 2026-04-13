/**
 * @file VegaChart.tsx
 * @input A Vega or Vega-Lite spec (distinguished by $schema), parse config/options, view options, and data
 * @output A React component that renders the spec via the Vega runtime
 * @position Primary component in @xds/vega; owns the Vega View lifecycle
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

import React, {useEffect, useRef} from 'react';
import {parse, View} from 'vega';
import {compile} from 'vega-lite';
import {parseSchema} from './schema';
import type {VegaChartProps, VegaSpec, VegaLiteSpec, ViewData} from './types';

/**
 * `VegaChart` renders a Vega or Vega-Lite specification using the Vega runtime.
 *
 * The component inspects `spec.$schema` to determine how to handle the spec:
 * - `vega-lite` schema -> compiled to Vega via `vega-lite`'s `compile()`, then rendered
 * - `vega` schema -> rendered directly without compilation
 * - Invalid / missing `$schema` -> calls `onError` and renders nothing
 *
 * Parse and view construction are fully configurable via `parseConfig`,
 * `parseOptions`, and `viewOptions`, which map directly to the Vega API:
 *
 *   vega.parse(spec, parseConfig, parseOptions)
 *   new vega.View(runtime, { ...viewOptions, container })
 *
 * Initial dataset values can be provided via `data` and updated independently
 * without triggering a full re-embed -- only the data is reloaded.
 *
 * It owns the full `View` lifecycle: creates the view on mount, re-creates
 * it when `spec`, `parseConfig`, `parseOptions`, or `viewOptions` changes,
 * and calls `view.finalize()` on cleanup to release all runtime resources.
 *
 * Callbacks (`onReady`, `onError`) are stable across renders via refs --
 * you don't need to memoize them. Pass stable references (or `useMemo`)
 * for `parseConfig`, `parseOptions`, `viewOptions`, and `data` to avoid
 * unnecessary re-renders.
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
 *     data: {name: 'table'},
 *     encoding: {
 *       x: {field: 'a', type: 'ordinal'},
 *       y: {field: 'b', type: 'quantitative'},
 *     },
 *   }}
 *   data={{table: [{a: 'A', b: 28}, {a: 'B', b: 55}]}}
 * />
 *
 * // Vega spec -- rendered directly
 * <VegaChart
 *   spec={{$schema: 'https://vega.github.io/schema/vega/v5.json', marks: []}}
 *   parseConfig={{background: '#1a1a1a'}}
 *   viewOptions={{logLevel: 1, tooltip: myTooltipHandler}}
 * />
 * ```
 */
export function VegaChart({
  spec,
  data,
  compileOptions,
  parseConfig,
  parseOptions,
  viewOptions,
  className,
  style,
  onReady,
  onError,
}: VegaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View | null>(null);

  // Keep callbacks in refs so they don't need to be in the dep array.
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  // Effect 1: create/destroy the View when spec or construction options change.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
          ? compile(spec as VegaLiteSpec, compileOptions).spec
          : (spec as VegaSpec);

      // parse(spec, config?, options?) -> Runtime
      const runtime = parse(vegaSpec, parseConfig, parseOptions);

      // new View(runtime, viewOptions) -- container is always injected by us.
      const view = new View(runtime, {
        hover: true,
        ...viewOptions,
        container,
      });

      viewRef.current = view;

      view
        .runAsync()
        .then(() => {
          if (cancelled) {
            view.finalize();
            viewRef.current = null;
            return;
          }
          onReadyRef.current?.(view);
        })
        .catch(fail);
    } catch (err) {
      fail(err);
    }

    return () => {
      cancelled = true;
      viewRef.current?.finalize();
      viewRef.current = null;
    };
  }, [spec, compileOptions, parseConfig, parseOptions, viewOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: load data into named datasets when `data` changes, without
  // re-creating the View. Runs after the View effect so viewRef is populated.
  useEffect(() => {
    if (!data || !viewRef.current) return;
    const view = viewRef.current;

    for (const [name, tuples] of Object.entries(data)) {
      view.data(name, tuples);
    }

    view.runAsync().catch((err: unknown) => {
      onErrorRef.current?.(err instanceof Error ? err : new Error(String(err)));
    });
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className={className} style={style} />;
}
