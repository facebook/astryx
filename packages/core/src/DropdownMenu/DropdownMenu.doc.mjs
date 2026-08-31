// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenu',
  displayName: 'Dropdown Menu',
  group: 'DropdownMenu',
  category: 'Action',
  keywords: [
    'dropdown',
    'menu',
    'popover',
    'select',
    'actions',
    'contextmenu',
    'overflow',
    'kebab',
    'menubutton',
  ],
  playground: {
    // `items` is required; without seeded entries the properties-tab preview
    // renders an empty trigger button. Provide a few actions so the preview
    // is meaningful.
    defaults: {
      button: {label: 'Actions'},
      presentation: 'popover',
      items: [
        {label: 'Edit project', icon: 'wrench'},
        {label: 'Duplicate project', icon: 'copy'},
        {label: 'Share project', icon: 'externalLink'},
        {label: 'Archive project', icon: 'stop'},
      ],
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-dropdown-menu',
        visualProps: ['presentation'],
      },
      {
        className: 'astryx-dropdown-menu-item',
        visualProps: ['size', 'variant'],
      },
      {
        className: 'astryx-dropdown-menu-radio',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-dropdown-menu-section-heading'},
      {className: 'astryx-dropdown-menu-divider'},
      {className: 'astryx-dropdown-menu-indicator-icon'},
    ],
    vars: [
      {
        name: '--_dropdown-menu-radius',
        description: 'Border radius of the menu popup',
        default: 'var(--radius-element)',
        private: true,
      },
      {
        name: '--_dropdown-menu-padding',
        description: 'Inner padding of the menu popup',
        default: 'var(--spacing-1)',
        private: true,
      },
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dropdown-menu-radius']},
      {property: 'padding', vars: ['--_dropdown-menu-padding']},
    ],
  },
  description:
    'Action menu with a trigger button and anchored, bottom-sheet, or adaptive presentation.',
  props: [
    {
      name: 'button',
      type: 'DropdownMenuButtonProps',
      description:
        'Props for the trigger button (Button props except onClick).',
      default: "{ label: 'Menu' }",
    },
    {
      name: 'items',
      type: 'DropdownMenuOption[]',
      description:
        'Array of menu entries. Each entry is one of: an action item `{label, onClick?, icon?, description?, endContent?, isDisabled?, variant?, hasCloseOnSelect?, id?}` (variant `"destructive"` renders it in the error color; `endContent` holds trailing content such as a keyboard-shortcut hint; `id` is the row\'s stable React key, needed only when the array reorders or filters), a divider `{type: "divider"}`, or a section `{type: "section", title?, id?, items: [...action items]}`.',
      required: true,
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        "Presentation surface for data-driven items. 'popover' stays anchored, 'bottom-sheet' always renders the actions in a modal BottomSheet, and 'adaptive' uses a BottomSheet on compact coarse-pointer layouts while remaining anchored elsewhere. Compound children currently support popover only.",
      default: "'popover'",
    },
    {
      name: 'isMenuOpen',
      type: 'boolean',
      description: 'Controlled open state for the menu.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Callback fired when the open state changes.',
    },
    {
      name: 'menuWidth',
      type: 'number | string',
      description:
        'Minimum width for the popover presentation. Length values may grow for content; intrinsic and CSS-wide keywords select the preferred inline size. Every form is capped to the available viewport space. Defaults to matching the trigger width up to that cap.',
    },
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description:
        "Popover placement relative to the trigger. Ignored by the bottom-sheet presentation. Logical: start/end resolve against the menu's own inherited direction (RTL mirrors).",
      default: "'below'",
    },
    {
      name: 'alignment',
      type: "'start' | 'center' | 'end'",
      description:
        "Popover alignment along the placement axis. Ignored by the bottom-sheet presentation. Logical: start/end follow the menu's own inherited direction (RTL mirrors).",
      default: "'start'",
    },
    {
      name: 'onClick',
      type: '() => void',
      description: 'Callback fired when the trigger button is clicked.',
    },
    {
      name: 'hasChevron',
      type: 'boolean',
      description:
        'Whether to show a chevron icon on the trigger button. Set to false for icon-only triggers.',
      default: 'true',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Compound-mode menu content: DropdownMenuItem, DropdownMenuDivider, DropdownMenuSubMenu, and the selectable items. Mutually exclusive with `items`.',
    },
  ],
  components: [
    {name: 'DropdownMenuItem'},
    {name: 'DropdownMenuDivider'},
    {name: 'DropdownMenuCheckboxItem'},
    {name: 'DropdownMenuRadioGroup'},
    {name: 'DropdownMenuRadioItem'},
    {name: 'DropdownMenuSubMenu'},
  ],
  usage: {
    description:
      'A dropdown menu that displays a list of actionable items in a popup triggered by a button. Use to present action options as a next step in a process, or to offer contextual actions without cluttering the interface.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep menu items concise and action-oriented so users can scan options quickly.',
      },
      {
        guidance: true,
        description:
          'Use sections and dividers to group related actions when the menu has many items.',
      },
      {
        guidance: true,
        description:
          'For a short, flat action set, use presentation="bottom-sheet" when product policy calls for a modal touch surface.',
      },
      {
        guidance: true,
        description:
          'Use presentation="adaptive" when the same short action set should remain anchored on pointer layouts and become a BottomSheet on compact coarse-pointer layouts.',
      },
      {
        guidance: true,
        description:
          'For a hierarchy that cannot fit as adjacent flyouts on a compact touch surface, a product may explicitly use a drill-in interaction with a Back action.',
      },
      {
        guidance: true,
        description:
          'Choose presentation explicitly in product code. A compact, coarse-pointer, hover-free media query is one useful policy, but DropdownMenu does not impose a universal device breakpoint.',
      },
      {
        guidance: true,
        description:
          'When the content is no longer a short list of immediate actions, reevaluate the interaction and choose a component that matches the actual task; content traits alone do not determine the component.',
      },
      {
        guidance: false,
        description:
          'Use a DropdownMenu for navigation; use a navigation component instead.',
      },
      {
        guidance: false,
        description:
          'Place more than 10–12 items in a single menu without grouping them into sections.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A dropdown menu that displays a list of actionable items in a popup triggered by a button. Use to present action options as a next step in a process, or to offer contextual actions without cluttering the interface.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep menu items concise and action-oriented so users can scan options quickly.',
      },
      {
        guidance: true,
        description:
          'Use sections and dividers to group related actions when the menu has many items.',
      },
      {
        guidance: true,
        description:
          'For a short, flat action set, use presentation="bottom-sheet" when product policy calls for a modal touch surface.',
      },
      {
        guidance: true,
        description:
          'Use presentation="adaptive" when the same short action set should remain anchored on pointer layouts and become a BottomSheet on compact coarse-pointer layouts.',
      },
      {
        guidance: true,
        description:
          'For a hierarchy that cannot fit as adjacent flyouts on a compact touch surface, a product may explicitly use a drill-in interaction with a Back action.',
      },
      {
        guidance: true,
        description:
          'Choose presentation explicitly in product code. A compact, coarse-pointer, hover-free media query is one useful policy, but DropdownMenu does not impose a universal device breakpoint.',
      },
      {
        guidance: true,
        description:
          'When the content is no longer a short list of immediate actions, reevaluate the interaction and choose a component that matches the actual task; content traits alone do not determine the component.',
      },
      {
        guidance: false,
        description:
          'Use a DropdownMenu for navigation; use a navigation component instead.',
      },
      {
        guidance: false,
        description:
          'Place more than 10–12 items in a single menu without grouping them into sections.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: 'dropdown menu for actionable items in popup',
  usage: {
    description:
      'A dropdown menu that displays a list of actionable items in a popup triggered by a button. Use to present action options as a next step in a process, or to offer contextual actions without cluttering the interface.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep menu items concise and action-oriented so users can scan options quickly.',
      },
      {
        guidance: true,
        description:
          'Use sections and dividers to group related actions when the menu has many items.',
      },
      {
        guidance: true,
        description:
          'For a short, flat action set, use presentation="bottom-sheet" when product policy calls for a modal touch surface.',
      },
      {
        guidance: true,
        description:
          'Use presentation="adaptive" when the same short action set should remain anchored on pointer layouts and become a BottomSheet on compact coarse-pointer layouts.',
      },
      {
        guidance: true,
        description:
          'For a hierarchy that cannot fit as adjacent flyouts on a compact touch surface, a product may explicitly use a drill-in interaction with a Back action.',
      },
      {
        guidance: true,
        description:
          'Choose presentation explicitly in product code. A compact, coarse-pointer, hover-free media query is one useful policy, but DropdownMenu does not impose a universal device breakpoint.',
      },
      {
        guidance: true,
        description:
          'When the content is no longer a short list of immediate actions, reevaluate the interaction and choose a component that matches the actual task; content traits alone do not determine the component.',
      },
      {
        guidance: false,
        description:
          'Use a DropdownMenu for navigation; use a navigation component instead.',
      },
      {
        guidance: false,
        description:
          'Place more than 10–12 items in a single menu without grouping them into sections.',
      },
    ],
  },
};
