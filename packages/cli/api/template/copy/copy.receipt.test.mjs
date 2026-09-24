// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The template.copy receipt discloses replaced demo media. Templates are
 * picked by what their source contains, not by slug, so catalog renames do not
 * break the suite.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {template, discoverTemplates} from '../template.mjs';

const SLOW = 60_000;
const FIXTURE_REF = /\/template-assets\/[\w.-]+\.(\w+)/g;
const VIDEO = new Set(['mp4', 'webm', 'mov', 'ogv', 'm4v']);

/** @param {string} filePath */
const fixtureRefs = filePath =>
  [...fs.readFileSync(filePath, 'utf-8').matchAll(FIXTURE_REF)].map(m =>
    m[1].toLowerCase(),
  );

/**
 * @param {(refs: string[]) => boolean} predicate
 * @param {'page' | 'block'} type
 */
async function findTemplate(type, predicate) {
  const all = /** @type {Array<{dirName: string, type: string, filePath: string}>} */ (
    await discoverTemplates()
  );
  const ids = new Map();
  for (const t of all) ids.set(t.dirName, (ids.get(t.dirName) ?? 0) + 1);
  const found = all.find(
    t =>
      t.type === type &&
      ids.get(t.dirName) === 1 &&
      fs.existsSync(t.filePath) &&
      predicate(fixtureRefs(t.filePath)),
  );
  if (!found) throw new Error(`no ${type} template matches`);
  return {id: found.dirName, refs: fixtureRefs(found.filePath)};
}

describe('template.copy receipt — replaced demo media', () => {
  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmpl-receipt-'));
  });
  afterEach(() => fs.rmSync(dir, {recursive: true, force: true}));

  it('counts every demo image a page template carried, and leaves none behind', async () => {
    const {id, refs} = await findTemplate(
      'page',
      r => r.length > 0 && r.every(ext => !VIDEO.has(ext)),
    );
    const res = await template(id, {targetPath: './dest', cwd: dir});
    expect(res.type).toBe('template.copy');
    expect(res.data.demoMediaReplaced).toBe(refs.length);
    expect(
      fs.readFileSync(path.join(dir, 'dest', 'page.tsx'), 'utf-8'),
    ).not.toContain('/template-assets/');
  }, SLOW);

  it('counts a demo video in a block template', async () => {
    const {id, refs} = await findTemplate('block', r => r.some(ext => VIDEO.has(ext)));
    const res = await template(id, {targetPath: './dest', cwd: dir});
    expect(res.data.demoMediaReplaced).toBe(refs.length);
  }, SLOW);

  it('reports 0 when the template carries no demo media', async () => {
    const {id} = await findTemplate('page', r => r.length === 0);
    const res = await template(id, {targetPath: './dest', cwd: dir});
    expect(res.data.demoMediaReplaced).toBe(0);
  }, SLOW);
});
