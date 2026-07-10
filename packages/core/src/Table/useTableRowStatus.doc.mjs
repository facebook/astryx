// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useTableRowStatus',
  subComponentOf: 'Table',
  displayName: 'useTableRowStatus',
  description:
    'Hook that returns a TablePlugin which prepends a narrow column rendering a full-height colored bar on each row\u2019s leading edge \u2014 a compact way to signal per-row status (error, warning, unread, etc.) without a dedicated status column. Provide getStatus to map a row to a color + optional accessible label, or null for no indicator.',
  props: [
    {
      name: 'getStatus',
      type: '(item: T) => { color: string; label?: string } | null',
      description:
        'Derive the status indicator for a row: a CSS color (token or raw) and an optional accessible label. Return null for rows with no status.',
      required: true,
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Returns a TablePlugin that prepends a narrow column with a full-height colored bar on each row\u2019s leading edge \u2014 compact per-row status (error/warning/unread) without a full status column. getStatus maps a row to {color, label?} or null.',
  propDescriptions: {
    getStatus:
      'Map a row to {color, label?} (CSS color + optional a11y label), or null for no indicator.',
  },
};
