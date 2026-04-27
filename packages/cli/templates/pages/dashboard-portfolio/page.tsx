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
import {
  AreaChart,
  Area,
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
      </XDSVStack>
    </XDSAppShell>
  );
}
