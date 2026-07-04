// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Tokenizer',
  displayName: 'Tokenizer',
  category: 'Data Input',
  keywords: ["tokenizer","multiselect","multi-select","chips","tags","combobox","autocomplete","taginput","chipinput"],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the input.',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
      description:
        'Data source providing search and bootstrap methods for populating the dropdown.',
      required: true,
    },
    {
      name: 'value',
      type: 'T[]',
      description: 'Array of currently selected items.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(items: T[], change: TokenizerChange<T>) => void',
      description:
        "Called when selection changes. The change argument includes the affected item and type ('add' | 'create' | 'remove' | 'reorder').",
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Input placeholder text. Only shown when no tokens are selected.',
    },
    {
      name: 'maxEntries',
      type: 'number',
      description:
        'Maximum number of selections allowed. Input is hidden when the limit is reached.',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Show a clear-all button for bulk removal of all tokens.',
      default: 'false',
    },
    {
      name: 'renderToken',
      type: '(item: T, onRemove: () => void) => ReactNode',
      description:
        'Custom render function for selected tokens. Default renders Token with label and onRemove.',
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        'Custom render function for dropdown items. Default renders TypeaheadItem.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the input and all token interactions.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the tokenizer is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled Tokenizer in Tooltip — disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'status',
      type: 'InputStatus',
      description:
        'Validation status object with type and message for error/warning/success states.',
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
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: 'Show bootstrap results on focus before typing.',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: 'Maximum number of dropdown items to display.',
      default: '10',
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
      description:
        'Debounce delay in ms before triggering search. Set to 0 for synchronous sources.',
      default: '150',
    },
    {
      name: 'hasCreate',
      type: 'boolean',
      description:
        "Allow users to create new tokens from free-text input. When true, a \"Create\" option appears in the dropdown for typed text that doesn't match existing results. The onChange change type is 'create' for these items.",
      default: 'false',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: 'Callback fired when the search query text changes.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to display at the end of the input row. Useful for buttons, result counts, or other controls.',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'handleRef',
      type: 'React.Ref<TokenizerHandle>',
      description: 'Imperative handle for focus() and blur() control.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value; not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-tokenizer', visualProps: ['size']},
    ],
  },
  usage: {
    description:
      'Tokenizer is a multi-select input that lets users search, select, and manage multiple items displayed as removable chips. Use it when users need to build a set of selections from a searchable data source, like adding team members, applying tags, or choosing filters.',
    bestPractices: [
      {guidance: true, description: 'Write a placeholder that tells users what they can search for, such as "Search people..." or "Add tags...", so the input is not a blank mystery.'},
      {guidance: true, description: 'Set maxEntries when the number of selections should be bounded, like limiting a review to 5 approvers.'},
      {guidance: true, description: 'Use hasCreate for free-form tagging where users need to enter values that do not exist in the search source.'},
      {guidance: true, description: 'Show validation status with the status prop so users know immediately when a selection is missing or invalid.'},
      {guidance: false, description: 'Don\'t use Tokenizer for single-item selection; use Typeahead instead. Tokenizer is for building sets of two or more items.'},
      {guidance: false, description: 'Avoid applying custom colors to individual tokens inside a Tokenizer; use the default token style for visual consistency across the set.'},
      {guidance: false, description: 'Don\'t hide the label; every Tokenizer needs a visible label so users understand what they are selecting. Use isLabelHidden only when surrounding context makes the purpose obvious.'},
      {guidance: false, description: 'Wrap a disabled Tokenizer in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.'},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'The visible text above the input describing what the user is selecting. Also used as the accessible name.'},
      {name: 'Token chips', required: false, description: 'Removable chips representing each selected item. Each chip shows a label and a remove button.'},
      {name: 'Search input', required: true, description: 'The text input where users type to search the data source. Hides when maxEntries is reached.'},
      {name: 'Dropdown menu', required: false, description: 'The search results list that appears below the input as the user types.'},
      {name: 'End content', required: false, description: 'A trailing slot after the input for action buttons, counts, or other controls.'},
      {name: 'Clear button', required: false, description: 'A button that removes all selected tokens at once. Shown when hasClear is true and tokens are present.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Tokenizer',
  displayName: 'Tokenizer',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '\u8f93\u5165\u6846\u7684\u65e0\u969c\u788d\u6807\u7b7e\u3002',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
      description:
        '\u63d0\u4f9b\u641c\u7d22\u548c\u5f15\u5bfc\u65b9\u6cd5\u7684\u6570\u636e\u6e90\uff0c\u7528\u4e8e\u586b\u5145\u4e0b\u62c9\u5217\u8868\u3002',
      required: true,
    },
    {
      name: 'value',
      type: 'T[]',
      description: '\u5f53\u524d\u5df2\u9009\u9879\u76ee\u7684\u6570\u7ec4\u3002',
      required: true,
    },
    {
      name: 'onChange',
      type: '(items: T[], change: TokenizerChange<T>) => void',
      description:
        "\u9009\u62e9\u53d8\u66f4\u65f6\u8c03\u7528\u3002change \u53c2\u6570\u5305\u542b\u53d7\u5f71\u54cd\u7684\u9879\u76ee\u548c\u7c7b\u578b\uff08'add' | 'create' | 'remove' | 'reorder'\uff09\u3002",
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '\u8f93\u5165\u6846\u5360\u4f4d\u6587\u672c\u3002\u4ec5\u5728\u672a\u9009\u62e9\u4efb\u4f55\u6807\u8bb0\u65f6\u663e\u793a\u3002',
    },
    {
      name: 'maxEntries',
      type: 'number',
      description:
        '\u5141\u8bb8\u7684\u6700\u5927\u9009\u62e9\u6570\u91cf\u3002\u8fbe\u5230\u9650\u5236\u65f6\u8f93\u5165\u6846\u4f1a\u9690\u85cf\u3002',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '\u663e\u793a\u5168\u90e8\u6e05\u9664\u6309\u94ae\uff0c\u7528\u4e8e\u6279\u91cf\u79fb\u9664\u6240\u6709\u6807\u8bb0\u3002',
      default: 'false',
    },
    {
      name: 'renderToken',
      type: '(item: T, onRemove: () => void) => ReactNode',
      description:
        '\u5df2\u9009\u6807\u8bb0\u7684\u81ea\u5b9a\u4e49\u6e32\u67d3\u51fd\u6570\u3002\u9ed8\u8ba4\u6e32\u67d3\u5e26\u6709 label \u548c onRemove \u7684 Token\u3002',
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        '\u4e0b\u62c9\u5217\u8868\u9879\u7684\u81ea\u5b9a\u4e49\u6e32\u67d3\u51fd\u6570\u3002\u9ed8\u8ba4\u6e32\u67d3 TypeaheadItem\u3002',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '\u7981\u7528\u8f93\u5165\u6846\u548c\u6240\u6709\u6807\u8bb0\u4ea4\u4e92\u3002',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the tokenizer is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled Tokenizer in Tooltip — disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'status',
      type: 'InputStatus',
      description:
        '\u9a8c\u8bc1\u72b6\u6001\u5bf9\u8c61\uff0c\u5305\u542b\u7c7b\u578b\u548c\u6d88\u606f\uff0c\u7528\u4e8e\u9519\u8bef/\u8b66\u544a/\u6210\u529f\u72b6\u6001\u3002',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '\u89c6\u89c9\u9690\u85cf\u6807\u7b7e\uff0c\u540c\u65f6\u4fdd\u6301\u5176\u53ef\u8bbf\u95ee\u6027\u3002',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '\u663e\u793a\u5728\u6807\u7b7e\u4e0b\u65b9\u7684\u8f85\u52a9\u6587\u672c\u3002',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '\u5c06\u5b57\u6bb5\u6807\u8bb0\u4e3a\u5fc5\u586b\u3002',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '\u5728\u6807\u7b7e\u4e0a\u663e\u793a\u53ef\u9009\u6307\u793a\u5668\u3002',
      default: 'false',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '\u6807\u7b7e\u4e0a\u663e\u793a\u7684\u5de5\u5177\u63d0\u793a\u6587\u672c\u3002',
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: '\u805a\u7126\u65f6\u5728\u8f93\u5165\u524d\u663e\u793a\u5f15\u5bfc\u7ed3\u679c\u3002',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: '\u4e0b\u62c9\u5217\u8868\u663e\u793a\u7684\u6700\u5927\u9879\u76ee\u6570\u3002',
      default: '10',
    },
    {
      name: 'emptySearchResultsText',
      type: 'string',
      description: '\u641c\u7d22\u65e0\u7ed3\u679c\u65f6\u663e\u793a\u7684\u6587\u672c\u3002',
      default: "'No results found'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '\u6302\u8f7d\u65f6\u81ea\u52a8\u805a\u7126\u8f93\u5165\u6846\u3002',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '\u8f93\u5165\u6846\u548c\u6807\u8bb0\u7684\u5c3a\u5bf8\u3002',
      default: "'md'",
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        '\u89e6\u53d1\u641c\u7d22\u524d\u7684\u9632\u6296\u5ef6\u8fdf\uff08\u6beb\u79d2\uff09\u3002\u540c\u6b65\u6570\u636e\u6e90\u8bbe\u7f6e\u4e3a 0\u3002',
      default: '150',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: '\u641c\u7d22\u67e5\u8be2\u6587\u672c\u53d8\u66f4\u65f6\u89e6\u53d1\u7684\u56de\u8c03\u3002',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '\u5728\u8f93\u5165\u884c\u672b\u5c3e\u663e\u793a\u7684\u5185\u5bb9\u3002\u9002\u7528\u4e8e\u6309\u94ae\u3001\u7ed3\u679c\u8ba1\u6570\u6216\u5176\u4ed6\u63a7\u4ef6\u3002',
    },
    {
      name: 'handleRef',
      type: 'React.Ref<TokenizerHandle>',
      description: '用于 focus() 和 blur() 控制的命令式句柄。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '\u7528\u4e8e\u5e03\u5c40\u81ea\u5b9a\u4e49\u7684 StyleX \u6837\u5f0f\uff08\u5916\u8fb9\u8ddd\u3001\u5b9a\u4f4d\u3001\u5c3a\u5bf8\uff09\u3002\u5fc5\u987b\u662f stylex.create() \u7684\u503c; \u4e0d\u80fd\u662f\u5185\u8054\u6837\u5f0f\u5bf9\u8c61\u5982 style={{}}\u3002',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-tokenizer', visualProps: ['size']},
    ],
  },
  usage: {
    description:
      'Tokenizer is a multi-select input that lets users search, select, and manage multiple items displayed as removable chips. Use it when users need to build a set of selections from a searchable data source, like adding team members, applying tags, or choosing filters.',
    bestPractices: [
      {guidance: true, description: 'Write a placeholder that tells users what they can search for, such as "Search people..." or "Add tags...", so the input is not a blank mystery.'},
      {guidance: true, description: 'Set maxEntries when the number of selections should be bounded, like limiting a review to 5 approvers.'},
      {guidance: true, description: 'Use hasCreate for free-form tagging where users need to enter values that do not exist in the search source.'},
      {guidance: true, description: 'Show validation status with the status prop so users know immediately when a selection is missing or invalid.'},
      {guidance: false, description: 'Don\'t use Tokenizer for single-item selection; use Typeahead instead. Tokenizer is for building sets of two or more items.'},
      {guidance: false, description: 'Avoid applying custom colors to individual tokens inside a Tokenizer; use the default token style for visual consistency across the set.'},
      {guidance: false, description: 'Don\'t hide the label; every Tokenizer needs a visible label so users understand what they are selecting. Use isLabelHidden only when surrounding context makes the purpose obvious.'},
      {guidance: false, description: 'Wrap a disabled Tokenizer in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.'},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'The visible text above the input describing what the user is selecting. Also used as the accessible name.'},
      {name: 'Token chips', required: false, description: 'Removable chips representing each selected item. Each chip shows a label and a remove button.'},
      {name: 'Search input', required: true, description: 'The text input where users type to search the data source. Hides when maxEntries is reached.'},
      {name: 'Dropdown menu', required: false, description: 'The search results list that appears below the input as the user types.'},
      {name: 'End content', required: false, description: 'A trailing slot after the input for action buttons, counts, or other controls.'},
      {name: 'Clear button', required: false, description: 'A button that removes all selected tokens at once. Shown when hasClear is true and tokens are present.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Multi-select typeahead w/ token chips for selected items. Composes BaseTypeahead for search+Token for chips.',
  usage: {
    description:
      'Multi-select input for searching and selecting multiple items as removable chips. Use for team members, tags, filters, or any set built from a searchable source.',
    bestPractices: [
      {guidance: true, description: 'Placeholder that communicates what to search, such as "Search people..." rather than blank.'},
      {guidance: true, description: 'maxEntries when selections are bounded (e.g. 5 approvers max).'},
      {guidance: true, description: 'hasCreate for free-form tagging with values not in the source.'},
      {guidance: true, description: 'status prop for immediate validation feedback.'},
      {guidance: false, description: 'Don\'t use for single-item selection; use Typeahead instead.'},
      {guidance: false, description: 'Avoid custom token colors; default style for consistency.'},
      {guidance: false, description: 'Don\'t hide the label unless context makes purpose obvious.'},
      {guidance: false, description: 'Wrap a disabled Tokenizer in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.'},
    ],
  },
  propDescriptions: {
    label: 'Accessible label for input.',
    searchSource: 'Data source w/ search+bootstrap methods for populating dropdown.',
    value: 'Array of currently selected items.',
    onChange: "Fired on selection change. Change arg includes affected item+type ('add'|'create'|'remove'|'reorder').",
    hasCreate: 'Enable free-text token creation. Shows "Create" dropdown option for unmatched typed text.',
    placeholder: 'Input placeholder. Only shown when no tokens selected.',
    maxEntries: 'Max selections allowed. Input hidden at limit.',
    hasClear: 'Clear-all button for bulk removal.',
    renderToken: 'Custom token render. Default renders Token w/ label+onRemove.',
    renderItem: 'Custom dropdown item render. Default renders TypeaheadItem.',
    isDisabled: 'Disables input+all token interactions.',
    status: 'Validation status w/ type+message for error/warning/success.',
    isLabelHidden: 'Visually hides label; keeps a11y.',
    description: 'Helper text below label.',
    isRequired: 'Marks field required.',
    isOptional: 'Shows optional indicator on label.',
    labelTooltip: 'Tooltip on label.',
    hasEntriesOnFocus: 'Show bootstrap results on focus before typing.',
    maxMenuItems: 'Max dropdown items to display.',
    emptySearchResultsText: 'Text when search returns no results.',
    hasAutoFocus: 'Auto-focus input on mount.',
    size: 'Input+token size.',
    debounceMs: 'Search debounce delay ms. 0 for sync sources.',
    onChangeQuery: 'Fired on search query text change.',
    endContent: 'Content at input row end. For buttons, counts, controls.',
    handleRef: 'Imperative handle for focus() and blur() control.',
    xstyle: 'StyleX layout styles (margins, positioning). Must be stylex.create() value.',
  },
};
