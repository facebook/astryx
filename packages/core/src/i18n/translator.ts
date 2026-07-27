// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file translator.ts
 * @input Translator interface for consumer i18n runtime injection
 * @output Type surface for pluggable translators
 * @position Public API for i18n adapter integration
 *
 * Consumers who already run an i18n runtime (react-intl, Lingui, i18next, etc.)
 * can inject their own Translator instead of using the default provider. The
 * interface is deliberately small so any real i18n library can satisfy it in a
 * few lines.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/i18n/index.ts
 */

/**
 * A Translator formats ICU MessageFormat strings for a given locale.
 * Consumers can supply their own to reuse their existing i18n runtime.
 */
export interface Translator {
  /**
   * Format an ICU MessageFormat message with values in the given locale.
   */
  format(
    message: string,
    values?: Record<string, unknown>,
    locale?: string,
  ): string;
}
