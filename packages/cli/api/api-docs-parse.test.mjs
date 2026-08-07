// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Validates every colocated FunctionDoc under `api/**` — each `*.doc.mjs`
 * must export a `doc` that passes `parseDoc` (stamped `type: 'function'`). This
 * is the safety net for the hand-authored API function docs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {describe, it, expect} from 'vitest';
import {parseDoc} from '../authoring/index.mjs';

const API_DIR = path.dirname(fileURLToPath(import.meta.url));

/** @param {string} dir @returns {string[]} */
function findDocs(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findDocs(p));
    else if (entry.name.endsWith('.doc.mjs')) out.push(p);
  }
  return out;
}

describe('api FunctionDocs', () => {
  const files = findDocs(API_DIR);

  it('discovers colocated function docs', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const rel = path.relative(API_DIR, file);
    it(`parses ${rel}`, async () => {
      const mod = await import(pathToFileURL(file).href);
      const doc = mod.doc ?? mod.docs;
      expect(doc, `${rel} must export \`doc\``).toBeTruthy();
      expect(doc.type, `${rel} should be a function doc`).toBe('function');
      const parsed = parseDoc(doc);
      expect(parsed.name, `${rel} needs a name`).toBeTruthy();
    });
  }
});
