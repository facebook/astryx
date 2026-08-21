// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * API-contract tests for the contrast-pair warning in `themeBuild()` (#5014):
 * a theme that hand-writes one side of a colour pair and leaves the other
 * generated gets an entry in the `theme.build` receipt's `warnings` array.
 *
 * `warnings`, not `notices` (which is where the font advisory landed): this is
 * the theme's own defect and fixable in the theme file, so a good theme still
 * builds warning-free.
 *
 * What only an end-to-end build can prove — and what the unit tests beside
 * this file cannot — is that the check receives a theme carrying
 * `__inputTokens`. The build has two loaders: jiti (returns the DefinedTheme,
 * which has them) and a legacy eval fallback for theme files that cannot be
 * imported (returns the raw INPUT, which does not). The fallback path is the
 * common one for a theme built outside this repo, where
 * `@astryxdesign/core/theme` does not resolve — and on it the check was
 * silently dead until build.mjs re-minted the input.
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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-contrast-api-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/** @param {string} name @param {string} source */
async function build(name, source) {
  fs.writeFileSync(path.join(tmpDir, name), source);
  return themeBuild(name, {}, {cwd: tmpDir});
}

const contrastWarnings = result =>
  (result?.data.warnings ?? []).filter(w => /below \d/.test(w));

describe('themeBuild() — contrast-pair warnings in the receipt', () => {
  it('warns when a scale-config theme overrides an accent but not its on-colour', async () => {
    // The #5047 case, reproduced: `color: {accent}` generates the pair, then
    // `tokens` replaces only the accent, leaving an on-accent tuned for the
    // colour that is no longer there.
    const result = await build(
      'bedside.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';
       export default defineTheme({
         name: 'bedside',
         color: {accent: '#0064E0', neutralStyle: 'warm', contrast: 'high'},
         tokens: {'--color-accent': ['#0064E0', '#1E6FE0']},
       });\n`,
    );

    const warnings = contrastWarnings(result);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/label on the accent fill/);
    expect(warnings[0]).toMatch(/in dark mode/);
    expect(warnings[0]).toMatch(/you set --color-accent but left --color-on-accent/);
    // Not a notice: this one is the theme's to fix.
    expect(result?.data.notices ?? []).not.toContain(warnings[0]);
  });

  it('warns on a plain-object theme, which loads through the legacy fallback', async () => {
    // No defineTheme call and no resolvable import: `extractThemeDefinition`
    // falls back to eval and hands back an object with no `__inputTokens`.
    const result = await build(
      'plain.mjs',
      `export default {
         name: 'plain',
         tokens: {'--color-error': '#FF8A8A'},
       };\n`,
    );

    const warnings = contrastWarnings(result);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toMatch(/label on the error fill/);
    expect(warnings[0]).toMatch(/left --color-on-error/);
  });

  it('says nothing about a theme that leaves the colour scale alone', async () => {
    const result = await build(
      'clean.mjs',
      `import {defineTheme} from '@astryxdesign/core/theme';
       export default defineTheme({
         name: 'clean',
         color: {accent: '#7A2A2A', neutralStyle: 'warm'},
         radius: {base: 4, multiplier: 0.5},
       });\n`,
    );

    expect(contrastWarnings(result)).toEqual([]);
  });

  it('says nothing when the theme sets both sides of the pair itself', async () => {
    const result = await build(
      'both.mjs',
      `export default {
         name: 'both',
         tokens: {'--color-accent': '#7FC9B8', '--color-on-accent': '#FFFFFF'},
       };\n`,
    );

    expect(contrastWarnings(result)).toEqual([]);
  });

  it('stays silent under the default noopLogger', async () => {
    // The API's silence contract: a warning in the receipt must not print.
    const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      await build(
        'quiet.mjs',
        `export default {name: 'quiet', tokens: {'--color-error': '#FF8A8A'}};\n`,
      );
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});
