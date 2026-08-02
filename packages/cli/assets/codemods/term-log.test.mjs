// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for term-log.mjs — the CLI's output-only `log` surface
 * for codemods. These lock the documented invariant that keeps the "--json is
 * always valid JSON" contract intact: in --json mode, EVERY `log` helper
 * (message/info/step/success/warn/error) emits ZERO stdout, so a stray codemod
 * log can never corrupt a JSON envelope. A sanity check confirms the helpers DO
 * emit in human mode, so the json-mode silence is meaningful (not a dead spy).
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as p from './term-log.mjs';
import {setJsonMode} from '../../foundation/response/json.mjs';

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

/** Exercise every human-facing emitter the `log` surface exposes. */
function callAllLogHelpers() {
  p.log.message('m');
  p.log.info('i');
  p.log.step('s');
  p.log.success('ok');
  p.log.warn('w');
  p.log.error('e');
}

describe('term-log --json silence', () => {
  it('emits ZERO stdout from every log helper in --json mode', () => {
    setJsonMode(true);
    callAllLogHelpers();
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

  it('every log helper emits exactly one stdout line in human mode', () => {
    setJsonMode(false);
    callAllLogHelpers(); // 6 emitters -> 6 console.log calls
    expect(logSpy).toHaveBeenCalledTimes(6);
  });
});
