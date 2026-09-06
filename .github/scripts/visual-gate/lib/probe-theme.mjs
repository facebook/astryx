// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The probe theme: a theme that styles every declared theming target.
 *
 * @input  the generated Core visual-prop contract
 * @output a `defineTheme` config covering every target, variant and state the
 *         system documents as themeable
 *
 * Real themes style what their designer cared about, so most of the themeable
 * surface is never exercised by any of them — on this repo the gate found 49
 * such overrides, and a newly added target starts life in that unverified set
 * by default. Nothing tells you when a target stops working, because nothing
 * was ever styling it.
 *
 * The probe theme closes that by construction: it is GENERATED from the target
 * enumeration, so a target added tomorrow is covered the moment its doc lands —
 * no one has to remember to write a case for it. It is a test fixture, never
 * shipped, and it is deliberately garish: every override is a loud, unmistakable
 * value, because the question it answers is "did this override reach the pixels
 * at all", not "does this look good".
 *
 * Each selector gets a DISTINCT colour, derived from a hash of its name. Two
 * targets that are supposed to be different elements but actually resolve to
 * the same element show up as one colour instead of two — which is exactly the
 * bug ("this sub-target isn't really separate") that a uniform hot-pink theme
 * would hide.
 */

/**
 * A stable, well-separated colour per selector name. Deterministic: the same
 * selector is the same colour in every run, so a baseline stays comparable.
 * @param {string} seed
 * @param {{lightness?: number}} [options]
 * @returns {string}
 */
export function probeColor(seed, options = {}) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(index)) | 0;
  }
  // Golden-angle hue stepping keeps adjacent selectors far apart in hue.
  const hue = Math.abs(hash * 137.508) % 360;
  const saturation = 70 + (Math.abs(hash >> 8) % 25);
  const lightness = options.lightness ?? 45 + (Math.abs(hash >> 16) % 20);
  return `hsl(${hue.toFixed(1)} ${saturation}% ${lightness}%)`;
}

/**
 * Non-colour properties whose ownership must be visible in the probe capture.
 * The colours prove that a target is reachable; these values prove that the
 * target sits on the element that paints the documented property.
 */
const PROPERTY_PROBES = {
  popover: {borderRadius: '32px'},
};

/**
 * Build the probe theme's `components` map from the same generated contract used
 * by theme validation. Open domains remain reported rather than guessed.
 *
 * @param {{targets: Array<{key: string, deprecatedFor?: string[], props: Array<{name: string, role: 'visualProp'|'state', domain?: {kind: string, values?: {strings?: string[], numbers?: number[]}}}>}>}} contract
 * @returns {{components: Record<string, Record<string, Record<string, string>>>, coverage: {targets: number, selectors: number, skipped: Array<{key: string, prop: string, reason: string}>}}}
 */
export function buildProbeComponents(contract) {
  /** @type {Record<string, Record<string, Record<string, string>>>} */
  const components = {};
  /** @type {Array<{key: string, prop: string, reason: string}>} */
  const skipped = [];
  let selectors = 0;

  const targets = [...contract.targets].sort((a, b) => {
    const byDeprecation =
      Number(Boolean(a.deprecatedFor?.length)) -
      Number(Boolean(b.deprecatedFor?.length));
    return byDeprecation || a.key.localeCompare(b.key);
  });
  for (const target of targets) {
    const styles = (components[target.key] ??= {});
    const selectorPaint = target.deprecatedFor?.length
      ? paintCompatibilityAlias
      : paint;
    styles.base = {
      ...selectorPaint(target.key),
      ...(PROPERTY_PROBES[target.key] ?? {}),
    };
    selectors += 1;

    for (const prop of target.props) {
      if (prop.role === 'state') {
        if (!styles[prop.name]) {
          styles[prop.name] = selectorPaint(`${target.key}.${prop.name}`);
          selectors += 1;
        }
        continue;
      }

      const values =
        prop.domain?.kind === 'finite'
          ? [
              ...(prop.domain.values?.strings ?? []),
              ...(prop.domain.values?.numbers ?? []).map(String),
            ]
          : [];
      if (values.length === 0) {
        skipped.push({
          key: target.key,
          prop: prop.name,
          reason: `generated domain is ${prop.domain?.kind ?? 'missing'}`,
        });
        continue;
      }
      for (const value of values) {
        const selector = `${prop.name}:${value}`;
        if (styles[selector]) continue;
        styles[selector] = selectorPaint(`${target.key}.${selector}`);
        selectors += 1;
      }
    }
  }

  return {
    components,
    coverage: {targets: Object.keys(components).length, selectors, skipped},
  };
}

/**
 * Paint deprecated aliases on properties the canonical probe does not use, so
 * both classes remain independently observable when they share one element.
 * @param {string} seed
 * @returns {{textDecorationColor: string, caretColor: string}}
 */
export function paintCompatibilityAlias(seed) {
  return {
    textDecorationColor: probeColor(`${seed}/compatibility-decoration`, {
      lightness: 30,
    }),
    caretColor: probeColor(`${seed}/compatibility-caret`, {lightness: 30}),
  };
}

/**
 * Paint a selector so that each property is independently verifiable.
 *
 * Every property gets its own hue derived from the same seed, rather than one
 * flat colour: a single colour for both `backgroundColor` and `color` renders
 * the text invisible, which hides a text-colour regression behind a working
 * background — and makes the diff report unreadable for the human who has to
 * judge it. Lightness is pinned so the text always contrasts with the fill.
 *
 * Exported so the reach check computes expectations from the SAME function
 * that generates the theme — two copies of this mapping would drift, and the
 * check would then report the drift as a broken override.
 *
 * @param {string} seed
 * @returns {{backgroundColor: string, color: string, borderColor: string, outlineColor: string}}
 */
export function paint(seed) {
  return {
    backgroundColor: probeColor(seed),
    color: probeColor(`${seed}/text`, {lightness: 12}),
    borderColor: probeColor(`${seed}/border`, {lightness: 25}),
    outlineColor: probeColor(`${seed}/outline`, {lightness: 25}),
  };
}

/**
 * The generated theme source. Written to disk rather than built in memory so
 * the coverage it claims is reviewable in a diff — when a target is added, the
 * probe theme's diff is the record that it became covered.
 *
 * @param {ReturnType<typeof buildProbeComponents>} built
 * @returns {string}
 */
export function renderProbeTheme({components, coverage}) {
  return `// Copyright (c) Meta Platforms, Inc. and affiliates.
// @generated by .github/scripts/visual-gate/generate-probe-theme.mjs — do not edit.
//
// A theme that exercises EVERY axis of the theme contract, so the visual gate
// can prove each one still reaches the pixels. Not shipped; not published; a
// test fixture. Regenerate with: pnpm visual:probe-theme
//
// defineTheme takes six things and this covers all six:
//   components  ${coverage.targets} targets, ${coverage.selectors} selectors (generated from Core's checked contract)
//   tokens      custom properties, read back off the themed element
//   icons       every registry entry swapped for a marked glyph
//   indicators  check / radio / checkbox swapped — the swap that reaches furthest
//   fonts       a family name nothing else could produce
//   syntax      one unmistakable colour per code token
//
// Only \`components\` is generated; the rest are fixed values that live in
// probeConfig.ts, because they are a contract to assert against rather than a
// projection of Core's generated visual-prop contract.

import {defineSyntaxTheme, defineTheme} from '@astryxdesign/core/theme';

import {PROBE_FONT, PROBE_SYNTAX, PROBE_TOKENS} from './probeConfig';
import {probeIconRegistry, probeIndicatorRegistry} from './registries';

export const probeTheme = defineTheme({
  name: 'probe',
  tokens: PROBE_TOKENS,
  typography: {
    body: {family: 'AstryxProbeFace', fallbacks: 'monospace'},
    heading: {family: 'AstryxProbeFace', fallbacks: 'monospace'},
    code: {family: 'AstryxProbeFace', fallbacks: 'monospace'},
  },
  syntax: defineSyntaxTheme({name: 'probe', tokens: PROBE_SYNTAX}),
  icons: probeIconRegistry,
  indicators: probeIndicatorRegistry,
  components: ${JSON.stringify(components, null, 2).replace(/\n/g, '\n  ')},
});

// Re-exported so a consumer of the fixture (the gate, a story) can assert
// against the same values the theme was built from, rather than a copy.
export {PROBE_FONT, PROBE_SYNTAX, PROBE_TOKENS};
`;
}
