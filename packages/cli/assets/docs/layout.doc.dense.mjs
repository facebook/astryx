// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsDense = {
  description:
    'frame-first app layout: shell choice, region budgets, nav choice, sections vs rows vs cards',
  sections: [
    {
      section: 'Frame First',
      title: 'Frame First',
      content: [
        {
          type: 'prose',
          text: 'decide frame before content. content-first (Card-wrapped sections in a scroll column) = prototype look.',
        },
        {
          type: 'list',
          items: [
            'pick frame: AppShell (nav apps) | Layout+LayoutPanel+LayoutContent (multi-pane tools) | plain column (docs/forms)',
            'budget regions in px first: side nav 240-280, rail 64-72, inspector 340-420, facet rail 220-260',
            'interior spacing = spacing token, never raw px. px is only for structural widths (nav 256, inspector 380)',
            'container policy per region: dense data = rows; dashboards/galleries = card grids',
            'write responsive contract up front',
          ],
        },
        null,
      ],
    },
    {
      section: 'App Archetypes',
      title: 'App Archetypes',
      content: [
        {
          type: 'prose',
          text: 'container choice tracks archetype, not preference. table = pointer to the template you inherit, not a spec.',
        },
        null,
        {
          type: 'prose',
          text: 'start from matching template (astryx template --list), study with --skeleton, inherit its nav pairing.',
        },
      ],
    },
    {
      section: 'Choosing Navigation',
      title: 'Choosing Navigation',
      content: [
        {
          type: 'prose',
          text: 'choose nav from countable signals, not preference: destination count, grouping, hierarchy depth. inherit template pairing first.',
        },
        null,
        {
          type: 'prose',
          text: 'default side/left nav (>5 dests, grouping, customizable, collapsible). top nav only if <=5 dests + no grouping + control-heavy. top+left only for a real suite/ecosystem layer.',
        },
      ],
    },
    {
      section: 'Containers',
      title: 'Containers',
      content: [
        {
          type: 'prose',
          text: 'grouping ladder weakest->strongest: spacing, divider, Section, Card. use the weakest that reads as a group. Card-by-default = the generic-AI-prototype look.',
        },
        null,
        {
          type: 'prose',
          text: 'decision: collection of records = rows (Table columnar | List/Item single-line, edge-to-edge, 32-40px). self-contained widget or hard boundary = Card. everything else = Section. ceiling: one bordered container, no cards-in-cards, no card soup.',
        },
      ],
    },
    {
      section: 'Spacing & Alignment',
      title: 'Spacing & Alignment',
      content: [
        {
          type: 'prose',
          text: 'container owns structural space (region padding + child gap); children set gap/margin 0. interior spacing = token (Section padding default 4 = 16px).',
        },
        {
          type: 'prose',
          text: 'optical alignment: one content line per region (16px default). hold the line constant, not the padding: container_inset = content_line - component built-in inset. plain text = full inset; padded components (List/Tab/Menu/nav ~8px, Table cells ~12-16px) = set Section padding={0} so label lands on the line and hover bg bleeds to edge. double-padding (both container + component pad) indents rows past the heading.',
        },
        null,
      ],
    },
    {
      section: 'Panels and Inspectors',
      title: 'Panels and Inspectors',
      content: [
        {
          type: 'prose',
          text: 'master-detail: row select opens fixed-width inspector (LayoutPanel end slot + width budget + resizable/useResizable). overlay content <=1024px, do not compress.',
        },
        null,
      ],
    },
    {
      section: 'Responsive Contract',
      title: 'Responsive Contract',
      content: [
        {
          type: 'prose',
          text: 'declare breakpoint behavior as comment at frame root; pair every line with its enforcing prop/hook so the comment cannot drift.',
        },
        null,
      ],
    },
    {
      section: 'Before You Ship',
      title: 'Before You Ship',
      content: [
        {
          type: 'prose',
          text: 'self-review named anti-patterns: card soup, dashboard-by-default, double padding, magic-number spacing, flexbox soup, comment-only responsive contract.',
        },
        {
          type: 'prose',
          text: 'checks: <=1 bordered container; collections = rows; spacing = tokens (one padding token per region); one content line (no double padding); nav from template pairing; each contract line names a mechanism.',
        },
        null,
      ],
    },
  ],
};
