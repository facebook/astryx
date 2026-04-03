/**
 * @file VegaChart.tsx
 * @input A Vega-Lite spec + optional embed options
 * @output A React component that renders a Vega-Lite chart via vega-embed
 * @position Primary component in @xds/vega; wraps vega-embed in a React lifecycle
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

import React, {useEffect, useRef} from 'react';
import embed from 'vega-embed';
import type {VegaChartProps} from './types';

/**
 * `VegaChart` renders a Vega-Lite specification as an interactive chart.
 *
 * It wraps `vega-embed` in a React component, managing the embed lifecycle
 * (mount, spec update, unmount) automatically.
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
        if (!cancelled) {
          onReady?.();
          return result;
        }
        result.finalize();
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      });

    return () => {
      cancelled = true;
      // vega-embed cleans up its own DOM when re-embedding, but we clear
      // the container on unmount to avoid stale SVG nodes.
      container.innerHTML = '';
    };
  }, [spec, options, onReady, onError]);

  return <div ref={containerRef} className={className} style={style} />;
}
