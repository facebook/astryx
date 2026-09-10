// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * API-contract tests for the font-loading advisory in `themeBuild()` (#5015):
 * a theme that names font families it does not load gets one entry per family
 * in the `theme.build` receipt's `notices` array, on BOTH load paths — a raw
 * typography config (resolved through core's defineTheme) and an
 * already-resolved theme that sets `--font-family-*` tokens directly. Themes
 * that only name generics or known system families say nothing, and the
 * advisory never breaks the API's silence contract (default noopLogger).
 *
 * `notices`, not `warnings`: a theme file cannot load a font — that is the
 * app's job by design — so this fires on correct themes and is context, not a
 * defect to fix. Every assertion here also pins it OUT of `warnings`, since
 * the whole point is that a good theme builds warning-free.
 *
 * Needs a built core — the `node` project's globalSetup
 * (vitest.global-setup.node.mjs) builds it once before workers fork.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {themeBuild} from './build.mjs';

vi.setConfig({testTimeout: 30000});

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-fonts-api-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('themeBuild() — font-loading warnings in the receipt', () => {
  it('warns once per unloaded family for a typography config (heading inherits body without duplicating)', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'fonty.mjs'),
      `export default {
  name: 'fonty',
  typography: {
    body: {family: 'Space Grotesk', fallbacks: 'Arial, sans-serif'},
    code: {family: 'JetBrains Mono'},
  },
};\n`,
    );

    const result = await themeBuild('fonty.mjs', {}, {cwd: tmpDir});

    expect(result?.type).toBe('theme.build');
    const notices = result?.data.notices ?? [];
    expect(notices).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Font "Space Grotesk"'),
        expect.stringContaining('Font "JetBrains Mono"'),
      ]),
    );
    // Heading inherits body's family; the shared family is named exactly once.
    expect(notices.filter(w => w.includes('Space Grotesk'))).toHaveLength(1);
    expect(result?.data.warnings).toEqual([]);
  });

  it('warns for an already-resolved theme: font-family tokens and component overrides, nothing else', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'raw.mjs'),
      `export default {
  name: 'raw',
  tokens: {
    '--font-family-body': '"Bungee", cursive',
    '--font-size-base': '1rem',
  },
  components: {button: {base: {fontFamily: 'Orbitron'}}},
};\n`,
    );

    const result = await themeBuild('raw.mjs', {}, {cwd: tmpDir});

    // Exactly the two named families — a non-family --font-* token must not
    // produce a bogus "Font \\"1rem\\"" entry, and the components half of the
    // feature must survive the real themeBuild path, not just the unit helper.
    const fontNotices = (result?.data.notices ?? []).filter(w =>
      w.startsWith('Font "'),
    );
    expect(fontNotices).toEqual([
      expect.stringContaining('Font "Bungee"'),
      expect.stringContaining('Font "Orbitron"'),
    ]);
    expect(result?.data.warnings).toEqual([]);
  });

  it('warns for a family named only inside a pseudo-class component override (defineTheme path)', async () => {
    // ':hover' blocks are legal override values (generateThemeRules), and the
    // typography path deep-merges author components with generated ones — a
    // webfont hiding at that depth must survive the merge and still warn.
    fs.writeFileSync(
      path.join(tmpDir, 'pseudo.mjs'),
      `export default {
  name: 'pseudo',
  typography: {
    body: {family: 'Helvetica', fallbacks: 'Arial, sans-serif'},
  },
  components: {
    button: {base: {':hover': {fontFamily: '"Rubik Doodle", cursive'}}},
  },
};\n`,
    );

    const result = await themeBuild('pseudo.mjs', {}, {cwd: tmpDir});

    const fontNotices = (result?.data.notices ?? []).filter(w =>
      w.startsWith('Font "'),
    );
    // Exactly the hidden family — Helvetica/Arial are system fonts.
    expect(fontNotices).toEqual([
      expect.stringContaining('Font "Rubik Doodle"'),
    ]);
    expect(result?.data.warnings).toEqual([]);
  });

  it('warns about nothing when every named family is a generic or known system font', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'sys.mjs'),
      `export default {
  name: 'sys',
  tokens: {
    '--color-bg': '#fff',
    '--font-family-body': 'Helvetica, Arial, sans-serif',
  },
};\n`,
    );

    const result = await themeBuild('sys.mjs', {}, {cwd: tmpDir});

    expect(result?.type).toBe('theme.build');
    expect(result?.data.notices).toEqual([]);
    expect(result?.data.warnings).toEqual([]);
  });

  it('stays silent under the default noopLogger even when font notices fire', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'loud.mjs'),
      `export default { name: 'loud', tokens: { '--font-family-body': '"Orbitron", sans-serif' } };\n`,
    );

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const outSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    try {
      const result = await themeBuild('loud.mjs', {}, {cwd: tmpDir});
      expect(result?.data.notices).toEqual(
        expect.arrayContaining([expect.stringContaining('Font "Orbitron"')]),
      );
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
