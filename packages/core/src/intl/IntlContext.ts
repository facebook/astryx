// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file IntlContext.ts
 * @input React createContext
 * @output Exports IntlContext and IntlContextValue
 * @position Context definition for client-side locale + messages
 *
 * Separated from IntlProvider.tsx so components can consume
 * the context without pulling in the full provider implementation.
 * Follows the LinkContext.ts / ThemeContext.ts pattern.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/intl/IntlProvider.tsx
 * - /packages/core/src/intl/useIntl.ts
 * - /packages/core/src/intl/index.ts
 */

import {createContext} from 'react';
import enSource from '../../locales/en.json' with {type: 'json'};
import {formatter} from '../i18n/resolve';

/**
 * A BCP 47 language tag. Examples: `'en'`, `'pt'`, `'pt-BR'`, `'zh-Hans'`.
 *
 * Regional tags are meaningful — `pt-BR` and `pt` are different catalogs.
 */
export type Locale = string;

/**
 * This is used for i18n in `astryx/core` components.
 * The `key` argument is type-checked and provides autocompletion hints.
 * Safe to call from event handlers and effects.
 */
export type TranslatorFn = (
  key: keyof typeof enSource,
  values?: Record<string, unknown>,
) => string;

export interface IntlContextValue<Messages = Record<string, never>> {
  locale: Locale;
  messages: Messages;
  direction: 'ltr' | 'rtl';
  t: TranslatorFn;
}

/**
 * Default value falls through to the shipped en catalog in resolve().
 * A consumer that doesn't render a provider still gets English defaults.
 */
export const IntlContext = createContext<IntlContextValue>({
  locale: 'en',
  direction: 'ltr',
  messages: {},
  t: (key, values) => formatter(enSource[key].defaultMessage, 'en', values),
});

IntlContext.displayName = 'IntlContext';
