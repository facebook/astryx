// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file End-to-end tests for global CLI flags (--version --json,
 * --lang validation, --detail level ordering, subcommand --help).
 */

import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(__dirname, '../../bin/xds.mjs');

function runCli(args) {
  const r = spawnSync(process.execPath, [BIN, ...args], {
    encoding: 'utf-8',
  });
  return {
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
    status: r.status ?? 0,
  };
}

describe('--version --json', () => {
  it('returns plain text by default', () => {
    const {stdout} = runCli(['--version']);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('returns a typed JSON envelope when --json is set', () => {
    const {stdout} = runCli(['--version', '--json']);
    const parsed = JSON.parse(stdout);
    expect(parsed.type).toBe('version');
    expect(parsed.data).toBeDefined();
    expect(parsed.data.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe('--lang validation', () => {
  it('rejects unsupported locale with exit 1 and a clear message', () => {
    const {stdout, stderr, status} = runCli(['--lang', 'fr', 'component', 'XDSButton']);
    expect(status).toBe(1);
    expect(stderr).toMatch(/Unsupported language "fr"/);
    expect(stderr).toMatch(/Supported: en, zh, dense/);
  });

  it('accepts --lang en silently', () => {
    const {status, stderr} = runCli(['--lang', 'en', 'component', 'XDSButton']);
    expect(status).toBe(0);
    expect(stderr).not.toMatch(/Unsupported|incomplete/);
  });

  it('warns when --lang zh is requested (translations incomplete)', () => {
    const {status, stderr} = runCli(['--lang', 'zh', 'component', 'XDSButton']);
    expect(status).toBe(0);
    expect(stderr).toMatch(/translations are incomplete/i);
  });

  it('rejects --lang fr with --json (JSON error envelope)', () => {
    const {stdout, status} = runCli(['--lang', 'fr', '--json', 'component', 'XDSButton']);
    expect(status).toBe(1);
    const parsed = JSON.parse(stdout);
    expect(parsed.error).toMatch(/Unsupported language "fr"/);
  });

  it('rejects combining --lang and --zh', () => {
    const {stderr, status} = runCli(['--lang', 'zh', '--zh', 'component', 'XDSButton']);
    expect(status).toBe(1);
    expect(stderr).toMatch(/Cannot combine --lang/);
  });
});

describe('--detail level ordering on list views', () => {
  it('component --list: brief < compact < full (in bytes)', () => {
    const brief = runCli(['component', '--list', '--detail', 'brief']).stdout;
    const compact = runCli(['component', '--list', '--detail', 'compact']).stdout;
    const full = runCli(['component', '--list', '--detail', 'full']).stdout;

    expect(brief.length).toBeLessThan(compact.length);
    expect(compact.length).toBeLessThan(full.length);
  });

  it('component --list: brief, compact, full produce DIFFERENT output', () => {
    const brief = runCli(['component', '--list', '--detail', 'brief']).stdout;
    const compact = runCli(['component', '--list', '--detail', 'compact']).stdout;
    const full = runCli(['component', '--list', '--detail', 'full']).stdout;

    expect(brief).not.toEqual(compact);
    expect(compact).not.toEqual(full);
    expect(brief).not.toEqual(full);
  });

  it('hook --list: brief < compact < full (in bytes)', () => {
    const brief = runCli(['hook', '--list', '--detail', 'brief']).stdout;
    const compact = runCli(['hook', '--list', '--detail', 'compact']).stdout;
    const full = runCli(['hook', '--list', '--detail', 'full']).stdout;

    expect(brief.length).toBeLessThan(compact.length);
    expect(compact.length).toBeLessThan(full.length);
  });

  it('hook --list: brief, compact, full produce DIFFERENT output', () => {
    const brief = runCli(['hook', '--list', '--detail', 'brief']).stdout;
    const compact = runCli(['hook', '--list', '--detail', 'compact']).stdout;
    const full = runCli(['hook', '--list', '--detail', 'full']).stdout;

    expect(brief).not.toEqual(compact);
    expect(compact).not.toEqual(full);
    expect(brief).not.toEqual(full);
  });

  it('JSON envelope types differ by detail level on list views', () => {
    const brief = JSON.parse(runCli(['--json', 'component', '--list', '--detail', 'brief']).stdout);
    const compact = JSON.parse(runCli(['--json', 'component', '--list', '--detail', 'compact']).stdout);
    const full = JSON.parse(runCli(['--json', 'component', '--list', '--detail', 'full']).stdout);

    expect(brief.type).toBe('component.list');
    expect(compact.type).toBe('component.compact-list');
    expect(full.type).toBe('component.detailed-list');
  });
});

describe('subcommand --help shows global flags + Examples', () => {
  it('component --help mentions --json, --lang, --detail', () => {
    const {stdout} = runCli(['component', '--help']);
    expect(stdout).toMatch(/--json/);
    expect(stdout).toMatch(/--lang/);
    expect(stdout).toMatch(/--detail/);
  });

  it('component --help has an Examples section', () => {
    const {stdout} = runCli(['component', '--help']);
    expect(stdout).toMatch(/Examples:/);
  });

  it('hook --help mentions --json, --lang, --detail and Examples', () => {
    const {stdout} = runCli(['hook', '--help']);
    expect(stdout).toMatch(/--json/);
    expect(stdout).toMatch(/--lang/);
    expect(stdout).toMatch(/--detail/);
    expect(stdout).toMatch(/Examples:/);
  });

  it('docs --help mentions global flags and Examples', () => {
    const {stdout} = runCli(['docs', '--help']);
    expect(stdout).toMatch(/--json/);
    expect(stdout).toMatch(/--lang/);
    expect(stdout).toMatch(/Examples:/);
  });

  it('template --help mentions global flags and Examples', () => {
    const {stdout} = runCli(['template', '--help']);
    expect(stdout).toMatch(/--json/);
    expect(stdout).toMatch(/--lang/);
    expect(stdout).toMatch(/--detail/);
    expect(stdout).toMatch(/Examples:/);
  });

  it('template get --help mentions global flags and Examples', () => {
    const {stdout} = runCli(['template', 'get', '--help']);
    expect(stdout).toMatch(/--json/);
    expect(stdout).toMatch(/--lang/);
    expect(stdout).toMatch(/--detail/);
    expect(stdout).toMatch(/Examples:/);
  });

  it('theme --help mentions global flags and Examples', () => {
    const {stdout} = runCli(['theme', '--help']);
    expect(stdout).toMatch(/--json/);
    expect(stdout).toMatch(/--lang/);
    expect(stdout).toMatch(/--detail/);
    expect(stdout).toMatch(/Examples:/);
  });

  it('theme build --help mentions global flags and Examples', () => {
    const {stdout} = runCli(['theme', 'build', '--help']);
    expect(stdout).toMatch(/--json/);
    expect(stdout).toMatch(/--lang/);
    expect(stdout).toMatch(/--detail/);
    expect(stdout).toMatch(/Examples:/);
  });
});
