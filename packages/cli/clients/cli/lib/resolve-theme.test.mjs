// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for resolveTheme: malformed `astryx.theme` values degrade to
 * null (the field is user/third-party-controlled config, so a non-string must
 * not crash `astryx component` with a raw TypeError), the documented file and
 * package setups load and resolve from the PROJECT, and every theme load —
 * file or package alike — obeys the ASTRYX_NO_PROJECT_CODE safe-mode gate.
 */

import {describe, it, expect, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {resolveTheme} from './resolve-theme.mjs';

const dirs = [];
function fixture(pkg) {
  // Repo-local temp dir: Vite blocks dynamic import from /tmp.
  const d = fs.mkdtempSync(path.join(process.cwd(), '.astryx-resolve-theme-'));
  dirs.push(d);
  fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify(pkg));
  return d;
}
afterEach(() => {
  delete process.env.ASTRYX_THEME;
  delete process.env.ASTRYX_NO_PROJECT_CODE;
  delete globalThis.__astryxThemeProbe;
  vi.restoreAllMocks();
  while (dirs.length) fs.rmSync(dirs.pop(), {recursive: true, force: true});
});

describe('resolveTheme — malformed astryx.theme degrades to null', () => {
  it('numeric theme → null', async () => {
    expect(await resolveTheme(fixture({astryx: {theme: 123}}))).toBeNull();
  });
  it('array theme → null', async () => {
    expect(await resolveTheme(fixture({astryx: {theme: ['a']}}))).toBeNull();
  });
  it('object theme → null', async () => {
    expect(await resolveTheme(fixture({astryx: {theme: {x: 1}}}))).toBeNull();
  });
  it('boolean theme → null', async () => {
    expect(await resolveTheme(fixture({astryx: {theme: true}}))).toBeNull();
  });
  it('empty-string theme → null', async () => {
    expect(await resolveTheme(fixture({astryx: {theme: ''}}))).toBeNull();
  });
  it('no theme field → null', async () => {
    expect(await resolveTheme(fixture({name: 'p'}))).toBeNull();
  });
});

describe('resolveTheme — documented setups resolve from the project', () => {
  /** The theme guide's file setup: astryx.theme names a checkout file. */
  function fileFixture(themeValue = './theme.mjs') {
    const d = fixture({astryx: {theme: themeValue}});
    fs.writeFileSync(
      path.join(d, 'theme.mjs'),
      `globalThis.__astryxThemeProbe = true;\nexport default {name: 'file-theme', variants: {button: ['solid']}};\n`,
    );
    return d;
  }

  /** A theme package installed in the PROJECT's node_modules. */
  function packageFixture() {
    const d = fixture({astryx: {theme: '@acme/theme'}});
    const pkgDir = path.join(d, 'node_modules', '@acme', 'theme');
    fs.mkdirSync(pkgDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({
        name: '@acme/theme',
        version: '1.0.0',
        main: 'index.cjs',
      }),
    );
    fs.writeFileSync(
      path.join(pkgDir, 'index.cjs'),
      `globalThis.__astryxThemeProbe = true;\nmodule.exports = {name: 'pkg-theme', variants: {badge: ['dot']}};\n`,
    );
    return d;
  }

  it('loads the documented file setup relative to cwd', async () => {
    const theme = await resolveTheme(fileFixture());
    expect(theme?.name).toBe('file-theme');
    expect(theme?.variants).toEqual({button: ['solid']});
  });

  it("resolves a package from the project's node_modules, not the CLI's", async () => {
    // The CLI's own dependency tree has no @acme/theme; only the fixture
    // project does, so a hit proves project-bound resolution.
    const theme = await resolveTheme(packageFixture());
    expect(theme?.name).toBe('pkg-theme');
  });

  it('still loads a file named via ASTRYX_THEME', async () => {
    const d = fileFixture();
    fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({name: 'p'}));
    process.env.ASTRYX_THEME = './theme.mjs';
    const theme = await resolveTheme(d);
    expect(theme?.name).toBe('file-theme');
  });

  describe('under ASTRYX_NO_PROJECT_CODE=1 no theme module loads at all', () => {
    it('file setup: skipped without executing, with a notice', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      process.env.ASTRYX_NO_PROJECT_CODE = '1';
      expect(await resolveTheme(fileFixture())).toBeNull();
      expect(globalThis.__astryxThemeProbe).toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('ASTRYX_NO_PROJECT_CODE'),
      );
    });

    it('package setup: skipped without executing', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      process.env.ASTRYX_NO_PROJECT_CODE = '1';
      expect(await resolveTheme(packageFixture())).toBeNull();
      expect(globalThis.__astryxThemeProbe).toBeUndefined();
    });

    it('ASTRYX_THEME too — the gate wins over the operator variable', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const d = fileFixture();
      process.env.ASTRYX_THEME = './theme.mjs';
      process.env.ASTRYX_NO_PROJECT_CODE = '1';
      expect(await resolveTheme(d)).toBeNull();
      expect(globalThis.__astryxThemeProbe).toBeUndefined();
    });
  });
});

describe('resolveTheme — specifiers print without control characters', () => {
  it('a checkout-controlled specifier cannot write escape sequences to the TTY', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // `astryx.theme` comes from the checkout; a newline plus an OSC sequence
    // would otherwise land raw in the operator's terminal via the warning.
    const d = fixture({astryx: {theme: '@evil/\u001b]0;owned\u0007\npkg'}});
    expect(await resolveTheme(d)).toBeNull();
    expect(warn).toHaveBeenCalled();
    for (const call of warn.mock.calls) {
      const message = call.join(' ');
      expect(message).not.toMatch(/\p{Cc}/u);
      expect(message).toContain('�');
    }
  });
});
