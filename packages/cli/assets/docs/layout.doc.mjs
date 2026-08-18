// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'layout',
  title: 'Layout',
  category: 'guide',
  description:
    'Build an app layout outside-in: frame the regions, structure the content, tune the spacing, then ship. Four phases, each closing with a Do and Don\'t table.',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'Build a layout outside-in. Settle the shell and its region budgets before any content exists, then work inward. Content-first layouts drift into a padded column of cards, because every section ends up inventing its own container.',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Frame: pick the shell, budget each region in px, and choose navigation',
            'Structure: rank the content in each region, then pick the weakest container that groups it',
            'Space: hold one content line per region, then tune gaps and density',
            'Ship: declare the responsive contract and run the checklist',
          ],
        },
        {
          type: 'prose',
          text: 'Every sub-section reads the same way: the rule, how to apply it, one example, then the test that tells you it worked. Skip to the phase you are in.',
        },
      ],
    },
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
            'Pick the frame: AppShell (nav apps), Layout with LayoutPanel in a start or end slot (multi-pane tools), or a plain content column (documents, forms)',
            'Budget each region in px: SideNav 240–280, icon rail 64–72, inspector 340–420, filter rail 220–260',
            'Keep raw px for these structural widths only; interior spacing uses the scale (see Space)',
            'Set each region container policy (rows or card grid) and the responsive contract before writing content',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'A three-region tool frame',
          code: `// nav 256 | content flex | inspector 380
<AppShell sideNav={<SideNav>{/* nav items */}</SideNav>}>
  <Layout
    content={<LayoutContent>{/* dense list or table */}</LayoutContent>}
    end={<LayoutPanel width={380} hasDivider>{/* inspector */}</LayoutPanel>}
  />
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
          type: 'list',
          style: 'unordered',
          items: [
            'Tracker (issues, tickets, CRM): AppShell with SideNav, inspector on select. Rows only, zero cards',
            'Console (metrics, logs, deploys): AppShell with SideNav, or TopNav plus TabList. Card grid for widgets, Table elsewhere',
            'Messaging or feed: column frame of rail, nav, stream, panel. Rows and bubbles, never cards in the stream',
            'Media library: AppShell with TopNav over grid content. Card grid via ClickableCard, dense metadata rows in detail',
            'Settings or forms: AppShell with SideNav, or the settings template. Sections with FormLayout; Card only for destructive or billing actions',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Same records, two container policies',
          code: `// Tracker: records are rows, edge-to-edge, no Card.
<Section padding={0}>
  <List hasDividers>{/* ListItem per record */}</List>
</Section>

// Console: only self-contained widgets get a Card.
<Grid columns={{minWidth: 280}} gap={4}>
  {widgets.map(w => <Card key={w.id}>{w.chart}</Card>)}
</Grid>`,
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
          type: 'list',
          style: 'unordered',
          items: [
            'SideNav, the default: more than ~5 destinations, grouping needed, customizable nav, items with secondary actions, or nav that collapses',
            'TopNav: 5 or fewer destinations, context that must stay visible, or a control- and filter-heavy page with shallow nav',
            'Both: a genuine suite, where TopNav carries ecosystem-wide concerns (context switcher, global search) and SideNav carries product nav',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Navigation passed to AppShell',
          code: `// Default: product nav on the side.
<AppShell sideNav={<SideNav>{/* items */}</SideNav>} />

// Shallow and control-heavy: 5 or fewer destinations on top.
<AppShell topNav={<TopNav>{/* items */}</TopNav>} />

// Suite: ecosystem concerns on top, product nav on the side.
<AppShell topNav={<TopNav />} sideNav={<SideNav />} />`,
        },
        {
          type: 'prose',
          text: 'Verify: SideNav unless you have 5 or fewer destinations and no grouping; two bars only above a real ecosystem layer.',
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
            'SideNav when the nav is really filters or controls, or must hold wide elements like breadcrumbs',
            'TopNav when top-slot ownership is unclear, or the hierarchy is deep or still growing',
            'Both bars when the ecosystem layer is thin, so the second only wastes space',
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
            'Tertiary and metadata: Text type="supporting" or color="disabled"; StatusDot or Token over prose',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'One row, three ranks',
          code: `<HStack gap={2}>
  <Text weight="semibold">Payments API</Text>
  <StatusDot variant="success" label="Healthy" />
  <Text color="secondary">v2.14</Text>
  <Text type="supporting">edited 3h ago</Text>
</HStack>`,
        },
        {
          type: 'prose',
          text: 'Squint test: blurred, you read lead, then support, then groups, in that order. If everything reads at once, raise contrast with weight and color, not borders.',
        },

        {type: 'heading', level: 3, text: 'Choose a container'},
        {
          type: 'prose',
          text: 'Reach for the weakest container that reads as a group, and escalate only when it fails. This list runs weakest to strongest.',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'spacing and gap: related items inside one group. The default rhythm',
            'Divider: peers in a dense list or toolbar, or fencing a header from a scrollable body',
            'Section: the default page-structure unit, related content under a heading. No border; hierarchy comes from spacing',
            'Card: a self-contained widget (KPI tile, chart, gallery entry), or a hard boundary around critical content. Never a list-item wrapper',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Section as the default unit',
          code: `// Records are rows in one Section, not one Card each.
<Section padding={0}>
  <List header={<Heading level={3}>Members</Heading>} hasDividers>
    {/* ListItem per member */}
  </List>
</Section>`,
        },
        {
          type: 'prose',
          text: 'Decision test: a collection of records renders as rows (Table for columnar, List for single-line, edge-to-edge with dividers, 32–40px); a self-contained widget or hard boundary is a Card; everything else is a Section.',
        },

        {type: 'heading', level: 3, text: 'Panels and inspectors'},
        {
          type: 'prose',
          text: 'Master-detail: selecting a row opens a fixed-width inspector instead of navigating away.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'LayoutPanel in the end slot of Layout, with a width budget of 340–420px',
            'hasDivider to fence it from the content region; isScrollable so long detail scrolls on its own',
            'For user-adjustable width, drive it with useResizable() and place a ResizeHandle next to the panel',
            'Render an EmptyState when nothing is selected, so the region never collapses',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Inspector in the end slot',
          code: `<Layout
  content={<LayoutContent>{/* rows */}</LayoutContent>}
  end={
    <LayoutPanel width={380} hasDivider isScrollable label="Details">
      {/* detail fields, or EmptyState when nothing is selected */}
    </LayoutPanel>
  }
/>`,
        },
        {
          type: 'prose',
          text: 'Verify: at narrow widths the inspector gives up its width instead of squeezing the content region (see the responsive contract in Ship).',
        },

        {type: 'heading', level: 3, text: "Do & Don't"},
        {
          type: 'list',
          style: 'do',
          items: [
            'Give each region one lead; rank with weight and color; one primary action per region',
            'Default to Section; use the weakest container that reads as a group',
            'Render collections as rows (Table or List), edge-to-edge with dividers',
            'Open a fixed-width inspector on select, and let it yield width at narrow sizes',
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
// Heading has 0 inset, so the Section takes the full padding.
<Section padding={4}><Heading level={3}>Members</Heading></Section>
// List has ~8px built in, so the Section gives up its padding.
<Section padding={0}><List>{/* items */}</List></Section>`,
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
          type: 'code',
          lang: 'tsx',
          label: 'Tight inside, generous between',
          code: `<VStack gap={6}>
  <VStack gap={1}>
    <Text weight="semibold">Retention</Text>
    <Text color="secondary">How long logs are kept</Text>
  </VStack>
  <VStack gap={1}>{/* next field */}</VStack>
</VStack>`,
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
          type: 'code',
          lang: 'tsx',
          label: 'Density paired with control size',
          code: `<Table data={rows} columns={columns} density="compact" hasHover />

// Every control inside a compact row is size="sm".
<Button label="Retry" size="sm" variant="ghost" />`,
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
          type: 'list',
          style: 'unordered',
          items: [
            'Above 768px: SideNav holds its budget, content flexes, the inspector holds 380',
            'At 768px: navigation collapses to MobileNav, via the AppShell mobileNav breakpoint ("md" = 768, "lg" = 1024)',
            'At 1024px: the inspector stops competing for width. Swap it for a Dialog or BottomSheet, driven by useMediaQuery',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Contract wired to props',
          code: `//   >768   SideNav 256 | content | inspector 380
//   <=768  nav collapses to MobileNav   (mobileNav breakpoint)
//   <=1024 inspector moves to a Dialog  (useMediaQuery)
const isNarrow = useMediaQuery('(max-width: 1024px)');

<AppShell sideNav={<SideNav />} mobileNav={{breakpoint: 'md'}}>
  <Layout
    content={<LayoutContent>{/* rows */}</LayoutContent>}
    end={isNarrow ? undefined : <LayoutPanel width={380} hasDivider />}
  />
</AppShell>`,
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
