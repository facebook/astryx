// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The layout.expand receipt discloses demo media replaced in the template
 * blocks it splices. Blocks are picked by what their source contains, not by
 * name, so catalog renames do not break the suite.
 */

import {describe, it, expect, beforeAll} from 'vitest';
import * as fs from 'node:fs';
import {layoutExpand} from '../layout.mjs';
import {discoverTemplates} from '../../template/template.mjs';
import {buildRegistry} from '../../../foundation/xle/registry.mjs';

const SLOW = 60_000;
const FIXTURE_REF = /\/template-assets\/[\w.-]+\.\w+/g;

beforeAll(async () => {
  await buildRegistry();
}, 120_000);

/** @param {string} name */
const hintKey = name => name.toLowerCase().replace(/[^a-z0-9]/g, '');

/** @type {Promise<Array<{hint: string, refs: number}>> | undefined} */
let catalog;

/**
 * Template blocks a `{hint}` resolves to unambiguously, with the number of demo
 * media references in each one's source.
 * @returns {Promise<Array<{hint: string, refs: number}>>}
 */
function catalogBlocks() {
  catalog ??= discoverTemplates().then(found => {
    const all = /** @type {Array<{dirName: string, type: string, filePath: string}>} */ (
      found
    ).filter(t => t.type === 'block' && t.filePath && fs.existsSync(t.filePath));
    const seen = new Map();
    for (const t of all) seen.set(hintKey(t.dirName), (seen.get(hintKey(t.dirName)) ?? 0) + 1);
    return all
      .filter(t => seen.get(hintKey(t.dirName)) === 1)
      .map(t => ({
        hint: hintKey(t.dirName),
        refs: (fs.readFileSync(t.filePath, 'utf-8').match(FIXTURE_REF) ?? []).length,
      }));
  });
  return catalog;
}

describe('layout.expand receipt - replaced demo media', () => {
  it('counts the demo media of a spliced block once, however often it is referenced', async () => {
    const block = (await catalogBlocks()).find(b => b.refs > 0);
    if (!block) throw new Error('no template block carries demo media');
    const res = await layoutExpand(`V > {${block.hint}}*3`);
    expect(res.type).toBe('layout.expand');
    expect(res.data.blocksReferenced).toHaveLength(1);
    expect(res.data.demoMediaReplaced).toBe(block.refs);
    expect(res.data.code).not.toContain('/template-assets/');
  }, SLOW);

  it('sums the demo media of every spliced block', async () => {
    const [a, b] = (await catalogBlocks()).filter(x => x.refs > 0);
    if (!b) throw new Error('fewer than two template blocks carry demo media');
    const res = await layoutExpand(`V > {${a.hint}} + {${b.hint}}`);
    expect(res.data.demoMediaReplaced).toBe(a.refs + b.refs);
  }, SLOW);

  it('reports 0 when nothing spliced carries demo media', async () => {
    const plain = (await catalogBlocks()).find(b => b.refs === 0);
    if (!plain) throw new Error('every template block carries demo media');
    expect((await layoutExpand(`V > {${plain.hint}}`)).data.demoMediaReplaced).toBe(0);
    expect((await layoutExpand('V > B"Save"')).data.demoMediaReplaced).toBe(0);
  }, SLOW);
});
