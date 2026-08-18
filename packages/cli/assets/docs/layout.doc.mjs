// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'layout',
  title: 'Layout',
  category: 'guide',
  description:
    'Build an app layout outside-in: frame the regions, structure the content, tune the spacing, then ship. Grouped into four phases, each closing with a Do and Don\'t table.',

  sections: [
    {
      title: 'Frame',
      content: [
        {type: 'heading', level: 3, text: 'Pick the shell'},
        {
          type: 'prose',
          text: 'Pick the shell and budget its regions in px before any content exists.',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Pick the frame: AppShell (nav apps), Layout + LayoutPanel + LayoutContent (multi-pane tools like explorers and consoles), or a plain content column (documents, forms)',
            'Budget each region in px: side nav 240–280, icon rail 64–72, inspector 340–420, filter rail 220–260',
            'Keep raw px for these structural widths only; interior spacing uses the scale (see Space)',
            'Set each region container policy (rows vs card grid) and the responsive contract before writing content',
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
        {
          type: 'prose',
          text: 'Verify: every region has a px budget and a container policy written down before any content exists.',
        },

        {type: 'heading', level: 3, text: 'Match the archetype'},
        {
          type: 'prose',
          text: 'Match the frame and container policy to your app type; container choice tracks the archetype, not preference.',
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
          text: 'Verify: start from the matching template (`npx astryx template --list`, read `--skeleton`) and inherit its navigation pairing.',
        },

        {type: 'heading', level: 3, text: 'Choose navigation'},
        {
          type: 'prose',
          text: 'When the frame leaves navigation open, decide from countable signals: destination count, grouping, hierarchy depth.',
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
          text: 'Verify: left nav unless you have 5 or fewer destinations and no grouping; top + left only above a real ecosystem layer.',
        },

        {type: 'heading', level: 3, text: "Do & Don't"},
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
    {
      title: 'Structure',
      content: [
        {type: 'heading', level: 3, text: 'Set hierarchy'},
        {
          type: 'prose',
          text: 'Give every region one lead, then separate lead, support, and tertiary with type and color; drop weight before size.',
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
          text: 'Squint test: blurred, you read lead, then support, then groups, in that order. If everything reads at once, raise contrast with weight and color, not borders.',
        },

        {type: 'heading', level: 3, text: 'Choose a container'},
        {
          type: 'prose',
          text: 'Reach for the weakest container that reads as a group and escalate only when it fails: spacing, Divider, Section, Card.',
        },
        {
          type: 'table',
          headers: ['Tool', 'Use for', 'Strength'],
          rows: [
            ['spacing / gap', 'Related items inside one group. The default rhythm.', 'weakest'],
            ['Divider', 'Peers in a dense list or toolbar, or fencing a header from a scrollable body.', 'low'],
            ['Section', 'The default page-structure unit: related content under a heading. No border; hierarchy from spacing.', 'medium'],
            ['Card', 'A self-contained widget (KPI tile, chart, gallery entry), or a hard boundary around critical content. Not a list-item wrapper.', 'strongest'],
          ],
        },
        {
          type: 'prose',
          text: 'Decision test: a collection of records renders as rows (Table for columnar, List for single-line, edge-to-edge with dividers, 32–40px); a self-contained widget or hard boundary is a Card; everything else is a Section.',
        },

        {type: 'heading', level: 3, text: 'Panels and inspectors'},
        {
          type: 'prose',
          text: 'Master-detail: selecting a row opens a fixed-width inspector instead of navigating away. Use LayoutPanel in the end slot with an explicit width budget, plus resizable for user control.',
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
        {
          type: 'prose',
          text: 'Verify: below ~1024px the panel overlays the content region instead of compressing it.',
        },

        {type: 'heading', level: 3, text: "Do & Don't"},
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
    {
      title: 'Space',
      content: [
        {type: 'heading', level: 3, text: 'Align to one line'},
        {
          type: 'prose',
          text: 'The container owns padding and child gaps; children zero their margins, and interior spacing is always a token. Pick one content line per region and hold it constant, not the padding: `container_inset = content_line - component_intrinsic_inset`.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Text and Heading: 0 inset, so the container takes the full padding (Section padding={4} = a 16px line)',
            'List, Tab, Menu, nav items: ~8px built in, so Section padding={0} and the component owns the inset',
            'Table cells: 12–16px built in, so Section padding={0} and the cell owns the inset',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'One content line, two inset owners',
          code: `// Target content line = 16px.
<Section padding={4}><Heading>Members</Heading></Section>  {/* 0 inset */}
<Section padding={0}><List>{/* items */}</List></Section>  {/* ~8px inset */}`,
        },
        {
          type: 'prose',
          text: 'Verify: draw one vertical line down the left of the region. Every label touches it; only hover and selected backgrounds cross it.',
        },

        {type: 'heading', level: 3, text: 'Set the rhythm'},
        {
          type: 'prose',
          text: 'Grouping comes from contrast between tight and generous gaps, not one repeated value. If every gap is the same step, proximity does no work.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Tight binds: gap={1}–{2} inside an item or field',
            'Generous separates: gap={4}–{6} between sections',
            'Use the in-between 4px steps to tune cadence: gap={3} = 12px, gap={5} = 20px. Do not round everything to {2} or {4}',
          ],
        },
        {
          type: 'prose',
          text: 'Verify: with every border removed, you can still name the groups from spacing alone. If you cannot, the intervals are too uniform.',
        },

        {type: 'heading', level: 3, text: 'Match density and size'},
        {
          type: 'prose',
          text: 'Match density to how often a region is used, and give every control in a row the same size so heights share a baseline.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'density="compact": high-volume regions scanned fast (logs, monitors, large datasets)',
            'density="balanced": most Table and List surfaces',
            'density="spacious": low-frequency or high-stakes rows (settings, a short selection list)',
          ],
        },
        {
          type: 'prose',
          text: 'Verify: every interactive element in a row shares one size (sm, md, or lg), paired with the density: compact with sm, spacious with md or lg.',
        },

        {type: 'heading', level: 3, text: "Do & Don't"},
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
    {
      title: 'Ship',
      content: [
        {type: 'heading', level: 3, text: 'Responsive contract'},
        {
          type: 'prose',
          text: 'Declare breakpoint behavior as a contract in a comment at the frame root, and pair every line with the prop or hook that enforces it.',
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
        {
          type: 'prose',
          text: 'Verify: every contract line names a mechanism, so the comment cannot drift from the behavior.',
        },

        {type: 'heading', level: 3, text: 'Before you ship'},
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
