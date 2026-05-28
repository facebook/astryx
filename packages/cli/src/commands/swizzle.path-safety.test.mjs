// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path-traversal regression tests for `xds swizzle --output`.
 *
 * Spawns the CLI bin with a fake monorepo as cwd and asserts that
 * `--output ../escaped` is rejected with a clear error AND that no
 * file is created outside the project root.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/xds.mjs');

// Build a minimal fake monorepo: <root>/project/ contains a
// node_modules/@xds/core/src/Button so findCoreDir succeeds, and
// <root>/outside/ is the would-be traversal target.
function buildFakeRepo(tmpDir) {
  const project = path.join(tmpDir, 'project');
  const outside = path.join(tmpDir, 'outside');
  const core = path.join(project, 'node_modules', '@xds', 'core');
  const buttonDir = path.join(core, 'src', 'Button');
  fs.mkdirSync(buttonDir, {recursive: true});
  fs.mkdirSync(outside, {recursive: true});
  fs.writeFileSync(
    path.join(buttonDir, 'Button.tsx'),
    `// fake source\nexport const Button = () => null;\n`,
  );
  // Make findCoreDir's heuristic (or its node_modules branch) succeed by
  // also creating packages/core symlink-style structure if needed:
  fs.writeFileSync(path.join(core, 'package.json'), '{"name":"@xds/core"}');
  return {project, outside};
}

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

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-swizzle-paths-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('swizzle path safety', () => {
  it('rejects --output with ../ traversal and writes no file outside root', () => {
    const {project, outside} = buildFakeRepo(tmpDir);

    const result = runCli(
      ['swizzle', 'Button', '--output', '../outside-project', '--no-report'],
      project,
    );

    expect(result.code).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/traversal|outside the project root/i);

    // Hard check: nothing was written outside the project.
    expect(fs.readdirSync(outside)).toEqual([]);
    const escaped = path.join(tmpDir, 'outside-project');
    expect(fs.existsSync(escaped)).toBe(false);
  });

  it('rejects --output with absolute path', () => {
    const {project} = buildFakeRepo(tmpDir);
    const absTarget = path.join(tmpDir, 'absolute-target');

    const result = runCli(
      ['swizzle', 'Button', '--output', absTarget, '--no-report'],
      project,
    );

    expect(result.code).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/absolute paths are not allowed/i);
    expect(fs.existsSync(absTarget)).toBe(false);
  });

  it('requires --overwrite in non-interactive mode when files already exist', () => {
    const {project} = buildFakeRepo(tmpDir);
    const outDir = path.join(project, 'components', 'xds', 'Button');
    fs.mkdirSync(outDir, {recursive: true});
    const existingPath = path.join(outDir, 'Button.tsx');
    fs.writeFileSync(existingPath, '// my customizations\n');

    // Use --json to force non-interactive mode.
    const result = runCli(
      ['--json', 'swizzle', 'Button', '--no-report'],
      project,
    );

    expect(result.code).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/overwrite/i);
    // Existing file unchanged
    expect(fs.readFileSync(existingPath, 'utf-8')).toBe('// my customizations\n');
  });
});
