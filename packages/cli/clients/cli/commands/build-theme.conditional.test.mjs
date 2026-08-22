// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Conditional theme layer (`mobile`) through `astryx theme build`.
 *
 * The conditional layer has to work in BOTH distribution modes. The runtime
 * side is covered by core's colocated `conditionalTheme.test.ts`; this suite
 * covers the built side — that `astryx theme build` emits the same `@media`
 * block, in the right layer, after the base rules, and that a theme without a
 * condition still builds with no conditional CSS at all.
 *
 * It also pins the resolution path: a theme file exporting a plain object
 * (rather than a `defineTheme()` result) still gets its `mobile` key resolved,
 * which the build's "already resolved?" heuristic has to account for.
 *
 * Building requires a compiled @astryxdesign/core (there is no in-CLI fallback
 * generator), so the suite builds core once in beforeAll via the shared
 * ensureCoreBuilt() helper.
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

const MOBILE_QUERY = '@media (max-width: 756px) and (pointer: coarse)';

function writeTheme(dir, name, body) {
  fs.mkdirSync(dir, {recursive: true});
  // The CLI writes <basename>.css next to the source file, so use the
  // theme name as the filename for unambiguous fixtures.
  const file = path.join(dir, `${name}.mjs`);
  fs.writeFileSync(file, `export default ${body};\n`);
  return file;
}

async function buildTheme(tmpDir, name, body) {
  const project = path.join(tmpDir, 'project');
  const themesDir = path.join(project, 'themes');
  const themeFile = writeTheme(themesDir, name, body);

  const result = await runCli(
    ['theme', 'build', path.relative(project, themeFile)],
    project,
  );
  expect(result.code).toBe(0);

  const cssPath = path.join(themesDir, `${name}.css`);
  expect(fs.existsSync(cssPath)).toBe(true);
  return fs.readFileSync(cssPath, 'utf-8');
}

beforeAll(() => {
  ensureCoreBuilt();
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-cond-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build — conditional layer', () => {
  it('emits the mobile media block in @layer astryx-theme, after the base rules', async () => {
    const css = await buildTheme(
      tmpDir,
      'cond-mobile',
      `{
        name: 'cond-mobile',
        tokens: {'--spacing-4': '16px'},
        mobile: {tokens: {'--spacing-4': '12px'}},
      }`,
    );

    expect(css).toContain(MOBILE_QUERY);
    // Narrow AND touch — never a width-only query.
    expect(css).not.toMatch(/@media \(max-width: \d+px\)\s*\{/);
    // Scoped to the theme, like every other theme rule.
    expect(css).toContain('@scope ([data-astryx-theme="cond-mobile"])');

    // Precedence is source order: the conditional declaration has to land
    // after the base one, inside the same layer.
    const baseIndex = css.indexOf('--spacing-4: 16px;');
    const conditionalIndex = css.indexOf('--spacing-4: 12px;');
    expect(baseIndex).toBeGreaterThanOrEqual(0);
    expect(conditionalIndex).toBeGreaterThan(baseIndex);
    expect(css.lastIndexOf('@layer astryx-theme')).toBeLessThan(
      conditionalIndex,
    );
  }, 120_000);

  it('honors a configured breakpoint', async () => {
    const css = await buildTheme(
      tmpDir,
      'cond-bp',
      `{
        name: 'cond-bp',
        breakpoints: {mobile: 640},
        mobile: {tokens: {'--spacing-4': '12px'}},
      }`,
    );

    expect(css).toContain('@media (max-width: 640px) and (pointer: coarse)');
    expect(css).not.toContain('756px');
  }, 120_000);

  it('emits no conditional CSS for a theme that declares no condition', async () => {
    const css = await buildTheme(
      tmpDir,
      'cond-none',
      `{name: 'cond-none', tokens: {'--spacing-4': '16px'}}`,
    );

    expect(css).not.toContain('pointer: coarse');
    expect(css).not.toContain('@media');
  }, 120_000);
  it('emits the color-scheme guard when only the condition uses light-dark()', async () => {
    const css = await buildTheme(
      tmpDir,
      'cond-light-dark',
      `{
        name: 'cond-light-dark',
        tokens: {'--spacing-4': '16px'},
        mobile: {tokens: {'--color-text-primary': ['#111', '#eee']}},
      }`,
    );

    // light-dark() only resolves where color-scheme is declared. The base
    // path emits the guard whenever it writes a light-dark() value; a theme
    // that writes one ONLY inside a condition needs it just as much, or the
    // built CSS silently drops the dark half on that path.
    expect(css).toContain('light-dark(#111, #eee)');
    expect(css).toContain(':root { color-scheme: light dark; }');
    expect(css).toContain('html[data-theme="dark"] { color-scheme: dark; }');
    // The guard is declared before the block that needs it.
    expect(css.indexOf(':root { color-scheme: light dark; }')).toBeLessThan(
      css.indexOf('light-dark(#111, #eee)'),
    );
  }, 120_000);

  it('leaves the color-scheme guard out when nothing uses light-dark()', async () => {
    const css = await buildTheme(
      tmpDir,
      'cond-no-light-dark',
      `{
        name: 'cond-no-light-dark',
        tokens: {'--spacing-4': '16px'},
        mobile: {tokens: {'--spacing-4': '12px'}},
      }`,
    );

    // The `:root` guard is what light-dark() needs; the on-media surface
    // rules carry their own color-scheme and always ship.
    expect(css).not.toContain(':root { color-scheme: light dark; }');
    expect(css).not.toContain('light-dark(');
  }, 120_000);

  it('builds a pinned mobile type scale', async () => {
    const css = await buildTheme(
      tmpDir,
      'cond-pin',
      `{
        name: 'cond-pin',
        typography: {scale: {base: 14, ratio: 1.2}},
        mobile: {typography: {scale: {base: 16, pin: 'display-1'}}},
      }`,
    );

    const conditional = css.slice(css.indexOf(MOBILE_QUERY));
    // Body meets the 16px floor (1rem) and Display 1 holds its desktop
    // 42px (2.625rem) — the pin, end to end through the built path.
    expect(conditional).toContain('--font-size-base: 1rem;');
    expect(conditional).toContain('--font-size-5xl: 2.625rem;');
  }, 120_000);
  it('carries the conditional layer into the built artifact', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(
      themesDir,
      'cond-artifact',
      `{
        name: 'cond-artifact',
        typography: {scale: {base: 18, ratio: 1.5}},
        breakpoints: {mobile: 640},
        mobile: {tokens: {'--spacing-4': '12px'}},
      }`,
    );
    const result = await runCli(
      ['theme', 'build', path.relative(project, themeFile)],
      project,
    );
    expect(result.code).toBe(0);

    const js = fs.readFileSync(
      path.join(themesDir, 'cond-artifact.js'),
      'utf-8',
    );
    // A theme that `extends` a built artifact reads these back. Without them
    // the child silently loses its mobile block, and a conditional scale
    // re-derives against the built-in defaults instead of this theme's.
    expect(js).toContain('__conditional');
    expect(js).toContain('(max-width: 640px) and (pointer: coarse)');
    expect(js).toContain('__typeScale');
    expect(js).toContain('__breakpoints');
  }, 120_000);
});
