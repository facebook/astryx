/**
 * @file XDSVegaChart.tsx
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
import type {XDSVegaChartProps, VegaSpec, VegaLiteSpec} from './types';

/**
 * `XDSVegaChart` renders a Vega or Vega-Lite specification using the Vega runtime.
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
 * Initial dataset values can be provided via `data`. They are loaded once
 * during View initialization, before the first render, and are not reactive.
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
 * Note: this component does not accept `xstyle` because `@xds/vega` does not
 * depend on StyleX. Use `className` or `style` for layout overrides.
 *
 * @example
 * ```
 * import {XDSVegaChart} from '@xds/vega';
 *
 * // Vega-Lite spec -- compiled automatically
 * <XDSVegaChart
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
 * <XDSVegaChart
 *   spec={{$schema: 'https://vega.github.io/schema/vega/v5.json', marks: []}}
 *   parseConfig={{background: '#1a1a1a'}}
 *   viewOptions={{logLevel: 1, tooltip: myTooltipHandler}}
 * />
 * ```
 */
export function XDSVegaChart({
  spec,
  data,
  compileOptions,
  parseConfig,
  parseOptions,
  viewOptions,
  className,
  style,
  ref,
  onReady,
  onError,
  ...props
}: XDSVegaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep callbacks in refs so they don't need to be in the dep array.
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let view: View | null = null;

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
      view = new View(runtime, {
        hover: true,
        ...viewOptions,
        container,
      });

      // Load initial data into named datasets before the first render.
      // data is not reactive -- changes after mount are ignored.
      if (data) {
        for (const [name, tuples] of Object.entries(data)) {
          view.data(name, tuples);
        }
      }

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
  }, [spec, data, compileOptions, parseConfig, parseOptions, viewOptions]);

  return (
    <div
      ref={node => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={className}
      style={style}
      {...props}
    />
  );
}

XDSVegaChart.displayName = 'XDSVegaChart';
