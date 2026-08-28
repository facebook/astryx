// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {PNG} from 'pngjs';

import {canonicalizePng} from './lib/canonical-png.mjs';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'publish-pr-report.mjs',
);
const ACCEPTANCE_SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'visual-acceptance.mjs',
);
const HEAD = 'a'.repeat(40);
const RUN = '123456';
const KEY = 'core-button--default__neutral-light';
const SHOT = {
  storyId: 'core-button--default',
  title: 'Core/Button',
  name: 'Default',
  component: 'Button',
  theme: 'neutral',
  mode: 'light',
  reasons: ['trusted:pr-scope'],
};

let root;
let input;
let output;
let baseline;
let scope;

function png(red = 255, green = 0, blue = 0) {
  const image = new PNG({width: 2, height: 2});
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = red;
    image.data[i + 1] = green;
    image.data[i + 2] = blue;
    image.data[i + 3] = 255;
  }
  return PNG.sync.write(image);
}

function writeJSON(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, JSON.stringify(value));
}

function writeBaseline(shots = {[KEY]: {shot: SHOT, bytes: png()}}) {
  const manifestShots = {};
  for (const [key, {shot, bytes}] of Object.entries(shots)) {
    const file = path.join(baseline, 'shots', `${key}.png`);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, bytes);
    manifestShots[key] = {
      ...shot,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
  }
  writeJSON(path.join(baseline, 'manifest.json'), {
    version: 1,
    platform: 'linux-arm64',
    browser: 'chromium-140.0',
    viewport: {width: 1280, height: 900},
    shots: manifestShots,
    decisions: [],
  });
}

function writeCapture(
  shots = {[KEY]: {shot: SHOT, bytes: png(0, 0, 255)}},
  overrides = {},
) {
  fs.rmSync(input, {recursive: true, force: true});
  const manifestShots = {};
  const shotsDir = path.join(input, 'shots');
  fs.mkdirSync(shotsDir, {recursive: true});
  for (const [key, {shot, bytes}] of Object.entries(shots)) {
    fs.writeFileSync(path.join(shotsDir, `${key}.png`), bytes);
    manifestShots[key] = {...shot, sha256: '0'.repeat(64)};
  }
  writeJSON(path.join(input, 'manifest.json'), {
    version: 1,
    platform: 'linux-arm64',
    browser: 'chromium-140.0',
    viewport: {width: 1280, height: 900},
    context: {
      sha: 'b'.repeat(40),
      headSha: HEAD,
      baseSha: 'c'.repeat(40),
      runId: RUN,
      runAttempt: '1',
    },
    shots: manifestShots,
    ...overrides,
  });
  // A forged PR verdict is deliberately present: the trusted publisher ignores it.
  writeJSON(path.join(input, 'verdict.json'), {
    version: 1,
    status: 'pass',
    changes: [],
    added: [],
    removed: [],
    failures: [],
  });
}

function run() {
  return execFileSync(
    process.execPath,
    [
      SCRIPT,
      '--input',
      input,
      '--output',
      output,
      '--baseline',
      baseline,
      '--scope',
      scope,
      '--pr',
      '42',
      '--head-sha',
      HEAD,
      '--run-id',
      RUN,
      '--run-attempt',
      '1',
    ],
    {encoding: 'utf8'},
  );
}

function runAcceptance(command, flags) {
  const args = [ACCEPTANCE_SCRIPT, command];
  for (const [name, value] of Object.entries(flags)) {
    args.push(`--${name}`, String(value));
  }
  return execFileSync(process.execPath, args, {encoding: 'utf8'});
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'trusted-visual-'));
  input = path.join(root, 'input');
  output = path.join(root, 'output');
  baseline = path.join(root, 'baseline');
  scope = path.join(root, 'scope.json');
  writeJSON(scope, {
    hasStableVisual: true,
    broadStableVisual: false,
    stableComponents: ['Button'],
    stableThemes: [],
  });
  writeBaseline();
  writeCapture();
});

afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

describe('trusted PR visual publisher', () => {
  it('canonicalizes raw capture bytes through acceptance and promotion', () => {
    const rawImage = PNG.sync.read(png(0, 0, 255));
    rawImage.gamma = 0.45455;
    const rawAfter = PNG.sync.write(rawImage, {
      deflateLevel: 0,
      deflateStrategy: 0,
      filterType: 0,
    });
    writeCapture({[KEY]: {shot: SHOT, bytes: rawAfter}});
    run();

    const publishedAfter = fs.readFileSync(
      path.join(output, 'after', `${KEY}.png`),
    );
    expect(publishedAfter).toEqual(canonicalizePng(rawAfter).bytes);
    expect(publishedAfter).not.toEqual(rawAfter);
    const evidence = JSON.parse(
      fs.readFileSync(path.join(output, 'evidence.json'), 'utf8'),
    );
    expect(evidence.deltas[0].shot.sha256).toBe(
      createHash('sha256').update(publishedAfter).digest('hex'),
    );

    const pages = path.join(root, 'pages');
    fs.mkdirSync(path.join(pages, 'visual-gate'), {recursive: true});
    fs.cpSync(baseline, path.join(pages, 'visual-gate', 'baseline'), {
      recursive: true,
    });
    const evidenceDir = path.join(pages, 'pr', '42', 'visual', HEAD, RUN, '1');
    fs.mkdirSync(path.dirname(evidenceDir), {recursive: true});
    fs.cpSync(output, evidenceDir, {recursive: true});
    execFileSync('git', ['init', '-q', '-b', 'gh-pages'], {cwd: pages});
    execFileSync('git', ['config', 'user.name', 'Test'], {cwd: pages});
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: pages,
    });
    execFileSync('git', ['add', '.'], {cwd: pages});
    execFileSync('git', ['commit', '-qm', 'trusted evidence'], {cwd: pages});

    runAcceptance('accept', {
      pages,
      pr: 42,
      head: HEAD,
      'run-id': RUN,
      'run-attempt': 1,
      approver: 'maintainer',
      'approver-id': 99,
      permission: 'maintain',
      'effective-permission': 'maintain',
      'comment-id': 1234,
      reason: 'The changed frame matches the approved component design.',
    });
    const acceptance = path.join(
      pages,
      'visual-gate',
      'acceptances',
      '42',
      HEAD,
      RUN,
      '1',
      'acceptance.json',
    );
    expect(
      JSON.parse(fs.readFileSync(acceptance, 'utf8')).keys[0].afterSha256,
    ).toBe(createHash('sha256').update(publishedAfter).digest('hex'));

    const mergeImage = PNG.sync.read(rawAfter);
    mergeImage.gamma = 0.8;
    const rawMerged = PNG.sync.write(mergeImage, {
      deflateLevel: 1,
      deflateStrategy: 1,
      filterType: 4,
    });
    expect(rawMerged).not.toEqual(rawAfter);
    expect(canonicalizePng(rawMerged).bytes).toEqual(publishedAfter);
    const merged = path.join(root, 'merged');
    fs.mkdirSync(path.join(merged, 'shots'), {recursive: true});
    fs.writeFileSync(path.join(merged, 'shots', `${KEY}.png`), rawMerged);
    writeJSON(path.join(merged, 'manifest.json'), {
      version: 1,
      platform: 'linux-arm64',
      browser: 'chromium-140.0',
      viewport: {width: 1280, height: 900},
      capturedAt: '2026-08-27T09:00:00.000Z',
      context: {sha: 'd'.repeat(40)},
      shots: {
        [KEY]: {
          ...SHOT,
          sha256: createHash('sha256').update(rawMerged).digest('hex'),
          width: 2,
          height: 2,
        },
      },
    });

    runAcceptance('promote', {
      pages,
      acceptance,
      capture: merged,
      'merge-sha': 'd'.repeat(40),
    });
    expect(
      fs.readFileSync(
        path.join(pages, 'visual-gate', 'baseline', 'shots', `${KEY}.png`),
      ),
    ).toEqual(publishedAfter);
  });

  it('derives a changed verdict even when PR data claims pass', () => {
    expect(run()).toContain('trusted changed verdict');
    const verdict = JSON.parse(
      fs.readFileSync(path.join(output, 'verdict.json'), 'utf8'),
    );
    expect(verdict).toMatchObject({status: 'changed', counts: {changed: 1}});
    expect(fs.existsSync(path.join(output, 'before', `${KEY}.png`))).toBe(true);
    expect(fs.existsSync(path.join(output, 'after', `${KEY}.png`))).toBe(true);
    expect(fs.existsSync(path.join(output, 'diff', `${KEY}.png`))).toBe(true);
  });

  it('derives pass only from a trusted capture matching the baseline', () => {
    writeCapture({[KEY]: {shot: SHOT, bytes: png()}});
    run();
    const verdict = JSON.parse(
      fs.readFileSync(path.join(output, 'verdict.json'), 'utf8'),
    );
    expect(verdict.status).toBe('pass');
  });

  it('derives an added shot and preserves its after image', () => {
    writeBaseline({});
    const key = 'core-new--default__neutral-light';
    const shot = {...SHOT, storyId: 'core-new--default', component: 'New'};
    writeJSON(scope, {
      hasStableVisual: true,
      broadStableVisual: false,
      stableComponents: ['New'],
      stableThemes: [],
    });
    writeCapture({[key]: {shot, bytes: png(0, 255, 0)}});
    run();
    const verdict = JSON.parse(
      fs.readFileSync(path.join(output, 'verdict.json'), 'utf8'),
    );
    expect(verdict).toMatchObject({status: 'changed', added: [key]});
    expect(fs.existsSync(path.join(output, 'after', `${key}.png`))).toBe(true);
  });

  it('derives a removed baseline shot when trusted capture omits expected scope', () => {
    writeCapture({});
    run();
    const verdict = JSON.parse(
      fs.readFileSync(path.join(output, 'verdict.json'), 'utf8'),
    );
    expect(verdict).toMatchObject({status: 'changed', removed: [KEY]});
    expect(fs.existsSync(path.join(output, 'before', `${KEY}.png`))).toBe(true);
  });

  it('rejects a trusted capture that claims another run', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(input, 'manifest.json'), 'utf8'),
    );
    manifest.context.runId = '999';
    writeJSON(path.join(input, 'manifest.json'), manifest);
    expect(() => run()).toThrow(/identity mismatch/);
  });

  it('rejects traversal-shaped manifest keys', () => {
    writeCapture({
      '../bad': {shot: {...SHOT, storyId: '../bad'}, bytes: png()},
    });
    expect(() => run()).toThrow(/metadata is invalid/);
  });

  it('rejects capture bytes that are not a PNG', () => {
    fs.writeFileSync(path.join(input, 'shots', `${KEY}.png`), 'not png');
    expect(() => run()).toThrow(/not a valid PNG/);
  });

  it('rejects an empty capture for an unbaselined stable scope', () => {
    writeBaseline({});
    writeCapture({});
    expect(() => run()).toThrow(/produced no trusted shots/);
  });
});
