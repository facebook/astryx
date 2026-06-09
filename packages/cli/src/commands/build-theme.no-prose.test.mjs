// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression test for `xds theme build --no-prose`.
 *
 * Covers:
 *   - Default build emits the `@layer reset` block with prose mappings
 *     (h1, p, code, hr, …) so unstyled HTML inherits XDS typography.
 *   - `--no-prose` skips that block entirely. Useful when a project ships
 *     its own typography (Tailwind prose, CMS prose styles, etc.) and
 *     wants only the component layer.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/xds.mjs');

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

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-build-theme-no-prose-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build --no-prose', () => {
  it('emits prose mappings by default', () => {
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

    // Prose markers — at least one heading reset and the reset layer
    // should be present in the default build.
    const hasProse =
      /h1\s*,\s*h2/.test(css) ||
      /:is\(h1, h2/.test(css) ||
      /@layer reset/.test(css);
    expect(hasProse).toBe(true);
  });

  it('omits prose mappings when --no-prose is passed', () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const themeFile = writeTheme(themesDir, 'no-prose');

    const result = runCli(
      ['theme', 'build', path.relative(project, themeFile), '--no-prose'],
      project,
    );

    expect(result.code).toBe(0);

    const cssPath = path.join(themesDir, 'no-prose.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    const css = fs.readFileSync(cssPath, 'utf-8');

    // None of the prose markers should appear when --no-prose is set.
    expect(css).not.toMatch(/@layer reset/);
    expect(css).not.toMatch(/:is\(h1, h2, h3/);
    expect(css).not.toMatch(/^\s*h1\s*\{/m);
    expect(css).not.toMatch(/^\s*p\s*\{/m);
    expect(css).not.toMatch(/^\s*hr\s*\{/m);
  });
});
