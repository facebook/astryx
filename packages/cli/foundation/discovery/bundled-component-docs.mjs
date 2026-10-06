// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Read-only access to the Core component documentation snapshot bundled
 * with @astryxdesign/cli. This is the no-install fallback for CDN projects;
 * locally installed Core packages remain authoritative.
 */

import * as fs from 'node:fs';
import {CORE_PROVIDER_ID} from '../identity/providers.mjs';

/** @type {{version: string, groups: Record<string, string[]>, components: Record<string, any>}} */
const snapshot = JSON.parse(
  fs.readFileSync(
    new URL('../../assets/generated/core-component-docs.json', import.meta.url),
    'utf8',
  ),
);

export const bundledCoreVersion = snapshot.version;

export const BUNDLED_COMPONENT_DOCS_META = Object.freeze({
  componentDocs: Object.freeze({
    source: 'bundled',
    package: CORE_PROVIDER_ID,
    version: bundledCoreVersion,
  }),
});

/** @returns {Record<string, string[]>} */
export function getBundledComponentGroups() {
  return snapshot.groups;
}

/**
 * @param {string} name
 * @param {{lang?: string|null, zh?: boolean, dense?: boolean}} [options]
 * @returns {any|null}
 */
export function getBundledComponentDoc(name, options = {}) {
  const record = snapshot.components[name];
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
  return Object.entries(snapshot.components).map(([name, record]) => ({
    name,
    doc: record.en,
  }));
}
