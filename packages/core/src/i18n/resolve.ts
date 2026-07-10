// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolve.ts
 * @input Key + values + locale + catalog + overrides
 * @output Formatted message string
 * @position Shared lookup + ICU formatting core, used by both t.client.ts and t.server.ts
 *
 * The split between t.client and t.server is only about where the locale VALUE
 * lives (React context vs AsyncLocalStorage). All the actual lookup and
 * formatting happens here so behavior is identical across server/client.
 *
 * Lookup order:
 *   1. Per-locale override for the exact locale
 *   2. Per-locale override for a parent locale (pt-BR → pt)
 *   3. Shipped catalog entry for the exact locale
 *   4. Shipped catalog entry for a parent locale (pt-BR → pt)
 *   5. Shipped en catalog (the source of truth, always present)
 *   6. The key itself (dev-visible fallback, warns once)
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/i18n/t.client.ts
 * - /packages/core/src/i18n/t.server.ts
 * - /packages/core/src/i18n/__tests__/resolve.test.ts
 */

import IntlMessageFormat from 'intl-messageformat';
import type {Catalog, Locale, MessagesByLocale, Overrides} from './types';
import enSource from '../../locales/en.json' with {type: 'json'};

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
 * Examples:
 *   'pt-BR'      → ['pt-BR', 'pt']
 *   'zh-Hans-CN' → ['zh-Hans-CN', 'zh-Hans', 'zh']
 *   'en'         → ['en']
 *
 * `en` is intentionally NOT appended here — the caller falls back to the
 * shipped en catalog separately as the final source-of-truth.
 */
export function resolveLocaleChain(locale: Locale): Locale[] {
  const parts = locale.split('-');
  const chain: Locale[] = [];
  for (let i = parts.length; i > 0; i--) {
    chain.push(parts.slice(0, i).join('-'));
  }
  return chain;
}

/**
 * Warn-once tracking. Missing keys and en-fallbacks each log once per
 * (locale, key) pair per process to avoid flooding the console during
 * navigation-heavy rendering. Follows the astryx convention of unguarded
 * `console.warn` (see Toast/useToast.tsx) — production consumers who don't
 * want the noise can suppress at the console filter level.
 */
const warnedMissing = new Set<string>();
const warnedFallback = new Set<string>();

function warnOnce(bucket: Set<string>, key: string, message: string): void {
  if (!bucket.has(key)) {
    bucket.add(key);
    console.warn(message);
  }
}

interface LookupResult {
  message: string;
  usedFallback: boolean;
}

function lookup(
  key: string,
  locale: Locale,
  messages: MessagesByLocale,
  overrides: Overrides | undefined,
): LookupResult | null {
  const chain = resolveLocaleChain(locale);

  // 1 + 2. Overrides (most specific to least specific in the chain)
  if (overrides !== undefined) {
    for (const tag of chain) {
      const value = overrides[tag]?.[key];
      if (value !== undefined) {
        return {message: value, usedFallback: false};
      }
    }
  }

  // 3 + 4. Shipped catalogs (most specific to least specific)
  for (const tag of chain) {
    const entry = messages[tag]?.[key];
    if (entry !== undefined) {
      return {message: entry.defaultMessage, usedFallback: false};
    }
  }

  // 5. Shipped en catalog — always present
  const enEntry = EN_CATALOG[key];
  if (enEntry !== undefined) {
    return {message: enEntry.defaultMessage, usedFallback: true};
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
): string {
  const result = lookup(key, locale, messages, overrides);

  if (result === null) {
    warnOnce(
      warnedMissing,
      `${locale}::${key}`,
      `[astryx-i18n] missing key: ${key} (locale: ${locale})`,
    );
    return key;
  }

  if (result.usedFallback && locale !== 'en') {
    warnOnce(
      warnedFallback,
      `${locale}::${key}`,
      `[astryx-i18n] fallback to en: ${key} (locale: ${locale})`,
    );
  }

  if (values === undefined) {
    // Static string — skip the parser entirely for the common case
    return result.message;
  }

  const formatted = getFormatter(result.message, locale).format(values);
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
  warnedMissing.clear();
  warnedFallback.clear();
}
