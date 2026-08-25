// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The baseline store, and the one operation that changes it.
 *
 * @input  a baseline directory (manifest + shots) and a capture
 * @output an updated baseline, with every promotion recorded
 *
 * "The after is correct" is a decision, not a retry. Promoting a shot writes
 * a line into the manifest's decision log saying which shots moved, who moved
 * them, against which run, and why — so a baseline can always be read back to
 * the change that justified it. Nothing else in the gate writes to the
 * baseline: a capture never quietly becomes the new truth.
 *
 * Baselines are per-platform. A shot captured on macOS and a shot captured on
 * an Ubuntu runner differ in font rasterisation everywhere at once, which
 * reads as "everything changed" and teaches everyone to accept blindly. The
 * gate refuses the comparison instead.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export const EMPTY_MANIFEST = {version: 1, shots: {}, decisions: []};

/** The only verdict statuses whose capture may become baseline material. */
export const PROMOTABLE_VERDICT_STATUSES = ['pass', 'changed'];

/**
 * The promotion boundary. A failed or skipped gate still uploads its capture
 * (if: always()), and GitHub reports a terminal failure's run as
 * status=completed — so the verdict, not the run state, decides whether a
 * capture may be promoted. Only a verdict the gate stood behind (pass or
 * changed) passes; failed, skipped, missing (null), unreadable (not an
 * object), and any unknown status are refused.
 *
 * @param {unknown} verdict - parsed verdict.json, or null when it is missing
 * @throws {Error} when the capture must not be promoted
 */
export function assertPromotableVerdict(verdict) {
  if (verdict == null) {
    throw new Error(
      'Refusing to promote a capture with no verdict.json — promote from a check or release run whose verdict is pass or changed.',
    );
  }
  const status =
    typeof verdict === 'object' && typeof verdict.status === 'string' ? verdict.status : null;
  if (status == null || !PROMOTABLE_VERDICT_STATUSES.includes(status)) {
    const shown = status == null ? 'unreadable' : JSON.stringify(status);
    throw new Error(
      `Refusing to promote from a gate run whose verdict status is ${shown} — only pass or changed captures may become the baseline.`,
    );
  }
}

/**
 * @param {string} baselineDir
 * @returns {{manifest: object, exists: boolean}}
 */
export function readBaseline(baselineDir) {
  const manifestPath = path.join(baselineDir, 'manifest.json');
  // A deep copy: a shallow spread shared EMPTY_MANIFEST's shots and decisions
  // objects between every fresh baseline in the same process.
  if (!fs.existsSync(manifestPath)) return {manifest: structuredClone(EMPTY_MANIFEST), exists: false};
  return {manifest: JSON.parse(fs.readFileSync(manifestPath, 'utf8')), exists: true};
}

/**
 * @param {string} baselineDir
 * @param {object} manifest
 */
export function writeBaseline(baselineDir, manifest) {
  fs.mkdirSync(path.join(baselineDir, 'shots'), {recursive: true});
  fs.writeFileSync(
    path.join(baselineDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

/**
 * Refuse a comparison the numbers cannot support.
 * @param {object} baselineManifest
 * @param {object} currentManifest
 * @returns {string | null} the reason the comparison is invalid, or null
 */
export function incomparable(baselineManifest, currentManifest) {
  if (!baselineManifest.platform) return null;
  if (baselineManifest.platform !== currentManifest.platform) {
    return `baseline was captured on ${baselineManifest.platform}, this run on ${currentManifest.platform} — rendering differs by platform, so the diff would be noise. Recapture the baseline on ${currentManifest.platform}.`;
  }
  if (
    baselineManifest.browser &&
    currentManifest.browser &&
    baselineManifest.browser !== currentManifest.browser
  ) {
    // A browser bump moves antialiasing and font metrics everywhere at once.
    // Saying so is far more useful than a report claiming 400 regressions.
    return `baseline was captured with ${baselineManifest.browser}, this run with ${currentManifest.browser} — refresh the baseline (gate.mjs accept --keys all --reason "browser bump").`;
  }
  const a = baselineManifest.viewport;
  const b = currentManifest.viewport;
  if (a && b && (a.width !== b.width || a.height !== b.height)) {
    return `baseline viewport ${a.width}x${a.height} does not match this run's ${b.width}x${b.height}.`;
  }
  return null;
}

/**
 * Promote captured shots into the baseline. Nothing is written unless the
 * capture's verdict is one the gate stood behind (see assertPromotableVerdict).
 *
 * @param {object} options
 * @param {string} options.baselineDir
 * @param {string} options.captureDir - directory holding the capture's shots/
 * @param {object} options.currentManifest
 * @param {unknown} options.verdict - the capture's parsed verdict.json (null when missing)
 * @param {string[]} options.keys - shot keys to promote
 * @param {string} options.reason - why the new rendering is the correct one
 * @param {string} options.actor
 * @param {string | null} [options.runId]
 * @param {string[]} [options.prune] - shot keys to drop (stories that no longer exist)
 * @returns {{promoted: string[], pruned: string[], manifest: object}}
 */
export function accept({
  baselineDir,
  captureDir,
  currentManifest,
  verdict,
  keys,
  reason,
  actor,
  runId = null,
  prune = [],
}) {
  assertPromotableVerdict(verdict);
  if (!reason?.trim()) throw new Error('accept requires a reason — it is the record of the decision');
  // Shot keys name files inside shots/. A real key is shotKey() output
  // ([a-zA-Z0-9._-] only, see plan.mjs), never a path — reject anything else
  // before it is joined into one, whichever manifest or flag it came from.
  const SHOT_KEY = /^(?!\.+$)[a-zA-Z0-9._-]+$/;
  const badKey = [...keys, ...prune].find(key => !SHOT_KEY.test(String(key)));
  if (badKey != null) {
    throw new Error(`Invalid shot key: ${JSON.stringify(badKey)}`);
  }
  const {manifest} = readBaseline(baselineDir);
  const shotsDir = path.join(baselineDir, 'shots');
  fs.mkdirSync(shotsDir, {recursive: true});

  const promoted = [];
  for (const key of keys) {
    const source = path.join(captureDir, 'shots', `${key}.png`);
    if (!fs.existsSync(source)) continue;
    fs.copyFileSync(source, path.join(shotsDir, `${key}.png`));
    manifest.shots[key] = currentManifest.shots[key];
    promoted.push(key);
  }

  const pruned = [];
  for (const key of prune) {
    const target = path.join(shotsDir, `${key}.png`);
    if (fs.existsSync(target)) fs.rmSync(target);
    if (manifest.shots[key]) {
      delete manifest.shots[key];
      pruned.push(key);
    }
  }

  manifest.version = 1;
  manifest.platform = currentManifest.platform;
  manifest.browser = currentManifest.browser;
  manifest.viewport = currentManifest.viewport;
  manifest.capturedAt = currentManifest.capturedAt;
  manifest.context = currentManifest.context ?? null;
  manifest.decisions = [
    ...(manifest.decisions ?? []),
    {
      at: new Date().toISOString(),
      actor,
      runId,
      reason: reason.trim(),
      promoted,
      pruned,
    },
    // A decision log that grows without bound is a decision log nobody reads.
  ].slice(-200);

  writeBaseline(baselineDir, manifest);
  return {promoted, pruned, manifest};
}
