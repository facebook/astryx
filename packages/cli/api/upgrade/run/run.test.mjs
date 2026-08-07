// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the upgrade.run leaf — the --path scan dir must be
 * confined to cwd (upgrade rewrites source in place with --apply, so an escaping
 * or out-of-tree path must be rejected).
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {upgrade} from '../upgrade.mjs';

const SLOW = 30_000;

function seedProject(dir) {
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: 'x', version: '1.0.0', dependencies: {'@astryxdesign/core': '0.1.8'}}),
  );
  const core = path.join(dir, 'node_modules', '@astryxdesign', 'core');
  fs.mkdirSync(core, {recursive: true});
  fs.writeFileSync(path.join(core, 'package.json'), JSON.stringify({name: '@astryxdesign/core', version: '0.1.8'}));
  fs.mkdirSync(path.join(dir, 'src'), {recursive: true});
  fs.writeFileSync(path.join(dir, 'src', 'index.ts'), 'const x = 1;\n');
}

describe('upgrade.run — --path confinement', () => {
  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'upg-path-'));
    seedProject(dir);
  });
  afterEach(() => fs.rmSync(dir, {recursive: true, force: true}));

  it('accepts a normal in-tree --path (dry run)', async () => {
    const res = await upgrade({from: '0.0.1', path: 'src'}, {cwd: dir});
    expect(res.type).toBe('upgrade.run');
  }, SLOW);

  it('rejects a ../-escaping --path with ERR_PATH_TRAVERSAL', async () => {
    await expect(
      upgrade({from: '0.0.1', path: '../../../../etc'}, {cwd: dir}),
    ).rejects.toMatchObject({code: 'ERR_PATH_TRAVERSAL'});
  }, SLOW);

  it('rejects an absolute --path outside cwd with ERR_PATH_TRAVERSAL', async () => {
    await expect(
      upgrade({from: '0.0.1', path: os.tmpdir()}, {cwd: dir}),
    ).rejects.toMatchObject({code: 'ERR_PATH_TRAVERSAL'});
  }, SLOW);
});
