// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: migrate XDS CSS surfaces to their Astryx equivalents
 *
 * The v0.1.0 release renamed the DOM namespace emitted by @astryxdesign/core
 * from `xds-*` to `astryx-*` and dropped the dual-emit compatibility (core no
 * longer emits the legacy `xds-*` classes or `data-xds-*` attributes). Any
 * consumer CSS that targeted those surfaces is now broken.
 *
 * This transform performs precise, targeted string replacements on CSS/SCSS
 * files for the documented surfaces only:
 *
 *   .xds-*                  (class-name prefix in selectors — matched only
 *                            after a `.` so it is a class selector)
 *   [data-xds-theme         (theme attribute selector)
 *   [data-xds-theme-prose   (prose-theme attribute selector)
 *   [data-xds-media         (media attribute selector)
 *   @layer xds-theme        (cascade layer name — incl. comma-separated
 *   @layer xds-base          `@layer a, b;` statement lists and nested blocks)
 *
 * It deliberately does NOT blindly replace every `xds` substring: a bare
 * `xds` in a comment, a custom-property value, or an unrelated identifier is
 * left untouched. CSS has no meaningful AST for this class of edit, so this is
 * a plain string transform — `api.jscodeshift` is available but unused.
 */

export const meta = {
  title: 'Migrate .xds-* / [data-xds-*] / @layer xds-* CSS surfaces to astryx',
  description:
    'Rewrites the documented XDS CSS surfaces to their Astryx equivalents: ' +
    'the `.xds-*` class-selector prefix, `[data-xds-theme]` / ' +
    '`[data-xds-theme-prose]` / `[data-xds-media]` attribute selectors, and ' +
    '`@layer xds-theme` / `@layer xds-base` cascade-layer names all become ' +
    'their `astryx-*` / `data-astryx-*` forms.',
  pr: '#3092',
  fileExtensions: ['.css', '.scss'],
};

// The XDS cascade-layer names we own. A `@layer` prelude can name several
// layers in a comma-separated list (`@layer a, b;`), so we can't anchor every
// occurrence to the `@layer` keyword. We instead rewrite these exact layer
// tokens within a `@layer ...` prelude (up to the next `{` or `;`).
const XDS_LAYER_NAMES = new Map([
  ['xds-theme', 'astryx-theme'],
  ['xds-base', 'astryx-base'],
]);

function rewriteLayerPrelude(prelude) {
  return prelude.replace(/\bxds-(?:theme|base)\b/g, name =>
    XDS_LAYER_NAMES.get(name) ?? name,
  );
}

// Ordered, non-overlapping replacements. Each pattern is intentionally narrow
// so we never touch a bare `xds` substring outside these surfaces.
const REPLACEMENTS = [
  // Class-name prefix: only when preceded by a `.` (a class selector).
  {re: /\.xds-/g, to: '.astryx-'},
  // Attribute selectors: any `[data-xds-` opener (theme, theme-prose, media).
  {re: /\[data-xds-/g, to: '[data-astryx-'},
  // Cascade-layer preludes: `@layer <names>` up to the block `{` or `;`.
  // Rewrite only the recognized xds-* layer tokens inside the prelude.
  {re: /@layer\b[^{;]*/g, to: match => rewriteLayerPrelude(match)},
];

export default function transformer(file /*, api */) {
  const source = file.source;
  if (typeof source !== 'string') return undefined;

  let next = source;
  for (const {re, to} of REPLACEMENTS) {
    next = next.replace(re, to);
  }

  return next === source ? undefined : next;
}
