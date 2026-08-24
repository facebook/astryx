// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {PNG} from 'pngjs';

import {analyzeTargeting, buildVerdict, compareCaptures} from './compare.mjs';

/** A solid rectangle, so a change is unambiguous. */
function png(width, height, [r, g, b]) {
  const image = new PNG({width, height});
  for (let index = 0; index < image.data.length; index += 4) {
    image.data[index] = r;
    image.data[index + 1] = g;
    image.data[index + 2] = b;
    image.data[index + 3] = 255;
  }
  return PNG.sync.write(image);
}

let root;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-gate-'));
  fs.mkdirSync(path.join(root, 'baseline'), {recursive: true});
  fs.mkdirSync(path.join(root, 'current'), {recursive: true});
});
afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

function write(dir, key, buffer) {
  fs.writeFileSync(path.join(root, dir, `${key}.png`), buffer);
}

function manifest(shots) {
  return {
    platform: 'linux-arm64',
    viewport: {width: 100, height: 100},
    shots: Object.fromEntries(
      Object.entries(shots).map(([key, value]) => [
        key,
        {sha256: value.sha256, width: 10, height: 10, theme: 'neutral', mode: 'light', reasons: ['surface'], ...value},
      ]),
    ),
  };
}

const compare = (baseline, current) =>
  compareCaptures({
    baselineDir: path.join(root, 'baseline'),
    currentDir: path.join(root, 'current'),
    baselineManifest: baseline,
    currentManifest: current,
    diffDir: path.join(root, 'diff'),
    threshold: 0.1,
    maxDiffPixels: 0,
  });

describe('compareCaptures', () => {
  it('calls an identical shot unchanged without decoding it', async () => {
    write('baseline', 'a', png(10, 10, [255, 0, 0]));
    write('current', 'a', png(10, 10, [255, 0, 0]));
    const result = await compare(manifest({a: {sha256: 'same'}}), manifest({a: {sha256: 'same'}}));
    expect(result).toMatchObject({unchanged: ['a'], changes: [], added: [], removed: []});
  });

  it('reports a changed shot with its pixel count and writes a diff image', async () => {
    write('baseline', 'a', png(10, 10, [255, 0, 0]));
    write('current', 'a', png(10, 10, [0, 0, 255]));
    const result = await compare(manifest({a: {sha256: 'one'}}), manifest({a: {sha256: 'two'}}));
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0]).toMatchObject({key: 'a', diffPixels: 100, sizeChanged: false});
    expect(fs.existsSync(path.join(root, 'diff', 'a.png'))).toBe(true);
  });

  it('treats a size change as a change even when the shared pixels match', async () => {
    write('baseline', 'a', png(10, 10, [255, 0, 0]));
    write('current', 'a', png(10, 20, [255, 0, 0]));
    const result = await compare(manifest({a: {sha256: 'one'}}), manifest({a: {sha256: 'two'}}));
    expect(result.changes[0].sizeChanged).toBe(true);
  });

  it('adopts a shot with no baseline instead of failing it', async () => {
    write('current', 'new', png(10, 10, [0, 255, 0]));
    const result = await compare(manifest({}), manifest({new: {sha256: 'x'}}));
    expect(result).toMatchObject({added: ['new'], changes: []});
  });

  it('reports a baseline shot whose story is gone as removed', async () => {
    write('baseline', 'gone', png(10, 10, [0, 255, 0]));
    const result = await compare(manifest({gone: {sha256: 'x'}}), manifest({}));
    expect(result.removed).toEqual(['gone']);
  });

  it('ranks the biggest change first', async () => {
    write('baseline', 'small', png(10, 10, [255, 0, 0]));
    write('current', 'small', png(10, 10, [255, 0, 10]));
    write('baseline', 'big', png(10, 10, [255, 0, 0]));
    write('current', 'big', png(10, 10, [0, 0, 255]));
    const before = manifest({small: {sha256: '1'}, big: {sha256: '2'}});
    const after = manifest({small: {sha256: '3'}, big: {sha256: '4'}});
    const result = await compare(before, after);
    expect(result.changes[0].key).toBe('big');
  });
});

describe('analyzeTargeting', () => {
  const targets = [{key: 'button', component: 'Button', props: ['variant:primary'], states: []}];

  it('flags a theme override whose target never rendered', () => {
    const result = analyzeTargeting({
      observedTargets: {button: ['variant:primary']},
      targets,
      themeOverrides: {y2k: {button: ['base'], 'top-nav-item': ['selected']}},
    });
    expect(result.unexercisedOverrides).toEqual([{theme: 'y2k', key: 'top-nav-item'}]);
  });

  it('flags a state the theme styles but the DOM never reflected', () => {
    const result = analyzeTargeting({
      observedTargets: {button: ['variant:primary']},
      targets,
      themeOverrides: {y2k: {button: ['base', 'variant:ghost']}},
    });
    expect(result.unexercisedOverrides).toEqual([{theme: 'y2k', key: 'button', selector: 'variant:ghost'}]);
  });

  it('ignores base and pseudo-class selectors, which the DOM cannot confirm', () => {
    const result = analyzeTargeting({
      observedTargets: {button: []},
      targets,
      themeOverrides: {y2k: {button: ['base', ':hover']}},
    });
    expect(result.unexercisedOverrides).toEqual([]);
  });

  it('separates a documented target nothing rendered from a rendered class nothing documents', () => {
    const result = analyzeTargeting({
      observedTargets: {surprise: []},
      targets,
      themeOverrides: {},
    });
    expect(result).toMatchObject({uncoveredTargets: ['button'], undeclaredTargets: ['surprise']});
  });
});

describe('buildVerdict', () => {
  const base = {
    currentManifest: manifest({a: {sha256: 'x', component: 'Button'}}),
    baselineManifest: {capturedAt: 'then', platform: 'linux-arm64'},
    targeting: {unexercisedOverrides: []},
    context: {sha: 'abc'},
  };

  it('is pass when nothing moved', () => {
    const verdict = buildVerdict({
      ...base,
      comparison: {changes: [], added: [], removed: [], unchanged: ['a']},
      failures: [],
    });
    expect(verdict.status).toBe('pass');
  });

  it('is changed — not failed — when a shot moved', () => {
    const verdict = buildVerdict({
      ...base,
      comparison: {changes: [{key: 'a', diffPixels: 9, diffRatio: 0.1, sizeChanged: false}], added: [], removed: [], unchanged: []},
      failures: [],
    });
    expect(verdict.status).toBe('changed');
    expect(verdict.changes[0].component).toBe('Button');
  });

  it('is failed when a shot could not be captured at all', () => {
    const verdict = buildVerdict({
      ...base,
      comparison: {changes: [], added: [], removed: [], unchanged: []},
      failures: [{key: 'a', error: 'boom'}],
    });
    expect(verdict.status).toBe('failed');
  });

  it('does not fail a run just because shots were added', () => {
    const verdict = buildVerdict({
      ...base,
      comparison: {changes: [], added: ['b'], removed: ['c'], unchanged: []},
      failures: [],
    });
    expect(verdict.status).toBe('pass');
    expect(verdict.counts).toMatchObject({added: 1, removed: 1});
  });
});
