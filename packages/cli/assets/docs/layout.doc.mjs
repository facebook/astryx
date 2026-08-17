// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'layout',
  title: 'Layout',
  category: 'guide',
  description:
    'Build an app layout outside-in: frame the regions, structure the content, tune the spacing, then ship. Grouped into four phases, each closing with a Do and Don\'t table.',

  sections: [
    // ===== FRAME =====
    {
      title: 'Frame: Pick the shell',
      content: [
        {
          type: 'prose',
          text: 'Phase 1 of four: Frame. Start every layout from the frame, not the content. Pick the shell, name its regions, give each an explicit width budget, then fill them. Content-first layout (writing sections and wrapping each in a Card) produces a padded scroll column that reads as a prototype, not a product.',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Pick the frame: AppShell (top and/or side nav apps), Layout + LayoutPanel + LayoutContent (multi-pane tools like explorers and consoles), or a plain content column (documents, marketing, forms)',
            'Budget regions in px before filling them: side nav 240–280, icon rail 64–72, detail/inspector panel 340–420, filter/facet rail 220–260',
            'Keep raw px for these structural widths only; everything inside a region uses the spacing scale (see Space)',
            'Set the container policy per region (rows vs card grid) and the responsive contract before writing content',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'A three-region tool frame',
          code: `// Frame: nav 256 | content flex | inspector 380 (resizable)
<AppShell sideNav={<SideNav>{/* nav items */}</SideNav>} contentPadding={0}>
  <Layout>
    <LayoutContent>{/* dense list or table, edge-to-edge */}</LayoutContent>
    <LayoutPanel width={380} resizable={{minSizePx: 320, maxSizePx: 480}} hasDivider>
      {/* inspector for the selected row */}
    </LayoutPanel>
  </Layout>
</AppShell>`,
        },
      ],
    },
    {
      title: 'Frame: Match the archetype',
      content: [
        {
          type: 'prose',
          text: 'Match the frame and container policy to the kind of app you are building. These pairings come from product-scale apps built with the design system; container choice tracks the archetype, not preference. Treat each row as a pointer to the template you inherit from, not a spec to reimplement.',
        },
        {
          type: 'table',
          headers: ['Archetype', 'Frame', 'Container policy'],
          rows: [
            [
              'Tracker / work tool (issues, tickets, CRM)',
              'AppShell + SideNav; inspector LayoutPanel on select',
              'Rows only. Grouped edge-to-edge lists, zero cards',
            ],
            [
              'Console / observability (metrics, logs, deploys)',
              'AppShell + SideNav or TopNav + TabList',
              'Card grid for dashboard widgets; Table for everything else',
            ],
            [
              'Messaging / feed',
              'Column frame: rail + sidebar + stream + panel',
              'Rows and bubbles. No cards in the stream',
            ],
            [
              'Media library / gallery',
              'AppShell + TopNav; grid content',
              'Card grid (ClickableCard); dense metadata rows in detail',
            ],
            [
              'Settings / forms',
              'AppShell + SideNav or settings template',
              'Sections with FormLayout; Card only for dangerous or billing actions',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Start from the matching template (`npx astryx template --list`), study its structure with `--skeleton`, and inherit its navigation pairing before customizing.',
        },
      ],
    },
    {
      title: 'Frame: Choose navigation',
      content: [
        {
          type: 'prose',
          text: 'When the frame leaves navigation open, decide from countable signals (how many destinations, whether they need grouping, how deep the hierarchy), not from preference. Inherit the template pairing first; this section is for when you genuinely have to choose.',
        },
        {
          type: 'table',
          headers: ['Nav', 'Choose when', 'Avoid when'],
          rows: [
            [
              'Side / left nav (default)',
              'More than ~5 destinations, they need grouping, nav is customizable, items carry secondary actions, or nav should collapse',
              'The primary nav is really filters or controls, or it must hold wide elements like breadcrumbs',
            ],
            [
              'Top nav',
              '5 or fewer destinations, context must stay always-visible, page is control- or filter-heavy with shallow nav',
              'Ownership of the top slots is unclear, or the hierarchy is deep or still growing',
            ],
            [
              'Top + left',
              'A genuine suite: top carries ecosystem-wide concerns (context switcher, global search), left carries product nav',
              'The ecosystem layer is thin, so a second bar just wastes space',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Default to a left nav; switch to top only with 5 or fewer destinations and no grouping; add top + left only when a real ecosystem layer sits above the product.',
        },
      ],
    },
    {
      title: "Frame: Do & Don't",
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Decide the frame and per-region px budgets before any content exists',
            'Choose navigation from countable signals, or inherit the template pairing',
            'Reserve raw px for structural widths; interior spacing uses tokens',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Build content-first and wrap each section in a Card, producing a padded scroll column',
            'Add a top + left nav when the ecosystem layer is thin',
            'Deviate from the template navigation pairing without a stated reason',
          ],
        },
      ],
    },
    // ===== STRUCTURE =====
    {
      title: 'Structure: Set hierarchy',
      content: [
        {
          type: 'prose',
          text: 'Phase 2 of four: Structure. Give every region one clear lead. Name what leads, what supports, and what is tertiary, then make the ranks look different; equal weight everywhere reads as a template. Express rank with type and color, and drop weight before you drop size.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Lead: Heading (level reflects page depth), or Text weight="semibold" color="primary"',
            'Support: Text color="secondary"',
            'Tertiary and metadata: Text type="supporting-text" or color="disabled"; StatusDot or Token over prose',
          ],
        },
        {
          type: 'prose',
          text: 'Squint test: blurred, you should still read the lead, then the support, then the groups, in that order. If everything reads at once, raise the contrast between ranks through weight, color, and spacing, not borders.',
        },
      ],
    },
    {
      title: 'Structure: Choose a container',
      content: [
        {
          type: 'prose',
          text: 'Grouping has a strength ladder: spacing, divider, Section, Card. Reach for the weakest tool that reads as a group and escalate only when it fails. Defaulting to a Card is the single biggest cause of the generic-prototype look.',
        },
        {
          type: 'table',
          headers: ['Tool', 'Use for', 'Strength'],
          rows: [
            ['spacing / gap', 'Separating related items inside one group. The default rhythm.', 'weakest'],
            ['Divider', 'Separating peers in a dense list or toolbar, or fencing a header from a scrollable body.', 'low'],
            ['Section', 'The default page-structure unit: related content under a heading. No border; hierarchy from spacing.', 'medium'],
            ['Card', 'A self-contained widget (KPI tile, chart, gallery entry), or a hard boundary around critical content.', 'strongest'],
          ],
        },
        {
          type: 'prose',
          text: 'Card is a widget container, not a list-item wrapper. Dense data (anything the user scans, filters, or selects) belongs in rows: Table for columnar data, List for single-line records, edge-to-edge with dividers and 32–40px rows. Ceiling: one level of bordered container, no cards inside cards.',
        },
        {
          type: 'prose',
          text: 'Decision test: a collection of records renders as rows; a self-contained widget or content that needs a hard boundary is a Card; everything else, which is most things, is a Section.',
        },
      ],
    },
    {
      title: 'Structure: Panels and inspectors',
      content: [
        {
          type: 'prose',
          text: 'Master-detail is the backbone of tool UIs: selecting a row opens a fixed-width inspector rather than navigating away. Use LayoutPanel in the end slot with an explicit width budget, add resizable for user control, and let the panel overlay the content below ~1024px instead of compressing it.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Inspector that overlays at narrow widths',
          code: `<LayoutPanel
  width={380}
  hasDivider
  isScrollable
  label="Details"
  resizable={{minSizePx: 320, maxSizePx: 480, autoSaveId: 'inspector'}}>
  {selected ? <DetailFields item={selected} /> : <EmptyState title="Nothing selected" />}
</LayoutPanel>`,
        },
      ],
    },
    {
      title: "Structure: Do & Don't",
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Give each region one lead; rank with weight and color; one primary action per region',
            'Default to Section; use the weakest container that reads as a group',
            'Render collections as rows (Table or List), edge-to-edge with dividers',
            'Open a fixed-width inspector on select; overlay it below ~1024px',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Card soup: each record wrapped in its own Card instead of rendered as rows',
            'Cards inside Cards, or full-width Cards stacked as page structure',
            'Two competing primary actions in one region',
            'Badge as decoration; use StatusDot or Token for status and metadata',
          ],
        },
      ],
    },
    // ===== SPACE =====
    {
      title: 'Space: Align to one line',
      content: [
        {
          type: 'prose',
          text: 'Phase 3 of four: Space. The container owns structural space: the padding around a region and the gap between its children. Children zero their own margins and inherit the container rhythm, so spacing never drifts child to child. Interior spacing is always a token (Section padding defaults to 4 = 16px).',
        },
        {
          type: 'prose',
          text: 'Pick one content line per region: the left edge every heading, label, and row aligns to (16px is a good default). Hold the content line constant, not the padding, with container_inset = content_line minus the component built-in inset. Plain text has zero inset and takes the full padding; List, Tab, Menu, and nav items reserve ~8px and Table cells ~12–16px, so set those to Section padding={0} and let the component own the inset. The label lands on the line while the hover background bleeds to the edge.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'One content line: absorb a component built-in inset',
          code: `// Target content line = 16px. Heading has 0 inset; the list item has ~8px.
<Section padding={4}>            {/* 16px: heading label sits at 16 */}
  <Heading>Members</Heading>
</Section>
<Section padding={0}>            {/* 0: the List owns the inset */}
  <List>{/* item label sits at 16, hover background bleeds to the edge */}</List>
</Section>`,
        },
        {
          type: 'prose',
          text: 'Squint and draw one vertical line down the left of the region: every label should touch it, and only hover or selected backgrounds should cross it. If a list is indented past its own heading, you double-padded; keep one owner of the inset, never both.',
        },
      ],
    },
    {
      title: 'Space: Set the rhythm',
      content: [
        {
          type: 'prose',
          text: 'Spacing groups through contrast, not one repeated value. Tight space binds related items; generous space separates groups. If every gap is the same step, proximity does no work. Keep intra-group gaps small and inter-group gaps a step or two larger (gap={1}–{2} within an item, {4}–{6} between sections); the jump is what reads.',
        },
        {
          type: 'prose',
          text: 'Use the in-between steps. The scale is 4px-based (gap={3} = 12px, {5} = 20px) so you can tune a cadence an 8px-only scale cannot hit; do not round everything to {2} or {4}. Verify: with every border removed, you can still name the groups from spacing alone. If you cannot, the intervals are too uniform.',
        },
      ],
    },
    {
      title: 'Space: Match density and size',
      content: [
        {
          type: 'prose',
          text: 'Match density to how a region is used: density="compact" for high-volume regions the user scans fast (logs, monitors, large datasets), density="balanced" for most Table and List surfaces, density="spacious" for low-frequency or high-stakes rows (settings, a short selection list). Set it deliberately rather than accepting the default.',
        },
        {
          type: 'prose',
          text: 'One size per row, one size per container. Every interactive element in a row shares the same size (sm, md, or lg): a sm Button next to an md Selector next to an md TextInput reads as broken even when each is fine on its own, because the heights do not share a baseline. Pick the row size once, and pair it with density (compact with sm, spacious with md or lg).',
        },
      ],
    },
    {
      title: "Space: Do & Don't",
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Let the container own padding; children zero their own margins',
            'Hold one content line per region: text on the line, hover backgrounds bleed to the edge',
            'Contrast tight and generous gaps so grouping reads without borders',
            'Use the in-between 4px steps to tune cadence',
            'One control size per row; match density to use frequency',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Double padding: a component indented past its Section heading (keep one inset owner)',
            'Raw px for interior spacing; tokens only, px is for structural widths',
            'One repeated gap everywhere, which flattens grouping',
            'Mixed sm, md, and lg controls in a single row',
          ],
        },
      ],
    },
    // ===== SHIP =====
    {
      title: 'Ship: Responsive contract',
      content: [
        {
          type: 'prose',
          text: 'Phase 4 of four: Ship. Declare breakpoint behavior as a contract before building, and keep it in a comment at the frame root. Pair every line with the mechanism that enforces it (a prop or hook) so the comment cannot drift from the behavior. A typical contract: full frame above 1024px; inspectors overlay the content at 1024px and below; the side nav collapses to MobileNav at 768px and below.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Contract comment at the frame root',
          code: `// Responsive contract:
//   > 1024px  nav 256 | content | inspector 380
//   <= 1024px inspector overlays content   (LayoutPanel overlay mode)
//   <= 768px  nav collapses to MobileNav    (AppShell mobileNav prop)`,
        },
      ],
    },
    {
      title: 'Ship: Before you ship',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'One level of bordered container at most; Section before Card',
            'Collections render as rows; Cards are widgets or hard boundaries only',
            'Interior spacing uses tokens; one padding token across a region header, body, and footer',
            'Every label in a region shares one left content line',
            'Navigation matches the template pairing or the Choose navigation signals',
            'Each responsive-contract line names a mechanism, not just a comment',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Card soup, or a card grid chosen because the app type was unclear',
            'Double padding, or magic-number px for interior spacing',
            'Flexbox soup: nested ad-hoc flexboxes instead of Grid, Layout, or FormLayout',
            'A breakpoint comment with no prop or hook wiring the behavior',
          ],
        },
      ],
    },
  ],
};
