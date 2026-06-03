// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path-safety regression tests for `xds theme build`.
 *
 * Covers:
 *   - Theme name with `..` segments cannot escape the output directory.
 *   - Theme name with `/` is rejected with a clear error (vs. ENOENT).
 *   - Multi-file write is atomic: if one file fails, none are left behind.
 *
 * Runs the CLI via execFileSync against a tiny synthetic theme file.
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
  const file = path.join(dir, 'theme.mjs');
  // Plain object literal so the legacy regex+eval path can parse it
  // without needing jiti / TS, and without depending on @xds/core being
  // built. The eval path explicitly supports this shape.
  fs.writeFileSync(
    file,
    `export default { name: ${JSON.stringify(name)}, tokens: { '--color-bg': '#fff' } };\n`,
  );
  return file;
}

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-build-theme-paths-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build path safety', () => {
  it('rejects a theme name containing ../ traversal and writes no JS outside the input dir', () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const outside = path.join(tmpDir, 'outside');
    fs.mkdirSync(outside, {recursive: true});

    const themeFile = writeTheme(themesDir, '../../escaped');

    const result = runCli(
      ['theme', 'build', path.relative(project, themeFile)],
      project,
    );

    expect(result.code).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/path separator|invalid theme name/i);

    // The traversal target must not exist.
    expect(fs.existsSync(path.join(tmpDir, 'escaped.js'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, 'escaped.css'))).toBe(false);
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  it('rejects a theme name containing /', () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');

    const themeFile = writeTheme(themesDir, 'bad/name');

    const result = runCli(
      ['theme', 'build', path.relative(project, themeFile)],
      project,
    );

    expect(result.code).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/path separator/i);

    // No partial output — neither bad nor bad/name files should exist.
    expect(fs.existsSync(path.join(themesDir, 'bad.js'))).toBe(false);
    expect(fs.existsSync(path.join(themesDir, 'bad', 'name.js'))).toBe(false);
  });

  it('does not leave partial output (no CSS without JS) on a sanitized rejection', () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');

    const themeFile = writeTheme(themesDir, '../leak');

    runCli(['theme', 'build', path.relative(project, themeFile)], project);

    // Neither the CSS nor any sibling JS should have been written.
    const entries = fs.readdirSync(themesDir).sort();
    expect(entries).toEqual(['theme.mjs']);
  });
});
