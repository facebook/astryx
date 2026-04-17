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
