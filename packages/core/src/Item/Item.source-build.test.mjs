// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Item.source-build.test.mjs
 * @input Uses Babel, the core build config, and the Item and ItemSwipeLayer
 *   sources
 * @output Verifies the shipped Item module imports the swipe layer with the
 *   row (no lazy chunk, which could miss a first swipe) and reaches the
 *   gesture only through it
 * @position Regression test for the import graph of the shipped Item module
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseAsync, transformAsync} from '@babel/core';
import {describe, expect, it} from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = path.resolve(__dirname, '../..');

/**
 * The relative specifiers a compiled module imports, split into the static
 * ones (loaded with the module) and the dynamic ones (loaded on demand). Type
 * imports are gone by now: this is the graph a consumer's bundler sees.
 */
async function compiledImportsOf(fileName) {
  const file = path.join(__dirname, fileName);
  const source = await fs.readFile(file, 'utf8');
  const result = await transformAsync(source, {
    babelrc: false,
    configFile: path.join(CORE_ROOT, 'babel.config.json'),
    filename: file,
  });
  const ast = await parseAsync(result.code, {
    babelrc: false,
    configFile: false,
    filename: `${file}.js`,
    sourceType: 'module',
  });
  const statics = [];
  const dynamics = [];
  const visit = node => {
    if (node == null || typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (node.type === 'ImportDeclaration') {
      statics.push(node.source.value);
    } else if (
      node.type === 'ImportExpression' ||
      (node.type === 'CallExpression' && node.callee.type === 'Import')
    ) {
      const argument =
        node.type === 'ImportExpression' ? node.source : node.arguments[0];
      dynamics.push(argument.value);
    }
    for (const key of Object.keys(node)) {
      if (
        key !== 'loc' &&
        key !== 'leadingComments' &&
        key !== 'trailingComments'
      ) {
        visit(node[key]);
      }
    }
  };
  visit(ast.program.body);
  return {statics, dynamics};
}

describe('the shipped Item module and the swipe gesture', () => {
  it('imports the swipe layer with the row, with no lazy chunk, and the gesture only through it', async () => {
    const {statics, dynamics} = await compiledImportsOf('Item.tsx');
    // A lazily loaded layer could miss a row's first swipe while its chunk
    // was on the way: the layer comes with the module, the gesture with it.
    expect(statics).toContain('./ItemSwipeLayer.js');
    expect(statics).not.toContainEqual(expect.stringMatching(/useSwipeAction/));
    expect(dynamics).toEqual([]);
  });

  it('keeps the gesture inside the swipe layer', async () => {
    const {statics} = await compiledImportsOf('ItemSwipeLayer.tsx');
    expect(statics).toContain('./useSwipeAction.js');
  });
});
