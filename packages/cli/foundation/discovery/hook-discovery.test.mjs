// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for hook-discovery, run against the real
 * @astryxdesign/core source tree plus throwaway fixtures. Pins the
 * category grouping, the missing-src guarding (which differs from
 * component-discovery), and the Levenshtein fuzzy-fallback in findHookDoc.
 */

import {describe, it, expect, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {discoverHooks, findHookDoc, getAllHookNames} from './hook-discovery.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const CORE = path.join(REPO, 'packages', 'core');
const SLOW = 30_000;

const tmpDirs = [];
function mkTmp(prefix) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tmpDirs.push(d);
  return d;
}
afterAll(() => {
  for (const d of tmpDirs) fs.rmSync(d, {recursive: true, force: true});
});

describe('discoverHooks (real core)', () => {
  it('discovers real hooks grouped by category', () => {
    const hooks = discoverHooks(CORE);
    const cats = Object.keys(hooks);
    expect(cats.length).toBeGreaterThan(1);
    if (cats.includes('Other')) expect(cats[cats.length - 1]).toBe('Other');
    const nonOther = cats.filter(c => c !== 'Other');
    expect([...nonOther].sort((a, b) => a.localeCompare(b))).toEqual(nonOther);
    for (const members of Object.values(hooks)) {
      expect([...members].sort()).toEqual(members);
    }
    const all = getAllHookNames(CORE);
    expect(all).toContain('useMediaQuery');
    expect(all.length).toBeGreaterThan(10);
  }, SLOW);

  it('capitalizes categories and buckets category-less docs into Other', () => {
    const core = mkTmp('as-hd-cat-');
    const hooksDir = path.join(core, 'src', 'hooks');
    fs.mkdirSync(hooksDir, {recursive: true});
    fs.writeFileSync(path.join(hooksDir, 'useThing.doc.mjs'), "export default {\n  category: 'layout',\n};\n");
    fs.writeFileSync(path.join(hooksDir, 'useOrphan.doc.mjs'), 'export default {};\n');
    expect(discoverHooks(core)).toEqual({Layout: ['useThing'], Other: ['useOrphan']});
  });

  it('discovers use*.doc.mjs colocated in component directories', () => {
    const core = mkTmp('as-hd-colo-');
    const compDir = path.join(core, 'src', 'Resizable');
    fs.mkdirSync(compDir, {recursive: true});
    fs.writeFileSync(path.join(compDir, 'useResizable.doc.mjs'), "export default {\n  category: 'interaction',\n};\n");
    expect(discoverHooks(core)).toEqual({Interaction: ['useResizable']});
  });

  it('returns {} when src/ is missing (guarded with existsSync)', () => {
    const core = mkTmp('as-hd-nosrc-');
    expect(discoverHooks(core)).toEqual({});
    expect(getAllHookNames(core)).toEqual([]);
  });
});

describe('findHookDoc (real core)', () => {
  it('resolves an exact hook name', () => {
    expect(findHookDoc(CORE, 'useMediaQuery')).toMatch(/useMediaQuery\.doc\.mjs$/);
  }, SLOW);

  it('resolves a bare (use-prefix-stripped, case-insensitive) name', () => {
    expect(findHookDoc(CORE, 'mediaquery')).toMatch(/useMediaQuery\.doc\.mjs$/);
  }, SLOW);

  it('returns null when src/ is missing (guarded)', () => {
    const core = mkTmp('as-fhd-nosrc-');
    expect(findHookDoc(core, 'useFoo')).toBeNull();
  });
});

describe('findHookDoc fuzzy Levenshtein fallback (pinned current behavior)', () => {
  it('auto-resolves a typo within edit distance 3', () => {
    expect(getAllHookNames(CORE)).not.toContain('useLayers');
    expect(getAllHookNames(CORE)).toContain('useLayer');
    expect(findHookDoc(CORE, 'useLayers')).toMatch(/useLayer\.doc\.mjs$/);
  }, SLOW);

  it('returns null when the closest hook is farther than distance 3', () => {
    expect(findHookDoc(CORE, 'useZzzzzz')).toBeNull();
    expect(findHookDoc(CORE, 'zzzzzzzzzz')).toBeNull();
  }, SLOW);
});
