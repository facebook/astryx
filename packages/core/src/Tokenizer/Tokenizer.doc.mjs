/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Tokenizer',
  description:
    'Multi-select typeahead with token chips for selected items. Composes XDSBaseTypeahead for search and XDSToken for chips.',
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
      type: '(items: T[], change: XDSTokenizerChange<T>) => void',
      description:
        "Called when selection changes. The change argument includes the affected item and type ('add' | 'remove' | 'reorder').",
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
        'Custom render function for selected tokens. Default renders XDSToken with label and onRemove.',
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        'Custom render function for dropdown items. Default renders XDSTypeaheadItem.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the input and all token interactions.',
      default: 'false',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
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
      type: "'sm' | 'md'",
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
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: 'Callback fired when the search query text changes.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  examples: [
    {
      label: 'Basic multi-select',
      code: `const source = {
  search: query => users.filter(u => u.label.includes(query)),
  bootstrap: () => users.slice(0, 5),
};

<XDSTokenizer
  label="Team Members"
  searchSource={source}
  value={selected}
  onChange={(items, change) => {
    setSelected(items);
  }}
  placeholder="Search people..."
/>`,
    },
    {
      label: 'With max entries and clear all',
      code: `<XDSTokenizer
  label="Tags"
  searchSource={tagSource}
  value={tags}
  onChange={(items) => setTags(items)}
  maxEntries={5}
  hasClear
  placeholder="Add up to 5 tags..."
/>`,
    },
    {
      label: 'Custom token rendering',
      code: `<XDSTokenizer
  label="Tags"
  searchSource={tagSource}
  value={tags}
  onChange={(items) => setTags(items)}
  renderToken={(item, onRemove) => (
    <XDSToken
      label={item.label}
      color={item.auxiliaryData.color}
      onRemove={onRemove}
    />
  )}
  maxEntries={10}
/>`,
    },
  ],
  features: [
    'Token chips for each selected item with remove buttons',
    'Filtered search that automatically excludes already-selected items',
    'Max entries to limit number of selections — input hides when limit is reached',
    'Clear all button for bulk removal of all tokens',
    'Custom token and item rendering via renderToken and renderItem',
    'Backspace on empty input removes the last token',
    "Change metadata: onChange receives a second argument with type ('add' | 'remove' | 'reorder')",
  ],
  accessibility: [
    'Wrapped in XDSField for label, description, and status message association.',
    'Token container has role="group" with aria-label.',
    'Clear all button has aria-label="Clear all".',
    'Combobox pattern provided by XDSBaseTypeahead with aria-expanded and aria-autocomplete.',
  ],
  keyboard:
    'Backspace on empty input removes last token; Arrow keys navigate dropdown; Enter selects highlighted item; Escape closes dropdown',
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
