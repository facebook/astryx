// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {runCliInProcess} from './run-in-process.mjs';

/** @type {string[]} */
const scratch = [];

afterEach(() => {
  for (const dir of scratch.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

function cwd() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-in-process-'));
  scratch.push(dir);
  return dir;
}

function streams() {
  /** @type {string[]} */
  const stdout = [];
  /** @type {string[]} */
  const stderr = [];
  return {
    stdout,
    stderr,
    options: {
      stdout: {write: chunk => stdout.push(chunk)},
      stderr: {write: chunk => stderr.push(chunk)},
    },
  };
}

describe('runCliInProcess', () => {
  it('runs repeatedly and restores caller process state', async () => {
    const original = {
      cwd: process.cwd(),
      argv: process.argv,
      exit: process.exit,
      exitCode: process.exitCode,
      stdoutWrite: process.stdout.write,
      stderrWrite: process.stderr.write,
      log: console.log,
      error: console.error,
    };

    for (const dir of [cwd(), cwd()]) {
      const output = streams();
      const status = await runCliInProcess(['--version', '--json'], {
        cwd: dir,
        ...output.options,
      });
      expect(status).toBe(0);
      expect(output.stderr).toEqual([]);
      expect(JSON.parse(output.stdout.join(''))).toMatchObject({
        apiVersion: 1,
        type: 'version',
      });
      expect(process.cwd()).toBe(original.cwd);
      expect(process.argv).toBe(original.argv);
      expect(process.exit).toBe(original.exit);
      expect(process.exitCode).toBe(original.exitCode);
      expect(process.stdout.write).toBe(original.stdoutWrite);
      expect(process.stderr.write).toBe(original.stderrWrite);
      expect(console.log).toBe(original.log);
      expect(console.error).toBe(original.error);
    }
  });

  it('restores state when setup fails before Commander runs', async () => {
    const original = {
      cwd: process.cwd(),
      argv: process.argv,
      exit: process.exit,
      stdoutWrite: process.stdout.write,
      stderrWrite: process.stderr.write,
    };
    const output = streams();
    const missing = path.join(cwd(), 'missing');

    expect(
      await runCliInProcess(['--version'], {
        cwd: missing,
        ...output.options,
      }),
    ).toBe(1);
    expect(output.stderr.join('')).toContain('ENOENT');
    expect(process.cwd()).toBe(original.cwd);
    expect(process.argv).toBe(original.argv);
    expect(process.exit).toBe(original.exit);
    expect(process.stdout.write).toBe(original.stdoutWrite);
    expect(process.stderr.write).toBe(original.stderrWrite);

    expect(
      await runCliInProcess(['--version', '--json'], {
        cwd: cwd(),
        ...streams().options,
      }),
    ).toBe(0);
  });

  it('refuses an overlapping invocation without corrupting the first', async () => {
    const firstOutput = streams();
    const first = runCliInProcess(['--version', '--json'], {
      cwd: cwd(),
      ...firstOutput.options,
    });
    await expect(
      runCliInProcess(['--version', '--json'], {
        cwd: cwd(),
        ...streams().options,
      }),
    ).rejects.toThrow(/already running/);
    expect(await first).toBe(0);
    expect(JSON.parse(firstOutput.stdout.join('')).type).toBe('version');
  });
});
