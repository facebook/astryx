// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DateInput',
  displayName: 'Date Input',
  group: 'DateInput',
  category: 'Inputs',
  keywords: ["dateinput","datepicker","datefield","calendar","dateselect","dateentry","datechooser"],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hide the label.',
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
      description: 'Show an "(optional)" indicator next to the label.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Mark the field as required.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disable the input and calendar.',
      default: 'false',
    },
    {
      name: 'value',
      type: 'ISODateString',
      description: 'Selected date in YYYY-MM-DD format.',
    },
    {
      name: 'onChange',
      type: '(value: ISODateString | undefined) => void',
      description: 'Callback invoked when the selected date changes.',
    },
    {
      name: 'changeAction',
      type: '(value: ISODateString | undefined) => void | Promise<void>',
      description: 'Async action fired after onChange. Drives optimistic UI updates via useTransition.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Whether the input is in a loading state. Disables interaction and shows a spinner.',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: 'Minimum selectable date (YYYY-MM-DD).',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: 'Maximum selectable date (YYYY-MM-DD).',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description:
        'Array of custom constraint functions that disable specific dates.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown in the text input.',
      default: "'Select a date'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size of the input control.',
      default: "'md'",
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Status indicator object for error, warning, or success states with a message.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text displayed via an info icon at the end of the label.',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows a clear (\u00d7) button when a date value is set. Clicking it clears the value and returns focus to the input.',
      default: 'false',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        'Number of months displayed simultaneously in the calendar popover.',
      default: '1',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-date-input', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description: 'DateInput lets the user type or pick a date from a calendar popover. Use it for scheduling, deadlines, booking dates, or any form field that needs a specific calendar date.',
    bestPractices: [
      { guidance: true, description: 'Provide clear labels and descriptions so users understand what date is expected.' },
      { guidance: true, description: 'Use min, max, and dateConstraints to restrict selectable dates to valid ranges.' },
      { guidance: true, description: 'Use hasClear when the date is optional so the user can easily reset it.' },
      { guidance: true, description: 'Show a loading state with changeAction when the date triggers a server-side save.' },
      { guidance: false, description: 'Use a DateInput for free-form text that does not represent a calendar date.' },
      { guidance: false, description: 'Hide the label without surrounding context that makes the field purpose obvious.' },
      { guidance: false, description: 'Rely on the calendar alone — the text input lets users type dates directly, which is faster for known dates.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text above the input describing what date is expected.'},
      {name: 'Text input', required: true, description: 'A field where the user can type a date directly. Parses common formats like MM/DD/YYYY.'},
      {name: 'Calendar icon', required: true, description: 'A button that opens the calendar popover for visual date picking.'},
      {name: 'Calendar popover', required: false, description: 'A month grid that appears when the icon is clicked or the input is focused.'},
      {name: 'Clear button', required: false, description: 'A × button that resets the date value. Shown when hasClear is true and a date is set.'},
      {name: 'Status message', required: false, description: 'An error, warning, or success message below the input.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'DateInput',
  displayName: 'Date Input',
  usage: {
    description: 'DateInput lets the user type or pick a date from a calendar popover. Use it for scheduling, deadlines, booking dates, or any form field that needs a specific calendar date.',
    bestPractices: [
      { guidance: true, description: 'Provide clear labels and descriptions so users understand what date is expected.' },
      { guidance: true, description: 'Use min, max, and dateConstraints to restrict selectable dates to valid ranges.' },
      { guidance: true, description: 'Use hasClear when the date is optional so the user can easily reset it.' },
      { guidance: true, description: 'Show a loading state with changeAction when the date triggers a server-side save.' },
      { guidance: false, description: 'Use a DateInput for free-form text that does not represent a calendar date.' },
      { guidance: false, description: 'Hide the label without surrounding context that makes the field purpose obvious.' },
      { guidance: false, description: 'Rely on the calendar alone — the text input lets users type dates directly, which is faster for known dates.' },
    ],
  },
  props: [
    {name: 'label', type: 'string', description: '标签文本。', required: true},
    {name: 'isLabelHidden', type: 'boolean', description: '视觉隐藏标签。', default: 'false'},
    {name: 'description', type: 'string', description: '显示在标签下方的辅助文本。'},
    {name: 'isOptional', type: 'boolean', description: '在标签旁显示"(optional)"指示器。', default: 'false'},
    {name: 'isRequired', type: 'boolean', description: '将字段标记为必填。', default: 'false'},
    {name: 'isDisabled', type: 'boolean', description: '禁用输入框和日历。', default: 'false'},
    {name: 'value', type: 'ISODateString', description: '选中的日期，YYYY-MM-DD 格式。'},
    {name: 'onChange', type: '(value: ISODateString | undefined) => void', description: '选中日期变更时调用的回调。'},
    {
      name: 'changeAction',
      type: '(value: ISODateString | undefined) => void | Promise<void>',
      description: '在 onChange 之后触发的异步操作。通过 useTransition 驱动乐观更新。',
    },
    {name: 'isLoading', type: 'boolean', description: '输入框是否处于加载状态。禁用交互并显示加载指示器。', default: 'false'},
    {name: 'min', type: 'ISODateString', description: '可选择的最早日期（YYYY-MM-DD）。'},
    {name: 'max', type: 'ISODateString', description: '可选择的最晚日期（YYYY-MM-DD）。'},
    {name: 'dateConstraints', type: 'Array<(date: Date) => boolean>', description: '自定义约束函数数组，用于禁用特定日期。'},
    {name: 'placeholder', type: 'string', description: '文本输入框中显示的占位符文本。', default: "'Select a date'"},
    {name: 'size', type: "'sm' | 'md' | 'lg'", description: '输入控件的尺寸。', default: "'md'"},
    {name: 'status', type: 'XDSInputStatus', description: '错误、警告或成功状态的状态指示对象，附带消息。'},
    {name: 'labelTooltip', type: 'string', description: '通过标签末尾的信息图标显示的提示文本。'},
    {name: 'numberOfMonths', type: '1 | 2', description: '日历弹出层中同时显示的月份数量。', default: '1'},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'xds-date-input',
        visualProps: [
          'size',
          'status',
        ],
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'text input w/ calendar popover for picking a date',
  usage: {
    description: 'DateInput lets the user type or pick a date from a calendar popover. Use for scheduling, deadlines, booking dates, or any form field needing a calendar date.',
    bestPractices: [
      { guidance: true, description: 'Clear labels + descriptions. Use min/max/dateConstraints for valid ranges.' },
      { guidance: true, description: 'Use hasClear for optional dates. Use changeAction for server-side saves.' },
      { guidance: false, description: 'Use for free-form text that is not a calendar date.' },
      { guidance: false, description: 'Hide the label without surrounding context. Don\'t ignore the text input — users can type dates directly.' },
    ],
  },
  propDescriptions: {
    label: 'label text',
    isLabelHidden: 'visually hide label',
    description: 'helper text below label',
    isOptional: 'show "(optional)" indicator',
    isRequired: 'mark field required',
    isDisabled: 'disable input+calendar',
    value: 'selected date YYYY-MM-DD',
    onChange: 'callback on date change',
    changeAction: 'async action after onChange; drives optimistic UI',
    isLoading: 'loading state; disables interaction, shows spinner',
    min: 'min selectable date (YYYY-MM-DD)',
    max: 'max selectable date (YYYY-MM-DD)',
    dateConstraints: 'custom constraint fns to disable specific dates',
    placeholder: 'placeholder text in input',
    size: 'input control size',
    status: 'error/warning/success status w/ message',
    labelTooltip: 'tooltip text via info icon at label end',
    hasClear: 'Shows clear button when date is set. Clears value on click.',
    numberOfMonths: 'months shown simultaneously in calendar popover',
    xstyle: 'StyleX styles for layout; must be stylex.create() value',
  },
};
