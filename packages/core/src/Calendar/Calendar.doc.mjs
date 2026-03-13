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
    ],
  },
  notes: [
    'ISODateString type: `${number}${number}${number}${number}-${number}${number}-${number}${number}`',
    'DayOfWeek type: 0 | 1 | 2 | 3 | 4 | 5 | 6',
    'DateRange interface: { start: ISODateString; end: ISODateString }',
  ],
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
    ],
  },
  notes: [
    'ISODateString 类型：`${number}${number}${number}${number}-${number}${number}-${number}${number}`',
    'DayOfWeek 类型：0 | 1 | 2 | 3 | 4 | 5 | 6',
    'DateRange 接口：{ start: ISODateString; end: ISODateString }',
  ],
};

/** @type {string} */
export const docsDense = `import{XDSCalendar}from'@xds/core/Calendar' //date selection, single + range modes
P mode:'single' | 'range'='single' selection mode
P value:ISODateString | DateRange controlled value | defaultValue:ISODateString | DateRange uncontrolled default
P onChange:Function selection callback
P numberOfMonths:1 | 2='1' months displayed side by side
P min:ISODateString minimum selectable date | max:ISODateString maximum selectable date
P dateConstraints:Array<(date: Date) => boolean> custom constraint fns
P focusDate:ISODateString controlled visible month | onFocusDateChange:(focusDate: ISODateString) => void nav callback
P hasOutsideDays:boolean='true' show adjacent month days | hasWeekNumbers:boolean='false' ISO week numbers
P hasVariableRowCount:boolean='false' variable vs fixed 6-row grid | weekStartsOn:0 | 1 | 2 | 3 | 4 | 5 | 6='0' first day (0=Sunday)
X <XDSCalendar value="2026-01-28" onChange={(value, valueAsDate) => console.log(value)} />
X <XDSCalendar mode="range" value={{ start: "2026-01-28", end: "2026-02-05" }} onChange={(range) => console.log(range.start, range.end)} />
X <XDSCalendar numberOfMonths={2} min="2026-01-01" max="2026-12-31" weekStartsOn={1} />
N ISODateString type: \`\${number}\${number}\${number}\${number}-\${number}\${number}-\${number}\${number}\`|DayOfWeek type: 0 | 1 | 2 | 3 | 4 | 5 | 6|DateRange interface: { start: ISODateString; end: ISODateString }|single (default) + range selection modes|multi-month: 1 or 2 side by side|date constraints: min, max, custom fns|weekStartsOn for configurable first day|optional ISO week number column|controlled/uncontrolled via value/defaultValue`;
