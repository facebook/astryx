// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file readPackageTsconfig(): the package's own config, a solution-style
 * config's references, a monorepo root's config for a local package but not
 * an app's above an installed one, ambient declaration files, and a config
 * with errors.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {readPackageTsconfig} from './package-tsconfig.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

/** @type {string} */
let root;

beforeEach(() => {
  root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-tsconfig-')),
  );
});

afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

/**
 * @param {string} rel
 * @param {string | object} content
 */
function write(rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(
    file,
    typeof content === 'string' ? content : JSON.stringify(content),
  );
  return file;
}

const OPTIONS = {strict: true, jsx: 'react-jsx', paths: {'@/*': ['./src/*']}};

describe('readPackageTsconfig', () => {
  it('reads defaults without a config, and the config the package has, with the declaration files it includes', () => {
    const source = write('src/Button.tsx', 'export {};\n');
    const defaults = readPackageTsconfig(ts, root, [source]);
    expect(defaults.options).toMatchObject({
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      noEmit: true,
    });
    expect(defaults.declarations).toEqual([]);
    expect(defaults.error).toBeUndefined();

    write('tsconfig.json', {
      compilerOptions: OPTIONS,
      include: ['src', 'types'],
    });
    const ambient = write('types/ambient.d.ts', 'interface A {}\n');
    const global = write('src/global.ts', 'declare global {}\nexport {};\n');

    const own = readPackageTsconfig(ts, root, [source]);

    expect(own.options.paths).toEqual(OPTIONS.paths);
    expect(own.declarations.sort()).toEqual([global, ambient].sort());
  });

  it("follows a solution-style config's references, at any depth, to the config that includes the sources", () => {
    const source = write('src/Button.tsx', 'export {};\n');
    write('tsconfig.json', {files: [], references: [{path: './lib.json'}]});
    write('lib.json', {files: [], references: [{path: './app.json'}]});
    write('app.json', {compilerOptions: OPTIONS, include: ['src']});

    const project = readPackageTsconfig(ts, root, [source]);

    expect(project.error).toBeUndefined();
    expect(project.options.paths).toEqual(OPTIONS.paths);
  });

  it("reads a monorepo root's config for a local package, and not an app's config for a package installed below it", () => {
    write('tsconfig.json', {compilerOptions: OPTIONS});
    const local = path.join(root, 'packages', 'local');
    const installed = path.join(root, 'node_modules', '@acme', 'widgets');
    const localSource = write('packages/local/src/Button.tsx', 'export {};\n');
    const installedSource = write(
      'node_modules/@acme/widgets/src/Button.tsx',
      'export {};\n',
    );

    expect(readPackageTsconfig(ts, local, [localSource]).options.paths).toEqual(
      OPTIONS.paths,
    );
    expect(
      readPackageTsconfig(ts, installed, [installedSource]).options.paths,
    ).toBeUndefined();
  });

  it('reports a config with errors instead of reading defaults', () => {
    const source = write('src/Button.tsx', 'export {};\n');
    write('tsconfig.json', {extends: './missing-base.json'});
    expect(readPackageTsconfig(ts, root, [source]).error).toMatch(
      /^tsconfig\.json: .*missing-base\.json/,
    );

    write('tsconfig.json', '{"compilerOptions": ');
    expect(readPackageTsconfig(ts, root, [source]).error).toMatch(
      /^tsconfig\.json: /,
    );
  });
});
