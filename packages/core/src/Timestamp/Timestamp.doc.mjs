// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Timestamp',
  displayName: 'Timestamp',
  category: 'Content',
  keywords: ['date', 'time', 'datetime', 'relative', 'ago', 'clock', 'format', 'duration'],
  playground: {
    // `value` is required but has no semantic default, so the properties-tab
    // preview fell back to the literal string "value" — which
    // `new Date("value")` rejects, crashing the preview with "Invalid time
    // value". Seed a valid ISO 8601 date so the interactive preview renders.
    defaults: {
      value: '2026-02-19T17:00:00Z',
    },
  },
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
        'Whether the relative time should update live (e.g. "2 min ago" \u2192 "3 min ago").',
      default: 'false',
    },
    {
      name: 'type',
      type: 'TextType',
      description: 'Semantic text type from Text. Determines size, weight, and line-height.',
      default: "'supporting'",
    },
    {
      name: 'size',
      type: 'TextSize',
      description: 'Explicit font size override. Overrides the size from type.',
    },
    {
      name: 'color',
      type: 'TextColor',
      description: 'Text color.',
      default: "'secondary'",
    },
    {
      name: 'weight',
      type: 'TextWeight',
      description: 'Font weight override.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-timestamp', visualProps: ['type', 'color']},
    ],
  },
  usage: {
    description:
      'Timestamp formats a date or time value into human-readable text. Use it to show when something was created, updated, or is scheduled; picking relative for recency, absolute for precision, or auto to let the component decide.',
    bestPractices: [
      {guidance: true, description: 'Use the auto format in feeds and lists so recent items show "2 hours ago" and older items show the full date automatically.'},
      {guidance: true, description: 'Keep formatting consistent within the same list or table; mixing relative and absolute timestamps in the same column confuses scanning.'},
      {guidance: true, description: 'Enable isTimezoneShown when the audience spans multiple time zones, like a global team calendar or audit log.'},
      {guidance: true, description: 'Use isLive for active dashboards or real-time feeds so the relative time stays accurate without a page refresh.'},
      {guidance: false, description: 'Don\'t display raw Unix timestamps or ISO strings to users; always pass them through Timestamp to get a human-readable format.'},
      {guidance: false, description: 'Avoid system_date or system_time formats in user-facing UI; they are meant for developer tools, logs, and machine-readable contexts.'},
      {guidance: false, description: 'Don\'t disable the tooltip on relative timestamps; users expect to hover for the full date when they see "3 hours ago".'},
    ],
    anatomy: [
      {name: 'Formatted text', required: true, description: 'The rendered date, time, or relative label like "2 hours ago" or "Mar 21, 2025".'},
      {name: 'Tooltip', required: false, description: 'A hover card showing the full absolute date and time when the display is relative.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  propDescriptions: {
    value: '\u8981\u663e\u793a\u7684\u65e5\u671f/\u65f6\u95f4\u3002\u63a5\u53d7 Unix \u65f6\u95f4\u6233\uff08\u79d2\uff09\u6216 ISO 8601 \u5b57\u7b26\u4e32\u3002',
    format: "\u663e\u793a\u683c\u5f0f\u3002'relative' \u663e\u793a '2\u5c0f\u65f6\u524d'\uff0c'date' \u663e\u793a\u65e5\u671f\uff0c'auto' \u6839\u636e\u65f6\u95f4\u8fdc\u8fd1\u81ea\u52a8\u5207\u6362\u3002",
    autoThreshold: "auto \u683c\u5f0f\u4ece\u76f8\u5bf9\u65f6\u95f4\u5207\u6362\u5230 date_time \u7684\u9608\u503c\u79d2\u6570\u3002",
    hasTooltip: '\u60ac\u505c\u65f6\u662f\u5426\u663e\u793a\u5305\u542b\u5b8c\u6574\u65e5\u671f/\u65f6\u95f4\u7684\u5de5\u5177\u63d0\u793a\uff08\u76f8\u5bf9\u65f6\u95f4\u6a21\u5f0f\uff09\u3002',
    isTimezoneShown: '\u662f\u5426\u9644\u52a0\u65f6\u533a\u7f29\u5199\u3002',
    isLive: '\u76f8\u5bf9\u65f6\u95f4\u662f\u5426\u5b9e\u65f6\u66f4\u65b0\u3002',
    type: '\u6765\u81ea Text \u7684\u8bed\u4e49\u6587\u672c\u7c7b\u578b\u3002',
    size: '\u663e\u5f0f\u5b57\u4f53\u5927\u5c0f\u8986\u76d6\u3002',
    color: '\u6587\u5b57\u989c\u8272\u3002',
    weight: '\u5b57\u4f53\u7c97\u7ec6\u8986\u76d6\u3002',
  },
  usage: {
    description:
      'Timestamp formats a date or time value into human-readable text. Use it to show when something was created, updated, or is scheduled; picking relative for recency, absolute for precision, or auto to let the component decide.',
    bestPractices: [
      {guidance: true, description: 'Use the auto format in feeds and lists so recent items show "2 hours ago" and older items show the full date automatically.'},
      {guidance: true, description: 'Keep formatting consistent within the same list or table; mixing relative and absolute timestamps in the same column confuses scanning.'},
      {guidance: true, description: 'Enable isTimezoneShown when the audience spans multiple time zones, like a global team calendar or audit log.'},
      {guidance: true, description: 'Use isLive for active dashboards or real-time feeds so the relative time stays accurate without a page refresh.'},
      {guidance: false, description: 'Don\'t display raw Unix timestamps or ISO strings to users; always pass them through Timestamp to get a human-readable format.'},
      {guidance: false, description: 'Avoid system_date or system_time formats in user-facing UI; they are meant for developer tools, logs, and machine-readable contexts.'},
      {guidance: false, description: 'Don\'t disable the tooltip on relative timestamps; users expect to hover for the full date when they see "3 hours ago".'},
    ],
    anatomy: [
      {name: 'Formatted text', required: true, description: 'The rendered date, time, or relative label like "2 hours ago" or "Mar 21, 2025".'},
      {name: 'Tooltip', required: false, description: 'A hover card showing the full absolute date and time when the display is relative.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'formatted timestamp with relative/absolute/auto modes, live updates, timezone display',
  usage: {
    description:
      'Timestamp formats a date or time into readable text. Use for creation dates, update times, or schedules; relative for recency, absolute for precision, auto to switch automatically.',
    bestPractices: [
      {guidance: true, description: 'Auto format in feeds and lists; recent shows relative, older shows date_time.'},
      {guidance: true, description: 'Consistent formatting within the same list or table column.'},
      {guidance: true, description: 'isTimezoneShown for multi-timezone audiences.'},
      {guidance: true, description: 'isLive for dashboards so relative time stays current.'},
      {guidance: false, description: 'Don\'t show raw Unix timestamps or ISO strings; always use Timestamp.'},
      {guidance: false, description: 'Avoid system_* formats in user-facing UI; those are for dev tools and logs.'},
      {guidance: false, description: 'Don\'t disable tooltip on relative timestamps; users expect the full date on hover.'},
    ],
  },
  propDescriptions: {
    value: 'date/time as unix seconds or ISO string',
    format: "display mode: 'relative', 'auto', 'date', 'date_time', 'time', 'system_date', 'system_date_time', 'system_time'",
    autoThreshold: 'seconds threshold for auto relative\u2192date_time switch',
    hasTooltip: 'show full time tooltip on hover (relative mode)',
    isTimezoneShown: 'append timezone abbreviation',
    isLive: 'live-update relative time',
    type: 'Text semantic type',
    size: 'font size override',
    color: 'text color',
    weight: 'font weight override',
  },
};
