// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MetricTile',
  displayName: 'MetricTile',
  keywords: ["metric","kpi","number","value","stat","statistic","tile","delta","trend","indicator","dashboard","analytics"],
  props: [
    {
      name: 'value',
      type: 'number | null | undefined',
      description: 'The metric value to display. When null or undefined, displays a double hyphen (--).',
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Metric title text displayed above or below the value.',
    },
    {
      name: 'subtitle',
      type: 'ReactNode',
      description: 'Optional secondary text below the title (e.g. time range, unit).',
    },
    {
      name: 'format',
      type: "'prettyMetric' | 'prettyInt' | 'prettyBytes' | ((value: number) => ReactNode)",
      description: 'Number formatter. Built-in: prettyMetric (1.2K/1.2M), prettyInt (1,234), prettyBytes (1.2 KB). Or pass a custom function.',
      default: "'prettyMetric'",
    },
    {
      name: 'deltaValue',
      type: 'ReactNode',
      description: 'Delta value displayed next to the metric (e.g. "+12.5%").',
    },
    {
      name: 'deltaTrend',
      type: "'upward' | 'downward' | 'flat'",
      description: 'Trend direction for the delta indicator arrow.',
    },
    {
      name: 'deltaFavorability',
      type: "'favorable' | 'unfavorable' | 'neutral'",
      description: 'Favorability of the delta for color coding. favorable=green, unfavorable=red, neutral=gray.',
    },
    {
      name: 'size',
      type: "'large' | 'small'",
      description: 'Size variant controlling value font size and padding.',
      default: "'large'",
    },
    {
      name: 'titlePosition',
      type: "'top' | 'bottom'",
      description: 'Display title above or below the metric value.',
      default: "'bottom'",
    },
    {
      name: 'hasPadding',
      type: 'boolean',
      description: 'Whether to add padding around the component.',
      default: 'true',
    },
    {
      name: 'hasTabularNumbers',
      type: 'boolean',
      description: 'Use tabular (fixed-width) numbers for consistent column alignment.',
      default: 'false',
    },
    {
      name: 'numberOfTitleLines',
      type: 'number',
      description: 'Maximum number of lines for the title before truncating. 0 disables truncation.',
      default: '0',
    },
    {
      name: 'hovercard',
      type: 'ReactNode',
      description: 'Content for an info hovercard displayed via an icon button next to the title.',
    },
  ],
  playground: {
    defaults: {
      value: 1250,
      title: 'Revenue',
      format: 'prettyMetric',
      size: 'large',
      titlePosition: 'bottom',
    },
  },
  theming: {
    targets: [
      {className: 'xds-metric-tile', visualProps: ['size']},
      {className: 'xds-metric-tile-value', visualProps: []},
    ],
  },
  usage: {
    description:
      'MetricTile displays a prominent KPI number with contextual title, subtitle, and optional trend delta. Use it in dashboards, summary cards, and analytics panels to highlight key metrics.',
    bestPractices: [
      {guidance: true, description: 'Use prettyMetric (default) for large numbers — it produces compact, scannable output like 1.2K or 3.5M.'},
      {guidance: true, description: 'Add a title for every metric. A number without context is meaningless.'},
      {guidance: true, description: 'Use deltaFavorability to color-code deltas semantically — green for favorable trends, red for unfavorable.'},
      {guidance: true, description: 'Use hasTabularNumbers when stacking multiple MetricTiles vertically so digits align across rows.'},
      {guidance: true, description: 'Use the hovercard prop to provide metric definitions, data sources, and inspect links without cluttering the UI.'},
      {guidance: false, description: 'Use MetricTile for non-numeric content. It is designed for number display — use Text or Card for arbitrary content.'},
      {guidance: false, description: 'Show more than 4-5 MetricTiles in a row. Too many KPIs dilute attention — prioritize the most actionable metrics.'},
    ],
    anatomy: [
      {name: 'Value', required: true, description: 'The large formatted number — the primary visual element.'},
      {name: 'Title', required: false, description: 'Label identifying what the metric represents.'},
      {name: 'Subtitle', required: false, description: 'Secondary context like time range or unit.'},
      {name: 'Delta', required: false, description: 'Trend arrow and change value showing direction and magnitude of change.'},
      {name: 'Hovercard', required: false, description: 'Info icon that reveals metric definition on hover.'},
    ],
  },
};
