import type {Meta, StoryObj} from '@storybook/react';
import {XDSVegaChart, buildVegaLiteConfig} from '@xds/vega';
import type {AnySpec} from '@xds/vega';
import {useXDSTheme} from '@xds/core';

// ---------------------------------------------------------------------------
// Stocks dataset URL from vega-datasets
// ---------------------------------------------------------------------------

const STOCKS_CSV_URL =
  'https://cdn.jsdelivr.net/npm/vega-datasets@3.2.1/data/stocks.csv';

// ---------------------------------------------------------------------------
// Spec: Stock price line chart with cross-hair hover + tooltip
// ---------------------------------------------------------------------------

const stocksLineChartSpec: AnySpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: 'Stocks price progression 2000-2010',
  width: 'container',
  height: 400,
  data: {url: STOCKS_CSV_URL},
  encoding: {
    x: {field: 'date', type: 'temporal'},
  },
  layer: [
    // Vertical rule that follows the cursor
    {
      mark: {type: 'rule', stroke: '#65676b'},
      encoding: {
        opacity: {
          condition: {param: 'hoveredPoint', value: 1, empty: false},
          value: 0,
        },
      },
    },
    // Line marks — one per symbol
    {
      mark: 'line',
      encoding: {
        y: {
          field: 'price',
          type: 'quantitative',
          axis: {format: '$,d'},
        },
        color: {field: 'symbol', type: 'nominal'},
      },
    },
    // Points revealed on hover
    {
      mark: {
        type: 'point',
        size: 64,
        fill: 'white',
        strokeWidth: 2,
      },
      encoding: {
        y: {field: 'price', type: 'quantitative'},
        stroke: {field: 'symbol', legend: null},
        opacity: {
          condition: {param: 'hoveredPoint', value: 1, empty: false},
          value: 0,
        },
      },
    },
    // Invisible rule for nearest-point selection + tooltip
    {
      transform: [{pivot: 'symbol', value: 'price', groupby: ['date']}],
      mark: {type: 'rule', opacity: 0},
      encoding: {
        tooltip: [
          {field: 'date', type: 'temporal', format: '%B %Y'},
          {field: 'AAPL', type: 'quantitative'},
          {field: 'AMZN', type: 'quantitative'},
          {field: 'GOOG', type: 'quantitative'},
          {field: 'IBM', type: 'quantitative'},
          {field: 'MSFT', type: 'quantitative'},
        ],
      },
      params: [
        {
          name: 'hoveredPoint',
          select: {
            type: 'point',
            fields: ['date'],
            nearest: true,
            on: 'pointerover',
            clear: 'pointerout',
          },
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// GitHub Top Programming Languages
// ---------------------------------------------------------------------------

// Inline data for the programming languages bump chart
const programmingLanguagesData = [
  {year: 2014, language: 'Javascript', ranking: 1},
  {year: 2014, language: 'Python', ranking: 4},
  {year: 2014, language: 'Java', ranking: 2},
  {year: 2014, language: 'Typescript', ranking: 10},
  {year: 2014, language: 'C#', ranking: 8},
  {year: 2014, language: 'C++', ranking: 6},
  {year: 2014, language: 'PHP', ranking: 3},
  {year: 2014, language: 'Shell', ranking: 9},
  {year: 2014, language: 'C', ranking: 7},
  {year: 2014, language: 'Ruby', ranking: 5},
  {year: 2015, language: 'Javascript', ranking: 1},
  {year: 2015, language: 'Python', ranking: 3},
  {year: 2015, language: 'Java', ranking: 2},
  {year: 2015, language: 'Typescript', ranking: 10},
  {year: 2015, language: 'C#', ranking: 7},
  {year: 2015, language: 'C++', ranking: 6},
  {year: 2015, language: 'PHP', ranking: 4},
  {year: 2015, language: 'Shell', ranking: 9},
  {year: 2015, language: 'C', ranking: 8},
  {year: 2015, language: 'Ruby', ranking: 5},
  {year: 2016, language: 'Javascript', ranking: 1},
  {year: 2016, language: 'Python', ranking: 3},
  {year: 2016, language: 'Java', ranking: 2},
  {year: 2016, language: 'Typescript', ranking: 10},
  {year: 2016, language: 'C#', ranking: 6},
  {year: 2016, language: 'C++', ranking: 5},
  {year: 2016, language: 'PHP', ranking: 4},
  {year: 2016, language: 'Shell', ranking: 9},
  {year: 2016, language: 'C', ranking: 8},
  {year: 2016, language: 'Ruby', ranking: 7},
  {year: 2017, language: 'Javascript', ranking: 1},
  {year: 2017, language: 'Python', ranking: 3},
  {year: 2017, language: 'Java', ranking: 2},
  {year: 2017, language: 'Typescript', ranking: 10},
  {year: 2017, language: 'C#', ranking: 6},
  {year: 2017, language: 'C++', ranking: 5},
  {year: 2017, language: 'PHP', ranking: 4},
  {year: 2017, language: 'Shell', ranking: 8},
  {year: 2017, language: 'C', ranking: 7},
  {year: 2017, language: 'Ruby', ranking: 9},
  {year: 2018, language: 'Javascript', ranking: 1},
  {year: 2018, language: 'Python', ranking: 3},
  {year: 2018, language: 'Java', ranking: 2},
  {year: 2018, language: 'Typescript', ranking: 7},
  {year: 2018, language: 'C#', ranking: 6},
  {year: 2018, language: 'C++', ranking: 5},
  {year: 2018, language: 'PHP', ranking: 4},
  {year: 2018, language: 'Shell', ranking: 9},
  {year: 2018, language: 'C', ranking: 8},
  {year: 2018, language: 'Ruby', ranking: 10},
  {year: 2019, language: 'Javascript', ranking: 1},
  {year: 2019, language: 'Python', ranking: 2},
  {year: 2019, language: 'Java', ranking: 3},
  {year: 2019, language: 'Typescript', ranking: 5},
  {year: 2019, language: 'C#', ranking: 7},
  {year: 2019, language: 'C++', ranking: 6},
  {year: 2019, language: 'PHP', ranking: 4},
  {year: 2019, language: 'Shell', ranking: 9},
  {year: 2019, language: 'C', ranking: 8},
  {year: 2019, language: 'Ruby', ranking: 10},
  {year: 2020, language: 'Javascript', ranking: 1},
  {year: 2020, language: 'Python', ranking: 2},
  {year: 2020, language: 'Java', ranking: 3},
  {year: 2020, language: 'Typescript', ranking: 4},
  {year: 2020, language: 'C#', ranking: 6},
  {year: 2020, language: 'C++', ranking: 5},
  {year: 2020, language: 'PHP', ranking: 7},
  {year: 2020, language: 'Shell', ranking: 9},
  {year: 2020, language: 'C', ranking: 8},
  {year: 2020, language: 'Ruby', ranking: 10},
  {year: 2021, language: 'Javascript', ranking: 1},
  {year: 2021, language: 'Python', ranking: 2},
  {year: 2021, language: 'Java', ranking: 3},
  {year: 2021, language: 'Typescript', ranking: 4},
  {year: 2021, language: 'C#', ranking: 6},
  {year: 2021, language: 'C++', ranking: 5},
  {year: 2021, language: 'PHP', ranking: 7},
  {year: 2021, language: 'Shell', ranking: 8},
  {year: 2021, language: 'C', ranking: 9},
  {year: 2021, language: 'Ruby', ranking: 10},
  {year: 2022, language: 'Javascript', ranking: 1},
  {year: 2022, language: 'Python', ranking: 2},
  {year: 2022, language: 'Java', ranking: 3},
  {year: 2022, language: 'Typescript', ranking: 4},
  {year: 2022, language: 'C#', ranking: 5},
  {year: 2022, language: 'C++', ranking: 6},
  {year: 2022, language: 'PHP', ranking: 7},
  {year: 2022, language: 'Shell', ranking: 8},
  {year: 2022, language: 'C', ranking: 9},
  {year: 2022, language: 'Ruby', ranking: 10},
];

/**
 * GitHub top programming languages bump chart.
 *
 * Uses `data.name` to reference the named dataset "table", which is injected
 * at runtime via the `data` prop. The year field is parsed as a date so the
 * temporal axis works correctly.
 */
const programmingLanguagesSpec: AnySpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  title: {
    text: 'GitHub Top Programming Languages 2014–2022',
    subtitle: 'https://octoverse.github.com/2022/top-programming-languages',
  },
  description: 'https://octoverse.github.com/2022/top-programming-languages',
  width: 'container',
  height: 400,
  data: {name: 'table', format: {parse: {year: 'date:%Y'}}},
  transform: [
    {
      joinaggregate: [{field: 'year', as: 'argmax_year', op: 'argmax'}],
    },
  ],
  encoding: {
    x: {field: 'year', type: 'temporal', scale: {padding: 12}},
  },
  layer: [
    // Vertical crosshair rule
    {
      mark: {type: 'rule', stroke: '#65676b'},
      encoding: {
        opacity: {
          condition: {param: 'hoveredPoint', value: 1, empty: false},
          value: 0,
        },
      },
    },
    // Bump-chart lines — one per language
    {
      mark: 'line',
      encoding: {
        y: {
          field: 'ranking',
          type: 'quantitative',
          scale: {reverse: true, domainMin: 1},
          axis: {labels: false},
        },
        color: {field: 'language', type: 'ordinal', legend: null},
      },
    },
    // Points on hover
    {
      mark: {type: 'point', size: 64, fill: 'white', strokeWidth: 2},
      encoding: {
        y: {field: 'language', type: 'quantitative'},
        stroke: {field: 'language', legend: null},
        opacity: {
          condition: {param: 'hoveredPoint', value: 1, empty: false},
          value: 0,
        },
      },
    },
    // Invisible rule for nearest-point selection + tooltip
    {
      transform: [{pivot: 'language', value: 'ranking', groupby: ['year']}],
      mark: {type: 'rule', opacity: 0},
      encoding: {
        tooltip: [
          {field: 'Javascript', type: 'quantitative'},
          {field: 'Python', type: 'quantitative'},
          {field: 'Java', type: 'quantitative'},
          {field: 'Typescript', type: 'quantitative'},
          {field: 'C#', type: 'quantitative'},
          {field: 'C++', type: 'quantitative'},
          {field: 'PHP', type: 'quantitative'},
          {field: 'Shell', type: 'quantitative'},
          {field: 'C', type: 'quantitative'},
          {field: 'Ruby', type: 'quantitative'},
        ],
      },
      params: [
        {
          name: 'hoveredPoint',
          select: {
            type: 'point',
            fields: ['year'],
            nearest: true,
            on: 'pointerover',
            clear: 'pointerout',
          },
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Themed wrapper — resolves XDS tokens into a Vega-Lite config
// ---------------------------------------------------------------------------

function ThemedVegaChart(props: React.ComponentProps<typeof XDSVegaChart>) {
  const {token} = useXDSTheme();
  const config = buildVegaLiteConfig(token);
  return <XDSVegaChart {...props} compileOptions={{config}} />;
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof XDSVegaChart> = {
  title: 'Vega/XDSVegaChart',
  component: XDSVegaChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof XDSVegaChart>;

export const StocksLineChart: Story = {
  name: 'Stocks Line Chart',
  render: () => (
    <div style={{width: '100%', maxWidth: 720}}>
      <ThemedVegaChart spec={stocksLineChartSpec} />
    </div>
  ),
};

export const ProgrammingLanguagesBumpChart: Story = {
  name: 'Programming Languages Bump Chart',
  render: () => (
    <div style={{width: '100%', maxWidth: 720}}>
      <ThemedVegaChart
        spec={programmingLanguagesSpec}
        data={{table: programmingLanguagesData}}
      />
    </div>
  ),
};
