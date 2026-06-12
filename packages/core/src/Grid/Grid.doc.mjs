// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Grid',
  displayName: 'Grid',
  group: 'Layout',
  category: 'Layout',
  keywords: ["grid","columns","responsive","auto-fill","auto-fit","masonry","tiles","row","col","simplegrid","responsive grid","card grid"],
  usage: {
    description:
      'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Supports fixed column counts and responsive columns that reflow based on available width.',
    bestPractices: [
      { guidance: true, description: 'Use responsive columns for layouts that should adapt to screen size: `columns={{minWidth: 280}}`.' },
      { guidance: true, description: 'Cap the column count with `max` to prevent rows from getting too wide on large screens.' },
      { guidance: true, description: 'Use `repeat: \'fill\'` (the default) for consistent item widths. Use `\'fit\'` when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid; Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use `XDSHStack` with wrapping for grids; use Grid instead.' },
    ],
  },
  theming: {
    targets: [
      {className: 'xds-grid', visualProps: ['align', 'columns', 'gap', 'justify']},
      {className: 'xds-grid-span'},
    ],
  },
  description: 'Grid container with fixed or responsive columns.',
  props: [
    {
      name: 'columns',
      type: "number | {minWidth: number, max?: number, repeat?: 'fill' | 'fit'}",
      description: 'Column configuration. Use a number for fixed columns (e.g. `columns={3}`). Use an object for responsive columns: `minWidth` sets the minimum column width in px, `repeat` controls track behavior (`"fill"` preserves empty tracks for consistent widths, `"fit"` collapses empty tracks so items stretch; defaults to `"fill"`), and `max` caps the maximum number of columns.',
    },
    {
      name: 'minChildWidth',
      type: 'number',
      description: 'Deprecated — use `columns={{minWidth: 280}}` instead. Minimum item width in px; enables responsive auto-fit.',
    },
    {
      name: 'width',
      type: 'number | string',
      description: 'Container width.',
    },
    {
      name: 'height',
      type: 'number | string',
      description: 'Container height.',
    },
    {
      name: 'gap',
      type: 'SpacingStep',
      description: 'Spacing between all items.',
    },
    {
      name: 'rowGap',
      type: 'SpacingStep',
      description: 'Row spacing; overrides `gap` for the row axis.',
    },
    {
      name: 'columnGap',
      type: 'SpacingStep',
      description: 'Column spacing; overrides `gap` for the column axis.',
    },
    {
      name: 'align',
      type: 'GridAlignment',
      description: 'Vertical alignment of items.',
      default: "'stretch'",
    },
    {
      name: 'justify',
      type: 'GridAlignment',
      description: 'Horizontal alignment of items.',
      default: "'stretch'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Grid content.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'XDSGridSpan'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Supports fixed column counts and responsive columns that reflow based on available width.',
    bestPractices: [
      { guidance: true, description: 'Use responsive columns for layouts that should adapt to screen size: `columns={{minWidth: 280}}`.' },
      { guidance: true, description: 'Cap the column count with `max` to prevent rows from getting too wide on large screens.' },
      { guidance: true, description: 'Use `repeat: \'fill\'` (the default) for consistent item widths. Use `\'fit\'` when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid; Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use `XDSHStack` with wrapping for grids; use Grid instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'CSS Grid-based layout w/ responsive column support.',
  usage: {
    description: 'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. Supports fixed column counts and responsive columns that reflow based on available width.',
    bestPractices: [
      { guidance: true, description: 'Use responsive columns for layouts that should adapt to screen size: columns={{minWidth: 280}}.' },
      { guidance: true, description: 'Cap the column count with max to prevent rows from getting too wide on large screens.' },
      { guidance: true, description: 'Use repeat: \'fill\' (the default) for consistent item widths. Use \'fit\' when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid; Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use XDSHStack with wrapping for grids; use Grid instead.' },
    ],
  },
};
