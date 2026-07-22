// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsDense = {
  description:
    'frame-first app layout: shell choice, region budgets, cards vs rows',
  sections: [
    {
      section: 'Frame First',
      title: 'Frame First',
      blocks: [
        {
          id: 'layout-b1',
          text: 'decide frame before content. content-first (Card-wrapped sections in a scroll column) = prototype look.',
        },
        {
          id: 'layout-b2',
          items: [
            'pick frame: AppShell (nav apps) | Layout+LayoutPanel+LayoutContent (multi-pane tools) | plain column (docs/forms)',
            'budget regions in px first: side nav 240-280, rail 64-72, inspector 340-420, facet rail 220-260',
            'container policy per region: dense data = rows; dashboards/galleries = card grids',
            'write responsive contract up front',
          ],
        },
      ],
    },
    {
      section: 'App Archetypes',
      title: 'App Archetypes',
      blocks: [
        {
          id: 'layout-b4',
          text: 'container choice tracks archetype, not preference.',
        },
        {
          id: 'layout-b6',
          text: 'start from matching template (astryx template --list), study with --skeleton.',
        },
      ],
    },
    {
      section: 'Cards vs Rows',
      title: 'Cards vs Rows',
      blocks: [
        {
          id: 'layout-b7',
          text: 'Card = widget container, NOT list-item wrapper. dense/scannable/selectable data = rows: Table (columnar) or List/Item (single-line), edge-to-edge, 32-40px rows, dividers.',
        },
        {
          id: 'layout-b8',
          items: [
            'Table+plugins: hosts, deployments, monitors, users',
            'List/Item rows: issues, files, conversations',
            'Card: KPI tiles, chart panels, gallery entries, settings groups',
            'EmptyState for zero-match',
          ],
        },
        {
          id: 'layout-b9',
          items: [
            'no Card-wrapped list items (card soup)',
            'no stacked full-width Cards as page structure',
            'no Cards in Cards',
            'no decorative Badge — counts/enums only; StatusDot/Token for status',
          ],
        },
      ],
    },
    {
      section: 'Panels and Inspectors',
      title: 'Panels and Inspectors',
      blocks: [
        {
          id: 'layout-b10',
          text: 'master-detail: row select opens fixed-width inspector (LayoutPanel end slot + width budget + resizable/useResizable). overlay content <=1024px, do not compress.',
        },
      ],
    },
    {
      section: 'Responsive Contract',
      title: 'Responsive Contract',
      blocks: [
        {
          id: 'layout-b12',
          text: 'declare breakpoint behavior as comment at frame root: which regions collapse/overlay/drop at which widths.',
        },
      ],
    },
  ],
};
