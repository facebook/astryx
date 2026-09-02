// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file IntlProvider.tsx
 * @input React, IntlContext
 * @output Exports IntlProvider component and props type
 * @position Provider component for astryx intl locale + messages
 *
 * Wraps a subtree with a locale and (optional) additional message catalogs +
 * overrides. Astryx components inside the subtree resolve their strings via
 * this context. If a consumer never renders a provider, astryx components
 * still work — they use the shipped en catalog directly.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/intl/IntlContext.ts
 * - /packages/core/src/intl/index.ts
 */

import {useMemo, type ReactNode} from 'react';
import {IntlContext, type IntlContextValue, type Locale} from './IntlContext';
import enSource from '../../locales/en.json' with {type: 'json'};
import {getLocaleDirection} from '../i18n';
import {formatter} from '../i18n/resolve';

export type Overrides = Partial<typeof enSource>;

export interface IntlProviderProps<Messages = Record<string, unknown>> {
  /**
   * BCP 47 language tag. Examples: `'en'`, `'pt'`, `'pt-BR'`, `'zh-Hans'`.
   */
  locale: Locale;

  /**
   * Additional shipped catalogs to make available for the selected locale.
   * `en` is bundled with astryx and never needs to be listed here.
   *
   * @example
   * ```
   * import {fr} from '@astryxdesign/core/locales/fr.json';
   * <IntlProvider locale="fr" messages={fr}>
   * ```
   *
   * If you want overrides some keys in the shipped catalogs,
   * only the keys you want override need to be listed.
   *
   * @example
   * ```
   * <IntlProvider
   *   locale="fr"
   *   overrides={{...fr, '@astryx.pagination.next': 'Suivant'}}>
   * ```
   */
  overrides?: Overrides;
  /**
   * You can use `astryx` as your i18n library.
   * You are free to define your own `MyCatalog` and pass it as `messages`.
   * By calling `useIntl<MyCatalog>()`, you get your catalog back unchanged,
   * with full type safety—no loss of types, and no need to avoid
   * colliding with astryx's built-in keys.
   *
   * @example
   * ```
   * interface MyCatalog {
   *   currency: React.ReactNode;
   *   discount: (percent: number) => React.ReactNode;
   * }
   *
   * const en: MyCatalog = {
   *   currency: <DollarIcon />,
   *   discount: percent => `${100 - percent}% Off`,
   * };
   * const zh: MyCatalog = {
   *   currency: <ChinaYuan />,
   *   discount: percent => `${percent / 10} 折`,
   * };
   *
   * const messages = {en, zh};
   * const locale = 'zh';
   *
   * <IntlProvider locale={locale} messages={messages[locale]}>
   *   <MyComponent price={10} percent={30} />
   * </IntlProvider>;
   *
   * const MyComponent = ({price, percent}: {price: number; percent: number}) => {
   *   const {messages} = ustIntl<MyCatalog>();
   *   const {currency, discount} = messages;
   *   return (
   *     <span>
   *       {price}
   *       {currency}, {discount(percent)}
   *     </span>
   *   );
   * };
   * ```
   */
  messages?: Messages;
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
 * Provides locale + additional messages + overrides to all astryx
 * components in the subtree.
 */
export function IntlProvider<Messages = Record<string, never>>({
  locale,
  messages,
  overrides,
  children,
  dir,
}: IntlProviderProps<Messages>) {
  const value = useMemo<IntlContextValue>(() => {
    return {
      locale,
      direction: dir ?? getLocaleDirection(locale),
      messages: messages ?? {},
      t: (key, values) =>
        formatter(
          (overrides?.[key] || enSource[key]).defaultMessage,
          locale,
          values,
        ),
    };
  }, [locale, dir, messages, overrides]);
  return <IntlContext value={value}>{children}</IntlContext>;
}

IntlProvider.displayName = 'IntlProvider';
