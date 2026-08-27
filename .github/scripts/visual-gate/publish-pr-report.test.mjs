// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {PNG} from 'pngjs';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'publish-pr-report.mjs');
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
    manifestShots[key] = {...shot, sha256: createHash('sha256').update(bytes).digest('hex')};
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

function writeCapture(shots = {[KEY]: {shot: SHOT, bytes: png(0, 0, 255)}}, overrides = {}) {
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
      '--input', input,
      '--output', output,
      '--baseline', baseline,
      '--scope', scope,
      '--pr', '42',
      '--head-sha', HEAD,
      '--run-id', RUN,
      '--run-attempt', '1',
    ],
    {encoding: 'utf8'},
  );
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
  it('derives a changed verdict even when PR data claims pass', () => {
    expect(run()).toContain('trusted changed verdict');
    const verdict = JSON.parse(fs.readFileSync(path.join(output, 'verdict.json'), 'utf8'));
    expect(verdict).toMatchObject({status: 'changed', counts: {changed: 1}});
    expect(fs.existsSync(path.join(output, 'before', `${KEY}.png`))).toBe(true);
    expect(fs.existsSync(path.join(output, 'after', `${KEY}.png`))).toBe(true);
    expect(fs.existsSync(path.join(output, 'diff', `${KEY}.png`))).toBe(true);
  });

  it('derives pass only from a trusted capture matching the baseline', () => {
    writeCapture({[KEY]: {shot: SHOT, bytes: png()}});
    run();
    const verdict = JSON.parse(fs.readFileSync(path.join(output, 'verdict.json'), 'utf8'));
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
    const verdict = JSON.parse(fs.readFileSync(path.join(output, 'verdict.json'), 'utf8'));
    expect(verdict).toMatchObject({status: 'changed', added: [key]});
    expect(fs.existsSync(path.join(output, 'after', `${key}.png`))).toBe(true);
  });

  it('derives a removed baseline shot when trusted capture omits expected scope', () => {
    writeCapture({});
    run();
    const verdict = JSON.parse(fs.readFileSync(path.join(output, 'verdict.json'), 'utf8'));
    expect(verdict).toMatchObject({status: 'changed', removed: [KEY]});
    expect(fs.existsSync(path.join(output, 'before', `${KEY}.png`))).toBe(true);
  });

  it('rejects a trusted capture that claims another run', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(input, 'manifest.json'), 'utf8'));
    manifest.context.runId = '999';
    writeJSON(path.join(input, 'manifest.json'), manifest);
    expect(() => run()).toThrow(/identity mismatch/);
  });

  it('rejects traversal-shaped manifest keys', () => {
    writeCapture({'../bad': {shot: {...SHOT, storyId: '../bad'}, bytes: png()}});
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
