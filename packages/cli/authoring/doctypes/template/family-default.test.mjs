// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The page templates Astryx ships declare at most one default per family
 * (spec:AST-048 FR15). A family is the `category` text before " - ".
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {describe, it, expect} from 'vitest';

const PAGES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../assets/templates/pages',
);

/** @param {string} category */
const familyOf = category => category.split(' - ')[0].trim();

async function shippedPages() {
  const pages = [];
  for (const entry of fs.readdirSync(PAGES_DIR, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const docPath = path.join(PAGES_DIR, entry.name, 'template.doc.mjs');
    if (!fs.existsSync(docPath)) continue;
    const mod = await import(pathToFileURL(docPath).href);
    pages.push({id: entry.name, doc: mod.doc ?? mod.default});
  }
  return pages;
}

describe('shipped family defaults', () => {
  it('declares at most one ready, categorized default per family', async () => {
    /** @type {Map<string, string[]>} */
    const defaults = new Map();
    for (const {id, doc} of await shippedPages()) {
      if (doc?.isFamilyDefault !== true) continue;
      expect(doc.type, id).toBe('page');
      expect(doc.category?.trim(), id).toBeTruthy();
      expect(doc.isReady, id).not.toBe(false);
      const family = familyOf(doc.category);
      defaults.set(family, [...(defaults.get(family) ?? []), id]);
    }
    for (const [family, ids] of defaults) {
      expect(ids, family).toHaveLength(1);
    }
    expect(defaults.size).toBeGreaterThan(0);
  });
});
