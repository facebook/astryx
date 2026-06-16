// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DateTimeInput',
  displayName: 'Date Time Input',
  group: 'DateInput',
  category: 'Data Input',
  keywords: ["datetimepicker","datetime","datepicker","timepicker","calendar","schedule","event","deadline","timestamp"],
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
      description: 'Disable the input and picker.',
      default: 'false',
    },
    {
      name: 'value',
      type: 'ISODateTimeString',
      description: 'Selected datetime in ISO 8601 format (YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS).',
    },
    {
      name: 'onChange',
      type: '(value: ISODateTimeString | undefined) => void',
      description: 'Callback invoked when the selected datetime changes.',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(value: ISODateTimeString | undefined) => void | Promise<void>',
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
      type: 'ISODateTimeString',
      description: 'Minimum selectable datetime. Constrains both date and time selection.',
    },
    {
      name: 'max',
      type: 'ISODateTimeString',
      description: 'Maximum selectable datetime. Constrains both date and time selection.',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: 'Array of custom constraint functions that disable specific dates.',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description: 'Include seconds in the time portion.',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description: "Hour display format. '12h' shows AM/PM; '24h' uses 24-hour notation.",
      default: "'12h'",
    },
    {
      name: 'timeIncrement',
      type: 'number',
      description: 'Minutes to add or subtract when using arrow keys in the time input.',
      default: '1',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Shows a clear button when a datetime value is set.',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when no datetime is selected.',
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
      description: 'Status indicator object for error, warning, or success states with a message.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text displayed via an info icon at the end of the label.',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description: 'Number of months displayed simultaneously in the calendar.',
      default: '1',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-date-time-input', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description: 'DateTimeInput combines a calendar popover with a time input for selecting both a date and time in a single interaction flow. Use it for scheduling, event creation, deadline setting, or any form field that needs a specific datetime.',
    bestPractices: [
      { guidance: true, description: 'Provide clear labels and descriptions so users understand what datetime is expected.' },
      { guidance: true, description: 'Use min and max to restrict selectable datetimes to valid ranges.' },
      { guidance: true, description: 'Use hasClear when the datetime is optional so the user can reset it.' },
      { guidance: true, description: "Choose the hour format (12h or 24h) that matches your audience's locale." },
      { guidance: false, description: 'Use DateTimeInput when only a date is needed; use DateInput instead.' },
      { guidance: false, description: 'Use DateTimeInput when only a time is needed; use TimeInput instead.' },
      { guidance: false, description: 'Hide the label without surrounding context that makes the field purpose obvious.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text above the input describing what datetime is expected.'},
      {name: 'Date input', required: true, description: 'A text input where the user can type a date. Clicking opens a calendar popover.'},
      {name: 'Calendar icon', required: true, description: 'A button that opens the calendar popover.'},
      {name: 'Calendar popover', required: false, description: 'A month grid that appears when the icon is clicked or the date input is focused.'},
      {name: 'Time input', required: true, description: 'A text input for entering the time, displayed beside the date input.'},
      {name: 'Clear button', required: false, description: 'A × button that resets the datetime value.'},
      {name: 'Status message', required: false, description: 'An error, warning, or success message below the inputs.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'DateTimeInput',
  displayName: 'Date Time Input',
  usage: {
    description: 'DateTimeInput combines a calendar popover with a time input for selecting both a date and time in a single interaction flow. Use it for scheduling, event creation, deadline setting, or any form field that needs a specific datetime.',
    bestPractices: [
      { guidance: true, description: 'Provide clear labels and descriptions so users understand what datetime is expected.' },
      { guidance: true, description: 'Use min and max to restrict selectable datetimes to valid ranges.' },
      { guidance: true, description: 'Use hasClear when the datetime is optional so the user can reset it.' },
      { guidance: true, description: "Choose the hour format (12h or 24h) that matches your audience's locale." },
      { guidance: false, description: 'Use DateTimeInput when only a date is needed; use DateInput instead.' },
      { guidance: false, description: 'Use DateTimeInput when only a time is needed; use TimeInput instead.' },
      { guidance: false, description: 'Hide the label without surrounding context that makes the field purpose obvious.' },
    ],
  },
  props: [
    {name: 'label', type: 'string', description: '标签文本。', required: true},
    {name: 'isLabelHidden', type: 'boolean', description: '视觉隐藏标签。', default: 'false'},
    {name: 'description', type: 'string', description: '显示在标签下方的辅助文本。'},
    {name: 'isOptional', type: 'boolean', description: '在标签旁显示"(optional)"指示器。', default: 'false'},
    {name: 'isRequired', type: 'boolean', description: '将字段标记为必填。', default: 'false'},
    {name: 'isDisabled', type: 'boolean', description: '禁用输入框和选择器。', default: 'false'},
    {name: 'value', type: 'ISODateTimeString', description: '选中的日期时间，ISO 8601 格式。'},
    {name: 'onChange', type: '(value: ISODateTimeString | undefined) => void', description: '选中日期时间变更时调用的回调。', required: true},
    {name: 'changeAction', type: '(value: ISODateTimeString | undefined) => void | Promise<void>', description: '在 onChange 之后触发的异步操作。通过 useTransition 驱动乐观更新。'},
    {name: 'isLoading', type: 'boolean', description: '输入框是否处于加载状态。禁用交互并显示加载指示器。', default: 'false'},
    {name: 'min', type: 'ISODateTimeString', description: '可选择的最早日期时间。同时约束日期和时间选择。'},
    {name: 'max', type: 'ISODateTimeString', description: '可选择的最晚日期时间。同时约束日期和时间选择。'},
    {name: 'dateConstraints', type: 'Array<(date: Date) => boolean>', description: '自定义约束函数数组，用于禁用特定日期。'},
    {name: 'hasSeconds', type: 'boolean', description: '在时间部分包含秒。', default: 'false'},
    {name: 'hourFormat', type: "'12h' | '24h'", description: "控制显示格式。'12h' 显示 AM/PM；'24h' 使用 24 小时制。", default: "'12h'"},
    {name: 'timeIncrement', type: 'number', description: '在时间输入中按箭头键时增减的分钟数。', default: '1'},
    {name: 'hasClear', type: 'boolean', description: '当有值时显示清除按钮。', default: 'false'},
    {name: 'placeholder', type: 'string', description: '未选择日期时显示的占位符文本。', default: "'Select a date'"},
    {name: 'size', type: "'sm' | 'md' | 'lg'", description: '输入控件的尺寸。', default: "'md'"},
    {name: 'status', type: 'XDSInputStatus', description: '错误、警告或成功状态的状态指示对象，附带消息。'},
    {name: 'labelTooltip', type: 'string', description: '通过标签末尾的信息图标显示的提示文本。'},
    {name: 'numberOfMonths', type: '1 | 2', description: '日历中同时显示的月份数量。', default: '1'},
    {name: 'xstyle', type: 'StyleXStyles', description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。'},
  ],
  theming: {
    targets: [
      {className: 'xds-date-time-input', visualProps: ['size', 'status']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'combined date + time picker with calendar popover and time input',
  usage: {
    description: 'DateTimeInput combines a calendar popover with a time input for selecting both a date and time. Use for scheduling, events, deadlines, or any form field needing a datetime.',
    bestPractices: [
      { guidance: true, description: 'Provide clear labels + descriptions so users understand what datetime is expected.' },
      { guidance: true, description: 'Use min and max to restrict selectable datetimes to valid ranges.' },
      { guidance: true, description: 'Use hasClear when the datetime is optional so the user can reset it.' },
      { guidance: true, description: "Choose the hour format (12h or 24h) that matches your audience's locale." },
      { guidance: false, description: 'Use DateTimeInput when only a date is needed; use DateInput instead.' },
      { guidance: false, description: 'Use DateTimeInput when only a time is needed; use TimeInput instead.' },
      { guidance: false, description: 'Hide the label without surrounding context that makes the field purpose obvious.' },
    ],
  },
  propDescriptions: {
    label: 'label text',
    isLabelHidden: 'visually hide label',
    description: 'helper text below label',
    isOptional: 'show "(optional)" indicator',
    isRequired: 'mark field required',
    isDisabled: 'disable input+picker',
    value: 'selected datetime ISO 8601',
    onChange: 'callback on datetime change',
    changeAction: 'async action after onChange; drives optimistic UI',
    isLoading: 'loading state; disables interaction, shows spinner',
    min: 'min selectable datetime (ISO)',
    max: 'max selectable datetime (ISO)',
    dateConstraints: 'custom constraint fns to disable specific dates',
    hasSeconds: 'include seconds in time portion',
    hourFormat: "display format. '12h' shows AM/PM; '24h' uses 24-hour",
    timeIncrement: 'minutes to add/subtract on arrow keys in time input',
    hasClear: 'Shows clear button when datetime is set',
    placeholder: 'placeholder text when empty',
    size: 'input control size',
    status: 'error/warning/success status w/ message',
    labelTooltip: 'tooltip text via info icon at label end',
    numberOfMonths: 'months shown simultaneously in calendar',
    xstyle: 'StyleX styles for layout; must be stylex.create() value',
  },
};
