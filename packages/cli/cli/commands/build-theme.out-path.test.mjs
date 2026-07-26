// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `--out` contract tests for `astryx theme build`.
 *
 * `--out` names the CSS file, but every other emitted artifact (.js, .d.ts,
 * .variants.d.ts) is written to that path's *dirname*. Adoption feedback
 * (#4276) reported the old help text — "Output CSS file path" — reads as
 * CSS-only, so people leave the .js beside a .ts theme source and a bundler
 * with `extensionAlias` silently resolves the source instead of the build.
 *
 * Covers:
 *   - `--help` describes --out as covering all theme artifacts.
 *   - `--out` actually relocates the whole artifact set, not just the CSS.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/astryx.mjs');

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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-build-theme-out-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('theme build --out', () => {
  it('help text describes --out as covering all theme artifacts, not just CSS (#4276)', () => {
    const result = runCli(['theme', 'build', '--help'], process.cwd());
    const out = result.stdout + result.stderr;
    const line = out.split('\n').find(l => l.includes('--out'));
    expect(line).toBeDefined();
    // The old wording ("Output CSS file path") reads as CSS-only.
    expect(line).not.toMatch(/Output CSS file path/);
    expect(line).toMatch(/all theme artifacts/);
  });

  it('relocates every artifact to the --out dirname, not just the CSS', () => {
    const srcDir = path.join(tmpDir, 'src', 'theme');
    fs.mkdirSync(srcDir, {recursive: true});
    const themeFile = path.join(srcDir, 'brand.mjs');
    fs.writeFileSync(
      themeFile,
      `export default { name: 'brand', tokens: { '--color-bg': '#fff' } };\n`,
    );

    const outCss = path.join(tmpDir, 'public', 'css', 'brand.css');
    const result = runCli(
      ['theme', 'build', path.relative(tmpDir, themeFile), '--out', path.relative(tmpDir, outCss)],
      tmpDir,
    );
    expect(result.code).toBe(0);

    const outDir = path.dirname(outCss);
    expect(fs.existsSync(outCss)).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'brand.js'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'brand.d.ts'))).toBe(true);

    // Nothing may be left beside the source — that co-location is the trap.
    expect(fs.existsSync(path.join(srcDir, 'brand.js'))).toBe(false);
    expect(fs.existsSync(path.join(srcDir, 'brand.css'))).toBe(false);
    expect(fs.existsSync(path.join(srcDir, 'brand.d.ts'))).toBe(false);
  });
});
