// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for `astryx theme build --watch` (#3375).
 *
 * Watch mode runs an initial build, then rebuilds whenever the theme file
 * changes, until interrupted. Each rebuild runs in a child process so a build
 * error (reported by the single-build path via a hard exit) is contained and
 * the watcher keeps running.
 *
 * Building `astryx theme build` requires a compiled @astryxdesign/core, so this
 * suite builds core once in beforeAll (mirrors build-theme.prose.test.mjs).
 */

import {describe, it, expect, beforeAll, beforeEach, afterEach} from 'vitest';
import {execFileSync, spawn} from 'node:child_process';
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

/** Poll until `predicate()` is true or the timeout elapses. */
async function waitFor(predicate, {timeout = 8000, interval = 50} = {}) {
  const start = Date.now();
  for (;;) {
    if (predicate()) return true;
    if (Date.now() - start > timeout) return false;
    await new Promise(r => setTimeout(r, interval));
  }
}

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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-watch-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build --watch', () => {
  it('advertises the flag in --help', () => {
    const result = runCli(['theme', 'build', '--help'], process.cwd());
    const out = result.stdout + result.stderr;
    expect(out).toMatch(/--watch/);
  });

  it('rejects --watch together with --json (single-envelope contract)', () => {
    const themeFile = path.join(tmpDir, 'wt.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'wt', tokens: { '--color-bg': '#fff' } };\n`,
    );
    const result = runCli(
      ['--json', 'theme', 'build', path.relative(tmpDir, themeFile), '--watch'],
      tmpDir,
    );
    expect(result.code).not.toBe(0);
    expect(result.stdout + result.stderr).toMatch(/watch/i);
  });

  it('builds initially, rebuilds on change, and stops cleanly on SIGINT', async () => {
    const themeFile = path.join(tmpDir, 'wt.mjs');
    const cssFile = path.join(tmpDir, 'wt.css');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'wt', tokens: { '--color-bg': '#ffffff' } };\n`,
    );

    const child = spawn(
      process.execPath,
      [CLI_BIN, 'theme', 'build', 'wt.mjs', '--watch'],
      {cwd: tmpDir, env: {...process.env, FORCE_COLOR: '0'}},
    );
    let stdout = '';
    child.stdout.on('data', d => (stdout += d.toString()));
    child.stderr.on('data', d => (stdout += d.toString()));

    try {
      // Initial build produces the CSS.
      const built = await waitFor(() => fs.existsSync(cssFile));
      expect(built).toBe(true);
      const firstCss = fs.readFileSync(cssFile, 'utf-8');
      expect(firstCss).toMatch(/#ffffff/);

      // Wait until the watcher is actually watching before editing, so the
      // change isn't missed.
      await waitFor(() => /Watching/i.test(stdout));

      // Change the theme — the token value changes so the CSS must change.
      fs.writeFileSync(
        themeFile,
        `export default { name: 'wt', tokens: { '--color-bg': '#010203' } };\n`,
      );

      // The rebuilt CSS should reflect the new value.
      const rebuilt = await waitFor(() => {
        try {
          return fs.readFileSync(cssFile, 'utf-8').includes('#010203');
        } catch {
          return false;
        }
      });
      expect(rebuilt).toBe(true);
      expect(stdout).toMatch(/rebuild/i);
    } finally {
      // SIGINT must stop the watcher and exit cleanly.
      child.kill('SIGINT');
    }

    const exited = await new Promise(resolve => {
      let done = false;
      child.on('exit', () => {
        done = true;
        resolve(true);
      });
      setTimeout(() => resolve(done), 4000);
    });
    expect(exited).toBe(true);
    expect(stdout).toMatch(/Stopped watching/);
  }, 30_000);
});
