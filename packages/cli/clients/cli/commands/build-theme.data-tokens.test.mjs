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
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
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
    const tokens = {'--color-accent': '#0077B6'};
    const css = await buildTheme(tmpDir, 'charts-parity', {tokens});

    const {defineTheme, generateThemeCSS} = await import(
      '@astryxdesign/core/theme'
    );
    const {base} = generateThemeCSS(
      defineTheme({name: 'charts-parity', tokens}),
    );

    expect(css).toContain(`@layer astryx-base {\n${base}\n}`);
  });
});
