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
 * @param {'full'|'compact'|'brief'} [options.detail] - Defaults to 'full' for a single hook, 'brief' for list views (list/category/no name), matching the CLI.
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
    detail: detailOption,
    lang = null,
    zh = false,
  } = options;

  // Default detail level mirrors the CLI (see commands/hook/index.mjs):
  // single-hook views default to 'full', list-style views (--list,
  // --category, or no name) default to 'brief' (scannable name lists).
  // Keeping this in sync with the CLI is what the API↔CLI parity test checks.
  const isListView = list || category != null || !name;
  const detail = detailOption ?? (isListView ? 'brief' : 'full');

  const coreDir = findCoreDir(cwd);
  if (!coreDir) {
    throw new XDSError('Could not find @xds/core package');
  }

  // ── List mode ──────────────────────────────────────────────────

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

      if (detail === 'compact') {
        const entries = [];
        for (const hookName of match[1]) {
          const docPath = findHookDoc(coreDir, hookName);
          if (docPath) {
            try {
              const docs = await loadDocs(docPath, {zh, lang});
              entries.push({
                name: hookName,
                description: docs.usage?.description || '',
                import: docs.importPath || '@xds/core/hooks',
              });
            } catch {
              entries.push({name: hookName, description: '', import: '@xds/core/hooks'});
            }
          } else {
            entries.push({name: hookName, description: '', import: '@xds/core/hooks'});
          }
        }
        return {type: 'hook.brief', data: {[match[0]]: entries}};
      }

      if (detail === 'full') {
        const entries = [];
        for (const hookName of match[1]) {
          const docPath = findHookDoc(coreDir, hookName);
          if (docPath) {
            try {
              entries.push(await loadDocs(docPath, {zh, lang}));
            } catch {
              entries.push({name: hookName});
            }
          } else {
            entries.push({name: hookName});
          }
        }
        return {type: 'hook.full', data: {[match[0]]: entries}};
      }

      // Default: brief — names only
      return {type: 'hook.list', data: {[match[0]]: match[1]}};
    }

    // All hooks
    if (detail === 'compact') {
      /** @type {Record<string, Array<{name: string, description: string, import: string}>>} */
      const result = {};
      for (const [cat, hookNames] of Object.entries(hooks)) {
        result[cat] = [];
        for (const hookName of hookNames) {
          const docPath = findHookDoc(coreDir, hookName);
          if (docPath) {
            try {
              const docs = await loadDocs(docPath, {zh, lang});
              result[cat].push({
                name: hookName,
                description: docs.usage?.description || '',
                import: docs.importPath || '@xds/core/hooks',
              });
            } catch {
              result[cat].push({name: hookName, description: '', import: '@xds/core/hooks'});
            }
          } else {
            result[cat].push({name: hookName, description: '', import: '@xds/core/hooks'});
          }
        }
      }
      return {type: 'hook.brief', data: result};
    }

    if (detail === 'full') {
      /** @type {Record<string, Array<unknown>>} */
      const result = {};
      for (const [cat, hookNames] of Object.entries(hooks)) {
        result[cat] = [];
        for (const hookName of hookNames) {
          const docPath = findHookDoc(coreDir, hookName);
          if (docPath) {
            try {
              result[cat].push(await loadDocs(docPath, {zh, lang}));
            } catch {
              result[cat].push({name: hookName});
            }
          } else {
            result[cat].push({name: hookName});
          }
        }
      }
      return {type: 'hook.full', data: result};
    }

    // Default: brief — names only
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
