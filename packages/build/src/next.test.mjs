// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next.test.mjs
 * @description Verifies that `withAstryx()` routes an app's own
 *   `@astryxdesign/*` imports to the packages' `source` entries. The scoped
 *   module rule only governs requests issued from inside node_modules, so
 *   without the aliases an app resolves the library through `default` to dist
 *   and renders unstyled against source-compiled CSS.
 *
 *   Resolution is asserted through `enhanced-resolve` — the resolver webpack
 *   itself runs — because alias precedence is an ordering property of the
 *   resolver, not of the config object. Reading keys back out of
 *   `config.resolve.alias` cannot tell a winning entry from a shadowed one.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {withAstryx} = require('./next.js');
const {ResolverFactory, CachedInputFileSystem} = require('enhanced-resolve');

let appDir;

/** Files the fixture package needs on disk for the resolver to accept them. */
const CORE_FILES = [
  'src/index.ts',
  'src/AlertDialog/index.ts',
  'dist/index.js',
  'dist/AlertDialog/index.js',
];

/**
 * A consumer app with `@astryxdesign/core` installed the way npm lays it out,
 * so the helper resolves real manifests rather than the workspace it lives in.
 */
beforeAll(() => {
  appDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-next-'));
  const coreDir = path.join(appDir, 'node_modules/@astryxdesign/core');
  for (const file of CORE_FILES) {
    const target = path.join(coreDir, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, '');
  }
  fs.writeFileSync(
    path.join(coreDir, 'package.json'),
    JSON.stringify({
      name: '@astryxdesign/core',
      exports: {
        '.': {
          source: './src/index.ts',
          default: './dist/index.js',
        },
        './AlertDialog': {
          source: './src/AlertDialog/index.ts',
          default: './dist/AlertDialog/index.js',
        },
        './reset.css': {default: './src/reset.css'},
        './generated/*': {source: './src/generated/*'},
      },
    }),
  );
  fs.mkdirSync(path.join(appDir, 'src'), {recursive: true});
  fs.writeFileSync(path.join(appDir, 'src/page.tsx'), '');
});

afterAll(() => {
  fs.rmSync(appDir, {recursive: true, force: true});
});

/** Run the helper's webpack hook the way Next.js does. */
function resolveConfig(nextConfig = {}, config = {resolve: {}}) {
  return withAstryx(nextConfig).webpack(config, {dir: appDir});
}

/**
 * Resolve a request from the app's own source, through the resolver webpack
 * uses, under the config `withAstryx()` produced.
 */
function resolveFromApp(request, callerResolve = {}) {
  const {resolve} = resolveConfig({}, {resolve: callerResolve});
  const resolver = ResolverFactory.createResolver({
    fileSystem: new CachedInputFileSystem(fs, 4000),
    extensions: ['.ts', '.tsx', '.js'],
    conditionNames: ['import', 'default'],
    alias: resolve.alias,
    useSyncFileSystemCalls: true,
  });
  return resolver.resolveSync({}, path.join(appDir, 'src'), request);
}

/** The installed fixture's absolute path for one of its files. */
function corePath(...segments) {
  return path.join(appDir, 'node_modules/@astryxdesign/core', ...segments);
}

describe('withAstryx', () => {
  it('resolves the package root to its source entry', () => {
    expect(resolveFromApp('@astryxdesign/core')).toBe(corePath('src/index.ts'));
  });

  it('resolves documented subpath entry points, not just the root', () => {
    expect(resolveFromApp('@astryxdesign/core/AlertDialog')).toBe(
      corePath('src/AlertDialog/index.ts'),
    );
  });

  it('lets a caller prefix alias win over the generated entries', () => {
    const custom = path.join(appDir, 'custom');
    fs.mkdirSync(custom, {recursive: true});
    fs.writeFileSync(path.join(custom, 'index.js'), '');

    expect(
      resolveFromApp('@astryxdesign/core', {
        alias: {'@astryxdesign/core': custom},
      }),
    ).toBe(path.join(custom, 'index.js'));
  });

  it('lets a caller prefix alias win for subpaths too', () => {
    const custom = path.join(appDir, 'custom');
    fs.mkdirSync(path.join(custom, 'AlertDialog'), {recursive: true});
    fs.writeFileSync(path.join(custom, 'AlertDialog/index.js'), '');

    expect(
      resolveFromApp('@astryxdesign/core/AlertDialog', {
        alias: {'@astryxdesign/core': custom},
      }),
    ).toBe(path.join(custom, 'AlertDialog/index.js'));
  });

  it('lets a caller exact alias win for the bare specifier', () => {
    const pinned = corePath('dist/index.js');

    expect(
      resolveFromApp('@astryxdesign/core', {
        alias: {'@astryxdesign/core$': pinned},
      }),
    ).toBe(pinned);
  });

  it('keeps the generated subpaths when the caller pins only the root', () => {
    expect(
      resolveFromApp('@astryxdesign/core/AlertDialog', {
        alias: {'@astryxdesign/core$': corePath('dist/index.js')},
      }),
    ).toBe(corePath('src/AlertDialog/index.ts'));
  });

  it('preserves an array-shaped caller alias', () => {
    const pinned = corePath('dist/index.js');
    const {resolve} = resolveConfig(
      {},
      {resolve: {alias: [{name: '@astryxdesign/core', alias: pinned}]}},
    );

    expect(Array.isArray(resolve.alias)).toBe(true);
    expect(resolve.alias[0]).toEqual({
      name: '@astryxdesign/core',
      alias: pinned,
    });
    expect(
      resolve.alias.some(
        entry => entry.name === '@astryxdesign/core/AlertDialog',
      ),
    ).toBe(false);
  });

  it('skips export keys that ship no source condition', () => {
    const {resolve} = resolveConfig();

    expect(resolve.alias).not.toHaveProperty('@astryxdesign/core/reset.css$');
  });

  it('skips wildcard subpaths, which an exact alias cannot express', () => {
    const {resolve} = resolveConfig();

    const wildcards = Object.keys(resolve.alias).filter(request =>
      request.includes('*'),
    );
    expect(wildcards).toEqual([]);
  });

  it('leaves non-astryx requests to their normal resolution', () => {
    const {resolve} = resolveConfig();

    const foreign = Object.keys(resolve.alias).filter(
      request => !request.startsWith('@astryxdesign/'),
    );
    expect(foreign).toEqual([]);
  });

  it('keeps the global conditions as Next resolved them', () => {
    const {resolve} = resolveConfig(
      {},
      {resolve: {conditionNames: ['import']}},
    );

    expect(resolve.conditionNames).toEqual(['import']);
  });

  it('still scopes the source condition to astryx modules', () => {
    const {module: mod} = resolveConfig();

    expect(mod.rules[0].resolve.conditionNames).toEqual(['source', '...']);
    expect('@astryxdesign/core'.match(mod.rules[0].test)).toBeNull();
    expect(
      '/app/node_modules/@astryxdesign/core/src/index.ts'.match(
        mod.rules[0].test,
      ),
    ).not.toBeNull();
  });

  it('runs the caller webpack hook last', () => {
    const config = resolveConfig({
      webpack: cfg => ({...cfg, marker: true}),
    });

    expect(config.marker).toBe(true);
    expect(config.resolve.alias['@astryxdesign/core$']).toBeDefined();
  });
});
