// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {accept, incomparable, readBaseline} from './baseline.mjs';

let root;
let baselineDir;
let captureDir;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-baseline-'));
  baselineDir = path.join(root, 'baseline');
  captureDir = path.join(root, 'capture');
  fs.mkdirSync(path.join(captureDir, 'shots'), {recursive: true});
  fs.writeFileSync(path.join(captureDir, 'shots', 'a.png'), 'new-a');
  fs.writeFileSync(path.join(captureDir, 'shots', 'b.png'), 'new-b');
});
afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

const currentManifest = {
  platform: 'linux-arm64',
  viewport: {width: 1024, height: 768},
  capturedAt: '2026-08-23T00:00:00.000Z',
  shots: {a: {sha256: 'aa'}, b: {sha256: 'bb'}},
};

const promote = overrides =>
  accept({
    baselineDir,
    captureDir,
    currentManifest,
    keys: ['a'],
    reason: 'Button radius changed on purpose',
    actor: 'tester',
    ...overrides,
  });

describe('accept', () => {
  it('refuses to promote without a reason, because the reason is the record', () => {
    expect(() => promote({reason: ' '})).toThrow(/reason/);
  });

  it('copies only the named shots into the baseline', () => {
    promote();
    expect(fs.readFileSync(path.join(baselineDir, 'shots', 'a.png'), 'utf8')).toBe('new-a');
    expect(fs.existsSync(path.join(baselineDir, 'shots', 'b.png'))).toBe(false);
    expect(Object.keys(readBaseline(baselineDir).manifest.shots)).toEqual(['a']);
  });

  it('records who promoted what, and why', () => {
    promote();
    const [decision] = readBaseline(baselineDir).manifest.decisions;
    expect(decision).toMatchObject({actor: 'tester', promoted: ['a'], reason: 'Button radius changed on purpose'});
  });

  it('keeps earlier decisions when promoting again', () => {
    promote();
    promote({keys: ['b'], reason: 'Badge padding, intentional'});
    expect(readBaseline(baselineDir).manifest.decisions).toHaveLength(2);
  });

  it('drops pruned shots from both the manifest and disk', () => {
    promote({keys: ['a', 'b']});
    promote({keys: [], prune: ['b'], reason: 'story deleted'});
    expect(fs.existsSync(path.join(baselineDir, 'shots', 'b.png'))).toBe(false);
    expect(Object.keys(readBaseline(baselineDir).manifest.shots)).toEqual(['a']);
  });
});

describe('incomparable', () => {
  it('refuses a baseline from another platform', () => {
    expect(incomparable({platform: 'darwin-arm64'}, {platform: 'linux-arm64'})).toMatch(/darwin-arm64/);
  });

  it('refuses a baseline captured at another viewport', () => {
    const reason = incomparable(
      {platform: 'linux-arm64', viewport: {width: 800, height: 600}},
      {platform: 'linux-arm64', viewport: {width: 1024, height: 768}},
    );
    expect(reason).toMatch(/viewport/);
  });

  it('allows a first run against an empty baseline', () => {
    expect(incomparable({}, {platform: 'linux-arm64'})).toBeNull();
  });
});
