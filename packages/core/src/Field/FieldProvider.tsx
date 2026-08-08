// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file FieldProvider.tsx
 * @input React useMemo, FieldIndicatorContext
 * @output Exports FieldProvider component and FieldProviderProps
 * @position Provider component for app-wide field indicator policy
 *
 * Sets the default required/optional indicator style for all Astryx fields in
 * the subtree. Per-field `requiredIndicator`/`optionalIndicator` props still
 * win over the provider. Follows the LinkProvider pattern.
 *
 * @example
 * ```
 * // Mark only optional fields; required fields show nothing visible.
 * <FieldProvider requiredIndicator="none" optionalIndicator="text">
 *   <App />
 * </FieldProvider>
 * ```
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Field/FieldIndicatorContext.ts
 * - /packages/core/src/Field/useFieldIndicators.ts
 * - /packages/core/src/Field/index.ts
 * - /packages/core/src/Field/Field.doc.mjs
 * - /packages/cli/assets/templates/blocks/components/Field/ (showcase blocks)
 */

import {useMemo, type ReactNode} from 'react';
import {
  FieldIndicatorContext,
  type OptionalIndicator,
  type RequiredIndicator,
} from './FieldIndicatorContext';

export interface FieldProviderProps {
  /**
   * Default required-indicator style for fields in the subtree.
   * @default 'text'
   */
  requiredIndicator?: RequiredIndicator;
  /**
   * Default optional-indicator style for fields in the subtree.
   * @default 'text'
   */
  optionalIndicator?: OptionalIndicator;
  children: ReactNode;
}

/**
 * Wrap your app (or a section of it) in FieldProvider to set the default
 * required/optional indicator style for all Astryx fields inside it.
 */
export function FieldProvider({
  requiredIndicator,
  optionalIndicator,
  children,
}: FieldProviderProps) {
  const value = useMemo(
    () => ({requiredIndicator, optionalIndicator}),
    [requiredIndicator, optionalIndicator],
  );
  return (
    <FieldIndicatorContext value={value}>{children}</FieldIndicatorContext>
  );
}

FieldProvider.displayName = 'FieldProvider';
