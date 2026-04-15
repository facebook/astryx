/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Timestamp',
  description:
    'Displays a formatted timestamp as human-readable text with optional tooltip and live updates. Renders via XDSText for consistent typography.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSTimestamp date={new Date()} />',
  },
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
  features: [
    "Formats: 'relative', 'date', 'date_time', 'time', 'system_date', 'system_date_time', 'system_time', 'auto'",
    'Live updates: opt-in timer that adjusts frequency based on age',
    'Tooltip: shows full date/time on hover for relative timestamps',
    'Semantic HTML: renders <time> with ISO 8601 datetime attribute',
    'Typography: delegates to XDSText for consistent sizing and color',
    "System formats: ISO-style dates/times for databases and logs",
  ],  theming: {
    targets: [
      {className: 'xds-timestamp', visualProps: ['type', 'color']},
    ],
  },
  accessibility: [
    'Renders as <time datetime="..."> with ISO 8601 datetime attribute for machines.',
    'Sets aria-label with full absolute time when displaying relative format.',
    'Tooltip is keyboard accessible via focus.',
  ],
  usage: {
    summary: 'Displays the absolute or relative date and time of an event or its duration.',
    content: `## When to use

- Showing an exact date and time (absolute format).
- Indicating freshness with an "ago" format (relative).
- Displaying event duration.

## Best practices

- Do: Choose a format that fits the context (absolute for precision, relative for recency).
- Do: Ensure consistent timestamp formatting within the same view.
- Do: Use a single time unit for table column displays.
- Do: Provide tooltips with additional detail such as timezone or full date.`,
    anatomy: [
      {name: 'Time or Duration Value', required: true, description: 'The displayed time, date, or duration text.'},
      {name: 'Hover Indication', required: false, description: 'Visual cue indicating additional detail is available on hover.'},
      {name: 'Hover Card', required: false, description: 'Floating card showing timezone, full date, or additional details on hover.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description: '以人类可读文本显示格式化时间戳，可选工具提示和实时更新。',
  features: [
    "格式：'relative'、'date'、'date_time'、'time'、'system_date'、'system_date_time'、'system_time'、'auto'",
    '实时更新：根据时间戳年龄自适应频率的计时器',
    '工具提示：悬停时显示相对时间戳的完整日期/时间',
    '语义化 HTML：使用 ISO 8601 datetime 属性渲染 <time>',
    '排版：委托给 XDSText 以保持一致的大小和颜色',
    "系统格式：数据库和日志的 ISO 风格日期/时间",
  ],
  accessibility: [
    '作为带有 ISO 8601 datetime 属性的 <time datetime="..."> 渲染，供机器读取。',
    '显示相对格式时，设置带有完整绝对时间的 aria-label。',
    '工具提示可通过焦点访问键盘。',
  ],
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
