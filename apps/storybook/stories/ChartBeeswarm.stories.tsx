import type {Meta, StoryObj} from '@storybook/react';
import {useMemo} from 'react';
import {
  XDSChart,
  XDSChartAxis,
  XDSChartGrid,
  XDSChartDot,
  XDSChartLegend,
  XDSChartTooltip,
  useXDSChartColors,
} from '@xds/lab';
import {XDSText} from '@xds/core';
import {scaleBand} from 'd3-scale';
import {useDataset} from './useDataset';
import {dodgeLayout} from '../../../packages/lab/src/Chart/dodge';

/**
 * Beeswarm / dodged dot plot — dodge computed at the callsite as a data
 * transform, then passed to XDSChartDot via pxKey/pyKey.
 */
const meta: Meta<typeof XDSChart> = {
  title: 'Lab/XDSChart/Beeswarm',
  component: XDSChart,
};

export default meta;

type Penguin = {
  Species: string;
  Island: string;
  'Beak Length (mm)': number;
  'Beak Depth (mm)': number;
  'Flipper Length (mm)': number;
  'Body Mass (g)': number;
  Sex: string | null;
};

/** Palmer Penguins — body mass by species, colored by sex */
export const Penguins: StoryObj = {
  render: () => {
    const colors = useXDSChartColors();
    const [raw, loading] = useDataset<Penguin>('penguins.json');
    const palette = colors.categorical(2);
    const RADIUS = 3;

    // Filter and compute dodge at the callsite — data transform, not a mark concern
    const data = useMemo(() => {
      const filtered = raw.filter(d => d.Sex === 'MALE' || d.Sex === 'FEMALE');
      if (!filtered.length) return [];

      // We need to compute pixel positions for dodge.
      // Use the same scale the chart will use internally.
      const chartHeight = 420;
      const margin = {top: 16, right: 16, bottom: 32, left: 48};
      const innerHeight = chartHeight - margin.top - margin.bottom;

      const species = [...new Set(filtered.map(d => d.Species))];
      const xBand = scaleBand<string>()
        .domain(species)
        .range([0, 600])
        .padding(0.2);
      const yExtent = [0, Math.max(...filtered.map(d => d['Body Mass (g)']))];
      const yScale = (v: number) =>
        innerHeight -
        ((v - yExtent[0]) / (yExtent[1] - yExtent[0])) * innerHeight;

      const yPixels = filtered.map(d => yScale(d['Body Mass (g)']));
      const bands = filtered.map(d => d.Species);
      const bandCenters = new Map<string, number>();
      for (const s of species) {
        bandCenters.set(s, (xBand(s) ?? 0) + xBand.bandwidth() / 2);
      }

      const dodged = dodgeLayout({
        yPixels,
        bands,
        bandCenters,
        bandHalfWidth: xBand.bandwidth() / 2,
        radius: RADIUS,
        padding: 1,
      });

      return filtered.map((d, i) => ({
        ...d,
        _px: dodged.x[i],
        _py: yPixels[i],
      }));
    }, [raw]);

    if (loading) return <XDSText type="supporting">Loading…</XDSText>;

    return (
      <XDSChart
        data={data}
        xKey="Species"
        yKeys={['Body Mass (g)']}
        height={420}>
        <XDSChartGrid horizontal />
        <XDSChartAxis position="bottom" />
        <XDSChartAxis position="left" />
        <XDSChartDot
          dataKey="Body Mass (g)"
          pxKey="_px"
          pyKey="_py"
          color={d => (d.Sex === 'MALE' ? palette[0] : palette[1])}
          radius={RADIUS}
          opacity={0.7}
        />
        <XDSChartTooltip />
        <XDSChartLegend
          items={[
            {label: 'Male', color: palette[0]},
            {label: 'Female', color: palette[1]},
          ]}
        />
      </XDSChart>
    );
  },
};
