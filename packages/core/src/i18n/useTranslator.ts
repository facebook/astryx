// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTranslator.ts
 * @input InternationalizationContext (via use())
 * @output Exports useTranslator hook returning a stable translator function
 * @position Client-side hook for translating outside of render (event handlers,
 *   effects, non-component code) while still resolving against the current
 *   provider's locale.
 *
 * Prefer `t()` for translations at the callsite during render. When you need
 * to translate inside an event handler or effect, capture a translator during
 * render via useTranslator() and call it later.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/i18n/index.ts
 * - /packages/core/src/i18n/t.client.ts
 */

import {use, useCallback} from 'react';
import {InternationalizationContext} from './InternationalizationContext';
import {resolve} from './resolve';

export type TranslatorFn = (
  key: string,
  values?: Record<string, unknown>,
) => string;

/**
 * Returns a translator function bound to the current provider's locale.
 * Safe to call from event handlers and effects.
 *
 * @example
 * ```
 * function MyComponent() {
 *   const translate = useTranslator();
 *   const onClick = () => announce(translate('@astryx.pagination.pageAnnounce', {current: 1}));
 * }
 * ```
 */
export function useTranslator(): TranslatorFn {
  const ctx = use(InternationalizationContext);
  return useCallback(
    (key: string, values?: Record<string, unknown>) =>
      resolve(key, values, ctx.locale, ctx.messages, ctx.overrides),
    [ctx.locale, ctx.messages, ctx.overrides],
  );
}
