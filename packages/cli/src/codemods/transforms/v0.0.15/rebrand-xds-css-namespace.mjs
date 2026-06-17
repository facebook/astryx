// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: rebrand xds-* CSS classes and data-xds-* attributes to astryx-*
 *
 * Part of the XDS-prefix migration (P2380608025). Rewrites consumer override
 * CSS (and inline className/selector strings) from the legacy `xds` DOM
 * namespace to the rebranded `astryx` namespace:
 *
 *   .xds-button          -> .astryx-button
 *   [data-xds-theme=...]  -> [data-astryx-theme=...]
 *   data-xds-media        -> data-astryx-media   (attribute usage in JSX/JS)
 *
 * During the compat window the library dual-emits BOTH class names and BOTH
 * theme/media data attributes, so a consumer can flip their selectors to the
 * `astryx` form at any time and they keep matching.
 *
 * Deliberately DOES NOT touch (per the P0 decision):
 * - CSS cascade-layer names `@layer xds-base` / `@layer xds-theme` -- a layer
 *   cannot be aliased/dual-emitted, so layer names stay `xds-*` through the
 *   entire compat window and are only rebranded at the final cutover. Rewriting
 *   them here would desync a consumer from the library's emitted layer.
 * - `--xds-*` custom properties -- those use an inverted read fallback and need
 *   per-case human review (stale vs intentional), handled separately.
 * - the bare token `xds` anywhere it is not immediately followed by `-<word>`
 *   in a class/attribute position.
 */

export const meta = {
  title: 'Rebrand xds-* CSS classes and data-xds-* attributes to astryx-*',
  description:
    'Rewrites consumer CSS/markup from the legacy `xds` DOM namespace to ' +
    '`astryx`: `.xds-button` -> `.astryx-button`, `data-xds-theme` -> ' +
    '`data-astryx-theme`. Leaves CSS @layer names (xds-base/xds-theme) and ' +
    '--xds-* custom properties untouched.',
  pr: '#2883',
  fileExtensions: [
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
  ],
};

/**
 * Rewrite `data-xds-<name>` attribute references to `data-astryx-<name>`.
 * Matches the attribute in CSS selectors (`[data-xds-theme="x"]`), JSX
 * (`data-xds-media="dark"`), and string args (`getAttribute('data-xds-theme')`).
 */
const DATA_ATTR_RE = /\bdata-xds-([a-z][a-z0-9-]*)/g;

/**
 * Rewrite `.xds-<name>` CLASS SELECTORS to `.astryx-<name>`. The leading dot
 * ensures we only match class selectors, not `@layer xds-base`, the bare word
 * `xds`, or `--xds-*` custom properties.
 */
const CLASS_SELECTOR_RE = /\.xds-([a-z][a-z0-9-]*)/g;

/**
 * Rewrite `xds-<name>` class tokens inside className/class string literals.
 * Conservative: only fires for tokens with a word boundary on both sides that
 * are NOT preceded by `-` (so `--xds-foo` custom props and `data-xds-foo` are
 * not matched here -- those are handled by the dedicated patterns or skipped).
 * Layer names `xds-base`/`xds-theme` are explicitly preserved.
 */
const LAYER_NAMES = new Set(['xds-base', 'xds-theme']);
// Leading group captures the boundary char (start-of-string, whitespace, or a
// string quote) so we don't match `--xds-foo` (preceded by `-`) or substrings.
const CLASS_TOKEN_RE = new RegExp('(^|[\\s"\'`])xds-([a-z][a-z0-9-]*)', 'g');

export function rebrandXdsNamespace(source) {
  let out = source;

  // 1. data-xds-* attributes (CSS, JSX, string args)
  out = out.replace(DATA_ATTR_RE, (_full, name) => `data-astryx-${name}`);

  // 2. .xds-* class selectors
  out = out.replace(CLASS_SELECTOR_RE, (_full, name) => `.astryx-${name}`);

  // 3. bare xds-* class tokens in className strings (e.g. "xds-button primary")
  out = out.replace(CLASS_TOKEN_RE, (full, lead, name) => {
    const token = `xds-${name}`;
    // Preserve cascade-layer names -- they stay xds-* through compat.
    if (LAYER_NAMES.has(token)) return full;
    return `${lead}astryx-${name}`;
  });

  return out;
}

export default function transformer(file) {
  const result = rebrandXdsNamespace(file.source);
  return result === file.source ? undefined : result;
}
