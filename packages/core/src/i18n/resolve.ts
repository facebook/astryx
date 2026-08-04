// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolve.ts
 * @input Key + values + locale + catalog + overrides + optional Translator
 * @output Formatted message string
 * @position Shared lookup + ICU formatting core, used by useTranslator().
 *
 * Lookup order:
 *   1. Per-locale override for the exact locale
 *   2. Per-locale override for a parent locale (pt-BR → pt)
 *   3. Shipped catalog entry for the exact locale
 *   4. Shipped catalog entry for a parent locale (pt-BR → pt)
 *   5. Shipped en catalog (the source of truth, always present)
 *   6. The key itself (dev-visible fallback, warns once)
 *
 * Lookup always happens here. A consumer-supplied `Translator` replaces ONLY
 * the formatting step, so the fallback chain above behaves identically whether
 * or not an external i18n runtime is plugged in (#4029). Every message the
 * chain resolves is handed to that translator — value-less ones included, so a
 * single consumer catalog can own all of astryx's strings and not just the
 * quarter that interpolate.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/i18n/useTranslator.ts
 * - /packages/core/src/i18n/translator.ts
 * - /packages/core/src/i18n/__tests__/resolve.test.ts
 * - /packages/core/src/i18n/__tests__/translator.test.tsx
 */

import IntlMessageFormat from 'intl-messageformat';
import type {Translator} from './translator';
import type {Catalog, Locale, MessagesByLocale, Overrides} from './types';
import enSource from '../../locales/en.json' with {type: 'json'};
import {warnOnce, __resetDevWarnings} from '../utils/devWarning';

const EN_CATALOG = enSource as Catalog;

/**
 * Cache of parsed ICU MessageFormat objects keyed by `${locale}::${message}`.
 * IntlMessageFormat parsing is non-trivial; caching avoids reparsing on every
 * render. The cache is unbounded in principle but bounded in practice by the
 * static set of astryx keys.
 */
const formatterCache = new Map<string, IntlMessageFormat>();

function getFormatter(message: string, locale: Locale): IntlMessageFormat {
  const cacheKey = `${locale}::${message}`;
  let f = formatterCache.get(cacheKey);
  if (f === undefined) {
    f = new IntlMessageFormat(message, locale);
    formatterCache.set(cacheKey, f);
  }
  return f;
}

/**
 * Walk a BCP 47 tag from most-specific to least-specific.
 * Input is canonicalized via `Intl.Locale.baseName` so `pt-br` and `PT-BR`
 * both produce `['pt-BR', 'pt']`.
 *
 * Examples:
 *   'pt-BR'      → ['pt-BR', 'pt']
 *   'zh-Hans-CN' → ['zh-Hans-CN', 'zh-Hans', 'zh']
 *   'en'         → ['en']
 *
 * `en` is intentionally NOT appended here — the caller falls back to the
 * shipped en catalog separately as the final source-of-truth.
 */
export function resolveLocaleChain(locale: Locale): Locale[] {
  let canonical: string;
  try {
    canonical = new Intl.Locale(locale).baseName;
  } catch {
    // Malformed input — fall back to the raw string so callers still get a chain.
    canonical = locale;
  }
  const parts = canonical.split('-');
  const chain: Locale[] = [];
  for (let i = parts.length; i > 0; i--) {
    chain.push(parts.slice(0, i).join('-'));
  }
  return chain;
}

function lookup(
  key: string,
  locale: Locale,
  messages: MessagesByLocale,
  overrides: Overrides | undefined,
): string | null {
  const chain = resolveLocaleChain(locale);

  // 1 + 2. Overrides (most specific to least specific in the chain)
  if (overrides !== undefined) {
    for (const tag of chain) {
      const value = overrides[tag]?.[key];
      if (value !== undefined) {
        return value;
      }
    }
  }

  // 3 + 4. Shipped catalogs (most specific to least specific)
  for (const tag of chain) {
    const entry = messages[tag]?.[key];
    if (entry !== undefined) {
      return entry.defaultMessage;
    }
  }

  // 5. Shipped en catalog — always present
  const enEntry = EN_CATALOG[key];
  if (enEntry !== undefined) {
    return enEntry.defaultMessage;
  }

  // 6. Nothing found
  return null;
}

export function resolve(
  key: string,
  values: Record<string, unknown> | undefined,
  locale: Locale,
  messages: MessagesByLocale,
  overrides: Overrides | undefined,
  translator?: Translator,
): string {
  const result = lookup(key, locale, messages, overrides);

  if (result === null) {
    // Fires ONLY when a key is missing from every source including the
    // shipped `en` catalog — a real bug (typo, stale catalog, deleted key).
    // Fallback to `en` from a non-en locale is expected and stays silent,
    // matching the FormatJS / i18next default.
    warnOnce(
      `astryx-i18n:${locale}::${key}`,
      'astryx-i18n',
      `missing key: ${key} (locale: ${locale})`,
    );
    return key;
  }

  // `!= null`, not `!== undefined`: the prop is typed optional, so TS callers
  // cannot pass null — but a JS consumer writing `translator={on ? t : null}`
  // can, and `.format` on null would take down every astryx string in the
  // tree. A malformed object still throws, loudly, as a wiring bug should.
  if (translator != null) {
    // The consumer's i18n runtime formats the already-resolved ICU message.
    // It never sees an `@astryx.*` key — lookup and locale fallback stay here.
    //
    // Every resolved message is handed over, including value-less ones —
    // which is most of them. A runtime that owns the app's catalog can
    // translate those too, and only the consumer knows whether it needs to,
    // so astryx does not decide for them by short-circuiting first.
    const output = translator.format(result, values, locale);
    if (typeof output !== 'string') {
      // `format` is typed to return a string, but a translator is consumer
      // code and the type is not enforced at runtime — react-intl returns a
      // ReactNode[] for rich text, i18next can return null for a miss.
      // astryx's output lands in aria-label and title, where a non-string
      // becomes "[object Object]" or drops the attribute. Degrade to the
      // message astryx already resolved: still correct, always a string.
      warnOnce(
        `astryx-i18n:translator::${key}`,
        'astryx-i18n',
        `translator.format returned ${typeof output} for ${key} (locale: ${locale}); expected a string. Using astryx's resolved message instead.`,
      );
      return result;
    }
    return output;
  }

  if (values === undefined) {
    // Static string — skip the ICU parser entirely for the common case.
    return result;
  }

  const formatted = getFormatter(result, locale).format(values);
  // IntlMessageFormat.format returns string | (string | React elements) — we
  // only ever pass string values so it will be a string; assert for the type
  // system.
  return formatted as string;
}

/**
 * Reset internal caches. Test-only.
 * @internal
 */
export function __resetForTests(): void {
  formatterCache.clear();
  __resetDevWarnings();
}
