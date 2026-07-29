// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next.test.mjs
 * @description Verifies withAstryx() (1) sets the global `source` resolve
 *   condition so @astryxdesign packages build from raw TS, and (2) pins
 *   `lexical`/`@lexical/*` to their built dist via resolve.alias — never their
 *   `source` raw-TS export, which Next's Babel cannot compile (`declare` class
 *   fields). Regression guard for the build-sandbox failure where the global
 *   `source` condition made lexical resolve to untranspiled TypeScript.
 */

import {describe, it, expect} from 'vitest';
import {createRequire} from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const {withAstryx, buildLexicalDistAliases} = require('./next.js');

// Resolve lexical relative to this monorepo (it's a devDependency of the repo).
const REPO_ROOT = path.resolve(import.meta.dirname, '../../..');

/** Run withAstryx's webpack fn and return the resulting resolve config. */
function getResolve(context) {
  const cfg = withAstryx();
  const webpackCfg = {resolve: {}, module: {rules: []}};
  cfg.webpack(webpackCfg, context);
  return webpackCfg.resolve;
}

describe('withAstryx resolve config', () => {
  it('sets the global source condition (so @astryxdesign builds from src)', () => {
    const resolve = getResolve({dir: REPO_ROOT, dev: false});
    expect(resolve.conditionNames).toContain('source');
    // Standard conditions must remain so normal packages still resolve.
    expect(resolve.conditionNames).toContain('import');
    expect(resolve.conditionNames).toContain('default');
  });

  it('keeps symlinks:false for the pnpm transpilePackages matcher', () => {
    const resolve = getResolve({dir: REPO_ROOT, dev: false});
    expect(resolve.symlinks).toBe(false);
  });

  it('aliases lexical + @lexical/* onto their built dist output', () => {
    const resolve = getResolve({dir: REPO_ROOT, dev: false});
    const alias = resolve.alias || {};
    const keys = Object.keys(alias);
    expect(keys.length).toBeGreaterThan(0);
    // Every alias must point at a dist file, never raw src.
    for (const k of keys) {
      expect(alias[k]).not.toMatch(/[\\/]src[\\/]/);
    }
  });
});

describe('buildLexicalDistAliases', () => {
  const alias = buildLexicalDistAliases(REPO_ROOT);

  it('pins the bare lexical entry to dist', () => {
    expect(alias['lexical$']).toBeTruthy();
    expect(alias['lexical$']).toMatch(/[\\/]lexical[\\/]dist[\\/]/);
    expect(alias['lexical$']).not.toMatch(/[\\/]src[\\/]/);
  });

  it('pins deep @lexical/react subpaths to dist (respecting export renames)', () => {
    // `./ReactProviderExtension` is renamed to LexicalReactProviderExtension in
    // dist — an exports-map rename a naive dir alias would miss.
    const composer = alias['@lexical/react/LexicalComposer$'];
    expect(composer).toBeTruthy();
    expect(composer).toMatch(/[\\/]@lexical[\\/]react[\\/]dist[\\/]/);
    expect(composer).not.toMatch(/[\\/]src[\\/]/);
  });

  it('never points any alias at a raw source file', () => {
    for (const k of Object.keys(alias)) {
      expect(alias[k], `${k} -> ${alias[k]}`).not.toMatch(/[\\/]src[\\/]/);
      expect(alias[k]).not.toMatch(/\.tsx?$/);
    }
  });

  it('returns an empty map when lexical is not resolvable', () => {
    // A directory with no node_modules → nothing to alias, no throw.
    const empty = buildLexicalDistAliases('/nonexistent-dir-xyz');
    expect(empty).toEqual({});
  });
});
