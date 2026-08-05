// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TransferList.doc.mjs
 * @input TransferList public API, interaction contract, and usage guidance
 * @output Exports full and dense component documentation
 * @position Lab documentation consumed by tooling and Storybook autodocs
 *
 * SYNC: When modified, update TransferList.tsx, tests, and Storybook examples.
 */

/** @type {import('../../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'TransferList',
  displayName: 'Transfer List',
  category: 'Data Input',
  keywords: [
    'transfer list',
    'dual list',
    'pick list',
    'selection',
    'reorder',
    'columns',
    'available',
    'selected',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the whole transfer control. It is shown above the lists unless isLabelHidden is true.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the control label while keeping it available to assistive technology.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description:
        'Supporting guidance shown with the label and associated with the control.',
    },
    {
      name: 'options',
      type: 'readonly TransferListOption<T>[]',
      description:
        'Complete option pool. Each option has value and label, with optional searchable description metadata, group, isDisabled, and disabledMessage fields. Default rows stay single-line; renderOption can expose richer content when needed.',
      required: true,
    },
    {
      name: 'value',
      type: 'readonly T[]',
      description:
        'Selected option values in display order. The consumer owns this controlled state.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(nextValue: readonly T[]) => void',
      description:
        'Called after an enabled option is added, removed, bulk changed, or reordered.',
      required: true,
    },
    {
      name: 'selectedLabel',
      type: 'string',
      description: 'Heading and accessible name for the selected list.',
      default: "'Selected'",
    },
    {
      name: 'availableLabel',
      type: 'string',
      description: 'Heading and accessible name for the available list.',
      default: "'Available'",
    },
    {
      name: 'hasSearch',
      type: 'boolean',
      description:
        'Shows a shared search field that filters both lists by label and description.',
      default: 'true',
    },
    {
      name: 'searchLabel',
      type: 'string',
      description: 'Accessible label for the shared search field.',
      default: '`Search ${label}`',
    },
    {
      name: 'searchPlaceholder',
      type: 'string',
      description: 'Placeholder shown in the shared search field.',
      default: "'Search…'",
    },
    {
      name: 'isReorderable',
      type: 'boolean',
      description:
        'Shows a left-side grip handle for enabled selected options. It supports pointer or touch dragging and keyboard reordering, with order changes announced to assistive technology.',
      default: 'true',
    },
    {
      name: 'hasSelectAll',
      type: 'boolean',
      description:
        'Shows an action that adds every enabled available option while preserving the existing selected order.',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows an action that removes every enabled selected option. Disabled selected options remain selected.',
      default: 'false',
    },
    {
      name: 'onReset',
      type: '() => void',
      description:
        'When provided, shows a reset action and delegates restoration of the consumer-defined default value to the caller.',
    },
    {
      name: 'renderOption',
      type: '(option: TransferListOption<T>) => ReactNode',
      description:
        'Customizes option content while TransferList retains labels, action controls, disabled behavior, and reorder interaction.',
    },
    {
      name: 'selectedEmptyText',
      type: 'string',
      description: 'Message shown when the selected list is empty.',
      default: "'No selected options'",
    },
    {
      name: 'availableEmptyText',
      type: 'string',
      description: 'Message shown when every option has been selected.',
      default: "'No available options'",
    },
    {
      name: 'noResultsText',
      type: 'string',
      description: 'Message shown when search has no matches in a list.',
      default: "'No results'",
    },
  ],
  usage: {
    description:
      'TransferList moves options between adjacent selected and available sections separated only by a divider, with optional ordering of selected values. Use it for medium-to-large, inspectable sets where both membership and order need explicit control; the sections stack responsively in narrow containers.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep visible rows concise and single-line. Use description as searchable metadata, or renderOption when richer visible content is necessary.',
      },
      {
        guidance: true,
        description:
          'Provide disabledMessage whenever an option is locked so the constraint is discoverable by pointer, keyboard, and assistive-technology users.',
      },
      {
        guidance: true,
        description:
          'Keep draft state, Apply and Cancel actions, saved views, and persistence in the surrounding feature when changes should not take effect immediately.',
      },
      {
        guidance: false,
        description:
          'Use a transfer list for a handful of simple choices; CheckboxInput or MultiSelector is more compact.',
      },
      {
        guidance: false,
        description:
          'Treat rows as listbox options. Rows contain explicit add, remove, and reorder controls, so TransferList uses labeled semantic lists instead of role="listbox".',
      },
    ],
    anatomy: [
      {
        name: 'Label and description',
        required: true,
        description:
          'Names the complete control and explains the effect of moving options.',
      },
      {
        name: 'Search',
        required: false,
        description:
          'Filters the selected and available lists without changing their values.',
      },
      {
        name: 'Columns and divider',
        required: true,
        description:
          'Places two unframed sections side by side with one logical divider, which becomes horizontal when the sections stack.',
      },
      {
        name: 'Selected list',
        required: true,
        description:
          'A labeled semantic list of single-line rows whose order matches value. Each enabled row uses a left-side grip for ordering and a direction-neutral X action for removal.',
      },
      {
        name: 'Available list',
        required: true,
        description:
          'A labeled semantic list of single-line unselected rows. Each enabled row has an explicit direction-neutral plus action.',
      },
      {
        name: 'Bulk actions',
        required: false,
        description:
          'Optional Clear and Add all text actions plus caller-owned Reset behavior; all honor disabled options.',
      },
      {
        name: 'Live announcements',
        required: true,
        description:
          'Reports add, remove, bulk, and reorder results without relying on visual position alone.',
      },
    ],
  },
  examples: [
    {
      label: 'Controlled selection and order',
      code: `const [fields, setFields] = useState(['name', 'status']);

<TransferList
  label="Visible fields"
  options={[
    {value: 'name', label: 'Name'},
    {value: 'status', label: 'Status'},
    {value: 'owner', label: 'Owner'},
  ]}
  value={fields}
  onChange={setFields}
  hasSelectAll
  hasClear
/>`,
    },
    {
      label: 'Locked option',
      code: `<TransferList
  label="Visible fields"
  options={[
    {
      value: 'name',
      label: 'Name',
      isDisabled: true,
      disabledMessage: 'Name must remain visible.',
    },
    {value: 'status', label: 'Status'},
  ]}
  value={fields}
  onChange={setFields}
/>`,
    },
    {
      label: 'Draft changes with surrounding actions',
      code: `const [applied, setApplied] = useState(defaultFields);
const [draft, setDraft] = useState(defaultFields);

<>
  <TransferList
    label="Visible fields"
    options={fieldOptions}
    value={draft}
    onChange={setDraft}
    onReset={() => setDraft(defaultFields)}
  />
  <Button label="Cancel" onClick={() => setDraft(applied)} />
  <Button label="Apply" onClick={() => setApplied(draft)} />
</>`,
    },
  ],
};

/** @type {import('../../../core/src/docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'controlled dual-list selector for membership + selected-value order; responsive, searchable, and accessible',
  usage: {
    description:
      'Moves options between adjacent semantic lists separated only by a divider; rows are single-line and selected order matches value. Plus adds, X removes, and a left grip reorders. Search/reorder default on; narrow containers stack.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep rows single-line; descriptions remain searchable metadata.',
      },
      {
        guidance: true,
        description: 'Explain every locked option with disabledMessage.',
      },
      {
        guidance: true,
        description:
          'Compose draft/Apply/Cancel, saved views, and persistence outside the component.',
      },
      {
        guidance: false,
        description: 'Use for a few simple choices; prefer CheckboxInput.',
      },
      {
        guidance: false,
        description:
          'Apply role=listbox; rows contain interactive controls, so use the built-in semantic lists.',
      },
    ],
  },
  propDescriptions: {
    label: 'Accessible control label.',
    isLabelHidden: 'Hide label visually, preserving its accessible name.',
    description: 'Supporting control guidance.',
    options:
      'Full option pool: value, label, description?, group?, isDisabled?, disabledMessage?.',
    value: 'Selected values in display order.',
    onChange: 'Called after add/remove/bulk/reorder.',
    selectedLabel: 'Selected-list heading + accessible name.',
    availableLabel: 'Available-list heading + accessible name.',
    hasSearch: 'Shared filter for both lists; default true.',
    searchLabel: 'Accessible search label.',
    searchPlaceholder: 'Search placeholder.',
    isReorderable:
      'Left grip with pointer/touch + keyboard reorder; default true.',
    hasSelectAll: 'Add all enabled available options.',
    hasClear: 'Remove all enabled selected options.',
    onReset: 'Caller-owned default restoration action.',
    renderOption: 'Custom option content.',
    selectedEmptyText: 'Selected-list empty message.',
    availableEmptyText: 'Available-list empty message.',
    noResultsText: 'No search matches message.',
  },
};
