/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TimeInput',
  description:
    'Time input with free-text entry, text parsing, and arrow-key navigation.',
  features: [
    'Accepts free-text time entry and parses common formats (e.g. "2:30 PM", "14:30")',
    'Supports 12-hour and 24-hour display formats',
    'Arrow-up / arrow-down adjust the time by a configurable minute increment',
    'Optional seconds display via hasSeconds',
    'Optional clear button via hasClear',
    'Min / max range constraints reject out-of-range values',
    'Async action support via onChangeAction with optimistic UI and loading spinner',
    'Accessible — label, description, and status message are wired to aria-describedby; aria-required and aria-invalid reflect field state',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSTimeInput
  label="Start time"
  value={time}
  onChange={setTime}
/>`,
    },
    {
      label: '24-hour format with clear button',
      code: `<XDSTimeInput
  label="Meeting time"
  value={time}
  onChange={setTime}
  hourFormat="24h"
  hasClear
/>`,
    },
    {
      label: 'Min / max constraints',
      code: `<XDSTimeInput
  label="Business hours"
  value={time}
  onChange={setTime}
  min="09:00"
  max="17:00"
/>`,
    },
    {
      label: 'With seconds and error status',
      code: `<XDSTimeInput
  label="Precise time"
  value={time}
  onChange={setTime}
  hasSeconds
  status={{type: 'error', message: 'Invalid time'}}
/>`,
    },
    {
      label: 'Async action with optimistic update',
      code: `<XDSTimeInput
  label="Scheduled time"
  value={time}
  onChange={setTime}
  onChangeAction={async (value) => {
    await saveTime(value);
  }}
/>`,
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the input (required for accessibility).',
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
      name: 'onChangeAction',
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
  ],
  theming: {
    targets: [
      {className: 'xds-date-input', visualProps: ['size']},
    ],
  },
  accessibility: [
    'The visible label is associated with the input via htmlFor / id.',
    'isLabelHidden visually hides the label while keeping it in the accessibility tree.',
    'description and status.message are linked to the input via aria-describedby.',
    'aria-required is set when isRequired is true.',
    'aria-invalid is set when status.type is "error".',
    'aria-busy reflects the loading / optimistic-pending state.',
    'The clear button has an explicit aria-label of "Clear time".',
  ],
  keyboard:
    'ArrowUp / ArrowDown adjust the current time by the configured increment in minutes. Typing a time string in common formats (e.g. "2:30 PM", "14:30") is parsed on blur. Pressing the clear button returns focus to the input.',
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
