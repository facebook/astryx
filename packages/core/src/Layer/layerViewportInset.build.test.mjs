// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerViewportInset.build.test.mjs
 * @input Babel, the StyleX compiler, and the sources that cap a layer with
 *   the layer runtime's gutter module
 * @output Proves the shipped stylesheet carries the full viewport caps and
 *   gutters (spec:AST-059 FR1-FR3), not only their fallbacks
 * @position Regression test for the compiled CSS: the source-level checks in
 *   layerViewportInset.test.ts cannot see what StyleX emits
 *
 * Compiles the files the way the package build does (scripts/build-css.mjs):
 * each file through Babel with the StyleX plugin, then the collected rules
 * through `processStylexRules`, which inlines `defineConsts` members.
 */

import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import {beforeAll, describe, expect, it} from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..');
const ROOT = path.resolve(SRC, '../../..');
const require = createRequire(import.meta.url);

// The gutter module, which declares the constants, and every file that caps
// a layer or a layer's surface with them.
const FILES = [
  'Layer/layerViewportInset.stylex.ts',
  'Layer/useLayer.tsx',
  'Popover/Popover.tsx',
  'DropdownMenu/DropdownMenu.tsx',
  'DropdownMenu/DropdownMenuSubMenu.tsx',
];

async function compileCSS() {
  const rules = [];
  for (const file of FILES) {
    const filename = path.join(SRC, file);
    const result = await transformAsync(await fs.readFile(filename, 'utf8'), {
      babelrc: false,
      configFile: false,
      filename,
      presets: [
        [
          require.resolve('@babel/preset-typescript'),
          {isTSX: true, allExtensions: true},
        ],
        [require.resolve('@babel/preset-react'), {runtime: 'automatic'}],
      ],
      plugins: [
        [
          stylexBabelPlugin,
          {
            dev: false,
            runtimeInjection: false,
            genConditionalClasses: true,
            treeshakeCompensation: true,
            unstable_moduleResolution: {type: 'commonJS', rootDir: ROOT},
          },
        ],
      ],
    });
    rules.push(...(result?.metadata?.stylex ?? []));
  }
  return stylexBabelPlugin.processStylexRules(rules, false);
}

/** Every value a rule declares for `property`, in declaration order. */
function declaredValues(css, property) {
  const lists = [];
  for (const [, body] of css.matchAll(/\{([^{}]*)\}/g)) {
    const values = body
      .split(/;(?![^(]*\))/)
      .filter(declaration => declaration.startsWith(`${property}:`))
      .map(declaration => declaration.slice(property.length + 1));
    if (values.length > 0) {
      lists.push(values);
    }
  }
  return lists;
}

describe('the compiled layer caps and gutters (spec:AST-059)', () => {
  let css = '';
  beforeAll(async () => {
    css = await compileCSS();
  });

  it('leaves no StyleX constant behind as a variable nothing defines', () => {
    const defined = new Set(
      [...css.matchAll(/(--x[a-z0-9]+)\s*:/g)].map(match => match[1]),
    );
    const undefinedReferences = [
      ...new Set(
        [...css.matchAll(/var\((--x[a-z0-9]+)/g)].map(match => match[1]),
      ),
    ].filter(name => !defined.has(name));
    expect(undefinedReferences).toEqual([]);
  });

  it('caps the block axis at the dynamic viewport, after its 100vh fallback (FR3)', () => {
    const caps = declaredValues(css, 'max-height').filter(values =>
      values.some(value => value.includes('100dvb')),
    );
    expect(caps.length).toBeGreaterThan(0);
    for (const values of caps) {
      expect(values).toHaveLength(2);
      expect(values[0]).toContain('100vh');
      expect(values[0]).not.toContain('env(');
      expect(values[1]).toContain('100dvb');
      expect(values[1]).toContain('env(safe-area-inset-bottom, 0px)');
    }
    // The runtime's own cap, uncapped by a component's lower bound.
    expect(caps.some(values => values[1].startsWith('calc(calc(100dvb'))).toBe(
      true,
    );
  });

  it('caps the inline axis at the viewport with the safe-area gutters, after its fallback (FR2)', () => {
    const caps = declaredValues(css, 'max-width').filter(values =>
      values.some(value => value.includes('100vi')),
    );
    expect(caps.length).toBeGreaterThan(0);
    for (const values of caps) {
      expect(values[0]).toContain('100vw');
      expect(values.at(-1)).toContain('100vi');
      expect(values.at(-1)).toContain('env(safe-area-inset-left, 0px)');
    }
  });

  it('keeps the alignment-axis gutters clear of the safe-area insets (FR1)', () => {
    for (const [property, inset] of [
      ['margin-inline-start', 'env(safe-area-inset-left, 0px)'],
      ['margin-inline-end', 'env(safe-area-inset-right, 0px)'],
      ['margin-top', 'env(safe-area-inset-top, 0px)'],
      ['margin-bottom', 'env(safe-area-inset-bottom, 0px)'],
    ]) {
      const paired = declaredValues(css, property).filter(
        values => values.length === 2,
      );
      expect(paired.length, property).toBeGreaterThan(0);
      for (const values of paired) {
        expect(values[0], property).not.toContain('env(');
        expect(values[1], property).toContain(inset);
      }
    }
  });
});
