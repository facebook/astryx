// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CheckboxList',
  displayName: 'Checkbox List',
  group: 'Checkbox',
  category: 'Data Input',
  isHiddenFromOverview: true,
  keywords: ["checkboxlist","checkbox","checkboxgroup","multichoice","multiselect","checklist"],
  description: 'Checkbox group container with field integration for label, description, and status.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the checkbox group (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'CheckboxListItem elements.',
      slotElements: [
        {
          __element: 'CheckboxListItem',
          props: {
            label: 'Option',
            value: 'option',
          },
        },
      ],
      required: true,
    },
    {
      name: 'value',
      type: 'string[]',
      description: 'The currently selected values (collection mode).',
    },
    {
      name: 'onChange',
      type: '(values: string[]) => void',
      description: 'Callback fired when the selected values change.',
    },
    {
      name: 'changeAction',
      type: '(values: string[]) => void | Promise<void>',
      description:
        'Async action on change with optimistic updates. While the promise is pending, the toggled item shows a spinner inside its checkbox and is marked aria-busy.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Whether to visually hide the label.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed below the label.',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Spacing density for list items.',
      default: "'balanced'",
    },
    {
      name: 'hasDividers',
      type: 'boolean',
      description: 'Whether to show dividers between items.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether all checkbox items are disabled.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the group is disabled. Applies to the whole-group disabled state (isDisabled), not per item. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the checkboxes focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled CheckboxList in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: 'Status indicator ({ type, message }).',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
  components: [
    {name: 'CheckboxListItem'},
  ],
  usage: {
    description: 'CheckboxList shows a small group of checkboxes so users can turn several options on or off at once. Place it in settings pages, filter panels, or forms where every choice should be visible without scrolling. For a single standalone checkbox (like "I agree to the terms"), use CheckboxInput instead. If only one option can be picked, use RadioList. If the list is long enough to need searching or scrolling, use MultiSelector instead.',
    bestPractices: [
      { guidance: true, description: 'Keep the list short: three to seven options is the sweet spot. Beyond that, switch to MultiSelector which adds search and scrolling.' },
      { guidance: true, description: 'Turn on dividers (hasDividers) when items have helper text underneath; without them the labels and descriptions blur together.' },
      { guidance: true, description: 'Write a group label that says what the choices represent: "Export formats" tells users more than "Options".' },
      { guidance: false, description: 'Show a CheckboxList when the user can only pick one thing; that is what RadioList is for.' },
      { guidance: false, description: 'Put buttons or links inside the trailing slot (endContent); the whole row is already tappable, so a nested button creates two competing click targets.' },
      { guidance: false, description: 'Wrap a disabled CheckboxList in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.' },
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-checkbox-list'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: 'CheckboxList shows a small group of checkboxes so users can turn several options on or off at once. Place it in settings pages, filter panels, or forms where every choice should be visible without scrolling. For a single standalone checkbox (like "I agree to the terms"), use CheckboxInput instead. If only one option can be picked, use RadioList. If the list is long enough to need searching or scrolling, use MultiSelector instead.',
    bestPractices: [
      { guidance: true, description: 'Keep the list short: three to seven options is the sweet spot. Beyond that, switch to MultiSelector which adds search and scrolling.' },
      { guidance: true, description: 'Turn on dividers (hasDividers) when items have helper text underneath; without them the labels and descriptions blur together.' },
      { guidance: true, description: 'Write a group label that says what the choices represent: "Export formats" tells users more than "Options".' },
      { guidance: false, description: 'Show a CheckboxList when the user can only pick one thing; that is what RadioList is for.' },
      { guidance: false, description: 'Put buttons or links inside the trailing slot (endContent); the whole row is already tappable, so a nested button creates two competing click targets.' },
      { guidance: false, description: 'Wrap a disabled CheckboxList in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Checkbox group component for multi-value selection. Collection mode (parent state) + standalone mode (per-item state).',
  usage: {
    description: 'CheckboxList shows a small group of checkboxes so users can turn several options on or off at once. Place it in settings pages, filter panels, or forms where every choice should be visible without scrolling. For a single standalone checkbox (like "I agree to the terms"), use CheckboxInput instead. If only one option can be picked, use RadioList. If the list is long enough to need searching or scrolling, use MultiSelector instead.',
    bestPractices: [
      { guidance: true, description: 'Keep the list short: three to seven options is the sweet spot. Beyond that, switch to MultiSelector which adds search and scrolling.' },
      { guidance: true, description: 'Turn on dividers (hasDividers) when items have helper text underneath; without them the labels and descriptions blur together.' },
      { guidance: true, description: 'Write a group label that says what the choices represent: "Export formats" tells users more than "Options".' },
      { guidance: false, description: 'Show a CheckboxList when the user can only pick one thing; that is what RadioList is for.' },
      { guidance: false, description: 'Put buttons or links inside the trailing slot (endContent); the whole row is already tappable, so a nested button creates two competing click targets.' },
      { guidance: false, description: 'Wrap a disabled CheckboxList in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.' },
    ],
  },
};
