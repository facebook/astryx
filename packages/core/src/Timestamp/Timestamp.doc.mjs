/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Timestamp',
  keywords: ['date', 'time', 'datetime', 'relative', 'ago', 'clock', 'format', 'duration'],
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
  theming: {
    targets: [
      {className: 'xds-timestamp', visualProps: ['format']},
    ],
  },
  usage: {
    description:
      'Timestamp displays a date or time value as human-readable text with optional tooltip and live updates. Use it to show when content was created, updated, or is scheduled, choosing a format that fits the context — relative for recency, absolute for precision.',
    bestPractices: [
      { guidance: true, description: 'Use the auto format to let the component switch between relative and absolute based on recency.' },
      { guidance: true, description: 'Keep timestamp formatting consistent within the same view or list to avoid confusion.' },
      { guidance: false, description: 'Display raw Unix timestamps or ISO strings directly — use Timestamp to format them for users.' },
    ],
    anatomy: [
      {name: 'Time or Duration Value', required: true, description: 'The displayed time, date, or duration text.'},
      {name: 'Hover Indication', required: false, description: 'Visual cue indicating additional detail is available on hover.'},
      {name: 'Hover Card', required: false, description: 'Floating card showing timezone, full date, or additional details on hover.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  propDescriptions: {
    value: '要显示的日期/时间。接受 Unix 时间戳（秒）或 ISO 8601 字符串。',
    format: "显示格式。'relative' 显示 '2小时前'，'date' 显示日期，'auto' 根据时间近远自动切换。",
    autoThreshold: "auto 格式从相对时间切换到 date_time 的阈值秒数。",
    hasTooltip: '悬停时是否显示包含完整日期/时间的工具提示（相对时间模式）。',
    isTimezoneShown: '是否附加时区缩写。',
    isLive: '相对时间是否实时更新。',
    type: '来自 XDSText 的语义文本类型。',
    size: '显式字体大小覆盖。',
    color: '文字颜色。',
    weight: '字体粗细覆盖。',
  },
  usage: {
    description:
      'Timestamp displays a date or time value as human-readable text with optional tooltip and live updates. Use it to show when content was created, updated, or is scheduled, choosing a format that fits the context — relative for recency, absolute for precision.',
    bestPractices: [
      { guidance: true, description: 'Use the auto format to let the component switch between relative and absolute based on recency.' },
      { guidance: true, description: 'Keep timestamp formatting consistent within the same view or list to avoid confusion.' },
      { guidance: false, description: 'Display raw Unix timestamps or ISO strings directly — use Timestamp to format them for users.' },
    ],
    anatomy: [
      {name: 'Time or Duration Value', required: true, description: 'The displayed time, date, or duration text.'},
      {name: 'Hover Indication', required: false, description: 'Visual cue indicating additional detail is available on hover.'},
      {name: 'Hover Card', required: false, description: 'Floating card showing timezone, full date, or additional details on hover.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'formatted timestamp display with relative/absolute/auto modes via XDSText',
  usage: {
    description:
      'Timestamp displays a date or time value as human-readable text with optional tooltip and live updates. Use it to show when content was created, updated, or is scheduled, choosing a format that fits the context — relative for recency, absolute for precision.',
    bestPractices: [
      { guidance: true, description: 'Use the auto format to let the component switch between relative and absolute based on recency.' },
      { guidance: true, description: 'Keep timestamp formatting consistent within the same view or list to avoid confusion.' },
      { guidance: false, description: 'Display raw Unix timestamps or ISO strings directly — use Timestamp to format them for users.' },
    ],
    anatomy: [
      {name: 'Time or Duration Value', required: true, description: 'The displayed time, date, or duration text.'},
      {name: 'Hover Indication', required: false, description: 'Visual cue indicating additional detail is available on hover.'},
      {name: 'Hover Card', required: false, description: 'Floating card showing timezone, full date, or additional details on hover.'},
    ],
  },
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
