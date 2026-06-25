// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the interactivity contract.
 *
 * isInteractive() is pure given its injected env, so these are fast unit
 * tests. The "does the command actually fail fast instead of hanging" proof
 * lives in the per-command subprocess tests (init/theme non-interactive).
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {isInteractive, requireInteractive} from './interactive.mjs';

describe('isInteractive', () => {
  it('is true only when stdin AND stdout are TTYs and not CI', () => {
    expect(isInteractive({stdinTTY: true, stdoutTTY: true, ci: false})).toBe(true);
  });

  it('is false when stdin is not a TTY (piped input)', () => {
    expect(isInteractive({stdinTTY: false, stdoutTTY: true, ci: false})).toBe(false);
  });

  it('is false when stdout is not a TTY (piped output)', () => {
    expect(isInteractive({stdinTTY: true, stdoutTTY: false, ci: false})).toBe(false);
  });

  it('is false in CI even with a pseudo-TTY on both streams', () => {
    expect(isInteractive({stdinTTY: true, stdoutTTY: true, ci: true})).toBe(false);
  });
});

describe('requireInteractive', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns (does not exit) when interactive', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit should not be called');
    });
    expect(() =>
      requireInteractive(
        {command: 'init', hint: '`astryx init --all`'},
        {stdinTTY: true, stdoutTTY: true, ci: false},
      ),
    ).not.toThrow();
    expect(exit).not.toHaveBeenCalled();
  });

  it('exits 1 with actionable guidance when non-interactive', () => {
    const exit = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => {
        throw new Error('__exit__');
      });
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      requireInteractive(
        {command: 'theme', hint: '`astryx theme <preset>`'},
        {stdinTTY: false, stdoutTTY: false, ci: false},
      ),
    ).toThrow('__exit__');
    expect(exit).toHaveBeenCalledWith(1);
    const output = err.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/requires a TTY/i);
    expect(output).toMatch(/astryx theme <preset>/);
  });
});
