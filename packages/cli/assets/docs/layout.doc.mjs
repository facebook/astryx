// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'layout',
  title: 'Layout',
  category: 'guide',
  description:
    'Build an app layout outside-in: scaffold the regions, structure the content, tune the spacing, then adapt across widths.',

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
            'Scaffold: pick the shell, budget each region, and choose navigation',
            'Structure: rank the content in each region, then pick the weakest container that groups it',
            'Spacing: hold one content line per region, then tune gaps and density',
            'Breakpoints: decide what each region does as width changes',
          ],
        },
        {
          type: 'prose',
          text: 'This guide decides layout, not component APIs. Run `npx astryx build "<idea>"` to start from the closest template for your app type, and `npx astryx component <Name>` for a component\'s props.',
        },
      ],
    },
    {
      title: 'Scaffold',
      content: [
        {type: 'heading', level: 3, text: 'Shell'},
        {
          type: 'prose',
          text: 'Pick the shell and budget its regions before any content exists. Structural widths are the one place raw px belongs; everything inside them uses the spacing scale.',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Pick the frame: AppShell for nav apps, Layout with LayoutPanel in a start or end slot for multi-pane tools, or a plain content column for documents and forms',
            'Give every fixed region a width budget, so no region has to negotiate for space at render time',
            'Read the content to set fill or capped: tables, charts, and boards fill their region; prose, forms, and lists cap with Layout contentWidth so lines never over-stretch',
            'Set each region container policy, rows or card grid, before writing content',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'A three-region tool frame',
          code: `// Recommended budgets: SideNav 240–280, icon rail 64–72,
// side panel 340–420, filter rail 220–260.
<AppShell sideNav={<SideNav>{/* nav items */}</SideNav>}>
  <Layout
    content={<LayoutContent>{/* table fills its region */}</LayoutContent>}
    end={<LayoutPanel width={380} hasDivider>{/* detail */}</LayoutPanel>}
  />
</AppShell>

// Capped instead: 640 suits text and forms, 960 mixed content.
// Dividers stay full-bleed.
<Layout
  contentWidth={640}
  content={<LayoutContent>{/* settings form */}</LayoutContent>}
/>`,
        },
        {
          type: 'prose',
          text: 'Verify: every region has a width budget, a fill-or-capped decision, and a container policy written down before any content exists.',
        },

        {type: 'heading', level: 3, text: 'Navigation'},
        {
          type: 'prose',
          text: 'When the frame leaves navigation open, default to SideNav: it absorbs destinations you have not planned yet. App type and destination count are guiding indicators, not determining rules.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'SideNav, the default: grouping needed, customizable nav, items with secondary actions, or nav that collapses. Trackers, consoles, and settings usually start here',
            'TopNav: a shallow nav you expect to stay shallow, context that must stay visible, or a control- and filter-heavy page; add a TabList for a second level. Media libraries often sit here, over grid content',
            'Both: a genuine suite, where TopNav carries ecosystem-wide concerns (context switcher, global search) and SideNav carries product nav',
            'Neither: messaging and feeds use a column frame of rail, nav, stream, and panel',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Navigation passed to AppShell',
          code: `// Default: product nav on the side.
<AppShell sideNav={<SideNav>{/* items */}</SideNav>} />

// Shallow, stable nav on a control-heavy page.
<AppShell topNav={<TopNav>{/* items */}</TopNav>} />

// Suite: ecosystem concerns on top, product nav on the side.
<AppShell topNav={<TopNav />} sideNav={<SideNav />} />`,
        },
        {
          type: 'prose',
          text: 'Verify: you can state the reason in one sentence, and the choice still holds if the nav doubles in size. `npx astryx build "<idea>"` names the closest template, and its `--skeleton` shows the pairing already wired up.',
        },

        {type: 'heading', level: 3, text: 'Best practices'},
        {
          type: 'list',
          style: 'do',
          items: [
            'Decide the frame, region width budgets, and fill or capped before any content exists',
            'State the reason for the navigation choice, or inherit the template pairing',
            'Reserve raw px for structural widths; interior spacing uses tokens',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Build content-first and wrap each section in a Card, producing a padded scroll column',
            'Stretch prose, forms, or lists across a wide region instead of capping with contentWidth',
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
        {type: 'heading', level: 3, text: 'Type hierarchy'},
        {
          type: 'prose',
          text: 'Give every region one lead, then rank the rest with weight and color rather than size. Content uses two text colors, primary and secondary, and nothing dimmer: body copy needs no props at all.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Body, the default: plain Text with no type, color, or size prop',
            'Lead: Heading at the level matching page depth, or body Text at a heavier weight',
            'Support: step to the secondary color, not to a smaller size',
            'Metadata: the supporting type, or a StatusDot or Token instead of prose',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Body copy, then one row of four ranks',
          code: `// Body copy takes no props. Text already defaults to body
// size in the primary color.
<Text>Credentials rotate every 90 days</Text>

<HStack gap={2}>
  <Text weight="semibold">Payments API</Text>
  <StatusDot variant="success" label="Healthy" />
  <Text color="secondary">v2.14</Text>
  <Text type="supporting">edited 3h ago</Text>
</HStack>`,
        },
        {
          type: 'prose',
          text: 'Squint test: blurred, you read lead, then support, then groups, in that order. If everything reads at once, raise contrast with weight and color, not borders and not smaller text.',
        },

        {type: 'heading', level: 3, text: 'Containers'},
        {
          type: 'prose',
          text: 'Reach for the weakest container that reads as a group, and escalate only when it fails. Weakest to strongest:',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'spacing and gap: related items inside one group. The default rhythm',
            'Divider: peers in a dense list or toolbar, or fencing a header from a scrollable body',
            'Section: the default page-structure unit, related content under a heading. No border',
            'Card: a self-contained widget (KPI tile, chart, gallery entry), or a hard boundary around critical content',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Section as the default unit',
          code: `// Records are rows in one Section, not one Card each.
// Recommended row height: 32–40px.
<Section padding={0}>
  <List header={<Heading level={3}>Members</Heading>} hasDividers>
    {/* ListItem per member */}
  </List>
</Section>`,
        },
        {
          type: 'prose',
          text: 'Decision test: records render as rows, Table for columnar and List for single-line; a self-contained widget or hard boundary is a Card; everything else is a Section.',
        },

        {type: 'heading', level: 3, text: 'Headers and footers'},
        {
          type: 'prose',
          text: 'A region can pin a header or footer while its body scrolls. Both are Layout slots, and padding set once on Layout reaches all three, so header, body, and footer share one content line.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'LayoutHeader in the header slot: the region title and its primary action',
            'Toolbar instead of LayoutHeader when the header carries interactive controls',
            'LayoutFooter in the footer slot: actions that commit the work and must stay reachable',
            'defaultHasDividers on Layout fences both at once, rather than hasDivider per slot',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Pinned header and footer around a scrolling body',
          code: `// padding on Layout reaches every slot, so all three align.
<Layout
  padding={4}
  defaultHasDividers
  header={<LayoutHeader>{/* title + primary action */}</LayoutHeader>}
  content={<LayoutContent>{/* rows */}</LayoutContent>}
  footer={<LayoutFooter>{/* Save and Cancel */}</LayoutFooter>}
/>`,
        },
        {
          type: 'prose',
          text: 'Verify: scroll the body. The header and footer stay put, their dividers run full-bleed, and all three still share one left content line.',
        },

        {type: 'heading', level: 3, text: 'Side panels'},
        {
          type: 'prose',
          text: 'Master-detail: selecting a row opens a fixed-width side panel instead of navigating away.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'LayoutPanel in the start or end slot of Layout, holding a fixed width budget',
            'hasDivider to fence it from the content region; isScrollable so long detail scrolls on its own',
            'For user-adjustable width, pair useResizable() with a ResizeHandle on the panel inner edge: after the panel in a start slot, before it in an end slot with isReversed',
            'The handle then owns the divider, so the panel sets hasDivider={false}',
            'Render an EmptyState when nothing is selected, so the region never collapses',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Fixed panel, then the resizable form',
          code: `// Recommended panel width: 340–420.
<Layout
  content={<LayoutContent>{/* rows */}</LayoutContent>}
  end={
    <LayoutPanel width={380} hasDivider isScrollable label="Details">
      {/* detail fields, or EmptyState when nothing is selected */}
    </LayoutPanel>
  }
/>

// Resizable: handle first in an end slot, and isReversed so
// dragging left widens the panel.
end={
  <>
    <ResizeHandle isReversed hasDivider resizable={panel.props}
      label="Resize details" />
    <LayoutPanel width={panel.size} hasDivider={false} />
  </>
}`,
        },
        {
          type: 'prose',
          text: 'Verify: at narrow widths the panel yields width instead of squeezing content (see Breakpoints), and only one element between the regions draws a border.',
        },

        {type: 'heading', level: 3, text: 'Best practices'},
        {
          type: 'list',
          style: 'do',
          items: [
            'One lead per region; rank with weight and color; one primary action',
            'Leave body copy at its defaults; demote by weight and color, not size',
            'Default to Section; use the weakest container that reads as a group',
            'Render collections as rows (Table or List), edge-to-edge with dividers',
            'Open a fixed-width side panel on select; let it yield width at narrow sizes',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Grey and shrink body copy, so a whole region reads as secondary metadata',
            'The disabled color for content; it fails contrast and is for disabled controls',
            'Card soup: each record wrapped in its own Card instead of rendered as rows',
            'Cards inside Cards, or full-width Cards stacked as page structure',
            'A header or footer rebuilt inside the body, where it scrolls away with the rows',
            'Flexbox soup: nested ad-hoc flexboxes instead of Grid, Layout, Section, or FormLayout',
            'Two competing primary actions in one region',
            'Badge as decoration; use StatusDot or Token for status and metadata',
          ],
        },
      ],
    },
    {
      title: 'Spacing',
      content: [
        {type: 'heading', level: 3, text: 'Alignment'},
        {
          type: 'prose',
          text: 'The container owns padding and child gaps; children zero their margins, and interior spacing is always a token. Pick one content line per region and hold it constant, not the padding: `container_inset = content_line - component_intrinsic_inset`.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Text and Heading carry no inset, so the container takes the full padding',
            'List, Tab, Menu, and nav items carry a small inset, so the container gives up its padding and the component owns the line',
            'Table cells carry a larger inset, so the container gives up its padding and the cell owns the line',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'One content line, two inset owners',
          code: `// Target content line = 16px.
// Heading has 0 inset, so the Section takes the full padding.
<Section padding={4}><Heading level={3}>Members</Heading></Section>

// List has ~8px built in, Table cells 12–16px, so the Section
// gives up its padding and the component owns the inset.
<Section padding={0}><List>{/* items */}</List></Section>`,
        },
        {
          type: 'prose',
          text: 'Verify: draw one vertical line down the left of the region. Every label touches it; only hover and selected backgrounds cross it.',
        },

        {type: 'heading', level: 3, text: 'Rhythm'},
        {
          type: 'prose',
          text: 'Grouping comes from contrast between tight and generous gaps, not one repeated value. If every gap is the same step, proximity does no work.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Tight gaps bind: the smallest steps, used inside an item or field',
            'Generous gaps separate: several steps up, used between sections',
            'Reach for the in-between steps to tune cadence, rather than rounding everything to the same two values',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Tight inside, generous between',
          code: `// Tight binds at gap={1}–{2}, generous separates at gap={4}–{6}.
// In-between steps tune cadence: gap={3} = 12px, gap={5} = 20px.
<VStack gap={6}>
  <VStack gap={1}>
    <Text weight="semibold">Retention</Text>
    <Text color="secondary">Logs are kept for 30 days</Text>
  </VStack>
  <VStack gap={1}>{/* next label and value */}</VStack>
</VStack>`,
        },
        {
          type: 'prose',
          text: 'Verify: with every border removed, you can still name the groups from spacing alone. If you cannot, the intervals are too uniform. Form fields are the exception: FormLayout owns their spacing.',
        },

        {type: 'heading', level: 3, text: 'Density and size'},
        {
          type: 'prose',
          text: 'Match density to how often a region is used, and give every control in a row the same size so heights share a baseline.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Compact: high-volume regions scanned fast, like logs, monitors, and large datasets',
            'Balanced: most Table and List surfaces',
            'Spacious: low-frequency or high-stakes rows, like settings or a short selection list',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Density paired with control size',
          code: `// Pair density with one control size: compact with sm,
// balanced with sm or md, spacious with md or lg.
<Table data={rows} columns={columns} density="compact" hasHover />
<Button label="Retry" size="sm" variant="ghost" />`,
        },
        {
          type: 'prose',
          text: 'Verify: every interactive element in a row shares one size, and that size is paired with the density of the region it sits in.',
        },

        {type: 'heading', level: 3, text: 'Best practices'},
        {
          type: 'list',
          style: 'do',
          items: [
            'Let the container own padding; children zero their own margins',
            'Hold one content line per region: text on the line, hover backgrounds bleed to the edge',
            'Hold one padding token across a region header, body, and footer',
            'Contrast tight and generous gaps so grouping reads without borders',
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
            'Mixed control sizes in a single row',
          ],
        },
      ],
    },
    {
      title: 'Breakpoints',
      content: [
        {type: 'heading', level: 3, text: 'Responsive contract'},
        {
          type: 'prose',
          text: 'Lock what each region does as width changes, and pair every line of the contract with the prop or hook that enforces it.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Divide: how many regions survive at each width',
            'Reveal: which regions earn their width only when there is room, and open on demand below that',
            'Resize: content flexes while fixed regions hold their budgets, and text stays capped by contentWidth so line length holds',
            'Swap: navigation becomes MobileNav at the AppShell mobileNav breakpoint; the side panel becomes a Dialog or BottomSheet, driven by useMediaQuery',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Contract wired to props',
          code: `// Recommended thresholds: 3 regions above 1024, 2 from 768,
// 1 below. Text reads best at 40–60 characters per line.
//   >1024  SideNav 256 | content | side panel 380
//   <=1024 panel moves to a Dialog     (useMediaQuery)
//   <=768  nav collapses to MobileNav   (mobileNav "md")
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

        {type: 'heading', level: 3, text: 'Best practices'},
        {
          type: 'list',
          style: 'do',
          items: [
            'Write the contract down for every region before you call the layout done',
            'Decide per region whether it is revealed, resized, or swapped at each width',
            'Drop a region rather than let it compete for width it does not have',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Hold three regions at a width where none of them has usable space',
            'Shrink every region uniformly instead of swapping or dropping one',
            'Wire a breakpoint in CSS that the contract comment never mentions',
          ],
        },
      ],
    },
  ],
};
