// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Asserts `astryx theme build` emits the `--color-data-*` defaults the
 * way the `<Theme>` runtime does — once, at `:root`, in `@layer astryx-base`.
 *
 * Seeding them into the theme's own `@scope` block instead makes every nested
 * `<Theme>` re-declare the default and shadow a parent theme's override, which
 * no other token family does. Layer order is fixed by first declaration, so
 * the base block also has to sit after `@layer reset` and before
 * `@layer astryx-theme` for a consumer who imports this stylesheet alone.
 *
 * Building requires a compiled @astryxdesign/core, so this suite builds core
 * once in beforeAll via the shared ensureCoreBuilt() helper.
 *
 * The build formats the defaults block itself, from the public
 * `dataTokenDefaults` export; core formats it for the runtime. This suite is
 * what keeps those two independent formattings byte-identical.
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
// Core's own generator, imported from source rather than from the package: it
// is deliberately not part of `@astryxdesign/core/theme`'s public surface, and
// this suite is the guard that the build's independent formatting matches it.
import {generateDataTokenDefaultsCSS} from '../../../../core/src/theme/generateThemeRules';
import {dataTokenDefaults as sourceDataTokenDefaults} from '../../../../core/src/theme/domainTokens/dataTokens';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

function writeTheme(dir, name, theme) {
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, `${name}.mjs`);
  fs.writeFileSync(
    file,
    `export default ${JSON.stringify({name, ...theme})};\n`,
  );
  return file;
}

async function buildTheme(tmpDir, name, theme) {
  const project = path.join(tmpDir, 'project');
  const themesDir = path.join(project, 'themes');
  const themeFile = writeTheme(themesDir, name, theme);

  const result = await runCli(
    ['theme', 'build', path.relative(project, themeFile)],
    project,
  );
  expect(result.code).toBe(0);

  return fs.readFileSync(path.join(themesDir, `${name}.css`), 'utf-8');
}

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-data-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build data token output', () => {
  it('emits the defaults once, at :root, in @layer astryx-base', async () => {
    const css = await buildTheme(tmpDir, 'charts-untouched', {
      tokens: {'--color-accent': '#0077B6'},
    });

    const baseStart = css.indexOf('@layer astryx-base');
    expect(baseStart).toBeGreaterThanOrEqual(0);

    const baseBlock = css.slice(baseStart, css.indexOf('@layer astryx-theme'));
    expect(baseBlock).toContain(':root {');
    expect(baseBlock).toContain('--color-data-categorical-blue:');
    expect(baseBlock).toContain('--color-data-gray-1:');
    expect(css.match(/--color-data-categorical-blue:/g)).toHaveLength(1);
    expect(css.match(/@layer astryx-base/g)).toHaveLength(1);
  });

  it('declares astryx-base after reset and before astryx-theme', async () => {
    const css = await buildTheme(tmpDir, 'charts-order', {
      tokens: {'--color-accent': '#0077B6'},
    });

    const reset = css.indexOf('@layer reset');
    const base = css.indexOf('@layer astryx-base');
    const theme = css.indexOf('@layer astryx-theme');

    expect(reset).toBeGreaterThanOrEqual(0);
    expect(base).toBeGreaterThan(reset);
    expect(theme).toBeGreaterThan(base);
  });

  it("puts only the theme's own data token in its scope block", async () => {
    const css = await buildTheme(tmpDir, 'charts-override', {
      tokens: {'--color-data-categorical-blue': '#00A3FF'},
    });

    const themeBlock = css.slice(css.indexOf('@layer astryx-theme'));
    expect(themeBlock).toContain('--color-data-categorical-blue: #00A3FF;');
    expect(themeBlock).not.toContain('--color-data-categorical-orange');
    expect(themeBlock).not.toContain('--color-data-gray-1');
  });

  it('emits the bytes the runtime generator emits', async () => {
    const css = await buildTheme(tmpDir, 'charts-parity', {
      tokens: {'--color-accent': '#0077B6'},
    });

    // The expectation below comes from core's SOURCE; the stylesheet came from
    // core's dist. ensureCoreBuilt() only checks that dist exists, never that
    // it is current, so a dist older than the source would fail the byte
    // comparison with a colour mismatch that reads as formatter drift. Name
    // that case first.
    const {dataTokenDefaults: builtDataTokenDefaults} = await import(
      '@astryxdesign/core/theme'
    );
    expect(
      builtDataTokenDefaults,
      'packages/core/dist is stale — run `pnpm -F @astryxdesign/core build`',
    ).toEqual(sourceDataTokenDefaults);

    // The build formats this block itself, from the public `dataTokenDefaults`
    // export; the runtime formats it in core. Nothing else holds the two
    // together, so compare the bytes — a changed indent or separator in either
    // one fails here.
    const runtimeBase = generateDataTokenDefaultsCSS();
    const marker = '@layer astryx-base {\n';
    const start = css.indexOf(marker);
    expect(start).toBeGreaterThanOrEqual(0);

    const bodyStart = start + marker.length;
    expect(css.slice(bodyStart, bodyStart + runtimeBase.length)).toBe(
      runtimeBase,
    );
    expect(css.slice(bodyStart + runtimeBase.length)).toMatch(/^\n\}/);
  });
});
