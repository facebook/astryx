/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Calendar',
  description:
    'XDSCalendar component for date selection with single and range modes.',
  showcase: {
    aspectRatio: 3 / 4,
    code: '<XDSCalendar />',
  },
  keywords: ["calendar","datepicker","date picker","rangepicker","date range","monthview","daypicker"],
  features: [
    "Selection Modes: 'single' (default) and 'range'",
    'Multi-Month Display: Show 1 or 2 months side by side',
    'Date Constraints: min, max, and custom dateConstraints functions',
    'Locale Options: weekStartsOn for configurable first day of week',
    'Week Numbers: Optional ISO week number column',
    'Controlled/Uncontrolled: Supports both patterns via value/defaultValue',
    'Keyboard: Escape cancels in-progress range selection',
    'A11y: day name headers use role="columnheader", day buttons expose data-date attribute',
    'A11y: outside days are aria-disabled and not clickable even when visible',
    'A11y: selected date receives roving tabindex priority over today',
    'Nav buttons auto-disable when min/max boundary is within the current month',
    'Motion: day cell transitions respect prefers-reduced-motion',
  ],
  props: [
    {
      name: 'mode',
      type: "'single' | 'range'",
      description: 'Selection mode.',
      default: "'single'",
    },
    {
      name: 'value',
      type: 'ISODateString | DateRange',
      description: 'Controlled selected value.',
    },
    {
      name: 'defaultValue',
      type: 'ISODateString | DateRange',
      description: 'Uncontrolled default value.',
    },
    {
      name: 'onChange',
      type: 'Function',
      description: 'Selection callback.',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description: 'Number of months to display.',
      default: '1',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: 'Minimum selectable date.',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: 'Maximum selectable date.',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: 'Custom constraint functions.',
    },
    {
      name: 'focusDate',
      type: 'ISODateString',
      description: 'Controlled visible month.',
    },
    {
      name: 'onFocusDateChange',
      type: '(focusDate: ISODateString) => void',
      description: 'Navigation callback.',
    },
    {
      name: 'hasOutsideDays',
      type: 'boolean',
      description: 'Show days from adjacent months.',
      default: 'true',
    },
    {
      name: 'hasWeekNumbers',
      type: 'boolean',
      description: 'Show ISO week numbers.',
      default: 'false',
    },
    {
      name: 'hasVariableRowCount',
      type: 'boolean',
      description: 'Variable vs fixed 6-row grid.',
      default: 'false',
    },
    {
      name: 'weekStartsOn',
      type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
      description: 'First day of week (0=Sunday).',
      default: '0',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-calendar', visualProps: ['mode']},
      {className: 'xds-calendar-day', states: ['selected', 'today', 'disabled', 'in-range']},
    ],
  },
  notes: [
    'ISODateString type: `${number}${number}${number}${number}-${number}${number}-${number}${number}`',
    'DayOfWeek type: 0 | 1 | 2 | 3 | 4 | 5 | 6',
    'DateRange interface: { start: ISODateString; end: ISODateString }',
    'Day buttons render a data-date="YYYY-MM-DD" attribute for testing and scripting',
    'Roving tabindex priority: selected date > today > first enabled day',
    'In range mode, pressing Escape resets the pending start date without firing onChange',
    'Previous/next month buttons become disabled when the current view contains the min or max date',
    'Outside days (adjacent month) are rendered with aria-disabled="true" and ignore clicks',
    'Day cell transitions are suppressed under @media (prefers-reduced-motion: reduce)',
  ],
  usage: {
    summary: 'A calendar component for date selection supporting single and range selection modes.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Calendar',
  description:
    'XDSCalendar 日历组件，支持单选和范围选择模式的日期选取。',
  features: [
    "选择模式：'single'（默认）和 'range'",
    '多月显示：并排显示 1 或 2 个月份',
    '日期约束：min、max 和自定义 dateConstraints 函数',
    '区域选项：weekStartsOn 可配置每周的起始日',
    '周数：可选的 ISO 周数列',
    '受控/非受控：通过 value/defaultValue 支持两种模式',
    '键盘：Escape 取消正在进行的范围选择',
    '无障碍：星期名称使用 role="columnheader"，日期按钮暴露 data-date 属性',
    '无障碍：外部日期设为 aria-disabled 且不可点击',
    '无障碍：选中日期获得漫游 tabindex 优先级',
    '导航按钮在 min/max 边界所在月份时自动禁用',
    '动效：日期单元格过渡遵循 prefers-reduced-motion',
  ],
  props: [
    {
      name: 'mode',
      type: "'single' | 'range'",
      description: '选择模式。',
      default: "'single'",
    },
    {
      name: 'value',
      type: 'ISODateString | DateRange',
      description: '受控选中值。',
    },
    {
      name: 'defaultValue',
      type: 'ISODateString | DateRange',
      description: '非受控默认值。',
    },
    {
      name: 'onChange',
      type: 'Function',
      description: '选择回调函数。',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description: '显示的月份数量。',
      default: '1',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: '可选择的最早日期。',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: '可选择的最晚日期。',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: '自定义约束函数。',
    },
    {
      name: 'focusDate',
      type: 'ISODateString',
      description: '受控可见月份。',
    },
    {
      name: 'onFocusDateChange',
      type: '(focusDate: ISODateString) => void',
      description: '导航回调函数。',
    },
    {
      name: 'hasOutsideDays',
      type: 'boolean',
      description: '显示相邻月份的日期。',
      default: 'true',
    },
    {
      name: 'hasWeekNumbers',
      type: 'boolean',
      description: '显示 ISO 周数。',
      default: 'false',
    },
    {
      name: 'hasVariableRowCount',
      type: 'boolean',
      description: '可变行数与固定 6 行网格。',
      default: 'false',
    },
    {
      name: 'weekStartsOn',
      type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
      description: '每周起始日（0=周日）。',
      default: '0',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-calendar', visualProps: ['mode']},
      {className: 'xds-calendar-day', states: ['selected', 'today', 'disabled', 'in-range']},
    ],
  },
  notes: [
    'ISODateString 类型：`${number}${number}${number}${number}-${number}${number}-${number}${number}`',
    'DayOfWeek 类型：0 | 1 | 2 | 3 | 4 | 5 | 6',
    'DateRange 接口：{ start: ISODateString; end: ISODateString }',
    '日期按钮渲染 data-date="YYYY-MM-DD" 属性，用于测试和脚本',
    '漫游 tabindex 优先级：选中日期 > 今天 > 第一个启用日期',
    '范围模式下按 Escape 重置待选起始日期，不触发 onChange',
    '上/下月按钮在当前视图包含 min 或 max 日期时禁用',
    '外部日期（相邻月份）以 aria-disabled="true" 渲染且忽略点击',
    '日期单元格过渡在 @media (prefers-reduced-motion: reduce) 下被抑制',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'calendar for date selection w/ single+range modes',
  features: [
    "selection modes: single (default) + range",
    'multi-month: 1 or 2 side by side',
    'date constraints: min, max, custom dateConstraints fns',
    'weekStartsOn for configurable first day of week',
    'optional ISO week number column',
    'controlled/uncontrolled via value/defaultValue',
    'Escape cancels in-progress range selection',
    'a11y: columnheader on day names, data-date on buttons, outside days aria-disabled',
    'selected date gets roving tabindex priority; nav buttons disable at min/max boundary',
    'prefers-reduced-motion suppresses day cell transitions',
  ],
  notes: [
    'ISODateString type: YYYY-MM-DD template literal',
    'DayOfWeek type: 0|1|2|3|4|5|6',
    'DateRange: { start: ISODateString; end: ISODateString }',
    'data-date attr on day buttons for testing/scripting',
    'tabindex priority: selected > today > first enabled',
    'Escape in range mode resets start, no onChange fired',
    'prev/next buttons disabled when view contains min/max',
    'outside days: aria-disabled + click ignored',
  ],
  propDescriptions: {
    mode: 'selection mode',
    value: 'controlled selected value',
    defaultValue: 'uncontrolled default value',
    onChange: 'selection callback',
    numberOfMonths: 'months to display',
    min: 'minimum selectable date',
    max: 'maximum selectable date',
    dateConstraints: 'custom constraint fns',
    focusDate: 'controlled visible month',
    onFocusDateChange: 'navigation callback',
    hasOutsideDays: 'show days from adjacent months',
    hasWeekNumbers: 'show ISO week numbers',
    hasVariableRowCount: 'variable vs fixed 6-row grid',
    weekStartsOn: 'first day of week (0=Sunday)',
  },
};
