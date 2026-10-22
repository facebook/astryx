// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resolveOperatorLabel.ts
 * @input PowerSearchOperator + translator function
 * @output Display string for the operator label
 * @position Shared label-resolution helper used at every render site that
 *   reads an operator's display text (PowerSearch.tsx, PowerSearchToken.tsx,
 *   PowerSearchEditPopover.tsx, usePowerSearchSource.ts).
 *
 * A PowerSearchOperator is a discriminated union of two variants:
 *   - `{key, value, label}`     — consumer-supplied raw text (used verbatim)
 *   - `{key, value, i18nKey}`   — catalog-driven text (looked up via t())
 *
 * Astryx's shipped default operators use the i18nKey variant; consumers
 * writing custom operators typically use the label variant.
 *
 * Two translators serve the i18nKey variant. A key in PowerSearch's own
 * namespace (`@astryx.powersearch.*`, every shipped default) resolves through
 * the component translator, exactly like PowerSearch's other fixed strings,
 * so the whole component reads one configuration. Any other key — a caller
 * naming another Astryx namespace, or its own catalog — resolves through the
 * whole-catalog translator, which keeps the shipped fallback the caller had.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/types.ts (PowerSearchOperator type)
 * - /packages/core/src/PowerSearch/index.ts (re-export)
 */

import type {TranslatorFn} from '../i18n';
import type {PowerSearchOperator} from './types';

/** The namespace of PowerSearch's own strings, shipped defaults included. */
const OWN_NAMESPACE = '@astryx.powersearch.';

export function resolveOperatorLabel(
  operator: PowerSearchOperator,
  t: TranslatorFn,
  tCaller: TranslatorFn = t,
): string {
  if ('label' in operator && operator.label !== undefined) {
    return operator.label;
  }
  return operator.i18nKey.startsWith(OWN_NAMESPACE)
    ? t(operator.i18nKey)
    : tCaller(operator.i18nKey);
}
