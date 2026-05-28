// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {validateLang, SUPPORTED_LANGS} from './lang.mjs';

describe('validateLang', () => {
  let exitSpy;
  let errSpy;

  beforeEach(() => {
    delete process.__xdsLangWarned;
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit-called');
    });
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('returns lang: null when no flag is passed', () => {
    expect(validateLang({})).toEqual({lang: null});
  });

  it('accepts the supported locales', () => {
    expect(validateLang({lang: 'en'})).toEqual({lang: 'en'});
    expect(validateLang({lang: 'dense'})).toEqual({lang: 'dense'});
  });

  it('rejects unsupported locales with exit(1)', () => {
    expect(() => validateLang({lang: 'fr'})).toThrow('exit-called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errSpy.mock.calls.flat().join(' ')).toMatch(/Unsupported language "fr"/);
  });

  it('warns once when --lang zh is requested (translations incomplete)', () => {
    expect(validateLang({lang: 'zh'})).toEqual({lang: 'zh'});
    expect(errSpy.mock.calls.flat().join(' ')).toMatch(/translations are incomplete/i);

    // Second call in same process: should not warn again.
    errSpy.mockClear();
    validateLang({lang: 'zh'});
    expect(errSpy).not.toHaveBeenCalled();
  });

  it('rejects --lang combined with --zh', () => {
    expect(() => validateLang({lang: 'zh', zh: true})).toThrow('exit-called');
    expect(errSpy.mock.calls.flat().join(' ')).toMatch(/Cannot combine --lang with legacy/);
  });

  it('rejects --lang combined with --dense', () => {
    expect(() => validateLang({lang: 'en', dense: true})).toThrow('exit-called');
  });

  it('uses legacy --zh when --lang is absent', () => {
    expect(validateLang({zh: true})).toEqual({lang: 'zh'});
  });

  it('uses legacy --dense when --lang is absent', () => {
    expect(validateLang({dense: true})).toEqual({lang: 'dense'});
  });

  it('emits a JSON error envelope when --json is set with an unsupported lang', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(() => validateLang({lang: 'fr', json: true})).toThrow('exit-called');
    const out = logSpy.mock.calls.flat().join('');
    const parsed = JSON.parse(out);
    expect(parsed.error).toMatch(/Unsupported language "fr"/);
    logSpy.mockRestore();
  });

  it('exposes the supported lang list', () => {
    expect(SUPPORTED_LANGS).toContain('en');
    expect(SUPPORTED_LANGS).toContain('zh');
    expect(SUPPORTED_LANGS).toContain('dense');
    expect(SUPPORTED_LANGS).not.toContain('fr');
  });
});
