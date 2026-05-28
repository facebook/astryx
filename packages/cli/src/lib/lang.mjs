// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Lang validation and warnings
 *
 * Validates --lang values, warns when translations are incomplete,
 * and centralizes the supported locale list so commands stay in sync.
 */

import {jsonError} from './json.mjs';

/**
 * Locales the CLI claims to support. Keep this list in sync with
 * the `--lang` description in src/index.mjs.
 */
export const SUPPORTED_LANGS = ['en', 'zh', 'dense'];

/**
 * Locales whose translation coverage is incomplete. When the user
 * passes one of these, we still attempt the translation (props/labels
 * are typically translated) but warn that some prose may fall back
 * to English.
 */
export const PARTIAL_LANGS = new Set(['zh']);

/**
 * Validate the global lang options. Exits the process on invalid
 * input (or returns a JSON error if --json is set). Emits a stderr
 * warning when a partially-translated locale is requested.
 *
 * @param {{lang?: string|null, zh?: boolean, dense?: boolean, json?: boolean}} opts
 * @returns {{lang: string|null}} normalized lang for downstream callers.
 */
export function validateLang(opts) {
  const {lang, zh, dense, json} = opts;

  // --zh and --dense are legacy shortcuts. They cannot be combined
  // with --lang (the result would be ambiguous).
  if (lang && (zh || dense)) {
    const msg = `Cannot combine --lang with legacy --zh or --dense flags.`;
    if (json) {
      jsonError(msg);
      // jsonError exits, but be defensive.
      return {lang: null};
    }
    console.error(`Error: ${msg}`);
    process.exit(1);
  }

  // Resolve the effective locale. --lang wins; otherwise fall back
  // to the legacy shortcuts.
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

  if (PARTIAL_LANGS.has(effective)) {
    // Warn once per process — multiple commands in tests etc. shouldn't
    // each retrigger the warning.
    if (!process.__xdsLangWarned) {
      process.__xdsLangWarned = true;
      console.error(
        `Warning: --lang ${effective} translations are incomplete. ` +
        `Some prose will fall back to English.`,
      );
    }
  }

  return {lang: effective};
}
