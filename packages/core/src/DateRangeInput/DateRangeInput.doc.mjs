// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DateRangeInput',
  displayName: 'Date Range Input',
  group: 'DateInput',
  category: 'Inputs',
  keywords: ["daterangepicker","daterange","range","calendar","filter","analytics","period","schedule"],
  props: [
    { name: 'label', type: 'string', description: 'Label text.', required: true },
    { name: 'isLabelHidden', type: 'boolean', description: 'Visually hide the label.', default: 'false' },
    { name: 'description', type: 'string', description: 'Helper text displayed below the label.' },
    { name: 'isOptional', type: 'boolean', description: 'Show an "(optional)" indicator.', default: 'false' },
    { name: 'isRequired', type: 'boolean', description: 'Mark the field as required.', default: 'false' },
    { name: 'isDisabled', type: 'boolean', description: 'Disable the trigger and picker.', default: 'false' },
    { name: 'value', type: 'XDSDateRange | null', description: 'Selected date range ({start, end} in ISO format), or null.', required: true },
    { name: 'onChange', type: '(value: XDSDateRange | null) => void', description: 'Callback when the range changes. Called with null on clear.', required: true },
    { name: 'changeAction', type: '(value: XDSDateRange | null) => void | Promise<void>', description: 'Async action fired after onChange. Drives optimistic UI updates via useTransition.' },
    { name: 'isLoading', type: 'boolean', description: 'Whether the input is in a loading state. Disables interaction and shows a spinner.', default: 'false' },
    { name: 'min', type: 'ISODateString', description: 'Minimum selectable date.' },
    { name: 'max', type: 'ISODateString', description: 'Maximum selectable date.' },
    { name: 'dateConstraints', type: 'Array<(date: Date) => boolean>', description: 'Custom constraint functions to disable specific dates.' },
    { name: 'presets', type: 'Array<XDSDateRangePreset>', description: 'Preset ranges shown as quick-select options beside the calendar.' },
    { name: 'hasClear', type: 'boolean', description: 'Shows a clear button when a range is selected.', default: 'true' },
    { name: 'placeholder', type: 'string', description: 'Placeholder text when no range is selected.', default: "'Select date range'" },
    { name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Size of the trigger.', default: "'md'" },
    { name: 'status', type: 'XDSInputStatus', description: 'Status indicator for error, warning, or success states.' },
    { name: 'labelTooltip', type: 'string', description: 'Tooltip text via info icon at label end.' },
    { name: 'numberOfMonths', type: '1 | 2', description: 'Number of months in the calendar.', default: '2' },
    { name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization.' },
  ],
  theming: {
    targets: [
      { className: 'xds-date-range-input', visualProps: ['size', 'status'] },
    ],
  },
  usage: {
    description: 'DateRangeInput lets users select a start and end date from a dual-month calendar popover. Use it for filtering data by time period, report generation, analytics dashboards, and booking flows.',
    bestPractices: [
      { guidance: true, description: 'Use presets for common ranges like "Last 7 days" to speed up selection.' },
      { guidance: true, description: 'Use min/max to constrain selectable dates to valid ranges.' },
      { guidance: true, description: 'Keep hasClear enabled (default) so users can reset the filter.' },
      { guidance: true, description: 'Provide clear labels and descriptions so users understand what the range controls.' },
      { guidance: false, description: 'Use DateRangeInput when only a single date is needed — use DateInput instead.' },
      { guidance: false, description: 'Hide the label without surrounding context that makes the purpose obvious.' },
    ],
    anatomy: [
      { name: 'Label', required: true, description: 'Text above the trigger describing what date range is expected.' },
      { name: 'Trigger button', required: true, description: 'A button showing the formatted range or placeholder. Clicking opens the popover.' },
      { name: 'Calendar icon', required: true, description: 'A trailing icon that also opens the popover.' },
      { name: 'Calendar popover', required: true, description: 'A dual-month calendar grid with range selection and hover preview.' },
      { name: 'Preset sidebar', required: false, description: 'A list of preset range options beside the calendar.' },
      { name: 'Clear button', required: false, description: 'A × button that resets the range to null.' },
      { name: 'Status message', required: false, description: 'An error, warning, or success message below the trigger.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'date range picker with dual-month calendar popover and preset ranges',
  usage: {
    description: 'DateRangeInput lets users select start+end dates from a dual-month calendar. Use for filtering, reports, analytics, and booking.',
    bestPractices: [
      { guidance: true, description: 'Use presets for common ranges. Use min/max for constraints.' },
      { guidance: true, description: 'Keep hasClear enabled. Provide clear labels.' },
      { guidance: false, description: 'Use for single dates (use DateInput). Hide label without context.' },
    ],
  },
  propDescriptions: {
    label: 'label text',
    isLabelHidden: 'visually hide label',
    description: 'helper text below label',
    isOptional: 'show "(optional)" indicator',
    isRequired: 'mark field required',
    isDisabled: 'disable trigger+picker',
    value: 'selected range {start, end} or null',
    onChange: 'callback on range change; null on clear',
    min: 'min selectable date',
    max: 'max selectable date',
    dateConstraints: 'custom constraint fns to disable dates',
    presets: 'preset ranges as quick-select options',
    hasClear: 'clear button when range is set (default true)',
    placeholder: 'placeholder when empty',
    size: 'trigger size',
    status: 'error/warning/success status',
    labelTooltip: 'tooltip via info icon at label end',
    numberOfMonths: 'months in calendar (default 2)',
    xstyle: 'StyleX styles for layout',
  },
};
