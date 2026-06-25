// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression test for prose output of `astryx theme build`.
 *
 * `astryx theme build` has a single CSS-generation path — @astryxdesign/core's generator,
 * the same one the <Theme> runtime uses (generateThemeCSS). It always emits
 * prose element defaults (h1–h6, p, small, code, hr) so unstyled HTML inherits
 * the theme's typography, exactly like the runtime. There is intentionally no
 * way to omit them (the old `--no-prose` flag was removed: it let the build
 * emit something the runtime never would, breaking the build⇄runtime parity).
 *
 * Covers:
 *   - prose defaults ship in `@layer reset` (zero-specificity :where()), NOT
 *     `@layer astryx-theme`, so component/Markdown StyleX always wins;
 *   - no raw element margins are emitted (reset.css zeroes them and the
 *     components own block spacing — see the docsite Markdown regression);
 *   - paragraphs use the body font, not the heading font.
 *
 * Building `astryx theme build` requires a compiled @astryxdesign/core (there is no in-CLI
 * fallback generator), so this suite builds core once in beforeAll — mirroring
 * scripts/build-css.test.mjs — to stay self-sufficient regardless of CI job
 * ordering.
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/astryx.mjs');
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const CORE_THEME_ENTRY = path.join(
  REPO_ROOT,
  'packages/core/dist/theme/index.js',
);

function runCli(args, cwd) {
  try {
    const out = execFileSync('node', [CLI_BIN, ...args], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {...process.env, FORCE_COLOR: '0'},
    });
    return {code: 0, stdout: out, stderr: ''};
  } catch (e) {
    return {
      code: e.status ?? 1,
      stdout: e.stdout?.toString() ?? '',
      stderr: e.stderr?.toString() ?? '',
    };
  }
}

function writeTheme(dir, name) {
  fs.mkdirSync(dir, {recursive: true});
  // The CLI writes <basename>.css next to the source file, so use the
  // theme name as the filename for unambiguous fixtures.
  const file = path.join(dir, `${name}.mjs`);
  fs.writeFileSync(
    file,
    `export default { name: ${JSON.stringify(name)}, tokens: { '--color-bg': '#fff' } };\n`,
  );
  return file;
}

// `astryx theme build` imports the compiled @astryxdesign/core/theme entry. Build core
// once if it isn't already present so the suite works in any CI job.
beforeAll(() => {
  if (!fs.existsSync(CORE_THEME_ENTRY)) {
    execFileSync('pnpm', ['-F', '@astryxdesign/core', 'build'], {
      cwd: REPO_ROOT,
      stdio: 'pipe',
      timeout: 180_000,
    });
  }
}, 200_000);

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-prose-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build prose output', () => {
  it('always emits prose mappings in @layer reset', () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(themesDir, 'with-prose');

    const result = runCli(
      ['theme', 'build', path.relative(project, themeFile)],
      project,
    );

    expect(result.code).toBe(0);

    const cssPath = path.join(themesDir, 'with-prose.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    const css = fs.readFileSync(cssPath, 'utf-8');

    // Prose defaults are zero-specificity :where() rules in @layer reset,
    // NOT @layer astryx-theme, so Markdown/component StyleX always wins.
    expect(css).toMatch(/@layer reset/);
    expect(css).toMatch(/:where\(h1, h2, h3, h4, h5, h6\)/);
    // Paragraphs use the body font (regression: they used the heading font).
    expect(css).toMatch(/:where\(p\)[^}]*font-family: var\(--font-family-body\)/);
    // No raw element margins — reset.css + component StyleX own spacing.
    const proseBlock = css.slice(
      css.indexOf('@layer reset'),
      css.indexOf('@layer astryx-theme'),
    );
    expect(proseBlock).not.toMatch(/margin/);

    // Layer placement: prose (reset) must come before component overrides
    // (astryx-theme) so the cascade resolves correctly.
    const resetIndex = css.indexOf('@layer reset');
    const themeIndex = css.indexOf('@layer astryx-theme');
    expect(resetIndex).toBeGreaterThanOrEqual(0);
    expect(themeIndex).toBeGreaterThan(resetIndex);
    expect(css.indexOf(':where(p)')).toBeLessThan(themeIndex);
  });

  it('has no --no-prose flag (prose is non-optional)', () => {
    const result = runCli(['theme', 'build', '--help'], process.cwd());
    // The flag was removed; build always emits prose to match the runtime.
    expect(result.stdout + result.stderr).not.toContain('--no-prose');
  });
});
