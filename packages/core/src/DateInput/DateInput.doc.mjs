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
    'Tab moves between input and calendar icon button; Enter/Space on icon opens the calendar and moves focus into it; Escape closes the calendar popover; Arrow keys navigate between days; Page Up/Down navigate between months.',
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
export const docsZh = {...docs};
