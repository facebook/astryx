// Copyright (c) Meta Platforms, Inc. and affiliates.

// `gate.mjs accept` is the promotion boundary: the one command that writes
// baseline files. These tests drive the real command against a scratch capture
// and baseline, so what they prove is what the Visual Baseline workflow runs.

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'gate.mjs');

let root;
let baselineDir;
let captureDir;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-gate-accept-'));
  baselineDir = path.join(root, 'baseline');
  captureDir = path.join(root, 'capture');
  fs.mkdirSync(path.join(captureDir, 'shots'), {recursive: true});
  fs.writeFileSync(path.join(captureDir, 'shots', 'a.png'), 'new-a');
  fs.writeFileSync(path.join(captureDir, 'shots', 'b.png'), 'new-b');
  fs.writeFileSync(
    path.join(captureDir, 'manifest.json'),
    JSON.stringify({
      platform: 'linux-x64',
      viewport: {width: 1024, height: 768},
      capturedAt: '2026-08-23T00:00:00.000Z',
      shots: {a: {sha256: 'aa'}, b: {sha256: 'bb'}},
    }),
  );
});
afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

function writeVerdict(contents) {
  fs.writeFileSync(
    path.join(captureDir, 'verdict.json'),
    typeof contents === 'string' ? contents : JSON.stringify(contents),
  );
}

function acceptCommand(keys = 'a') {
  return spawnSync(
    process.execPath,
    [
      SCRIPT,
      'accept',
      '--baseline',
      baselineDir,
      '--out',
      captureDir,
      '--keys',
      keys,
      '--reason',
      'Button radius changed on purpose',
      '--actor',
      'tester',
    ],
    {encoding: 'utf8'},
  );
}

describe('gate.mjs accept', () => {
  it.each([
    ['pass', {status: 'pass'}],
    ['changed', {status: 'changed'}],
  ])('promotes the named shot from a %s verdict', (_label, verdict) => {
    writeVerdict(verdict);
    const result = acceptCommand();
    expect(result.status, result.stderr).toBe(0);
    expect(fs.readFileSync(path.join(baselineDir, 'shots', 'a.png'), 'utf8')).toBe('new-a');
    expect(fs.existsSync(path.join(baselineDir, 'shots', 'b.png'))).toBe(false);
    const manifest = JSON.parse(fs.readFileSync(path.join(baselineDir, 'manifest.json'), 'utf8'));
    expect(Object.keys(manifest.shots)).toEqual(['a']);
  });

  it.each([
    ['failed', {status: 'failed'}],
    ['skipped', {status: 'skipped'}],
    ['missing', null],
    ['unreadable (not JSON)', 'not json'],
    ['unreadable (no status)', {}],
    ['unknown', {status: 'crashed'}],
  ])('writes no baseline file from a %s verdict', (_label, verdict) => {
    if (verdict !== null) writeVerdict(verdict);
    const result = acceptCommand();
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Refusing to promote/);
    // Not a manifest, not a shots directory: the baseline directory itself
    // was never created.
    expect(fs.existsSync(baselineDir)).toBe(false);
  });

  it('trims the keys the dispatch form invites: "a, b" promotes both', () => {
    writeVerdict({status: 'changed'});
    const result = acceptCommand('a, b');
    expect(result.status, result.stderr).toBe(0);
    const manifest = JSON.parse(fs.readFileSync(path.join(baselineDir, 'manifest.json'), 'utf8'));
    expect(Object.keys(manifest.shots).sort()).toEqual(['a', 'b']);
  });
});
