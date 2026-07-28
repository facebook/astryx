// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useDirection.ts
 * @input InternationalizationContext (via use())
 * @output 'ltr' | 'rtl'
 * @position Client hook for reading the ambient text direction. Returns 'ltr'
 *   when called outside a provider (matches the silent-en-fallback pattern of
 *   useTranslator).
 *
 * Use this in components that need to swap directional icons, mirror
 * behavioral logic (slider math, keyboard nav), or apply direction-specific
 * styling that CSS logical properties can't express.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/i18n/InternationalizationContext.ts
 * - /packages/core/src/i18n/getLocaleDirection.ts (server-safe counterpart)
 * - /packages/core/src/i18n/index.ts
 */

import {use} from 'react';
import {InternationalizationContext} from './InternationalizationContext';

export function useDirection(): 'ltr' | 'rtl' {
  const ctx = use(InternationalizationContext);
  return ctx.direction;
}
