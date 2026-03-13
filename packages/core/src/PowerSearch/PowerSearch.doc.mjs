/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'PowerSearch',
  description:
    'Structured filter bar where each token represents a filter (field + operator + value). Users select fields from a typeahead dropdown, configure operators and values in an edit popover, and manage filters as removable tokens.',
  props: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description:
        'Configuration defining available fields, operators, and their value types.',
      required: true,
    },
    {
      name: 'filters',
      type: 'ReadonlyArray<PowerSearchFilter>',
      description: 'Currently active filters.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(filters: ReadonlyArray<PowerSearchFilter>, changeType: PowerSearchChangeType, index: number) => void',
      description:
        "Called when filters change. changeType is 'add', 'edit', or 'remove'. index is the affected filter's position.",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the search input.',
      default: "'Search'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hides the label while keeping it accessible.',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Placeholder text shown when no filters are selected.',
      default: "'Search...'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input on mount.',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Show a clear-all button for removing all filters.',
      default: 'true',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: 'Prevent adding, editing, or removing filters.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the entire component.',
      default: 'false',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Validation status object with type and optional message.',
    },
    {
      name: 'maxTokenLength',
      type: 'number',
      description: 'Max character length for filter value display in tokens.',
      default: '40',
    },
    {
      name: 'popoverSaveButtonLabel',
      type: 'string',
      description: 'Label for the save button in the edit popover.',
      default: "'Apply'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description: 'Timezone ID for date formatting (e.g. "America/New_York").',
    },
    {
      name: 'ref',
      type: 'Ref<XDSPowerSearchHandle>',
      description:
        'Imperative handle with focusTypeahead() and blurTypeahead() methods.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to display at the end of the input row. Useful for action buttons or other controls.',
    },
    {
      name: 'resultCount',
      type: 'number | string',
      description:
        'Number of results matching the current filters. When a number, formatted as "N results". When a string, displayed as-is.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
  examples: [
    {
      label: 'Basic usage with enum filters',
      code: `const config = {
  name: 'TaskSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ],
          },
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      operators: [
        {
          key: 'contains',
          label: 'contains',
          value: { type: 'string' },
        },
      ],
    },
  ],
};

const [filters, setFilters] = useState([]);
<XDSPowerSearch
  config={config}
  filters={filters}
  onChange={(newFilters) => setFilters(newFilters)}
/>`,
    },
    {
      label: 'With initial filters',
      code: `const [filters, setFilters] = useState([
  { field: 'status', operator: 'is', value: { type: 'enum', value: 'open' } },
]);

<XDSPowerSearch
  config={config}
  filters={filters}
  onChange={(newFilters, changeType, index) => {
    setFilters(newFilters);
    console.log(changeType, 'at index', index);
  }}
  placeholder="Add filters..."
/>`,
    },
  ],
  features: [
    'Typeahead field selection with search and aliases',
    'Edit popover with field, operator, and value selectors',
    'Support for 13 value types: string, integer, float, enum, date, time, and more',
    'Token-based display with click-to-edit and remove',
    'Imperative API for focus/blur control via ref',
    'Read-only mode for displaying filters without editing',
  ],
  accessibility: [
    'Built on XDSTokenizer which provides combobox pattern with aria-expanded and aria-autocomplete.',
    'Filter tokens have accessible labels with field name, operator, and value.',
    'Edit popover uses XDSPopover with focus trapping and light dismiss.',
    'Clear all button has accessible label.',
  ],
  keyboard:
    'Type to search fields; Enter to select; Click token to edit; Backspace on empty input removes last filter; Escape closes popover',
};

/** @type {string} */
export const docsDense = `import{XDSPowerSearch}from'@xds/core/PowerSearch' //structured filter bar w/ token filters
P config:PowerSearchConfig! available fields, operators, value types | filters:ReadonlyArray<PowerSearchFilter>! active filters | onChange:(filters: ReadonlyArray<PowerSearchFilter>, changeType: PowerSearchChangeType, index: number) => void! called on filter change; changeType is 'add','edit','remove'; index is affected position | label:string='Search' accessible input label | isLabelHidden:boolean='true' visually hides label, keeps accessible | placeholder:string='Search...' text when no filters selected | hasAutoFocus:boolean='false' auto-focus input on mount | hasClear:boolean='true' show clear-all button | isReadOnly:boolean='false' prevent add/edit/remove | isDisabled:boolean='false' disables entire component | status:XDSInputStatus validation status w/ type+optional message | maxTokenLength:number='40' max char length for token value display | popoverSaveButtonLabel:string='Apply' save button label in edit popover | timezoneID:string timezone ID for date formatting (e.g. "America/New_York") | ref:Ref<XDSPowerSearchHandle> imperative handle w/ focusTypeahead()+blurTypeahead() | endContent:ReactNode content at end of input row, for action buttons | resultCount:number | string result count; number formatted as "N results", string as-is | xstyle:StyleXStyles stylex.create() layout styles
X const config = {
  name: 'TaskSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ],
          },
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      operators: [
        {
          key: 'contains',
          label: 'contains',
          value: { type: 'string' },
        },
      ],
    },
  ],
};

const [filters, setFilters] = useState([]);
<XDSPowerSearch
  config={config}
  filters={filters}
  onChange={(newFilters) => setFilters(newFilters)}
/> | const [filters, setFilters] = useState([
  { field: 'status', operator: 'is', value: { type: 'enum', value: 'open' } },
]);

<XDSPowerSearch
  config={config}
  filters={filters}
  onChange={(newFilters, changeType, index) => {
    setFilters(newFilters);
    console.log(changeType, 'at index', index);
  }}
  placeholder="Add filters..."
/>
A built on XDSTokenizer w/ combobox pattern, aria-expanded+aria-autocomplete|filter tokens have accessible labels w/ field name, operator, value|edit popover uses XDSPopover w/ focus trapping+light dismiss|clear all button has accessible label
K Type=search fields;Enter=select;Click token=edit;Backspace on empty input=remove last filter;Escape=close popover
N typeahead field selection w/ search+aliases|edit popover w/ field, operator, value selectors|13 value types: string, integer, float, enum, date, time, more|token display w/ click-to-edit+remove|imperative API for focus/blur via ref|read-only mode for display w/o editing`;
