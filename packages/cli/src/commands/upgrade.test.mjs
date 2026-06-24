// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {Command} from 'commander';
import {registerUpgrade} from './upgrade.mjs';
import {latestVersion} from '../codemods/registry.mjs';

let tmpDir;
let originalCwd;
let logCalls;
let stdoutCalls;
let exitCode;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-upgrade-test-'));
  originalCwd = process.cwd();
  process.chdir(tmpDir);
  logCalls = [];
  stdoutCalls = [];
  exitCode = undefined;
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    logCalls.push(args.join(' '));
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // @clack/prompts writes directly to process.stdout — capture that too.
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdoutCalls.push(typeof chunk === 'string' ? chunk : chunk.toString());
    return true;
  });
  // jsonError() calls process.exit(1) directly. Trap it so tests can assert.
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    exitCode = code;
    throw new Error(`__exit ${code}`);
  });
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

function createProgram() {
  const program = new Command();
  program.exitOverride();
  // Mirror the global --json flag from src/index.mjs so program.opts().json
  // resolves the same way in tests.
  program.option('--json', 'Output as typed JSON');
  registerUpgrade(program);
  return program;
}

function writePkg(deps) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'fixture', dependencies: deps}, null, 2),
  );
}

/** Run a command and capture the parsed JSON response (last printed JSON line). */
async function runJson(args) {
  const program = createProgram();
  try {
    await program.parseAsync(['node', 'astryx', ...args]);
  } catch (err) {
    if (!String(err?.message || '').startsWith('__exit')) throw err;
  }
  // Find the most recent stringified JSON envelope in console.log output.
  for (let i = logCalls.length - 1; i >= 0; i--) {
    const line = logCalls[i];
    if (line.startsWith('{')) {
      try {
        return JSON.parse(line);
      } catch {
        // not JSON, keep looking
      }
    }
  }
  return null;
}

describe('upgrade gate (semver comparison)', () => {
  it('does NOT block an upgrade from 0.0.9 to 0.0.10 (regression)', async () => {
    // The original bug: string compare said '0.0.9' >= '0.0.10', so the
    // gate told users "Already up to date" without --force.
    writePkg({'@astryxdesign/core': '^0.0.9'});

    const result = await runJson(['--json', 'upgrade', '--to', '0.0.10', '--codemod-only']);
    // Either a real run or "no codemods available" — but never the
    // up-to-date short-circuit (which has no `type` field).
    expect(result).not.toBeNull();
    // The receipt or "no codemods" path should not look like the
    // up-to-date short-circuit (which would return without printing JSON).
    expect(result.type === 'upgrade.run' || result.error || logCalls.some(l => l.includes('No codemods'))).toBeTruthy();
  });

  it('blocks when current >= target by semver (e.g. 0.0.10 → 0.0.9)', async () => {
    writePkg({'@astryxdesign/core': '^0.0.10'});
    const program = createProgram();
    await program.parseAsync(['node', 'astryx', 'upgrade', '--to', '0.0.9']);
    const output = stdoutCalls.join('') + logCalls.join('\n');
    expect(output).toMatch(/up to date|Already/i);
  });
});

describe('upgrade --to validation', () => {
  it('rejects bogus --to values with a structured error', async () => {
    writePkg({'@astryxdesign/core': '^0.0.5'});
    const result = await runJson(['--json', 'upgrade', '--to', 'bogus']);
    expect(result).not.toBeNull();
    expect(result.error).toMatch(/Invalid --to/);
    expect(exitCode).toBe(1);
  });

  it('rejects bogus --from values', async () => {
    writePkg({'@astryxdesign/core': '^0.0.5'});
    const result = await runJson(['--json', 'upgrade', '--from', 'not-a-version', '--to', '0.0.5']);
    expect(result).not.toBeNull();
    expect(result.error).toMatch(/Invalid --from/);
    expect(exitCode).toBe(1);
  });

  it('accepts a valid semver --to', async () => {
    writePkg({'@astryxdesign/core': '^0.0.5'});
    // Don't actually run codemods — codemod-only + a target with no
    // matching transforms is enough to confirm validation passed.
    const result = await runJson(['--json', 'upgrade', '--to', latestVersion, '--codemod-only']);
    // No "Invalid --to" error means validation passed.
    expect(result?.error || '').not.toMatch(/Invalid --to/);
  });
});

describe('upgrade --list dedup', () => {
  it('lists each codemod exactly once', async () => {
    const result = await runJson(['--json', 'upgrade', '--list']);
    expect(result).not.toBeNull();
    expect(result.type).toBe('upgrade.list');
    const names = result.data.map((c) => c.name);
    const unique = new Set(names);
    // The bug: 31 unique codemods printed 9× → 201 entries.
    expect(names.length).toBe(unique.size);
  });
});
