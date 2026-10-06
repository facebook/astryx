// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Read-only access to the Core component documentation snapshot bundled
 * with @astryxdesign/cli. This is the no-install fallback for CDN projects;
 * locally installed Core packages remain authoritative.
 */

import * as fs from 'node:fs';
import {CORE_PROVIDER_ID} from '../identity/providers.mjs';

/**
 * @typedef {object} BundledComponentSnapshot
 * @property {string} version
 * @property {Record<string, string[]>} groups
 * @property {Record<string, any>} components
 */

/** @type {BundledComponentSnapshot|undefined} */
let snapshot;
/** @type {{componentDocs: {source: 'bundled', package: string, version: string}}|undefined} */
let metadata;

/** @returns {BundledComponentSnapshot} */
function getSnapshot() {
  if (snapshot !== undefined) return snapshot;
  const source = new URL(
    '../../assets/generated/core-component-docs.json',
    import.meta.url,
  );
  try {
    const loaded = /** @type {BundledComponentSnapshot} */ (
      JSON.parse(fs.readFileSync(source, 'utf8'))
    );
    snapshot = loaded;
    return loaded;
  } catch (error) {
    throw new Error(
      'Bundled Core component docs are unavailable. Rebuild or repack @astryxdesign/cli.',
      {cause: error},
    );
  }
}

/** @returns {string} */
export function getBundledCoreVersion() {
  return getSnapshot().version;
}

/** @returns {{componentDocs: {source: 'bundled', package: string, version: string}}} */
export function getBundledComponentDocsMeta() {
  if (!metadata) {
    metadata = Object.freeze({
      componentDocs: Object.freeze({
        source: 'bundled',
        package: CORE_PROVIDER_ID,
        version: getBundledCoreVersion(),
      }),
    });
  }
  return metadata;
}

/** @returns {Record<string, string[]>} */
export function getBundledComponentGroups() {
  return getSnapshot().groups;
}

/**
 * @param {string} name
 * @param {{lang?: string|null, zh?: boolean, dense?: boolean}} [options]
 * @returns {any|null}
 */
export function getBundledComponentDoc(name, options = {}) {
  const record = getSnapshot().components[name];
  if (!record) return null;
  const lang =
    options.lang ?? (options.dense ? 'dense' : options.zh ? 'zh' : 'en');
  return record[lang] ?? record.en;
}

/**
 * Search-ready Core component records derived from the same bundled docs used by
 * `component`, so both commands describe the same package version.
 * @returns {Array<{name: string, doc: any}>}
 */
export function getBundledComponentRecords() {
  return Object.entries(getSnapshot().components).map(([name, record]) => ({
    name,
    doc: record.en,
  }));
}
