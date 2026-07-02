// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade --codemod explicit-mode + --package disambiguation tests.
 *
 * These scaffold a real consumer project (astryx.config.mjs + one or two
 * installed integration packages with FLAT codemods dirs, version declared in
 * the definition) under a REPO-LOCAL temp dir so Vite permits dynamic import
 * of the config/integration modules. They assert:
 *   - --codemod runs WITHOUT --from (explicit mode bypasses the range gate);
 *   - a codemod id present in two packages is AMBIGUOUS (error + suggests
 *     --package);
 *   - --package resolves the ambiguity and scopes the run to one package.
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
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-upgrade-selector-'));
  process.chdir(tmpDir);
  logCalls = [];
  errCalls = [];
  exitCode = undefined;
  vi.spyOn(console, 'log').mockImplementation((...a) =>
    logCalls.push(a.join(' ')),
  );
  vi.spyOn(console, 'error').mockImplementation((...a) =>
    errCalls.push(a.join(' ')),
  );
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
 * Install an integration package with a flat codemods dir.
 * @param {string} pkgName e.g. '@acme/widgets'
 * @param {Object<string,string>} codemodFiles "<id>.mjs" -> body
 */
function installIntegration(pkgName, codemodFiles) {
  const pkgDir = path.join(tmpDir, 'node_modules', ...pkgName.split('/'));
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: pkgName, version: '1.0.0'}),
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

/** Write a consumer config loading the given integration package specs. */
function writeConsumer(pkgNames) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    `export default { integrations: ${JSON.stringify(pkgNames)} };\n`,
  );
}

function codemodSource(title, version, extra = '') {
  return (
    `import {createCodemod} from ${JSON.stringify(codemodModuleUrl)};\n` +
    `export default createCodemod({ title: ${JSON.stringify(title)}, version: ${JSON.stringify(version)}${extra}, transform: (file) => file.source.replace(/foo/g, 'bar') });\n`
  );
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

describe('upgrade --codemod explicit mode', () => {
  it('runs a named codemod WITHOUT --from (bypasses the range gate)', async () => {
    writeConsumer(['@acme/widgets']);
    installIntegration('@acme/widgets', {
      'drop-foo.mjs': codemodSource('Drop foo', '0.2.0'),
    });
    // Installed target is 0.1.0, codemod version is 0.2.0 (above target). In
    // range mode this would not run; explicit --codemod without --from does.
    writeInstalledCore('0.1.0');
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--codemod',
      'drop-foo',
      '--path',
      'src',
      '--apply',
    ]);
    expect(result).not.toBeNull();
    expect(result.error).toBeUndefined();
    const out = fs.readFileSync(path.join(tmpDir, 'src', 'index.ts'), 'utf-8');
    expect(out).toContain('bar');
  });
});

describe('upgrade --codemod cross-package disambiguation', () => {
  it('errors as AMBIGUOUS when the id exists in two packages', async () => {
    writeConsumer(['@acme/widgets', '@acme/gadgets']);
    installIntegration('@acme/widgets', {
      'shared.mjs': codemodSource('Widgets shared', '0.2.0'),
    });
    installIntegration('@acme/gadgets', {
      'shared.mjs': codemodSource('Gadgets shared', '0.3.0'),
    });
    writeInstalledCore('0.1.0');
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--codemod',
      'shared',
      '--path',
      'src',
      '--apply',
    ]);
    expect(result).not.toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/ambiguous/i);
    expect(result.error).toContain('@acme/widgets');
    expect(result.error).toContain('@acme/gadgets');
    expect(result.error).toMatch(/--package/);
    expect(exitCode).toBe(1);
  });

  it('--package resolves the ambiguity and runs only that package', async () => {
    writeConsumer(['@acme/widgets', '@acme/gadgets']);
    // widgets: replaces foo->bar; gadgets: replaces foo->BAZ. Scoping to
    // widgets must produce "bar", never "BAZ".
    installIntegration('@acme/widgets', {
      'shared.mjs': codemodSource('Widgets shared', '0.2.0'),
    });
    installIntegration('@acme/gadgets', {
      'shared.mjs':
        `import {createCodemod} from ${JSON.stringify(codemodModuleUrl)};\n` +
        `export default createCodemod({ title: 'Gadgets shared', version: '0.3.0', transform: (file) => file.source.replace(/foo/g, 'BAZ') });\n`,
    });
    writeInstalledCore('0.1.0');
    writeSource();

    const result = await runJson([
      '--json',
      'upgrade',
      '--codemod',
      'shared',
      '--package',
      '@acme/widgets',
      '--path',
      'src',
      '--apply',
    ]);
    expect(result).not.toBeNull();
    expect(result.error).toBeUndefined();
    const out = fs.readFileSync(path.join(tmpDir, 'src', 'index.ts'), 'utf-8');
    expect(out).toContain('bar');
    expect(out).not.toContain('BAZ');
  });
});
