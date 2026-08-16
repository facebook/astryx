// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file main.test.ts
 * @description Guards the workspace source-alias invariant in Storybook's
 *   Vite config. Every `@astryxdesign/*` dependency of this app must be
 *   aliased to package source in `.storybook/main.ts`. Without an alias,
 *   Vite resolves the workspace link through the package's export map,
 *   which points at `dist/` build output that does not exist in a fresh
 *   worktree — `storybook dev` then fails its dependency scan (#5092:
 *   `@astryxdesign/richtext`).
 */

import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
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
