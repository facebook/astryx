// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for configured theme resolution and built variant metadata.
 * @input Package/file module fixtures and user-controlled `astryx.theme` values
 * @output Coverage for optional package-root metadata enrichment and malformed config
 * @position CLI theme resolution regression tests
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {resolveTheme} from './resolve-theme.mjs';

const {loadModule, modules} = vi.hoisted(() => ({
  loadModule: vi.fn(),
  modules: new Map(),
}));

vi.mock('node:module', async importOriginal => ({
  ...(await importOriginal()),
  createRequire: () => loadModule,
}));

const dirs = [];
function fixture(pkg) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'resolve-theme-'));
  dirs.push(d);
  fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify(pkg));
  return d;
}
beforeEach(() => {
  modules.clear();
  loadModule.mockReset();
  loadModule.mockImplementation(specifier => {
    if (!modules.has(specifier)) throw new Error('Module not found');
    return modules.get(specifier);
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.ASTRYX_THEME;
  while (dirs.length) fs.rmSync(dirs.pop(), {recursive: true, force: true});
});

describe('resolveTheme — optional built metadata for package roots', () => {
  const variants = {badge: ['gray'], heading: ['hero']};
  const fonts = {body: 'Source Sans'};
  const source = {name: 'neutral', tokens: {}, fonts};
  const built = {name: 'neutral', __built: true, tokens: {}, variants};

  it.each([
    ['@astryxdesign/theme-neutral', '@astryxdesign/theme-neutral'],
    ['neutral', '@astryxdesign/theme-neutral'],
    ['custom-theme', 'custom-theme'],
  ])(
    'enriches %s from the resolved package built export',
    (configured, resolved) => {
      modules.set(resolved, {neutralTheme: source});
      modules.set(`${resolved}/built`, {
        neutralTheme: {...built, fonts: {body: 'Built Serif'}},
      });

      expect(resolveTheme(fixture({astryx: {theme: configured}}))).toEqual({
        name: 'neutral',
        variants,
        fonts,
      });
      expect(loadModule).toHaveBeenLastCalledWith(`${resolved}/built`);
    },
  );

  it('enriches an environment-selected package while preserving environment precedence', () => {
    process.env.ASTRYX_THEME = '@astryxdesign/theme-neutral';
    modules.set(process.env.ASTRYX_THEME, {default: source});
    modules.set(`${process.env.ASTRYX_THEME}/built`, {default: built});

    expect(
      resolveTheme(fixture({astryx: {theme: '@example/ignored'}})),
    ).toEqual({
      name: 'neutral',
      variants,
      fonts,
    });
    expect(loadModule).not.toHaveBeenCalledWith('@example/ignored');
  });

  it.each([{badge: ['source-only']}, {}])(
    'preserves explicit source variants %j',
    sourceVariants => {
      modules.set('@example/theme', {...source, variants: sourceVariants});
      modules.set('@example/theme/built', built);

      expect(
        resolveTheme(fixture({astryx: {theme: '@example/theme'}})),
      ).toEqual({
        name: 'neutral',
        variants: sourceVariants,
        fonts,
      });
      expect(loadModule).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ['unavailable', undefined],
    ['different theme', {...built, name: 'other'}],
    ['not built', {...built, __built: false}],
    ['no variant metadata', {name: 'neutral', __built: true, tokens: {}}],
  ])(
    'keeps source metadata when the optional companion is %s',
    (_label, companion) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      modules.set('@example/theme', source);
      if (companion) modules.set('@example/theme/built', companion);

      expect(
        resolveTheme(fixture({astryx: {theme: '@example/theme'}})),
      ).toEqual({
        name: 'neutral',
        variants: null,
        fonts,
      });
      expect(warn).not.toHaveBeenCalled();
    },
  );

  it.each([
    '@example/theme/built',
    '@example/theme/source',
    'custom-theme/source',
  ])('does not append /built to an explicit package subpath %s', specifier => {
    modules.set(specifier, source);
    modules.set(`${specifier}/built`, built);

    expect(resolveTheme(fixture({astryx: {theme: specifier}}))).toEqual({
      name: 'neutral',
      variants: null,
      fonts,
    });
    expect(loadModule).not.toHaveBeenCalledWith(`${specifier}/built`);
  });

  it.each(['relative', 'absolute'])(
    'leaves %s file resolution unchanged',
    form => {
      const cwd = fixture({});
      const absolute = path.join(cwd, 'theme.cjs');
      const specifier = form === 'relative' ? './theme.cjs' : absolute;
      fs.writeFileSync(
        path.join(cwd, 'package.json'),
        JSON.stringify({astryx: {theme: specifier}}),
      );
      modules.set(absolute, source);
      modules.set(`${absolute}/built`, built);

      expect(resolveTheme(cwd)).toEqual({
        name: 'neutral',
        variants: null,
        fonts,
      });
      expect(loadModule).toHaveBeenCalledExactlyOnceWith(absolute);
    },
  );
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
