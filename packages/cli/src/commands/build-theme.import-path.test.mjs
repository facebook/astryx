// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression test for `astryx theme build` install-instructions import paths.
 *
 * Covers the relDir-empty case: when the output directory equals the current
 * working directory, the relative dir is an empty string. Previously this
 * produced a double-slash import path like `from './/<name>'`. The build now
 * collapses the prefix to `./` so the emitted import is `from './<name>'`.
 *
 * Also covers the non-empty subdir case (`./<sub>/<name>`) to guard against
 * regressions in the opposite direction.
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
  const file = path.join(dir, `${name}.mjs`);
  fs.writeFileSync(
    file,
    `export default { name: ${JSON.stringify(name)}, tokens: { '--color-bg': '#fff' } };\n`,
  );
  return file;
}

// `astryx theme build` imports the compiled @astryxdesign/core/theme entry (there is no
// in-CLI fallback generator). Build core once if it isn't already present so
// the suite works in any CI job, regardless of job ordering.
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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-build-theme-import-path-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build install-instructions import path', () => {
  it('emits ./<name> (no double slash) when out dir equals cwd', () => {
    // Source theme lives directly in the project root, so the output dir
    // is the cwd and the relative dir is an empty string.
    const project = path.join(tmpDir, 'project');
    const themeFile = writeTheme(project, 'cwd-theme');

    const result = runCli(
      ['theme', 'build', path.relative(project, themeFile)],
      project,
    );

    expect(result.code).toBe(0);
    // No double slash anywhere in the install instructions.
    expect(result.stdout).not.toContain('.//');
    // Import + css + link paths all use the clean ./<name> form.
    expect(result.stdout).toContain("from './cwd-theme'");
    expect(result.stdout).toContain("import './cwd-theme.css'");
    expect(result.stdout).toContain('href="./cwd-theme.css"');
  });

  it('emits ./<sub>/<name> when out dir is a subdirectory of cwd', () => {
    const project = path.join(tmpDir, 'project');
    const themeFile = writeTheme(path.join(project, 'themes'), 'sub-theme');

    const result = runCli(
      ['theme', 'build', path.relative(project, themeFile)],
      project,
    );

    expect(result.code).toBe(0);
    expect(result.stdout).not.toContain('.//');
    expect(result.stdout).toContain("from './themes/sub-theme'");
    expect(result.stdout).toContain("import './themes/sub-theme.css'");
    expect(result.stdout).toContain('href="./themes/sub-theme.css"');
  });
});
