// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Subprocess tests proving the global --detail flag is validated for
 * EVERY command (checklist #1 flag validation + #2 reject-before-side-effects).
 *
 * Before this hardening, `--detail bogus` was silently accepted (exit 0) on
 * discover, docs, swizzle and init — they fell back to 'full'. The central
 * preSubcommand hook in index.mjs now rejects any unrecognized value with
 * exit 1 before the command's action body runs.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliBin = path.resolve(__dirname, '../../bin/xds.mjs');

/**
 * Run the CLI and capture {status, stdout, stderr} without throwing on
 * non-zero exit.
 */
function runCli(args, opts = {}) {
  try {
    const stdout = execFileSync(process.execPath, [cliBin, ...args], {
      env: {...process.env, FORCE_COLOR: '0'},
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...opts,
    });
    return {status: 0, stdout, stderr: ''};
  } catch (e) {
    return {
      status: e.status ?? 1,
      stdout: e.stdout?.toString() ?? '',
      stderr: e.stderr?.toString() ?? '',
    };
  }
}

// Commands that previously fell back silently plus the controls that already
// validated. Every one of these must reject an invalid --detail value.
const INVALID_DETAIL_CASES = [
  ['discover', ['discover']],
  ['docs <topic>', ['docs', 'styling']],
  ['swizzle --list', ['swizzle', '--list']],
  ['init', ['init']],
  ['component --list', ['component', '--list']],
  ['hook --list', ['hook', '--list']],
  ['theme --list', ['theme', '--list']],
];

describe('global --detail validation (subprocess)', () => {
  for (const [label, baseArgs] of INVALID_DETAIL_CASES) {
    it(`${label}: --detail bogus exits 1 with a clear message`, () => {
      const r = runCli([...baseArgs, '--detail', 'bogus']);
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/Invalid --detail value "bogus"/);
      expect(r.stderr).toMatch(/full, compact, brief/);
    });
  }

  it('leading --detail (before the subcommand) is also rejected', () => {
    const r = runCli(['--detail', 'bogus', 'discover']);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/Invalid --detail value "bogus"/);
  });

  it('--json emits a typed { error } envelope and exits 1', () => {
    const r = runCli(['discover', '--detail', 'bogus', '--json']);
    expect(r.status).toBe(1);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.error).toMatch(/Invalid --detail value "bogus"/);
    // No stray stdout noise beyond the JSON envelope.
    expect(r.stdout.trim().startsWith('{')).toBe(true);
  });

  it('a valid --detail value (brief) is accepted (exit 0)', () => {
    const r = runCli(['discover', '--detail', 'brief']);
    expect(r.status).toBe(0);
  });

  it('omitting --detail (default) is accepted (exit 0)', () => {
    const r = runCli(['discover']);
    expect(r.status).toBe(0);
  });
});

describe('--detail validation fires BEFORE side effects (#2)', () => {
  let tmpDir;
  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-detail-init-'));
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'detail-side-test', type: 'module'}),
    );
  });
  afterAll(() => {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  });

  it('init --detail bogus writes no files and exits 1', () => {
    const before = fs.readdirSync(tmpDir).sort();
    const r = runCli(['init', '--detail', 'bogus', '--json'], {cwd: tmpDir});
    expect(r.status).toBe(1);
    const after = fs.readdirSync(tmpDir).sort();
    // No new files/dirs were created by the rejected invocation.
    expect(after).toEqual(before);
  });
});
