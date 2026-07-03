// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Command-level tests for `astryx validate-integration` — envelope shape
 * and the no-manifest guidance path.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {Command} from 'commander';

import {registerValidateIntegration} from './validate-integration.mjs';

let tmpDir;
let logCalls;
let prevCwd;
let prevExit;

beforeEach(() => {
  // Temp dir under the repo root so manifest/node_modules paths are within
  // Vite's allowed fs roots.
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-validate-cmd-'));
  logCalls = [];
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    logCalls.push(args.join(' '));
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  prevCwd = process.cwd();
  prevExit = process.exitCode;
  process.exitCode = undefined;
});

afterEach(() => {
  process.chdir(prevCwd);
  process.exitCode = prevExit;
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

function createProgram() {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'Output as typed JSON');
  registerValidateIntegration(program);
  return program;
}

describe('validate-integration — command', () => {
  it('--json emits an integration.validate envelope for a valid package', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '@acme/widgets', version: '1.2.3'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'export default {};\n',
    );
    process.chdir(tmpDir);

    const program = createProgram();
    await program.parseAsync(['node', 'astryx', '--json', 'validate-integration']);

    const parsed = JSON.parse(logCalls.join('\n'));
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.type).toBe('integration.validate');
    expect(parsed.data.name).toBe('@acme/widgets');
    expect(parsed.data.version).toBe('1.2.3');
    expect(Array.isArray(parsed.data.issues)).toBe(true);
    expect(parsed.data.issues).toHaveLength(0);
    expect(process.exitCode).toBeUndefined();
  });

  it('--json envelope carries issues and sets exit 1 on errors', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '@acme/bad', version: '1.0.0'}),
    );
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'export default { templates: "./gone" };\n',
    );
    process.chdir(tmpDir);

    const program = createProgram();
    await program.parseAsync(['node', 'astryx', '--json', 'validate-integration']);

    const parsed = JSON.parse(logCalls.join('\n'));
    expect(parsed.type).toBe('integration.validate');
    expect(parsed.data.issues.some(i => i.code === 'missing_root')).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it('no-arg + no manifest prints guidance and stays exit 0', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'plain'}),
    );
    process.chdir(tmpDir);

    const program = createProgram();
    await program.parseAsync(['node', 'astryx', 'validate-integration']);

    const out = logCalls.join('\n');
    expect(out).toContain('No astryx.integration.* found next to package.json');
    expect(process.exitCode).toBeUndefined();
  });

  it('--json with no manifest yields a null-identity envelope', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'plain'}),
    );
    process.chdir(tmpDir);

    const program = createProgram();
    await program.parseAsync(['node', 'astryx', '--json', 'validate-integration']);

    const parsed = JSON.parse(logCalls.join('\n'));
    expect(parsed.type).toBe('integration.validate');
    expect(parsed.data.name).toBeNull();
    expect(parsed.data.issues).toEqual([]);
  });
});
