/**
 * @file VegaChart.tsx
 * @input A Vega-Lite spec + optional embed options
 * @output A React component that renders a Vega-Lite chart via vega-embed
 * @position Primary component in @xds/vega; wraps vega-embed in a React lifecycle
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

import React, {useEffect, useRef} from 'react';
import embed, {type Result} from 'vega-embed';
import type {VegaChartProps} from './types';

/**
 * `VegaChart` renders a Vega-Lite specification as an interactive chart.
 *
 * It wraps `vega-embed` in a React component, managing the embed lifecycle
 * (mount, spec update, unmount) automatically.
 *
 * Callbacks (`onReady`, `onError`) are stable across renders via refs — you
 * don't need to memoize them. `options` is a dep-array member: pass a stable
 * reference (or `useMemo`) if you want to avoid re-embedding on every render.
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
 * <VegaChart spec={spec} />
 * ```
 */
export function VegaChart({
  spec,
  options,
  className,
  style,
  onReady,
  onError,
}: VegaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep callbacks in refs so they never stale-close over old values and
  // don't need to be in the effect dependency array (avoids spurious re-embeds).
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  // Track the active vega-embed result so we can finalize() it on cleanup,
  // releasing timers, event listeners, and WebGL resources held by the Vega runtime.
  const resultRef = useRef<Result | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    embed(container, spec, {
      actions: false,
      renderer: 'svg',
      ...options,
    })
      .then(result => {
        if (cancelled) {
          // Effect was cleaned up before the promise resolved — finalize immediately.
          result.finalize();
          return;
        }
        resultRef.current = result;
        onReadyRef.current?.();
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          onErrorRef.current?.(err instanceof Error ? err : new Error(String(err)));
        }
      });

    return () => {
      cancelled = true;
      resultRef.current?.finalize();
      resultRef.current = null;
    };
  // `options` is intentionally in the dep array — a changed options object
  // re-embeds the chart. Callers should memoize options to avoid this.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, options]);

  return <div ref={containerRef} className={className} style={style} />;
}
