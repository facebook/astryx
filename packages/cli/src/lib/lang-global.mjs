// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Global --lang validation
 *
 * Centralizes validation of the global `--lang` / `--zh` / `--dense`
 * flags so that EVERY command rejects unsupported locales (exit 1)
 * before doing any work, and warns when a requested locale is only
 * partially translated. This closes the "advertised-but-silently-
 * ignored" honesty gap for write/action commands (init, template,
 * theme, upgrade, swizzle, build, gap-report) that accept the global
 * `--lang` flag from the root program but never translate.
 *
 * MERGE NOTE: PR #2407 introduces `src/lib/lang.mjs` with the same
 * `SUPPORTED_LANGS` / `validateLang` contract wired per-command into
 * component/hook/discover/docs. This module installs the SAME
 * validator as a single global preAction hook so it also covers the
 * write commands 2407 does not touch. At merge, prefer #2407's
 * `lang.mjs` as the canonical validator and have the global hook
 * import from it (delete this file's duplicate `validateLang`); keep
 * the global preAction hook from this PR. Both buckets are "contract".
 */

import {jsonError} from './json.mjs';

/** Locales the CLI claims to support (keep in sync with --lang desc). */
export const SUPPORTED_LANGS = ['en', 'zh', 'dense'];

/** Locales whose translation coverage is incomplete. */
export const PARTIAL_LANGS = new Set(['zh']);

/**
 * Validate the global lang options. Exits 1 on invalid input (or emits
 * a JSON error if --json is set). Emits a one-time stderr warning when a
 * partially-translated locale is requested so we never silently produce
 * English for an advertised locale.
 *
 * @param {{lang?: string|null, zh?: boolean, dense?: boolean, json?: boolean}} opts
 * @returns {{lang: string|null}} normalized effective locale.
 */
export function validateLang(opts = {}) {
  const {lang, zh, dense, json} = opts;

  if (lang && (zh || dense)) {
    const msg = 'Cannot combine --lang with legacy --zh or --dense flags.';
    if (json) {
      jsonError(msg);
      return {lang: null};
    }
    console.error(`Error: ${msg}`);
    process.exit(1);
  }

  const effective = lang || (dense ? 'dense' : zh ? 'zh' : null);
  if (!effective) return {lang: null};

  if (!SUPPORTED_LANGS.includes(effective)) {
    const msg = `Unsupported language "${effective}". Supported: ${SUPPORTED_LANGS.join(', ')}.`;
    if (json) {
      jsonError(msg);
      return {lang: null};
    }
    console.error(`Error: ${msg}`);
    process.exit(1);
  }

  if (PARTIAL_LANGS.has(effective) && !process.__xdsLangWarned) {
    process.__xdsLangWarned = true;
    console.error(
      `Warning: --lang ${effective} translations are incomplete. ` +
        'Some prose will fall back to English.',
    );
  }

  return {lang: effective};
}
