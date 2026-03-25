/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Timestamp',
  description:
    'Displays a formatted timestamp as human-readable text with optional tooltip and live updates. Renders via XDSText for consistent typography.',
  props: [
    {
      name: 'value',
      type: 'string | number',
      description:
        'The date/time to display. Accepts Unix timestamps (seconds) or ISO 8601 strings.',
      required: true,
    },
    {
      name: 'format',
      type: "'relative' | 'auto' | 'date' | 'date_time' | 'time' | 'system_date' | 'system_date_time' | 'system_time'",
      description:
        "Display format. 'relative' shows '2 hours ago', 'date' shows 'Mar 21, 2025', 'date_time' shows 'Mar 21, 2025, 2:51 PM', 'time' shows '2:51 PM', 'system_*' variants use ISO-style formatting, 'auto' switches from relative to date_time based on recency.",
      default: "'auto'",
    },
    {
      name: 'autoThreshold',
      type: 'number',
      description:
        "Threshold in seconds for 'auto' format to switch from relative to date_time.",
      default: '604800',
    },
    {
      name: 'hasTooltip',
      type: 'boolean',
      description:
        'Whether to show a tooltip with the full date/time on hover when displaying relative time.',
      default: 'true',
    },
    {
      name: 'isTimezoneShown',
      type: 'boolean',
      description:
        'Whether to append the timezone abbreviation. Applies to date_time, time, system_date_time, and system_time formats.',
      default: 'false',
    },
    {
      name: 'isLive',
      type: 'boolean',
      description:
        'Whether the relative time should update live (e.g. "2 min ago" → "3 min ago").',
      default: 'false',
    },
    {
      name: 'type',
      type: 'XDSTextType',
      description: 'Semantic text type from XDSText. Determines size, weight, and line-height.',
      default: "'supporting'",
    },
    {
      name: 'size',
      type: 'XDSTextSize',
      description: 'Explicit font size override. Overrides the size from type.',
    },
    {
      name: 'color',
      type: 'XDSTextColor',
      description: 'Text color.',
      default: "'secondary'",
    },
    {
      name: 'weight',
      type: 'XDSTextWeight',
      description: 'Font weight override.',
    },
  ],
  features: [
    "Formats: 'relative', 'date', 'date_time', 'time', 'system_date', 'system_date_time', 'system_time', 'auto'",
    'Live updates: opt-in timer that adjusts frequency based on age',
    'Tooltip: shows full date/time on hover for relative timestamps',
    'Semantic HTML: renders <time> with ISO 8601 datetime attribute',
    'Typography: delegates to XDSText for consistent sizing and color',
    "System formats: ISO-style dates/times for databases and logs",
  ],
  examples: [
    {
      label: 'Auto format (default)',
      code: '<XDSTimestamp value="2026-03-25T12:00:00Z" />',
    },
    {
      label: 'Relative format',
      code: '<XDSTimestamp value={Date.now() / 1000 - 3600} format="relative" />',
    },
    {
      label: 'Date only',
      code: '<XDSTimestamp value="2026-02-19T17:00:00Z" format="date" />',
    },
    {
      label: 'Date and time',
      code: '<XDSTimestamp value="2026-02-19T17:00:00Z" format="date_time" />',
    },
    {
      label: 'Time only',
      code: '<XDSTimestamp value="2026-02-19T17:00:00Z" format="time" />',
    },
    {
      label: 'System date/time',
      code: '<XDSTimestamp value="2026-02-19T17:00:00Z" format="system_date_time" type="code" />',
    },
    {
      label: 'Live updating',
      code: '<XDSTimestamp value={Date.now() / 1000 - 120} format="relative" isLive />',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-timestamp', visualProps: ['type', 'color']},
    ],
  },
  accessibility: [
    'Renders as <time datetime="..."> with ISO 8601 datetime attribute for machines.',
    'Sets aria-label with full absolute time when displaying relative format.',
    'Tooltip is keyboard accessible via focus.',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'formatted timestamp display with relative/absolute/auto modes via XDSText',
  propDescriptions: {
    value: 'date/time as unix seconds or ISO string',
    format: "display mode: 'relative', 'auto', 'date', 'date_time', 'time', 'system_date', 'system_date_time', 'system_time'",
    autoThreshold: 'seconds threshold for auto relative→date_time switch',
    hasTooltip: 'show full time tooltip on hover (relative mode)',
    isTimezoneShown: 'append timezone abbreviation',
    isLive: 'live-update relative time',
    type: 'XDSText semantic type',
    size: 'font size override',
    color: 'text color',
    weight: 'font weight override',
  },
};
