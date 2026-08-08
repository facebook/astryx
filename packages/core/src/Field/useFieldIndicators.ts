// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useFieldIndicators.ts
 * @input React use, FieldIndicatorContext
 * @output Exports useFieldIndicators hook
 * @position Resolves the effective required/optional indicator style
 *
 * Resolution order (per axis): per-field prop > FieldProvider context > `text`.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/FieldIndicatorContext.ts
 * - /packages/core/src/Field/FieldProvider.tsx
 * - /packages/core/src/Field/FieldLabel.tsx
 */

import {use} from 'react';
import {
  FieldIndicatorContext,
  type OptionalIndicator,
  type RequiredIndicator,
} from './FieldIndicatorContext';

/**
 * Resolve the effective indicator styles for a field, applying the
 * per-field-prop > provider > default (`text`) precedence for each axis.
 */
export function useFieldIndicators(overrides?: {
  requiredIndicator?: RequiredIndicator;
  optionalIndicator?: OptionalIndicator;
}): {required: RequiredIndicator; optional: OptionalIndicator} {
  const ctx = use(FieldIndicatorContext);
  return {
    required: overrides?.requiredIndicator ?? ctx?.requiredIndicator ?? 'text',
    optional: overrides?.optionalIndicator ?? ctx?.optionalIndicator ?? 'text',
  };
}
