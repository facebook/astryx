// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  ENTRY,
  findSymlinks,
  inventory,
  launcherSource,
  removeBinDirs,
  runtimePackageJson,
} from './build-cli-standalone.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

/** @type {string} */
let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-standalone-test-'));
});
afterEach(() => {
  fs.rmSync(tmp, {recursive: true, force: true});
});

/**
 * @param {string} dir
 * @param {Record<string, unknown>} pkg
 */
function writePackage(dir, pkg) {
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
}

describe('runtimePackageJson', () => {
  const pkg = runtimePackageJson({version: '1.2.3', node: '>=22.13.0'});

  it('bundles the CLI and Core at exactly the runtime version', () => {
    expect(pkg.dependencies).toEqual({
      '@astryxdesign/cli': '1.2.3',
      '@astryxdesign/core': '1.2.3',
    });
    expect(pkg.bundleDependencies).toEqual([
      '@astryxdesign/cli',
      '@astryxdesign/core',
    ]);
  });

  it('stays unpublishable until publishing is wired up on purpose', () => {
    expect(pkg.private).toBe(true);
  });

  it('exposes the launcher as the astryx bin', () => {
    expect(pkg.bin).toEqual({astryx: ENTRY});
    expect(pkg.engines).toEqual({node: '>=22.13.0'});
  });
});

describe('launcherSource', () => {
  it('imports a bin the CLI package actually ships', () => {
    const specifier = launcherSource().match(
      /import '\.\.\/node_modules\/@astryxdesign\/cli\/([^']+)';/,
    )?.[1];
    expect(specifier).toBeDefined();
    const cliPkg = JSON.parse(
      fs.readFileSync(
        path.join(REPO_ROOT, 'packages/cli/package.json'),
        'utf8',
      ),
    );
    expect(`./${specifier}`).toBe(cliPkg.bin.astryx);
    expect(
      fs.existsSync(
        path.join(REPO_ROOT, 'packages/cli', /** @type {string} */ (specifier)),
      ),
    ).toBe(true);
  });
});

describe('inventory', () => {
  it('lists every package, scoped and nested, sorted by path', () => {
    const nm = path.join(tmp, 'node_modules');
    writePackage(path.join(nm, 'zod'), {
      name: 'zod',
      version: '4.0.0',
      license: 'MIT',
    });
    writePackage(path.join(nm, '@babel/core'), {
      name: '@babel/core',
      version: '7.0.0',
      license: 'MIT',
    });
    writePackage(path.join(nm, 'make-dir'), {
      name: 'make-dir',
      version: '3.1.0',
      license: {type: 'MIT'},
    });
    writePackage(path.join(nm, 'make-dir/node_modules/semver'), {
      name: 'semver',
      version: '6.3.1',
      licenses: [{type: 'ISC'}],
    });
    writePackage(path.join(nm, 'unlicensed'), {
      name: 'unlicensed',
      version: '1.0.0',
    });
    // pnpm bookkeeping and dot-dirs are not packages.
    fs.mkdirSync(path.join(nm, '.pnpm'), {recursive: true});
    fs.writeFileSync(path.join(nm, '.modules.yaml'), '');

    expect(inventory(tmp)).toEqual([
      {
        name: '@babel/core',
        version: '7.0.0',
        license: 'MIT',
        path: 'node_modules/@babel/core',
      },
      {
        name: 'make-dir',
        version: '3.1.0',
        license: 'MIT',
        path: 'node_modules/make-dir',
      },
      {
        name: 'semver',
        version: '6.3.1',
        license: 'ISC',
        path: 'node_modules/make-dir/node_modules/semver',
      },
      {
        name: 'unlicensed',
        version: '1.0.0',
        license: null,
        path: 'node_modules/unlicensed',
      },
      {name: 'zod', version: '4.0.0', license: 'MIT', path: 'node_modules/zod'},
    ]);
  });
});

describe('removeBinDirs + findSymlinks', () => {
  it('removes every .bin directory, nested ones too, leaving no symlinks', () => {
    const nm = path.join(tmp, 'node_modules');
    writePackage(path.join(nm, 'semver'), {name: 'semver', version: '7.0.0'});
    writePackage(path.join(nm, 'make-dir/node_modules/semver'), {
      name: 'semver',
      version: '6.0.0',
    });
    fs.mkdirSync(path.join(nm, '.bin'));
    fs.mkdirSync(path.join(nm, 'make-dir/node_modules/.bin'));
    fs.symlinkSync('../semver/package.json', path.join(nm, '.bin/semver'));
    fs.symlinkSync(
      '../semver/package.json',
      path.join(nm, 'make-dir/node_modules/.bin/semver'),
    );
    expect(findSymlinks(tmp)).toHaveLength(2);

    removeBinDirs(tmp);

    expect(findSymlinks(tmp)).toEqual([]);
    expect(fs.existsSync(path.join(nm, 'semver/package.json'))).toBe(true);
    expect(
      fs.existsSync(path.join(nm, 'make-dir/node_modules/semver/package.json')),
    ).toBe(true);
  });

  it('reports a symlink outside any .bin directory', () => {
    writePackage(path.join(tmp, 'node_modules/real'), {
      name: 'real',
      version: '1.0.0',
    });
    fs.symlinkSync('real', path.join(tmp, 'node_modules/alias'));

    removeBinDirs(tmp);

    expect(findSymlinks(tmp)).toEqual([path.join('node_modules', 'alias')]);
  });
});
