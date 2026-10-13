// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for reading direct dependency versions from project
 * lockfiles without invoking a package manager.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {findLockfile, readLockedVersions} from './locked-versions.mjs';

/** @type {string} */
let base;

beforeEach(() => {
  base = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-locked-versions-'));
});

afterEach(() => {
  fs.rmSync(base, {recursive: true, force: true});
});

/** @param {string} file @param {unknown} value */
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

/** @param {string} name */
function makeProject(name) {
  const dir = path.join(base, name);
  writeJson(path.join(dir, 'package.json'), {name});
  return dir;
}

describe('readLockedVersions', () => {
  it('reads a pnpm workspace member from the root lockfile importers', () => {
    const app = makeProject('app');
    fs.writeFileSync(
      path.join(base, 'pnpm-lock.yaml'),
      [
        "lockfileVersion: '9.0'",
        '',
        'importers:',
        '',
        '  .:',
        '    devDependencies:',
        "      '@acme/ui':",
        '        specifier: ^3.0.0',
        '        version: 3.0.0',
        '',
        '  app:',
        '    dependencies:',
        "      '@astryxdesign/core':",
        '        specifier: ^0.7.0',
        '        version: 0.7.0(react@19.2.0)',
        "      '@acme/ui':",
        '        specifier: ^1.0.0',
        '        version: 1.0.1',
        '      local-lib:',
        '        specifier: workspace:*',
        '        version: link:../lib',
      ].join('\n'),
    );

    expect(findLockfile(app)?.dir).toBe(base);
    const {versions} = readLockedVersions(app, {
      '@astryxdesign/core': '^0.7.0',
      '@acme/ui': '^1.0.0',
      'local-lib': 'workspace:*',
    });
    expect(Object.fromEntries(versions)).toEqual({
      '@astryxdesign/core': '0.7.0',
      '@acme/ui': '1.0.1',
    });
  });

  it('reads package-lock.json, preferring the workspace member entry', () => {
    const app = makeProject('app');
    writeJson(path.join(base, 'package.json'), {
      name: 'workspace',
      workspaces: ['app'],
    });
    writeJson(path.join(base, 'package-lock.json'), {
      lockfileVersion: 3,
      packages: {
        'node_modules/@acme/ui': {version: '2.0.0'},
        'app/node_modules/@acme/ui': {version: '1.0.0'},
        'node_modules/@astryxdesign/core': {version: '0.7.0'},
      },
    });

    const {versions} = readLockedVersions(app, {
      '@acme/ui': '^1.0.0',
      '@astryxdesign/core': '^0.7.0',
    });
    expect(Object.fromEntries(versions)).toEqual({
      '@acme/ui': '1.0.0',
      '@astryxdesign/core': '0.7.0',
    });
  });

  it('reads yarn classic and Berry lockfiles by descriptor', () => {
    const classic = makeProject('classic');
    fs.writeFileSync(
      path.join(classic, 'yarn.lock'),
      [
        '# yarn lockfile v1',
        '',
        '"@acme/ui@^1.0.0", "@acme/ui@^1.0.2":',
        '  version "1.0.4"',
        '',
        '"@acme/ui@^2.0.0":',
        '  version "2.1.0"',
      ].join('\n'),
    );
    expect(
      Object.fromEntries(
        readLockedVersions(classic, {'@acme/ui': '^1.0.0'}).versions,
      ),
    ).toEqual({'@acme/ui': '1.0.4'});

    const berry = makeProject('berry');
    fs.writeFileSync(
      path.join(berry, 'yarn.lock'),
      [
        '__metadata:',
        '  version: 8',
        '',
        '"@astryxdesign/core@npm:^0.7.0":',
        '  version: 0.7.2',
        '  resolution: "@astryxdesign/core@npm:0.7.2"',
      ].join('\n'),
    );
    expect(
      Object.fromEntries(
        readLockedVersions(berry, {'@astryxdesign/core': '^0.7.0'}).versions,
      ),
    ).toEqual({'@astryxdesign/core': '0.7.2'});
  });

  it('reads the text bun.lock', () => {
    const app = makeProject('app');
    fs.writeFileSync(
      path.join(app, 'bun.lock'),
      `{\n  "lockfileVersion": 1,\n  "packages": {\n    "@acme/ui": ["@acme/ui@1.2.3", "", {}, "sha512-x"],\n  },\n}\n`,
    );
    expect(
      Object.fromEntries(
        readLockedVersions(app, {'@acme/ui': '^1.0.0'}).versions,
      ),
    ).toEqual({'@acme/ui': '1.2.3'});
  });

  it('yields no pins without a lockfile or from an unreadable one', () => {
    const none = makeProject('none');
    expect(readLockedVersions(none, {'@acme/ui': '1.0.0'}).versions.size).toBe(
      0,
    );

    const broken = makeProject('broken');
    fs.writeFileSync(path.join(broken, 'package-lock.json'), '{not json');
    expect(
      readLockedVersions(broken, {'@acme/ui': '1.0.0'}).versions.size,
    ).toBe(0);
  });

  it('ignores a lockfile above a project that is not its workspace', () => {
    const app = makeProject(path.join('apps', 'web'));
    writeJson(path.join(base, 'package.json'), {
      name: 'workspace',
      workspaces: ['packages/*'],
    });
    writeJson(path.join(base, 'package-lock.json'), {
      lockfileVersion: 3,
      packages: {
        'node_modules/@acme/ui': {version: '1.0.0'},
      },
    });

    expect(findLockfile(app)?.dir).toBe(base);
    expect(readLockedVersions(app, {'@acme/ui': '^1.0.0'}).versions.size).toBe(
      0,
    );
  });
});
