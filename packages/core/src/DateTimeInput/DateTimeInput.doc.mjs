// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DateTimeInput',
  displayName: 'Date Time Input',
  group: 'DateInput',
  category: 'Form Controls',
  keywords: [
    'datetimepicker',
    'datetime',
    'datepicker',
    'timepicker',
    'calendar',
    'schedule',
    'event',
    'deadline',
    'timestamp',
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
      description: 'Disable the input and picker.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateTimeInput in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'value',
      type: 'ISODateTimeString',
      description:
        'Selected datetime in ISO 8601 format (YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS).',
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
      type: 'ISODateTimeString',
      description:
        'Minimum selectable datetime. Constrains both date and time selection.',
    },
    {
      name: 'max',
      type: 'ISODateTimeString',
      description:
        'Maximum selectable datetime. Constrains both date and time selection.',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description:
        'Array of custom constraint functions that disable specific dates.',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description:
        "Include seconds in the time portion. Keeps Astryx's time field even when nativePicker selects native surfaces, because iOS has no seconds wheel.",
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "Hour display format. '12h' shows AM/PM; '24h' uses 24-hour notation.",
      default: "'12h'",
    },
    {
      name: 'timeIncrement',
      type: '1 | 5 | 10 | 15 | 30',
      description:
        "Minute step for arrow keys in Astryx's typed time field. A non-default value keeps the Astryx time field in nativePicker modes because iOS treats native step as validation, not picker cadence. Ignored by the Astryx touch sheet, which uses wheels.",
      default: '1',
    },
    {
      name: 'timeOptionInterval',
      type: '5 | 10 | 15 | 30 | 60',
      description:
        "Minute cadence for the preset-time combobox on Astryx's fine-pointer time field. Setting it keeps that Astryx time field even in nativePicker modes because the OS picker has no equivalent preset list. The Astryx touch sheet uses wheels.",
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
      description:
        'Placeholder text shown in the date portion when no date is selected.',
      default: "'Select a date'",
    },
    {
      name: 'timePlaceholder',
      type: 'string',
      description:
        'Placeholder text shown in the time portion when no time is selected. On touch, this appears in the closed time segment before a time is chosen.',
      default: "'Select a time'",
    },
    {
      name: 'timeLabel',
      type: 'string',
      description:
        'Accessible label for the time portion. Defaults to "{label} time" so it is tied to the field label and localizable.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size of the input control.',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
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
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        "Number of months displayed simultaneously in Astryx's pointer calendar popover. Ignored by native date controls and the mobile touch sheet, whose Date panel always shows one swipe-paged month at a time.",
      default: '1',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        'First day of week in Astryx calendars. A number (0 = Sunday to 6 = Saturday) or a three-letter day name. Ignored by native date controls.',
      default: '0',
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "Deprecated. Use adaptations instead. For the initial render and while the field is idle, map 'touch' to {default: 'popover', rules: [{when: {pointer: 'coarse'}, value: 'native'}]}, 'always' to {default: 'native', rules: []}, and 'never' to {default: 'popover', rules: [{when: {pointer: 'coarse'}, value: 'bottom-sheet'}]}. The policy matches those idle surfaces but intentionally holds an active tree until the field is idle; nativePicker='touch' and nativePicker='never' switch immediately when the pointer changes. Existing calls keep their released behavior. Legacy 'touch' and 'always' may retain an Astryx time field for hasSeconds, non-default timeIncrement, or timeOptionInterval, and may ignore numberOfMonths or weekStartsOn on the native date control; those mixed fallbacks have no exact adaptation, so keep nativePicker until the callsite can choose an exact supported surface. min, max, and dateConstraints remain supported and are enforced on commit. Mutually exclusive with adaptations.",
      default: "'touch'",
    },
    {
      name: 'adaptations',
      type: "{default: 'native' | 'popover' | 'bottom-sheet', rules: Array<{when: {width?: {from?: 'sm' | 'md' | 'lg' | 'xl' | '2xl', below?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'}, pointer?: 'coarse' | 'fine'}, value: 'native' | 'popover' | 'bottom-sheet'}>}",
      description:
        "Preferred surface-selection API. default is the server-rendered, hydration, and no-match surface; rules are checked in order and the LAST match wins. Width names resolve against the nearest Theme's width points, from is inclusive, below is exclusive, and the fields of one when are ANDed. Each value is exact and holds on any pointer: 'native' is the platform date and time controls, 'popover' the typed fields with anchored calendar and time list, 'bottom-sheet' the coordinated Date/Time sheet. Because 'native' means native for both segments with no per-segment fallback, a policy naming it anywhere — default or any rule, matched today or not — throws when numberOfMonths is 2, weekStartsOn is set at all, hasSeconds is on, timeIncrement is non-default, or timeOptionInterval is set. min, max and dateConstraints stay supported and are enforced on commit. Mutually exclusive with the deprecated nativePicker shorthand; passing both throws. The resolved surface is held while the field has focus or an open picker, so a resize or rotation mid-entry applies only once the field is idle.",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned.',
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
      {
        className: 'astryx-date-time-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      {
        className: 'astryx-date-time-input-date-segment',
        visualProps: ['size', 'status'],
      },
      {
        className: 'astryx-date-time-input-time-segment',
        visualProps: ['size', 'status'],
      },
      {className: 'astryx-date-time-input-toggle-icon', states: ['state']},
      {className: 'astryx-date-time-input-clock-icon'},
      {className: 'astryx-date-time-input-time-listbox'},
      {className: 'astryx-date-time-input-time-option'},
    ],
  },
  usage: {
    description:
      'DateTimeInput combines date and time selection in one field. Use adaptations to choose exact native, popover, or bottom-sheet surfaces for the server and for ordered width/pointer rules. The closed segments stay side by side when at least 400px is available and wrap into full-width rows below 400px, independent of viewport width. Use it for scheduling, event creation, deadline setting, or any form field that needs a specific datetime.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide clear labels and descriptions so users understand what datetime is expected.',
      },
      {
        guidance: true,
        description:
          'Use min and max to restrict selectable datetimes to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the datetime is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          "Choose the hour format (12h or 24h) that matches your audience's locale.",
      },
      {
        guidance: true,
        description:
          'Use adaptations for all new surface selection. The deprecated nativePicker shorthand remains supported only for compatibility; migrate with the mapping in its prop description.',
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a date is needed; use DateInput instead.',
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a time is needed; use TimeInput instead.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateTimeInput in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description:
          'Text above the input describing what datetime is expected.',
      },
      {
        name: 'Date input',
        required: true,
        description:
          'The active date segment: a typed field with an anchored calendar for popover, a real input type=date for native, or a read-only segment opening the coordinated sheet for bottom-sheet.',
      },
      {
        name: 'Calendar icon',
        required: true,
        description:
          'A button that opens the active date surface: the platform picker, Astryx calendar popover, or Astryx touch sheet.',
      },
      {
        name: 'Date picker',
        required: false,
        description:
          'The browser/OS picker for native, an Astryx month-grid popover for popover, or the Date panel of the coordinated sheet for bottom-sheet.',
      },
      {
        name: 'Time input',
        required: true,
        description:
          'The active time segment: a real input type=time for native, a text/combobox field for popover, or a read-only segment opening accessible time wheels for bottom-sheet.',
      },
      {
        name: 'Time options popover',
        required: false,
        description:
          'A list of preset times at the timeOptionInterval cadence on the popover surface. The exact native surface rejects this prop because platform pickers have no equivalent list; the bottom-sheet surface uses wheels.',
      },
      {
        name: 'Clear button',
        required: false,
        description: 'A × button that resets the datetime value.',
      },
      {
        name: 'Status message',
        required: false,
        description: 'An error, warning, or success message below the inputs.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'DateTimeInput',
  displayName: 'Date Time Input',
  usage: {
    description:
      'DateTimeInput combines date and time selection in one field. Use adaptations to choose exact native, popover, or bottom-sheet surfaces for the server and for ordered width/pointer rules. The closed segments stay side by side when at least 400px is available and wrap into full-width rows below 400px, independent of viewport width. Use it for scheduling, event creation, deadline setting, or any form field that needs a specific datetime.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide clear labels and descriptions so users understand what datetime is expected.',
      },
      {
        guidance: true,
        description:
          'Use min and max to restrict selectable datetimes to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the datetime is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          "Choose the hour format (12h or 24h) that matches your audience's locale.",
      },
      {
        guidance: true,
        description:
          'Use adaptations for all new surface selection. nativePicker 已弃用，仅为兼容旧代码保留；请按该属性说明中的映射迁移。',
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a date is needed; use DateInput instead.',
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a time is needed; use TimeInput instead.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateTimeInput in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
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
      description: '禁用输入框和选择器。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明输入框为何被禁用。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示提示，并通过 aria-disabled 保持日期和时间字段可聚焦（仍阻止输入和激活）。请使用此属性，而不是用 Tooltip 包裹已禁用的 DateTimeInput。',
    },
    {
      name: 'value',
      type: 'ISODateTimeString',
      description: '选中的日期时间，ISO 8601 格式。',
    },
    {
      name: 'onChange',
      type: '(value: ISODateTimeString | undefined) => void',
      description: '选中日期时间变更时调用的回调。',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(value: ISODateTimeString | undefined) => void | Promise<void>',
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
      type: 'ISODateTimeString',
      description: '可选择的最早日期时间。同时约束日期和时间选择。',
    },
    {
      name: 'max',
      type: 'ISODateTimeString',
      description: '可选择的最晚日期时间。同时约束日期和时间选择。',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: '自定义约束函数数组，用于禁用特定日期。',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description:
        '在时间部分包含秒。即使 nativePicker 选择原生界面，也会保留 Astryx 时间字段，因为 iOS 没有秒滚轮。',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description: "控制显示格式。'12h' 显示 AM/PM；'24h' 使用 24 小时制。",
      default: "'12h'",
    },
    {
      name: 'timeIncrement',
      type: '1 | 5 | 10 | 15 | 30',
      description:
        'Astryx 可输入时间字段中箭头键的分钟步长。非默认值会在 nativePicker 模式下保留 Astryx 时间字段，因为 iOS 将原生 step 视为验证规则，而不是选择器步长。Astryx 触摸面板使用滚轮。',
      default: '1',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '当有值时显示清除按钮。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '日期部分未选择日期时显示的占位符文本。',
      default: "'Select a date'",
    },
    {
      name: 'timePlaceholder',
      type: 'string',
      description:
        '时间部分未选择时间时显示的占位符文本。在触摸设备上，这会显示在未选择时间的闭合时间段中。',
      default: "'Select a time'",
    },
    {
      name: 'timeLabel',
      type: 'string',
      description:
        '时间部分的无障碍标签。默认为“{label} time”，与字段标签关联且可本地化。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '输入控件的尺寸。',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
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
      description:
        'Astryx 指针日历弹出层中同时显示的月份数量。原生日期控件和移动触摸面板会忽略此属性；触摸面板的日期部分一次显示一个可滑动月份。',
      default: '1',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        'Astryx 日历中每周的起始日。可为数字（0=周日……6=周六）或三字母星期缩写。原生日期控件会忽略此属性。',
      default: '0',
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "已弃用，请改用 adaptations。初始渲染及字段空闲时的映射：'touch' → {default: 'popover', rules: [{when: {pointer: 'coarse'}, value: 'native'}]}；'always' → {default: 'native', rules: []}；'never' → {default: 'popover', rules: [{when: {pointer: 'coarse'}, value: 'bottom-sheet'}]}。adaptations 会将正在使用的界面保持到字段空闲；nativePicker='touch' 和 nativePicker='never' 会在指针变化时立即切换，因此交互中的行为并不完全相同。现有调用保持原有行为。旧的 'touch' 和 'always' 在 hasSeconds、非默认 timeIncrement 或 timeOptionInterval 下可能保留 Astryx 时间字段，也可能让原生日期控件忽略 numberOfMonths 或 weekStartsOn；这些混合回退没有完全等价的 adaptations 策略，在调用方能选择明确且受支持的界面前继续使用 nativePicker。min、max 和 dateConstraints 仍然支持，并在提交时校验。与 adaptations 互斥。",
      default: "'touch'",
    },
    {
      name: 'adaptations',
      type: "{default: 'native' | 'popover' | 'bottom-sheet', rules: Array<{when: {width?: {from?: 'sm' | 'md' | 'lg' | 'xl' | '2xl', below?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'}, pointer?: 'coarse' | 'fine'}, value: 'native' | 'popover' | 'bottom-sheet'}>}",
      description:
        "首选的界面选择 API。default 是服务端渲染、注水以及无规则命中时的界面；rules 按顺序检查，最后一条命中的规则获胜。宽度名称按最近的 Theme 宽度断点解析，from 为闭区间、below 为开区间，同一个 when 内的各字段为“与”关系。每个值都是精确的，且与指针无关：'native' 为平台原生日期与时间控件，'popover' 为可输入字段加锚定日历与时间列表，'bottom-sheet' 为协同的日期/时间底部弹层。由于 'native' 表示两个片段都使用原生控件、没有逐片段回退，只要策略中任何位置（default 或任意规则，无论当前是否命中）出现 'native'，同时又设置了 numberOfMonths=2、任何 weekStartsOn、hasSeconds、非默认 timeIncrement 或 timeOptionInterval，就会抛出错误。min、max 和 dateConstraints 仍然支持，并在提交时校验。与 nativePicker 互斥，同时传入两者会抛出错误。字段处于焦点中或选择器打开时，已解析的界面会被锁定，窗口缩放或旋转要等到字段空闲后才生效。",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-date-time-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      {
        className: 'astryx-date-time-input-date-segment',
        visualProps: ['size', 'status'],
      },
      {
        className: 'astryx-date-time-input-time-segment',
        visualProps: ['size', 'status'],
      },
      {className: 'astryx-date-time-input-toggle-icon', states: ['state']},
      {className: 'astryx-date-time-input-clock-icon'},
      {className: 'astryx-date-time-input-time-listbox'},
      {className: 'astryx-date-time-input-time-option'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'combined date + time picker with calendar popover and time input',
  usage: {
    description:
      'DateTimeInput combines date and time selection. Use adaptations to choose exact native, popover, or bottom-sheet surfaces for SSR and ordered width/pointer rules. Closed segments stay side by side when at least 400px is available and wrap below 400px.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide clear labels + descriptions so users understand what datetime is expected.',
      },
      {
        guidance: true,
        description:
          'Use min and max to restrict selectable datetimes to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the datetime is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          "Choose the hour format (12h or 24h) that matches your audience's locale.",
      },
      {
        guidance: true,
        description:
          'Use adaptations={{default, rules}} for all new surface selection. nativePicker is deprecated compatibility syntax; see its prop description for the exact migration.',
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a date is needed; use DateInput instead.',
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a time is needed; use TimeInput instead.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateTimeInput in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
  propDescriptions: {
    label: 'label text',
    isLabelHidden: 'visually hide label',
    description: 'helper text below label',
    isOptional: 'show "(optional)" indicator',
    isRequired: 'mark field required',
    isDisabled: 'disable input+picker',
    disabledMessage:
      'reason shown in a tooltip on hover/focus when disabled; keeps fields focusable via aria-disabled',
    value: 'selected datetime ISO 8601',
    onChange: 'callback on datetime change',
    changeAction: 'async action after onChange; drives optimistic UI',
    isLoading: 'loading state; disables interaction, shows spinner',
    min: 'min selectable datetime (ISO)',
    max: 'max selectable datetime (ISO)',
    dateConstraints: 'custom constraint fns to disable specific dates',
    hasSeconds:
      'include seconds; retains Astryx time field because iOS native picker has no seconds wheel',
    hourFormat: "display format. '12h' shows AM/PM; '24h' uses 24-hour",
    timeIncrement:
      'minute step for Astryx typed field; non-default retains Astryx time field in native modes because iOS native step is validation-only',
    timeOptionInterval:
      'preset-time combobox cadence; setting it retains Astryx time field because native pickers have no equivalent list',
    hasClear: 'Shows clear button when datetime is set',
    placeholder: 'date-portion placeholder when empty',
    timePlaceholder:
      'time-portion placeholder when empty; shown on touch closed time segment',
    timeLabel:
      'accessible label for the time input; defaults to "{label} time"',
    size: 'input control size',
    status: 'error/warning/success status w/ message',
    labelTooltip: 'tooltip text via info icon at label end',
    numberOfMonths:
      'Astryx pointer-calendar months shown simultaneously; ignored by native date controls and the mobile touch sheet',
    weekStartsOn:
      'first day of week in Astryx calendars (0=Sunday, or name e.g. "mon"); ignored by native date controls',
    nativePicker:
      'DEPRECATED; use adaptations. idle mapping: touch -> default popover + coarse-pointer native rule; always -> constant native; never -> default popover + coarse-pointer bottom-sheet rule. adaptations holds an active tree until idle; legacy touch/never switch immediately. mixed native/Astryx fallbacks have no exact mapping; see full docs. exclusive with adaptations.',
    adaptations:
      "{default, rules} preferred surface policy over 'native' | 'popover' | 'bottom-sheet'; default is the SSR/hydration/no-match value, LAST matching rule wins, width names come from the nearest Theme (from inclusive, below exclusive), when fields ANDed. exact values, any pointer, both segments. a 'native' value anywhere throws with numberOfMonths=2, any weekStartsOn, hasSeconds, non-default timeIncrement, or any timeOptionInterval; min/max/dateConstraints still fine. exclusive with deprecated nativePicker. held while focused or open.",
    xstyle: 'StyleX styles for layout; must be stylex.create() value',
  },
};
