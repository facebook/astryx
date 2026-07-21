// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useTableRowStatus',
  subComponentOf: 'Table',
  displayName: 'useTableRowStatus',
  description:
    'Hook that returns a TablePlugin which prepends a narrow column signaling per-row status: a colored status dot by default, or an icon when provided (shape + color is more accessible than color alone). getStatus maps a row to a semantic color (mapped to a theme token) or raw CSS color, an optional icon, and a required accessible label (shown in a tooltip on hover and announced to assistive technology, so status is never color-only); return null for no indicator. Memoize getStatus with useCallback for a stable plugin identity.',
  props: [
    {
      name: 'getStatus',
      type: '(item: T) => { color: TableRowStatusColor | string; icon?: IconName; label: string } | null',
      description:
        'Derive the status indicator for a row: a semantic color (accent/success/error/warning/red/orange/green/yellow/blue/gray, mapped to a theme token) or a raw CSS color as an escape hatch; an optional icon to signal status by shape instead of the dot (recommended when multiple statuses coexist); and a required accessible label (announced via role="img" and shown in a tooltip on hover, so a status is never conveyed by color alone). Return null for rows with no status. Memoize with useCallback for a stable plugin identity.',
      required: true,
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Returns a TablePlugin that prepends a narrow per-row status column: a colored dot, or an icon when provided (shape + color beats color alone for a11y). getStatus maps a row to {color, icon?, label} or null. color is a semantic name (success/error/warning/etc.) mapped to a theme token, or a raw CSS color. label is required (tooltip + accessible name). Memoize getStatus with useCallback.',
  propDescriptions: {
    getStatus:
      'Map a row to {color, icon?, label} or null. color = semantic status name (mapped to a token) or raw CSS; icon = shape signifier (a11y); label = required accessible name (tooltip + role="img"). Memoize with useCallback.',
  },
};
