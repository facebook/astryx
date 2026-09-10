// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Does each theming target's override actually reach the pixels?
 *
 * @input  a built Storybook, the probe theme
 * @output per target: the override arrived, or it did not and what won instead
 *
 * This is the assertion the screenshot tier cannot make. A visual baseline
 * proves a component looks the same as last week — including when the reason
 * it looks the same is that a theme override stopped applying and the shot was
 * captured broken and promoted as correct. Nothing in a pixel diff can tell
 * those apart.
 *
 * The probe theme gives every selector a unique deterministic colour, so
 * "did this override reach this element" is an equality test rather than a
 * diff: compute the colour the selector should have produced, read the
 * element's computed style, compare. No baseline, no images, no flake, and it
 * names the failing target instead of a rectangle of moved pixels.
 *
 * An element is checked against EVERY selector that legitimately addresses it
 * — `base`, each reflected prop, each reflected state — because a
 * `variant:info` override beating `base` is the cascade working, not a miss.
 */

import {paint} from './probe-theme.mjs';

/**
 * `hsl(H S% L%)` → the `rgb(r, g, b)` string getComputedStyle returns.
 * @param {string} hsl
 * @returns {string}
 */
export function hslToRgb(hsl) {
  const [h, s, l] = hsl.match(/[\d.]+/g).map(Number);
  const saturation = s / 100;
  const lightness = l / 100;
  const k = n => (n + h / 30) % 12;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const f = n => lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to255 = n => Math.round(f(n) * 255);
  return `rgb(${to255(0)}, ${to255(8)}, ${to255(4)})`;
}

/**
 * Every colour a correctly-applied probe theme could legitimately produce on
 * this element.
 * @param {string} key - target key (class minus the `astryx-` prefix)
 * @param {string[]} data - reflected `data-*` as `name` or `name:value`
 * @returns {string[]}
 */
export function expectedColors(key, data) {
  const seeds = [key, ...data.map(entry => `${key}.${entry}`)];
  // Every property the generator paints, for every selector that addresses
  // this element — an element with no background can still prove the override
  // arrived through its text or border colour.
  return seeds.flatMap(seed => Object.values(paint(seed))).map(hslToRgb);
}

/**
 * Read every themed element on the page, with the data a theme can address it
 * by. Runs in the browser.
 * @returns {string}
 */
export const READ_TARGETS = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('[class*="astryx-"]')) {
    const data = [];
    for (const a of el.attributes) {
      if (!a.name.startsWith('data-')) continue;
      const n = a.name.slice(5);
      data.push(a.value === '' || a.value === 'true' ? n : n + ':' + a.value);
    }
    const cs = getComputedStyle(el);
    // Several targets can sit on ONE element (a date input's toggle icon is
    // also an icon). Whichever rule wins, only one colour can be there, so a
    // reading carries every co-located target and the caller decides.
    const keys = [...el.classList].filter(c => c.startsWith('astryx-')).map(c => c.slice(7));
    if (keys.length === 0) continue;
    out.push({keys, data, bg: cs.backgroundColor, color: cs.color, border: cs.borderTopColor});
  }
  return out;
})()`;

/**
 * Fold a page's readings into the running verdict.
 *
 * A target is verified as soon as ONE element proves the override arrived;
 * later elements of the same target that legitimately show something else
 * (a state the probe does not colour, an inherited surface) must not
 * un-verify it.
 *
 * @param {{verified: Set<string>, failures: Map<string, object>}} acc
 * @param {Array<{key: string, data: string[], bg: string}>} readings
 * @param {string} storyId
 */
export function fold(acc, readings, storyId) {
  for (const {keys, data, bg, color, border} of readings) {
    // The probe paints background, text and border from independent hashes, so
    // an element that cannot show a background (an inline glyph, a
    // display:contents wrapper) can still prove the override arrived.
    const painted = [bg, color, border];

    for (const key of keys) {
      if (acc.verified.has(key)) continue;
      const mine = expectedColors(key, data);
      if (painted.some(value => mine.includes(value))) {
        acc.verified.add(key);
        acc.failures.delete(key);
        acc.shadowed.delete(key);
        continue;
      }
      // Another target on this same element won. That is a fact about the
      // markup, not a broken override — the two targets are the same element,
      // so only one colour can be there. Reported separately, because
      // "these two targets are one element" is worth knowing and is NOT the
      // same finding as "this override reaches nothing".
      const sibling = keys.some(
        other => other !== key && painted.some(v => expectedColors(other, data).includes(v)),
      );
      if (sibling) {
        if (!acc.failures.has(key) && !acc.shadowed.has(key)) {
          acc.shadowed.set(key, {storyId, sharesElementWith: keys.filter(k => k !== key)});
        }
        continue;
      }
      if (!acc.failures.has(key)) {
        // First failing story wins: the report needs one stable place to
        // point, and re-pointing it at whichever story was walked last makes
        // the same failure read differently between runs.
        acc.failures.set(key, {storyId, got: bg, expected: mine[0], data});
      }
    }
  }
  return acc;
}

/** @returns {{verified: Set<string>, failures: Map<string, object>, shadowed: Map<string, object>}} */
export function emptyAccumulator() {
  return {verified: new Set(), failures: new Map(), shadowed: new Map()};
}
