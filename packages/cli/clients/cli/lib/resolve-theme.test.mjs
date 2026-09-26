// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for resolveTheme: malformed `astryx.theme` values degrade to
 * null (the field is user/third-party-controlled config, so a non-string must
 * not crash `astryx component` with a raw TypeError), the documented file and
 * package setups load and resolve from the PROJECT, and every theme load —
 * file or package alike — obeys the ASTRYX_NO_PROJECT_CODE safe-mode gate.
 */

import {describe, it, expect, afterEach, vi} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveTheme} from './resolve-theme.mjs';

const MODULE_PATH = fileURLToPath(
  new URL('./resolve-theme.mjs', import.meta.url),
);

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

  it('loads the theme guide\'s TypeScript setup ("./src/theme.ts")', async () => {
    // Type syntax that only a TypeScript loader accepts: the `.ts` path must
    // go through the shared jiti loader, not a plain require/import.
    const d = fixture({astryx: {theme: './src/theme.ts'}});
    fs.mkdirSync(path.join(d, 'src'));
    fs.writeFileSync(
      path.join(d, 'src', 'theme.ts'),
      [
        'type Theme = {name: string; variants: Record<string, string[]>};',
        "export const myTheme: Theme = {name: 'ts-theme', variants: {button: ['glow']}};",
        'export default myTheme;',
      ].join('\n'),
    );
    const theme = await resolveTheme(d);
    expect(theme?.name).toBe('ts-theme');
    expect(theme?.variants).toEqual({button: ['glow']});
  });

  it('the TypeScript setup goes through the shared jiti loader, not Node type stripping', () => {
    // Run in a plain Node process (no Vitest transform) with syntax Node's
    // built-in type stripping rejects (`enum` is not erasable), so only the
    // shared jiti loader can produce the theme.
    const d = fixture({astryx: {theme: './src/theme.ts'}});
    fs.mkdirSync(path.join(d, 'src'));
    fs.writeFileSync(
      path.join(d, 'src', 'theme.ts'),
      [
        'enum Tone { Glow = "glow" }',
        "export default {name: 'enum-theme', variants: {button: [Tone.Glow]}};",
      ].join('\n'),
    );
    const script = [
      `const {resolveTheme} = await import(${JSON.stringify(MODULE_PATH)});`,
      `process.stdout.write(JSON.stringify(await resolveTheme(${JSON.stringify(d)})));`,
    ].join('\n');
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '--eval', script],
      {encoding: 'utf8', timeout: 20_000},
    );
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      name: 'enum-theme',
      variants: {button: ['glow']},
      fonts: null,
    });
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
    /**
     * The gate notice is printed once per process, so each test that asserts
     * on it starts from a fresh module instance.
     */
    async function freshResolveTheme() {
      vi.resetModules();
      return (await import('./resolve-theme.mjs')).resolveTheme;
    }

    it('file setup: skipped without executing, with a notice', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const resolve = await freshResolveTheme();
      process.env.ASTRYX_NO_PROJECT_CODE = '1';
      expect(await resolve(fileFixture())).toBeNull();
      expect(globalThis.__astryxThemeProbe).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
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

    it('the notice prints once per process, not once per read', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const resolve = await freshResolveTheme();
      process.env.ASTRYX_NO_PROJECT_CODE = '1';
      const d = fileFixture();
      expect(await resolve(d)).toBeNull();
      expect(await resolve(d)).toBeNull();
      expect(await resolve(packageFixture())).toBeNull();
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('any other value of the variable leaves loading on', async () => {
      process.env.ASTRYX_NO_PROJECT_CODE = '0';
      expect((await resolveTheme(fileFixture()))?.name).toBe('file-theme');
    });
  });
});

describe('resolveTheme — specifiers print without control characters', () => {
  /** @param {ReturnType<typeof vi.spyOn>} warn */
  function expectInertWarnings(warn) {
    expect(warn).toHaveBeenCalled();
    for (const call of warn.mock.calls) {
      const message = call.join(' ');
      expect(message).not.toMatch(/[\p{Cc}\p{Cf}]/u);
      expect(message).toContain('�');
    }
  }

  it('a checkout-controlled package specifier cannot write escape sequences to the TTY', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // `astryx.theme` comes from the checkout; a newline plus an OSC sequence
    // would otherwise land raw in the operator's terminal via the warning.
    const d = fixture({astryx: {theme: '@evil/\u001b]0;owned\u0007\npkg'}});
    expect(await resolveTheme(d)).toBeNull();
    expectInertWarnings(warn);
  });

  it('the same holds for a file specifier and a bare name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(
      await resolveTheme(fixture({astryx: {theme: './\u001b[2Jmissing.mjs'}})),
    ).toBeNull();
    expect(
      await resolveTheme(fixture({astryx: {theme: 'bare\u202ename\r'}})),
    ).toBeNull();
    expect(warn).toHaveBeenCalledTimes(2);
    expectInertWarnings(warn);
  });

  it('the safe-mode notice is inert too', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.resetModules();
    const {resolveTheme: resolve} = await import('./resolve-theme.mjs');
    process.env.ASTRYX_NO_PROJECT_CODE = '1';
    expect(
      await resolve(
        fixture({astryx: {theme: './theme\u001b]0;owned\u0007.ts'}}),
      ),
    ).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expectInertWarnings(warn);
  });
});
