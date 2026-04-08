/**
 * @file types.ts
 * @input Vega and Vega-Lite spec types, and the XDS Vega wrapper API surface
 * @output Shared TypeScript types for @xds/vega
 * @position Type definitions; imported by all components in this package
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

import type {Spec as VegaSpec, Config, View, ViewOptions} from 'vega';
import type {TopLevelSpec as VegaLiteSpec} from 'vega-lite';

export type {VegaSpec, VegaLiteSpec, Config, View, ViewOptions};

/**
 * A spec accepted by `<VegaChart>`. Must include a `$schema` field --
 * the component uses it to decide whether to compile (Vega-Lite) or
 * render directly (Vega).
 */
export type AnySpec = (VegaSpec | VegaLiteSpec) & {$schema: string};

/**
 * Options forwarded to `vega.parse(spec, config, parseOptions)`.
 * @see https://vega.github.io/vega/docs/api/view/#view_parse
 */
export interface ParseOptions {
  /**
   * When `true`, the parser retains the abstract syntax tree (AST) of
   * Vega expressions in the runtime. Useful for introspection and tooling.
   * Defaults to `false`.
   */
  ast?: boolean;
}

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
   * - `vega-lite` -> compiled to Vega via `vega-lite`'s `compile()`, then rendered
   * - `vega` -> rendered directly without compilation
   *
   * @see https://vega.github.io/vega/docs/specification/
   * @see https://vega.github.io/vega-lite/docs/spec.html
   */
  spec: AnySpec;
  /**
   * Vega config object passed as the second argument to `vega.parse()`.
   * Overrides config values embedded in the spec.
   * @see https://vega.github.io/vega/docs/config/
   */
  parseConfig?: Config;
  /**
   * Options passed as the third argument to `vega.parse()`.
   * Currently only supports `{ ast: boolean }`.
   * @see https://vega.github.io/vega/docs/api/view/#view_parse
   */
  parseOptions?: ParseOptions;
  /**
   * Options passed directly to `new vega.View(runtime, viewOptions)`.
   * Controls renderer backend, logger, tooltip handler, locale, loader,
   * background color, hover behavior, and more.
   *
   * Note: `container` is always set by the component and will be overridden.
   *
   * @see https://vega.github.io/vega/docs/api/view/
   */
  viewOptions?: Omit<ViewOptions, 'container'>;
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
