// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Direct API tests for `themeBuild()` — the programmatic surface behind
 * `astryx theme build` (`@astryxdesign/cli/api`).
 *
 * The CLI suites (cli/commands/build-theme.*.test.mjs) drive `registerTheme`
 * end-to-end; these assert the API contract you get calling `themeBuild()` in
 * code: the typed `theme.build` receipt (with files actually written to disk),
 * that it honors the `cwd` option, stays SILENT under the default noopLogger,
 * and returns `null` when there is nothing to build.
 *
 * `themeBuild` compiles via @astryxdesign/core's generator, so it needs a built
 * core — the `node` project's globalSetup (vitest.global-setup.node.mjs) builds
 * it once before workers fork.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  generateThemeRulesSplit as mockGenerateThemeRulesSplit,
  generateOnMediaCSS as mockGenerateOnMediaCSS,
} from '@astryxdesign/core/theme';
import {themeBuild} from './build.mjs';

// `themeBuild` captures core's generator once at module load. Wrap the two
// CSS-emitting exports in vi.fn (call-through by default) so the receipt tests
// exercise the REAL generator, while the "nothing to build" test can force an
// empty result for a single call — the only way to reach that branch, since
// core's prose element defaults otherwise always ship a non-empty CSS block.
vi.mock('@astryxdesign/core/theme', async importActual => {
  const actual = /** @type {Record<string, unknown>} */ (await importActual());
  return {
    ...actual,
    generateThemeRulesSplit: vi.fn(actual.generateThemeRulesSplit),
    generateOnMediaCSS: vi.fn(actual.generateOnMediaCSS),
  };
});

vi.setConfig({testTimeout: 30000});

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-build-api-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  // Clear call history only — do NOT restore, which would drop the vi.fn
  // call-through implementations set up in the factory above.
  vi.clearAllMocks();
});

describe('themeBuild() — receipt', () => {
  it('compiles a minimal theme and returns a theme.build receipt with files on disk', async () => {
    const themeFile = path.join(tmpDir, 'apitheme.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'apitheme', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );

    // Resolve `file` against the cwd option (not process.cwd()).
    const result = await themeBuild('apitheme.mjs', {}, {cwd: tmpDir});

    expect(result).not.toBeNull();
    expect(result?.type).toBe('theme.build');
    expect(result?.data.name).toBe('apitheme');
    expect(result?.data.sizeKB).toBeGreaterThan(0);

    // Output paths are cwd-relative and derive from the theme name…
    expect(result?.data.outputs.css).toBe('apitheme.css');
    expect(result?.data.outputs.js).toBe('apitheme.js');
    expect(result?.data.outputs.dts).toBe('apitheme.d.ts');
    // …and every declared output actually exists on disk.
    for (const rel of [
      result?.data.outputs.css,
      result?.data.outputs.js,
      result?.data.outputs.dts,
    ]) {
      expect(
        fs.existsSync(path.join(tmpDir, /** @type {string} */ (rel))),
      ).toBe(true);
    }
  });

  it('is silent by default (noopLogger) — no console output for a scripted caller', async () => {
    const themeFile = path.join(tmpDir, 'quiet.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'quiet', tokens: { '--color-bg': '#fff' } };\n`,
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const outSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    try {
      const result = await themeBuild('quiet.mjs', {}, {cwd: tmpDir});
      expect(result?.type).toBe('theme.build');
      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
      expect(outSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
      warnSpy.mockRestore();
      errSpy.mockRestore();
      outSpy.mockRestore();
    }
  });
});

describe('themeBuild() — nothing to build', () => {
  it('returns null and writes nothing when the generator yields no CSS', async () => {
    const themeFile = path.join(tmpDir, 'empty.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'empty', tokens: {} };\n`,
    );

    // Force the generator to emit nothing for this one build (prose defaults
    // otherwise always ship, so this branch is unreachable with real output).
    mockGenerateThemeRulesSplit.mockReturnValueOnce({component: [], prose: []});
    mockGenerateOnMediaCSS.mockReturnValueOnce('');

    const result = await themeBuild('empty.mjs', {}, {cwd: tmpDir});

    expect(result).toBeNull();
    // Nothing written — the tmp dir still holds only the source fixture.
    expect(fs.readdirSync(tmpDir)).toEqual(['empty.mjs']);
  });
});

describe('themeBuild() — check mode', () => {
  it('reports upToDate with no stale files and writes nothing when outputs match the source', async () => {
    const themeFile = path.join(tmpDir, 'chk.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'chk', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );

    // Build once for real to produce the committed outputs.
    await themeBuild('chk.mjs', {}, {cwd: tmpDir});
    const before = fs.readFileSync(path.join(tmpDir, 'chk.css'), 'utf8');

    const result = await themeBuild('chk.mjs', {check: true}, {cwd: tmpDir});

    expect(result?.type).toBe('theme.build.check');
    expect(result?.data.upToDate).toBe(true);
    expect(result?.data.stale).toEqual([]);
    expect(result?.data.checked).toContain('chk.css');
    // Check mode must not rewrite the file.
    expect(fs.readFileSync(path.join(tmpDir, 'chk.css'), 'utf8')).toBe(before);
  });

  it('flags a stale output when the committed CSS content drifts from the source', async () => {
    const themeFile = path.join(tmpDir, 'drift.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'drift', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );
    await themeBuild('drift.mjs', {}, {cwd: tmpDir});

    // Tamper with the committed CSS (real content change, not just the header).
    const cssPath = path.join(tmpDir, 'drift.css');
    fs.writeFileSync(
      cssPath,
      fs.readFileSync(cssPath, 'utf8') + '\n.injected{}\n',
    );

    const result = await themeBuild('drift.mjs', {check: true}, {cwd: tmpDir});

    expect(result?.data.upToDate).toBe(false);
    expect(
      result?.data.stale.some(
        s => s.path === 'drift.css' && s.reason === 'outdated',
      ),
    ).toBe(true);
  });

  it('flags a missing output', async () => {
    const themeFile = path.join(tmpDir, 'gone.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'gone', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );
    await themeBuild('gone.mjs', {}, {cwd: tmpDir});
    fs.rmSync(path.join(tmpDir, 'gone.css'));

    const result = await themeBuild('gone.mjs', {check: true}, {cwd: tmpDir});

    expect(result?.data.upToDate).toBe(false);
    expect(
      result?.data.stale.some(
        s => s.path === 'gone.css' && s.reason === 'missing',
      ),
    ).toBe(true);
  });

  it('ignores volatile @generated header lines (a differing timestamp is NOT stale)', async () => {
    const themeFile = path.join(tmpDir, 'stamp.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'stamp', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );
    await themeBuild('stamp.mjs', {}, {cwd: tmpDir});

    // Rewrite ONLY the Generated: timestamp line in the committed CSS.
    const cssPath = path.join(tmpDir, 'stamp.css');
    const tampered = fs
      .readFileSync(cssPath, 'utf8')
      .replace(/Generated: .*/, 'Generated: 1999-01-01T00:00:00.000Z');
    fs.writeFileSync(cssPath, tampered);

    const result = await themeBuild('stamp.mjs', {check: true}, {cwd: tmpDir});

    expect(result?.data.upToDate).toBe(true);
    expect(result?.data.stale).toEqual([]);
  });
});
