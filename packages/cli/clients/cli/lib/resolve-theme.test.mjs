// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for resolveTheme's handling of a malformed `astryx.theme` and of
 * the custom-variant metadata a built theme module exports.
 * The field is user/third-party-controlled config, so a non-string value must
 * degrade to null (like an unknown slug) rather than crash `astryx component`
 * with a raw TypeError from specifier.startsWith(...).
 */

import {describe, it, expect, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {resolveTheme} from './resolve-theme.mjs';

const dirs = [];
function fixture(pkg) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'resolve-theme-'));
  dirs.push(d);
  fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify(pkg));
  return d;
}
afterEach(() => {
  delete process.env.ASTRYX_THEME;
  while (dirs.length) fs.rmSync(dirs.pop(), {recursive: true, force: true});
});

describe('resolveTheme — malformed astryx.theme degrades to null', () => {
  it('numeric theme → null', () => {
    expect(resolveTheme(fixture({astryx: {theme: 123}}))).toBeNull();
  });
  it('array theme → null', () => {
    expect(resolveTheme(fixture({astryx: {theme: ['a']}}))).toBeNull();
  });
  it('object theme → null', () => {
    expect(resolveTheme(fixture({astryx: {theme: {x: 1}}}))).toBeNull();
  });
  it('boolean theme → null', () => {
    expect(resolveTheme(fixture({astryx: {theme: true}}))).toBeNull();
  });
  it('empty-string theme → null', () => {
    expect(resolveTheme(fixture({astryx: {theme: ''}}))).toBeNull();
  });
  it('no theme field → null', () => {
    expect(resolveTheme(fixture({name: 'p'}))).toBeNull();
  });
});

describe('resolveTheme — custom variant metadata', () => {
  /** @param {string} source */
  function themeModule(source) {
    const cwd = fixture({astryx: {theme: './theme.cjs'}});
    fs.writeFileSync(path.join(cwd, 'theme.cjs'), source);
    return cwd;
  }

  it('reads the themeVariants export beside the theme object', () => {
    const cwd = themeModule(`module.exports = {
      acmeTheme: {name: 'acme', __built: true, tokens: {}},
      themeVariants: {banner: {container: ['glass'], status: ['critical']}},
    };`);

    expect(resolveTheme(cwd)).toEqual({
      name: 'acme',
      variants: {banner: {container: ['glass'], status: ['critical']}},
      fonts: null,
    });
  });

  it('does not read CLI metadata from the theme object itself', () => {
    const cwd = themeModule(`module.exports = {
      acmeTheme: {name: 'acme', tokens: {}, variants: {badge: ['gray']}},
    };`);

    expect(resolveTheme(cwd)?.variants).toBeNull();
  });

  it('resolves variants to null for a module without the export', () => {
    const cwd = themeModule(`module.exports = {
      acmeTheme: {name: 'acme', __built: true, tokens: {}},
    };`);

    expect(resolveTheme(cwd)?.variants).toBeNull();
  });
});
