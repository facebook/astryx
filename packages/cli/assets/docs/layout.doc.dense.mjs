// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsDense = {
  description:
    'outside-in app layout: scaffold -> structure -> spacing -> breakpoints.',
  sections: [
    {
      section: 'Overview',
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'build outside-in. settle the shell + region budgets before any content, then work inward. content-first drifts into a padded column of cards, each section inventing its own container.',
        },
        {
          type: 'list',
          items: [
            'scaffold: pick shell, budget regions, choose nav',
            'structure: rank content per region, pick the weakest container that groups it',
            'spacing: hold one content line per region, then tune gaps + density',
            'breakpoints: decide what each region does as width changes',
          ],
        },
        {
          type: 'prose',
          text: 'decides layout, not component APIs. npx astryx build "<idea>" = closest template for your app type. npx astryx component <Name> = props.',
        },
      ],
    },
    {
      section: 'Scaffold',
      title: 'Scaffold',
      content: [
        // Shell
        null,
        {
          type: 'prose',
          text: 'pick the shell + budget its regions before any content exists. structural widths are the one place raw px belongs; everything inside uses the scale.',
        },
        {
          type: 'list',
          items: [
            'pick frame: AppShell (nav apps) | Layout + LayoutPanel in a start/end slot (multi-pane tools) | plain column (docs/forms)',
            'give every fixed region a width budget, so none negotiates for space at render time',
            'read content to set fill vs capped: tables/charts/boards fill; prose/forms/lists cap via Layout contentWidth',
            'set container policy (rows or card grid) before writing content',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: every region has a width budget + fill-or-capped + a container policy written down before any content.',
        },
        // Navigation
        null,
        {
          type: 'prose',
          text: 'nav left open? default SideNav: it absorbs destinations you have not planned yet. app type + destination count are guiding indicators, not determining rules.',
        },
        {
          type: 'list',
          items: [
            'SideNav (default): need grouping, customizable, items carry secondary actions, or must collapse. trackers, consoles, settings usually start here',
            'TopNav: shallow nav you expect to stay shallow, context must stay visible, or control/filter-heavy page; + TabList for a 2nd level. media libraries often sit over grid content',
            'both: a genuine suite. TopNav = ecosystem concerns (context switcher, global search), SideNav = product nav',
            'neither: messaging/feeds use a column frame of rail, nav, stream, panel',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: you can state the reason in one sentence, and it still holds if the nav doubles. npx astryx build "<idea>" names the closest template, --skeleton shows the pairing wired up.',
        },
        // Best practices
        null,
        {
          type: 'list',
          items: [
            'decide frame + region width budgets + fill-or-capped before content',
            'state the reason for the nav choice, or inherit template pairing',
            'raw px for structural widths; interior = tokens',
          ],
        },
        {
          type: 'list',
          items: [
            'build content-first, Card-wrapping each section',
            'stretch prose/forms/lists across a wide region instead of capping with contentWidth',
            'SideNav when the nav is really filters/controls, or must hold wide elements like breadcrumbs',
            'TopNav when top-slot ownership is unclear, or hierarchy is deep or still growing',
            'both bars when the ecosystem layer is thin',
            'break template nav pairing without a reason',
          ],
        },
      ],
    },
    {
      section: 'Structure',
      title: 'Structure',
      content: [
        // Type hierarchy
        null,
        {
          type: 'prose',
          text: 'one lead per region, then rank with weight+color, not size. two text colors only: primary + secondary, nothing dimmer. body copy needs no props.',
        },
        {
          type: 'list',
          items: [
            'body (default): plain Text, no type/color/size prop',
            'lead: Heading at the level matching page depth, or body Text at a heavier weight',
            'support: step to secondary color, not to a smaller size',
            'meta: the supporting type, or StatusDot/Token instead of prose',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'squint test: read lead, then support, then groups, in order. everything at once = raise contrast (weight/color), not borders and not smaller text.',
        },
        // Containers
        null,
        {
          type: 'prose',
          text: 'weakest container that reads as a group, escalate only when it fails. weakest to strongest:',
        },
        {
          type: 'list',
          items: [
            'spacing/gap: related items inside one group. the default rhythm',
            'Divider: peers in a dense list/toolbar, or fencing a header from a scrollable body',
            'Section: default page-structure unit, related content under a heading. no border',
            'Card: self-contained widget (KPI tile, chart, gallery entry) or hard boundary',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'test: records -> rows (Table columnar, List single-line); self-contained widget or hard boundary -> Card; everything else -> Section.',
        },
        // Headers and footers
        null,
        {
          type: 'prose',
          text: 'a region can pin a header/footer while its body scrolls. both are Layout slots, and padding set once on Layout reaches all three, so header/body/footer share one content line.',
        },
        {
          type: 'list',
          items: [
            'LayoutHeader in the header slot: region title + its primary action',
            'Toolbar instead of LayoutHeader when the header carries interactive controls',
            'LayoutFooter in the footer slot: actions that commit the work + must stay reachable',
            'defaultHasDividers on Layout fences both at once, rather than hasDivider per slot',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: scroll the body. header + footer stay put, dividers run full-bleed, all three still share one left content line.',
        },
        // Side panels
        null,
        {
          type: 'prose',
          text: 'master-detail: select a row -> fixed-width side panel, no navigation away.',
        },
        {
          type: 'list',
          items: [
            'LayoutPanel in the start or end slot of Layout, holding a fixed width budget',
            'hasDivider fences it from content; isScrollable so long detail scrolls on its own',
            'user-adjustable width: useResizable() + ResizeHandle on the panel inner edge. after the panel in a start slot, before it in an end slot w/ isReversed',
            'the handle then owns the divider, so the panel sets hasDivider={false}',
            'EmptyState when nothing is selected, so the region never collapses',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: at narrow widths the panel yields width instead of squeezing content (see Breakpoints), and only one element between the regions draws a border.',
        },
        // Best practices
        null,
        {
          type: 'list',
          items: [
            'one lead per region; rank via weight+color; one primary action',
            'leave body copy at its defaults; demote via weight+color, not size',
            'default Section; weakest container that reads as a group',
            'collections = rows (Table/List), edge-to-edge with dividers',
            'side panel on select; it yields width at narrow sizes',
          ],
        },
        {
          type: 'list',
          items: [
            'grey + shrink body copy, so a whole region reads as metadata',
            'the disabled color for content; it fails contrast, it is for disabled controls',
            'card soup: each record in its own Card',
            'cards-in-cards, or full-width Cards as page structure',
            'a header/footer rebuilt inside the body, where it scrolls away with the rows',
            'flexbox soup instead of Grid/Layout/Section/FormLayout',
            'two competing primary actions in one region',
            'Badge as decoration; use StatusDot/Token for status',
          ],
        },
      ],
    },
    {
      section: 'Spacing',
      title: 'Spacing',
      content: [
        // Alignment
        null,
        {
          type: 'prose',
          text: 'container owns padding + child gaps; children zero margins; interior spacing = token. one content line per region, hold the line not the padding: container_inset = content_line - component_intrinsic_inset.',
        },
        {
          type: 'list',
          items: [
            'Text/Heading carry no inset -> container takes the full padding',
            'List/Tab/Menu/nav items carry a small inset -> container gives up padding, component owns the line',
            'Table cells carry a larger inset -> container gives up padding, cell owns the line',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: draw one vertical line down the left. every label touches it; only hover/selected backgrounds cross it.',
        },
        // Rhythm
        null,
        {
          type: 'prose',
          text: 'grouping = contrast between tight and generous gaps, not one repeated value. same step everywhere = proximity does no work.',
        },
        {
          type: 'list',
          items: [
            'tight gaps bind: the smallest steps, inside an item or field',
            'generous gaps separate: several steps up, between sections',
            'reach for the in-between steps to tune cadence, not the same two values everywhere',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: borders removed, you can still name the groups from spacing alone. cannot = intervals too uniform. form fields excepted: FormLayout owns their spacing.',
        },
        // Density and size
        null,
        {
          type: 'prose',
          text: 'density by use frequency; every control in a row shares one size so heights share a baseline.',
        },
        {
          type: 'list',
          items: [
            'compact: high-volume, fast scan (logs, monitors, large datasets)',
            'balanced: most Table/List surfaces',
            'spacious: low-frequency or high-stakes rows (settings, short selection list)',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: one size per row, paired with the density of the region it sits in.',
        },
        // Best practices
        null,
        {
          type: 'list',
          items: [
            'container owns padding; children zero margins',
            'one content line: text on line, hover bleeds to edge',
            'one padding token across region header/body/footer',
            'contrast tight vs generous gaps',
            'one control size per row; density by use frequency',
          ],
        },
        {
          type: 'list',
          items: [
            'double padding (component past its heading); keep one inset owner',
            'raw px for interior spacing; tokens only',
            'one repeated gap everywhere',
            'mixed control sizes in one row',
          ],
        },
      ],
    },
    {
      section: 'Breakpoints',
      title: 'Breakpoints',
      content: [
        // Responsive contract
        null,
        {
          type: 'prose',
          text: 'lock what each region does as width changes; pair each contract line with the prop/hook that enforces it.',
        },
        {
          type: 'list',
          items: [
            'divide: how many regions survive at each width',
            'reveal: which regions earn their width only when there is room, opening on demand below that',
            'resize: content flexes, fixed regions hold their budgets, text capped by contentWidth so line length holds',
            'swap: nav -> MobileNav at the AppShell mobileNav breakpoint; side panel -> Dialog/BottomSheet via useMediaQuery',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: every contract line names a mechanism, so the comment cannot drift from the behavior.',
        },
        // Best practices
        null,
        {
          type: 'list',
          items: [
            'write the contract down for every region before calling the layout done',
            'decide per region: revealed, resized, or swapped at each width',
            'drop a region rather than let it fight for width it lacks',
          ],
        },
        {
          type: 'list',
          items: [
            '3 regions at a width where none has usable space',
            'shrink every region uniformly instead of swapping/dropping one',
            'a CSS breakpoint the contract comment never mentions',
          ],
        },
      ],
    },
  ],
};
