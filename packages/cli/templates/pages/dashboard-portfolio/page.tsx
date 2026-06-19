// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';

import {
  XDSVStack,
  XDSHStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSIcon} from '@xds/core/Icon';
import {XDSLink} from '@xds/core/Link';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSTable, proportional} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSDivider} from '@xds/core/Divider';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import {ArrowUpIcon, ArrowDownIcon} from '@heroicons/react/24/outline';

// ============= DATA =============

// Portfolio value over ~12 months (Oct 2024 → Oct 2025), one data point per day.
// Realistic fluctuations: dips in Feb–Mar, recovery in summer, climb into fall.
const portfolioData = (() => {
  const anchors: Array<[number, number]> = [
    [0, 230000],
    [14, 238000],
    [28, 245000],
    [42, 250000],
    [56, 245000],
    [70, 258000],
    [84, 252000],
    [98, 260000],
    [112, 255000],
    [126, 245000],
    [140, 222000],
    [154, 218000],
    [168, 225000],
    [182, 232000],
    [196, 225000],
    [210, 235000],
    [224, 240000],
    [238, 245000],
    [252, 235000],
    [266, 248000],
    [280, 255000],
    [294, 260000],
    [308, 268000],
    [322, 275000],
    [336, 278000],
    [350, 285000],
    [364, 288000],
    [378, 290000],
    [392, 292000],
    [406, 294200],
  ];
  const totalDays = anchors[anchors.length - 1][0];
  const monthPerDay = 12 / totalDays;
  const out: Array<{month: number; label: string; value: number}> = [];
  let ai = 0;
  for (let day = 0; day <= totalDays; day++) {
    while (ai < anchors.length - 2 && day >= anchors[ai + 1][0]) {
      ai++;
    }
    const [d0, v0] = anchors[ai];
    const [d1, v1] = anchors[ai + 1];
    const t = (day - d0) / (d1 - d0);
    const base = v0 + (v1 - v0) * t;
    const seed = Math.sin(day * 12.9898 + 78.233) * 43758.5453;
    const noise = (seed - Math.floor(seed) - 0.5) * 3600;
    out.push({
      month: day * monthPerDay,
      label: `Day ${day + 1}`,
      value: Math.round(base + noise),
    });
  }
  return out;
})();

const xAxisTicks = [0, 3, 6, 9, 12];
const xAxisLabels: Record<number, string> = {
  0: 'Oct',
  3: 'Jan',
  6: 'Apr',
  9: 'Jul',
  12: 'Oct',
};

// KPI summary metrics
const metrics = [
  {value: '$294,200', change: '+14.8%', label: 'Total value'},
  {value: '14.8%', change: '+2.1%', label: 'Annual return'},
  {value: '2.8%', change: '$2,060/qtr', label: 'Dividend yield'},
  {value: '23', change: '+4 YTD', label: 'Total asset holdings'},
];

// Top holdings
const topAssets = [
  {ticker: 'AAPL', name: 'Apple Inc.', value: '$87,200', change: '+18.4%'},
  {ticker: 'MSFT', name: 'Microsoft Corp.', value: '$72,500', change: '+14.7%'},
  {ticker: 'NVDA', name: 'NVIDIA Corp.', value: '$63,800', change: '+31.2%'},
  {
    ticker: 'VTI',
    name: 'Vanguard Total Stock',
    value: '$58,400',
    change: '+11.3%',
  },
  {
    ticker: 'BND',
    name: 'Vanguard Total Bond',
    value: '$45,600',
    change: '+4.2%',
  },
];

// 96 points per series = one tick every 15 minutes across a 24h window.
// Deterministic LCG so the sparklines are stable across renders.
function genSpark(
  seed: number,
  start: number,
  end: number,
  volatility: number,
  N: number = 96,
): number[] {
  let s = seed >>> 0;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
  const points: number[] = [];
  let drift = 0;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const trend = start + (end - start) * t;
    // Multiple overlaid waves at different frequencies for session-like rhythm
    // plus high-frequency chop.
    const wave =
      Math.sin(t * Math.PI * 2.3 + seed * 0.13) * volatility * 1.4 +
      Math.sin(t * Math.PI * 5.7 + seed * 0.41) * volatility * 0.9 +
      Math.sin(t * Math.PI * 13.1 + seed * 0.07) * volatility * 0.5;
    // Loosely-correlated random walk so adjacent ticks jitter rather than glide.
    drift = drift * 0.55 + (rand() - 0.5) * volatility * 2.2;
    // Occasional sharper spike to mimic news-driven moves.
    const spike = rand() < 0.04 ? (rand() - 0.5) * volatility * 4 : 0;
    points.push(trend + wave + drift + spike);
  }
  return points;
}

// Market index cards — 24h sparkline data (every 15min, 96 points)
const marketIndices = [
  {
    name: 'Dow Jones',
    ticker: 'DJI',
    price: '43,821.67',
    change: '+0.42%',
    positive: true,
    spark: genSpark(1337, 78, 84, 3.2),
  },
  {
    name: 'NASDAQ',
    ticker: 'IXIC',
    price: '18,942.18',
    change: '-0.50%',
    positive: false,
    spark: genSpark(2042, 86, 78, 3.8),
  },
  {
    name: 'S&P 500',
    ticker: 'SPX',
    price: '5,918.33',
    change: '+0.21%',
    positive: true,
    spark: genSpark(3155, 71, 75, 2.8),
  },
  {
    name: 'NYSE Composite',
    ticker: 'NYA',
    price: '19,752.41',
    change: '-0.20%',
    positive: false,
    spark: genSpark(4287, 70, 65, 3.0),
  },
  {
    name: 'NVIDIA Corp.',
    ticker: 'NVDA',
    price: '$177.39',
    change: '+0.93%',
    positive: true,
    spark: genSpark(5519, 60, 67, 3.6),
  },
  {
    name: 'Intel Corp.',
    ticker: 'INTC',
    price: '$50.38',
    change: '+4.89%',
    positive: true,
    spark: genSpark(6701, 40, 51, 2.6),
  },
  {
    name: 'Nokia Corp.',
    ticker: 'NOK',
    price: '$8.82',
    change: '+6.65%',
    positive: true,
    spark: genSpark(7823, 30, 41, 2.4),
  },
  {
    name: 'Tesla, Inc.',
    ticker: 'TSLA',
    price: '$360.59',
    change: '-5.42%',
    positive: false,
    spark: genSpark(8945, 90, 76, 4.2),
  },
];

// Trending stocks table data
interface StockRow extends Record<string, unknown> {
  id: string;
  ticker: string;
  price: string;
  dailyPts: number;
  dailyPct: number;
  weekChg: number;
  spark: number[];
}

const trendingStocks: StockRow[] = [
  {
    id: '1',
    ticker: 'AAPL',
    price: '$188.72',
    dailyPts: 1.35,
    dailyPct: 0.72,
    weekChg: 22.4,
    spark: genSpark(11023, 60, 70, 2.6, 48),
  },
  {
    id: '2',
    ticker: 'MSFT',
    price: '$415.6',
    dailyPts: 3.2,
    dailyPct: 0.78,
    weekChg: 18.6,
    spark: genSpark(12591, 55, 65, 2.4, 48),
  },
  {
    id: '3',
    ticker: 'NVDA',
    price: '$177.39',
    dailyPts: 1.65,
    dailyPct: 0.93,
    weekChg: 45.2,
    spark: genSpark(13744, 40, 68, 3.8, 48),
  },
  {
    id: '4',
    ticker: 'AMZN',
    price: '$186.5',
    dailyPts: -0.8,
    dailyPct: -0.43,
    weekChg: 15.3,
    spark: genSpark(14882, 70, 63, 2.5, 48),
  },
  {
    id: '5',
    ticker: 'GOOGL',
    price: '$155.72',
    dailyPts: 2.1,
    dailyPct: 1.37,
    weekChg: 12.8,
    spark: genSpark(15967, 50, 60, 2.7, 48),
  },
  {
    id: '6',
    ticker: 'META',
    price: '$505.3',
    dailyPts: 4.5,
    dailyPct: 0.9,
    weekChg: 35.1,
    spark: genSpark(17105, 45, 61, 3.0, 48),
  },
  {
    id: '7',
    ticker: 'TSLA',
    price: '$360.59',
    dailyPts: -20.67,
    dailyPct: -5.42,
    weekChg: -8.3,
    spark: genSpark(18249, 90, 64, 4.4, 48),
  },
  {
    id: '8',
    ticker: 'INTC',
    price: '$50.38',
    dailyPts: 2.35,
    dailyPct: 4.89,
    weekChg: -12.5,
    spark: genSpark(19388, 65, 57, 2.8, 48),
  },
  {
    id: '9',
    ticker: 'AMD',
    price: '$162.45',
    dailyPts: -1.2,
    dailyPct: -0.73,
    weekChg: 28.7,
    spark: genSpark(20471, 50, 63, 2.9, 48),
  },
  {
    id: '10',
    ticker: 'NFLX',
    price: '$628.9',
    dailyPts: 5.4,
    dailyPct: 0.87,
    weekChg: 42.1,
    spark: genSpark(21556, 42, 58, 2.6, 48),
  },
];

// ============= CHART COMPONENTS =============

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{value: number}>;
  label?: number;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <XDSCard padding={3}>
      <XDSText type="supporting">
        {payload[0].value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        })}
      </XDSText>
    </XDSCard>
  );
}

function PortfolioChart() {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <AreaChart
        data={portfolioData}
        margin={{top: 10, right: 10, left: 0, bottom: 5}}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-data-categorical-green, #22c55e)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-data-categorical-green, #22c55e)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          horizontal
          vertical={false}
          stroke="var(--color-border, rgba(5, 54, 89, 0.1))"
        />
        <XAxis
          dataKey="month"
          type="number"
          domain={[0, 12]}
          ticks={xAxisTicks}
          tickFormatter={(v: number) => xAxisLabels[v] ?? ''}
          tick={{
            fontSize: 'var(--font-size-sm, 12px)',
            fill: 'var(--color-text-secondary, #4E606F)',
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[200000, 320000]}
          ticks={[200000, 240000, 280000, 320000]}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          tick={{
            fontSize: 'var(--font-size-sm, 12px)',
            fill: 'var(--color-text-secondary, #4E606F)',
          }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{stroke: 'var(--color-border, rgba(5, 54, 89, 0.1))'}}
        />
        <Area
          type="linear"
          dataKey="value"
          stroke="var(--color-data-categorical-green, #22c55e)"
          strokeWidth={1.5}
          fill="url(#portfolioGradient)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============= CARD COMPONENTS =============

function Sparkline({data, positive}: {data: number[]; positive: boolean}) {
  const chartData = data.map((v, i) => ({i, v}));
  const color = positive
    ? 'var(--color-data-categorical-green, #0B991F)'
    : 'var(--color-data-categorical-red, #E5484D)';
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart
        data={chartData}
        margin={{top: 2, right: 0, left: 0, bottom: 2}}>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Line
          type="linear"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MarketCard({
  name,
  ticker,
  price,
  change,
  positive,
  spark,
}: {
  name: string;
  ticker: string;
  price: string;
  change: string;
  positive: boolean;
  spark: number[];
}) {
  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSVStack gap={0}>
          <XDSHeading level={3}>{name}</XDSHeading>
          <XDSText type="supporting" color="secondary">
            {ticker}
          </XDSText>
        </XDSVStack>
        <Sparkline data={spark} positive={positive} />
        <XDSHStack gap={3} vAlign="center">
          <XDSText type="display-3" weight="bold">
            {price}
          </XDSText>
          <XDSHStack gap={1} vAlign="center">
            <XDSIcon
              icon={positive ? ArrowUpIcon : ArrowDownIcon}
              size="xsm"
              color={positive ? 'success' : 'error'}
            />
            <XDSText type="body" color="secondary">
              {change}
            </XDSText>
          </XDSHStack>
        </XDSHStack>
      </XDSVStack>
    </XDSCard>
  );
}

function TrendSparkline({data, positive}: {data: number[]; positive: boolean}) {
  const chartData = data.map((v, i) => ({i, v}));
  const color = positive
    ? 'var(--color-data-categorical-green, #0B991F)'
    : 'var(--color-data-categorical-red, #E5484D)';
  return (
    <ResponsiveContainer width="100%" height={24}>
      <LineChart
        data={chartData}
        margin={{top: 2, right: 0, left: 0, bottom: 2}}>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Line
          type="linear"
          dataKey="v"
          stroke={color}
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ColoredValue({
  value,
  isPositive,
}: {
  value: string;
  isPositive: boolean;
}) {
  return <XDSBadge label={value} variant={isPositive ? 'green' : 'red'} />;
}

const trendingColumns: XDSTableColumn<StockRow>[] = [
  {
    key: 'ticker',
    header: 'Ticker',
    width: proportional(1),
    renderCell: (row: StockRow) => (
      <XDSText type="body" weight="bold">
        {row.ticker}
      </XDSText>
    ),
  },
  {key: 'price', header: 'Price', width: proportional(1)},
  {
    key: 'dailyPts',
    header: 'Daily Chg (pts)',
    width: proportional(1),
    renderCell: (row: StockRow) => {
      const isPos = row.dailyPts >= 0;
      const formatted = (isPos ? '+' : '') + row.dailyPts.toFixed(2);
      return <ColoredValue value={formatted} isPositive={isPos} />;
    },
  },
  {
    key: 'dailyPct',
    header: 'Daily Chg (%)',
    width: proportional(1),
    renderCell: (row: StockRow) => {
      const isPos = row.dailyPct >= 0;
      const formatted = (isPos ? '+' : '') + row.dailyPct.toFixed(2) + '%';
      return <ColoredValue value={formatted} isPositive={isPos} />;
    },
  },
  {
    key: 'weekChg',
    header: '52W Chg (%)',
    width: proportional(1),
    renderCell: (row: StockRow) => {
      const isPos = row.weekChg >= 0;
      const formatted = (isPos ? '+' : '') + row.weekChg.toFixed(1) + '%';
      return <ColoredValue value={formatted} isPositive={isPos} />;
    },
  },
  {
    key: 'spark',
    header: '24h Trend',
    width: proportional(1),
    renderCell: (row: StockRow) => (
      <TrendSparkline data={row.spark} positive={row.dailyPct >= 0} />
    ),
  },
];

function MetricCard({
  value,
  change,
  label,
}: {
  value: string;
  change: string;
  label: string;
}) {
  const positive = !change.startsWith('-');
  return (
    <XDSCard>
      <XDSVStack gap={1}>
        <XDSHStack gap={3} vAlign="center">
          <XDSText type="display-3" weight="bold">
            {value}
          </XDSText>
          <XDSHStack gap={1} vAlign="center">
            <XDSIcon
              icon={positive ? ArrowUpIcon : ArrowDownIcon}
              size="xsm"
              color={positive ? 'success' : 'error'}
            />
            <XDSText type="body" color="secondary">
              {change}
            </XDSText>
          </XDSHStack>
        </XDSHStack>
        <XDSText type="body" color="secondary">
          {label}
        </XDSText>
      </XDSVStack>
    </XDSCard>
  );
}

function AssetRow({
  ticker,
  name,
  value,
  change,
}: {
  ticker: string;
  name: string;
  value: string;
  change: string;
}) {
  return (
    <XDSListItem
      label={<XDSText weight="bold">{ticker}</XDSText>}
      description={name}
      href="#"
      startContent={<XDSAvatar name={ticker} size="small" />}
      endContent={
        <XDSVStack gap={0} hAlign="end">
          <XDSText type="body">{value}</XDSText>
          <XDSBadge
            label={change}
            variant={change.startsWith('-') ? 'red' : 'green'}
          />
        </XDSVStack>
      }
    />
  );
}

// ============= SIDENAV =============

// ============= MAIN COMPONENT =============

export default function DashboardPortfolioTemplate() {
  const [timeRange, setTimeRange] = useState('1 year');

  return (
    <XDSLayout
      height="fill"
      content={
        <XDSLayoutContent padding={6}>
          <XDSVStack gap={6}>
            {/* Page header */}
            <XDSHStack hAlign="between" vAlign="center">
              <XDSHeading level={1}>My Portfolio</XDSHeading>
              <XDSDropdownMenu
                button={{
                  label: timeRange,
                  variant: 'secondary',
                  size: 'lg',
                }}
                hasChevron
                items={[
                  {label: '1 month', onClick: () => setTimeRange('1 month')},
                  {label: '3 months', onClick: () => setTimeRange('3 months')},
                  {label: '6 months', onClick: () => setTimeRange('6 months')},
                  {label: '1 year', onClick: () => setTimeRange('1 year')},
                  {label: '5 years', onClick: () => setTimeRange('5 years')},
                  {label: 'All time', onClick: () => setTimeRange('All time')},
                ]}
              />
            </XDSHStack>

            {/* KPI metric cards */}
            <XDSGrid columns={{minWidth: 280, repeat: 'fit'}} gap={4}>
              {Array.from({length: Math.ceil(metrics.length / 2)}, (_, i) => (
                <XDSGrid
                  key={i}
                  columns={{minWidth: 280, repeat: 'fit'}}
                  gap={4}>
                  {metrics.slice(i * 2, i * 2 + 2).map(m => (
                    <MetricCard key={m.label} {...m} />
                  ))}
                </XDSGrid>
              ))}
            </XDSGrid>

            {/* Chart + Top assets */}
            <XDSGrid columns={{minWidth: 280, max: 4}} gap={4}>
              <XDSGridSpan columns={3}>
                <XDSCard>
                  <XDSVStack gap={4}>
                    <XDSHStack hAlign="between" vAlign="center">
                      <XDSHeading level={3}>Portfolio Value</XDSHeading>
                      <XDSLink href="#">View details</XDSLink>
                    </XDSHStack>
                    <PortfolioChart />
                  </XDSVStack>
                </XDSCard>
              </XDSGridSpan>
              <XDSGridSpan columns={1}>
                <XDSCard>
                  <XDSVStack gap={4}>
                    <XDSHStack hAlign="between" vAlign="center">
                      <XDSHeading level={3}>Top Assets</XDSHeading>
                      <XDSLink href="#">View all</XDSLink>
                    </XDSHStack>
                    <XDSList density="spacious">
                      {topAssets.map(asset => (
                        <AssetRow key={asset.ticker} {...asset} />
                      ))}
                    </XDSList>
                  </XDSVStack>
                </XDSCard>
              </XDSGridSpan>
            </XDSGrid>

            <XDSDivider />

            {/* Market section */}
            <XDSHStack hAlign="between" vAlign="start">
              <XDSVStack gap={1}>
                <XDSHeading level={1}>Market Today</XDSHeading>
                <XDSText type="body" color="secondary">
                  Past 24 hours
                </XDSText>
              </XDSVStack>
              <XDSButton label="View more" variant="secondary" size="lg" />
            </XDSHStack>

            {/* Market index cards */}
            <XDSGrid columns={{minWidth: 320, repeat: 'fit'}} gap={4}>
              {marketIndices.map(m => (
                <MarketCard key={m.ticker} {...m} />
              ))}
            </XDSGrid>

            {/* Trending stocks table */}
            <XDSCard>
              <XDSVStack gap={4}>
                <XDSHeading level={3}>Trending Stocks</XDSHeading>
                <XDSTable<StockRow>
                  data={trendingStocks}
                  columns={trendingColumns}
                  idKey="id"
                  hasHover
                  dividers="rows"
                />
              </XDSVStack>
            </XDSCard>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
