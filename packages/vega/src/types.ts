/**
 * @file types.ts
 * @input Vega-Lite spec types and XDS Vega wrapper API surface
 * @output Shared TypeScript types for @xds/vega
 * @position Type definitions; imported by all components in this package
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

import type {TopLevelSpec} from 'vega-lite';
import type {EmbedOptions} from 'vega-embed';

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
  spec: TopLevelSpec;
  /**
   * Optional vega-embed options (renderer, actions menu, tooltip, etc.).
   * @see https://github.com/vega/vega-embed#options
   */
  options?: EmbedOptions;
  /**
   * Additional CSS class name applied to the container element.
   */
  className?: string;
  /**
   * Inline styles applied to the container element.
   */
  style?: React.CSSProperties;
  /**
   * Called when the Vega view has been fully initialized.
   */
  onReady?: () => void;
  /**
   * Called when an error occurs during rendering.
   */
  onError?: (error: Error) => void;
}
