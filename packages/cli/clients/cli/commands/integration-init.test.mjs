// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CLI-level tests for `astryx integration init` — exercises the command
 * through the in-process harness, checking the JSON envelope, text stderr,
 * and exit codes.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {runCli} from '../../../test-utils/run-cli.mjs';

/**
 * A temp package directory whose name npm accepts: init names the package
 * after it, and mkdtemp suffixes can hold uppercase letters.
 * @returns {string}
 */
function makeTmpDir() {
  const dir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-init-cli-')), 'acme-widgets');
  fs.mkdirSync(dir);
  return dir;
}

describe('astryx integration init (CLI)', () => {
  /** @type {string} */
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(path.dirname(tmpDir), {recursive: true, force: true});
  });

  it('--json returns a valid integration.init envelope on --dry-run', async () => {
    const {status, stdout} = await runCli(
      ['integration', 'init', '--dry-run', '--json'],
      {cwd: tmpDir},
    );
    expect(status).toBe(0);
    const envelope = JSON.parse(stdout);
    expect(envelope.type).toBe('integration.init');
    expect(envelope.data.dryRun).toBe(true);
    expect(envelope.data.packageCreated).toBe(true);
    expect(envelope.data.fieldsAdded).toContain('name');
  });

  it('invalid name: --json returns ERR_INVALID_ARGUMENT and exit 1', async () => {
    const {status, stdout} = await runCli(
      ['integration', 'init', 'INVALID NAME!', '--no-install', '--json'],
      {cwd: tmpDir},
    );
    expect(status).toBe(1);
    const envelope = JSON.parse(stdout);
    expect(envelope.code).toBe('ERR_INVALID_ARGUMENT');
    expect(envelope.error).toContain('Invalid package name');
  });

  it('invalid name: text mode exits 1 with error on stderr', async () => {
    const {status, stderr} = await runCli(
      ['integration', 'init', 'INVALID NAME!', '--no-install'],
      {cwd: tmpDir},
    );
    expect(status).toBe(1);
    expect(stderr).toContain('Invalid package name');
  });

  it('rename refusal: --json returns ERR_INVALID_ARGUMENT and exit 1', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '@acme/original', version: '1.0.0'}) + '\n',
    );
    const {status, stdout} = await runCli(
      ['integration', 'init', '@acme/different', '--no-install', '--json'],
      {cwd: tmpDir},
    );
    expect(status).toBe(1);
    const envelope = JSON.parse(stdout);
    expect(envelope.code).toBe('ERR_INVALID_ARGUMENT');
    expect(envelope.error).toContain('Cannot rename');
  });

  it('--no-install creates the package and exits 0', async () => {
    const {status, stdout} = await runCli(
      ['integration', 'init', '--no-install', '--json'],
      {cwd: tmpDir},
    );
    expect(status).toBe(0);
    const envelope = JSON.parse(stdout);
    expect(envelope.type).toBe('integration.init');
    expect(envelope.data.installed).toBe(false);
    expect(envelope.data.packageCreated).toBe(true);
  });

  it('--no-install next step runs the scoped CLI package, never the bare bin', async () => {
    const {status, stdout, stderr} = await runCli(
      ['integration', 'init', '--no-install'],
      {cwd: tmpDir},
    );
    expect(status).toBe(0);
    const out = stdout + stderr;
    // The CLI is not installed, so `npx astryx` would fetch an unrelated
    // registry package named "astryx".
    expect(out).toMatch(/Next: \S+(?: dlx)? @astryxdesign\/cli integration add component YourWidget/u);
    expect(out).not.toMatch(/(?:npx|exec|bunx|yarn) astryx\b/u);
  });

  it('--dry-run --no-install previews without writing (CLI)', async () => {
    const {status, stdout} = await runCli(
      ['integration', 'init', '--dry-run', '--no-install', '--json'],
      {cwd: tmpDir},
    );
    expect(status).toBe(0);
    const envelope = JSON.parse(stdout);
    expect(envelope.data.dryRun).toBe(true);
    expect(envelope.data.installed).toBe(false);
    expect(envelope.data.packageCreated).toBe(true);
  });

  it('says "Dependencies installed." not "devDependencies" for declared deps (CLI)', async () => {
    // Both declared under dependencies, not devDependencies
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: '@acme/in-deps',
        version: '1.0.0',
        exports: {},
        dependencies: {
          '@astryxdesign/cli': '^0.6.5',
          '@astryxdesign/core': '^0.6.5',
        },
      }) + '\n',
    );
    // Recording fake PM
    const binDir = path.join(tmpDir, 'fake-bin');
    fs.mkdirSync(binDir, {recursive: true});
    const script = '#!/bin/sh\nexit 0\n';
    for (const name of ['npm', 'pnpm', 'yarn', 'bun']) {
      fs.writeFileSync(path.join(binDir, name), script, {mode: 0o755});
    }
    const nodeDir = path.dirname(process.execPath);
    const saved = process.env.PATH;
    try {
      process.env.PATH = `${binDir}:${nodeDir}`;
      const {status, stdout, stderr} = await runCli(
        ['integration', 'init', '--no-install'],
        {cwd: tmpDir},
      );
    } finally {
      process.env.PATH = saved;
    }
    // Re-run without --no-install to trigger the install path
    const saved2 = process.env.PATH;
    try {
      process.env.PATH = `${binDir}:${nodeDir}`;
      const {status, stdout} = await runCli(
        ['integration', 'init'],
        {cwd: tmpDir},
      );
      expect(status).toBe(0);
      expect(stdout).toContain('Dependencies installed.');
      expect(stdout).not.toContain('devDependencies');
    } finally {
      process.env.PATH = saved2;
    }
  });

});
