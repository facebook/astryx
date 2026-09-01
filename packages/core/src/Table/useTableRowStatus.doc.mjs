// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableRowStatus',
  subComponentOf: 'Table',
  displayName: 'useTableRowStatus',
  description:
    'Hook that returns a TablePlugin which prepends a narrow column signaling per-row status. Semantic status colors (success, warning, error) use the matching themed semantic icon by default; palette colors and raw CSS values use a colored dot because they do not establish an outcome glyph. getStatus may override either default with an explicit icon and must provide an accessible label (shown in a tooltip on hover and announced to assistive technology, so status is never color-only); return null for no indicator. The column header is visually blank but carries a screen-reader-only localized name ("Row status", i18n key @astryx.table.rowStatus.columnHeader). Memoize getStatus with useCallback for a stable plugin identity.',
  props: [
    {
      name: 'getStatus',
      type: "(item: T) => { color: 'accent' | 'success' | 'error' | 'warning' | 'red' | 'orange' | 'green' | 'yellow' | 'blue' | 'gray' | string; icon?: IconName; label: string } | null",
      description:
        'Derive the status indicator for a row: a semantic color (success, error, warning) uses its matching themed semantic icon by default; accent, palette colors (red, orange, green, yellow, blue, gray), and raw CSS use a dot unless icon overrides the signifier. Valid icon names: close, chevronDown, chevronLeft, chevronRight, chevronsLeft, chevronsRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone. label is required and is announced via role="img" and shown in a tooltip. Return null for rows with no status. Memoize with useCallback for a stable plugin identity.',
      required: true,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Returns a TablePlugin that prepends a narrow per-row status column. success/error/warning use the matching themed semantic icon by default; palette/raw colors use a dot unless icon overrides the signifier. label is required (tooltip + accessible name). Memoize getStatus with useCallback.',
  propDescriptions: {
    getStatus:
      'Map a row to {color, icon?, label} or null. success/error/warning default to their themed semantic icon; palette/raw colors default to a dot; icon overrides either. label is required (tooltip + role="img"). Memoize with useCallback.',
  },
};
