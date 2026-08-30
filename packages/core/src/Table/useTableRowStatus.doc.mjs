// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableRowStatus',
  subComponentOf: 'Table',
  displayName: 'useTableRowStatus',
  description:
    'Hook that returns a TablePlugin which prepends a narrow column signaling per-row status: a colored status dot by default, or an icon when provided. getStatus maps a row to a semantic color or raw CSS color, an optional icon, and a required accessible label. The label names the status for assistive technology and the hover tooltip; when several statuses coexist, a distinct icon or visible text is still required so sighted users do not rely on color alone. Return null for no indicator. The column header is visually blank but carries a screen-reader-only localized name ("Row status", i18n key @astryx.table.rowStatus.columnHeader). Memoize getStatus with useCallback for a stable plugin identity.',
  usage: {
    description:
      'Use useTableRowStatus to add a compact status column to a Table when each row needs a named state or condition.',
    accessibility: [
      {name: 'Accessible name', description: 'Always return `label`; it names the row status for assistive technology and the hover tooltip.'},
      {name: 'Visible non-color cue', description: 'An accessible label does not give sighted users a non-color cue. When several statuses coexist, provide distinct `icon` values or visible status text. Use the default dot only when it is redundant or represents a binary present/absent condition.'},
      {name: 'Contrast across row states', description: 'A meaningful dot or icon needs 3:1 against every actual row background, including striped, selected, highlighted, hover, and custom status surfaces. Audit raw CSS colors separately; semantic names do not guarantee a pass.'},
      {name: 'Tooltip', description: 'The tooltip supplements the indicator but is hover/focus dependent and does not replace persistent visible identification required by the color-alone rule.'},
    ],
  },
  props: [
    {
      name: 'getStatus',
      type: "(item: T) => { color: 'accent' | 'success' | 'error' | 'warning' | 'red' | 'orange' | 'green' | 'yellow' | 'blue' | 'gray' | string; icon?: IconName; label: string } | null",
      description:
        'Derive the status indicator for a row: a semantic color (accent, success, error, warning, red, orange, green, yellow, blue, gray, each mapped to a theme token) or a raw CSS color as an escape hatch; an optional icon to signal status by shape instead of the dot (recommended when multiple statuses coexist; valid names: close, chevronDown, chevronLeft, chevronRight, chevronsLeft, chevronsRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone); and a required accessible label announced via role="img" and shown in a tooltip. The label covers assistive technology but does not replace a persistent visible non-color cue. Return null for rows with no status. Memoize with useCallback for a stable plugin identity.',
      required: true,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Returns a TablePlugin that prepends a narrow per-row status column: a colored dot, or an icon when provided. getStatus maps a row to {color, icon?, label} or null. color is a semantic name mapped to a theme token, or raw CSS. label is required for tooltip + accessible name; use distinct icons or visible text when several statuses coexist so sighted users do not rely on color. Memoize getStatus with useCallback.',
  propDescriptions: {
    getStatus:
      'Map a row to {color, icon?, label} or null. color = semantic status name or raw CSS; icon = visible shape cue; label = required tooltip + accessible name but does not replace a visible non-color cue. Memoize with useCallback.',
  },
};
