// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InternationalizationProvider.tsx
 * @input React, InternationalizationContext, i18n types, Translator
 * @output Exports InternationalizationProvider component and props type
 * @position Provider component for astryx i18n locale + messages + translator
 *
 * Wraps a subtree with a locale and (optional) additional message catalogs +
 * overrides. Astryx components inside the subtree resolve their strings via
 * this context. If a consumer never renders a provider, astryx components
 * still work — they use the shipped en catalog directly.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/i18n/InternationalizationContext.ts
 * - /packages/core/src/i18n/translator.ts
 * - /packages/core/src/i18n/index.ts
 * - /packages/core/src/i18n/InternationalizationProvider.doc.mjs
 * - /packages/cli/assets/docs/internationalization.doc.mjs
 */

import {useMemo, type ReactNode} from 'react';
import {InternationalizationContext} from './InternationalizationContext';
import {getLocaleDirection} from './getLocaleDirection';
import type {Translator} from './translator';
import type {Locale, MessagesByLocale, Overrides} from './types';

export interface InternationalizationProviderProps {
  /**
   * BCP 47 language tag. Examples: `'en'`, `'pt'`, `'pt-BR'`, `'zh-Hans'`.
   *
   * Regional tags are respected — resolving a message walks the tag from
   * most-specific to least-specific (`pt-BR` → `pt`), then falls back to
   * the shipped `en` catalog.
   */
  locale: Locale;
  /**
   * Additional shipped catalogs to make available for the selected locale.
   * `en` is bundled with astryx and never needs to be listed here.
   *
   * @example
   * ```
   * import {fr} from '@astryxdesign/core/locales/fr.json';
   * <InternationalizationProvider locale="fr" messages={{fr}}>
   * ```
   */
  messages?: MessagesByLocale;
  /**
   * Sparse per-locale overrides applied on top of shipped defaults.
   * Only the keys you want to override need to be listed.
   *
   * @example
   * ```
   * <InternationalizationProvider
   *   locale="fr"
   *   overrides={{fr: {'@astryx.pagination.next': 'Suivant'}}}>
   * ```
   */
  overrides?: Overrides;
  /**
   * Reuse an existing i18n runtime (react-intl, i18next, LinguiJS, …) to
   * format astryx's strings instead of the bundled `intl-messageformat`.
   *
   * Astryx keeps its own lookup: overrides, then `messages`, then the parent
   * locale, then the shipped `en` catalog. The translator is handed the
   * already-resolved ICU message — never an `@astryx.*` key — so you do not
   * need to load astryx's catalog into your runtime's store.
   *
   * Every astryx string goes through it, value-less ones included, so keep
   * your adapter's miss path cheap. It must return a string; anything else
   * warns once in development and falls back to astryx's resolved message.
   *
   * A `translator` holds a function, so it can only be passed from a client
   * component — keep the wrapper in a `'use client'` module. A nested
   * `InternationalizationProvider` replaces it rather than inheriting it,
   * exactly as it does `messages` and `overrides`.
   *
   * Memoize it: a fresh object each render re-renders every astryx string
   * in the subtree.
   *
   * @example
   * ```
   * 'use client';
   * const intl = useIntl();
   * const translator = useMemo(
   *   () => ({
   *     format: (message, values) =>
   *       intl.formatMessage({id: message, defaultMessage: message}, values),
   *   }),
   *   [intl],
   * );
   * <InternationalizationProvider locale={intl.locale} translator={translator}>
   * ```
   */
  translator?: Translator;
  /**
   * Optional explicit text direction override. When omitted, direction is derived
   * from `locale` via `Intl.Locale.getTextInfo()`. Provide this to force a
   * direction (e.g. RTL layout testing under an English catalog) or to skip the
   * derivation when you already know the direction.
   *
   * This sets the direction astryx reads via context; it does NOT set the DOM
   * `dir` attribute. You must set `dir` on `<html>` (or a wrapping element)
   * yourself — astryx components mirror layout and directional icons from the
   * DOM `dir`, so an RTL locale won't visually mirror without it. Keep the two
   * in sync (e.g. `dir={getLocaleDirection(locale)}` on both).
   */
  dir?: 'ltr' | 'rtl';
  children: ReactNode;
}

/**
 * Provides locale + additional messages + overrides + an optional translator
 * to all astryx components in the subtree.
 */
export function InternationalizationProvider({
  locale,
  messages,
  overrides,
  translator,
  dir,
  children,
}: InternationalizationProviderProps) {
  const direction = dir ?? getLocaleDirection(locale);
  const value = useMemo(
    () => ({
      locale,
      direction,
      messages: messages ?? {},
      overrides,
      translator,
    }),
    [locale, direction, messages, overrides, translator],
  );
  return (
    <InternationalizationContext value={value}>
      {children}
    </InternationalizationContext>
  );
}

InternationalizationProvider.displayName = 'InternationalizationProvider';
