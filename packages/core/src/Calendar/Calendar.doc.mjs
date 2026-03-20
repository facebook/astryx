/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Calendar',
  description:
    'XDSCalendar component for date selection with single and range modes.',
  features: [
    "Selection Modes: 'single' (default) and 'range'",
    'Multi-Month Display: Show 1 or 2 months side by side',
    'Date Constraints: min, max, and custom dateConstraints functions',
    'Locale Options: weekStartsOn for configurable first day of week',
    'Week Numbers: Optional ISO week number column',
    'Controlled/Uncontrolled: Supports both patterns via value/defaultValue',
    'Imperative Navigation: ref exposes navigateTo(date) for programmatic control',
    'Full Keyboard Navigation: Arrow keys, Home/End, PageUp/PageDown, Escape to cancel range',
    'Accessible: ARIA grid pattern with live region announcements, roving tabindex',
  ],
  examples: [
    {
      label: 'Single date selection',
      code: `<XDSCalendar
  value="2026-01-28"
  onChange={(value, valueAsDate) => console.log(value)}
/>`,
    },
    {
      label: 'Range selection',
      code: `<XDSCalendar
  mode="range"
  value={{ start: "2026-01-28", end: "2026-02-05" }}
  onChange={(range) => console.log(range.start, range.end)}
/>`,
    },
    {
      label: 'Two months with constraints',
      code: `<XDSCalendar
  numberOfMonths={2}
  min="2026-01-01"
  max="2026-12-31"
  weekStartsOn={1}
/>`,
    },
    {
      label: 'Imperative navigation via ref',
      code: `const calendarRef = useRef<XDSCalendarHandle>(null);
<XDSCalendar ref={calendarRef} />
// Navigate programmatically:
calendarRef.current?.navigateTo("2026-06-01");`,
    },
  ],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<XDSCalendarHandle>',
      description:
        'Imperative handle exposing navigateTo(date) for programmatic month navigation.',
    },
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
      description:
        'Minimum selectable date. Nav buttons disable when at boundary.',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description:
        'Maximum selectable date. Nav buttons disable when at boundary.',
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
  accessibility: {
    keyboard: [
      {key: 'ArrowLeft', action: 'Move focus to previous day'},
      {key: 'ArrowRight', action: 'Move focus to next day'},
      {key: 'ArrowUp', action: 'Move focus to same day in previous week'},
      {key: 'ArrowDown', action: 'Move focus to same day in next week'},
      {key: 'Home', action: 'Move focus to first day in current row'},
      {key: 'End', action: 'Move focus to last day in current row'},
      {key: 'Ctrl+Home', action: 'Move focus to first day in grid'},
      {key: 'Ctrl+End', action: 'Move focus to last day in grid'},
      {
        key: 'PageUp',
        action: 'Navigate to same day in previous month',
      },
      {
        key: 'PageDown',
        action: 'Navigate to same day in next month',
      },
      {key: 'Enter/Space', action: 'Select the focused date'},
      {key: 'Escape', action: 'Cancel in-progress range selection'},
    ],
    roles: [
      'role="group" on root element with aria-label="Calendar"',
      'role="grid" on each month grid with aria-label for month/year',
      'role="row" on each week row',
      'role="columnheader" on day name headers',
      'role="gridcell" on each day cell',
      'role="heading" with aria-level=2 on month/year label',
      'aria-live="polite" region for month change announcements',
    ],
    notes: [
      'Uses roving tabindex: only one day per grid has tabindex=0 (selected > today > first enabled)',
      'Disabled days use aria-disabled (not HTML disabled) to maintain keyboard navigation',
      'Outside days are visually present but not selectable',
      'Navigation buttons disable at min/max boundaries',
    ],
  },
  theming: {
    targets: [{className: 'xds-calendar', visualProps: ['mode']}],
  },
  notes: [
    'ISODateString type: `${number}${number}${number}${number}-${number}${number}-${number}${number}`',
    'DayOfWeek type: 0 | 1 | 2 | 3 | 4 | 5 | 6',
    'DateRange interface: { start: ISODateString; end: ISODateString }',
    'XDSCalendarHandle interface: { navigateTo: (date: ISODateString) => void }',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Calendar',
  description: 'XDSCalendar 日历组件，支持单选和范围选择模式的日期选取。',
  features: [
    "选择模式：'single'（默认）和 'range'",
    '多月显示：并排显示 1 或 2 个月份',
    '日期约束：min、max 和自定义 dateConstraints 函数',
    '区域选项：weekStartsOn 可配置每周的起始日',
    '周数：可选的 ISO 周数列',
    '受控/非受控：通过 value/defaultValue 支持两种模式',
    '命令式导航：ref 暴露 navigateTo(date) 用于编程控制',
    '完整键盘导航：方向键、Home/End、PageUp/PageDown、Escape 取消范围选择',
    '无障碍：ARIA 网格模式，实时区域播报，漫游 tabindex',
  ],
  examples: [
    {
      label: '单日期选择',
      code: `<XDSCalendar
  value="2026-01-28"
  onChange={(value, valueAsDate) => console.log(value)}
/>`,
    },
    {
      label: '范围选择',
      code: `<XDSCalendar
  mode="range"
  value={{ start: "2026-01-28", end: "2026-02-05" }}
  onChange={(range) => console.log(range.start, range.end)}
/>`,
    },
    {
      label: '带约束的双月显示',
      code: `<XDSCalendar
  numberOfMonths={2}
  min="2026-01-01"
  max="2026-12-31"
  weekStartsOn={1}
/>`,
    },
    {
      label: '通过 ref 命令式导航',
      code: `const calendarRef = useRef<XDSCalendarHandle>(null);
<XDSCalendar ref={calendarRef} />
// 编程导航：
calendarRef.current?.navigateTo("2026-06-01");`,
    },
  ],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<XDSCalendarHandle>',
      description: '命令式句柄，暴露 navigateTo(date) 用于编程月份导航。',
    },
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
      description: '可选择的最早日期。导航按钮在边界处禁用。',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: '可选择的最晚日期。导航按钮在边界处禁用。',
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
  accessibility: {
    keyboard: [
      {key: 'ArrowLeft', action: '将焦点移至前一天'},
      {key: 'ArrowRight', action: '将焦点移至后一天'},
      {key: 'ArrowUp', action: '将焦点移至上一周同一天'},
      {key: 'ArrowDown', action: '将焦点移至下一周同一天'},
      {key: 'Home', action: '将焦点移至当前行第一天'},
      {key: 'End', action: '将焦点移至当前行最后一天'},
      {key: 'Ctrl+Home', action: '将焦点移至网格第一天'},
      {key: 'Ctrl+End', action: '将焦点移至网格最后一天'},
      {key: 'PageUp', action: '导航至上月同一天'},
      {key: 'PageDown', action: '导航至下月同一天'},
      {key: 'Enter/Space', action: '选择聚焦的日期'},
      {key: 'Escape', action: '取消进行中的范围选择'},
    ],
    roles: [
      'role="group" 在根元素上，带 aria-label="Calendar"',
      'role="grid" 在每个月网格上，带月份/年份的 aria-label',
      'role="row" 在每周行上',
      'role="columnheader" 在日名称标题上',
      'role="gridcell" 在每个日期单元格上',
      'role="heading" 带 aria-level=2 在月份/年份标签上',
      'aria-live="polite" 区域用于月份变更播报',
    ],
    notes: [
      '使用漫游 tabindex：每个网格仅一天有 tabindex=0（选中 > 今天 > 第一个可用）',
      '禁用日期使用 aria-disabled（非 HTML disabled）以保持键盘导航',
      '相邻月份日期可见但不可选',
      '导航按钮在 min/max 边界处禁用',
    ],
  },
  theming: {
    targets: [{className: 'xds-calendar', visualProps: ['mode']}],
  },
  notes: [
    'ISODateString 类型：`${number}${number}${number}${number}-${number}${number}-${number}${number}`',
    'DayOfWeek 类型：0 | 1 | 2 | 3 | 4 | 5 | 6',
    'DateRange 接口：{ start: ISODateString; end: ISODateString }',
    'XDSCalendarHandle 接口：{ navigateTo: (date: ISODateString) => void }',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'calendar for date selection w/ single+range modes',
  features: [
    'selection modes: single (default) + range',
    'multi-month: 1 or 2 side by side',
    'date constraints: min, max, custom dateConstraints fns',
    'weekStartsOn for configurable first day of week',
    'optional ISO week number column',
    'controlled/uncontrolled via value/defaultValue',
    'imperative navigateTo via ref',
    'full keyboard nav: arrows, Home/End, PageUp/Down, Escape',
    'ARIA grid pattern w/ live region + roving tabindex',
  ],
  notes: [
    'ISODateString type: YYYY-MM-DD template literal',
    'DayOfWeek type: 0|1|2|3|4|5|6',
    'DateRange: { start: ISODateString; end: ISODateString }',
    'XDSCalendarHandle: { navigateTo: (date) => void }',
  ],
  propDescriptions: {
    ref: 'imperative handle for navigateTo',
    mode: 'selection mode',
    value: 'controlled selected value',
    defaultValue: 'uncontrolled default value',
    onChange: 'selection callback',
    numberOfMonths: 'months to display',
    min: 'minimum selectable date (disables nav at boundary)',
    max: 'maximum selectable date (disables nav at boundary)',
    dateConstraints: 'custom constraint fns',
    focusDate: 'controlled visible month',
    onFocusDateChange: 'navigation callback',
    hasOutsideDays: 'show days from adjacent months',
    hasWeekNumbers: 'show ISO week numbers',
    hasVariableRowCount: 'variable vs fixed 6-row grid',
    weekStartsOn: 'first day of week (0=Sunday)',
  },
};
