// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Calendar',
  displayName: 'Calendar',
  category: 'Data Input',
  keywords: ["calendar","datepicker","date picker","rangepicker","date range","monthview","daypicker"],
  usage: {
    description:
      'Calendar lets the user pick a date or date range from a month grid. Use it in booking flows, scheduling UIs, date filters, or anywhere the user needs to see surrounding dates for context.',
    bestPractices: [
      {guidance: true, description: 'Set min and max dates to limit selection to a valid window, like only future dates for a booking or the current quarter for a report.'},
      {guidance: true, description: 'Use range mode when the user needs to pick a start and end date, like a trip or a time-off request.'},
      {guidance: true, description: 'Use dateConstraints to disable specific dates like weekends or holidays, and explain why they are unavailable.'},
      {guidance: true, description: 'Show two months side by side when the user frequently selects dates that span a month boundary.'},
      {guidance: false, description: 'Use a calendar for dates far in the past or future like a birth date. A text input is faster for open-ended entry.'},
      {guidance: false, description: 'Disable large blocks of dates without context. The user should understand why dates are unavailable.'},
    ],
    anatomy: [
      {name: 'Month header', required: true, description: 'The month name and year with navigation arrows to move between months.'},
      {name: 'Day grid', required: true, description: 'A 7-column grid of days with column headers for the day names.'},
      {name: 'Selected day', required: false, description: 'The currently selected date, highlighted. In range mode, the start and end dates plus the days between them.'},
      {name: 'Today marker', required: false, description: 'A subtle indicator on the current date for orientation.'},
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
      name: 'handleRef',
      type: 'React.Ref<CalendarHandle>',
      description: 'Imperative handle for calendar navigation, including navigateTo().',
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
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description: 'First day of week. Accepts a number (0=Sunday) or a three-letter day name (e.g. "mon").',
      default: '0',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-calendar', visualProps: ['mode']},
      {className: 'astryx-calendar-day', states: ['selected', 'today', 'disabled', 'in-range']},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Calendar',
  displayName: 'Calendar',
  usage: {
    description:
      'Calendar lets the user pick a date or date range from a month grid. Use it in booking flows, scheduling UIs, date filters, or anywhere the user needs to see surrounding dates for context.',
    bestPractices: [
      {guidance: true, description: 'Set min and max dates to limit selection to a valid window, like only future dates for a booking or the current quarter for a report.'},
      {guidance: true, description: 'Use range mode when the user needs to pick a start and end date, like a trip or a time-off request.'},
      {guidance: true, description: 'Use dateConstraints to disable specific dates like weekends or holidays, and explain why they are unavailable.'},
      {guidance: true, description: 'Show two months side by side when the user frequently selects dates that span a month boundary.'},
      {guidance: false, description: 'Use a calendar for dates far in the past or future like a birth date. A text input is faster for open-ended entry.'},
      {guidance: false, description: 'Disable large blocks of dates without context. The user should understand why dates are unavailable.'},
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
    {name: 'handleRef', type: 'React.Ref<CalendarHandle>', description: '日历导航的命令式句柄，包括 navigateTo()。'},
    {name: 'hasOutsideDays', type: 'boolean', description: '显示相邻月份的日期。', default: 'true'},
    {name: 'hasWeekNumbers', type: 'boolean', description: '显示 ISO 周数。', default: 'false'},
    {name: 'hasVariableRowCount', type: 'boolean', description: '可变行数与固定 6 行网格。', default: 'false'},
    {name: 'weekStartsOn', type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun'…'sat'", description: '每周起始日。可为数字（0=周日）或三字母星期缩写（如 "mon"）。', default: '0'},
  ],
  theming: {
    targets: [
      {
        className: 'astryx-calendar',
        visualProps: [
          'mode',
        ],
      },
      {
        className: 'astryx-calendar-day',
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
  description: 'month grid for picking a date or date range',
  usage: {
    description:
      'Calendar lets the user pick a date or date range from a month grid. Use in booking, scheduling, date filters.',
    bestPractices: [
      {guidance: true, description: 'Set min/max to limit selection to a valid window: only future dates for booking, current quarter for a report.'},
      {guidance: true, description: 'Use range mode when user picks start + end dates: trip, time-off request.'},
      {guidance: true, description: 'Use dateConstraints to disable specific dates (weekends/holidays); explain why unavailable.'},
      {guidance: true, description: 'Show two months side by side when user frequently selects dates spanning a month boundary.'},
      {guidance: false, description: 'Use for dates far in the past/future; text input is faster.'},
      {guidance: false, description: 'Disable dates without explaining why.'},
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
    handleRef: 'imperative navigation handle',
    hasOutsideDays: 'show days from adjacent months',
    hasWeekNumbers: 'show ISO week numbers',
    hasVariableRowCount: 'variable vs fixed 6-row grid',
    weekStartsOn: 'first day of week (0=Sunday, or name e.g. "mon")',
  },
};
