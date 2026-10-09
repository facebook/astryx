// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {Button, Card, Stack, Text} from '@astryxdesign/core';
import {Theme, defineTheme, useTheme} from '@astryxdesign/core/theme';
import {Heading} from '@astryxdesign/core/Text';
import {useCssLengthInPixels} from './chartThemingUtils';
import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';
import {
  colorVars,
  radiusVars,
  shadowVars,
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
  highlightRevenue = false,
  useThemeRadius = true,
}: {
  highlightRevenue?: boolean;
  useThemeRadius?: boolean;
} = {}) {
  const {token} = useTheme();
  const themeRadius = useCssLengthInPixels(token('--radius-element'));
  const barRadius = useThemeRadius ? themeRadius : 0;

  return (
    <Card>
      <Stack direction="vertical" gap={4}>
        <Stack direction="vertical" gap={1}>
          <Heading level={3}>Quarterly performance</Heading>
          <Text type="supporting" color="secondary">
            Recharts uses the active Astryx theme for series, typography, active
            state, tooltip radius, and bar radius.
          </Text>
        </Stack>
        <div
          {...stylex.props(styles.chart)}
          aria-label="Quarterly performance chart"
          data-bar-radius={barRadius}
          role="group"
          tabIndex={0}>
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
                  boxShadow: shadowVars['--shadow-med'],
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
                fill={highlightRevenue ? hoverSeries.revenue : series.revenue}
                isAnimationActive={false}
                name="Revenue"
                radius={[barRadius, barRadius, 0, 0]}
                stroke={
                  highlightRevenue
                    ? colorVars['--color-border-emphasized']
                    : undefined
                }
                strokeWidth={highlightRevenue ? 2 : undefined}
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

function ThemeTokensExample() {
  const [highlightRevenue, setHighlightRevenue] = useState(false);
  return (
    <Stack direction="vertical" gap={3}>
      <Button
        label={
          highlightRevenue ? 'Clear Revenue highlight' : 'Highlight Revenue'
        }
        onClick={() => setHighlightRevenue(current => !current)}
      />
      <ThemeAwareRechartsExample highlightRevenue={highlightRevenue} />
    </Stack>
  );
}

const BAR_SELECTORS = {
  revenue: `.recharts-bar-rectangle path[fill="${series.revenue}"]`,
  costs: `.recharts-bar-rectangle path[fill="${series.costs}"]`,
} as const;

const BAR_SELECTOR = Object.values(BAR_SELECTORS).join(', ');

function barElements(canvasElement: HTMLElement): SVGElement[] {
  return Array.from(canvasElement.querySelectorAll<SVGElement>(BAR_SELECTOR));
}

async function barFills(
  canvasElement: HTMLElement,
): Promise<Record<keyof typeof BAR_SELECTORS, string>> {
  const fills = {revenue: '', costs: ''};
  await waitFor(() => {
    for (const [seriesName, selector] of Object.entries(BAR_SELECTORS)) {
      const bar = canvasElement.querySelector<SVGElement>(selector);
      expect(bar).not.toBeNull();
      if (bar) {
        fills[seriesName as keyof typeof BAR_SELECTORS] =
          getComputedStyle(bar).fill;
      }
    }
    expect(Object.values(fills)).not.toContain('');
  });
  return fills;
}

function resolveSvgFill(reference: SVGElement, fill: string): string {
  const svg = reference.ownerSVGElement;
  if (!svg) {
    throw new Error('Expected the chart bar to belong to an SVG surface.');
  }
  const probe = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  probe.setAttribute('fill', fill);
  probe.setAttribute('height', '1');
  probe.setAttribute('width', '1');
  probe.setAttribute('x', '-2');
  probe.setAttribute('y', '-2');
  probe.style.visibility = 'hidden';
  svg.appendChild(probe);
  const resolved = getComputedStyle(probe).fill;
  probe.remove();
  return resolved;
}

export const ThemeTokens: Story = {
  render: () => <ThemeTokensExample />,
  play: async ({canvasElement}) => {
    const restingFills = await barFills(canvasElement);
    expect(
      within(canvasElement).getByRole('group', {
        name: 'Quarterly performance chart',
      }),
    ).toBeVisible();
    const revenueBar = canvasElement.querySelector<SVGElement>(
      BAR_SELECTORS.revenue,
    );
    expect(revenueBar).not.toBeNull();
    if (revenueBar) {
      const expectedActiveFill = resolveSvgFill(
        revenueBar,
        hoverSeries.revenue,
      );
      expect(expectedActiveFill).not.toBe(restingFills.revenue);
      await userEvent.click(
        within(canvasElement).getByRole('button', {
          name: 'Highlight Revenue',
        }),
      );
      await waitFor(() => {
        const highlightedRevenueBar = Array.from(
          canvasElement.querySelectorAll<SVGElement>(
            '.recharts-bar-rectangle path',
          ),
        ).find(bar => bar.getAttribute('fill') === hoverSeries.revenue);
        expect(highlightedRevenueBar).not.toBeUndefined();
        if (highlightedRevenueBar) {
          expect(getComputedStyle(highlightedRevenueBar).fill).toBe(
            expectedActiveFill,
          );
          expect(highlightedRevenueBar).toHaveAttribute(
            'stroke',
            colorVars['--color-border-emphasized'],
          );
        }
      });
    }
    const radius = Number(
      canvasElement
        .querySelector('[data-bar-radius]')
        ?.getAttribute('data-bar-radius'),
    );
    expect(Number.isFinite(radius)).toBe(true);
    expect(radius).toBeGreaterThan(5);
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
    expect(await barFills(canvasElement)).toEqual({
      revenue: 'rgb(0, 90, 78)',
      costs: 'rgb(122, 46, 0)',
    });
  },
};

export const RuntimeThemeSwitch: Story = {
  render: () => <RuntimeThemeSwitchExample />,
  play: async ({canvasElement}) => {
    expect(await barFills(canvasElement)).toEqual({
      revenue: 'rgb(0, 90, 78)',
      costs: 'rgb(122, 46, 0)',
    });

    const surface = canvasElement.querySelector('svg.recharts-surface');
    const focusTarget = canvasElement.querySelector('[data-bar-radius]');
    const firstBar = barElements(canvasElement)[0];
    expect(surface).not.toBeNull();
    expect(focusTarget).toBeInstanceOf(HTMLElement);
    expect(firstBar).not.toBeUndefined();
    if (focusTarget instanceof HTMLElement) {
      focusTarget.focus();
      expect(document.activeElement).toBe(focusTarget);
    }

    const button = canvasElement.querySelector('button');
    expect(button).toHaveTextContent('Switch to dark mode');
    button?.click();

    await waitFor(async () => {
      expect(await barFills(canvasElement)).toEqual({
        revenue: 'rgb(114, 225, 193)',
        costs: 'rgb(255, 178, 128)',
      });
    });
    expect(canvasElement.querySelector('svg.recharts-surface')).toBe(surface);
    expect(canvasElement.querySelector('[data-bar-radius]')).toBe(focusTarget);
    expect(barElements(canvasElement)[0]).toBe(firstBar);
    if (focusTarget instanceof HTMLElement) {
      expect(document.activeElement).toBe(focusTarget);
    }
  },
};
