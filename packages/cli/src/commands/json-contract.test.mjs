// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration tests for the global --json contract.
 *
 * These tests spawn the CLI as a subprocess (the only way to exercise
 * Commander hooks end-to-end) in a tmp directory, then assert:
 *
 *   1. Commands NOT on the JSON_SUPPORTED allowlist reject --json BEFORE
 *      running any side effects (no files written, exit 1, valid JSON
 *      error envelope on stdout).
 *
 *   2. Commands ON the allowlist emit valid JSON envelopes for their
 *      common code paths (success and error).
 *
 *   3. The --version --json variant emits a structured envelope.
 *
 * Spawning a real subprocess (vs. importing program.mjs) is essential
 * because Commander's preAction hooks and process.exit calls only fire
 * during a real .parse() against argv.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../../bin/astryx.mjs');

function runCli(args, {cwd} = {}) {
  const res = spawnSync('node', [CLI_BIN, ...args], {
    cwd: cwd || process.cwd(),
    encoding: 'utf-8',
    timeout: 20_000,
  });
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  };
}

function parseJson(stdout) {
  // CLI emits a single JSON document. If anything else snuck onto stdout
  // (clack output, console.log strings, etc.) JSON.parse will throw —
  // which is exactly the failure mode we want to catch in tests.
  return JSON.parse(stdout);
}

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-json-contract-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('--json contract: rejects before side effects', () => {
  it('astryx init --json --features agents does not write .claude/CLAUDE.md', () => {
    const before = fs.readdirSync(tmpDir);
    expect(before).toEqual([]);

    const {status, stdout} = runCli(['init', '--json', '--features', 'agents'], {cwd: tmpDir});

    // 1. Exit code must be non-zero.
    expect(status).toBe(1);

    // 2. Stdout must be valid JSON with an error envelope.
    const parsed = parseJson(stdout);
    expect(parsed).toHaveProperty('error');
    expect(parsed.error).toMatch(/json/i);
    expect(parsed.error).toMatch(/init/i);

    // 3. CRITICAL — no filesystem mutation took place.
    const after = fs.readdirSync(tmpDir);
    expect(after).toEqual([]);
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.claude/CLAUDE.md'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(false);
  });

  it('astryx init --json --all does not write any files', () => {
    const {status, stdout} = runCli(['init', '--json', '--all'], {cwd: tmpDir});
    expect(status).toBe(1);
    parseJson(stdout); // valid JSON
    expect(fs.readdirSync(tmpDir)).toEqual([]);
  });

  it('astryx gap-report setup --json rejects before prompting', () => {
    const {status, stdout} = runCli(['gap-report', 'setup', '--json'], {cwd: tmpDir});
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed.error).toMatch(/gap-report setup/);
    // No astryx.config.mjs written.
    expect(fs.existsSync(path.join(tmpDir, 'astryx.config.mjs'))).toBe(false);
  });

  it('astryx theme --json (parent, no subcommand) rejects without printing help', () => {
    const {status, stdout, stderr} = runCli(['theme', '--json'], {cwd: tmpDir});
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed.error).toMatch(/theme/);
    // Human help text would mention "Usage:" — must NOT appear on stdout.
    expect(stdout).not.toMatch(/Usage:/);
    expect(stderr).not.toMatch(/Usage:/);
  });

  it('astryx postinstall --json rejects (hidden command not on allowlist)', () => {
    const {status, stdout} = runCli(['postinstall', '--json'], {cwd: tmpDir});
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed).toHaveProperty('error');
  });

  it('error envelope is { error, suggestions? } — never { type, data }', () => {
    const {stdout} = runCli(['init', '--json'], {cwd: tmpDir});
    const parsed = parseJson(stdout);
    expect(parsed).toHaveProperty('error');
    expect(parsed).not.toHaveProperty('type');
    expect(parsed).not.toHaveProperty('data');
  });
});

describe('--json contract: supported commands emit valid envelopes', () => {
  it('astryx --version --json emits { type: "version", data: { version } }', () => {
    const {status, stdout} = runCli(['--version', '--json']);
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.type).toBe('version');
    expect(parsed.data).toHaveProperty('version');
    expect(typeof parsed.data.version).toBe('string');
  });

  it('astryx --json (no subcommand) emits a help envelope', () => {
    const {status, stdout} = runCli(['--json']);
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.type).toBe('help');
    expect(Array.isArray(parsed.data.commands)).toBe(true);
    expect(Array.isArray(parsed.data.jsonSupported)).toBe(true);
  });

  it('astryx gap-report --json --list-categories returns a typed envelope', () => {
    const {status, stdout} = runCli(['gap-report', '--json', '--list-categories'], {cwd: tmpDir});
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.type).toBe('gap-report.categories');
    expect(Array.isArray(parsed.data)).toBe(true);
  });

  it('astryx gap-report --json without required flags emits a structured error (no clack)', () => {
    // Configure gap-report so it doesn't error on "disabled" — we want to
    // hit the "interactive prompt would start" branch.
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      'export default { gapReport: { command: "true" } };\n',
    );
    const {status, stdout} = runCli(['gap-report', '--json'], {cwd: tmpDir});
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed.error).toMatch(/component/i);
    // Must not contain clack-rendered prompt characters.
    expect(stdout).not.toMatch(/Which component/);
  });

  it('astryx upgrade --json --list returns the codemod list', () => {
    const {status, stdout} = runCli(['upgrade', '--json', '--list'], {cwd: tmpDir});
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.type).toBe('upgrade.list');
    expect(Array.isArray(parsed.data)).toBe(true);
  });

  it('astryx upgrade --json (already up to date) emits upgrade.status', () => {
    // Force a no-op range: from > to.
    const {status, stdout} = runCli(
      ['upgrade', '--json', '--from', '99.0.0', '--to', '0.0.1'],
      {cwd: tmpDir},
    );
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.type).toBe('upgrade.status');
    expect(parsed.data.status).toBe('up_to_date');
    expect(parsed.data.from).toBe('99.0.0');
    expect(parsed.data.to).toBe('0.0.1');
  });

  it('astryx discover --json (no config) includes meta.configured=false', () => {
    const {status, stdout} = runCli(['discover', '--json'], {cwd: tmpDir});
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.type).toBe('discover.list');
    expect(parsed.data).toEqual([]);
    expect(parsed.meta).toEqual({configured: false});
  });

  it('astryx template --json emits a typed envelope', () => {
    const {status, stdout} = runCli(['template', '--json'], {cwd: tmpDir});
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.type).toBe('template.list');
    expect(Array.isArray(parsed.data)).toBe(true);
  });

  it('astryx docs --json emits a typed envelope', () => {
    const {status, stdout} = runCli(['docs', '--json'], {cwd: tmpDir});
    expect(status).toBe(0);
    const parsed = parseJson(stdout);
    expect(parsed.type).toMatch(/^docs\./);
  });

  it('astryx doctor --json emits a doctor envelope with checks + summary', () => {
    // Run in a bare tmp dir → @astryxdesign/core won't resolve → a FAIL → exit 1.
    const {status, stdout} = runCli(['doctor', '--json'], {cwd: tmpDir});
    expect(status).toBe(1);
    const parsed = parseJson(stdout);
    expect(parsed.type).toBe('doctor');
    expect(Array.isArray(parsed.data.checks)).toBe(true);
    expect(parsed.data.summary).toHaveProperty('fail');
    expect(parsed.data.summary.fail).toBeGreaterThan(0);
  });
});
