// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for term-log.mjs — the CLI's output-only logger. These
 * lock two documented invariants that keep the "--json is always valid JSON"
 * contract intact and keep programmatic API callers quiet:
 *   1. In --json mode, EVERY human helper (log.message/info/step/success/warn/
 *      error, intro, outro) and the termLogger facade emit ZERO stdout — so a
 *      stray log can never corrupt a JSON envelope.
 *   2. noopLogger is fully silent regardless of json mode — a scripted API call
 *      stays quiet even in human (non --json) mode.
 * A sanity check confirms the helpers DO emit in human mode, so the json-mode
 * silence is meaningful (not a dead spy).
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as p from './term-log.mjs';
import {setJsonMode} from './json.mjs';

let logSpy;
let errSpy;

beforeEach(() => {
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  setJsonMode(false); // never leak json mode into other test files
  logSpy.mockRestore();
  errSpy.mockRestore();
});

/** Exercise every human-facing emitter the module exposes. */
function callAllHumanHelpers() {
  p.log.message('m');
  p.log.info('i');
  p.log.step('s');
  p.log.success('ok');
  p.log.warn('w');
  p.log.error('e');
  p.intro('title');
  p.outro('footer');
}

/** Exercise every method on a CliLogger facade. */
function callAllLoggerMethods(logger) {
  logger.intro('t');
  logger.step('s');
  logger.info('i');
  logger.warn('w');
  logger.success('ok');
  logger.error('e');
  logger.outro('f');
}

describe('term-log --json silence', () => {
  it('emits ZERO stdout from every human helper in --json mode', () => {
    setJsonMode(true);
    callAllHumanHelpers();
    expect(logSpy).not.toHaveBeenCalled();
    expect(errSpy).not.toHaveBeenCalled();
  });

  it('emits ZERO stdout from termLogger in --json mode', () => {
    setJsonMode(true);
    callAllLoggerMethods(p.termLogger);
    expect(logSpy).not.toHaveBeenCalled();
    expect(errSpy).not.toHaveBeenCalled();
  });
});

describe('noopLogger', () => {
  it('is fully silent in --json mode', () => {
    setJsonMode(true);
    callAllLoggerMethods(p.noopLogger);
    expect(logSpy).not.toHaveBeenCalled();
    expect(errSpy).not.toHaveBeenCalled();
  });

  it('is fully silent in human (non --json) mode too', () => {
    setJsonMode(false);
    callAllLoggerMethods(p.noopLogger);
    expect(logSpy).not.toHaveBeenCalled();
    expect(errSpy).not.toHaveBeenCalled();
  });
});

describe('sanity: helpers are live in human mode', () => {
  it('log.success emits to stdout when not in --json mode', () => {
    setJsonMode(false);
    p.log.success('done');
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('✓ done');
  });

  it('every human helper emits exactly one stdout line in human mode', () => {
    setJsonMode(false);
    callAllHumanHelpers(); // 8 emitters -> 8 console.log calls
    expect(logSpy).toHaveBeenCalledTimes(8);
  });
});
