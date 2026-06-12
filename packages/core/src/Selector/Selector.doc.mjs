// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Selector',
  displayName: 'Selector',
  group: 'Selector',
  category: 'Data Input',
  keywords: ["selector","select","dropdown","combobox","picker","listbox","chooser","autocomplete","option","selectmenu"],
  theming: {
    targets: [
      {className: 'xds-selector', visualProps: ['size', 'status']},
      {className: 'xds-selector-option'},
    ],
  },
  description: 'Dropdown selector for choosing from a list of options.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text for accessibility.',
      required: true,
    },
    {
      name: 'options',
      type: 'XDSSelectorOption[]',
      description: 'Array of items — strings, objects with value/label/icon/disabled, dividers ({type: "divider"}), or sections ({type: "section", title, items}).',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: 'Currently selected value.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Callback fired when the selection changes.',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Shows a clear (×) button when a value is selected. When true, onChange also accepts null to signal the user cleared the selection.',
      default: 'false',
    },
    {
      name: 'hasSearch',
      type: 'boolean',
      description: 'Whether to show a search input for filtering options.',
      default: 'false',
    },
    {
      name: 'searchPlaceholder',
      type: 'string',
      description: 'Placeholder text for the search input.',
      default: "'Search...'",
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when no value is selected.',
      default: "'Select...'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant for the selector.',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the selector.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hides the label while keeping it accessible.',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Helper text displayed below the label.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Marks the field as optional.',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Marks the field as required.',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description: 'Validation status with an optional message.',
    },
    {
      name: 'children',
      type: '(item: XDSSelectorOptionData) => ReactNode',
      description: 'Custom render function for each item in the dropdown.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'XDSSelectorOption'},
  ],
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options.',
    bestPractices: [
      {guidance: true, description: 'Provide a visible label so users understand what they are selecting.'},
      {guidance: true, description: 'Use sections and dividers to organize options when the list exceeds ~8 items.'},
      {guidance: true, description: 'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").'},
      {guidance: false, description: 'Use for action menus; use Dropdown Menu for triggering commands or navigation.'},
      {guidance: false, description: 'Use when there are only two options; use a SegmentedControl or radio buttons instead.'},
      {guidance: false, description: 'Use Selector for navigation; links should be links, not dropdown options.'},
      {guidance: false, description: 'Use for yes/no or on/off choices; use Switch or CheckboxInput instead.'},
      {guidance: false, description: 'Put more than ~20 options without sections; consider Typeahead for large lists.'},
    ],
    anatomy: [
      {name: 'Label', required: false, description: 'Text label displayed above the selector.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when no value is selected.'},
      {name: 'Description', required: false, description: 'Helper text providing additional context.'},
      {name: 'Left Icon', required: false, description: 'Icon displayed to the left of the selected value.'},
      {name: 'Value', required: true, description: 'The currently selected item displayed in the selector.'},
      {name: 'List', required: true, description: 'The dropdown list of selectable options.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options.',
    bestPractices: [
      {guidance: true, description: 'Provide a visible label so users understand what they are selecting.'},
      {guidance: true, description: 'Use sections and dividers to organize options when the list exceeds ~8 items.'},
      {guidance: true, description: 'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").'},
      {guidance: false, description: 'Use for action menus; use Dropdown Menu for triggering commands or navigation.'},
      {guidance: false, description: 'Use when there are only two options; use a SegmentedControl or radio buttons instead.'},
      {guidance: false, description: 'Use Selector for navigation; links should be links, not dropdown options.'},
      {guidance: false, description: 'Use for yes/no or on/off choices; use Switch or CheckboxInput instead.'},
      {guidance: false, description: 'Put more than ~20 options without sections; consider Typeahead for large lists.'},
    ],
    anatomy: [
      {name: 'Label', required: false, description: 'Text label displayed above the selector.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when no value is selected.'},
      {name: 'Description', required: false, description: 'Helper text providing additional context.'},
      {name: 'Left Icon', required: false, description: 'Icon displayed to the left of the selected value.'},
      {name: 'Value', required: true, description: 'The currently selected item displayed in the selector.'},
      {name: 'List', required: true, description: 'The dropdown list of selectable options.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options.',
    bestPractices: [
      {guidance: true, description: 'Provide a visible label so users understand what they are selecting.'},
      {guidance: true, description: 'Use sections and dividers to organize options when the list exceeds ~8 items.'},
      {guidance: true, description: 'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").'},
      {guidance: false, description: 'Use for action menus; use Dropdown Menu for triggering commands or navigation.'},
      {guidance: false, description: 'Use when there are only two options; use a SegmentedControl or radio buttons instead.'},
      {guidance: false, description: 'Use Selector for navigation; links should be links, not dropdown options.'},
      {guidance: false, description: 'Use for yes/no or on/off choices; use Switch or CheckboxInput instead.'},
      {guidance: false, description: 'Put more than ~20 options without sections; consider Typeahead for large lists.'},
    ],
    anatomy: [
      {name: 'Label', required: false, description: 'Text label displayed above the selector.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when no value is selected.'},
      {name: 'Description', required: false, description: 'Helper text providing additional context.'},
      {name: 'Left Icon', required: false, description: 'Icon displayed to the left of the selected value.'},
      {name: 'Value', required: true, description: 'The currently selected item displayed in the selector.'},
      {name: 'List', required: true, description: 'The dropdown list of selectable options.'},
    ],
  },
};
