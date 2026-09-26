// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `layout check -` reads the expression from stdin under the same 5 MB
 * cap as --file, instead of buffering whatever the pipe delivers. Spawns the
 * real bin, since the in-process harness has no stdin.
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(HERE, '../bin/astryx.mjs');
// Run against the monorepo root so @astryxdesign/core is discoverable.
const REPO = path.resolve(HERE, '../../../..');
const SLOW = 60_000;

/** @param {string} input @param {string[]} [extra] */
function checkFromStdin(input, extra = []) {
  return spawnSync(process.execPath, [BIN, 'layout', 'check', '-', ...extra], {
    cwd: REPO,
    input,
    encoding: 'utf-8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

describe('layout check - (stdin)', () => {
  it('refuses more than 5 MB with ERR_INVALID_ARGUMENT, in both modes', () => {
    // Valid once trimmed, so only the cap can reject it.
    const big = ' '.repeat(5 * 1024 * 1024 + 1) + 'V';
    const json = checkFromStdin(big, ['--json']);
    expect(json.status).toBe(1);
    expect(JSON.parse(json.stdout).code).toBe('ERR_INVALID_ARGUMENT');
    const human = checkFromStdin(big);
    expect(human.status).toBe(1);
    expect(human.stderr + human.stdout).toMatch(/too large/);
  }, SLOW);

  it('still reads a normal expression', () => {
    const r = checkFromStdin('V > B', ['--json']);
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout).data.valid).toBe(true);
  }, SLOW);
});
