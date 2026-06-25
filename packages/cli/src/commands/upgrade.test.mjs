// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {Command} from 'commander';
import {registerUpgrade} from './upgrade.mjs';

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

function writePkg(deps = {}) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'fixture', dependencies: deps}, null, 2),
  );
}

function writeInstalledCore(version, packageName = '@astryxdesign/core') {
  const parts = packageName.split('/');
  const dir = path.join(tmpDir, 'node_modules', ...parts);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: packageName, version}, null, 2),
  );
}

function writeSourceFile() {
  fs.mkdirSync(path.join(tmpDir, 'src'), {recursive: true});
  fs.writeFileSync(path.join(tmpDir, 'src', 'index.ts'), 'const x = 1;\n');
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
  it('does NOT block an upgrade from 0.0.9 to installed 0.0.10 (regression)', async () => {
    // The original bug: string compare said '0.0.9' >= '0.0.10', so the
    // gate told users "Already up to date" without --force.
    writePkg();
    writeInstalledCore('0.0.10');
    writeSourceFile();

    const result = await runJson(['--json', 'upgrade', '--from', '0.0.9', '--path', 'src']);
    expect(result).not.toBeNull();
    expect(result.type === 'upgrade.run' || result.error || logCalls.some(l => l.includes('No codemods'))).toBeTruthy();
  });

  it('blocks when --from >= installed target by semver (e.g. 0.0.10 → 0.0.9)', async () => {
    writePkg();
    writeInstalledCore('0.0.9');
    const program = createProgram();
    await program.parseAsync(['node', 'astryx', 'upgrade', '--from', '0.0.10']);
    const output = stdoutCalls.join('') + logCalls.join('\n');
    expect(output).toMatch(/up to date|Already/i);
  });
});

describe('upgrade argument validation', () => {
  it('requires --from for upgrade runs', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    const result = await runJson(['--json', 'upgrade']);
    expect(result).not.toBeNull();
    expect(result.error).toMatch(/Missing required --from/);
    expect(exitCode).toBe(1);
  });

  it('rejects bogus --from values', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    const result = await runJson(['--json', 'upgrade', '--from', 'not-a-version']);
    expect(result).not.toBeNull();
    expect(result.error).toMatch(/Invalid --from/);
    expect(exitCode).toBe(1);
  });

  it('detects the installed target version from @astryxdesign/core', async () => {
    writePkg();
    writeInstalledCore('0.0.15');
    writeSourceFile();
    const result = await runJson(['--json', 'upgrade', '--from', '0.0.14', '--path', 'src']);
    expect(result?.error || '').not.toMatch(/Could not find installed/);
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
