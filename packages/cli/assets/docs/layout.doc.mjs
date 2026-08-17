// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'layout',
  title: 'Layout',
  category: 'guide',
  description:
    'Frame-first app layout: choosing a shell, budgeting regions, choosing navigation, and when to use sections, rows, or cards.',

  sections: [
    {
      title: 'Frame First',
      content: [
        {
          type: 'prose',
          text: 'Decide the frame before writing any content. Real applications are built top-down: pick the shell, name its regions, give each region an explicit size budget, then fill regions with content. Content-first layout (writing sections and wrapping each one in a Card) produces a padded scroll column that reads as a prototype, not a product.',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Pick the frame: AppShell (top nav and/or side nav apps), Layout + LayoutPanel + LayoutContent (multi-pane tools like explorers and consoles), or a plain content column (documents, marketing, forms)',
            'Budget regions in px before filling them: side nav 240–280, icon rail 64–72, detail/inspector panel 340–420, filter/facet rail 220–260',
            'Interior spacing is a spacing token, never raw px. Raw px is only for the structural width budgets above (nav 256, inspector 380); everything inside a region uses the spacing scale (see Spacing & Alignment)',
            'Decide the container policy per region: dense data renders as rows; widget dashboards and galleries render as card grids (see Containers)',
            'Write the responsive contract up front: which regions collapse, overlay, or drop at which breakpoints (see Responsive Contract)',
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
      title: 'App Archetypes',
      content: [
        {
          type: 'prose',
          text: 'Match the frame and container policy to the kind of app you are building. These recipes are distilled from product-scale apps built with the design system; container choice tracks the archetype, not personal preference. Treat the table as a pointer to the template you inherit from, not a spec to reimplement.',
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
              'Card grid (ClickableCard) with dense metadata rows in detail views',
            ],
            [
              'Settings / forms',
              'AppShell + SideNav or settings template',
              'Sections with FormLayout; Card only to group dangerous or billing actions',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Start from a template that matches the archetype (`npx astryx template --list`), study its structure with `--skeleton`, and inherit its navigation pairing before customizing. Deviate from the pairing only with a stated reason (see Choosing Navigation).',
        },
      ],
    },
    {
      title: 'Choosing Navigation',
      content: [
        {
          type: 'prose',
          text: 'When the frame gives you a navigation choice, decide from countable signals (number of destinations, whether they need grouping, how deep the hierarchy is), not from preference. Inherit the pairing from the matching template first; this section is for when you genuinely have to choose.',
        },
        {
          type: 'table',
          headers: ['Nav', 'Choose when', 'Avoid when'],
          rows: [
            [
              'Side / left nav (default)',
              'More than ~5 destinations, destinations need grouping, nav is user-customizable, items carry secondary actions, or nav should collapse',
              'The primary navigation is really filters or controls (e.g. a calendar), or the nav must hold wide elements like breadcrumbs',
            ],
            [
              'Top nav',
              '5 or fewer top-level destinations, context must stay always-visible, and the page is control- or filter-heavy with shallow page nav',
              'Ownership of the top slots is unclear, or the hierarchy is deep or still growing',
            ],
            [
              'Top + left',
              'A genuine suite or ecosystem: top carries ecosystem-wide concerns (context switcher, global search, shared settings), left carries product nav',
              'The ecosystem layer is thin, so a second nav bar just wastes space',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Procedure: start with a left nav; switch to top only if you have 5 or fewer destinations and no grouping; add top + left only when there is a real ecosystem layer above the product.',
        },
      ],
    },
    {
      title: 'Containers',
      content: [
        {
          type: 'prose',
          text: 'Grouping has a strength ladder: spacing, divider, Section, Card. Reach for the weakest tool that reads as a group and escalate only when it fails. Reaching for a Card by default is the single biggest cause of the generic-AI-prototype look.',
        },
        {
          type: 'table',
          headers: ['Tool', 'Use for', 'Strength'],
          rows: [
            [
              'spacing / gap',
              'Separating related items inside one group. The default rhythm.',
              'weakest',
            ],
            [
              'Divider',
              'Separating peers in a dense list or toolbar, or fencing a header from a scrollable body, when whitespace alone is ambiguous.',
              'low',
            ],
            [
              'Section',
              'The default page-structure unit: related content under a heading. No border needed; hierarchy comes from spacing.',
              'medium',
            ],
            [
              'Card',
              'A self-contained widget (KPI tile, chart, gallery entry), or a hard boundary around critical or dangerous content (billing, delete).',
              'strongest',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Card is a widget container, not a list-item wrapper. Dense data (anything the user scans, filters, or selects) belongs in rows: Table for columnar data, List/Item for single-line records, edge-to-edge with dividers and 32–40px rows. Ceiling: one level of bordered container. No cards inside cards.',
        },
        {
          type: 'prose',
          text: 'Decision test: (1) a collection of records? render rows. (2) a self-contained widget, or content that needs a hard visual boundary? use a Card. (3) everything else, which is most things, is a Section.',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Default to Section (heading + spacing) for page structure; most "wrap this in a Card" instincts should be a Section',
            'Table (with selection/sorting plugins) for columnar records: hosts, deployments, monitors, users',
            'List/Item rows for scannable single-line records: issues, files, conversations',
            'Card only for self-contained widgets (KPI tiles, chart panels, gallery entries) or a hard boundary around critical content',
            'EmptyState inside the region when a filter matches nothing',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Wrapping each list item in a Card (card soup)',
            'Stacking full-width Cards as a substitute for page structure; that is what Sections and dividers are for',
            'Nesting Cards inside Cards, or using a Card for primary content unless it needs a hard boundary',
            'Using Badge as decoration: reserve it for counts and enumerated states; use StatusDot or Token for status and metadata',
          ],
        },
      ],
    },
    {
      title: 'Spacing & Alignment',
      content: [
        {
          type: 'prose',
          text: 'The container owns structural space: the padding around a region and the gap between its children. Children set their own gaps and margins to 0 and inherit rhythm from the container, so spacing never drifts child to child. Interior spacing is always a spacing token (Section padding defaults to 4 = 16px); raw px is reserved for structural width budgets like nav 256. Use the same padding token across a region header, body, and footer so hierarchy comes from rhythm, not from borders.',
        },
        {
          type: 'prose',
          text: 'Optical alignment: pick one content line per region: the left edge that every heading, paragraph, and row label aligns to (16px is a good default). Hold the content line constant, not the container padding. For each element: container_inset = content_line minus the element built-in inset. Plain text has zero built-in inset, so it takes the full padding. Components carry their own inset (List, Tab, Menu, and nav items reserve ~8px for hit area and hover background; Table cells reserve ~12–16px), so reduce the container by that amount: set the Section to padding={0} and let the component cells define the margin, or drop the padding a step. Done right, the label lands on the content line while the hover/selected background bleeds to the region edge.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'One content line: absorb a component built-in inset',
          code: `// Target content line = 16px. Heading has 0 built-in inset; the list item has ~8px.
// Full inset for text, reduced inset for the padded component, so both labels align at 16px.
<Section padding={4}>            {/* 16px: heading label sits at 16 */}
  <Heading>Members</Heading>
</Section>
<Section padding={0}>            {/* 0: the List owns the inset */}
  <List>{/* item label sits at 16, hover background bleeds to the edge */}</List>
</Section>`,
        },
        {
          type: 'prose',
          text: 'Verify by squinting: draw one vertical line down the left of the region. Every text label should touch it; only hover or selected backgrounds should extend past it. If a table or list is indented past its own Section heading, you double-padded; remove one owner of the inset. Either the Section pads and the component runs edge-to-edge, or the component owns the inset and the Section runs to 0, never both.',
        },
      ],
    },
    {
      title: 'Panels and Inspectors',
      content: [
        {
          type: 'prose',
          text: 'Master-detail is the backbone of tool UIs: selecting a row opens a fixed-width inspector panel rather than navigating away. Use LayoutPanel in the end slot with an explicit width budget; add resizable (useResizable) for user control, and let the panel overlay the content region below ~1024px instead of compressing it.',
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
      title: 'Responsive Contract',
      content: [
        {
          type: 'prose',
          text: 'Declare breakpoint behavior as a contract before building, and keep it in a comment at the frame root. Pair every line with the mechanism that enforces it (a prop or hook) so the comment cannot drift from the behavior. A typical contract: full frame above 1024px; inspector panels overlay the content column at 1024px and below; the side nav collapses into MobileNav at 768px and below.',
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
      title: 'Before You Ship',
      content: [
        {
          type: 'prose',
          text: 'Self-review against these named failure modes; a labeled anti-pattern is far easier to catch in your own output than an abstract principle.',
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Card soup: every record wrapped in its own Card instead of rendered as rows',
            'Dashboard-by-default: a Card grid used because the app type was unclear, not because the content is widgets',
            'Double padding: a table or list indented past its Section heading because both the container and the component pad',
            'Magic-number spacing: raw px for interior spacing instead of tokens (px is only for structural widths)',
            'Flexbox soup: ad-hoc nested flexboxes instead of Grid, Layout, or FormLayout for structure',
            'Comment-only responsive contract: a breakpoint comment with no prop or hook actually wiring the behavior',
          ],
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'One level of bordered container at most; default to Section before Card',
            'Collections render as rows; Cards are widgets or hard boundaries only',
            'Interior spacing uses tokens; one padding token across a region header, body, and footer',
            'Every text label in a region shares one left content line (no double padding)',
            'Navigation chosen from the template pairing, or from the Choosing Navigation signals',
            'Each responsive-contract line names a mechanism (prop or hook), not just a comment',
          ],
        },
      ],
    },
  ],
};
