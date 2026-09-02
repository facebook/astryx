// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports from IntlProvider, IntlContext and useIntl
 * @output Public surface for the intl subpackage
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * The public API is deliberately small:
 *   - IntlProvider         — provider component
 *   - useIntl              — hook returning a translator function
 */

export {
  type Locale,
  type TranslatorFn,
  type IntlContextValue,
  IntlContext,
} from './IntlContext';
export {
  type Overrides,
  type IntlProviderProps,
  IntlProvider,
} from './IntlProvider';
export {useIntl} from './useIntl';
