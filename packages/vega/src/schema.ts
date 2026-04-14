/**
 * @file schema.ts
 * @input A spec object (Vega or Vega-Lite)
 * @output The resolved schema kind: 'vega', 'vega-lite', or an error
 * @position Utility; consumed by XDSVegaChart to decide whether to compile
 *
 * SYNC: When modified, update /packages/vega/README.md
 */

/** Known libraries in the Vega schema URL namespace. */
export type SchemaLibrary = 'vega' | 'vega-lite';

/** Result of parsing a $schema URL. */
export type SchemaResult =
  | {ok: true; library: SchemaLibrary; version: string}
  | {ok: false; error: string};

/**
 * Pattern matching the official Vega schema URL format:
 *   https://vega.github.io/schema/{library}/{version}.json
 * Also tolerates proxy-prefixed URLs (anything before "schema/").
 *
 * @see https://github.com/vega/schema
 */
const SCHEMA_RE = /schema\/([\w-]+)\/([\w.-]+)\.json$/;

/**
 * Parse a Vega or Vega-Lite `$schema` URL.
 *
 * Returns `{ ok: true, library, version }` on success, or
 * `{ ok: false, error }` if the URL is missing, not a string,
 * doesn't match the expected format, or names an unknown library.
 */
export function parseSchema(schema: unknown): SchemaResult {
  if (schema === undefined || schema === null) {
    return {ok: false, error: 'Spec is missing a $schema field. Add "$schema": "https://vega.github.io/schema/vega/v5.json" or the vega-lite equivalent.'};
  }

  if (typeof schema !== 'string') {
    return {ok: false, error: `$schema must be a string, got ${typeof schema}.`};
  }

  const match = SCHEMA_RE.exec(schema);
  if (!match) {
    return {
      ok: false,
      error: `Unrecognized $schema URL: "${schema}". Expected format: https://vega.github.io/schema/{vega|vega-lite}/{version}.json`,
    };
  }

  const [, library, version] = match;

  if (library !== 'vega' && library !== 'vega-lite') {
    return {
      ok: false,
      error: `Unknown schema library "${library}". Must be "vega" or "vega-lite".`,
    };
  }

  return {ok: true, library, version};
}
