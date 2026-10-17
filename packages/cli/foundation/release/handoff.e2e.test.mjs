// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The hand-off through the real bin: a run started in this copy, in a
 * project whose release is another one, is answered by that release with the
 * same arguments, folder, standard streams, and exit status, and one line on
 * standard error in text mode (spec AST-081 FR2, FR9).
 */

import {describe, it, expect, afterEach} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  cleanupFixtures,
  installCore,
  installStandInCli,
  project,
  seedRelease,
  tempDir,
} from '../../test-utils/release-fixtures.mjs';

const BIN = fileURLToPath(
  new URL('../../clients/cli/bin/astryx.mjs', import.meta.url),
);
const SELF_VERSION = JSON.parse(
  fs.readFileSync(
    fileURLToPath(new URL('../../package.json', import.meta.url)),
    'utf-8',
  ),
).version;

afterEach(cleanupFixtures);

/**
 * Run this copy's bin in `cwd` with a private home and cache.
 * @param {string} cwd
 * @param {string[]} args
 * @param {{input?: string, cache?: string}} [options]
 */
function run(cwd, args, options = {}) {
  const home = tempDir('home');
  const cache = options.cache ?? tempDir('cache');
  const result = spawnSync(process.execPath, [BIN, ...args], {
    cwd,
    encoding: 'utf-8',
    input: options.input ?? '',
    env: {
      ...process.env,
      HOME: home,
      USERPROFILE: home,
      XDG_CACHE_HOME: cache,
      LOCALAPPDATA: cache,
      NO_COLOR: '1',
    },
    timeout: 60_000,
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    /** The stand-in's report, when a stand-in answered. */
    report: () => JSON.parse(result.stdout.trim().split('\n').pop() ?? 'null'),
  };
}

describe('hand-off to the project CLI', () => {
  it('passes argv, folder, stdin and the exit status, with one stderr line', () => {
    const root = project(tempDir(), {'@astryxdesign/core': '0.6.8'});
    installCore(root, '0.6.8');
    installStandInCli(root, '0.6.8');
    const src = path.join(root, 'src');
    fs.mkdirSync(src);
    const result = run(src, ['component', 'Button', '--exit', '7'], {
      input: 'piped',
    });
    expect(result.status).toBe(7);
    expect(result.report()).toEqual({
      version: '0.6.8',
      args: ['component', 'Button', '--exit', '7'],
      cwd: src,
      stdin: 'piped',
    });
    const lines = result.stderr.trim().split('\n');
    expect(lines).toEqual([
      `astryx: answered by this project's CLI 0.6.8, handed over from CLI ${SELF_VERSION}`,
      'stand-in 0.6.8',
    ]);
  });

  it('prints no line with --json', () => {
    const root = project(tempDir(), {'@astryxdesign/core': '0.6.8'});
    installCore(root, '0.6.8');
    installStandInCli(root, '0.6.8');
    const result = run(root, ['docs', '--json']);
    expect(result.status).toBe(0);
    expect(result.stderr.trim()).toBe('stand-in 0.6.8');
  });

  it('fails with ERR_VERSIONS_UNAVAILABLE when the project CLI cannot start', () => {
    const root = project(tempDir(), {'@astryxdesign/core': '0.6.8'});
    installCore(root, '0.6.8');
    installStandInCli(root, '0.6.8', {bin: false});
    const json = run(root, ['docs', '--json']);
    expect(json.status).toBe(1);
    expect(JSON.parse(json.stdout)).toMatchObject({
      code: 'ERR_VERSIONS_UNAVAILABLE',
    });
    const text = run(root, ['docs']);
    expect(text.status).toBe(1);
    expect(text.stderr).toMatch(
      /^Error: This project's CLI 0\.6\.8 could not be started/,
    );
  });
});

describe('hand-off to the matched release', () => {
  it("runs the cached release equal to the project's Core when the project CLI differs", () => {
    const cache = tempDir('cache');
    seedRelease(path.join(cache, 'astryx'), '0.7.0');
    const root = project(tempDir(), {'@astryxdesign/core': '0.7.0'});
    installCore(root, '0.7.0');
    installStandInCli(root, '0.6.8');
    const result = run(root, ['upgrade', '--from', '0.6.8'], {cache});
    expect(result.status).toBe(0);
    expect(result.report()).toMatchObject({
      version: '0.7.0',
      args: ['upgrade', '--from', '0.6.8'],
    });
    // The stand-in predates the who-answered line, so this copy prints it.
    expect(result.stderr.trim().split('\n')).toEqual([
      "astryx: answered by CLI 0.7.0 with Core 0.7.0, the release that matches this project's Core",
      'stand-in 0.7.0',
    ]);
  });
});

describe('answering itself', () => {
  it('outside a project: one line in text mode, answeredBy in JSON', () => {
    const empty = tempDir('empty');
    const text = run(empty, ['--version']);
    expect(text.stdout.trim()).toBe(SELF_VERSION);
    expect(text.stderr.trim()).toBe(
      `astryx: answered by CLI ${SELF_VERSION} with Core ${SELF_VERSION}, outside a project`,
    );
    const json = run(empty, ['docs', '--json']);
    expect(json.stderr).toBe('');
    expect(JSON.parse(json.stdout).meta.answeredBy).toEqual({
      cli: SELF_VERSION,
      core: SELF_VERSION,
      copy: 'carried',
    });
  });
});

describe('answeredBy on every successful JSON result', () => {
  it('covers the manifest, the version, and help', () => {
    const empty = tempDir('empty');
    for (const args of [
      ['manifest', '--json'],
      ['--json'],
      ['--version', '--json'],
      ['component', '--help', '--json'],
    ]) {
      const result = run(empty, args);
      expect(result.status, args.join(' ')).toBe(0);
      expect(
        JSON.parse(result.stdout).meta?.answeredBy,
        args.join(' '),
      ).toEqual({
        cli: SELF_VERSION,
        core: SELF_VERSION,
        copy: 'carried',
      });
    }
  });
});

describe('computer-level commands are never handed to a project', () => {
  it('answers init --user itself inside a project whose CLI is another release', () => {
    const root = project(tempDir(), {'@astryxdesign/core': '0.6.8'});
    installCore(root, '0.6.8');
    installStandInCli(root, '0.6.8');
    for (const args of [
      ['init', '--user'],
      ['--json', 'init', '--user', '--remove-agents'],
    ]) {
      const result = run(root, args);
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).not.toContain('"version":"0.6.8"');
      expect(result.stderr).not.toContain('stand-in');
    }
    const text = run(root, ['init', '--user']);
    expect(text.stderr.split('\n')[0]).toBe(
      `astryx: answered by CLI ${SELF_VERSION} with Core ${SELF_VERSION}, for this computer`,
    );
  });
});
