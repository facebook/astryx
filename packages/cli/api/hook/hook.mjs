// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the hook command — dispatcher + barrel.
 *
 * Returns the same typed envelope { type, data } that `astryx --json hook`
 * outputs. This module is routing only: it computes the shared detail default
 * (kept in sync with the CLI) and dispatches to one of the hook leaves —
 * ./list (hook.list), ./detail (hook.detail), or ./detail/params
 * (hook.detail.params). The CLI command handler is a thin wrapper around this
 * function and api/index.mjs re-exports `hook` from here, so the export surface
 * is unchanged.
 *
 * @position api/hook/hook.mjs — dispatcher over ./list, ./detail, ./detail/params
 */

import {list} from './list/list.mjs';
import {detail as detailLeaf} from './detail/detail.mjs';
import {params as paramsLeaf} from './detail/params/params.mjs';

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
    list: listFlag = false,
    category,
    params: paramsFlag = false,
    detail: detailOption,
    lang = null,
    zh = false,
  } = options;

  // Default detail level mirrors the CLI (see commands/hook/index.mjs):
  // single-hook views default to 'full', list-style views (--list,
  // --category, or no name) default to 'brief' (scannable name lists).
  // Keeping this in sync with the CLI is what the API↔CLI parity test checks.
  const isListView = listFlag || category != null || !name;
  const detail = detailOption ?? (isListView ? 'brief' : 'full');

  // ── List mode ──────────────────────────────────────────────────
  if (category || listFlag || !name) {
    return list({cwd, category, detail, zh, lang});
  }

  // ── Single hook ────────────────────────────────────────────────
  if (paramsFlag) {
    return paramsLeaf(name, {cwd, zh, lang});
  }

  return detailLeaf(name, {cwd, zh, lang});
}
