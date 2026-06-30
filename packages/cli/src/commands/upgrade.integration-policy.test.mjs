// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Upgrade integration error-policy + --skip-codemod tests.
 *
 * These scaffold a real consumer project (astryx.config.mjs + an installed
 * integration package with codemods) under a REPO-LOCAL temp dir so Vite
 * permits dynamic import of the config/integration modules (it blocks /tmp).
 * They assert:
 *   - a broken integration codemod definition is SKIPPED (warned), not a hard
 *     fail of the upgrade (reverses the previous policy);
 *   - --skip-codemod excludes a named integration codemod.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Command} from 'commander';
import {registerUpgrade} from './upgrade.mjs';

let tmpDir;
let originalCwd;
let logCalls;
let errCalls;
let exitCode;

const codemodModuleUrl = pathToFileURL(
  path.resolve(process.cwd(), 'packages/cli/src/codemod.mjs'),
).href;

beforeEach(() => {
  originalCwd = process.cwd();
  // Repo-local temp dir: under cwd so Vite allows config/integration imports.
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-upgrade-policy-'));
  process.chdir(tmpDir);
  logCalls = [];
  errCalls = [];
  exitCode = undefined;
  vi.spyOn(console, 'log').mockImplementation((...a) => logCalls.push(a.join(' ')));
  vi.spyOn(console, 'error').mockImplementation((...a) => errCalls.push(a.join(' ')));
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  vi.spyOn(process, 'exit').mockImplementation(code => {
    exitCode = code;
    throw new Error(`__exit ${code}`);
  });
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

function writeInstalledCore(version) {
  const dir = path.join(tmpDir, 'node_modules', '@astryxdesign', 'core');
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: '@astryxdesign/core', version}),
  );
}

function writeSource() {
  fs.mkdirSync(path.join(tmpDir, 'src'), {recursive: true});
  fs.writeFileSync(path.join(tmpDir, 'src', 'index.ts'), 'const foo = 1;\n');
}

/**
 * Scaffold a consumer + an installed integration package with codemods.
 * @param {Object<string,string>} codemodFiles "<version>/<id>.mjs" -> body
 */
function scaffoldIntegration(codemodFiles) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    `export default { integrations: ['@acme/widgets'] };\n`,
  );
  const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default { codemods: './codemods' };\n`,
  );
  for (const [rel, body] of Object.entries(codemodFiles)) {
    const full = path.join(pkgDir, 'codemods', rel);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, body);
  }
}

function createProgram() {
  const program = new Command();
  program.exitOverride();
  program.option('--json', 'Output as typed JSON');
  registerUpgrade(program);
  return program;
}

async function runJson(args) {
  const program = createProgram();
  try {
    await program.parseAsync(['node', 'astryx', ...args]);
  } catch (err) {
    if (!String(err?.message || '').startsWith('__exit')) throw err;
  }
  for (let i = logCalls.length - 1; i >= 0; i--) {
    const line = logCalls[i];
    if (line.startsWith('{')) {
      try {
        return JSON.parse(line);
      } catch {
        // keep looking
      }
    }
  }
  return null;
}

describe('upgrade integration error policy (skip + warn)', () => {
  it('SKIPS a broken integration codemod instead of hard-failing the upgrade', async () => {
    // A codemod module whose default export is not a valid codemod result —
    // a DEFINITION error. The upgrade must NOT abort; it skips the broken
    // integration's codemods and completes.
    scaffoldIntegration({
      '0.2.0/bad.mjs': `export default { not: 'a codemod' };\n`,
    });
    writeInstalledCore('0.2.0');
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--from',
      '0.1.0',
      '--path',
      'src',
    ]);

    // Did NOT hard-fail: no error envelope, and it ran to a status/run result.
    expect(result).not.toBeNull();
    expect(result.error).toBeUndefined();
    expect(exitCode).not.toBe(1);
  });

  it('runs a healthy integration codemod for an applicable range', async () => {
    scaffoldIntegration({
      '0.2.0/drop-foo.mjs':
        `import {createCodemod} from ${JSON.stringify(codemodModuleUrl)};\n` +
        `export default createCodemod({ title: 'Drop foo', transform: (file) => file.source.replace(/foo/g, 'bar') });\n`,
    });
    writeInstalledCore('0.2.0');
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--from',
      '0.1.0',
      '--path',
      'src',
      '--apply',
    ]);
    expect(result).not.toBeNull();
    expect(result.error).toBeUndefined();
    // The codemod rewrote foo -> bar.
    const out = fs.readFileSync(path.join(tmpDir, 'src', 'index.ts'), 'utf-8');
    expect(out).toContain('bar');
  });

  it('--skip-codemod excludes a named integration codemod', async () => {
    scaffoldIntegration({
      '0.2.0/drop-foo.mjs':
        `import {createCodemod} from ${JSON.stringify(codemodModuleUrl)};\n` +
        `export default createCodemod({ title: 'Drop foo', transform: (file) => file.source.replace(/foo/g, 'bar') });\n`,
    });
    writeInstalledCore('0.2.0');
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--from',
      '0.1.0',
      '--path',
      'src',
      '--apply',
      '--skip-codemod',
      'drop-foo',
    ]);
    expect(result).not.toBeNull();
    // Skipped: the source is unchanged (foo not rewritten to bar).
    const out = fs.readFileSync(path.join(tmpDir, 'src', 'index.ts'), 'utf-8');
    expect(out).toContain('foo');
    expect(out).not.toContain('bar');
  });
});
