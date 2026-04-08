/**
 * @file types.ts
 * @input Vega-Lite spec types and XDS Vega wrapper API surface
 * @output Shared TypeScript types for @xds/vega
 * @position Type definitions; imported by all components in this package
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

import type {Config} from 'vega';

/** A Vega-Lite top-level specification. Re-exported for consumer convenience. */
export type {TopLevelSpec} from 'vega-lite';

/**
 * Props for the `<VegaChart>` component.
 */
export interface VegaChartProps {
  /**
   * A Vega-Lite specification object.
   * @see https://vega.github.io/vega-lite/docs/spec.html
   */
  spec: import('vega-lite').TopLevelSpec;
  /**
   * Optional Vega runtime config passed to `new View(runtime, { config })`.
   * Use this to override renderer defaults, logging, or signal bindings.
   * @see https://vega.github.io/vega/docs/api/view/
   */
  viewConfig?: Config;
  /**
   * Renderer to use. Defaults to `'svg'`.
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
   * Called when the Vega View has been fully initialized and rendered.
   */
  onReady?: (view: import('vega').View) => void;
  /**
   * Called when an error occurs during compilation or rendering.
   */
  onError?: (error: Error) => void;
}
