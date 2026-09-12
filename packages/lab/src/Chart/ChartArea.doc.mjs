// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Area band',
    required: true,
    description: 'Filled SVG path between the resolved upper and lower values.',
  },
  {
    name: 'Edge stroke',
    required: false,
    description: 'Optional outline drawn around the same closed area path.',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'ChartArea',
  displayName: 'Chart Area',
  group: 'Charts',
  category: 'Data Visualization',
  keywords: [
    'chart',
    'area',
    'band',
    'range',
    'confidence interval',
    'uncertainty',
  ],
  props: [
    {
      name: 'yUpper',
      type: 'string',
      description:
        'Data key for the upper bound. Pair it with yLower, or with baseline when the lower bound is the baseline series.',
    },
    {
      name: 'yLower',
      type: 'string',
      description:
        'Data key for the lower bound. Pair it with yUpper, or with baseline when the upper bound is the baseline series.',
    },
    {
      name: 'baseline',
      type: 'string',
      description:
        'Fallback data key used for whichever of yUpper or yLower is omitted.',
    },
    {
      name: 'color',
      type: 'string',
      description:
        'CSS color for the fill and optional edge stroke. Use a value from useChartColors() so it follows the active theme.',
      required: true,
    },
    {
      name: 'opacity',
      type: 'number',
      description: 'Fill opacity for the area band.',
      default: '0.2',
    },
    {
      name: 'stroke',
      type: 'boolean',
      description: 'Draw an outline around the area band.',
      default: 'false',
    },
    {
      name: 'strokeWidth',
      type: 'number',
      description: 'Width of the optional edge stroke in SVG user units.',
      default: '1',
    },
  ],
  usage: {
    anatomy,
    description:
      'A filled band between two y-values in a Chart. Use it for confidence intervals, forecast ranges, min/max envelopes, or another bounded region that supplements a line or set of points.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass both yUpper and yLower, or pass one bound together with baseline, and include those fields in the parent Chart yKeys.',
      },
      {
        guidance: true,
        description:
          'Use useChartColors() for the color so the band follows light, dark, and custom themes.',
      },
      {
        guidance: true,
        description:
          'Measure the final band or edge against its rendered backdrop; enabling stroke is an option, not proof, when the translucent fill alone is below 3:1 non-text contrast.',
      },
      {
        guidance: false,
        description:
          'Use ChartArea as the only presentation of exact values; pair the band with axes, labels, a line, points, a legend, or another accessible data presentation.',
      },
      {
        guidance: false,
        description:
          'Pass only baseline or omit all three bound keys; those combinations do not produce a useful visible band.',
      },
    ],
  },
  examples: [
    {
      label: 'Confidence interval',
      code: '<ChartArea yUpper="upper95" yLower="lower95" color={colors.categorical(1)[0]} />',
    },
    {
      label: 'Bound against a baseline',
      code: '<ChartArea yUpper="upper95" baseline="mean" color={colors.categorical(1)[0]} stroke />',
    },
  ],
};
