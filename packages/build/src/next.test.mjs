// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next.test.mjs
 * @description Verifies that `withAstryx()` routes an app's own
 *   `@astryxdesign/*` imports to the packages' `source` entries. The scoped
 *   module rule only governs requests issued from inside node_modules, so
 *   without the aliases an app resolves the library through `default` to dist
 *   and renders unstyled against source-compiled CSS.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {withAstryx} = require('./next.js');

let appDir;

/**
 * A consumer app with `@astryxdesign/core` installed the way npm lays it out,
 * so the helper resolves real manifests rather than the workspace it lives in.
 */
beforeAll(() => {
  appDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-next-'));
  const coreDir = path.join(appDir, 'node_modules/@astryxdesign/core');
  fs.mkdirSync(coreDir, {recursive: true});
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
});

afterAll(() => {
  fs.rmSync(appDir, {recursive: true, force: true});
});

/** Run the helper's webpack hook the way Next.js does. */
function resolveConfig(nextConfig = {}, config = {resolve: {}}) {
  return withAstryx(nextConfig).webpack(config, {dir: appDir});
}

/** The installed fixture's absolute path for one of its source entries. */
function coreSource(...segments) {
  return path.join(
    appDir,
    'node_modules/@astryxdesign/core/src',
    ...segments,
  );
}

describe('withAstryx', () => {
  it('aliases the package root to its source entry', () => {
    const {resolve} = resolveConfig();

    expect(resolve.alias['@astryxdesign/core$']).toBe(coreSource('index.ts'));
  });

  it('aliases documented subpath entry points, not just the root', () => {
    const {resolve} = resolveConfig();

    expect(resolve.alias['@astryxdesign/core/AlertDialog$']).toBe(
      coreSource('AlertDialog/index.ts'),
    );
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
    const {resolve} = resolveConfig({}, {resolve: {conditionNames: ['import']}});

    expect(resolve.conditionNames).toEqual(['import']);
  });

  it('lets an explicit user alias win', () => {
    const pinned = '/pinned/core.js';
    const {resolve} = resolveConfig(
      {},
      {resolve: {alias: {'@astryxdesign/core$': pinned}}},
    );

    expect(resolve.alias['@astryxdesign/core$']).toBe(pinned);
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
