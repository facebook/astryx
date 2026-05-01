/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TimeInput',
  keywords: ["timeinput","timepicker","time","clock","hour","minute","ampm","timeselect","timefield","schedule"],

  usage: {
    description:
      'TimeInput lets users enter a time of day and converts it to a standard format. It also allows users to adjust times using the arrow keys. Use it in forms, scheduling flows, or any interface where users need to select a specific time.',
    bestPractices: [
      {guidance: true, description: 'Choose the hour format (12h or 24h) that matches your audience\u2019s locale \u2014 12-hour with AM/PM for US-centric UIs, 24-hour for international or technical contexts.'},
      {guidance: true, description: 'Set min and max constraints when the context has a valid range, like business hours or event windows, so users cannot submit an out-of-bounds time.'},
      {guidance: true, description: 'Provide a description or placeholder that hints at the expected format or purpose, like \u201cBusiness hours: 9 AM \u2013 5 PM\u201d.'},
      {guidance: true, description: 'Use the status prop to surface validation errors inline \u2014 show a message like \u201cTime must be during business hours\u201d so users know exactly what to fix.'},
      {guidance: true, description: 'Enable hasClear when the field is optional, so users can easily remove a previously selected time.'},
      {guidance: false, description: 'Don\u2019t use TimeInput for combined date-and-time selection \u2014 pair it with a separate DateInput instead.'},
      {guidance: false, description: 'Don\u2019t hide the label \u2014 even when space is tight, keep the label visible or provide a description so the purpose is clear.'},
    ],
    anatomy: [
      {name: 'Clock icon', required: false, description: 'A leading clock icon that identifies the field as a time input.'},
      {name: 'Text input', required: true, description: 'The editable text field where users type or see the formatted time.'},
      {name: 'Clear button', required: false, description: 'A trailing button to reset the value, shown when hasClear is true and a value is set.'},
      {name: 'Status icon', required: false, description: 'A trailing icon indicating error, warning, or success state.'},
      {name: 'Spinner', required: false, description: 'Replaces trailing content during loading to show an async action is in progress.'},
    ],
  },

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the input (required for accessibility).',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label while keeping it accessible to screen readers.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed between the label and input.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Shows an "(optional)" indicator next to the label. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Marks the field as required and sets aria-required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the input and suppresses interactions.',
      default: 'false',
    },
    {
      name: 'value',
      type: 'ISOTimeString',
      description: 'Controlled time value in ISO format (HH:MM or HH:MM:SS).',
    },
    {
      name: 'onChange',
      type: '(value: ISOTimeString | undefined) => void',
      description:
        'Callback fired when the time changes. Receives undefined when the input is cleared.',
    },
    {
      name: 'changeAction',
      type: '(value: ISOTimeString | undefined) => void | Promise<void>',
      description:
        'Async action fired after onChange. Wrapped in a React transition to provide optimistic UI; triggers the loading spinner while pending.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Puts the input into a loading state, displaying a spinner.',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISOTimeString',
      description:
        'Minimum selectable time in ISO format. Values outside the range are rejected.',
    },
    {
      name: 'max',
      type: 'ISOTimeString',
      description:
        'Maximum selectable time in ISO format. Values outside the range are rejected.',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description: 'Includes seconds in the time display and parsing.',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows a clear button when a value is set and the input is not disabled.',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "Controls the display format. '12h' shows AM/PM (e.g. '2:30 PM'); '24h' uses 24-hour notation (e.g. '14:30').",
      default: "'12h'",
    },
    {
      name: 'increment',
      type: 'number',
      description:
        'Number of minutes to add or subtract when the user presses the up or down arrow key.',
      default: '1',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Placeholder text shown when no time is selected. When the input is focused and empty, a format hint overrides this text.',
      default: "'Select a time'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Controls the height of the input element.',
      default: "'md'",
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Status indicator that colors the border and displays an icon. When a message is provided it is rendered below the input.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text rendered as an info icon at the end of the label row.',
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
      {className: 'xds-time-input', visualProps: ['size', 'status']},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TimeInput',

  props: [
    {name: 'label', type: 'string', description: '输入框的标签文本（无障碍性所必需）。', required: true},
    {name: 'isLabelHidden', type: 'boolean', description: '视觉上隐藏标签，同时保持屏幕阅读器的无障碍性。', default: 'false'},
    {name: 'description', type: 'string', description: '显示在标签和输入框之间的描述文本。'},
    {name: 'isOptional', type: 'boolean', description: '在标签旁显示"（可选）"指示器。与 isRequired 互斥。', default: 'false'},
    {name: 'isRequired', type: 'boolean', description: '将字段标记为必填并设置 aria-required。与 isOptional 互斥。', default: 'false'},
    {name: 'isDisabled', type: 'boolean', description: '禁用输入框并抑制交互。', default: 'false'},
    {name: 'value', type: 'ISOTimeString', description: 'ISO 格式的受控时间值（HH:MM 或 HH:MM:SS）。'},
    {name: 'onChange', type: '(value: ISOTimeString | undefined) => void', description: '时间变化时触发的回调。输入被清除时接收 undefined。'},
    {name: 'changeAction', type: '(value: ISOTimeString | undefined) => void | Promise<void>', description: '在 onChange 之后触发的异步操作。包装在 React transition 中以提供乐观 UI；挂起时触发加载旋转器。'},
    {name: 'isLoading', type: 'boolean', description: '使输入框进入加载状态，显示旋转器。', default: 'false'},
    {name: 'min', type: 'ISOTimeString', description: 'ISO 格式的最小可选时间。超出范围的值将被拒绝。'},
    {name: 'max', type: 'ISOTimeString', description: 'ISO 格式的最大可选时间。超出范围的值将被拒绝。'},
    {name: 'hasSeconds', type: 'boolean', description: '在时间显示和解析中包含秒。', default: 'false'},
    {name: 'hasClear', type: 'boolean', description: '当有值且输入框未被禁用时显示清除按钮。', default: 'false'},
    {name: 'hourFormat', type: "'12h' | '24h'", description: "控制显示格式。'12h' 显示 AM/PM（例如 '2:30 PM'）；'24h' 使用 24 小时制（例如 '14:30'）。", default: "'12h'"},
    {name: 'increment', type: 'number', description: '用户按上或下方向键时增加或减少的分钟数。', default: '1'},
    {name: 'placeholder', type: 'string', description: '未选择时间时显示的占位符文本。当输入框聚焦且为空时，格式提示会覆盖此文本。', default: "'Select a time'"},
    {name: 'size', type: "'sm' | 'md' | 'lg'", description: '控制输入框元素的高度。', default: "'md'"},
    {name: 'status', type: 'XDSInputStatus', description: '为边框着色并显示图标的状态指示器。当提供消息时，消息渲染在输入框下方。'},
    {name: 'labelTooltip', type: 'string', description: '在标签行末尾以信息图标形式渲染的工具提示文本。'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。'},
  ],
  theming: {
    targets: [
      {className: 'xds-time-input', visualProps: ['size', 'status']},
    ],
  },
  usage: {
    description:
      'TimeInput lets users enter a time of day and converts it to a standard format. It also allows users to adjust times using the arrow keys. Use it in forms, scheduling flows, or any interface where users need to select a specific time.',
    bestPractices: [
      {guidance: true, description: 'Choose the hour format (12h or 24h) that matches your audience\u2019s locale \u2014 12-hour with AM/PM for US-centric UIs, 24-hour for international or technical contexts.'},
      {guidance: true, description: 'Set min and max constraints when the context has a valid range, like business hours or event windows, so users cannot submit an out-of-bounds time.'},
      {guidance: true, description: 'Provide a description or placeholder that hints at the expected format or purpose, like \u201cBusiness hours: 9 AM \u2013 5 PM\u201d.'},
      {guidance: true, description: 'Use the status prop to surface validation errors inline \u2014 show a message like \u201cTime must be during business hours\u201d so users know exactly what to fix.'},
      {guidance: true, description: 'Enable hasClear when the field is optional, so users can easily remove a previously selected time.'},
      {guidance: false, description: 'Don\u2019t use TimeInput for combined date-and-time selection \u2014 pair it with a separate DateInput instead.'},
      {guidance: false, description: 'Don\u2019t hide the label \u2014 even when space is tight, keep the label visible or provide a description so the purpose is clear.'},
    ],
    anatomy: [
      {name: 'Clock icon', required: false, description: 'A leading clock icon that identifies the field as a time input.'},
      {name: 'Text input', required: true, description: 'The editable text field where users type or see the formatted time.'},
      {name: 'Clear button', required: false, description: 'A trailing button to reset the value, shown when hasClear is true and a value is set.'},
      {name: 'Status icon', required: false, description: 'A trailing icon indicating error, warning, or success state.'},
      {name: 'Spinner', required: false, description: 'Replaces trailing content during loading to show an async action is in progress.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Time input that converts free-text entry to standard format with arrow-key adjustment.',
  usage: {
    description:
      'TimeInput lets users enter a time of day and converts it to a standard format. It also allows users to adjust times using the arrow keys. Use it in forms, scheduling flows, or any interface where users need to select a specific time.',
    bestPractices: [
      {guidance: true, description: 'Choose hour format (12h/24h) to match locale \u2014 12h for US, 24h for international.'},
      {guidance: true, description: 'Set min/max constraints for valid ranges like business hours.'},
      {guidance: true, description: 'Provide description or placeholder hinting at expected format.'},
      {guidance: true, description: 'Use status prop for inline validation errors.'},
      {guidance: true, description: 'Enable hasClear for optional fields.'},
      {guidance: false, description: 'Don\u2019t use for date-and-time \u2014 pair with DateInput instead.'},
      {guidance: false, description: 'Don\u2019t hide the label \u2014 keep it visible for clarity.'},
    ],
  },
  propDescriptions: {
    label: 'Label text (required for a11y).',
    isLabelHidden: 'Visually hides label; keeps screen reader access.',
    description: 'Description text between label+input.',
    isOptional: 'Shows "(optional)" indicator. Mutually exclusive w/ isRequired.',
    isRequired: 'Marks required+sets aria-required. Mutually exclusive w/ isOptional.',
    isDisabled: 'Disables input, suppresses interactions.',
    value: 'Controlled time in ISO format (HH:MM or HH:MM:SS).',
    onChange: 'Fired on time change. Receives undefined when cleared.',
    changeAction: 'Async action after onChange in React transition; triggers spinner while pending.',
    isLoading: 'Loading state w/ spinner.',
    min: 'Min selectable time in ISO format. Out-of-range rejected.',
    max: 'Max selectable time in ISO format. Out-of-range rejected.',
    hasSeconds: 'Includes seconds in display+parsing.',
    hasClear: 'Shows clear button when value set+not disabled.',
    hourFormat: "Display format. '12h' shows AM/PM; '24h' uses 24-hour notation.",
    increment: 'Minutes to add/subtract on arrow up/down.',
    placeholder: 'Placeholder when empty. Focused+empty shows format hint.',
    size: 'Input element height.',
    status: 'Colored border+icon. Message rendered below input.',
    labelTooltip: 'Tooltip as info icon at label row end.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value, not inline style.',
  },
};
