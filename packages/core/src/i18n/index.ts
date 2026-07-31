// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports from InternationalizationProvider, InternationalizationContext,
 *   useTranslator, translator, types
 * @output Public surface for the i18n subpackage
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * The public API is deliberately small:
 *   - InternationalizationProvider — provider component
 *   - useTranslator               — hook returning a translator function
 *   - useDirection                — hook returning the ambient text direction
 *   - getLocaleDirection          — server-safe locale → direction helper
 *   - Translator                  — interface for consumer-injected runtimes
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/index.ts
 * - /packages/core/src/i18n/useDirection.ts
 * - /packages/core/src/i18n/getLocaleDirection.ts
 */

export {InternationalizationProvider} from './InternationalizationProvider';
export type {InternationalizationProviderProps} from './InternationalizationProvider';
export {InternationalizationContext} from './InternationalizationContext';
export type {InternationalizationContextValue} from './InternationalizationContext';
export {useTranslator} from './useTranslator';
export type {TranslatorFn} from './useTranslator';
export {useDirection} from './useDirection';
export {getLocaleDirection} from './getLocaleDirection';
export type {Translator} from './translator';
export type {
  Locale,
  Catalog,
  MessageEntry,
  MessagesByLocale,
  Overrides,
} from './types';
