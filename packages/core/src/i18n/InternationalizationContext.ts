// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InternationalizationContext.ts
 * @input React createContext, i18n types
 * @output Exports InternationalizationContext and InternationalizationContextValue
 * @position Context definition for client-side locale + messages
 *
 * Separated from InternationalizationProvider.tsx so components can consume
 * the context without pulling in the full provider implementation.
 * Follows the LinkContext.ts / ThemeContext.ts pattern.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/i18n/InternationalizationProvider.tsx
 * - /packages/core/src/i18n/translator.ts
 * - /packages/core/src/i18n/useDirection.ts
 * - /packages/core/src/i18n/useLocale.ts
 * - /packages/core/src/i18n/useCollator.ts
 * - /packages/core/src/i18n/getLocaleDirection.ts
 * - /packages/core/src/i18n/index.ts
 */

import {createContext} from 'react';
import type {Translator} from './translator';
import type {Locale, MessagesByLocale, Overrides} from './types';

export interface InternationalizationContextValue {
  locale: Locale;
  direction: 'ltr' | 'rtl';
  messages: MessagesByLocale;
  overrides?: Overrides;
  /**
   * Optional consumer i18n runtime. When present it formats every message
   * astryx resolved; lookup and locale fallback stay in resolve().
   *
   * A nested provider REPLACES this value rather than merging with it, the
   * same as `messages` and `overrides` — a nested provider with no
   * `translator` returns that subtree to the bundled runtime.
   */
  translator?: Translator;
}

/**
 * Default value falls through to the shipped en catalog in resolve().
 * A consumer that doesn't render a provider still gets English defaults.
 */
export const InternationalizationContext =
  createContext<InternationalizationContextValue>({
    locale: 'en',
    direction: 'ltr',
    messages: {},
  });
InternationalizationContext.displayName = 'InternationalizationContext';
