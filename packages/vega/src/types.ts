/**
 * @file types.ts
 * @input Vega and Vega-Lite spec types, and the XDS Vega wrapper API surface
 * @output Shared TypeScript types for @xds/vega
 * @position Type definitions; imported by all components in this package
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

import type {Spec as VegaSpec, Config, View} from 'vega';
import type {TopLevelSpec as VegaLiteSpec} from 'vega-lite';

export type {VegaSpec, VegaLiteSpec, Config, View};

/**
 * A spec accepted by `<VegaChart>`. Must include a `$schema` field —
 * the component uses it to decide whether to compile (Vega-Lite) or
 * render directly (Vega).
 */
export type AnySpec = (VegaSpec | VegaLiteSpec) & {$schema: string};

/**
 * Props for the `<VegaChart>` component.
 */
export interface VegaChartProps {
  /**
   * A Vega or Vega-Lite specification object.
   *
   * Must include a `$schema` field matching the official Vega schema URL
   * format: `https://vega.github.io/schema/{vega|vega-lite}/{version}.json`
   *
   * The component inspects `$schema` to determine how to handle the spec:
   * - `vega-lite` → compiled to Vega via `vega-lite`'s `compile()`, then rendered
   * - `vega` → rendered directly without compilation
   *
   * @see https://vega.github.io/vega/docs/specification/
   * @see https://vega.github.io/vega-lite/docs/spec.html
   */
  spec: AnySpec;
  /**
   * Optional Vega runtime config passed when constructing the `View`.
   * @see https://vega.github.io/vega/docs/config/
   */
  viewConfig?: Config;
  /**
   * Renderer backend. Defaults to `'svg'`.
   */
  renderer?: 'svg' | 'canvas';
  /**
   * Additional CSS class name applied to the container element.
   */
  className?: string;
  /**
   * Inline styles applied to the container element.
   */
  style?: React.CSSProperties;
  /**
   * Called with the live Vega `View` once the chart has rendered.
   * Use this to attach signal listeners, stream data, or drive animations.
   */
  onReady?: (view: View) => void;
  /**
   * Called when the `$schema` is invalid, compilation fails, or the
   * Vega runtime throws during rendering.
   */
  onError?: (error: Error) => void;
}
