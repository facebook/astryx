// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file component-size.test.mjs
 * Pins how the PR size report measures one component import: the JavaScript
 * it pulls in transitively (other packages external) and the stylesheet rules
 * that JavaScript references.
 */

import fs from 'node:fs';
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  bundleImport,
  classNamesIn,
  measureComponentImport,
  packageStylesheetPath,
  rulesForClasses,
} = require('./component-size.js');

const roots = [];
function tree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-size-'));
  roots.push(root);
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
    fs.writeFileSync(path.join(root, file), content);
  }
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});

describe('component import size', () => {
  it('bundles modules the import reaches and leaves other packages external', () => {
    const root = tree({
      'dist/Card/index.js': "export {Card} from './Card.js';\n",
      'dist/Card/Card.js':
        "import {jsx} from 'react/jsx-runtime';\nimport {helper} from '../shared/helper.js';\nexport function Card() { return jsx('div', {className: 'xcard1 ' + helper()}); }\n",
      'dist/shared/helper.js':
        "export function helper() { return 'xhelp22'; }\n",
      'dist/Other/index.js': "export const unrelated = 'xother9';\n",
    });
    const js = bundleImport(path.join(root, 'dist/Card/index.js'));
    expect(js).toContain('xhelp22');
    expect(js).toContain('react/jsx-runtime');
    expect(js).not.toContain('xother9');
    expect([...classNamesIn(js)].sort()).toEqual(['xcard1', 'xhelp22']);
  });

  it('keeps only the rules whose selectors name a referenced class, with their at-rules', () => {
    const css = [
      '@layer reset, astryx-base, astryx-theme;',
      '@layer astryx-base{',
      '.xcard1{color:red}',
      '.xother9{color:blue}',
      '@media (pointer: coarse){.xcard1:active{opacity:.5}.xother9{opacity:1}}',
      '@keyframes xspin1{to{transform:rotate(1turn)}}',
      '}',
    ].join('');
    const kept = rulesForClasses(css, new Set(['xcard1']));
    expect(kept).toBe(
      '@layer astryx-base{.xcard1{color:red}@media (pointer: coarse){.xcard1:active{opacity:.5}}}',
    );
    expect(rulesForClasses(css, new Set())).toBe('');
  });

  it('measures gzip JavaScript and CSS, and null for a missing entry', () => {
    const root = tree({
      'package.json': JSON.stringify({
        exports: {
          './reset.css': './dist/reset.css',
          './astryx.css': {default: './dist/astryx.css'},
        },
      }),
      'dist/reset.css': '*{margin:0}',
      'dist/astryx.css': '.xcard1{color:red}.xother9{color:blue}',
      'dist/Card/index.js': "export const Card = () => 'xcard1';\n",
    });
    const sheet = packageStylesheetPath(root);
    expect(sheet).toBe(path.join(root, 'dist/astryx.css'));
    const size = measureComponentImport(
      path.join(root, 'dist/Card/index.js'),
      fs.readFileSync(sheet, 'utf8'),
    );
    expect(size.importGzipBytes).toBeGreaterThan(0);
    expect(size.cssGzipBytes).toBeGreaterThan(0);
    expect(
      measureComponentImport(path.join(root, 'dist/Nope/index.js'), ''),
    ).toEqual({
      importGzipBytes: null,
      cssGzipBytes: null,
    });
  });
});
