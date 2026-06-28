// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TabList',
  displayName: 'Tab List',
  group: 'Tabs',
  category: 'Navigation',
  keywords: ["tabs","tabbar","tabstrip","navigation","tabpanel","tabgroup","segmented","navtabs","tab"],
  playground: {
    defaults: {
      value: 'tab-1',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-tab-list', visualProps: ['size']},
      {className: 'astryx-tab', states: ['selected']},
      {className: 'astryx-tab-indicator', states: ['selected']},
      {className: 'astryx-tab-menu'},
      {className: 'astryx-tab-menu-dropdown'},
      {className: 'astryx-tab-menu-item'},
    ],
  },
  description: 'Nav wrapper that provides TabListContext (value, onChange, size) to Tab and TabMenu children.',
  props: [
    {
      name: 'value',
      type: 'string',
      description: 'The currently selected tab value.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Callback fired when a tab is selected.',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant applied to all child tabs.',
      default: "'md'",
    },
    {
      name: 'layout',
      type: "'hug' | 'fill'",
      description: "Layout mode for tab sizing. 'hug': each tab hugs its content width. 'fill': tabs stretch equally to fill the container width.",
      default: "'hug'",
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: 'Whether to show a bottom border divider under the tab list.',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Tab and TabMenu items to render inside the nav.',
      slotElements: [
        {
          __element: 'Tab',
          props: {
            label: 'Tab',
            value: 'tab',
          },
        },
      ],
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'Tab'},
    {name: 'TabMenu'},
  ],
  usage: {
    description:
      'TabList provides tab-style navigation for organizing content into categorized sections. Use it to let users switch between related views without leaving the page, with overflow items handled by a built-in "more" menu.',
    bestPractices: [
      { guidance: true, description: 'Keep tab labels short and descriptive so users can quickly scan available sections.' },
      { guidance: true, description: 'Use TabMenu to group overflow items when horizontal space is limited rather than scrolling tabs off-screen.' },
      { guidance: true, description: 'When using hasDivider with action buttons alongside tabs, use a smaller button size (sm) so the actions don\u2019t overpower the tab row.' },
      { guidance: false, description: 'Use tabs for sequential steps or workflows; use a stepper or wizard pattern instead.' },
      { guidance: false, description: 'Place more than 6–8 visible tabs before the overflow menu; prioritize the most important categories.' },
      { guidance: false, description: 'Confuse TabList with SegmentedControl or ToggleButton. TabList is for navigation between views. SegmentedControl and ToggleButton are input controls: SegmentedControl always has exactly one selected option, while ToggleButton can be toggled on or off.' },
    ],
    anatomy: [
      {name: 'Left Content', required: false, description: 'Most important area; hugs content width.'},
      {name: 'Center-Fill Content', required: false, description: 'Stretches to fill available space.'},
      {name: 'Right Content', required: false, description: 'Hugs content width.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'TabList provides tab-style navigation for organizing content into categorized sections. Use it to let users switch between related views without leaving the page, with overflow items handled by a built-in "more" menu.',
    bestPractices: [
      { guidance: true, description: 'Keep tab labels short and descriptive so users can quickly scan available sections.' },
      { guidance: true, description: 'Use TabMenu to group overflow items when horizontal space is limited rather than scrolling tabs off-screen.' },
      { guidance: true, description: 'When using hasDivider with action buttons alongside tabs, use a smaller button size (sm) so the actions don\u2019t overpower the tab row.' },
      { guidance: false, description: 'Use tabs for sequential steps or workflows; use a stepper or wizard pattern instead.' },
      { guidance: false, description: 'Place more than 6–8 visible tabs before the overflow menu; prioritize the most important categories.' },
      { guidance: false, description: 'Confuse TabList with SegmentedControl or ToggleButton. TabList is for navigation between views. SegmentedControl and ToggleButton are input controls: SegmentedControl always has exactly one selected option, while ToggleButton can be toggled on or off.' },
    ],
    anatomy: [
      {name: 'Left Content', required: false, description: 'Most important area; hugs content width.'},
      {name: 'Center-Fill Content', required: false, description: 'Stretches to fill available space.'},
      {name: 'Right Content', required: false, description: 'Hugs content width.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Tab navigation w/ overflow menu support; semantic nav landmark w/ button or anchor tab items.',
  usage: {
    description:
      'TabList provides tab-style navigation for organizing content into categorized sections. Use it to let users switch between related views without leaving the page, with overflow items handled by a built-in "more" menu.',
    bestPractices: [
      { guidance: true, description: 'Keep tab labels short and descriptive so users can quickly scan available sections.' },
      { guidance: true, description: 'Use TabMenu to group overflow items when horizontal space is limited rather than scrolling tabs off-screen.' },
      { guidance: true, description: 'When using hasDivider with action buttons alongside tabs, use a smaller button size (sm) so the actions don\u2019t overpower the tab row.' },
      { guidance: false, description: 'Use tabs for sequential steps or workflows; use a stepper or wizard pattern instead.' },
      { guidance: false, description: 'Place more than 6–8 visible tabs before the overflow menu; prioritize the most important categories.' },
      { guidance: false, description: 'Confuse TabList with SegmentedControl or ToggleButton. TabList is for navigation between views. SegmentedControl and ToggleButton are input controls: SegmentedControl always has exactly one selected option, while ToggleButton can be toggled on or off.' },
    ],
    anatomy: [
      {name: 'Left Content', required: false, description: 'Most important area; hugs content width.'},
      {name: 'Center-Fill Content', required: false, description: 'Stretches to fill available space.'},
      {name: 'Right Content', required: false, description: 'Hugs content width.'},
    ],
  },
};