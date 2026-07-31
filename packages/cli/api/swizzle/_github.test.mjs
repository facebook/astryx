// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Unit tests for `checkGhCli()` — the only export of utils/github.mjs.
 *
 * `checkGhCli` shells out to `gh auth status` via `execFileSync`. These tests
 * mock `node:child_process` so they never depend on `gh` being installed or
 * authenticated in CI, and assert both the success and failure contracts plus
 * the exact (non-shell, static-arg) invocation — the property that keeps this
 * helper injection-free.
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {execFileSync} from 'node:child_process';
import {checkGhCli} from './_github.mjs';

vi.mock('node:child_process', () => ({execFileSync: vi.fn()}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('checkGhCli', () => {
  it('returns true when `gh auth status` succeeds', () => {
    vi.mocked(execFileSync).mockReturnValue(Buffer.from(''));
    expect(checkGhCli()).toBe(true);
  });

  it('invokes gh with a static, non-shell argument array (no injection surface)', () => {
    vi.mocked(execFileSync).mockReturnValue(Buffer.from(''));
    checkGhCli();
    expect(execFileSync).toHaveBeenCalledTimes(1);
    expect(execFileSync).toHaveBeenCalledWith('gh', ['auth', 'status'], {
      stdio: 'ignore',
    });
  });

  it('returns false when gh is missing or unauthenticated (throws)', () => {
    vi.mocked(execFileSync).mockImplementation(() => {
      throw new Error('command not found: gh');
    });
    expect(checkGhCli()).toBe(false);
  });

  it('swallows a non-zero exit (unauthenticated) and returns false', () => {
    vi.mocked(execFileSync).mockImplementation(() => {
      const err = new Error('gh: not logged in');
      /** @type {any} */ (err).status = 1;
      throw err;
    });
    expect(checkGhCli()).toBe(false);
  });
});
