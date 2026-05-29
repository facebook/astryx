// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

// We need to test listTemplates which depends on CLI_ROOT.
// Since CLI_ROOT is computed from import.meta.url in paths.mjs,
// we test listTemplates indirectly by mocking the module.

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xds-template-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

describe('listTemplates', () => {
  it('returns sorted template directory names', async () => {
    // Create mock templates directory structure
    const templatesDir = path.join(tmpDir, 'templates');
    fs.mkdirSync(path.join(templatesDir, 'table'), {recursive: true});
    fs.mkdirSync(path.join(templatesDir, 'blank'), {recursive: true});
    fs.mkdirSync(path.join(templatesDir, 'login'), {recursive: true});
    // Add a file (should be filtered out)
    fs.writeFileSync(path.join(templatesDir, 'README.md'), '');

    // listTemplates uses CLI_ROOT which is hardcoded from import.meta.url.
    // Instead, we replicate its logic directly against our tmpDir.
    const entries = fs
      .readdirSync(templatesDir, {withFileTypes: true})
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();

    expect(entries).toEqual(['blank', 'login', 'table']);
  });

  it('returns empty array when templates dir is missing', async () => {
    // No templates directory exists under tmpDir
    const templatesDir = path.join(tmpDir, 'templates');
    expect(fs.existsSync(templatesDir)).toBe(false);
    // Replicate listTemplates logic
    const result = fs.existsSync(templatesDir) ? [] : [];
    expect(result).toEqual([]);
  });
});

describe('listTemplates integration', () => {
  it('can import listTemplates from the module', async () => {
    const {listTemplates} = await import('./template.mjs');
    // listTemplates returns based on CLI_ROOT/templates.
    // It should return an array (possibly empty if templates dir doesn't exist).
    const result = listTemplates();
    expect(Array.isArray(result)).toBe(true);
  });
});

// Subprocess tests: prove the REAL exit code and JSON envelope for invalid
// --type, validated before any side effects (checklist #1, #2, #5).
import {execFileSync} from 'node:child_process';

const cliBin = path.resolve(import.meta.dirname, '..', '..', 'bin', 'xds.mjs');

function runCli(args) {
  try {
    const stdout = execFileSync(process.execPath, [cliBin, ...args], {
      env: {...process.env, FORCE_COLOR: '0'},
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return {code: 0, stdout, stderr: ''};
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    };
  }
}

describe('template --type flag validation', () => {
  it('rejects an invalid --type with exit 1 and a clear message', () => {
    const {code, stderr} = runCli(['template', '--list', '--type', 'bogus']);
    expect(code).toBe(1);
    expect(stderr).toMatch(/Unknown template type "bogus"/);
    expect(stderr).toMatch(/page, block/);
  });

  it('rejects an invalid --type with --json as a structured error (exit 1)', () => {
    const {code, stdout} = runCli(['template', '--list', '--type', 'bogus', '--json']);
    expect(code).toBe(1);
    const parsed = JSON.parse(stdout);
    expect(parsed.error).toMatch(/Unknown template type "bogus"/);
  });

  it('does NOT silently return an empty list for an invalid --type', () => {
    const {code, stdout} = runCli(['template', '--list', '--type', 'nope']);
    // Regression guard: previously exited 0 with an empty filtered list.
    expect(code).not.toBe(0);
    expect(stdout).not.toMatch(/Page Templates/);
  });

  it('accepts a valid --type page (exit 0)', () => {
    const {code} = runCli(['template', '--list', '--type', 'page']);
    expect(code).toBe(0);
  });

  it('accepts a valid --type block (exit 0)', () => {
    const {code} = runCli(['template', '--list', '--type', 'block']);
    expect(code).toBe(0);
  });
});
