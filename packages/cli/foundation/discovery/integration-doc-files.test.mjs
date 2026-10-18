// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file integrationDocFiles(): each root's doc files, and a nested root's
 * files given to that root.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {integrationDocFiles} from './integration-doc-files.mjs';

/** @type {string} */
let pkg;

beforeEach(() => {
  pkg = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-doc-files-'));
});

afterEach(() => {
  fs.rmSync(pkg, {recursive: true, force: true});
});

/**
 * @param {string} rel
 * @param {string} text
 */
function write(rel, text) {
  const file = path.join(pkg, rel);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, text);
}

describe('integrationDocFiles', () => {
  it("finds each root's docs and overlays, and gives a nested root's files to that root", () => {
    for (const rel of [
      'src/Badge.doc.mjs',
      'src/Badge.tsx',
      'src/docs/guide.doc.mjs',
      'src/docs/guide.doc.zh.mjs',
      'templates/Hero.doc.mjs',
      'templates/Old.template.mjs',
      'templates/Hero.tsx',
      'src/__tests__/Fixture.doc.mjs',
      'src/node_modules/x/X.doc.mjs',
    ]) {
      write(rel, 'export default {};\n');
    }

    const files = integrationDocFiles({
      components: path.join(pkg, 'src'),
      docs: path.join(pkg, 'src', 'docs'),
      templates: path.join(pkg, 'templates'),
    });

    expect(
      files.map(f => [
        path.relative(pkg, f.path).split(path.sep).join('/'),
        f.root,
      ]),
    ).toEqual([
      ['src/Badge.doc.mjs', 'components'],
      ['src/docs/guide.doc.mjs', 'docs'],
      ['src/docs/guide.doc.zh.mjs', 'docs-overlay'],
      ['templates/Hero.doc.mjs', 'templates'],
      ['templates/Old.template.mjs', 'templates'],
    ]);
  });
});
