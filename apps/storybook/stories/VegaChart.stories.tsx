import type {Meta, StoryObj} from '@storybook/react';
import {XDSVegaChart} from '@xds/vega';
import type {AnySpec} from '@xds/vega';

/**
 * Radial plot from the official Vega example gallery.
 * Encodes two values as the angle and radius of an arc.
 *
 * @see https://github.com/vega/vega/blob/main/docs/examples/radial-plot.vg.json
 */
const radialPlotSpec: AnySpec = {
  $schema: 'https://vega.github.io/schema/vega/v6.json',
  description:
    'A basic radial plot that encodes two values as the angle and radius of an arc.',
  width: 200,
  height: 200,
  data: [
    {
      name: 'table',
      values: [12, 23, 47, 6, 52, 19],
      transform: [{type: 'pie', field: 'data'}],
    },
  ],
  scales: [
    {
      name: 'r',
      type: 'sqrt',
      domain: {data: 'table', field: 'data'},
      zero: true,
      range: [20, 100],
    },
  ],
  marks: [
    {
      type: 'arc',
      from: {data: 'table'},
      encode: {
        enter: {
          x: {field: {group: 'width'}, mult: 0.5},
          y: {field: {group: 'height'}, mult: 0.5},
          startAngle: {field: 'startAngle'},
          endAngle: {field: 'endAngle'},
          innerRadius: {value: 20},
          outerRadius: {scale: 'r', field: 'data'},
          stroke: {value: '#fff'},
        },
        update: {
          fill: {value: '#ccc'},
        },
        hover: {
          fill: {value: 'pink'},
        },
      },
    },
    {
      type: 'text',
      from: {data: 'table'},
      encode: {
        enter: {
          x: {field: {group: 'width'}, mult: 0.5},
          y: {field: {group: 'height'}, mult: 0.5},
          radius: {scale: 'r', field: 'data', offset: 8},
          theta: {signal: '(datum.startAngle + datum.endAngle)/2'},
          fill: {value: '#000'},
          align: {value: 'center'},
          baseline: {value: 'middle'},
          text: {field: 'data'},
        },
      },
    },
  ],
};

const meta: Meta<typeof XDSVegaChart> = {
  title: 'Vega/XDSVegaChart',
  component: XDSVegaChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    renderer: {
      control: 'radio',
      options: ['svg', 'canvas'],
      description: 'Vega rendering backend',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSVegaChart>;

export const RadialPlot: Story = {
  name: 'Radial Plot',
  args: {
    spec: radialPlotSpec,
  },
};
