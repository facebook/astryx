/**
 * @file index.ts
 * @input All public exports for @xds/vega
 * @output Public API surface for the XDS Vega wrapper package
 * @position Barrel export; entry point for consumers of @xds/vega
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

export {VegaChart} from './VegaChart';
export {parseSchema} from './schema';
export type {VegaChartProps, AnySpec, VegaSpec, VegaLiteSpec, CompileOptions, ParseOptions, Config, ViewOptions} from './types';
export type {SchemaLibrary, SchemaResult} from './schema';
