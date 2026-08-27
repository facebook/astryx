// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Compare a capture against a baseline, and read the theming evidence.
 *
 * @input  two capture directories and their manifests
 * @output a verdict — the machine-readable answer the release cron acts on —
 *         plus a diff PNG per changed shot
 *
 * The verdict is deliberately three-valued. `pass` and `failed` are the
 * obvious ones; `changed` is NOT a failure, because a visual change is only a
 * regression if nobody meant it. Every changed shot therefore carries its
 * before, its after, and its diff, and the answer "the after is correct" is a
 * first-class outcome that gets recorded (see baseline.mjs `accept`) rather
 * than a red run someone re-runs until it goes away.
 *
 * A new shot has no before, so it cannot regress: it is reported as `added`
 * and adopted the first time it is seen. A shot whose story disappeared is
 * `removed` and pruned. Neither blocks.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * @typedef {object} Change
 * @property {string} key
 * @property {number} diffPixels
 * @property {number} diffRatio
 * @property {boolean} sizeChanged
 */

/**
 * Widen an image to the given canvas, transparent-padded from the top left, so
 * two shots of different heights can still be diffed pixel for pixel.
 * @param {{width: number, height: number, data: Buffer}} png
 * @param {number} width
 * @param {number} height
 * @param {typeof import('pngjs').PNG} PNG
 */
function pad(png, width, height, PNG) {
  if (png.width === width && png.height === height) return png;
  const padded = new PNG({width, height});
  padded.data.fill(0);
  PNG.bitblt(png, padded, 0, 0, Math.min(png.width, width), Math.min(png.height, height), 0, 0);
  return padded;
}

/**
 * @param {object} options
 * @param {string} options.baselineDir - directory of baseline PNGs
 * @param {string} options.currentDir - directory of freshly captured PNGs
 * @param {object} options.baselineManifest
 * @param {object} options.currentManifest
 * @param {string} options.diffDir - where diff PNGs are written
 * @param {number} options.threshold - pixelmatch per-pixel colour threshold
 * @param {number} options.maxDiffPixels - pixels allowed to differ before a shot counts as changed
 * @param {boolean} [options.scoped] - the plan covers only part of the baseline
 * @returns {Promise<{changes: Change[], added: string[], removed: string[], unchanged: string[]}>}
 */
export async function compareCaptures({
  baselineDir,
  currentDir,
  baselineManifest,
  currentManifest,
  diffDir,
  threshold,
  maxDiffPixels,
  scoped = false,
}) {
  const {PNG} = await import('pngjs');
  const pixelmatch = (await import('pixelmatch')).default;

  const baselineKeys = new Set(Object.keys(baselineManifest.shots ?? {}));
  const currentKeys = Object.keys(currentManifest.shots ?? {});

  /** @type {Change[]} */
  const changes = [];
  /** @type {string[]} */
  const added = [];
  /** @type {string[]} */
  const unchanged = [];

  fs.mkdirSync(diffDir, {recursive: true});

  for (const key of currentKeys) {
    if (!baselineKeys.has(key)) {
      added.push(key);
      continue;
    }
    const current = currentManifest.shots[key];
    const baseline = baselineManifest.shots[key];
    // The bytes are the cheapest possible comparison and the common case.
    if (current.sha256 === baseline.sha256) {
      unchanged.push(key);
      continue;
    }

    const baselinePng = PNG.sync.read(fs.readFileSync(path.join(baselineDir, `${key}.png`)));
    const currentPng = PNG.sync.read(fs.readFileSync(path.join(currentDir, `${key}.png`)));
    const width = Math.max(baselinePng.width, currentPng.width);
    const height = Math.max(baselinePng.height, currentPng.height);
    const sizeChanged = baselinePng.width !== currentPng.width || baselinePng.height !== currentPng.height;

    const a = pad(baselinePng, width, height, PNG);
    const b = pad(currentPng, width, height, PNG);
    const diff = new PNG({width, height});
    const diffPixels = pixelmatch(a.data, b.data, diff.data, width, height, {
      threshold,
      includeAA: false,
      alpha: 0.2,
      diffMask: false,
    });

    if (diffPixels <= maxDiffPixels && !sizeChanged) {
      unchanged.push(key);
      continue;
    }
    fs.writeFileSync(path.join(diffDir, `${key}.png`), PNG.sync.write(diff));
    changes.push({
      key,
      diffPixels,
      diffRatio: Number((diffPixels / (width * height)).toFixed(6)),
      sizeChanged,
    });
  }

  // A scoped run (a PR shooting only the components it touched) deliberately
  // captures a fraction of the baseline, so "in the baseline, not in this run"
  // means out of scope — not removed. Reporting it as removal would put a
  // five-hundred-shot deletion on every PR.
  const removed = scoped
    ? []
    : [...baselineKeys].filter(key => !currentManifest.shots[key]);
  changes.sort((a, b) => b.diffPixels - a.diffPixels);
  return {changes, added, removed, unchanged};
}

/**
 * What the DOM said about theming, against what the themes and the components
 * claim. These are the findings a pixel diff cannot give you: an override that
 * binds to nothing is invisible in a screenshot precisely because it does
 * nothing.
 *
 * @param {object} options
 * @param {Record<string, string[]>} options.observedTargets - key → props/states seen in the DOM
 * @param {Array<{key: string, component: string, props: string[], states: string[]}>} options.targets
 * @param {Record<string, Record<string, string[]>>} options.themeOverrides - theme → key → override selectors
 * @returns {{unexercisedOverrides: Array<{theme: string, key: string, selector?: string}>, undeclaredTargets: string[], uncoveredTargets: string[]}}
 */
export function analyzeTargeting({observedTargets, targets, themeOverrides}) {
  const declared = new Set(targets.map(target => target.key));
  const seen = new Set(Object.keys(observedTargets));

  /** @type {Array<{theme: string, key: string, selector?: string}>} */
  const unexercisedOverrides = [];
  for (const [theme, keys] of Object.entries(themeOverrides)) {
    for (const [key, selectors] of Object.entries(keys)) {
      if (!seen.has(key)) {
        unexercisedOverrides.push({theme, key});
        continue;
      }
      const observedData = new Set(observedTargets[key] ?? []);
      for (const selector of selectors) {
        // `base` and pseudo-class selectors are not reflected as data; only
        // variant and state keys can be checked against the DOM.
        if (selector === 'base' || selector.startsWith(':')) continue;
        if (!observedData.has(selector)) unexercisedOverrides.push({theme, key, selector});
      }
    }
  }

  return {
    unexercisedOverrides,
    undeclaredTargets: [...seen].filter(key => !declared.has(key)).sort(),
    uncoveredTargets: [...declared].filter(key => !seen.has(key)).sort(),
  };
}

/**
 * The verdict document. The release cron reads `status` and, when it is
 * `changed`, walks `changes` with the report open.
 *
 * @param {object} input
 * @returns {object}
 */
export function buildVerdict({
  comparison,
  currentManifest,
  baselineManifest,
  targeting,
  failures,
  context,
}) {
  const changes = comparison.changes.map(change => ({
    ...change,
    ...pick(currentManifest.shots[change.key], [
      'storyId',
      'title',
      'name',
      'component',
      'theme',
      'mode',
      'reasons',
    ]),
  }));

  // Added and removed stable shots are decisions too. A new story has no
  // before image, but allowing it to pass silently creates baseline debt that
  // the next run cannot resolve; a removed story can delete the only coverage
  // for a target. Both need the same explicit acceptance as changed pixels.
  const status =
    failures.length > 0
      ? 'failed'
      : changes.length > 0 || comparison.added.length > 0 || comparison.removed.length > 0
        ? 'changed'
        : 'pass';

  return {
    version: 1,
    status,
    generatedAt: new Date().toISOString(),
    context,
    platform: currentManifest.platform,
    baseline: {
      capturedAt: baselineManifest.capturedAt ?? null,
      sha: baselineManifest.context?.sha ?? null,
      platform: baselineManifest.platform ?? null,
    },
    counts: {
      total: Object.keys(currentManifest.shots).length,
      unchanged: comparison.unchanged.length,
      changed: changes.length,
      added: comparison.added.length,
      removed: comparison.removed.length,
      failed: failures.length,
    },
    changes,
    added: comparison.added,
    removed: comparison.removed,
    failures,
    targeting,
  };
}

/**
 * @param {Record<string, unknown>} source
 * @param {string[]} keys
 */
function pick(source, keys) {
  return Object.fromEntries(keys.map(key => [key, source?.[key]]));
}
