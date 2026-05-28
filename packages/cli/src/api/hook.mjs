// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the hook command.
 *
 * Returns the same typed envelope { type, data } that `xds --json hook` outputs.
 * The CLI command handler is a thin wrapper around this function.
 */

import {findCoreDir} from '../utils/paths.mjs';
import {discoverHooks, findHookDoc, getAllHookNames} from '../lib/hook-discovery.mjs';
import {loadDocs} from '../lib/component-loader.mjs';
import {levenshteinDistance} from '../lib/string-utils.mjs';
import {XDSError} from './error.mjs';

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {boolean} [options.list]
 * @param {string} [options.category]
 * @param {boolean} [options.params]
 * @param {'full'|'compact'|'brief'} [options.detail]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function hook(name, options = {}) {
  const {
    cwd = process.cwd(),
    list = false,
    category,
    params = false,
    detail = 'full',
    lang = null,
    zh = false,
  } = options;

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new XDSError('Could not find @xds/core package');
  }

  // ── List mode ──────────────────────────────────────────────────
  //
  // Detail levels (length: brief < compact < full):
  //   brief   → just hook names grouped by category (`hook.list`)
  //   compact → names + short description (`hook.compact-list`)
  //   full    → rich entries with description + import path (`hook.detailed-list`)

  if (category || list || !name) {
    const hooks = discoverHooks(coreDir);

    if (category) {
      const match = Object.entries(hooks).find(
        ([key]) => key.toLowerCase() === category.toLowerCase(),
      );
      if (!match) {
        throw new XDSError(
          `Unknown category "${category}"`,
          Object.keys(hooks).map(k => ({name: k, reason: 'valid category'})),
        );
      }

      if (detail === 'compact' || detail === 'full') {
        const entries = [];
        for (const hookName of match[1]) {
          const docPath = findHookDoc(coreDir, hookName);
          let description = '';
          let importPath = '@xds/core/hooks';
          if (docPath) {
            try {
              const docs = await loadDocs(docPath, {zh, lang});
              description = docs.usage?.description || '';
              importPath = docs.importPath || importPath;
            } catch {
              // ignore
            }
          }
          if (detail === 'full') {
            entries.push({name: hookName, description, import: importPath});
          } else {
            entries.push({name: hookName, description});
          }
        }
        const type = detail === 'full' ? 'hook.detailed-list' : 'hook.compact-list';
        return {type, data: {[match[0]]: entries}};
      }

      return {type: 'hook.list', data: {[match[0]]: match[1]}};
    }

    // All hooks
    if (detail === 'compact' || detail === 'full') {
      /** @type {Record<string, Array<{name: string, description: string, import?: string}>>} */
      const result = {};
      for (const [cat, hookNames] of Object.entries(hooks)) {
        result[cat] = [];
        for (const hookName of hookNames) {
          const docPath = findHookDoc(coreDir, hookName);
          let description = '';
          let importPath = '@xds/core/hooks';
          if (docPath) {
            try {
              const docs = await loadDocs(docPath, {zh, lang});
              description = docs.usage?.description || '';
              importPath = docs.importPath || importPath;
            } catch {
              // ignore
            }
          }
          if (detail === 'full') {
            result[cat].push({name: hookName, description, import: importPath});
          } else {
            result[cat].push({name: hookName, description});
          }
        }
      }
      const type = detail === 'full' ? 'hook.detailed-list' : 'hook.compact-list';
      return {type, data: result};
    }

    return {type: 'hook.list', data: hooks};
  }

  // ── Single hook ────────────────────────────────────────────────

  const docPath = findHookDoc(coreDir, name);

  if (!docPath) {
    // Fuzzy search for suggestions
    const allNames = getAllHookNames(coreDir);
    const needle = name.toLowerCase();
    const suggestions = allNames
      .map(hookName => ({
        name: hookName,
        distance: levenshteinDistance(needle, hookName.toLowerCase()),
      }))
      .filter(m => m.distance <= 5)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map(m => ({name: m.name, reason: `similar name (distance ${m.distance})`}));

    throw new XDSError(
      `No hook named "${name}"`,
      suggestions,
    );
  }

  const docs = await loadDocs(docPath, {zh, lang});

  if (params) {
    return {type: 'hook.detail.params', data: docs.params || []};
  }

  return {type: 'hook.detail', data: docs};
}
