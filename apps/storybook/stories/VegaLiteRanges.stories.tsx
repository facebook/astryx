// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSVegaChart, buildVegaLiteConfig} from '@xds/vega';
import type {AnySpec} from '@xds/vega';
import {useTheme} from '@xds/core';

// ---------------------------------------------------------------------------
// Stocks dataset URL from vega-datasets
// ---------------------------------------------------------------------------

const VEGA_DATASETS = 'https://cdn.jsdelivr.net/npm/vega-datasets@3.2.1/data';

const STOCKS_CSV_URL = `${VEGA_DATASETS}/stocks.csv`;
const SEATTLE_WEATHER_CSV_URL = `${VEGA_DATASETS}/seattle-weather.csv`;
const MOVIES_JSON_URL = `${VEGA_DATASETS}/movies.json`;

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
// Spec: Brushing scatter plot to show data on a table — ordinal color scale
// Source: https://vega.github.io/vega-lite/examples/brush_table.html
// ---------------------------------------------------------------------------

const CARS_JSON_URL = `${VEGA_DATASETS}/cars.json`;

const brushTableSpec: AnySpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  description:
    'Drag a rectangular brush to show (first 20) selected points in a table.',
  data: {url: CARS_JSON_URL},
  transform: [{window: [{op: 'row_number', as: 'row_number'}]}],
  hconcat: [
    {
      params: [{name: 'brush', select: 'interval'}],
      mark: 'point',
      encoding: {
        x: {field: 'Horsepower', type: 'quantitative'},
        y: {field: 'Miles_per_Gallon', type: 'quantitative'},
        color: {
          condition: {
            param: 'brush',
            field: 'Cylinders',
            type: 'ordinal',
          },
          value: 'grey',
        },
      },
    },
    {
      transform: [
        {filter: {param: 'brush'}},
        {window: [{op: 'rank', as: 'rank'}]},
        {filter: {field: 'rank', lt: 20}},
      ],
      hconcat: [
        {
          width: 50,
          title: 'Horsepower',
          mark: 'text',
          encoding: {
            text: {field: 'Horsepower', type: 'nominal'},
            y: {field: 'row_number', type: 'ordinal', axis: null},
          },
        },
        {
          width: 50,
          title: 'MPG',
          mark: 'text',
          encoding: {
            text: {field: 'Miles_per_Gallon', type: 'nominal'},
            y: {field: 'row_number', type: 'ordinal', axis: null},
          },
        },
        {
          width: 50,
          title: 'Origin',
          mark: 'text',
          encoding: {
            text: {field: 'Origin', type: 'nominal'},
            y: {field: 'row_number', type: 'ordinal', axis: null},
          },
        },
      ],
    },
  ],
  resolve: {legend: {color: 'independent'}},
};

// ---------------------------------------------------------------------------
// Spec: Bar chart with labels and emojis — ramp color scale
// Source: https://vega.github.io/vega-lite/examples/layer_bar_fruit.html
// ---------------------------------------------------------------------------

const fruitBarChartSpec: AnySpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  description:
    'Vega-Lite version of bar chart from https://observablehq.com/@d3/learn-d3-scales.',
  width: 400,
  data: {
    values: [
      {name: '🍊', count: 21},
      {name: '🍇', count: 13},
      {name: '🍏', count: 8},
      {name: '🍌', count: 5},
      {name: '🍐', count: 3},
      {name: '🍋', count: 2},
      {name: '🍎', count: 1},
      {name: '🍉', count: 1},
    ],
  },
  encoding: {
    y: {field: 'name', type: 'nominal', sort: '-x', title: null},
    x: {field: 'count', type: 'quantitative', title: null},
  },
  layer: [
    {
      mark: 'bar',
      encoding: {
        color: {
          field: 'count',
          type: 'quantitative',
          title: 'Number of fruit',
        },
      },
    },
    {
      mark: {type: 'text', align: 'right', xOffset: -4, aria: false},
      encoding: {
        text: {field: 'count', type: 'quantitative'},
        color: {
          condition: {
            test: {field: 'count', gt: 10},
            value: 'white',
          },
          value: 'black',
        },
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Spec: Calculate residuals (movies.json) — diverging color scale
// Source: https://vega.github.io/vega-lite/examples/joinaggregate_residual_graph.html
// ---------------------------------------------------------------------------

const residualGraphSpec: AnySpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  description:
    'A dot plot showing each movie in the database, and the difference from the average movie rating. The display is sorted by year to visualize everything in sequential order. The graph is for all Movies before 2019.',
  data: {url: MOVIES_JSON_URL},
  transform: [
    {filter: "datum['IMDB Rating'] != null"},
    {
      filter: {
        timeUnit: 'year',
        field: 'Release Date',
        range: [null, 2019],
      },
    },
    {
      joinaggregate: [{op: 'mean', field: 'IMDB Rating', as: 'AverageRating'}],
    },
    {
      calculate: "datum['IMDB Rating'] - datum.AverageRating",
      as: 'RatingDelta',
    },
  ],
  mark: 'point',
  encoding: {
    x: {field: 'Release Date', type: 'temporal'},
    y: {field: 'RatingDelta', type: 'quantitative', title: 'Rating Delta'},
    color: {
      field: 'RatingDelta',
      type: 'quantitative',
      scale: {domainMid: 0},
      title: 'Rating Delta',
    },
  },
};

// ---------------------------------------------------------------------------
// Spec: Annual weather heatmap (seattle-weather.csv)
// Source: https://vega.github.io/vega-lite/examples/rect_heatmap_weather.html
// ---------------------------------------------------------------------------

const weatherHeatmapSpec: AnySpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  data: {url: SEATTLE_WEATHER_CSV_URL},
  title: 'Daily Max Temperatures (C) in Seattle, WA',
  config: {
    view: {strokeWidth: 0, step: 13},
    axis: {domain: false},
  },
  mark: 'rect',
  encoding: {
    x: {
      field: 'date',
      timeUnit: 'date',
      type: 'ordinal',
      title: 'Day',
      axis: {labelAngle: 0, format: '%e'},
    },
    y: {
      field: 'date',
      timeUnit: 'month',
      type: 'ordinal',
      title: 'Month',
    },
    color: {
      field: 'temp_max',
      aggregate: 'max',
      type: 'quantitative',
      legend: {title: null},
    },
  },
};

// ---------------------------------------------------------------------------
// Themed wrapper — resolves XDS tokens into a Vega-Lite config
// ---------------------------------------------------------------------------

function ThemedVegaChart(props: React.ComponentProps<typeof XDSVegaChart>) {
  const {token} = useTheme();
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
  name: 'Range: Category - Stocks Line Chart',
  render: () => (
    <div style={{width: '100%', maxWidth: 720}}>
      <ThemedVegaChart spec={stocksLineChartSpec} />
    </div>
  ),
};

export const BrushTable: Story = {
  name: 'Range: Ordinal - Brushing Scatter Plot to show data on a table',
  render: () => (
    <div style={{width: '100%', maxWidth: 720}}>
      <ThemedVegaChart spec={brushTableSpec} />
    </div>
  ),
};

export const WeatherHeatmap: Story = {
  name: 'Range: Heatmap - Annual Weather Heatmap',
  render: () => (
    <div style={{width: '100%', maxWidth: 720}}>
      <ThemedVegaChart spec={weatherHeatmapSpec} />
    </div>
  ),
};

export const ResidualGraph: Story = {
  name: 'Range: Diverging - Calculate Residuals',
  render: () => (
    <div style={{width: '100%', maxWidth: 720}}>
      <ThemedVegaChart spec={residualGraphSpec} />
    </div>
  ),
};

export const FruitBarChart: Story = {
  name: 'Range: Ramp - Simple Bar Chart with Labels and Emojis',
  render: () => (
    <div style={{width: '100%', maxWidth: 720}}>
      <ThemedVegaChart spec={fruitBarChartSpec} />
    </div>
  ),
};
