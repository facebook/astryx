/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DateInput',
  description:
    'XDSDateInput component combining a text input with a calendar popover for date selection.',
  features: [
    'Text Input — manual date entry with flexible parsing (supports various formats)',
    'Calendar Popover — click icon or use keyboard to open calendar picker',
    'Date Constraints — min, max, and custom dateConstraints functions',
    'Status Indicators — error, warning, and success states with messages',
    'Accessibility — full keyboard navigation, focus trapping, screen reader support',
    'Field Integration — built on XDSField for consistent label, description, and validation states',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSDateInput
  label="Event date"
  value={date}
  onChange={setDate}
/>`,
    },
    {
      label: 'With constraints',
      code: `<XDSDateInput
  label="Departure date"
  value={date}
  onChange={setDate}
  min="2026-01-01"
  max="2026-12-31"
  placeholder="Pick a date"
/>`,
    },
    {
      label: 'Two-month calendar',
      code: `<XDSDateInput
  label="Check-in date"
  value={date}
  onChange={setDate}
  numberOfMonths={2}
/>`,
    },
    {
      label: 'With description and required',
      code: `<XDSDateInput
  label="Due date"
  description="When should this task be completed?"
  isRequired
  value={date}
  onChange={setDate}
/>`,
    },
    {
      label: 'With error status',
      code: `<XDSDateInput
  label="Event date"
  value={date}
  onChange={setDate}
  status={{
    type: 'error',
    message: 'This date is not available',
  }}
/>`,
    },
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
      name: 'onChangeAction',
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
  keyboard:
    'Tab moves between input and calendar icon button; Enter/Space on icon opens/closes the calendar; Escape closes the calendar popover; Arrow keys navigate between days; Page Up/Down navigate between months.',
  notes: [
    'The text input accepts multiple date formats: ISO (2026-01-28), US (01/28/2026, 1/28/2026), and written (Jan 28, 2026 / January 28 2026).',
    'Invalid input reverts to the previous valid value on blur.',
  ],
  theming: {
    targets: [
      {className: 'xds-date-input', visualProps: ['size']},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'DateInput',
  description:
    'XDSDateInput 日期输入组件，将文本输入与日历弹出层结合用于日期选择。',
  features: [
    '文本输入——手动输入日期，支持灵活的格式解析（支持多种格式）',
    '日历弹出层——点击图标或使用键盘打开日历选择器',
    '日期约束——min、max 和自定义 dateConstraints 函数',
    '状态指示器——错误、警告和成功状态及消息',
    '无障碍——完整的键盘导航、焦点捕获、屏幕阅读器支持',
    '字段集成——基于 XDSField 构建，提供一致的标签、描述和验证状态',
  ],
  examples: [
    {
      label: '基础用法',
      code: `<XDSDateInput
  label="Event date"
  value={date}
  onChange={setDate}
/>`,
    },
    {
      label: '带约束',
      code: `<XDSDateInput
  label="Departure date"
  value={date}
  onChange={setDate}
  min="2026-01-01"
  max="2026-12-31"
  placeholder="Pick a date"
/>`,
    },
    {
      label: '双月日历',
      code: `<XDSDateInput
  label="Check-in date"
  value={date}
  onChange={setDate}
  numberOfMonths={2}
/>`,
    },
    {
      label: '带描述和必填',
      code: `<XDSDateInput
  label="Due date"
  description="When should this task be completed?"
  isRequired
  value={date}
  onChange={setDate}
/>`,
    },
    {
      label: '带错误状态',
      code: `<XDSDateInput
  label="Event date"
  value={date}
  onChange={setDate}
  status={{
    type: 'error',
    message: 'This date is not available',
  }}
/>`,
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: '标签文本。',
      required: true,
    },
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
      name: 'onChangeAction',
      type: '(value: ISODateString | undefined) => void | Promise<void>',
      description: '在 onChange 之后触发的异步操作。通过 useTransition 驱动乐观更新。',
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
      description:
        '自定义约束函数数组，用于禁用特定日期。',
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
      type: 'XDSInputStatus',
      description:
        '错误、警告或成功状态的状态指示对象，附带消息。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '通过标签末尾的信息图标显示的提示文本。',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        '日历弹出层中同时显示的月份数量。',
      default: '1',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  keyboard:
    'Tab 在输入框和日历图标按钮间移动；Enter/Space 点击图标打开/关闭日历；Escape 关闭日历弹出层；方向键在日期间导航；Page Up/Down 在月份间导航。',
  notes: [
    '文本输入接受多种日期格式：ISO（2026-01-28）、美式（01/28/2026、1/28/2026）和书面格式（Jan 28, 2026 / January 28 2026）。',
    '无效输入在失焦时恢复为上一个有效值。',
  ],
  theming: {
    targets: [
      {className: 'xds-date-input', visualProps: ['size']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'text input w/ calendar popover for date selection',
  features: [
    'manual date entry w/ flexible parsing (various formats)',
    'calendar popover via icon click or keyboard',
    'date constraints: min, max, custom dateConstraints fns',
    'error, warning, success status indicators w/ messages',
    'full keyboard nav, focus trapping, screen reader support',
    'built on XDSField for consistent label, description, validation',
  ],
  keyboard: 'Tab=move between input+calendar icon; Enter/Space on icon=open/close calendar; Escape=close; Arrow keys=navigate days; PageUp/Down=navigate months',
  notes: [
    'accepts multiple date formats: ISO (2026-01-28), US (01/28/2026, 1/28/2026), written (Jan 28, 2026 / January 28 2026)',
    'invalid input reverts to previous valid value on blur',
  ],
  propDescriptions: {
    label: 'label text',
    isLabelHidden: 'visually hide label',
    description: 'helper text below label',
    isOptional: 'show "(optional)" indicator',
    isRequired: 'mark field required',
    isDisabled: 'disable input+calendar',
    value: 'selected date YYYY-MM-DD',
    onChange: 'callback on date change',
    onChangeAction: 'async action after onChange; drives optimistic UI',
    isLoading: 'loading state; disables interaction, shows spinner',
    min: 'min selectable date (YYYY-MM-DD)',
    max: 'max selectable date (YYYY-MM-DD)',
    dateConstraints: 'custom constraint fns to disable specific dates',
    placeholder: 'placeholder text in input',
    size: 'input control size',
    status: 'error/warning/success status w/ message',
    labelTooltip: 'tooltip text via info icon at label end',
    numberOfMonths: 'months shown simultaneously in calendar popover',
    xstyle: 'StyleX styles for layout; must be stylex.create() value',
  },
};
