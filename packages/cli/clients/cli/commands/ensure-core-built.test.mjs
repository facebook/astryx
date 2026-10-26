// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ensure-core-built.test.mjs
 * @input coreBuildIsStale over temporary trees
 * @output A core build counts as current only when it is newer than every
 *   source file: a missing entry, a source or package.json changed after it,
 *   are stale; node_modules and dist under a source root are not sources
 * @position Unit test of ./ensure-core-built.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {coreBuildIsStale} from './ensure-core-built.mjs';

let dir;
afterEach(() => {
  fs.rmSync(dir, {recursive: true, force: true});
});

/** A core-shaped tree: sources at t = 1000 s, the built entry at t = 2000 s. */
function tree() {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-core-build-stale-'));
  const write = (relative, content, seconds) => {
    const file = path.join(dir, relative);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
    fs.utimesSync(file, seconds, seconds);
    return file;
  };
  const source = write('src/theme/index.ts', 'export {};', 1000);
  const pkg = write('package.json', '{}', 1000);
  const entry = write('dist/theme/index.js', 'export {};', 2000);
  return {
    write,
    source,
    entry,
    roots: [path.join(dir, 'src'), pkg],
  };
}

describe('coreBuildIsStale', () => {
  it('is stale with no build', () => {
    const {entry, roots} = tree();
    fs.rmSync(entry);
    expect(coreBuildIsStale(entry, roots)).toBe(true);
  });

  it('is current when the build is newer than every source', () => {
    const {entry, roots} = tree();
    expect(coreBuildIsStale(entry, roots)).toBe(false);
  });

  it('is stale when a source changed after the build, as a checkout does', () => {
    const {entry, roots, source} = tree();
    fs.utimesSync(source, 3000, 3000);
    expect(coreBuildIsStale(entry, roots)).toBe(true);
  });

  it('is stale when a new source appeared after the build', () => {
    const {entry, roots, write} = tree();
    write('src/theme/adaptations.ts', 'export {};', 3000);
    expect(coreBuildIsStale(entry, roots)).toBe(true);
  });

  it('is stale when package.json changed after the build', () => {
    const {entry, roots} = tree();
    fs.utimesSync(roots[1], 3000, 3000);
    expect(coreBuildIsStale(entry, roots)).toBe(true);
  });

  it('skips node_modules and dist under a source root', () => {
    const {entry, roots, write} = tree();
    write('src/node_modules/x/index.js', 'x', 3000);
    write('src/dist/x.js', 'x', 3000);
    expect(coreBuildIsStale(entry, roots)).toBe(false);
  });
});
