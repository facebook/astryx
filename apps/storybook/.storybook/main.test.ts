// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file main.test.ts
 * @description Guards two things that both keep `storybook dev` working from
 *   a cold clone, at two different resolution stages.
 *
 *   1. Vite's module graph: every `@astryxdesign/*` dependency of this app
 *      must be aliased to package source in `.storybook/main.ts`. Without an
 *      alias, Vite resolves the workspace link through the package's export
 *      map, which points at `dist/` build output that does not exist in a
 *      fresh worktree — `storybook dev` then fails its dependency scan
 *      (#5092: `@astryxdesign/richtext`).
 *   2. Storybook's own config loader: `main.ts` is evaluated by Node's ESM
 *      resolver before any alias from it is in play, so the specifiers
 *      `main.ts` itself imports must also resolve unbuilt (#5128:
 *      `@astryxdesign/build/vite` → `dist/vite.mjs`).
 */

import {describe, it, expect} from 'vitest';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mainTs = readFileSync(path.join(__dirname, 'main.ts'), 'utf8');
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'),
) as {dependencies?: Record<string, string>};

// The Vite `resolve.alias` block only — the StyleX `aliases` block above it
// carries the same keys but does not drive Vite's dev-mode resolution.
const viteAliasBlock = mainTs.slice(mainTs.indexOf('alias: {'));

const workspaceDeps = Object.keys(pkg.dependencies ?? {}).filter(name =>
  name.startsWith('@astryxdesign/'),
);

/**
 * Specifiers `main.ts` imports at runtime. `import type` statements are
 * erased before Node ever sees them, so they are excluded — only the
 * specifiers the config loader actually has to resolve count.
 */
const runtimeImports = [
  ...mainTs.matchAll(/^import\s+(?!type\s)(?:[^;]*?from\s+)?'([^']+)';/gm),
].map(match => match[1]);

describe('storybook main.ts workspace source aliases', () => {
  it('sees the @astryxdesign workspace dependencies', () => {
    expect(workspaceDeps).not.toHaveLength(0);
  });

  it.each(workspaceDeps)('aliases %s to source', dep => {
    // Each workspace dependency must appear as a bare alias key in Vite's
    // `resolve.alias` so dev-mode resolution never falls back to the export
    // map's dist/ entry point, which is missing until the package is built.
    expect(viteAliasBlock).toContain(`'${dep}':`);
  });
});

describe('storybook main.ts config-loader imports (#5128)', () => {
  it('sees the runtime imports of main.ts', () => {
    expect(runtimeImports).not.toHaveLength(0);
  });

  it('imports no workspace package by bare specifier', () => {
    // A bare `@astryxdesign/*` specifier here goes through that package's
    // export map, and every workspace export map points at `dist/`. The
    // Storybook config loader resolves it with plain Node ESM, so no Vite
    // alias can rescue it — the only cold-clone-safe form is a path into
    // the package's own source.
    expect(
      runtimeImports.filter(spec => spec.startsWith('@astryxdesign/')),
    ).toEqual([]);
  });

  it('reaches the Vite plugin through source that exists unbuilt', () => {
    const spec = runtimeImports.find(s => s.includes('packages/build'));
    expect(spec, 'main.ts should import the Astryx Vite plugin').toBeDefined();

    const resolved = path.resolve(__dirname, spec as string);
    expect(resolved).toContain(path.join('packages', 'build', 'src'));
    expect(existsSync(resolved)).toBe(true);
  });

  it('evaluates and returns a Vite config carrying the Astryx plugins', async () => {
    // The behavioral half: on a worktree without `packages/build/dist` this
    // import is what fails today. It is green on an already-built checkout
    // either way, which is why the structural assertions above carry the
    // permanent guard.
    const {default: config} = (await import('./main.ts')) as {
      default: {
        viteFinal: (
          config: Record<string, unknown>,
          options: unknown,
        ) => Promise<{
          plugins: {name?: string}[];
          resolve: {alias: Record<string, string>};
        }>;
      };
    };

    const viteConfig = await config.viteFinal({}, {});

    expect(viteConfig.plugins.map(plugin => plugin?.name)).toContain(
      'astryx-css-layer-order',
    );
    expect(viteConfig.resolve.alias['@astryxdesign/core']).toMatch(
      /packages[\\/]core[\\/]src$/,
    );
  });
});
