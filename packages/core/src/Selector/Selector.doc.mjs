// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Selector',
  displayName: 'Selector',
  group: 'Selector',
  category: 'Data Input',
  keywords: [
    'selector',
    'select',
    'dropdown',
    'combobox',
    'picker',
    'listbox',
    'chooser',
    'autocomplete',
    'option',
    'selectmenu',
  ],
  theming: {
    targets: [
      {
        className: 'astryx-selector',
        visualProps: ['variant', 'size', 'status'],
        states: ['disabled'],
      },
      {className: 'astryx-selector-option'},
      {
        className: 'astryx-selector-option-row',
        visualProps: ['size'],
        states: ['selected', 'disabled'],
      },
      {className: 'astryx-selector-search'},
      {className: 'astryx-selector-section-heading'},
      {className: 'astryx-selector-empty-state'},
      {
        className: 'astryx-selector-clear-icon',
        deprecatedFor: 'input-clear-icon',
      },
      {className: 'astryx-selector-indicator-icon', states: ['state']},
      {className: 'astryx-selector-check'},
      {className: 'astryx-selector-popup'},
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
      type: 'SelectorOption[]',
      description:
        'Array of items: strings, objects with value/label/description/icon/disabled, dividers ({type: "divider"}), or sections ({type: "section", title, items}).',
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
      description:
        'Shows a clear (×) button when a value is selected. When true, onChange also accepts null to signal the user cleared the selection.',
      default: 'false',
    },
    {
      name: 'hasSearch',
      type: 'boolean',
      description:
        'Whether to show a search input for filtering options. As the user types, the match count (or "No results found") is announced to screen readers via a polite live region. The search field has built-in affordances: a leading magnifier icon and, once a query is typed, a trailing clear (✕) button that resets the query and returns focus to the input.',
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
      name: 'variant',
      type: "'input' | 'ghost'",
      description:
        'Visual trigger style. input is the bordered input treatment for forms; ghost is borderless and matches ghost buttons for toolbar usage.',
      default: "'input'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the selector.',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'The HTML name attribute for form submissions. Renders a hidden input carrying the selected value, like a native select.',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the selector is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the trigger focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Selector in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hides the label while keeping it accessible.',
      default: 'false',
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
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Marks the field as required.',
      default: 'false',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description: 'Validation status with an optional message.',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        'How the status message is placed relative to the input. attached overlaps directly below the bordered input and is only valid for the input variant; ghost selectors detach attached status messages by default. Use tooltip for compact toolbar controls.',
      default: "'attached' for input selectors; 'detached' for ghost selectors",
    },
    {
      name: 'renderOption',
      type: '(option: SelectorOptionData) => ReactNode',
      description:
        'Custom render function for each selectable option in the dropdown. Use this instead of JSX children; dividers and sections are rendered by the selector.',
    },
    {
      name: 'renderValue',
      type: '(option: SelectorOptionData) => ReactNode',
      description:
        'Custom render function for the selected option inside the closed trigger. The trigger is sized by padding, so it is the size token for a one-line value (28/32/36) and exactly one text line taller for a two-line one (48/52/56) — always on the 4px rhythm, always aligned with the buttons and inputs beside it. Inside an InputGroup the group owns the row height: a SelectorOption folds onto one line and ellipsizes, and any taller node is cut off at the row.',
    },
    {
      name: 'indicatorPosition',
      type: "'start' | 'end'",
      description:
        'Which edge of the option row carries the selected mark. start reserves a mark column ahead of every label so they stay aligned, the way a native menu does; end is the house convention shared with Typeahead and CommandPalette.',
      default: "'end'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  components: [{name: 'SelectorOption'}],
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options. Keyboard typeahead matches a native select: typing on the focused closed trigger selects the matching option directly, repeated presses cycle through options sharing a first letter, and spaces count as match characters ("new y" reaches "New York"). With the menu open, typing moves the highlight and Enter commits. With hasSearch, typing on the closed trigger opens the popup and seeds the search input.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a visible label so users understand what they are selecting.',
      },
      {
        guidance: true,
        description:
          'Use sections and dividers to organize options when the list exceeds ~8 items.',
      },
      {
        guidance: true,
        description:
          'Use renderOption for custom option rows. Do not pass SelectorOption directly as JSX children.',
      },
      {
        guidance: true,
        description:
          'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").',
      },
      {
        guidance: true,
        description:
          'Use inside InputGroup only when the selector needs a short prefix or suffix addon as part of one decorated input surface.',
      },
      {
        guidance: true,
        description:
          'Use variant="ghost" when a selector sits in a toolbar with ghost buttons. If validation status is needed there, prefer statusVariant="tooltip" so the toolbar height stays compact.',
      },
      {
        guidance: false,
        description:
          'Use for action menus; use Dropdown Menu for triggering commands or navigation.',
      },
      {
        guidance: false,
        description:
          'Use when there are only two options; use a SegmentedControl or radio buttons instead.',
      },
      {
        guidance: false,
        description:
          'Use Selector for navigation; links should be links, not dropdown options.',
      },
      {
        guidance: false,
        description:
          'Use for yes/no or on/off choices; use Switch or CheckboxInput instead.',
      },
      {
        guidance: false,
        description:
          'Put more than ~20 options without sections; consider Typeahead for large lists.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled Selector in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: false,
        description: 'Text label displayed above the selector.',
      },
      {
        name: 'Placeholder',
        required: false,
        description: 'Hint text shown when no value is selected.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Helper text providing additional context.',
      },
      {
        name: 'Left Icon',
        required: false,
        description: 'Icon displayed to the left of the selected value.',
      },
      {
        name: 'Value',
        required: true,
        description: 'The currently selected item displayed in the selector.',
      },
      {
        name: 'List',
        required: true,
        description: 'The dropdown list of selectable options.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options. Keyboard typeahead matches a native select: typing on the focused closed trigger selects the matching option directly, repeated presses cycle through options sharing a first letter, and spaces count as match characters ("new y" reaches "New York"). With the menu open, typing moves the highlight and Enter commits. With hasSearch, typing on the closed trigger opens the popup and seeds the search input.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a visible label so users understand what they are selecting.',
      },
      {
        guidance: true,
        description:
          'Use sections and dividers to organize options when the list exceeds ~8 items.',
      },
      {
        guidance: true,
        description:
          'Use renderOption for custom option rows. Do not pass SelectorOption directly as JSX children.',
      },
      {
        guidance: true,
        description:
          'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").',
      },
      {
        guidance: false,
        description:
          'Use for action menus; use Dropdown Menu for triggering commands or navigation.',
      },
      {
        guidance: false,
        description:
          'Use when there are only two options; use a SegmentedControl or radio buttons instead.',
      },
      {
        guidance: false,
        description:
          'Use Selector for navigation; links should be links, not dropdown options.',
      },
      {
        guidance: false,
        description:
          'Use for yes/no or on/off choices; use Switch or CheckboxInput instead.',
      },
      {
        guidance: false,
        description:
          'Put more than ~20 options without sections; consider Typeahead for large lists.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled Selector in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: false,
        description: 'Text label displayed above the selector.',
      },
      {
        name: 'Placeholder',
        required: false,
        description: 'Hint text shown when no value is selected.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Helper text providing additional context.',
      },
      {
        name: 'Left Icon',
        required: false,
        description: 'Icon displayed to the left of the selected value.',
      },
      {
        name: 'Value',
        required: true,
        description: 'The currently selected item displayed in the selector.',
      },
      {
        name: 'List',
        required: true,
        description: 'The dropdown list of selectable options.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options. Keyboard typeahead matches a native select: typing on the focused closed trigger selects the matching option directly, repeated presses cycle through options sharing a first letter, and spaces count as match characters ("new y" reaches "New York"). With the menu open, typing moves the highlight and Enter commits. With hasSearch, typing on the closed trigger opens the popup and seeds the search input.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a visible label so users understand what they are selecting.',
      },
      {
        guidance: true,
        description:
          'Use sections and dividers to organize options when the list exceeds ~8 items.',
      },
      {
        guidance: true,
        description:
          'renderOption for custom rows; do not pass SelectorOption as JSX children.',
      },
      {
        guidance: true,
        description:
          'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").',
      },
      {
        guidance: true,
        description:
          'Use inside InputGroup only when the selector needs a short prefix or suffix addon.',
      },
      {
        guidance: true,
        description:
          'Use variant="ghost" in toolbars with ghost buttons; prefer statusVariant="tooltip" for compact validation status.',
      },
      {
        guidance: false,
        description:
          'Use for action menus; use Dropdown Menu for triggering commands or navigation.',
      },
      {
        guidance: false,
        description:
          'Use when there are only two options; use a SegmentedControl or radio buttons instead.',
      },
      {
        guidance: false,
        description:
          'Use Selector for navigation; links should be links, not dropdown options.',
      },
      {
        guidance: false,
        description:
          'Use for yes/no or on/off choices; use Switch or CheckboxInput instead.',
      },
      {
        guidance: false,
        description:
          'Put more than ~20 options without sections; consider Typeahead for large lists.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled Selector in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: false,
        description: 'Text label displayed above the selector.',
      },
      {
        name: 'Placeholder',
        required: false,
        description: 'Hint text shown when no value is selected.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Helper text providing additional context.',
      },
      {
        name: 'Left Icon',
        required: false,
        description: 'Icon displayed to the left of the selected value.',
      },
      {
        name: 'Value',
        required: true,
        description: 'The currently selected item displayed in the selector.',
      },
      {
        name: 'List',
        required: true,
        description: 'The dropdown list of selectable options.',
      },
    ],
  },
};
