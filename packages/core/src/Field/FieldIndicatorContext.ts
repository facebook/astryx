// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file FieldIndicatorContext.ts
 * @input React createContext
 * @output Exports FieldIndicatorContext and related types
 * @position Context definition for app-wide field required/optional indicators
 *
 * Separated from FieldProvider.tsx so components can consume the context
 * without pulling in the provider implementation. Follows the
 * LinkContext.ts / LinkProvider.tsx pattern.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/FieldProvider.tsx
 * - /packages/core/src/Field/useFieldIndicators.ts
 * - /packages/core/src/Field/FieldLabel.tsx
 * - /packages/core/src/Field/index.ts
 * - /packages/core/src/Field/Field.doc.mjs
 */

import {createContext} from 'react';

/**
 * How the required indicator is displayed next to a field label.
 * - `text`: the localized "Required" word (default).
 * - `asterisk`: a red `*` (decorative; the control's `aria-required` carries
 *   the semantics, and the localized word is kept for assistive tech).
 * - `none`: no visible indicator (the control still reports `aria-required`).
 */
export type RequiredIndicator = 'text' | 'asterisk' | 'none';

/**
 * How the optional indicator is displayed next to a field label.
 * - `text`: the localized "Optional" word (default).
 * - `none`: no visible indicator.
 *
 * There is no `asterisk` option: an asterisk conventionally means "required",
 * and there is no ARIA equivalent for "optional", so the word is the only
 * signal — hiding it would drop information rather than restyle it.
 */
export type OptionalIndicator = 'text' | 'none';

/**
 * App-wide default policy for field required/optional indicators.
 */
export interface FieldIndicatorContextValue {
  requiredIndicator?: RequiredIndicator;
  optionalIndicator?: OptionalIndicator;
}

/**
 * Context for setting the default required/optional indicator style across all
 * Astryx fields. Null means "no provider" — components fall back to `text`.
 */
export const FieldIndicatorContext =
  createContext<FieldIndicatorContextValue | null>(null);
FieldIndicatorContext.displayName = 'FieldIndicatorContext';
