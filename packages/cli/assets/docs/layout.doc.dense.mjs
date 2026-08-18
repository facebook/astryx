// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsDense = {
  description:
    'outside-in app layout in 4 phases: frame -> structure -> space -> ship. each phase ends in a do/dont table.',
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
            'frame: pick shell, budget regions in px, choose nav',
            'structure: rank content per region, pick the weakest container that groups it',
            'space: hold one content line per region, then tune gaps + density',
            'ship: declare the responsive contract, run the checklist',
          ],
        },
        {
          type: 'prose',
          text: 'every sub-section: rule -> how (props) -> one example -> the test. skip to your phase.',
        },
      ],
    },
    {
      section: 'Frame',
      title: 'Frame',
      content: [
        // Pick the shell
        null,
        {
          type: 'prose',
          text: 'pick the shell + budget its regions in px before any content exists.',
        },
        {
          type: 'list',
          items: [
            'pick frame: AppShell (nav apps) | Layout + LayoutPanel in a start/end slot (multi-pane tools) | plain column (docs/forms)',
            'budget each region px: SideNav 240-280, rail 64-72, inspector 340-420, facet rail 220-260',
            'raw px = structural widths only; interior spacing = tokens',
            'set container policy (rows or card grid) + responsive contract before content',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: every region has a px budget + a container policy written down before any content.',
        },
        // Match the archetype
        null,
        {
          type: 'prose',
          text: 'match frame + container policy to app type. container choice tracks archetype, not preference.',
        },
        {
          type: 'list',
          items: [
            'tracker/work tool (issues, tickets, CRM): AppShell + SideNav, inspector LayoutPanel on select. rows only, zero cards',
            'console/observability (metrics, logs, deploys): AppShell + SideNav, or TopNav + TabList. card grid for widgets, Table elsewhere',
            'messaging/feed: column frame of rail, nav, stream, panel. rows + bubbles, no cards in stream',
            'media library/gallery: AppShell + TopNav over grid content. card grid via ClickableCard, dense meta rows in detail',
            'settings/forms: AppShell + SideNav, or settings template. Sections + FormLayout; Card only for dangerous/billing',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: start from the matching template (npx astryx template --list, read --skeleton), inherit its nav pairing.',
        },
        // Choose navigation
        null,
        {
          type: 'prose',
          text: 'nav left open? decide from countable signals: destination count, grouping, hierarchy depth.',
        },
        {
          type: 'list',
          items: [
            'SideNav (default): >~5 destinations, need grouping, customizable, items carry secondary actions, or must collapse',
            'TopNav: <=5 destinations, context must stay visible, or control/filter-heavy page w/ shallow nav',
            'both: a genuine suite. TopNav = ecosystem concerns (context switcher, global search), SideNav = product nav',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: SideNav unless <=5 destinations and no grouping; two bars only above a real ecosystem layer.',
        },
        // Do & Don't
        null,
        {
          type: 'list',
          items: [
            'decide frame + per-region px budgets before content',
            'choose nav from signals or inherit template pairing',
            'raw px for structural widths; interior = tokens',
          ],
        },
        {
          type: 'list',
          items: [
            'build content-first, Card-wrapping each section',
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
        // Set hierarchy
        null,
        {
          type: 'prose',
          text: 'one lead per region. separate lead/support/tertiary via type+color; drop weight before size.',
        },
        {
          type: 'list',
          items: [
            'lead: Heading, or Text weight="semibold" color="primary"',
            'support: Text color="secondary"',
            'tertiary/meta: Text type="supporting"/color="disabled"; StatusDot/Token over prose',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'squint test: read lead, then support, then groups, in order. everything at once = raise contrast (weight/color), not borders.',
        },
        // Choose a container
        null,
        {
          type: 'prose',
          text: 'weakest container that reads as a group, escalate only when it fails. list runs weakest to strongest.',
        },
        {
          type: 'list',
          items: [
            'spacing/gap: related items inside one group. the default rhythm',
            'Divider: peers in a dense list/toolbar, or fencing a header from a scrollable body',
            'Section: default page-structure unit, related content under a heading. no border, hierarchy from spacing',
            'Card: self-contained widget (KPI tile, chart, gallery entry) or hard boundary. never a list-item wrapper',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'test: records -> rows (Table columnar, List single-line, edge-to-edge, 32-40px); self-contained widget or hard boundary -> Card; everything else -> Section.',
        },
        // Panels and inspectors
        null,
        {
          type: 'prose',
          text: 'master-detail: select a row -> fixed-width inspector, no navigation away.',
        },
        {
          type: 'list',
          items: [
            'LayoutPanel in the end slot of Layout, width budget 340-420px',
            'hasDivider fences it from content; isScrollable so long detail scrolls on its own',
            'user-adjustable width: drive w/ useResizable(), place a ResizeHandle next to the panel',
            'EmptyState when nothing is selected, so the region never collapses',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: at narrow widths the inspector yields width instead of squeezing content (see Ship).',
        },
        // Do & Don't
        null,
        {
          type: 'list',
          items: [
            'one lead per region; rank via weight+color; one primary action',
            'default Section; weakest container that reads as a group',
            'collections = rows (Table/List), edge-to-edge with dividers',
            'inspector on select; it yields width at narrow sizes',
          ],
        },
        {
          type: 'list',
          items: [
            'card soup: each record in its own Card',
            'cards-in-cards, or full-width Cards as page structure',
            'two competing primary actions in one region',
            'Badge as decoration; use StatusDot/Token for status',
          ],
        },
      ],
    },
    {
      section: 'Space',
      title: 'Space',
      content: [
        // Align to one line
        null,
        {
          type: 'prose',
          text: 'container owns padding + child gaps; children zero margins; interior spacing = token. one content line per region, hold the line not the padding: container_inset = content_line - component_intrinsic_inset.',
        },
        {
          type: 'list',
          items: [
            'Text/Heading: 0 inset -> container takes full padding (Section padding={4} = 16px line)',
            'List/Tab/Menu/nav items: ~8px built in -> Section padding={0}, component owns inset',
            'Table cells: 12-16px built in -> Section padding={0}, cell owns inset',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: draw one vertical line down the left. every label touches it; only hover/selected backgrounds cross it.',
        },
        // Set the rhythm
        null,
        {
          type: 'prose',
          text: 'grouping = contrast between tight and generous gaps, not one repeated value. same step everywhere = proximity does no work.',
        },
        {
          type: 'list',
          items: [
            'tight binds: gap={1}-{2} inside an item or field',
            'generous separates: gap={4}-{6} between sections',
            'in-between 4px steps tune cadence: gap={3}=12px, gap={5}=20px. do not round all to {2}/{4}',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: borders removed, you can still name the groups from spacing alone. cannot = intervals too uniform.',
        },
        // Match density and size
        null,
        {
          type: 'prose',
          text: 'density by use frequency; every control in a row shares one size so heights share a baseline.',
        },
        {
          type: 'list',
          items: [
            'density="compact": high-volume, fast scan (logs, monitors, large datasets)',
            'density="balanced": most Table/List surfaces',
            'density="spacious": low-frequency or high-stakes rows (settings, short selection list)',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: one size per row (sm/md/lg), paired with density: compact -> sm, spacious -> md/lg.',
        },
        // Do & Don't
        null,
        {
          type: 'list',
          items: [
            'container owns padding; children zero margins',
            'one content line: text on line, hover bleeds to edge',
            'contrast tight vs generous gaps',
            'use in-between 4px steps',
            'one control size per row; density by use frequency',
          ],
        },
        {
          type: 'list',
          items: [
            'double padding (component past its heading); keep one inset owner',
            'raw px for interior spacing; tokens only',
            'one repeated gap everywhere',
            'mixed sm/md/lg controls in one row',
          ],
        },
      ],
    },
    {
      section: 'Ship',
      title: 'Ship',
      content: [
        // Responsive contract
        null,
        {
          type: 'prose',
          text: 'declare breakpoints as a contract at the frame root; pair each line with the prop/hook that enforces it.',
        },
        {
          type: 'list',
          items: [
            '>768: SideNav holds its budget, content flexes, inspector holds 380',
            '<=768: nav collapses to MobileNav via AppShell mobileNav breakpoint ("md"=768, "lg"=1024)',
            '<=1024: inspector stops competing for width. swap for Dialog/BottomSheet via useMediaQuery',
          ],
        },
        null,
        {
          type: 'prose',
          text: 'verify: every contract line names a mechanism, so the comment cannot drift from the behavior.',
        },
        // Before you ship
        null,
        {
          type: 'list',
          items: [
            '<=1 bordered level; Section before Card',
            'collections = rows; Cards = widgets/hard boundaries',
            'interior = tokens; one padding token across header/body/footer',
            'every label on one left content line',
            'nav matches template pairing or the signals',
            'each responsive-contract line names a mechanism',
          ],
        },
        {
          type: 'list',
          items: [
            'card soup, or card grid because app type was unclear',
            'double padding, or magic-number px interior spacing',
            'flexbox soup instead of Grid/Layout/FormLayout',
            'breakpoint comment with no prop/hook wiring it',
          ],
        },
      ],
    },
  ],
};
