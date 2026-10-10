// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for `integrationInit` — the API function behind
 * `astryx integration init`.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import Module, {createRequire} from 'node:module';
import {integrationInit} from './init.mjs';
import {integrationAddComponent} from './add-contribution.mjs';
import {validateLocalIntegration} from './validate-integration.mjs';

/** @returns {string} */
function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-init-test-'));
}

/** @param {string} dir */
function cleanup(dir) {
  fs.rmSync(dir, {recursive: true, force: true});
}

describe('integrationInit', () => {
  /** @type {string} */
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    // No fixture declares a package manager or has a lockfile, so detection
    // falls back to the runner's user agent. Pin it so install argv is exact.
    vi.stubEnv('npm_config_user_agent', 'npm/10.9.0 node/v22.0.0 linux x64');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    cleanup(tmpDir);
  });

  /**
   * Put a recording fake for every supported package manager first on PATH,
   * run `fn`, and return its result with the calls the fakes logged: one
   * `"<pm> <args...>"` line per invocation. Each fake exits 0 and installs
   * nothing, so no test reaches the network or a real package manager.
   * @template T
   * @param {() => Promise<T>} fn
   * @returns {Promise<{result: T, calls: string[]}>}
   */
  async function withRecordingPm(fn) {
    const binDir = fs.mkdtempSync(path.join(tmpDir, 'recording-bin-'));
    const log = path.join(binDir, 'calls.log');
    // Builtins only: PATH holds just the fakes and node.
    const script = '#!/bin/sh\nprintf \'%s\\n\' "${0##*/} $*" >> "${0%/*}/calls.log"\nexit 0\n';
    for (const name of ['npm', 'pnpm', 'yarn', 'bun', 'npx']) {
      fs.writeFileSync(path.join(binDir, name), script, {mode: 0o755});
    }

    const saved = process.env.PATH;
    try {
      process.env.PATH = `${binDir}:${path.dirname(process.execPath)}`;
      const result = await fn();
      const calls = fs.existsSync(log)
        ? fs.readFileSync(log, 'utf-8').split('\n').filter(Boolean)
        : [];
      return {result, calls};
    } finally {
      process.env.PATH = saved;
    }
  }

  /**
   * Write a fake installed package under `<dir>/node_modules`.
   * @param {string} dir
   * @param {string} name
   */
  function installFake(dir, name) {
    const depDir = path.join(dir, 'node_modules', ...name.split('/'));
    fs.mkdirSync(depDir, {recursive: true});
    fs.writeFileSync(
      path.join(depDir, 'package.json'),
      JSON.stringify({name, version: '0.6.5'}),
    );
  }

  /**
   * @param {string} dir
   * @param {Record<string, unknown>} fields
   */
  function writePkg(dir, fields) {
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({name: '@acme/widgets', version: '1.0.0', exports: {}, ...fields}, null, 2) + '\n',
    );
  }

  // ── Options ───────────────────────────────────────────────────────

  it('creates package.json with name from argument', async () => {
    const receipt = await integrationInit(
      {name: '@acme/astryx-widgets', noInstall: true},
      {cwd: tmpDir},
    );
    expect(receipt.type).toBe('integration.init');
    expect(receipt.data.name).toBe('@acme/astryx-widgets');
    expect(receipt.data.packageCreated).toBe(true);
    expect(receipt.data.fieldsAdded).toContain('name');
    expect(receipt.data.fieldsAdded).toContain('version');
    expect(receipt.data.fieldsAdded).toContain('exports');
    expect(receipt.data.notes).toEqual([]);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.name).toBe('@acme/astryx-widgets');
    expect(pkg.version).toBe('1.0.0');
    expect(pkg.exports).toEqual({});
    // Core peer is NOT written by init (DEC-3); it is written by integration add.
    expect(pkg.peerDependencies).toBeUndefined();
  });

  it('uses directory name when no name is given', async () => {
    // mkdtemp suffixes can hold uppercase letters, which npm refuses.
    const dir = path.join(tmpDir, 'acme-widgets');
    fs.mkdirSync(dir);
    const receipt = await integrationInit({noInstall: true}, {cwd: dir});
    expect(receipt.data.name).toBe('acme-widgets');
  });

  it('dry-run does not write any files', async () => {
    const receipt = await integrationInit(
      {name: '@acme/widgets', dryRun: true},
      {cwd: tmpDir},
    );
    expect(receipt.data.dryRun).toBe(true);
    expect(receipt.data.packageCreated).toBe(true);
    expect(receipt.data.fieldsAdded.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(false);
  });

  it('preserves existing fields in package.json', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: '@existing/pkg',
        version: '2.0.0',
        license: 'MIT',
        exports: {'./foo': './foo.js'},
      }) + '\n',
    );

    const receipt = await integrationInit({noInstall: true}, {cwd: tmpDir});
    expect(receipt.data.name).toBe('@existing/pkg');
    expect(receipt.data.packageCreated).toBe(false);
    expect(receipt.data.fieldsAdded).not.toContain('name');
    expect(receipt.data.fieldsAdded).not.toContain('version');
    expect(receipt.data.fieldsAdded).not.toContain('exports');

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.version).toBe('2.0.0');
    expect(pkg.license).toBe('MIT');
    expect(pkg.exports).toEqual({'./foo': './foo.js'});
  });

  it('--no-install skips the install and reports installed: false', async () => {
    const receipt = await integrationInit(
      {name: '@acme/widgets', noInstall: true},
      {cwd: tmpDir},
    );
    expect(receipt.data.installed).toBe(false);
    expect(
      fs.existsSync(path.join(tmpDir, 'node_modules')),
    ).toBe(false);

    // Init does not write a Core peer (DEC-3).
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.peerDependencies).toBeUndefined();
  });

  // ── INV16: existing package without exports stays without exports ──

  it('does not add exports to an existing package (INV16)', async () => {
    // No version, so init writes the file: the write itself must not add
    // exports, imports, or files.
    const original = JSON.stringify({
      name: '@acme/published',
    }) + '\n';
    fs.writeFileSync(path.join(tmpDir, 'package.json'), original);

    const receipt = await integrationInit({noInstall: true}, {cwd: tmpDir});
    expect(receipt.data.fieldsAdded).toEqual(['version']);
    expect(receipt.data.notes.length).toBeGreaterThan(0);
    expect(receipt.data.notes[0]).toContain('exports');

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.version).toBe('1.0.0');
    expect(pkg.exports).toBeUndefined();
    expect(pkg.imports).toBeUndefined();
    expect(pkg).not.toHaveProperty('files');
    expect(Object.keys(pkg)).toEqual(['name', 'version']);
  });

  it('existing package without exports: main entry still importable', async () => {
    // An existing package with a main field but no exports should not have
    // its imports broken by init.
    // No version, so init writes the file.
    const imports = {'#internal': './internal.js'};
    const original = JSON.stringify({
      name: '@acme/lib',
      main: './index.js',
      imports,
    }) + '\n';
    fs.writeFileSync(path.join(tmpDir, 'package.json'), original);
    fs.writeFileSync(path.join(tmpDir, 'index.js'), 'module.exports = 42;\n');

    const receipt = await integrationInit({noInstall: true}, {cwd: tmpDir});
    expect(receipt.data.fieldsAdded).toEqual(['version']);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    // exports is NOT added — existing deep imports remain accessible
    expect(pkg.exports).toBeUndefined();
    expect(pkg.imports).toEqual(imports);
    expect(pkg).not.toHaveProperty('files');
    expect(pkg.main).toBe('./index.js');
    expect(pkg.version).toBe('1.0.0');
  });

  // ── FR3: never rename ──────────────────────────────────────────────

  it('errors when name argument differs from existing package name', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '@acme/original', version: '1.0.0'}) + '\n',
    );

    await expect(
      integrationInit({name: '@acme/different', noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('Cannot rename');

    await expect(
      integrationInit({name: '@acme/different', noInstall: true}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  });

  it('same name argument on existing package is a no-op', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '@acme/same', version: '1.0.0', exports: {}}) + '\n',
    );

    const receipt = await integrationInit(
      {name: '@acme/same', noInstall: true},
      {cwd: tmpDir},
    );
    expect(receipt.data.fieldsAdded).not.toContain('name');
  });

  // ── Errors ────────────────────────────────────────────────────────

  it('rejects invalid package names', async () => {
    await expect(
      integrationInit({name: 'INVALID NAME!', noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('Invalid package name');

    await expect(
      integrationInit({name: 'INVALID NAME!', noInstall: true}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  });

  it('rejects Node core module names for new packages', async () => {
    for (const name of ['fs', 'path', 'http', 'node:fs']) {
      await expect(
        integrationInit({name, noInstall: true}, {cwd: tmpDir}),
      ).rejects.toMatchObject({
        code: 'ERR_INVALID_ARGUMENT',
        message: expect.stringContaining(`"${name}" is a Node.js core module name`),
      });
      expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(false);
    }
  });


  for (const [label, badName] of [
    ['uppercase', 'aBc'],
    ['uppercase scope', '@Acme/widgets'],
    ['215 characters', 'a'.repeat(215)],
    ['215 characters, scoped', `@acme/${'a'.repeat(209)}`],
    ['reserved node_modules', 'node_modules'],
    ['reserved favicon.ico', 'favicon.ico'],
    ['leading dot', '.hidden'],
    ['leading underscore', '_private'],
  ]) {
    it(`rejects a name npm refuses: ${label}`, async () => {
      await expect(
        integrationInit({name: badName, noInstall: true}, {cwd: tmpDir}),
      ).rejects.toMatchObject({
        code: 'ERR_INVALID_ARGUMENT',
        message: expect.stringContaining('Invalid package name'),
      });
      expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(false);
    });
  }



  it('accepts a 214-character name and names with dots and underscores', async () => {
    for (const goodName of ['a'.repeat(214), `@acme/${'a'.repeat(208)}`, 'a.b_c-d', '@a_b/c.d']) {
      const dir = fs.mkdtempSync(path.join(tmpDir, 'ok-'));
      const receipt = await integrationInit({name: goodName, noInstall: true}, {cwd: dir});
      expect(receipt.data.name).toBe(goodName);
    }
  });

  it('rejects directory name that is not a valid npm package name', async () => {
    const badDir = path.join(tmpDir, 'INVALID DIR!');
    fs.mkdirSync(badDir, {recursive: true});

    await expect(
      integrationInit({noInstall: true}, {cwd: badDir}),
    ).rejects.toThrow('Invalid package name');

    await expect(
      integrationInit({noInstall: true}, {cwd: badDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  });

  it('accepts an existing uppercase package name (legacy npm)', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'MyLib', version: '1.0.0'}) + '\n',
    );

    const receipt = await integrationInit({noInstall: true}, {cwd: tmpDir});
    expect(receipt.data.name).toBe('MyLib');
  });

  for (const accepted of [
    'a'.repeat(220),
    'Legacy~Name!',
    '(old)',
    'MyLib',
    '@Scope/MyLib',
  ]) {
    it(`accepts existing name "${accepted.length > 30 ? accepted.slice(0, 20) + '…' : accepted}"`, async () => {
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({name: accepted, version: '1.0.0'}) + '\n',
      );
      const receipt = await integrationInit({noInstall: true}, {cwd: tmpDir});
      expect(receipt.data.name).toBe(accepted);
    });
  }

  for (const refused of [
    '.hidden',
    '_private',
    '-dash',
    'Node_Modules',
    '@a/b/c',
    '@scope/.x',
    ' @acme/pad ',
    'a b',
  ]) {
    it(`refuses existing name "${refused}"`, async () => {
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({name: refused, version: '1.0.0'}) + '\n',
      );
      const before = fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8');
      await expect(
        integrationInit({noInstall: true}, {cwd: tmpDir}),
      ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
      expect(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8')).toBe(before);
    });
  }

  it('existing-name refusal message names the specific rule (.hidden)', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '.hidden', version: '1.0.0'}) + '\n',
    );
    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('cannot start with a period');
  });

  it('existing-name refusal message names the specific rule (spaces)', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: ' pad '}) + '\n',
    );
    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('leading or trailing spaces');
  });

  it('existing-name refusal message names the specific rule (URL-unsafe)', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'a b', version: '1.0.0'}) + '\n',
    );
    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('not URL-safe');
  });





  it('rejects unparseable package.json', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{bad json');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('Cannot read package.json');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  });

  it('rejects package.json that parses to null', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), 'null');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('must contain a JSON object');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});

    // package.json must be untouched
    expect(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8')).toBe('null');
  });

  it('rejects package.json that parses to an array', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '[]');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('must contain a JSON object');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});

    // package.json must be untouched
    expect(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8')).toBe('[]');
  });

  it('rejects package.json that parses to a string', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '"hello"');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('must contain a JSON object');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});

    expect(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8')).toBe('"hello"');
  });

  it('rejects package.json that parses to a number', async () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '42');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toThrow('must contain a JSON object');

    await expect(
      integrationInit({noInstall: true}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});

    expect(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8')).toBe('42');
  });


  it('rejects non-string name in existing package.json', async () => {
    for (const badName of [42, {x: 1}, ['a'], true, null]) {
      const label = badName === null ? 'null' : typeof badName;
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({name: badName, version: '1.0.0'}) + '\n',
      );

      await expect(
        integrationInit({noInstall: true}, {cwd: tmpDir}),
      ).rejects.toThrow('name must be a string');

      await expect(
        integrationInit({noInstall: true}, {cwd: tmpDir}),
      ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});

      // package.json untouched
      const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'));
      expect(pkg.name).toEqual(badName);
    }
  });

  it('treats a blank existing name as missing and fills from argument', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '', version: '1.0.0'}) + '\n',
    );
    const receipt = await integrationInit({name: '@acme/filled', noInstall: true}, {cwd: tmpDir});
    expect(receipt.data.name).toBe('@acme/filled');
    expect(receipt.data.fieldsAdded).toContain('name');
  });

  it('treats a whitespace-only existing name as missing and fills from dir', async () => {
    const pkgDir = path.join(tmpDir, 'mywidget');
    fs.mkdirSync(pkgDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({name: '   ', version: '1.0.0'}) + '\n',
    );
    const receipt = await integrationInit({noInstall: true}, {cwd: pkgDir});
    expect(receipt.data.name).toBe('mywidget');
    expect(receipt.data.fieldsAdded).toContain('name');
  });

  it('refuses a strict-invalid argument on a blank existing name', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: '', version: '1.0.0'}) + '\n',
    );
    const before = fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8');
    await expect(
      integrationInit({name: 'fs', noInstall: true}, {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
    expect(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8')).toBe(before);
  });



  it('--dry-run with --no-install previews without writing', async () => {
    const receipt = await integrationInit(
      {name: '@acme/preview', dryRun: true, noInstall: true},
      {cwd: tmpDir},
    );
    expect(receipt.data.dryRun).toBe(true);
    expect(receipt.data.installed).toBe(false);
    expect(receipt.data.packageCreated).toBe(true);
    expect(receipt.data.fieldsAdded.length).toBeGreaterThan(0);
    // Nothing written
    expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, 'node_modules'))).toBe(false);
  });


  // ── Idempotency (mutation-bound) ──────────────────────────────────

  it('skips install and reports unchanged when deps are satisfied', async () => {
    await integrationInit(
      {name: '@acme/widgets', noInstall: true},
      {cwd: tmpDir},
    );

    // Declare devDependencies AND install them
    const pkgFile = path.join(tmpDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    pkg.devDependencies = {
      '@astryxdesign/cli': '^0.6.5',
      '@astryxdesign/core': '^0.6.5',
    };
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');

    for (const dep of ['@astryxdesign/cli', '@astryxdesign/core']) {
      installFake(tmpDir, dep);
    }

    const {result: receipt, calls} = await withRecordingPm(() =>
      integrationInit({name: '@acme/widgets'}, {cwd: tmpDir}),
    );
    expect(calls).toEqual([]);
    expect(receipt.data.fieldsAdded).toEqual([]);
    expect(receipt.data.installed).toBe(false);
    expect(receipt.data.packageCreated).toBe(false);
  });

  it('counts dev dependencies a workspace hoisted to an ancestor (no install)', async () => {
    // Workspace layout: the deps live only in the root's node_modules, and
    // that node_modules/@astryxdesign is itself a symlink into a store, the
    // way pnpm and some hoisting setups lay it out. The package has no
    // node_modules of its own.
    const store = path.join(tmpDir, 'store', '@astryxdesign');
    // The CLI's exports map hides ./package.json, as the real one does.
    fs.mkdirSync(path.join(store, 'cli'), {recursive: true});
    fs.writeFileSync(
      path.join(store, 'cli', 'package.json'),
      JSON.stringify({name: '@astryxdesign/cli', version: '0.6.5', exports: {'.': './index.mjs'}}),
    );
    fs.mkdirSync(path.join(store, 'core'), {recursive: true});
    fs.writeFileSync(
      path.join(store, 'core', 'package.json'),
      JSON.stringify({name: '@astryxdesign/core', version: '0.6.5'}),
    );
    fs.mkdirSync(path.join(tmpDir, 'node_modules'), {recursive: true});
    fs.symlinkSync(store, path.join(tmpDir, 'node_modules', '@astryxdesign'), 'dir');

    const pkgDir = path.join(tmpDir, 'packages', 'widgets');
    fs.mkdirSync(pkgDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        exports: {},
        devDependencies: {
          '@astryxdesign/cli': '^0.6.5',
          '@astryxdesign/core': '^0.6.5',
        },
      }) + '\n',
    );
    expect(fs.existsSync(path.join(pkgDir, 'node_modules'))).toBe(false);

    // PATH empty: any install attempt would fail, so success proves init
    // found both hoisted deps and skipped the install.
    const saved = process.env.PATH;
    try {
      process.env.PATH = '';
      const receipt = await integrationInit({}, {cwd: pkgDir});
      expect(receipt.data.installed).toBe(false);
      expect(receipt.data.fieldsAdded).toEqual([]);
    } finally {
      process.env.PATH = saved;
    }
  });

  // ── Which install runs (recording fake package manager) ──────────

  it('installs only the undeclared package, as a dev dependency, when it is installed but undeclared', async () => {
    // Both resolve from an ancestor node_modules; only the CLI is declared.
    installFake(tmpDir, '@astryxdesign/cli');
    installFake(tmpDir, '@astryxdesign/core');
    const pkgDir = path.join(tmpDir, 'pkg');
    writePkg(pkgDir, {devDependencies: {'@astryxdesign/cli': '^0.6.5'}});

    const {result: receipt, calls} = await withRecordingPm(() =>
      integrationInit({}, {cwd: pkgDir}),
    );
    expect(calls).toEqual(['npm install --save-dev @astryxdesign/core']);
    expect(receipt.data.installed).toBe(true);
    expect(receipt.data.fieldsAdded).toEqual([]);
  });

  it('runs a plain install, with no --save-dev and no package names, when both are declared but not installed', async () => {
    writePkg(tmpDir, {
      dependencies: {'@astryxdesign/cli': '^0.6.5'},
      optionalDependencies: {'@astryxdesign/core': '^0.6.5'},
    });
    const before = fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8');

    const {result: receipt, calls} = await withRecordingPm(() =>
      integrationInit({}, {cwd: tmpDir}),
    );
    expect(calls).toEqual(['npm install']);
    expect(receipt.data.installed).toBe(true);
    // Init itself never moves a declaration between fields.
    expect(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8')).toBe(before);
  });

  for (const field of ['dependencies', 'optionalDependencies']) {
    it(`does not install when both are declared in ${field} and installed`, async () => {
      writePkg(tmpDir, {
        [field]: {
          '@astryxdesign/cli': '^0.6.5',
          '@astryxdesign/core': '^0.6.5',
        },
      });
      for (const dep of ['@astryxdesign/cli', '@astryxdesign/core']) {
        installFake(tmpDir, dep);
      }

      const {result: receipt, calls} = await withRecordingPm(() =>
        integrationInit({}, {cwd: tmpDir}),
      );
      expect(calls).toEqual([]);
      expect(receipt.data.fieldsAdded).toEqual([]);
      expect(receipt.data.installed).toBe(false);
    });
  }

  it('installs when the deps resolve only through NODE_PATH, not an ancestor node_modules', async () => {
    const nodePathDir = path.join(tmpDir, 'global', 'node_modules');
    for (const dep of ['@astryxdesign/cli', '@astryxdesign/core']) {
      installFake(path.dirname(nodePathDir), dep);
    }
    const pkgDir = path.join(tmpDir, 'pkg');
    writePkg(pkgDir, {
      devDependencies: {
        '@astryxdesign/cli': '^0.6.5',
        '@astryxdesign/core': '^0.6.5',
      },
    });

    // Node reads NODE_PATH once at startup; re-read it so the lookup Node
    // would do from the package really includes the NODE_PATH folder.
    const savedNodePath = process.env.NODE_PATH;
    const initPaths = /** @type {any} */ (Module)._initPaths;
    try {
      process.env.NODE_PATH = nodePathDir;
      initPaths();
      expect(
        createRequire(path.join(pkgDir, 'package.json')).resolve.paths('@astryxdesign/core'),
      ).toContain(nodePathDir);

      const {result: receipt, calls} = await withRecordingPm(() =>
        integrationInit({}, {cwd: pkgDir}),
      );
      expect(calls).toEqual(['npm install']);
      expect(receipt.data.installed).toBe(true);
    } finally {
      if (savedNodePath === undefined) delete process.env.NODE_PATH;
      else process.env.NODE_PATH = savedNodePath;
      initPaths();
    }
  });

  it('adds both packages as dev dependencies when neither is declared', async () => {
    const {result: receipt, calls} = await withRecordingPm(() =>
      integrationInit({name: '@acme/widgets'}, {cwd: tmpDir}),
    );
    expect(calls).toEqual(['npm install --save-dev @astryxdesign/cli @astryxdesign/core']);
    expect(receipt.data.installed).toBe(true);
  });

  it('uses the detected package manager for a plain install', async () => {
    writePkg(tmpDir, {
      packageManager: 'pnpm@11.0.0',
      devDependencies: {
        '@astryxdesign/cli': '^0.6.5',
        '@astryxdesign/core': '^0.6.5',
      },
    });
    const {calls} = await withRecordingPm(() => integrationInit({}, {cwd: tmpDir}));
    expect(calls).toEqual(['pnpm install']);
  });

  it('same-name argument on existing uppercase package is a no-op', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({name: 'MyLib', version: '1.0.0'}) + '\n',
    );
    const receipt = await integrationInit({name: 'MyLib', noInstall: true}, {cwd: tmpDir});
    expect(receipt.data.name).toBe('MyLib');
    expect(receipt.data.fieldsAdded).toEqual([]);
  });



  // ── Install failure rollback (mutation-bound) ─────────────────────
  //
  // Three failure modes:
  //   1. The PM runs and exits non-zero (a real install failure).
  //   2. The PM cannot be spawned at all (PATH empty, binary missing).
  //   3. The PM runs past the 120 s timeout.
  // Every fixture makes init WRITE before the install (it adds `version`),
  // and each failure must roll package.json back to its byte-identical
  // original — so the added version is gone afterwards.

  /**
   * Create a fake package manager script that records the package.json it
   * saw, then exits 1 with a message.
   * @param {string} dir - temp dir to place the script in
   * @returns {string} the dir (put it first on PATH)
   */
  function makeFakePm(dir) {
    const binDir = path.join(dir, 'fake-bin');
    fs.mkdirSync(binDir, {recursive: true});
    const script =
      '#!/bin/sh\n/bin/cat package.json > "$0.seen.json"\necho "fake-pm: install refused" >&2\nexit 1\n';
    // Create fakes for every supported PM so detection can't escape to a real one.
    for (const name of ['npm', 'pnpm', 'yarn', 'bun']) {
      fs.writeFileSync(path.join(binDir, name), script, {mode: 0o755});
    }
    return binDir;
  }

  /**
   * What the fake PM saw in package.json when it ran.
   * @param {string} binDir
   * @returns {any}
   */
  function seenByFakePm(binDir) {
    const seen = fs
      .readdirSync(binDir)
      .filter(file => file.endsWith('.seen.json'));
    expect(seen).toHaveLength(1);
    return JSON.parse(fs.readFileSync(path.join(binDir, seen[0]), 'utf-8'));
  }

  it('rolls back package.json when PM exits non-zero (existing package)', async () => {
    const original = JSON.stringify({name: '@acme/test', exports: {}}) + '\n';
    const pkgFile = path.join(tmpDir, 'package.json');
    fs.writeFileSync(pkgFile, original);
    const originalBytes = fs.readFileSync(pkgFile);

    const fakeBin = makeFakePm(tmpDir);
    const nodeDir = path.dirname(process.execPath);
    const saved = process.env.PATH;
    try {
      process.env.PATH = `${fakeBin}:${nodeDir}`;
      await expect(
        integrationInit({}, {cwd: tmpDir}),
      ).rejects.toMatchObject({
        code: 'ERR_INSTALL_FAILED',
        message: expect.stringContaining('Dependency install failed (exit 1)'),
      });
    } finally {
      process.env.PATH = saved;
    }

    // Init wrote the version before the install ran...
    expect(seenByFakePm(fakeBin).version).toBe('1.0.0');
    // ...and the rollback removed it.
    const afterBytes = fs.readFileSync(pkgFile);
    expect(afterBytes.equals(originalBytes)).toBe(true);
    expect(JSON.parse(afterBytes.toString('utf-8')).version).toBeUndefined();
  });

  it('removes created package.json when PM exits non-zero (empty dir)', async () => {
    const pkgFile = path.join(tmpDir, 'package.json');
    expect(fs.existsSync(pkgFile)).toBe(false);

    const fakeBin = makeFakePm(tmpDir);
    const nodeDir = path.dirname(process.execPath);
    const saved = process.env.PATH;
    try {
      process.env.PATH = `${fakeBin}:${nodeDir}`;
      await expect(
        integrationInit({name: '@acme/widgets'}, {cwd: tmpDir}),
      ).rejects.toMatchObject({
        code: 'ERR_INSTALL_FAILED',
        message: expect.stringContaining('Dependency install failed'),
      });
    } finally {
      process.env.PATH = saved;
    }

    // Init created the file before the install ran, then removed it.
    expect(seenByFakePm(fakeBin)).toMatchObject({name: '@acme/widgets', version: '1.0.0'});
    expect(fs.existsSync(pkgFile)).toBe(false);
  });

  it('rolls back when the PM cannot be spawned (PATH empty)', async () => {
    const original = JSON.stringify({name: '@acme/spawn-fail', exports: {}}) + '\n';
    const pkgFile = path.join(tmpDir, 'package.json');
    fs.writeFileSync(pkgFile, original);
    const originalBytes = fs.readFileSync(pkgFile);

    const saved = process.env.PATH;
    try {
      process.env.PATH = '';
      // Spawn failure reports the spawn error, not "exit null".
      await expect(
        integrationInit({}, {cwd: tmpDir}),
      ).rejects.toMatchObject({
        code: 'ERR_INSTALL_FAILED',
        message: expect.stringContaining('could not be started: ENOENT'),
      });
    } finally {
      process.env.PATH = saved;
    }

    const afterBytes = fs.readFileSync(pkgFile);
    expect(afterBytes.equals(originalBytes)).toBe(true);
    expect(JSON.parse(afterBytes.toString('utf-8')).version).toBeUndefined();
  });

  describe('install failure modes (stubbed package manager)', () => {
    /**
     * Load a fresh init.mjs whose spawnSync returns `result` and records the
     * options it was called with and the package.json on disk at that moment.
     * @param {object} result what spawnSync returns
     */
    async function initWithSpawn(result) {
      /** @type {{command: string, args: string[], options: any, packageJson: string | null}[]} */
      const calls = [];
      vi.resetModules();
      vi.doMock('node:child_process', async importOriginal => ({
        ...(await importOriginal()),
        spawnSync: (command, args, options) => {
          const file = path.join(options.cwd, 'package.json');
          calls.push({
            command,
            args,
            options,
            packageJson: fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : null,
          });
          return result;
        },
      }));
      try {
        const mod = await import('./init.mjs');
        return {init: mod.integrationInit, calls};
      } finally {
        vi.doUnmock('node:child_process');
      }
    }

    afterEach(() => {
      vi.doUnmock('node:child_process');
      vi.resetModules();
    });

    /**
     * @param {string} code
     * @param {string} message
     */
    function spawnError(code, message) {
      return {
        pid: 0,
        output: [null, Buffer.from(''), Buffer.from('')],
        stdout: Buffer.from(''),
        stderr: Buffer.from(''),
        status: null,
        signal: code === 'ETIMEDOUT' ? 'SIGTERM' : null,
        error: Object.assign(new Error(message), {code}),
      };
    }

    const modes = [
      {
        label: 'exits non-zero',
        result: {
          pid: 1,
          output: [null, Buffer.from(''), Buffer.from('E404 not found')],
          stdout: Buffer.from(''),
          stderr: Buffer.from('E404 not found'),
          status: 1,
          signal: null,
        },
        message: 'Dependency install failed (exit 1).\nE404 not found',
      },
      {
        label: 'cannot be spawned',
        result: spawnError('ENOENT', 'spawnSync npm ENOENT'),
        message: 'could not be started: ENOENT',
      },
      {
        label: 'times out',
        result: spawnError('ETIMEDOUT', 'spawnSync npm ETIMEDOUT'),
        message: 'install timed out after 120 s',
      },
    ];

    for (const mode of modes) {
      it(`rolls back the written version when the install ${mode.label}`, async () => {
        const pkgFile = path.join(tmpDir, 'package.json');
        const original = JSON.stringify({name: '@acme/stubbed', exports: {}}, null, 2) + '\n';
        fs.writeFileSync(pkgFile, original);

        const {init, calls} = await initWithSpawn(mode.result);
        await expect(init({}, {cwd: tmpDir})).rejects.toMatchObject({
          code: 'ERR_INSTALL_FAILED',
          message: expect.stringContaining(mode.message),
        });

        expect(calls).toHaveLength(1);
        // Written before the install...
        expect(JSON.parse(calls[0].packageJson ?? '{}').version).toBe('1.0.0');
        // ...rolled back after it failed.
        expect(fs.readFileSync(pkgFile, 'utf-8')).toBe(original);
      });

      it(`removes the created package.json when the install ${mode.label}`, async () => {
        const pkgFile = path.join(tmpDir, 'package.json');
        const {init, calls} = await initWithSpawn(mode.result);
        await expect(init({name: '@acme/stubbed'}, {cwd: tmpDir})).rejects.toMatchObject({
          code: 'ERR_INSTALL_FAILED',
          message: expect.stringContaining(mode.message),
        });

        expect(calls).toHaveLength(1);
        expect(calls[0].packageJson).not.toBeNull();
        expect(fs.existsSync(pkgFile)).toBe(false);
      });
    }

    it('a timeout is not reported as a spawn failure', async () => {
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({name: '@acme/stubbed'}) + '\n',
      );
      const {init} = await initWithSpawn(spawnError('ETIMEDOUT', 'spawnSync npm ETIMEDOUT'));
      const error = await init({}, {cwd: tmpDir}).catch(e => e);
      expect(error.message).not.toContain('could not be started');
      expect(error.message).not.toContain('ETIMEDOUT');
    });

    it('runs the install with a 120 s timeout, through a shell only on Windows', async () => {
      const ok = {
        pid: 1,
        output: [null, Buffer.from(''), Buffer.from('')],
        stdout: Buffer.from(''),
        stderr: Buffer.from(''),
        status: 0,
        signal: null,
      };
      const {init, calls} = await initWithSpawn(ok);
      const receipt = await init({name: '@acme/stubbed'}, {cwd: tmpDir});

      expect(receipt.data.installed).toBe(true);
      expect(calls).toHaveLength(1);
      expect(calls[0].options.timeout).toBe(120_000);
      // On Windows, shell is true (one command string); elsewhere it's absent.
      if (process.platform === 'win32') {
        expect(calls[0].options.shell).toBe(true);
      } else {
        expect(calls[0].options.shell).toBeUndefined();
      }
    });

    describe('on win32', () => {
      const platform = Object.getOwnPropertyDescriptor(process, 'platform');

      beforeEach(() => {
        Object.defineProperty(process, 'platform', {...platform, value: 'win32'});
      });

      afterEach(() => {
        if (platform) Object.defineProperty(process, 'platform', platform);
      });

      it('runs the install through a shell, as one command string with no args', async () => {
        const ok = {
          pid: 1,
          output: [null, Buffer.from(''), Buffer.from('')],
          stdout: Buffer.from(''),
          stderr: Buffer.from(''),
          status: 0,
          signal: null,
        };
        const {init, calls} = await initWithSpawn(ok);
        const receipt = await init({name: '@acme/stubbed'}, {cwd: tmpDir});

        expect(receipt.data.installed).toBe(true);
        expect(calls).toHaveLength(1);
        expect(calls[0].command).toBe('npm install --save-dev @astryxdesign/cli @astryxdesign/core');
        expect(calls[0].args).toEqual([]);
        expect(calls[0].options.shell).toBe(true);
        expect(calls[0].options.timeout).toBe(120_000);
      });

      it('reports exit 9009 (command not recognized) as a spawn failure and rolls back', async () => {
        const pkgFile = path.join(tmpDir, 'package.json');
        const original = JSON.stringify({name: '@acme/stubbed', exports: {}}, null, 2) + '\n';
        fs.writeFileSync(pkgFile, original);
        const notRecognized = {
          pid: 1,
          output: [null, Buffer.from(''), Buffer.from("'npm' is not recognized as an internal or external command")],
          stdout: Buffer.from(''),
          stderr: Buffer.from("'npm' is not recognized as an internal or external command"),
          status: 9009,
          signal: null,
        };
        const {init, calls} = await initWithSpawn(notRecognized);
        const error = await init({}, {cwd: tmpDir}).catch(e => e);

        expect(error).toMatchObject({
          code: 'ERR_INSTALL_FAILED',
          message: expect.stringContaining('npm could not be started'),
        });
        expect(error.message).not.toContain('Dependency install failed');
        expect(calls).toHaveLength(1);
        expect(fs.readFileSync(pkgFile, 'utf-8')).toBe(original);
      });
    });

    it('treats exit 9009 as an ordinary install failure off Windows', async () => {
      if (process.platform === 'win32') return;
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({name: '@acme/stubbed'}) + '\n',
      );
      const {init} = await initWithSpawn({
        pid: 1,
        output: [null, Buffer.from(''), Buffer.from('')],
        stdout: Buffer.from(''),
        stderr: Buffer.from(''),
        status: 9009,
        signal: null,
      });
      await expect(init({}, {cwd: tmpDir})).rejects.toMatchObject({
        code: 'ERR_INSTALL_FAILED',
        message: expect.stringContaining('Dependency install failed (exit 9009)'),
      });
    });
  });

  // ── New-package: init → add → verify's structure validation ───────

  it('new package: init → add component → the structure validation verify runs passes', async () => {
    const receipt = await integrationInit(
      {name: '@acme/flow-test', noInstall: true},
      {cwd: tmpDir},
    );
    expect(receipt.data.fieldsAdded).toContain('exports');
    expect(receipt.data.packageCreated).toBe(true);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.exports).toEqual({});

    const added = await integrationAddComponent('FlowWidget', {cwd: tmpDir});
    expect(added.data.written).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'components', 'FlowWidget.tsx'))).toBe(true);
    const afterAdd = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(afterAdd.exports).toHaveProperty(['./components/FlowWidget']);

    // `integration verify` starts with this local structure validation.
    const validation = await validateLocalIntegration(tmpDir);
    expect(validation.issues.filter(issue => issue.severity === 'error')).toEqual([]);
  });
});
