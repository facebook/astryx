// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression guard for the null-options robustness contract.
 *
 * Every exported API function must tolerate `null`/`undefined` in its optional
 * `options` (and trailing context) argument. JS default params only fire for
 * `undefined`, so an explicit `null` used to bypass `options = {}` and throw a
 * raw `TypeError` (no `.code`, no AstryxError) — the largest robustness gap the
 * chaos test found. This suite pins the contract across the whole public
 * surface so a new command can't silently reintroduce it: a null argument must
 * either succeed or throw an AstryxError, never a bare TypeError.
 *
 * The whole suite runs from a throwaway temp cwd: some commands (init) write to
 * the project root, and others resolve @astryxdesign/core by walking up from
 * cwd. An empty temp dir keeps the repo clean and lets core-resolution fail
 * gracefully (ERR_CORE_NOT_FOUND) — either outcome still proves null-tolerance.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as api from './index.mjs';
import {AstryxError} from './error.mjs';

// (name, argsFactory) — args place `null` in the documented options slot (and,
// for two-arg commands, a separate case covers the trailing context slot).
// Earlier positional args are benign real values so the call reaches the
// options handling rather than short-circuiting on a missing subject.
const OPTIONS_CASES = [
  ['component', ['Button', null]],
  ['docs', ['components', undefined, null]],
  ['discover', ['x', null]],
  ['template', ['Card', null]],
  ['themeAdd', ['neutral', null]],
  // A nonexistent file trips the file-not-found guard (AstryxError) before any
  // theme work — enough to prove null options don't raw-crash on `options.out`.
  ['themeBuild', ['/no/such/theme.mjs', null]],
  ['hook', ['useMediaQuery', null]],
  ['search', ['button', null]],
  ['build', ['landing page', null]],
  ['swizzle', ['Button', null]],
  ['upgrade', [null]],
  ['init', [null]],
  ['doctor', [null]],
  ['layoutExpand', ['Box', null]],
  ['layoutCheck', ['Box', null]],
  ['layoutGrammar', [null]],
  ['validateIntegration', ['@acme/x', null]],
];

// Commands that take a trailing context object ({cwd}) after options — the
// context slot has the same null-default trap and must be guarded too.
const CONTEXT_CASES = [
  ['init', [{}, null]],
  ['upgrade', [{list: true}, null]],
  ['themeBuild', ['/no/such/theme.mjs', {}, null]],
];

/** A raw destructure/property-access failure on null — the bug this guards. */
function isRawNullCrash(err) {
  return (
    err instanceof TypeError &&
    /(Cannot destructure|Cannot read properties of null|of 'null'|of null)/.test(
      String(err && err.message),
    )
  );
}

async function expectNoRawCrash(fn, args) {
  try {
    await fn(...args);
  } catch (err) {
    // AstryxError (and anything else that isn't the raw null crash) is fine —
    // the contract is only "never a bare TypeError from a null argument".
    expect(isRawNullCrash(err), `raw null crash: ${err && err.message}`).toBe(
      false,
    );
  }
}

let prevCwd;
let tmpDir;
beforeAll(() => {
  prevCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-null-opts-'));
  process.chdir(tmpDir);
});
afterAll(() => {
  process.chdir(prevCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('API null-options robustness', () => {
  for (const [name, args] of OPTIONS_CASES) {
    it(`${name}() tolerates null options`, async () => {
      const fn = api[name];
      expect(typeof fn).toBe('function');
      await expectNoRawCrash(fn, args);
    });
  }

  for (const [name, args] of CONTEXT_CASES) {
    it(`${name}() tolerates null context`, async () => {
      const fn = api[name];
      expect(typeof fn).toBe('function');
      await expectNoRawCrash(fn, args);
    });
  }

  it('covers every exported command that accepts options', () => {
    // Guard against a new command shipping without a null-tolerance case here.
    // These take no options object, so they need no entry.
    const NO_OPTIONS = new Set([
      'AstryxError',
      'blog',
      'listThemes',
      'themeList',
      'summarizeIssues',
      'logger',
    ]);
    const covered = new Set([...OPTIONS_CASES.map(([n]) => n), ...NO_OPTIONS]);
    const exported = Object.entries(api)
      .filter(([, v]) => typeof v === 'function')
      .map(([k]) => k);
    const missing = exported.filter((n) => !covered.has(n));
    expect(missing, `uncovered exports: ${missing.join(', ')}`).toEqual([]);
  });
});
