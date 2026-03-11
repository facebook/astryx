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
export const docsZh = {...docs};
