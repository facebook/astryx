/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CheckboxInput',
  keywords: ["checkbox","check","toggle","tick","indeterminate","boolean","tristate","checkboxlist","checkboxgroup","multichoice","multiselect","checklist"],
  components: [
    {
      name: 'XDSCheckboxInput',
      description:
        'Single checkbox for toggling a boolean value. Use for standalone on/off settings, terms acceptance, or opt-in choices.',
      props: [
        { name: 'ref', type: 'React.Ref<HTMLInputElement>', description: 'Ref forwarded to the underlying <input> element.' },
        { name: 'label', type: 'string', description: 'Label text for the checkbox (always rendered for accessibility).', required: true },
        { name: 'isLabelHidden', type: 'boolean', description: 'Whether to visually hide the label (still accessible to screen readers).', default: 'false' },
        { name: 'description', type: 'string', description: 'Description text displayed below the label.' },
        { name: 'value', type: "boolean | 'indeterminate'", description: 'Whether the checkbox is checked, unchecked, or indeterminate.', required: true },
        { name: 'onChange', type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void', description: 'Callback fired when the checkbox state changes.' },
        { name: 'onChangeAction', type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>', description: 'Async action on change. Fires after onChange if not prevented. Shows loading spinner while pending.' },
        { name: 'isLoading', type: 'boolean', description: 'Whether the checkbox is in a loading state. Shows spinner and prevents interaction.', default: 'false' },
        { name: 'isDisabled', type: 'boolean', description: 'Whether the checkbox is disabled.', default: 'false' },
        { name: 'isOptional', type: 'boolean', description: 'Whether the field is optional. Mutually exclusive with isRequired.', default: 'false' },
        { name: 'isRequired', type: 'boolean', description: 'Whether the checkbox is required. Mutually exclusive with isOptional.', default: 'false' },
        { name: 'size', type: "'sm' | 'md'", description: 'The size of the checkbox. sm for compact layouts, md for default.', default: "'md'" },
        { name: 'onFocus', type: '(e: FocusEvent<HTMLInputElement>) => void', description: 'Callback fired when the checkbox receives focus.' },
        { name: 'onBlur', type: '(e: FocusEvent<HTMLInputElement>) => void', description: 'Callback fired when the checkbox loses focus.' },
        { name: 'labelIcon', type: 'XDSIconType', description: 'Icon to display before the label text.' },
        { name: 'status', type: "{ type: 'error' | 'warning' | 'success', message: string }", description: 'Status indicator. Displays a colored message box below the checkbox and sets aria-invalid for errors.' },
      ],
    },
    {
      name: 'XDSCheckboxList',
      description:
        'Checkbox group container with field integration for label, description, and status. Use for selecting multiple options from a visible list.',
      props: [
        { name: 'label', type: 'string', description: 'Label text for the checkbox group (always rendered for accessibility).', required: true },
        { name: 'children', type: 'ReactNode', description: 'XDSCheckboxListItem elements.', required: true },
        { name: 'value', type: 'string[]', description: 'The currently selected values (collection mode).' },
        { name: 'onChange', type: '(values: string[]) => void', description: 'Callback fired when the selected values change.' },
        { name: 'onChangeAction', type: '(values: string[]) => void | Promise<void>', description: 'Async action on change with optimistic updates.' },
        { name: 'isLoading', type: 'boolean', description: 'External loading state.', default: 'false' },
        { name: 'isLabelHidden', type: 'boolean', description: 'Whether to visually hide the label.', default: 'false' },
        { name: 'description', type: 'string', description: 'Description text displayed below the label.' },
        { name: 'density', type: "'compact' | 'balanced' | 'spacious'", description: 'Spacing density for list items.', default: "'balanced'" },
        { name: 'hasDividers', type: 'boolean', description: 'Whether to show dividers between items.', default: 'false' },
        { name: 'isDisabled', type: 'boolean', description: 'Whether all checkbox items are disabled.', default: 'false' },
        { name: 'status', type: 'XDSInputStatus', description: 'Status indicator ({ type, message }).' },
        { name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization. Must be a stylex.create() value.' },
      ],
    },
    {
      name: 'XDSCheckboxListItem',
      description:
        'Individual checkbox item with label, description, and end content slot. Works in collection mode (inside XDSCheckboxList) or standalone mode (inside XDSList).',
      props: [
        { name: 'label', type: 'string', description: 'Primary text label for the item.', required: true },
        { name: 'value', type: 'string', description: 'Identity key (required inside XDSCheckboxList).' },
        { name: 'description', type: 'string', description: 'Secondary text below the label.' },
        { name: 'endContent', type: 'ReactNode', description: 'Content rendered after the label area.' },
        { name: 'isDisabled', type: 'boolean', description: 'Whether this individual item is disabled.', default: 'false' },
        { name: 'isChecked', type: "boolean | 'indeterminate'", description: 'Direct checked state (standalone mode only).' },
        { name: 'onCheck', type: '(checked: boolean) => void', description: 'Direct check handler (standalone mode only).' },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-checkbox-input', visualProps: ['size']},
      {className: 'xds-checkbox'},
    ],
  },
  usage: {
    description: 'CheckboxInput toggles a single on/off value \u2014 use it for settings, terms acceptance, or opt-in choices. For selecting multiple options from a list, use CheckboxList with CheckboxListItem instead. CheckboxList manages group state as a string array and provides built-in field integration (label, description, status).',
    bestPractices: [
      { guidance: true, description: 'Always provide a visible label so the user knows what they are toggling. Use isLabelHidden only when surrounding context makes it obvious.' },
      { guidance: true, description: 'Add a description for choices that need extra context, like explaining what "Share usage data" actually shares.' },
      { guidance: true, description: 'Use CheckboxList with value/onChange for multi-select groups \u2014 it manages selected values as a string array.' },
      { guidance: true, description: 'Provide a clear group label on CheckboxList that describes what the options represent, like "Notification preferences".' },
      { guidance: true, description: 'Use the indeterminate state for "select all" checkboxes when only some items in a group are selected.' },
      { guidance: false, description: 'Use a checkbox for mutually exclusive choices \u2014 use RadioList when only one option can be selected.' },
      { guidance: false, description: 'Use a checkbox for actions that take effect immediately \u2014 use a toggle switch or button instead.' },
      { guidance: false, description: 'Put buttons or links in endContent — they conflict with the row’s click target.' },
    ],
    anatomy: [
      { name: 'Checkbox', required: true, description: 'The check box itself \u2014 unchecked, checked, or indeterminate.' },
      { name: 'Label', required: true, description: 'Text describing what the checkbox controls. Always present for accessibility.' },
      { name: 'Description', required: false, description: 'Helper text below the label with additional context.' },
      { name: 'Status message', required: false, description: 'An error, warning, or success message below the checkbox.' },
      { name: 'Group container', required: false, description: 'XDSCheckboxList wraps multiple items with a shared label and optional dividers.' },
      { name: 'End content', required: false, description: 'Slot after the label area on each CheckboxListItem for metadata like pricing.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'CheckboxInput',
  usage: {
    description: 'CheckboxInput toggles a single on/off value \u2014 use it for settings, terms acceptance, or opt-in choices. For selecting multiple options from a list, use CheckboxList with CheckboxListItem instead.',
    bestPractices: [
      { guidance: true, description: 'Always provide a visible label so the user knows what they are toggling. Use isLabelHidden only when surrounding context makes it obvious.' },
      { guidance: true, description: 'Add a description for choices that need extra context, like explaining what "Share usage data" actually shares.' },
      { guidance: true, description: 'Use CheckboxList with value/onChange for multi-select groups \u2014 it manages selected values as a string array.' },
      { guidance: true, description: 'Provide a clear group label on CheckboxList that describes what the options represent, like "Notification preferences".' },
      { guidance: true, description: 'Use the indeterminate state for "select all" checkboxes when only some items in a group are selected.' },
      { guidance: false, description: 'Use a checkbox for mutually exclusive choices \u2014 use RadioList when only one option can be selected.' },
      { guidance: false, description: 'Use a checkbox for actions that take effect immediately \u2014 use a toggle switch or button instead.' },
      { guidance: false, description: 'Put buttons or links in endContent — they conflict with the row’s click target.' },
    ],
  },
  components: [
    {
      name: 'XDSCheckboxInput',
      description: '\u5355\u4e2a\u590d\u9009\u6846\uff0c\u7528\u4e8e\u5207\u6362\u5e03\u5c14\u503c\u3002\u7528\u4e8e\u72ec\u7acb\u7684\u5f00/\u5173\u8bbe\u7f6e\u3001\u6761\u6b3e\u63a5\u53d7\u6216\u9009\u62e9\u52a0\u5165\u3002',
      props: [
        {name: 'ref', type: 'React.Ref<HTMLInputElement>', description: '\u8f6c\u53d1\u81f3\u5e95\u5c42 <input> \u5143\u7d20\u7684 ref\u3002'},
        {name: 'label', type: 'string', description: '\u590d\u9009\u6846\u7684\u6807\u7b7e\u6587\u672c\uff08\u59cb\u7ec8\u4e3a\u65e0\u969c\u788d\u6027\u800c\u6e32\u67d3\uff09\u3002', required: true},
        {name: 'isLabelHidden', type: 'boolean', description: '\u662f\u5426\u89c6\u89c9\u9690\u85cf\u6807\u7b7e\uff08\u5c4f\u5e55\u9605\u8bfb\u5668\u4ecd\u53ef\u8bbf\u95ee\uff09\u3002', default: 'false'},
        {name: 'description', type: 'string', description: '\u663e\u793a\u5728\u6807\u7b7e\u4e0b\u65b9\u7684\u63cf\u8ff0\u6587\u672c\u3002'},
        {name: 'value', type: "boolean | 'indeterminate'", description: '\u590d\u9009\u6846\u662f\u5426\u4e3a\u9009\u4e2d\u3001\u672a\u9009\u4e2d\u6216\u4e0d\u786e\u5b9a\u72b6\u6001\u3002', required: true},
        {name: 'onChange', type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void', description: '\u590d\u9009\u6846\u72b6\u6001\u53d8\u66f4\u65f6\u89e6\u53d1\u7684\u56de\u8c03\u3002'},
        {name: 'onChangeAction', type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>', description: '\u5f02\u6b65\u53d8\u66f4\u64cd\u4f5c\u3002\u5728 onChange \u4e4b\u540e\u89e6\u53d1\u3002'},
        {name: 'isLoading', type: 'boolean', description: '\u590d\u9009\u6846\u662f\u5426\u5904\u4e8e\u52a0\u8f7d\u72b6\u6001\u3002', default: 'false'},
        {name: 'isDisabled', type: 'boolean', description: '\u590d\u9009\u6846\u662f\u5426\u7981\u7528\u3002', default: 'false'},
        {name: 'status', type: "{ type: 'error' | 'warning' | 'success', message: string }", description: '\u72b6\u6001\u6307\u793a\u5668\u3002'},
      ],
    },
    {
      name: 'XDSCheckboxList',
      description: '\u590d\u9009\u6846\u7ec4\u5bb9\u5668\uff0c\u96c6\u6210\u5b57\u6bb5\u529f\u80fd\uff0c\u652f\u6301\u6807\u7b7e\u3001\u63cf\u8ff0\u548c\u72b6\u6001\u3002',
      props: [
        {name: 'label', type: 'string', description: '\u590d\u9009\u6846\u7ec4\u7684\u6807\u7b7e\u6587\u672c\u3002', required: true},
        {name: 'children', type: 'ReactNode', description: 'XDSCheckboxListItem \u5143\u7d20\u3002', required: true},
        {name: 'value', type: 'string[]', description: '\u5f53\u524d\u9009\u4e2d\u7684\u503c\u3002'},
        {name: 'onChange', type: '(values: string[]) => void', description: '\u9009\u4e2d\u503c\u53d8\u66f4\u65f6\u89e6\u53d1\u7684\u56de\u8c03\u3002'},
        {name: 'hasDividers', type: 'boolean', description: '\u662f\u5426\u663e\u793a\u5206\u9694\u7ebf\u3002', default: 'false'},
        {name: 'isDisabled', type: 'boolean', description: '\u662f\u5426\u7981\u7528\u6240\u6709\u9009\u9879\u3002', default: 'false'},
      ],
    },
    {
      name: 'XDSCheckboxListItem',
      description: '\u5355\u4e2a\u590d\u9009\u6846\u9009\u9879\u3002',
      props: [
        {name: 'label', type: 'string', description: '\u9009\u9879\u6807\u7b7e\u3002', required: true},
        {name: 'value', type: 'string', description: '\u6807\u8bc6\u952e\u3002'},
        {name: 'description', type: 'string', description: '\u8f85\u52a9\u6587\u672c\u3002'},
        {name: 'endContent', type: 'ReactNode', description: '\u5c3e\u90e8\u5185\u5bb9\u3002'},
        {name: 'isDisabled', type: 'boolean', description: '\u662f\u5426\u7981\u7528\u3002', default: 'false'},
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-checkbox-input', visualProps: ['size']},
      {className: 'xds-checkbox'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Single checkbox toggle and multi-select checkbox group. Use CheckboxInput for one on/off value, CheckboxList for selecting multiple options.',
  usage: {
    description: 'CheckboxInput toggles a single on/off value. CheckboxList groups multiple checkboxes with shared state as a string array. Use RadioList for single selection.',
    bestPractices: [
      { guidance: true, description: 'Always provide a visible label. Add description for context. Use CheckboxList for groups. Use indeterminate for partial "select all".' },
      { guidance: false, description: 'Use for mutually exclusive choices (use RadioList). Use for immediate actions (use toggle/button).' },
    ],
  },
  components: [
    {
      name: 'XDSCheckboxInput',
      description: 'Single checkbox for toggling a boolean value.',
      propDescriptions: {
        ref: 'ref forwarded to underlying <input>',
        label: 'label text; always rendered for a11y',
        isLabelHidden: 'visually hide label',
        description: 'text below label',
        value: 'checked, unchecked, or indeterminate',
        onChange: 'callback on state change',
        onChangeAction: 'async action; fires after onChange',
        isLoading: 'shows spinner + prevents interaction',
        isDisabled: 'disable checkbox',
        size: 'sm (compact) or md (default)',
        status: 'error/warning/success with message',
      },
    },
    {
      name: 'XDSCheckboxList',
      description: 'Checkbox group container w/ field integration.',
      propDescriptions: {
        label: 'Label text for checkbox group.',
        children: 'XDSCheckboxListItem elements.',
        value: 'Currently selected values (collection mode).',
        onChange: 'Callback fired when selected values change.',
        hasDividers: 'Whether to show dividers between items.',
        isDisabled: 'Whether all checkbox items disabled.',
      },
    },
    {
      name: 'XDSCheckboxListItem',
      description: 'Individual checkbox item w/ label, description, end content slot.',
      propDescriptions: {
        label: 'Primary text label for item.',
        value: 'Identity key (required inside XDSCheckboxList).',
        description: 'Secondary text below label.',
        endContent: 'Content rendered after label area.',
        isDisabled: 'Whether this individual item disabled.',
        isChecked: 'Direct checked state (standalone mode only).',
        onCheck: 'Direct check handler (standalone mode only).',
      },
    },
  ],
};
