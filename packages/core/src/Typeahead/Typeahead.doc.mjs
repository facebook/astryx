// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Typeahead',
  displayName: 'Typeahead',
  group: 'Typeahead',
  category: 'Data Input',
  keywords: ["typeahead","autocomplete","combobox","searchbox","autosuggest","select","dropdown","lookup","searchable","suggestion","picker"],
  description: 'Styled typeahead with label, description, validation, and all field features. Wraps XDSBaseTypeahead with XDSField for the primary use case.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the input.',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'XDSSearchSource<T>',
      description: 'Data source providing search and bootstrap methods for populating the dropdown.',
      required: true,
    },
    {
      name: 'value',
      type: 'T | null',
      description: 'Currently selected item, or null if nothing is selected.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(item: T | null) => void',
      description: 'Called when the selection changes.',
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Input placeholder text.',
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: 'Show bootstrap results on focus before typing.',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Show clear button to deselect the current value.',
      default: 'true',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the input.',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: 'Maximum number of dropdown items to display.',
      default: '10',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description: 'Validation status object with type and message for error/warning/success states.',
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description: 'Custom render function for dropdown items. Default renders XDSTypeaheadItem.',
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
      name: 'isRequired',
      type: 'boolean',
      description: 'Marks the field as required.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Shows an optional indicator on the label.',
      default: 'false',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text shown on the label.',
    },
    {
      name: 'emptySearchResultsText',
      type: 'string',
      description: 'Text shown when search returns no results.',
      default: "'No results found'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input on mount.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Input and token size.',
      default: "'md'",
    },
    {
      name: 'debounceMs',
      type: 'number',
      description: 'Debounce delay in ms before triggering search. Set to 0 for synchronous sources.',
      default: '150',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: 'Callback fired when the search query text changes.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Callback when the dropdown opens or closes.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'XDSBaseTypeahead'},
    {name: 'XDSTypeaheadItem'},
  ],
  theming: {
    targets: [
      {className: 'xds-typeahead', visualProps: ['status']},
      {className: 'xds-typeahead-dropdown'},
      {className: 'xds-typeahead-item'},
    ],
  },
  usage: {
    description:
      'A searchable input for selecting a single item from a large or dynamic dataset. Results appear as the user types, with support for async data sources, debounced search, and custom item rendering. Use it when the option list is too large for a Selector dropdown.',
    bestPractices: [
      {guidance: true, description: 'Provide descriptive placeholder text that hints at what users can search for.'},
      {guidance: true, description: 'Show suggestions on focus when users benefit from seeing popular or recent options before typing.'},
      {guidance: true, description: 'Add a search delay for remote data sources to avoid excessive network requests.'},
      {guidance: false, description: 'Use for short, static option lists; use Selector for better discoverability.'},
      {guidance: false, description: 'Use for multi-selection; use Tokenizer instead.'},
      {guidance: false, description: 'Place multiple Typeaheads adjacent to each other without clear labels differentiating them.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A searchable input for selecting a single item from a large or dynamic dataset. Results appear as the user types, with support for async data sources, debounced search, and custom item rendering. Use it when the option list is too large for a Selector dropdown.',
    bestPractices: [
      {guidance: true, description: 'Provide descriptive placeholder text that hints at what users can search for.'},
      {guidance: true, description: 'Show suggestions on focus when users benefit from seeing popular or recent options before typing.'},
      {guidance: true, description: 'Add a search delay for remote data sources to avoid excessive network requests.'},
      {guidance: false, description: 'Use for short, static option lists; use Selector for better discoverability.'},
      {guidance: false, description: 'Use for multi-selection; use Tokenizer instead.'},
      {guidance: false, description: 'Place multiple Typeaheads adjacent to each other without clear labels differentiating them.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Searchable dropdown for single-item selection w/ keyboard navigation. Supports async+sync search via searchSource interface.',
  usage: {
    description:
      'A searchable input for selecting a single item from a large or dynamic dataset. Results appear as the user types, with support for async data sources, debounced search, and custom item rendering. Use it when the option list is too large for a Selector dropdown.',
    bestPractices: [
      {guidance: true, description: 'Provide descriptive placeholder text that hints at what users can search for.'},
      {guidance: true, description: 'Show suggestions on focus when users benefit from seeing popular or recent options before typing.'},
      {guidance: true, description: 'Add a search delay for remote data sources to avoid excessive network requests.'},
      {guidance: false, description: 'Use for short, static option lists; use Selector for better discoverability.'},
      {guidance: false, description: 'Use for multi-selection; use Tokenizer instead.'},
      {guidance: false, description: 'Place multiple Typeaheads adjacent to each other without clear labels differentiating them.'},
    ],
  },
};
