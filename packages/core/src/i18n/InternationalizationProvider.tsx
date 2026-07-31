// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InternationalizationProvider.tsx
 * @input React, InternationalizationContext, i18n types
 * @output Exports InternationalizationProvider component and props type
 * @position Provider component for astryx i18n locale + messages
 *
 * Wraps a subtree with a locale and (optional) additional message catalogs +
 * overrides. Astryx components inside the subtree resolve their strings via
 * this context. If a consumer never renders a provider, astryx components
 * still work — they use the shipped en catalog directly.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/i18n/InternationalizationContext.ts
 * - /packages/core/src/i18n/index.ts
 * - /packages/core/src/i18n/InternationalizationProvider.doc.mjs
 */

import {useMemo, type ReactNode} from 'react';
import {InternationalizationContext} from './InternationalizationContext';
import {getLocaleDirection} from './getLocaleDirection';
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
   * Optional explicit text direction override. When omitted, direction is derived
   * from `locale` via `Intl.Locale.getTextInfo()`. Provide this to force a
   * direction (e.g. RTL layout testing under an English catalog) or to skip the
   * derivation when you already know the direction.
   */
  dir?: 'ltr' | 'rtl';
  children: ReactNode;
}

/**
 * Provides locale + additional messages + overrides to all astryx
 * components in the subtree.
 */
export function InternationalizationProvider({
  locale,
  messages,
  overrides,
  dir,
  children,
}: InternationalizationProviderProps) {
  const direction = dir ?? getLocaleDirection(locale);
  const value = useMemo(
    () => ({locale, direction, messages: messages ?? {}, overrides}),
    [locale, direction, messages, overrides],
  );
  return (
    <InternationalizationContext value={value}>
      {children}
    </InternationalizationContext>
  );
}

InternationalizationProvider.displayName = 'InternationalizationProvider';
