// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DateInput',
  displayName: 'Date Input',
  group: 'DateInput',
  category: 'Data Input',
  keywords: [
    'dateinput',
    'datepicker',
    'datefield',
    'calendar',
    'dateselect',
    'dateentry',
    'datechooser',
  ],
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
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateInput in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
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
      description:
        'Async action fired after onChange. Drives optimistic UI updates via useTransition.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Whether the input is in a loading state. Disables interaction and shows a spinner.',
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
      type: 'InputStatus',
      description:
        'Status indicator object for error, warning, or success states with a message.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text displayed via an info icon at the end of the label.',
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
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-date-input', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description:
      'DateInput lets the user type or pick a date from a calendar popover. Use it for scheduling, deadlines, booking dates, or any form field that needs a specific calendar date.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide clear labels and descriptions so users understand what date is expected.',
      },
      {
        guidance: true,
        description:
          'Use min, max, and dateConstraints to restrict selectable dates to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the date is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          'Show a loading state with changeAction when the date triggers a server-side save.',
      },
      {
        guidance: true,
        description:
          'Use DateInput inside InputGroup when adding a short static prefix or suffix, such as a due-date hint.',
      },
      {
        guidance: false,
        description:
          'Use a DateInput for free-form text that does not represent a calendar date.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Rely on the calendar alone; the text input lets users type dates directly, which is faster for known dates.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateInput in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description: 'Text above the input describing what date is expected.',
      },
      {
        name: 'Text input',
        required: true,
        description:
          'A field where the user can type a date directly. Parses common formats like MM/DD/YYYY.',
      },
      {
        name: 'Calendar icon',
        required: true,
        description:
          'A button that opens the calendar popover for visual date picking.',
      },
      {
        name: 'Calendar popover',
        required: false,
        description:
          'A month grid that appears when the icon is clicked or the input is focused.',
      },
      {
        name: 'Clear button',
        required: false,
        description:
          'A × button that resets the date value. Shown when hasClear is true and a date is set.',
      },
      {
        name: 'Status message',
        required: false,
        description: 'An error, warning, or success message below the input.',
      },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'DateInput',
  displayName: 'Date Input',
  usage: {
    description:
      'DateInput lets the user type or pick a date from a calendar popover. Use it for scheduling, deadlines, booking dates, or any form field that needs a specific calendar date.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide clear labels and descriptions so users understand what date is expected.',
      },
      {
        guidance: true,
        description:
          'Use min, max, and dateConstraints to restrict selectable dates to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the date is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          'Show a loading state with changeAction when the date triggers a server-side save.',
      },
      {
        guidance: false,
        description:
          'Use a DateInput for free-form text that does not represent a calendar date.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Rely on the calendar alone; the text input lets users type dates directly, which is faster for known dates.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateInput in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
  props: [
    {name: 'label', type: 'string', description: '标签文本。', required: true},
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉隐藏标签。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的辅助文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '在标签旁显示"(optional)"指示器。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '将字段标记为必填。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用输入框和日历。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明输入框为何被禁用。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示提示，并通过 aria-disabled 保持输入框可聚焦（仍阻止输入和激活）。请使用此属性，而不是用 Tooltip 包裹已禁用的 DateInput。',
    },
    {
      name: 'value',
      type: 'ISODateString',
      description: '选中的日期，YYYY-MM-DD 格式。',
    },
    {
      name: 'onChange',
      type: '(value: ISODateString | undefined) => void',
      description: '选中日期变更时调用的回调。',
    },
    {
      name: 'changeAction',
      type: '(value: ISODateString | undefined) => void | Promise<void>',
      description:
        '在 onChange 之后触发的异步操作。通过 useTransition 驱动乐观更新。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '输入框是否处于加载状态。禁用交互并显示加载指示器。',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: '可选择的最早日期（YYYY-MM-DD）。',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: '可选择的最晚日期（YYYY-MM-DD）。',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: '自定义约束函数数组，用于禁用特定日期。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '文本输入框中显示的占位符文本。',
      default: "'Select a date'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '输入控件的尺寸。',
      default: "'md'",
    },
    {
      name: 'status',
      type: 'InputStatus',
      description: '错误、警告或成功状态的状态指示对象，附带消息。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '通过标签末尾的信息图标显示的提示文本。',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description: '日历弹出层中同时显示的月份数量。',
      default: '1',
    },
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
        className: 'astryx-date-input',
        visualProps: ['size', 'status'],
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'text input w/ calendar popover for picking a date',
  usage: {
    description:
      'DateInput lets the user type or pick a date from a calendar popover. Use for scheduling, deadlines, booking dates, or any form field needing a calendar date.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide clear labels + descriptions so users understand what date is expected.',
      },
      {
        guidance: true,
        description:
          'Use min, max, and dateConstraints to restrict selectable dates to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the date is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          'Show a loading state with changeAction when the date triggers a server-side save.',
      },
      {
        guidance: true,
        description:
          'Use inside InputGroup for a short static prefix or suffix, such as a due-date hint.',
      },
      {
        guidance: false,
        description:
          'Use a DateInput for free-form text that does not represent a calendar date.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Rely on the calendar alone; the text input lets users type dates directly, which is faster for known dates.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateInput in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
  propDescriptions: {
    label: 'label text',
    isLabelHidden: 'visually hide label',
    description: 'helper text below label',
    isOptional: 'show "(optional)" indicator',
    isRequired: 'mark field required',
    isDisabled: 'disable input+calendar',
    disabledMessage:
      'reason shown in a tooltip on hover/focus when disabled; keeps field focusable via aria-disabled',
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
