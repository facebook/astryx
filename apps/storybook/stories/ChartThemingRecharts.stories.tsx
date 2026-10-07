// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, waitFor} from 'storybook/test';
import {Button, Card, Stack, Text} from '@astryxdesign/core';
import {Theme, defineTheme, useTheme} from '@astryxdesign/core/theme';
import {Heading} from '@astryxdesign/core/Text';
import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';
import {
  colorVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const meta: Meta = {
  title: 'Lab/ChartTheming/Recharts',
  parameters: {
    docs: {
      description: {
        component:
          'This example passes public Astryx values to verified Recharts SVG and HTML paint props without an Astryx-specific adapter.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const styles = stylex.create({
  chart: {
    height: 320,
    width: '100%',
  },
});

const data = [
  {quarter: 'Q1', revenue: 128, costs: 82},
  {quarter: 'Q2', revenue: 156, costs: 94},
  {quarter: 'Q3', revenue: 143, costs: 101},
  {quarter: 'Q4', revenue: 184, costs: 112},
];

const series = {
  revenue: dataVars['--color-data-categorical-blue'],
  costs: dataVars['--color-data-categorical-orange'],
};

const hoverSeries = {
  revenue: `color-mix(in srgb, ${series.revenue} 88%, ${colorVars['--color-tint-hover']})`,
  costs: `color-mix(in srgb, ${series.costs} 88%, ${colorVars['--color-tint-hover']})`,
};

const customSeriesTheme = defineTheme({
  name: 'chart-theming-custom-series',
  tokens: {
    '--color-data-categorical-blue': ['#005A4E', '#72E1C1'],
    '--color-data-categorical-orange': ['#7A2E00', '#FFB280'],
  },
});

const axisTickStyle = {
  fill: colorVars['--color-text-secondary'],
  fontFamily: typographyVars['--font-family-body'],
  fontSize: typeScaleVars['--text-supporting-size'],
};

function ThemeAwareRechartsExample({
  useThemeRadius = true,
}: {useThemeRadius?: boolean} = {}) {
  const {token} = useTheme();
  const themeRadius = Number.parseFloat(token('--radius-element')) || 0;
  const barRadius = useThemeRadius ? themeRadius : 0;

  return (
    <Card>
      <Stack direction="vertical" gap={4}>
        <Stack direction="vertical" gap={1}>
          <Heading level={3}>Quarterly performance</Heading>
          <Text type="supporting" color="secondary">
            Recharts uses the active Astryx theme for series, typography, hover,
            tooltip radius, and bar radius.
          </Text>
        </Stack>
        <div {...stylex.props(styles.chart)} data-bar-radius={barRadius}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              accessibilityLayer
              desc="Revenue and costs for Q1 through Q4"
              title="Quarterly performance">
              <CartesianGrid
                stroke={colorVars['--color-border']}
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="quarter"
                axisLine={{
                  stroke: colorVars['--color-border-emphasized'],
                }}
                tick={axisTickStyle}
                tickLine={{
                  stroke: colorVars['--color-border-emphasized'],
                }}
              />
              <YAxis axisLine={false} tick={axisTickStyle} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: colorVars['--color-background-card'],
                  borderColor: colorVars['--color-border'],
                  borderRadius: radiusVars['--radius-element'],
                  color: colorVars['--color-text-primary'],
                  fontFamily: typographyVars['--font-family-body'],
                  fontSize: typeScaleVars['--text-supporting-size'],
                }}
                labelStyle={{color: colorVars['--color-text-primary']}}
              />
              <Legend
                wrapperStyle={{
                  color: colorVars['--color-text-secondary'],
                  fontFamily: typographyVars['--font-family-body'],
                  fontSize: typeScaleVars['--text-supporting-size'],
                }}
              />
              <Bar
                activeBar={{
                  fill: hoverSeries.revenue,
                  stroke: colorVars['--color-border-emphasized'],
                  strokeWidth: 2,
                }}
                dataKey="revenue"
                fill={series.revenue}
                isAnimationActive={false}
                name="Revenue"
                radius={[barRadius, barRadius, 0, 0]}
              />
              <Bar
                activeBar={{
                  fill: hoverSeries.costs,
                  stroke: colorVars['--color-border-emphasized'],
                  strokeWidth: 2,
                }}
                dataKey="costs"
                fill={series.costs}
                isAnimationActive={false}
                name="Costs"
                radius={[barRadius, barRadius, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Stack>
    </Card>
  );
}

function CustomDataTokenThemeExample() {
  return (
    <Theme theme={customSeriesTheme} mode="light">
      <ThemeAwareRechartsExample />
    </Theme>
  );
}

function RuntimeThemeSwitchExample() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  return (
    <Theme theme={customSeriesTheme} mode={mode}>
      <Stack direction="vertical" gap={3}>
        <Button
          label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          onClick={() =>
            setMode(current => (current === 'light' ? 'dark' : 'light'))
          }
        />
        <ThemeAwareRechartsExample />
      </Stack>
    </Theme>
  );
}

const BAR_SELECTOR =
  'path[fill="var(--color-data-categorical-blue)"], path[fill="var(--color-data-categorical-orange)"]';

function barElements(canvasElement: HTMLElement): SVGElement[] {
  return Array.from(canvasElement.querySelectorAll<SVGElement>(BAR_SELECTOR));
}

async function barFills(canvasElement: HTMLElement): Promise<string[]> {
  let fills: string[] = [];
  await waitFor(() => {
    const bars = barElements(canvasElement);
    expect(bars.length).toBeGreaterThan(0);
    fills = [...new Set(bars.map(bar => getComputedStyle(bar).fill))];
    expect(fills).not.toContain('');
  });
  return fills;
}

export const ThemeTokens: Story = {
  render: () => <ThemeAwareRechartsExample />,
  play: async ({canvasElement}) => {
    await barFills(canvasElement);
    const radius = Number(
      canvasElement
        .querySelector('[data-bar-radius]')
        ?.getAttribute('data-bar-radius'),
    );
    expect(Number.isFinite(radius)).toBe(true);
    expect(radius).toBeGreaterThanOrEqual(0);
    expect(canvasElement.querySelector('title')).toHaveTextContent(
      'Quarterly performance',
    );
    expect(canvasElement.querySelector('desc')).toHaveTextContent(
      'Revenue and costs for Q1 through Q4',
    );
  },
};

export const SquareBars: Story = {
  render: () => <ThemeAwareRechartsExample useThemeRadius={false} />,
  play: async ({canvasElement}) => {
    await barFills(canvasElement);
    expect(canvasElement.querySelector('[data-bar-radius]')).toHaveAttribute(
      'data-bar-radius',
      '0',
    );
  },
};

export const CustomDataTokens: Story = {
  render: () => <CustomDataTokenThemeExample />,
  play: async ({canvasElement}) => {
    expect(await barFills(canvasElement)).toEqual([
      'rgb(0, 90, 78)',
      'rgb(122, 46, 0)',
    ]);
  },
};

export const RuntimeThemeSwitch: Story = {
  render: () => <RuntimeThemeSwitchExample />,
  play: async ({canvasElement}) => {
    expect(await barFills(canvasElement)).toEqual([
      'rgb(0, 90, 78)',
      'rgb(122, 46, 0)',
    ]);

    const chart = canvasElement.querySelector('svg.recharts-surface');
    const firstBar = barElements(canvasElement)[0];
    expect(chart).not.toBeNull();
    expect(firstBar).not.toBeUndefined();
    if (chart instanceof SVGElement) {
      chart.focus();
      expect(document.activeElement).toBe(chart);
    }

    const button = canvasElement.querySelector('button');
    expect(button).toHaveTextContent('Switch to dark mode');
    button?.click();

    await waitFor(async () => {
      expect(await barFills(canvasElement)).toEqual([
        'rgb(114, 225, 193)',
        'rgb(255, 178, 128)',
      ]);
    });
    expect(canvasElement.querySelector('svg.recharts-surface')).toBe(chart);
    expect(barElements(canvasElement)[0]).toBe(firstBar);
    if (chart instanceof SVGElement) {
      expect(document.activeElement).toBe(chart);
    }
  },
};
