// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Translator for keys a caller supplies at runtime.
 *
 * @input Uses React (use), InternationalizationContext
 * @output Exports useCatalogTranslator
 * @position Internal to core, beside useComponentTranslator. A component's
 *   own, fixed strings render through `useComponentTranslator(<its slice>)`
 *   so an app bundles only the strings of the components it renders. A key
 *   that the CALLER supplies — PowerSearch's `operator.i18nKey`, documented
 *   as "any `@astryx.*` key, or a key from your own catalog" — can name any
 *   namespace, so it keeps the resolution a caller had before the slices:
 *   the public context's `translate`, which falls back to the whole shipped
 *   English catalog. Reading the public context brings that catalog into
 *   the bundle of a component that uses this hook; use it only where a key
 *   is not statically known to the component, never for its own strings.
 *
 * The slice-coverage check (scripts/check-i18n-catalog.mjs) counts the files
 * that import this hook, so the carve-out stays visible in review.
 */

import {use} from 'react';
import {InternationalizationContext} from './InternationalizationContext';
import type {TranslatorFn} from './useComponentTranslator';

/**
 * Resolve a key supplied by the caller against the provider's catalogs and
 * overrides, then the whole shipped English catalog.
 *
 * @example
 * ```
 * const tCaller = useCatalogTranslator();
 * const label = 'label' in operator ? operator.label : tCaller(operator.i18nKey);
 * ```
 */
export function useCatalogTranslator(): TranslatorFn {
  return use(InternationalizationContext).translate;
}
