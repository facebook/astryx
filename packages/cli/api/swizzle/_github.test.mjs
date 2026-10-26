// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Unit tests for `checkGhCli()` — the only export of _github.mjs.
 *
 * `checkGhCli` finds an executable `gh` on PATH without running it, so a
 * swizzle never waits on a process start or on GitHub. These tests use
 * temporary PATH directories, and mock `node:child_process` to prove it never
 * spawns anything.
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {execFileSync, spawn, spawnSync} from 'node:child_process';
import {checkGhCli} from './_github.mjs';

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(),
  spawn: vi.fn(),
  spawnSync: vi.fn(),
}));

/** @type {string[]} */
const dirs = [];
afterEach(() => {
  vi.clearAllMocks();
  for (const dir of dirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

/** A temporary directory, holding `files` with their modes. */
function dirWith(/** @type {Record<string, number>} */ files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-gh-path-'));
  dirs.push(dir);
  for (const [name, mode] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), '');
    fs.chmodSync(path.join(dir, name), mode);
  }
  return dir;
}

describe('checkGhCli', () => {
  it('finds an executable gh on PATH, without running it', () => {
    const empty = dirWith({});
    const tools = dirWith({gh: 0o755});
    const PATH = [empty, tools].join(path.delimiter);
    expect(checkGhCli({PATH}, 'linux')).toBe(true);
    expect(execFileSync).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it('does not count a gh that cannot be executed, or a directory named gh', () => {
    const plain = dirWith({gh: 0o644});
    const folder = dirWith({});
    fs.mkdirSync(path.join(folder, 'gh'));
    expect(
      checkGhCli({PATH: [plain, folder].join(path.delimiter)}, 'linux'),
    ).toBe(false);
  });

  it('is false with no gh on PATH, or no PATH', () => {
    expect(checkGhCli({PATH: dirWith({git: 0o755})}, 'linux')).toBe(false);
    expect(checkGhCli({}, 'linux')).toBe(false);
  });

  it('on Windows, finds gh with a PATHEXT extension', () => {
    const tools = dirWith({'gh.exe': 0o644});
    expect(checkGhCli({PATH: tools, PATHEXT: '.COM;.EXE'}, 'win32')).toBe(true);
    expect(checkGhCli({PATH: tools, PATHEXT: '.CMD'}, 'win32')).toBe(false);
  });
});
