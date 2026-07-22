// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'layout',
  title: 'Layout',
  category: 'guide',
  description:
    'Frame-first app layout: choosing a shell, budgeting regions, and when to use cards vs rows.',

  sections: [
    {
      title: 'Frame First',
      content: [
        {
          id: 'layout-b1',
          type: 'prose',
          text: 'Decide the frame before writing any content. Real applications are built top-down: pick the shell, name its regions, give each region an explicit size budget, then fill regions with content. Content-first layout (writing sections and wrapping each one in a Card) produces a padded scroll column that reads as a prototype, not a product.',
        },
        {
          id: 'layout-b2',
          type: 'list',
          style: 'ordered',
          items: [
            'Pick the frame: AppShell (top nav and/or side nav apps), Layout + LayoutPanel + LayoutContent (multi-pane tools like explorers and consoles), or a plain content column (documents, marketing, forms)',
            'Budget regions in px before filling them: side nav 240–280, icon rail 64–72, detail/inspector panel 340–420, filter/facet rail 220–260',
            'Decide the container policy per region: dense data renders as rows; widget dashboards and galleries render as card grids (see Cards vs Rows)',
            'Write the responsive contract up front: which regions collapse, overlay, or drop at which breakpoints (see Responsive Contract)',
          ],
        },
        {
          id: 'layout-b3',
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
          id: 'layout-b4',
          type: 'prose',
          text: 'Match the frame and container policy to the kind of app you are building. These recipes are distilled from product-scale apps built with the design system; container choice tracks the archetype, not personal preference.',
        },
        {
          id: 'layout-b5',
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
          id: 'layout-b6',
          type: 'prose',
          text: 'Start from a template that matches the archetype (`npx astryx template --list`), then study its structure with `--skeleton` before customizing.',
        },
      ],
    },
    {
      title: 'Cards vs Rows',
      content: [
        {
          id: 'layout-b7',
          type: 'prose',
          text: 'Card is a widget container, not a list-item wrapper. The fastest way to make an app look like a generic AI prototype is to wrap every record in a Card with a Badge. Dense data (anything the user scans, filters, or selects) belongs in rows: Table for columnar data, List/Item for single-line records, edge-to-edge with dividers and 32–40px row height.',
        },
        {
          id: 'layout-b8',
          type: 'list',
          style: 'do',
          items: [
            'Table (with selection/sorting plugins) for columnar records: hosts, deployments, monitors, users',
            'List/Item rows for scannable single-line records: issues, files, conversations',
            'Card for self-contained widgets: KPI tiles, chart panels, gallery entries, settings groups',
            'EmptyState inside the region when a filter matches nothing',
          ],
        },
        {
          id: 'layout-b9',
          type: 'list',
          style: 'dont',
          items: [
            'Wrapping each list item in a Card (card soup)',
            'Stacking full-width Cards as a substitute for page structure',
            'Nesting Cards inside Cards',
            'Using Badge as decoration: reserve it for counts and enumerated states; use StatusDot or Token for status and metadata',
          ],
        },
      ],
    },
    {
      title: 'Panels and Inspectors',
      content: [
        {
          id: 'layout-b10',
          type: 'prose',
          text: 'Master-detail is the backbone of tool UIs: selecting a row opens a fixed-width inspector panel rather than navigating away. Use LayoutPanel in the end slot with an explicit width budget; add resizable (useResizable) for user control, and let the panel overlay the content region below ~1024px instead of compressing it.',
        },
        {
          id: 'layout-b11',
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
          id: 'layout-b12',
          type: 'prose',
          text: 'Declare breakpoint behavior as a contract before building, and keep it in a comment at the frame root. A typical contract: full frame above 1024px; inspector panels overlay the content column at 1024px and below; the side nav collapses into MobileNav at 768px and below. Deciding this up front keeps every region change intentional instead of emergent.',
        },
        {
          id: 'layout-b13',
          type: 'code',
          lang: 'tsx',
          label: 'Contract comment at the frame root',
          code: `// Responsive contract:
//   > 1024px  nav 256 | content | inspector 380
//   <= 1024px inspector overlays content (position: absolute, end-aligned)
//   <= 768px  nav collapses into MobileNav drawer; toolbar actions wrap`,
        },
      ],
    },
  ],
};
