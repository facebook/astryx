#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Derive publishable PR visual evidence from a trusted recapture.
 *
 * The Storybook bundle is PR-produced, but the plan, browser capture, scope,
 * comparison, verdict, PNG validation, and report all run from default-branch
 * code. PR-authored verdicts and job conclusions are never authority for the
 * `visual-acceptance` status.
 */

import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {incomparable} from './lib/baseline.mjs';
import {canonicalizePng} from './lib/canonical-png.mjs';
import {buildVerdict, compareCaptures} from './lib/compare.mjs';
import {shotKey} from './lib/plan.mjs';
import {renderReport} from './lib/report.mjs';

const args = process.argv.slice(2);
const flag = name => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};

const input = path.resolve(flag('input') ?? 'visual');
const output = path.resolve(flag('output') ?? 'trusted-visual');
const baseline = path.resolve(flag('baseline') ?? '.visual-baseline');
const scope = JSON.parse(fs.readFileSync(path.resolve(flag('scope')), 'utf8'));
const pr = Number(flag('pr'));
const headSha = flag('head-sha') ?? '';
const runId = flag('run-id') ?? '';
const runAttempt = flag('run-attempt') ?? '';
const config = JSON.parse(
  fs.readFileSync(
    new URL('./visual-gate.config.json', import.meta.url),
    'utf8',
  ),
);

const KEY = /^[A-Za-z0-9._-]{1,240}$/;
const NAME = /^[A-Za-z0-9._-]{1,120}$/;
const SHA = /^[0-9a-f]{40}$/;
const MAX_PNG_BYTES = 12 * 1024 * 1024;
const MAX_EDGE = 5000;
const MAX_SHOTS = 5000;

function fail(message) {
  throw new Error(`visual evidence rejected: ${message}`);
}

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`cannot read ${file}: ${error.message}`);
  }
}

function shaFile(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function copyPng(source, target, label) {
  if (!fs.existsSync(source)) fail(`${label} is missing`);
  const stat = fs.lstatSync(source);
  if (!stat.isFile() || stat.isSymbolicLink())
    fail(`${label} is not a regular file`);
  if (stat.size <= 0 || stat.size > MAX_PNG_BYTES)
    fail(`${label} has invalid size`);
  let image;
  try {
    image = canonicalizePng(fs.readFileSync(source));
  } catch (error) {
    fail(`${label} is not a valid PNG: ${error.message}`);
  }
  if (
    image.width <= 0 ||
    image.height <= 0 ||
    image.width > MAX_EDGE ||
    image.height > MAX_EDGE
  ) {
    fail(`${label} has invalid dimensions ${image.width}x${image.height}`);
  }
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, image.bytes);
  return image;
}

if (!Number.isSafeInteger(pr) || pr <= 0) fail('invalid PR number');
if (!SHA.test(headSha)) fail('invalid trusted head SHA');
if (!/^\d+$/.test(runId) || !/^\d+$/.test(runAttempt))
  fail('invalid run identity');
if (
  scope?.hasStableVisual !== true ||
  typeof scope.broadStableVisual !== 'boolean' ||
  !Array.isArray(scope.stableComponents) ||
  !Array.isArray(scope.stableThemes) ||
  !scope.stableComponents.every(name => NAME.test(name)) ||
  !scope.stableThemes.every(name => NAME.test(name))
) {
  fail('trusted stable visual scope is invalid');
}

const manifestPath = path.join(input, 'manifest.json');
if (
  !fs.existsSync(manifestPath) ||
  fs.lstatSync(manifestPath).isSymbolicLink()
) {
  fail('trusted capture manifest is missing or symbolic');
}
const manifest = readJSON(manifestPath);
if (
  manifest.version !== 1 ||
  typeof manifest.platform !== 'string' ||
  !manifest.platform ||
  typeof manifest.browser !== 'string' ||
  !manifest.browser ||
  !Number.isSafeInteger(manifest.viewport?.width) ||
  !Number.isSafeInteger(manifest.viewport?.height) ||
  !manifest.shots ||
  typeof manifest.shots !== 'object' ||
  Array.isArray(manifest.shots)
) {
  fail('trusted capture manifest is invalid');
}
if (
  manifest.context?.headSha !== headSha ||
  String(manifest.context?.runId ?? '') !== runId ||
  String(manifest.context?.runAttempt ?? '') !== runAttempt ||
  !SHA.test(manifest.context?.sha ?? '') ||
  !SHA.test(manifest.context?.baseSha ?? '')
) {
  fail('trusted capture identity mismatch');
}

const baselineManifest = readJSON(path.join(baseline, 'manifest.json'));
const blocker = incomparable(baselineManifest, manifest);
if (blocker) fail(`baseline is not comparable: ${blocker}`);

const entries = Object.entries(manifest.shots);
if (entries.length > MAX_SHOTS)
  fail(`trusted capture exceeds ${MAX_SHOTS} shots`);
for (const [key, shot] of entries) {
  if (
    !KEY.test(key) ||
    !shot ||
    typeof shot.storyId !== 'string' ||
    !shot.storyId ||
    typeof shot.theme !== 'string' ||
    !NAME.test(shot.theme) ||
    !['light', 'dark'].includes(shot.mode) ||
    !Array.isArray(shot.reasons) ||
    shotKey(shot) !== key
  ) {
    fail(`capture metadata is invalid for ${key}`);
  }
}
fs.rmSync(output, {recursive: true, force: true});
for (const dir of ['current', 'before', 'after', 'diff']) {
  fs.mkdirSync(path.join(output, dir), {recursive: true});
}

const sourceShots = path.join(input, 'shots');
const sourceNames = fs.existsSync(sourceShots)
  ? fs.readdirSync(sourceShots, {withFileTypes: true})
  : [];
const sourceKeys = sourceNames.map(entry => {
  if (
    !entry.isFile() ||
    entry.isSymbolicLink() ||
    !entry.name.endsWith('.png')
  ) {
    fail(`unexpected capture entry ${entry.name}`);
  }
  return entry.name.slice(0, -4);
});
if (
  sourceKeys.length !== entries.length ||
  sourceKeys.some(key => !manifest.shots[key])
) {
  fail('capture PNG set does not match its manifest');
}

const trustedManifest = {...manifest, shots: {}};
for (const [key, shot] of entries) {
  const target = path.join(output, 'current', `${key}.png`);
  const image = copyPng(
    path.join(sourceShots, `${key}.png`),
    target,
    `shots/${key}.png`,
  );
  trustedManifest.shots[key] = {
    ...shot,
    sha256: shaFile(target),
    width: image.width,
    height: image.height,
  };
}

const baselineEntries = Object.entries(baselineManifest.shots ?? {});
const expected = scope.broadStableVisual
  ? baselineEntries.map(([key]) => key)
  : baselineEntries
      .filter(
        ([, shot]) =>
          scope.stableComponents.includes(shot.component) ||
          scope.stableThemes.includes(shot.theme),
      )
      .map(([key]) => key);
if (entries.length === 0 && expected.length === 0) {
  fail('stable visual scope produced no trusted shots');
}

const comparison = await compareCaptures({
  baselineDir: path.join(baseline, 'shots'),
  currentDir: path.join(output, 'current'),
  baselineManifest,
  currentManifest: trustedManifest,
  diffDir: path.join(output, 'diff'),
  threshold: config.threshold,
  maxDiffPixels: config.maxDiffPixels,
  scoped: true,
});
comparison.removed = expected.filter(key => !trustedManifest.shots[key]);

const verdict = buildVerdict({
  comparison,
  currentManifest: trustedManifest,
  baselineManifest,
  targeting: {
    unexercisedOverrides: [],
    undeclaredTargets: [],
    uncoveredTargets: [],
  },
  failures: [],
  context: {...manifest.context, trustedScope: scope},
});

const beforeSha256 = {};
for (const change of verdict.changes) {
  const key = change.key;
  const baselineFile = path.join(baseline, 'shots', `${key}.png`);
  copyPng(
    baselineFile,
    path.join(output, 'before', `${key}.png`),
    `baseline/${key}.png`,
  );
  fs.copyFileSync(
    path.join(output, 'current', `${key}.png`),
    path.join(output, 'after', `${key}.png`),
  );
  beforeSha256[key] = shaFile(baselineFile);
}
for (const key of verdict.added) {
  fs.copyFileSync(
    path.join(output, 'current', `${key}.png`),
    path.join(output, 'after', `${key}.png`),
  );
  beforeSha256[key] = null;
}
for (const key of verdict.removed) {
  const baselineFile = path.join(baseline, 'shots', `${key}.png`);
  copyPng(
    baselineFile,
    path.join(output, 'before', `${key}.png`),
    `baseline/${key}.png`,
  );
  beforeSha256[key] = shaFile(baselineFile);
}

const evidence = {
  version: 1,
  repo: 'facebook/astryx',
  pr,
  headSha,
  testedSha: manifest.context.sha,
  baseSha: manifest.context.baseSha,
  run: {id: Number(runId), attempt: Number(runAttempt)},
  capture: {
    platform: trustedManifest.platform,
    browser: trustedManifest.browser,
    viewport: trustedManifest.viewport,
  },
  deltas: [
    ...verdict.changes.map(change => ({
      key: change.key,
      kind: 'changed',
      beforeSha256: beforeSha256[change.key],
      shot: trustedManifest.shots[change.key],
    })),
    ...verdict.added.map(key => ({
      key,
      kind: 'added',
      beforeSha256: null,
      shot: trustedManifest.shots[key],
    })),
    ...verdict.removed.map(key => ({
      key,
      kind: 'removed',
      beforeSha256: beforeSha256[key],
      shot: null,
    })),
  ],
  verdict,
};

fs.rmSync(path.join(output, 'current'), {recursive: true, force: true});
fs.writeFileSync(
  path.join(output, 'evidence.json'),
  `${JSON.stringify(evidence, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(output, 'verdict.json'),
  `${JSON.stringify(verdict, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(output, 'index.html'),
  renderReport(verdict, {
    acceptHint: `/accept-visual ${runId}/${runAttempt} <why every changed frame is correct>`,
    oneSidedEvidence: true,
  }),
);

process.stdout.write(
  `Derived trusted ${verdict.status} verdict for ${entries.length} shot(s), PR #${pr}, run ${runId}/${runAttempt}.\n`,
);
