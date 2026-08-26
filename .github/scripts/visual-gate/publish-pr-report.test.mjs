// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {PNG} from 'pngjs';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'publish-pr-report.mjs',
);
const HEAD = 'a'.repeat(40);
const RUN = '123456';

let root;
let input;
let output;

function png() {
  const image = new PNG({width: 2, height: 2});
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = 255;
    image.data[i + 3] = 255;
  }
  return PNG.sync.write(image);
}

function writeFixture(overrides = {}) {
  const key = overrides.key ?? 'core-button--default__neutral-light';
  const verdict = {
    version: 1,
    status: 'changed',
    context: {runId: RUN, headSha: HEAD, sha: 'b'.repeat(40)},
    counts: {total: 1, changed: 1, added: 0, removed: 0, failed: 0},
    changes: [
      {
        key,
        component: 'Button',
        name: 'Default',
        theme: 'neutral',
        mode: 'light',
        diffPixels: 4,
      },
    ],
    ...overrides.verdict,
  };
  fs.mkdirSync(input, {recursive: true});
  fs.writeFileSync(path.join(input, 'verdict.json'), JSON.stringify(verdict));
  for (const kind of ['before', 'after', 'diff']) {
    const dir = path.join(input, 'report', kind);
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(path.join(dir, `${key}.png`), overrides.bytes ?? png());
  }
}

function run(extra = []) {
  return execFileSync(
    process.execPath,
    [
      SCRIPT,
      '--input',
      input,
      '--output',
      output,
      '--pr',
      '42',
      '--head-sha',
      HEAD,
      '--run-id',
      RUN,
      '--run-attempt',
      '1',
      ...extra,
    ],
    {encoding: 'utf8'},
  );
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-visual-'));
  input = path.join(root, 'input');
  output = path.join(root, 'output');
});
afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

describe('trusted PR visual publisher', () => {
  it('decodes/re-encodes images and generates the wrapper from trusted code', () => {
    writeFixture();
    expect(run()).toContain('Validated 1 visual delta');
    expect(fs.existsSync(path.join(output, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(output, 'before', 'core-button--default__neutral-light.png'))).toBe(true);
    const evidence = JSON.parse(fs.readFileSync(path.join(output, 'evidence.json'), 'utf8'));
    expect(evidence).toMatchObject({pr: 42, headSha: HEAD, testedSha: 'b'.repeat(40)});
  });

  it('rejects an artifact that claims another run', () => {
    writeFixture({verdict: {context: {runId: '999', headSha: HEAD}}});
    expect(() => run()).toThrow(/does not match/);
  });

  it('rejects traversal and shell-shaped shot keys', () => {
    writeFixture({key: '../bad;rm'});
    expect(() => run()).toThrow(/invalid shot key/);
  });

  it('rejects bytes that are not a decodable PNG', () => {
    writeFixture({bytes: Buffer.from('not png')});
    expect(() => run()).toThrow(/not a valid PNG/);
  });
});
