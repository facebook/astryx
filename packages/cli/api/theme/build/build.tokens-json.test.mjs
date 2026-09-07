// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Tests for the opt-in `{tokens: true}` / `--tokens` output of `themeBuild()`
 * (see #5923): a `<name>.tokens.json` dump of the theme's resolved CSS custom
 * properties, for syncing into tooling outside the runtime (for example, a
 * design tool's variables).
 *
 * Companion to build.test.mjs; split out because it exercises a single
 * concern (the JSON dump) across several thin cases rather than the general
 * receipt contract.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {themeBuild} from './build.mjs';

vi.setConfig({testTimeout: 30000});

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-build-tokens-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/**
 * A theme fixture that `import {defineTheme} from '@astryxdesign/core/theme'`
 * — the way a real theme file does — has to sit somewhere that specifier
 * resolves; an OS temp dir has no node_modules above it, so `jiti` fails to
 * import it and `themeBuild()` silently falls back to its regex/eval legacy
 * extractor, which reads the raw object literal without ever invoking
 * `defineTheme()` — so a `[light, dark]` tuple never gets converted to
 * `light-dark(...)`. (Same gotcha documented in build.test.mjs's `— extends`
 * describe block.) Fixtures that actually need `defineTheme()` to run go in
 * `resolvedDir` instead of `tmpDir`.
 */
let resolvedDir;
beforeEach(() => {
  resolvedDir = fs.mkdtempSync(
    path.join(path.resolve(import.meta.dirname, '../../..'), '.tmp-tokens-'),
  );
});
afterEach(() => {
  fs.rmSync(resolvedDir, {recursive: true, force: true});
});

describe('themeBuild({tokens: true})', () => {
  it('does not write a tokens.json file by default', async () => {
    const themeFile = path.join(tmpDir, 'notokens.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'notokens', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );

    const result = await themeBuild('notokens.mjs', {}, {cwd: tmpDir});

    expect(result?.data.outputs.tokensJson).toBeUndefined();
    expect(fs.existsSync(path.join(tmpDir, 'notokens.tokens.json'))).toBe(
      false,
    );
  });

  it('writes <name>.tokens.json with resolved tokens when {tokens: true}', async () => {
    const themeFile = path.join(resolvedDir, 'withtokens.mjs');
    // Authored via defineTheme() — as every real theme is — so the
    // [light, dark] tuple actually goes through resolution. See the
    // resolvedDir comment above for why this can't live in an OS temp dir.
    fs.writeFileSync(
      themeFile,
      `import {defineTheme} from '@astryxdesign/core/theme';
      export default defineTheme({
        name: 'withtokens',
        tokens: { '--color-accent': ['#0077b6', '#48cae4'] },
      });\n`,
    );

    const result = await themeBuild(
      'withtokens.mjs',
      {tokens: true},
      {cwd: resolvedDir},
    );

    expect(result?.data.outputs.tokensJson).toBe('withtokens.tokens.json');
    const jsonPath = path.join(resolvedDir, 'withtokens.tokens.json');
    expect(fs.existsSync(jsonPath)).toBe(true);

    const dump = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    expect(dump.name).toBe('withtokens');
    // Values are the fully resolved CSS the runtime/CSS output use — a
    // light/dark pair becomes light-dark(), not the raw two-element array —
    // so a reader never has to duplicate theme-resolution logic.
    expect(dump.tokens['--color-accent']).toBe(
      'light-dark(#0077b6, #48cae4)',
    );
    expect(dump.localTokens).toEqual({});
    expect(dump.$generated.by).toBe('astryx theme build --tokens');
    expect(dump.$generated.source).toBe('withtokens.mjs');
  });

  it('includes localTokens in the dump', async () => {
    const themeFile = path.join(resolvedDir, 'localtokens.mjs');
    fs.writeFileSync(
      themeFile,
      `import {defineTheme} from '@astryxdesign/core/theme';
      export default defineTheme({
        name: 'localtokens',
        localTokens: {
          '--astryx-theme-localtokens-color-status-fill-accent': ['#0077b6', '#48cae4'],
        },
        components: {
          badge: {
            'variant:info': {
              backgroundColor: 'var(--astryx-theme-localtokens-color-status-fill-accent)',
            },
          },
        },
      });\n`,
    );

    const result = await themeBuild(
      'localtokens.mjs',
      {tokens: true},
      {cwd: resolvedDir},
    );

    const dump = JSON.parse(
      fs.readFileSync(
        path.join(
          resolvedDir,
          /** @type {string} */ (result?.data.outputs.tokensJson),
        ),
        'utf8',
      ),
    );
    expect(
      dump.localTokens['--astryx-theme-localtokens-color-status-fill-accent'],
    ).toBe('light-dark(#0077b6, #48cae4)');
  });

  it('reports a missing tokens.json as stale under --check', async () => {
    const themeFile = path.join(tmpDir, 'checked.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'checked', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );

    // Build without --tokens first (no tokens.json on disk yet), then run
    // --check WITH --tokens: the dump is expected but absent, so it must
    // show up as a missing output rather than being silently skipped.
    await themeBuild('checked.mjs', {}, {cwd: tmpDir});
    const checkResult = await themeBuild(
      'checked.mjs',
      {tokens: true, check: true},
      {cwd: tmpDir},
    );

    expect(checkResult?.type).toBe('theme.build.check');
    expect(checkResult?.data.upToDate).toBe(false);
    expect(checkResult?.data.stale).toContainEqual({
      path: 'checked.tokens.json',
      reason: 'missing',
    });
  });

  it('is stable across rebuilds with identical input (no spurious drift)', async () => {
    const themeFile = path.join(tmpDir, 'stable.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'stable', tokens: { '--color-bg': '#0a0a0a' } };\n`,
    );

    await themeBuild('stable.mjs', {tokens: true}, {cwd: tmpDir});
    // Rebuild with a differently-shaped invocation (an explicit --out
    // wouldn't apply here since tokens.json is keyed off outDir/baseName,
    // but re-running itself must not perturb the file it just wrote).
    const second = await themeBuild(
      'stable.mjs',
      {tokens: true, check: true},
      {cwd: tmpDir},
    );

    expect(second?.data.upToDate).toBe(true);
    expect(second?.data.stale).toEqual([]);
  });
});
