// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Generation and release-version coverage for the Core component-doc
 * snapshot packed with the CLI.
 */

import {afterEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const CLI_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const REPO_ROOT = path.resolve(CLI_ROOT, '../..');
const GENERATOR = path.join(
  CLI_ROOT,
  'scripts/generate-bundled-component-docs.mjs',
);
const temporaryDirectories = [];

function versionOf(packageDir) {
  return JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'),
  ).version;
}

function temporaryDirectory() {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'astryx-bundled-component-docs-'),
  );
  temporaryDirectories.push(directory);
  return directory;
}

function runGenerator(args) {
  return spawnSync(process.execPath, [GENERATOR, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

function expectSuccess(result) {
  if (result.status !== 0) {
    throw new Error(`${result.stdout}\n${result.stderr}`.trim());
  }
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

describe('bundled Core component docs', () => {
  it('generates deterministically from the current Core docs', () => {
    const directory = temporaryDirectory();
    const output = path.join(directory, 'core-component-docs.json');

    expectSuccess(runGenerator(['--output', output]));
    const generated = JSON.parse(fs.readFileSync(output, 'utf8'));
    expect(generated.version).toBe(
      versionOf(path.join(REPO_ROOT, 'packages/core')),
    );
    expect(generated.version).toBe(versionOf(CLI_ROOT));
    expect(Object.keys(generated.components).length).toBeGreaterThan(100);
    expectSuccess(runGenerator(['--output', output, '--check']));

    fs.appendFileSync(output, ' ');
    expect(runGenerator(['--output', output, '--check']).status).not.toBe(0);
  }, 30_000);

  it('regenerates cleanly after a simulated matched package-version bump', () => {
    const directory = temporaryDirectory();
    const output = path.join(directory, 'core-component-docs.json');
    const cliPackage = path.join(directory, 'cli-package.json');
    const corePackage = path.join(directory, 'core-package.json');
    const version = '0.6.6-simulated';
    fs.writeFileSync(cliPackage, JSON.stringify({version}));
    fs.writeFileSync(corePackage, JSON.stringify({version}));

    const args = [
      '--output',
      output,
      '--cli-package-json',
      cliPackage,
      '--core-package-json',
      corePackage,
    ];
    expectSuccess(runGenerator(args));
    expect(JSON.parse(fs.readFileSync(output, 'utf8')).version).toBe(version);
    expectSuccess(runGenerator([...args, '--check']));
  }, 30_000);
});
