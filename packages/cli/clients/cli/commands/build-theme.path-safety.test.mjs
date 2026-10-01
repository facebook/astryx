// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path-safety regression tests for `astryx theme build`.
 *
 * Covers:
 *   - Theme name with `..` segments cannot escape the output directory.
 *   - Theme name with `/` is rejected with a clear error (vs. ENOENT).
 *   - Multi-file write is atomic: if one file fails, none are left behind.
 *   - An `--out` escape, or an output directory that cannot be created, fails
 *     with a registered error code.
 *
 * Runs the CLI in-process (shared runCli harness) against a tiny synthetic theme file.
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {ensureCoreBuilt} from './ensure-core-built.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';
import {themeBuild} from '../../../api/theme/build/build.mjs';
import {AstryxError} from '../../../api/error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';

function writeTheme(dir, name) {
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, 'theme.mjs');
  // Plain object literal so the legacy regex+eval path can parse it
  // without needing jiti / TS, and without depending on @astryxdesign/core being
  // built. The eval path explicitly supports this shape.
  fs.writeFileSync(
    file,
    `export default { name: ${JSON.stringify(name)}, tokens: { '--color-bg': '#fff' } };\n`,
  );
  return file;
}

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-paths-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build path safety', () => {
  it('rejects a theme name containing ../ traversal and writes no JS outside the input dir', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');
    const outside = path.join(tmpDir, 'outside');
    fs.mkdirSync(outside, {recursive: true});

    const themeFile = writeTheme(themesDir, '../../escaped');

    const result = await runCli(
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

  it('rejects a theme name containing /', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');

    const themeFile = writeTheme(themesDir, 'bad/name');

    const result = await runCli(
      ['theme', 'build', path.relative(project, themeFile)],
      project,
    );

    expect(result.code).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/path separator/i);

    // No partial output — neither bad nor bad/name files should exist.
    expect(fs.existsSync(path.join(themesDir, 'bad.js'))).toBe(false);
    expect(fs.existsSync(path.join(themesDir, 'bad', 'name.js'))).toBe(false);
  });

  it('does not leave partial output (no CSS without JS) on a sanitized rejection', async () => {
    const project = path.join(tmpDir, 'project');
    const themesDir = path.join(project, 'themes');

    const themeFile = writeTheme(themesDir, '../leak');

    await runCli(['theme', 'build', path.relative(project, themeFile)], project);

    // Neither the CSS nor any sibling JS should have been written.
    const entries = fs.readdirSync(themesDir).sort();
    expect(entries).toEqual(['theme.mjs']);
  });
});

describe('theme build output-path failures carry registered codes', () => {
  // These reach the output-path step, which runs after CSS generation.
  beforeAll(() => {
    ensureCoreBuilt();
  }, 200_000);

  const registered = new Set(Object.values(ERROR_CODES));

  /** @param {string[]} args @param {string} cwd */
  async function buildJson(args, cwd) {
    const result = await runCli(['--json', 'theme', 'build', ...args], cwd);
    return {result, envelope: JSON.parse(result.stdout)};
  }

  it('reports an --out path outside the project as ERR_PATH_TRAVERSAL', async () => {
    const project = path.join(tmpDir, 'project');
    const themeFile = writeTheme(path.join(project, 'themes'), 'ocean');

    const {result, envelope} = await buildJson(
      [path.relative(project, themeFile), '--out', '../escaped.css'],
      project,
    );

    expect(result.code).toBe(1);
    expect(envelope.code).toBe(ERROR_CODES.ERR_PATH_TRAVERSAL);
    expect(registered.has(envelope.code)).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'escaped.css'))).toBe(false);
  });

  it('reports an --out path that escapes through a symlink as ERR_PATH_TRAVERSAL', async () => {
    const project = path.join(tmpDir, 'project');
    const outside = path.join(tmpDir, 'outside');
    fs.mkdirSync(outside, {recursive: true});
    const themeFile = writeTheme(path.join(project, 'themes'), 'ocean');
    fs.symlinkSync(outside, path.join(project, 'link'), 'dir');

    const {result, envelope} = await buildJson(
      [path.relative(project, themeFile), '--out', 'link/escaped.css'],
      project,
    );

    expect(result.code).toBe(1);
    expect(envelope.code).toBe(ERROR_CODES.ERR_PATH_TRAVERSAL);
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  it('reports an output directory that cannot be created as ERR_WRITE_FAILED', async () => {
    const project = path.join(tmpDir, 'project');
    const themeFile = writeTheme(path.join(project, 'themes'), 'ocean');
    // A regular file where the output directory would have to be created.
    fs.writeFileSync(path.join(project, 'blocker'), '');

    const {result, envelope} = await buildJson(
      [path.relative(project, themeFile), '--out', 'blocker/ocean.css'],
      project,
    );

    expect(result.code).toBe(1);
    expect(envelope.code).toBe(ERROR_CODES.ERR_WRITE_FAILED);
    expect(registered.has(envelope.code)).toBe(true);
  });

  it('themeBuild() rejects an escaping out path with an AstryxError', async () => {
    const project = path.join(tmpDir, 'project');
    const themeFile = writeTheme(path.join(project, 'themes'), 'ocean');

    const build = themeBuild(
      path.relative(project, themeFile),
      {out: '../escaped.css'},
      {cwd: project},
    );

    await expect(build).rejects.toBeInstanceOf(AstryxError);
    await expect(build).rejects.toMatchObject({
      code: ERROR_CODES.ERR_PATH_TRAVERSAL,
    });
  });
});
