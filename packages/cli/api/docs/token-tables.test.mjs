// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The design tokens are written once, so each value has one home: every
 * category's table is a section of `foundations/all-tokens`, and a
 * Foundations value page shows its table through a token reference to that
 * guide, so no copy of the tables is listed, searched, or compiled.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {docs} from './docs.mjs';
import {search} from '../search/search.mjs';

const SLOW = 60_000;
const DOCS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../assets/docs',
);

/** Every authored CLI doc file, flat and placed (translation overlays aside). */
function authoredDocFiles() {
  return [DOCS_DIR, path.join(DOCS_DIR, 'tree')].flatMap(dir =>
    fs
      .readdirSync(dir)
      .filter(file => /^[\w-]+\.doc\.mjs$/.test(file))
      .map(file => path.join(dir, file)),
  );
}

describe('the design tokens', () => {
  it('are each written in exactly one doc table', async () => {
    /** @type {Map<string, string[]>} */
    const owners = new Map();
    for (const file of authoredDocFiles()) {
      const {docs: doc} = await import(file);
      for (const section of doc.sections ?? []) {
        for (const block of section.content ?? []) {
          if (block?.type !== 'table') continue;
          for (const row of block.rows) {
            if (!/^--[a-z]/.test(row[0])) continue;
            owners.set(row[0], [
              ...(owners.get(row[0]) ?? []),
              path.relative(DOCS_DIR, file),
            ]);
          }
        }
      }
    }
    expect(owners.size).toBeGreaterThan(200);
    expect([...owners].filter(([, files]) => files.length > 1)).toEqual([]);
  });

  it(
    'are not listed or searched twice',
    async () => {
      const listed = await docs();
      const names = listed.data.map(entry => entry.topic);
      expect(names).not.toContain('token-tables');
      expect(listed.meta.namespaces.map(entry => entry.topic)).not.toContain(
        'tokens',
      );

      const found = (await search('spacing tokens', {type: 'doc', limit: 50}))
        .data.results;
      const holders = found
        .filter(
          hit =>
            hit.section === 'spacing-tokens' ||
            hit.name === 'foundations/all-tokens',
        )
        .map(hit => hit.name);
      expect(new Set(holders)).toEqual(new Set(['foundations/all-tokens']));
    },
    SLOW,
  );

  it(
    "answer a value page's token reference, in every language",
    async () => {
      for (const options of [{}, {dense: true}, {zh: true}]) {
        const read = await docs('foundations/color', null, options);
        const text = JSON.stringify(read.data.sections);
        expect(text).not.toContain('[token-ref');
        expect(text).toContain('--color-accent');
      }
      const section = await docs('foundations/spacing', 'scale');
      expect(JSON.stringify(section.data)).toContain('--spacing-4');
    },
    SLOW,
  );
});
