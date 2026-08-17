// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsDense = {
  description:
    'outside-in app layout in 4 phases: frame -> structure -> space -> ship. each phase ends in a do/dont table.',
  sections: [
    // ===== FRAME =====
    {
      section: 'Frame: Pick the shell',
      title: 'Frame: Pick the shell',
      content: [
        {
          type: 'prose',
          text: 'phase 1/4 frame. start from the frame, not content. content-first (Card-wrapped sections in a scroll column) = prototype look.',
        },
        {
          type: 'list',
          items: [
            'pick frame: AppShell (nav apps) | Layout+LayoutPanel+LayoutContent (multi-pane tools) | plain column (docs/forms)',
            'budget regions px first: side nav 240-280, rail 64-72, inspector 340-420, facet rail 220-260',
            'raw px = structural widths only; interior spacing = tokens',
            'set container policy (rows vs card grid) + responsive contract before content',
          ],
        },
        null,
      ],
    },
    {
      section: 'Frame: Match the archetype',
      title: 'Frame: Match the archetype',
      content: [
        {
          type: 'prose',
          text: 'match frame + container policy to app type. container choice tracks archetype, not preference. each row points to a template to inherit.',
        },
        null,
        {
          type: 'prose',
          text: 'start from the matching template (npx astryx template --list), read --skeleton, inherit its nav pairing.',
        },
      ],
    },
    {
      section: 'Frame: Choose navigation',
      title: 'Frame: Choose navigation',
      content: [
        {
          type: 'prose',
          text: 'decide from countable signals (destination count, grouping, depth), not preference. inherit template pairing first.',
        },
        null,
        {
          type: 'prose',
          text: 'default left nav; top only if <=5 destinations and no grouping; top+left only for a real ecosystem layer.',
        },
      ],
    },
    {
      section: "Frame: Do & Don't",
      title: "Frame: Do & Don't",
      content: [
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
            'top+left nav when the ecosystem layer is thin',
            'break template nav pairing without a reason',
          ],
        },
      ],
    },
    // ===== STRUCTURE =====
    {
      section: 'Structure: Set hierarchy',
      title: 'Structure: Set hierarchy',
      content: [
        {
          type: 'prose',
          text: 'phase 2/4 structure. one lead per region. name lead/support/tertiary, make ranks look different. rank via type+color; drop weight before size.',
        },
        {
          type: 'list',
          items: [
            'lead: Heading, or Text weight="semibold" color="primary"',
            'support: Text color="secondary"',
            'tertiary/meta: Text type="supporting-text"/color="disabled"; StatusDot/Token over prose',
          ],
        },
        {
          type: 'prose',
          text: 'squint test: read lead, then support, then groups, in order. everything at once = raise contrast (weight/color/spacing), not borders.',
        },
      ],
    },
    {
      section: 'Structure: Choose a container',
      title: 'Structure: Choose a container',
      content: [
        {
          type: 'prose',
          text: 'strength ladder: spacing < divider < Section < Card. use the weakest that reads as a group. default-Card = generic prototype look.',
        },
        null,
        {
          type: 'prose',
          text: 'Card = widget container, not list-item wrapper. dense data = rows (Table columnar, List single-line), edge-to-edge, 32-40px. ceiling: 1 bordered level, no cards-in-cards.',
        },
        {
          type: 'prose',
          text: 'test: records -> rows; self-contained widget or hard boundary -> Card; everything else -> Section.',
        },
      ],
    },
    {
      section: 'Structure: Panels and inspectors',
      title: 'Structure: Panels and inspectors',
      content: [
        {
          type: 'prose',
          text: 'master-detail: select a row -> fixed-width inspector, no navigation away. LayoutPanel end slot + width budget + resizable; overlay content below ~1024px.',
        },
        null,
      ],
    },
    {
      section: "Structure: Do & Don't",
      title: "Structure: Do & Don't",
      content: [
        {
          type: 'list',
          items: [
            'one lead per region; rank via weight+color; one primary action',
            'default Section; weakest container that reads as a group',
            'collections = rows (Table/List), edge-to-edge with dividers',
            'inspector on select; overlay below ~1024px',
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
    // ===== SPACE =====
    {
      section: 'Space: Align to one line',
      title: 'Space: Align to one line',
      content: [
        {
          type: 'prose',
          text: 'phase 3/4 space. container owns padding + child gaps; children zero their margins. interior spacing = token (Section padding 4 = 16px).',
        },
        {
          type: 'prose',
          text: 'one content line per region (16px default). hold the line, not the padding: container_inset = content_line - component built-in inset. text=0 inset (full padding); List/Tab/Menu/nav ~8px, Table cells ~12-16px -> Section padding={0}, component owns inset. label on line, hover bleeds to edge.',
        },
        null,
        {
          type: 'prose',
          text: 'squint: draw one left line; every label touches it, only hover/selected cross it. list indented past its heading = double padding. keep one inset owner.',
        },
      ],
    },
    {
      section: 'Space: Set the rhythm',
      title: 'Space: Set the rhythm',
      content: [
        {
          type: 'prose',
          text: 'grouping via contrast, not one repeated gap. tight binds, generous separates: gap={1}-{2} within an item, {4}-{6} between sections. the jump is what reads.',
        },
        {
          type: 'prose',
          text: 'use in-between 4px steps (gap={3}=12px, {5}=20px); do not round all to {2}/{4}. verify: name the groups from spacing alone with borders removed; cannot = intervals too uniform.',
        },
      ],
    },
    {
      section: 'Space: Match density and size',
      title: 'Space: Match density and size',
      content: [
        {
          type: 'prose',
          text: 'density by use: compact = high-volume fast scan (logs/monitors); balanced = default Table/List; spacious = low-frequency/high-stakes. set deliberately.',
        },
        {
          type: 'prose',
          text: 'ONE size per row/container. all controls in a row share size (sm/md/lg) or heights lose their baseline and read broken. pick row size once; pair with density (compact->sm, spacious->md/lg).',
        },
      ],
    },
    {
      section: "Space: Do & Don't",
      title: "Space: Do & Don't",
      content: [
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
    // ===== SHIP =====
    {
      section: 'Ship: Responsive contract',
      title: 'Ship: Responsive contract',
      content: [
        {
          type: 'prose',
          text: 'phase 4/4 ship. declare breakpoints as a contract at the frame root; pair each line with the prop/hook that enforces it. typical: full frame >1024px; inspector overlays <=1024px; nav -> MobileNav <=768px.',
        },
        null,
      ],
    },
    {
      section: 'Ship: Before you ship',
      title: 'Ship: Before you ship',
      content: [
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
