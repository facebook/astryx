'use client';

import {useState} from 'react';

import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSGrid} from '@xds/core/Grid';
import {XDSIcon} from '@xds/core/Icon';
import {XDSLink} from '@xds/core/Link';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSTable, proportional, pixel} from '@xds/core/Table';
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

import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ClockIcon as ClockIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid';

// ============= DATA =============

// Portfolio value over ~12 months (Oct 2024 → Oct 2025)
// Realistic fluctuations: dips in Feb–Mar, recovery in summer, climb into fall
const portfolioData = [
  {month: 0, label: 'Oct 1', value: 230000},
  {month: 0.4, label: 'Oct 15', value: 238000},
  {month: 0.8, label: 'Oct 29', value: 245000},
  {month: 1.2, label: 'Nov 12', value: 250000},
  {month: 1.6, label: 'Nov 26', value: 245000},
  {month: 2, label: 'Dec 10', value: 258000},
  {month: 2.4, label: 'Dec 24', value: 252000},
  {month: 3, label: 'Jan 7', value: 260000},
  {month: 3.4, label: 'Jan 21', value: 255000},
  {month: 3.8, label: 'Feb 4', value: 245000},
  {month: 4.2, label: 'Feb 18', value: 222000},
  {month: 4.6, label: 'Mar 4', value: 218000},
  {month: 5, label: 'Mar 18', value: 225000},
  {month: 5.4, label: 'Apr 1', value: 232000},
  {month: 5.8, label: 'Apr 15', value: 225000},
  {month: 6.2, label: 'Apr 29', value: 235000},
  {month: 6.6, label: 'May 13', value: 240000},
  {month: 7, label: 'May 27', value: 245000},
  {month: 7.4, label: 'Jun 10', value: 235000},
  {month: 7.8, label: 'Jun 24', value: 248000},
  {month: 8.2, label: 'Jul 8', value: 255000},
  {month: 8.6, label: 'Jul 22', value: 260000},
  {month: 9, label: 'Aug 5', value: 268000},
  {month: 9.4, label: 'Aug 19', value: 275000},
  {month: 9.8, label: 'Sep 2', value: 278000},
  {month: 10.2, label: 'Sep 16', value: 285000},
  {month: 10.6, label: 'Sep 30', value: 288000},
  {month: 11, label: 'Oct 4', value: 290000},
  {month: 11.4, label: 'Oct 8', value: 292000},
  {month: 11.8, label: 'Oct 15', value: 294200},
];

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

// Market index cards — 24h sparkline data (30 points each)
// prettier-ignore
const marketIndices = [
  {name: 'Dow Jones', ticker: 'DJI', price: '43,821.67', change: '+0.42%', positive: true,
    spark: [80,78,82,79,81,77,83,80,78,82,84,79,81,83,80,78,82,79,85,83,80,82,84,81,83,85,82,84,86,83]},
  {name: 'NASDAQ', ticker: 'IXIC', price: '18,942.18', change: '-0.50%', positive: false,
    spark: [85,87,83,86,84,88,85,83,87,84,82,86,83,81,84,82,85,83,80,82,79,83,80,82,78,81,79,82,80,78]},
  {name: 'S&P 500', ticker: 'SPX', price: '5,918.33', change: '+0.21%', positive: true,
    spark: [72,70,74,71,73,69,72,74,71,73,75,72,74,71,73,75,72,74,76,73,75,72,74,76,73,75,77,74,76,73]},
  {name: 'NYSE Composite', ticker: 'NYA', price: '19,752.41', change: '-0.20%', positive: false,
    spark: [68,70,67,71,69,72,68,70,67,69,71,68,70,67,69,66,68,70,67,65,68,66,69,67,65,68,66,64,67,65]},
  {name: 'NVIDIA Corp.', ticker: 'NVDA', price: '$177.39', change: '+0.93%', positive: true,
    spark: [60,62,58,63,61,64,60,62,65,63,61,64,62,65,63,66,64,62,65,67,64,66,63,65,67,64,66,68,65,67]},
  {name: 'Intel Corp.', ticker: 'INTC', price: '$50.38', change: '+4.89%', positive: true,
    spark: [40,38,42,39,41,43,40,42,44,41,43,45,42,44,46,43,45,47,44,46,48,45,47,49,46,48,50,47,49,51]},
  {name: 'Nokia Corp.', ticker: 'NOK', price: '$8.82', change: '+6.65%', positive: true,
    spark: [30,28,32,29,31,33,30,32,34,31,33,35,32,34,36,33,35,37,34,36,38,35,37,39,36,38,40,37,39,41]},
  {name: 'Tesla, Inc.', ticker: 'TSLA', price: '$360.59', change: '-5.42%', positive: false,
    spark: [90,88,92,89,87,91,88,86,89,87,84,88,85,83,86,84,81,85,82,80,83,81,78,82,79,77,80,78,75,79]},
];

// Trending stocks table data
interface StockRow extends Record<string, unknown> {
  id: string;
  ticker: string;
  price: string;
  dailyPts: number;
  dailyPct: number;
  weekChg: number;
  // prettier-ignore
  spark: number[];
}

const trendingStocks: StockRow[] = [
  // prettier-ignore
  {id: '1', ticker: 'AAPL', price: '$188.72', dailyPts: 1.35, dailyPct: 0.72, weekChg: 22.4, spark: [60,62,61,63,62,64,63,65,64,66,65,67,66,68,67,69,68,67,69,68,70,69,71,70,69,71,70,72,71,70]},
  // prettier-ignore
  {id: '2', ticker: 'MSFT', price: '$415.6', dailyPts: 3.20, dailyPct: 0.78, weekChg: 18.6, spark: [55,57,56,58,57,59,58,60,59,61,60,62,61,60,62,61,63,62,64,63,62,64,63,65,64,63,65,64,66,65]},
  // prettier-ignore
  {id: '3', ticker: 'NVDA', price: '$177.39', dailyPts: 1.65, dailyPct: 0.93, weekChg: 45.2, spark: [40,42,44,43,45,47,46,48,50,49,51,53,52,54,53,55,57,56,58,60,59,61,60,62,64,63,65,64,66,68]},
  // prettier-ignore
  {id: '4', ticker: 'AMZN', price: '$186.5', dailyPts: -0.80, dailyPct: -0.43, weekChg: 15.3, spark: [70,68,69,67,68,66,67,65,66,64,65,66,64,65,63,64,65,63,64,62,63,64,62,63,61,62,63,61,62,63]},
  // prettier-ignore
  {id: '5', ticker: 'GOOGL', price: '$155.72', dailyPts: 2.10, dailyPct: 1.37, weekChg: 12.8, spark: [50,52,51,53,52,54,53,55,54,56,55,57,56,58,57,56,58,57,59,58,60,59,58,60,59,61,60,62,61,60]},
  // prettier-ignore
  {id: '6', ticker: 'META', price: '$505.3', dailyPts: 4.50, dailyPct: 0.90, weekChg: 35.1, spark: [45,47,46,48,47,49,48,50,49,51,50,52,51,53,52,54,53,55,54,56,55,57,56,58,57,59,58,60,59,61]},
  // prettier-ignore
  {id: '7', ticker: 'TSLA', price: '$360.59', dailyPts: -20.67, dailyPct: -5.42, weekChg: -8.3, spark: [90,88,86,87,85,83,84,82,80,81,79,77,78,76,74,75,73,71,72,70,68,69,67,65,66,64,62,63,61,79]},
  // prettier-ignore
  {id: '8', ticker: 'INTC', price: '$50.38', dailyPts: 2.35, dailyPct: 4.89, weekChg: -12.5, spark: [65,63,64,62,60,61,59,57,58,56,54,55,53,51,52,50,48,49,50,52,51,53,52,54,53,55,54,56,55,57]},
  // prettier-ignore
  {id: '9', ticker: 'AMD', price: '$162.45', dailyPts: -1.20, dailyPct: -0.73, weekChg: 28.7, spark: [50,52,51,53,55,54,56,55,57,56,58,57,59,58,60,59,61,60,62,61,60,62,61,63,62,64,63,62,64,63]},
  // prettier-ignore
  {id: '10', ticker: 'NFLX', price: '$628.9', dailyPts: 5.40, dailyPct: 0.87, weekChg: 42.1, spark: [42,44,43,45,44,46,45,47,46,48,47,49,48,50,49,51,50,52,51,53,52,54,53,55,54,56,55,57,56,58]},
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
  if (!active || !payload?.length) return null;
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
          type="monotone"
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
      <LineChart data={chartData}>
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
      <XDSVStack gap={2}>
        <XDSVStack gap={0}>
          <XDSText type="body" weight="semibold">
            {name}
          </XDSText>
          <XDSText type="supporting" color="secondary">
            {ticker}
          </XDSText>
        </XDSVStack>
        <Sparkline data={spark} positive={positive} />
        <XDSHStack gap={2} vAlign="center">
          <XDSHeading level={3}>{price}</XDSHeading>
          <XDSIcon
            icon={positive ? ArrowUpIcon : ArrowDownIcon}
            size="xsm"
            color={positive ? 'positive' : 'negative'}
          />
          <XDSBadge label={change} variant={positive ? 'green' : 'red'} />
        </XDSHStack>
        <XDSText type="supporting" color="secondary">
          Past 24 hrs
        </XDSText>
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
    <ResponsiveContainer width={80} height={24}>
      <LineChart data={chartData}>
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
  {key: 'ticker', header: 'Ticker', width: pixel(120)},
  {key: 'price', header: 'Price', width: pixel(120)},
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
    width: pixel(120),
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
  return (
    <XDSCard>
      <XDSVStack gap={1}>
        <XDSHStack gap={2} vAlign="center">
          <XDSHeading level={3}>{value}</XDSHeading>
          <XDSBadge label={change} variant="green" />
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
      label={ticker}
      description={name}
      startContent={<XDSAvatar name={ticker} size="small" />}
      endContent={
        <XDSVStack gap={0} hAlign="end">
          <XDSText type="body">{value}</XDSText>
          <XDSBadge label={change} variant="green" />
        </XDSVStack>
      }
    />
  );
}

// ============= MAIN COMPONENT =============

export default function DashboardPortfolioTemplate() {
  const [timeRange, setTimeRange] = useState('1 year');

  return (
    <XDSAppShell
      sideNav={
        <XDSSideNav
          header={
            <XDSSideNavHeading
              icon={
                <XDSNavIcon
                  icon={<XDSIcon icon={ArrowTrendingUpIcon} size="sm" />}
                />
              }
              heading="Acme Invest"
              headingHref="#"
            />
          }
          footer={
            <XDSSideNavSection title="Account" isHeaderHidden>
              <XDSSideNavItem
                label="Settings"
                icon={Cog6ToothIcon}
                selectedIcon={Cog6ToothIconSolid}
                href="#"
              />
            </XDSSideNavSection>
          }>
          <XDSSideNavSection title="Overview" isHeaderHidden>
            <XDSSideNavItem
              label="Portfolio"
              icon={ChartBarIcon}
              selectedIcon={ChartBarIconSolid}
              isSelected
              href="#"
            />
            <XDSSideNavItem
              label="Assets"
              icon={CurrencyDollarIcon}
              selectedIcon={CurrencyDollarIconSolid}
              href="#"
            />
            <XDSSideNavItem
              label="Transactions"
              icon={ClockIcon}
              selectedIcon={ClockIconSolid}
              href="#"
            />
            <XDSSideNavItem
              label="Reports"
              icon={DocumentTextIcon}
              selectedIcon={DocumentTextIconSolid}
              href="#"
            />
          </XDSSideNavSection>
        </XDSSideNav>
      }
      variant="elevated"
      height="auto"
      contentPadding={6}>
      <XDSVStack gap={6}>
        {/* Page header */}
        <XDSHStack hAlign="between" vAlign="center">
          <XDSHeading level={2}>My Portfolio</XDSHeading>
          <XDSDropdownMenu
            button={{
              label: timeRange,
              variant: 'secondary',
              size: 'sm',
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
        <XDSGrid columns={{minWidth: 220, repeat: 'fit'}} gap={4}>
          {metrics.map(m => (
            <MetricCard key={m.label} {...m} />
          ))}
        </XDSGrid>

        {/* Chart + Top assets */}
        <XDSGrid columns={{minWidth: 300, repeat: 'fit'}} gap={4}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHStack hAlign="between" vAlign="center">
                <XDSHeading level={4}>Portfolio Value</XDSHeading>
                <XDSLink label="View details" href="#">
                  View details
                </XDSLink>
              </XDSHStack>
              <PortfolioChart />
            </XDSVStack>
          </XDSCard>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHStack hAlign="between" vAlign="center">
                <XDSHeading level={4}>Top Assets</XDSHeading>
                <XDSLink label="View all" href="#">
                  View all
                </XDSLink>
              </XDSHStack>
              <XDSList density="balanced">
                {topAssets.map(asset => (
                  <AssetRow key={asset.ticker} {...asset} />
                ))}
              </XDSList>
            </XDSVStack>
          </XDSCard>
        </XDSGrid>

        <XDSDivider />

        {/* Market section */}
        <XDSHStack hAlign="between" vAlign="center">
          <XDSHeading level={3}>Market</XDSHeading>
          <XDSButton label="View more" variant="secondary" size="md" />
        </XDSHStack>

        {/* Market index cards */}
        <XDSGrid columns={{minWidth: 240, repeat: 'fit'}} gap={4}>
          {marketIndices.map(m => (
            <MarketCard key={m.ticker} {...m} />
          ))}
        </XDSGrid>

        {/* Trending stocks table */}
        <XDSCard>
          <XDSVStack gap={4}>
            <XDSHeading level={4}>Trending Stocks</XDSHeading>
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
    </XDSAppShell>
  );
}
