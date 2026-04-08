/**
 * @file VegaChart.tsx
 * @input A Vega or Vega-Lite spec (distinguished by $schema), parse config/options, and view options
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
 * Parse and view construction are fully configurable via `parseConfig`,
 * `parseOptions`, and `viewOptions`, which map directly to the Vega API:
 *
 *   vega.parse(spec, parseConfig, parseOptions)
 *   new vega.View(runtime, { ...viewOptions, container })
 *
 * It owns the full `View` lifecycle: creates the view on mount, re-creates
 * it when `spec`, `parseConfig`, `parseOptions`, or `viewOptions` changes,
 * and calls `view.finalize()` on cleanup to release all runtime resources.
 *
 * Callbacks (`onReady`, `onError`) are stable across renders via refs --
 * you don't need to memoize them. Pass stable references (or `useMemo`)
 * for `parseConfig`, `parseOptions`, and `viewOptions` to avoid re-renders.
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
 *   viewOptions={{renderer: 'canvas', hover: true}}
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
          ? compile(spec, compileOptions).spec
          : (spec as VegaSpec);

      // parse(spec, config?, options?) -> Runtime
      const runtime = parse(vegaSpec, parseConfig, parseOptions);

      // new View(runtime, viewOptions) -- container is always injected by us.
      view = new View(runtime, {
        hover: true,
        ...viewOptions,
        container,
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
  // Object props are intentionally in the dep array. Callers should memoize
  // them to avoid unnecessary re-renders.
  }, [spec, compileOptions, parseConfig, parseOptions, viewOptions]);

  return <div ref={containerRef} className={className} style={style} />;
}
