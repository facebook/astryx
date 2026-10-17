// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Find the doc files an integration package ships, by root.
 *
 * @input The integration's resolved roots (components, templates, docs,
 *   themes).
 * @output DocFile entries for checkDocTypes, each with the root it belongs to.
 * @position Read by `astryx doctor integration validate` before it checks
 *   each doc against its authoring type.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/** @typedef {import('./doc-types.mjs').DocFile} DocFile */
/** @typedef {import('./doc-types.mjs').DocRoot} DocRoot */

const DOC_FILE = /\.doc\.(?:ts|mjs|js)$/;
const TEMPLATE_FILE = /\.(?:doc|template)\.(?:ts|mjs|js)$/;
const OVERLAY_FILE = /\.doc\.(?:zh|dense)\.mjs$/;
const SKIP_DIRS = new Set(['node_modules', '__tests__', '__fixtures__']);

/**
 * Every doc file under an integration's roots, each assigned to the deepest
 * root that holds it.
 * @param {{components?: string, templates?: string, docs?: string, themes?: string}} integration
 * @returns {DocFile[]}
 */
export function integrationDocFiles(integration) {
  /** @type {Array<[DocRoot, string]>} */
  const roots = [];
  for (const root of /** @type {const} */ ([
    'components',
    'templates',
    'docs',
    'themes',
  ])) {
    const dir = integration?.[root];
    if (typeof dir === 'string' && isDirectory(dir)) roots.push([root, dir]);
  }
  /** @type {Map<string, DocFile>} */
  const files = new Map();
  for (const [root, dir] of roots) {
    for (const file of walk(dir)) {
      const name = path.basename(file);
      /** @type {DocRoot | null} */
      const kind =
        root === 'docs' && OVERLAY_FILE.test(name)
          ? 'docs-overlay'
          : root === 'templates'
            ? TEMPLATE_FILE.test(name)
              ? 'templates'
              : null
            : DOC_FILE.test(name)
              ? root
              : null;
      if (kind == null) continue;
      const owner = files.get(file);
      const ownerDir = owner
        ? roots.find(
            ([r]) =>
              r === owner.root ||
              (owner.root === 'docs-overlay' && r === 'docs'),
          )?.[1]
        : undefined;
      if (!owner || (ownerDir != null && dir.length > ownerDir.length)) {
        files.set(file, {path: file, root: kind});
      }
    }
  }
  return [...files.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/** @param {string} dir */
function isDirectory(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  /** @type {fs.Dirent[]} */
  let entries;
  try {
    entries = fs.readdirSync(dir, {withFileTypes: true});
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}
