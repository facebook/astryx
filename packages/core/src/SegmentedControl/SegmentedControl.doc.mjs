// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SegmentedControl',
  displayName: 'Segmented Control',
  group: 'SegmentedControl',
  category: 'Action',
  keywords: ['radio', 'tabs', 'toggle', 'toggle-group', 'pill', 'button-group', 'switch', 'segment', 'control'],
  playground: {
    defaults: {
      value: 'option-1',
    },
  },
  theming: {
    targets: [
      {className: 'xds-segmented-control', visualProps: ['size']},
      {className: 'xds-segmented-control-item'},
    ],
    vars: [
      {name: '--_segmented-control-radius', description: 'Border radius of the segmented control', default: 'var(--radius-element)', private: true},
      {name: '--_segmented-control-padding', description: 'Inner padding of the segmented control', default: 'var(--spacing-0-5)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_segmented-control-radius']},
      {property: 'padding', vars: ['--_segmented-control-padding']},
    ],
  },
  description: 'Container wrapper providing context (value, onChange, size, isDisabled) to XDSSegmentedControlItem children.',
  props: [
    {
      name: 'value',
      type: 'string',
      description: 'The currently selected value (controlled).',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Callback fired when a segment is selected.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the radio group (used as aria-label, never rendered visually).',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant for the control.',
      default: "'md'",
    },
    {
      name: 'layout',
      type: "'hug' | 'fill'",
      description: 'Layout mode. hug (default) sizes segments to content; fill stretches them equally to fill the container.',
      default: "'hug'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the entire control is disabled.',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'XDSSegmentedControlItem children.',
      slotElements: [
        {
          __element: 'XDSSegmentedControlItem',
          props: {
            label: 'Option',
            value: 'option',
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
    {name: 'XDSSegmentedControlItem'},
  ],
  usage: {
    description:
      'A segmented button group that allows users to make a single selection from a small set of mutually exclusive options. Use SegmentedControl when all options should be visible at once and the selection controls a value or mode, not page navigation.',
    bestPractices: [
      {guidance: true, description: 'Use for switching between 2–5 mutually exclusive views or modes where all options should be visible.'},
      {guidance: true, description: 'Provide a descriptive label for the control to ensure the group is accessible to screen readers.'},
      {guidance: false, description: 'Use for page-level navigation; use XDSTabList instead. TabList is a navigation component, while SegmentedControl is an input that always has exactly one selected option.'},
      {guidance: false, description: 'Use for simple on/off states; use XDSToggleButton instead. ToggleButton can be toggled on or off independently, while SegmentedControl enforces a single selection from a group.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A segmented button group that allows users to make a single selection from a small set of mutually exclusive options. Use SegmentedControl when all options should be visible at once and the selection controls a value or mode, not page navigation.',
    bestPractices: [
      {guidance: true, description: 'Use for switching between 2–5 mutually exclusive views or modes where all options should be visible.'},
      {guidance: true, description: 'Provide a descriptive label for the control to ensure the group is accessible to screen readers.'},
      {guidance: false, description: 'Use for page-level navigation; use XDSTabList instead. TabList is a navigation component, while SegmentedControl is an input that always has exactly one selected option.'},
      {guidance: false, description: 'Use for simple on/off states; use XDSToggleButton instead. ToggleButton can be toggled on or off independently, while SegmentedControl enforces a single selection from a group.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'A segmented button group that allows users to make a single selection from a small set of mutually exclusive options. Use SegmentedControl when all options should be visible at once and the selection controls a value or mode, not page navigation.',
    bestPractices: [
      {guidance: true, description: 'Use for switching between 2–5 mutually exclusive views or modes where all options should be visible.'},
      {guidance: true, description: 'Provide a descriptive label for the control to ensure the group is accessible to screen readers.'},
      {guidance: false, description: 'Use for page-level navigation; use XDSTabList instead. TabList is a navigation component, while SegmentedControl is an input that always has exactly one selected option.'},
      {guidance: false, description: 'Use for simple on/off states; use XDSToggleButton instead. ToggleButton can be toggled on or off independently, while SegmentedControl enforces a single selection from a group.'},
    ],
  },
  propDescriptions: {
    value: 'currently selected value (controlled)',
    onChange: 'callback on segment selection',
    label: 'aria-label for radio group (never rendered)',
    size: 'size variant',
    layout: 'hug (default) sizes to content; fill stretches equally',
    isDisabled: 'disables entire control',
    children: 'XDSSegmentedControlItem children',
    xstyle: 'additional StyleX styles for container',
  },
};
