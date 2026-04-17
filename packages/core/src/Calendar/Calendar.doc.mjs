/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Calendar',
  keywords: ["calendar","datepicker","date picker","rangepicker","date range","monthview","daypicker"],
  usage: {
    description:
      'Calendar displays a month-view grid for selecting dates, supporting single and range selection modes. Use when users need to pick a specific date or date range within a constrained set of options.',
    bestPractices: [
      {guidance: true, description: 'Set min and max dates to constrain selection to a valid range for the task.'},
      {guidance: true, description: 'Use range mode for start/end date scenarios like booking or scheduling.'},
      {guidance: false, description: 'Use a calendar for selecting dates far in the past or future — prefer a date input for open-ended entry.'},
      {guidance: false, description: 'Disable large blocks of dates without explaining why they are unavailable.'},
    ],
  },
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
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Calendar',
  usage: {
    description:
      'Calendar displays a month-view grid for selecting dates, supporting single and range selection modes. Use when users need to pick a specific date or date range within a constrained set of options.',
    bestPractices: [
      {guidance: true, description: 'Set min and max dates to constrain selection to a valid range for the task.'},
      {guidance: true, description: 'Use range mode for start/end date scenarios like booking or scheduling.'},
      {guidance: false, description: 'Use a calendar for selecting dates far in the past or future — prefer a date input for open-ended entry.'},
      {guidance: false, description: 'Disable large blocks of dates without explaining why they are unavailable.'},
    ],
  },
  props: [
    {name: 'mode', type: "'single' | 'range'", description: '选择模式。', default: "'single'"},
    {name: 'value', type: 'ISODateString | DateRange', description: '受控选中值。'},
    {name: 'defaultValue', type: 'ISODateString | DateRange', description: '非受控默认值。'},
    {name: 'onChange', type: 'Function', description: '选择回调函数。'},
    {name: 'numberOfMonths', type: '1 | 2', description: '显示的月份数量。', default: '1'},
    {name: 'min', type: 'ISODateString', description: '可选择的最早日期。'},
    {name: 'max', type: 'ISODateString', description: '可选择的最晚日期。'},
    {name: 'dateConstraints', type: 'Array<(date: Date) => boolean>', description: '自定义约束函数。'},
    {name: 'focusDate', type: 'ISODateString', description: '受控可见月份。'},
    {name: 'onFocusDateChange', type: '(focusDate: ISODateString) => void', description: '导航回调函数。'},
    {name: 'hasOutsideDays', type: 'boolean', description: '显示相邻月份的日期。', default: 'true'},
    {name: 'hasWeekNumbers', type: 'boolean', description: '显示 ISO 周数。', default: 'false'},
    {name: 'hasVariableRowCount', type: 'boolean', description: '可变行数与固定 6 行网格。', default: 'false'},
    {name: 'weekStartsOn', type: '0 | 1 | 2 | 3 | 4 | 5 | 6', description: '每周起始日（0=周日）。', default: '0'},
  ],
  theming: {
    targets: [
      {
        className: 'xds-calendar',
        visualProps: [
          'mode',
        ],
      },
      {
        className: 'xds-calendar-day',
        states: [
          'selected',
          'today',
          'disabled',
          'in-range',
        ],
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'calendar for date selection w/ single+range modes',
  usage: {
    description:
      'Calendar displays a month-view grid for selecting dates, supporting single and range selection modes. Use when users need to pick a specific date or date range within a constrained set of options.',
    bestPractices: [
      {guidance: true, description: 'Set min and max dates to constrain selection to a valid range for the task.'},
      {guidance: true, description: 'Use range mode for start/end date scenarios like booking or scheduling.'},
      {guidance: false, description: 'Use a calendar for selecting dates far in the past or future — prefer a date input for open-ended entry.'},
      {guidance: false, description: 'Disable large blocks of dates without explaining why they are unavailable.'},
    ],
  },
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
