'use client';

import {useState} from 'react';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSStack} from '@xds/core/Stack';
import {XDSTable, proportional} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSDivider} from '@xds/core/Divider';
import {XDSLink} from '@xds/core/Link';

// ============= ICONS =============

// SideNav icons
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const LifecycleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);
const AnalyticsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);
const ProjectsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
);
const TeamIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const DataIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const ReportsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);
const WordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  </svg>
);
const HelpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
);
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const MoreIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

// Content icons
const ReloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

// ============= DATA =============

// Active users chart data (24 points over 24h: Apr 1 14:00 → Apr 2 14:00)
const allUsersLine = [
  115, 118, 120, 112, 100, 85, 65, 55, 58, 65, 82, 80, 75, 65, 52, 48, 50, 58,
  72, 90, 105, 115, 125, 130,
];
const desktopLine = [
  45, 48, 52, 58, 62, 68, 75, 80, 78, 76, 74, 72, 68, 64, 58, 55, 56, 60, 65,
  70, 76, 74, 70, 65,
];
const mobileLine = [
  25, 27, 32, 36, 40, 44, 45, 42, 36, 30, 25, 22, 18, 15, 12, 10, 12, 16, 22,
  28, 30, 28, 24, 20,
];

// Metric cards
const metrics = [
  {
    label: 'Monthly Visitors',
    value: '27.3 k',
    change: '+5.8%',
    positive: true,
  },
  {
    label: 'Monthly Page Views',
    value: '48.2 k',
    change: '+2.4%',
    positive: true,
  },
  {
    label: 'Avg. Session',
    value: '4.5 min',
    change: '-2s',
    positive: false,
  },
  {
    label: 'Bounce Rate',
    value: '42.3%',
    change: '-3.1%',
    positive: false,
  },
];

// Sparkline data for each metric card
const sparklines = [
  [20, 25, 22, 28, 30, 35, 32, 38, 40, 45, 42, 48, 50, 55, 52, 58, 60],
  [30, 45, 35, 50, 40, 55, 45, 60, 50, 55, 48, 52, 58, 50, 55, 62, 58],
  [55, 52, 50, 48, 52, 45, 48, 42, 45, 40, 38, 42, 35, 38, 32, 30, 28],
  [48, 46, 44, 46, 42, 44, 40, 42, 38, 40, 36, 38, 34, 36, 32, 34, 30],
];

// Demographics
const regionData = [
  {label: 'NORAM', value: 38, color: '#3B82F6'},
  {label: 'EMEA', value: 28, color: '#EF4444'},
  {label: 'APAC', value: 22, color: '#8B5CF6'},
  {label: 'LATAM', value: 8, color: '#EC4899'},
  {label: 'Other', value: 4, color: '#334155'},
];

const roleData = [
  {label: 'Engineer', value: 45, color: '#3B82F6'},
  {label: 'Manager', value: 20, color: '#F97316'},
  {label: 'Designer', value: 15, color: '#14B8A6'},
  {label: 'Data Scientist', value: 12, color: '#8B5CF6'},
  {label: 'Other', value: 8, color: '#1E3A5F'},
];

// Engagement — Top pages
interface PageRow extends Record<string, unknown> {
  id: string;
  page: string;
  views: number;
  newUsers: string;
  avgTime: string;
  exits: string;
}

const topPagesData: PageRow[] = [
  {id: '1', page: '/home', views: 8420, newUsers: '62.3%', avgTime: '3:42', exits: '18.5%'},
  {id: '2', page: '/products', views: 6150, newUsers: '45.1%', avgTime: '4:15', exits: '22.8%'},
  {id: '3', page: '/pricing', views: 4830, newUsers: '38.7%', avgTime: '2:58', exits: '35.2%'},
  {id: '4', page: '/blog', views: 3920, newUsers: '71.4%', avgTime: '5:30', exits: '12.1%'},
  {id: '5', page: '/docs', views: 3410, newUsers: '29.8%', avgTime: '6:12', exits: '8.4%'},
  {id: '6', page: '/about', views: 2980, newUsers: '55.6%', avgTime: '2:15', exits: '28.3%'},
  {id: '7', page: '/contact', views: 2540, newUsers: '48.2%', avgTime: '1:48', exits: '41.7%'},
  {id: '8', page: '/changelog', views: 2210, newUsers: '22.1%', avgTime: '4:55', exits: '15.6%'},
  {id: '9', page: '/support', views: 1870, newUsers: '59.3%', avgTime: '3:22', exits: '30.9%'},
  {id: '10', page: '/careers', views: 1520, newUsers: '83.1%', avgTime: '2:34', exits: '45.2%'},
];

// Engagement — Top events
interface EventRow extends Record<string, unknown> {
  id: string;
  event: string;
  count: number;
  users: number;
}

const topEventsData: EventRow[] = [
  {id: '1', event: 'page_view', count: 18420, users: 12300},
  {id: '2', event: 'session_start', count: 14850, users: 9870},
  {id: '3', event: 'first_visit', count: 8230, users: 8230},
  {id: '4', event: 'user_engagement', count: 6120, users: 4510},
  {id: '5', event: 'click', count: 3540, users: 2680},
  {id: '6', event: 'scroll', count: 2910, users: 2140},
  {id: '7', event: 'form_submit', count: 1870, users: 1350},
  {id: '8', event: 'video_play', count: 1240, users: 980},
  {id: '9', event: 'search', count: 960, users: 720},
  {id: '10', event: 'share', count: 580, users: 410},
];



// ============= CHART COMPONENTS =============

function ChartLegendItem({color, label}: {color: string; label: string}) {
  return (
    <XDSHStack gap={2} vAlign="center">
      <svg width="16" height="3">
        <line x1="0" y1="1.5" x2="16" y2="1.5" stroke={color} strokeWidth="2" />
      </svg>
      <XDSText type="supporting" color="secondary">
        {label}
      </XDSText>
    </XDSHStack>
  );
}

function ActiveUsersChart() {
  const w = 900;
  const h = 250;
  const padL = 35;
  const padR = 10;
  const padT = 10;
  const padB = 30;
  const maxY = 140;
  const yTicks = [0, 20, 40, 60, 80, 100, 120];
  const xLabels = ['Apr 1 14:00', 'Apr 1 22:00', 'Apr 2 06:00', 'Apr 2 14:00'];

  const toX = (i: number, len: number) =>
    padL + (i / (len - 1)) * (w - padL - padR);
  const toY = (v: number) => padT + (1 - v / maxY) * (h - padT - padB);

  const makePath = (data: number[]) =>
    data
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i, data.length)},${toY(v)}`)
      .join(' ');

  return (
    <XDSVStack gap={3}>
      <div style={{position: 'relative', height: 280}}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          style={{width: '100%', height: '100%'}}
          preserveAspectRatio="xMidYMid meet">
          {/* Y-axis grid lines and labels */}
          {yTicks.map(tick => (
            <g key={tick}>
              <line
                x1={padL}
                y1={toY(tick)}
                x2={w - padR}
                y2={toY(tick)}
                stroke="var(--color-divider, #e5e5e5)"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={toY(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-text-secondary, #888)">
                {tick}
              </text>
            </g>
          ))}
          {/* X-axis labels */}
          {xLabels.map((label, i) => (
            <text
              key={label}
              x={padL + (i / (xLabels.length - 1)) * (w - padL - padR)}
              y={h - 5}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-secondary, #888)">
              {label}
            </text>
          ))}
          {/* Data lines */}
          <path
            d={makePath(allUsersLine)}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          <path
            d={makePath(desktopLine)}
            fill="none"
            stroke="#F97316"
            strokeWidth="2"
          />
          <path
            d={makePath(mobileLine)}
            fill="none"
            stroke="#4F46E5"
            strokeWidth="2"
          />
        </svg>
      </div>
      {/* Legend */}
      <XDSHStack gap={6} vAlign="center">
        <ChartLegendItem color="#3B82F6" label="All Users" />
        <ChartLegendItem color="#F97316" label="Desktop" />
        <ChartLegendItem color="#4F46E5" label="Mobile" />
      </XDSHStack>
    </XDSVStack>
  );
}

function Sparkline({data}: {data: number[]}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const pad = 2;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={40}
      preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-text-secondary, #999)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ============= CARD COMPONENTS =============

function MetricCard({
  label,
  value,
  change,
  positive,
  sparkline,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  sparkline: number[];
}) {
  return (
    <XDSCard>
      <XDSVStack gap={2}>
        <XDSHeading level={3}>
          {label}
        </XDSHeading>
        <XDSHeading level={2}>{value}</XDSHeading>
        <XDSBadge
          variant={positive ? 'success' : 'error'}
          label={`${positive ? '↑' : '↓'} ${change}`}
        />
        <XDSText type="supporting" color="secondary">
          Last 30 days vs. Previous
        </XDSText>
        <Sparkline data={sparkline} />
      </XDSVStack>
    </XDSCard>
  );
}

function StackedBarCard({
  title,
  data,
}: {
  title: string;
  data: Array<{label: string; value: number; color: string}>;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSHeading level={3}>
          {title}
        </XDSHeading>
        {/* Stacked horizontal bar */}
        <div style={{display: 'flex', height: 24, borderRadius: 8, overflow: 'hidden'}}>
          {data.map(d => (
            <div
              key={d.label}
              style={{flex: d.value, backgroundColor: d.color}}
            />
          ))}
        </div>
        {/* Legend */}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
          {data.map(d => (
            <XDSVStack key={d.label} gap={0}>
              <XDSHStack gap={2} vAlign="center">
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: d.color,
                    flexShrink: 0,
                  }}
                />
                <XDSText type="supporting">{d.label}</XDSText>
              </XDSHStack>
              <XDSText type="supporting" color="secondary">
                {d.value} - {((d.value / total) * 100).toFixed(2)}%
              </XDSText>
            </XDSVStack>
          ))}
        </div>
      </XDSVStack>
    </XDSCard>
  );
}

// ============= TABLE COMPONENTS =============

function TopPagesCard() {
  const maxViews = Math.max(...topPagesData.map(d => d.views));

  const columns: XDSTableColumn<PageRow>[] = [
    {key: 'page', header: 'Page', width: proportional(1.5)},
    {
      key: 'views',
      header: 'Views',
      width: proportional(2),
      renderCell: (item: PageRow) => (
        <XDSVStack gap={1}>
          <XDSProgressBar
            value={item.views}
            max={maxViews}
            label={`${item.page} views`}
            isLabelHidden
          />
          <XDSText type="supporting">
            {item.views.toLocaleString()} views
          </XDSText>
        </XDSVStack>
      ),
    },
    {key: 'newUsers', header: 'New Users', width: proportional(1)},
    {key: 'avgTime', header: 'Avg. Time', width: proportional(1)},
    {key: 'exits', header: '% Exits', width: proportional(1)},
  ];

  return (
    <XDSCard padding={0}>
      <XDSVStack>
        <div style={{padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <XDSText type="body" weight="bold">
            Top pages
          </XDSText>
          <XDSLink label="All pages" href="#">
            All pages
          </XDSLink>
        </div>
        <XDSTable<PageRow>
          data={topPagesData}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
        />
      </XDSVStack>
    </XDSCard>
  );
}

function TopEventsCard() {
  const maxCount = Math.max(...topEventsData.map(d => d.count));

  const columns: XDSTableColumn<EventRow>[] = [
    {key: 'event', header: 'Event', width: proportional(2)},
    {
      key: 'count',
      header: 'Count',
      width: proportional(2),
      renderCell: (item: EventRow) => (
        <XDSVStack gap={1}>
          <XDSProgressBar
            value={item.count}
            max={maxCount}
            label={`${item.count}`}
            isLabelHidden
          />
          <XDSText type="supporting">
            {item.count.toLocaleString()}
          </XDSText>
        </XDSVStack>
      ),
    },
    {key: 'users', header: 'Users', width: proportional(1)},
  ];

  return (
    <XDSCard padding={0}>
      <XDSVStack>
        <div style={{padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <XDSText type="body" weight="bold">
            Top events
          </XDSText>
          <XDSLink label="All events" href="#">
            All events
          </XDSLink>
        </div>
        <XDSTable<EventRow>
          data={topEventsData}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
        />
      </XDSVStack>
    </XDSCard>
  );
}

// ============= SIDENAV =============

function DashboardSideNav() {
  const [active, setActive] = useState('dashboard');
  return (
    <XDSSideNav
      header={
        <XDSVStack gap={3} style={{padding: '12px 16px'}}>
          <XDSHStack gap={2} vAlign="center">
            <XDSNavIcon
              icon={<DashboardIcon style={{width: 16, height: 16}} />}
            />
            <XDSText type="body" weight="bold">
              Acme Inc.
            </XDSText>
          </XDSHStack>
          <XDSHStack gap={2}>
            <XDSButton
              label="Quick Create"
              variant="primary"
              size="sm"
              xstyle={{flex: 1} as never}
            />
            <XDSButton
              label="Mail"
              variant="ghost"
              size="sm"
              icon={<MailIcon style={{width: 16, height: 16}} />}
            />
          </XDSHStack>
        </XDSVStack>
      }
      footer={
        <XDSVStack gap={0} style={{padding: '8px 0'}}>
          <XDSSideNavItem
            label="Settings"
            icon={SettingsIcon}
            isSelected={active === 'settings'}
            onClick={() => setActive('settings')}
          />
          <XDSSideNavItem
            label="Get Help"
            icon={HelpIcon}
            isSelected={active === 'help'}
            onClick={() => setActive('help')}
          />
          <XDSSideNavItem
            label="Search"
            icon={SearchIcon}
            isSelected={active === 'search'}
            onClick={() => setActive('search')}
          />
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--color-divider)',
            }}>
            <XDSHStack gap={3} vAlign="center">
              <XDSAvatar name="shadcn" size="small" />
              <XDSVStack gap={0} style={{flex: 1}}>
                <XDSText type="body" weight="bold">
                  shadcn
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  m@example.com
                </XDSText>
              </XDSVStack>
              <XDSButton
                label="More"
                variant="ghost"
                size="sm"
                icon={<MoreIcon style={{width: 16, height: 16}} />}
              />
            </XDSHStack>
          </div>
        </XDSVStack>
      }>
      <XDSSideNavSection title="Platform">
        <XDSSideNavItem
          label="Dashboard"
          icon={DashboardIcon}
          isSelected={active === 'dashboard'}
          onClick={() => setActive('dashboard')}
        />
        <XDSSideNavItem
          label="Lifecycle"
          icon={LifecycleIcon}
          isSelected={active === 'lifecycle'}
          onClick={() => setActive('lifecycle')}
        />
        <XDSSideNavItem
          label="Analytics"
          icon={AnalyticsIcon}
          isSelected={active === 'analytics'}
          onClick={() => setActive('analytics')}
        />
        <XDSSideNavItem
          label="Projects"
          icon={ProjectsIcon}
          isSelected={active === 'projects'}
          onClick={() => setActive('projects')}
        />
        <XDSSideNavItem
          label="Team"
          icon={TeamIcon}
          isSelected={active === 'team'}
          onClick={() => setActive('team')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Documents">
        <XDSSideNavItem
          label="Data Library"
          icon={DataIcon}
          isSelected={active === 'data'}
          onClick={() => setActive('data')}
        />
        <XDSSideNavItem
          label="Reports"
          icon={ReportsIcon}
          isSelected={active === 'reports'}
          onClick={() => setActive('reports')}
        />
        <XDSSideNavItem
          label="Word Assistant"
          icon={WordIcon}
          isSelected={active === 'word'}
          onClick={() => setActive('word')}
        />
        <XDSSideNavItem
          label="More"
          icon={MoreIcon}
          isSelected={active === 'more'}
          onClick={() => setActive('more')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

// ============= MAIN COMPONENT =============

export default function DashboardTemplate() {
  return (
    <XDSAppShell
      sideNav={<DashboardSideNav />}
      topNav={
        <XDSTopNav
          endContent={
            <XDSLink label="GitHub" href="#">
              GitHub
            </XDSLink>
          }>
          <XDSTopNavHeading>Analytics</XDSTopNavHeading>
        </XDSTopNav>
      }
      variant="elevated"
      contentPadding={6}>
      <XDSVStack gap={6}>
        {/* Active Users Chart */}
        <XDSVStack gap={4}>
          <XDSHStack hAlign="between" vAlign="center">
            <XDSHeading level={3}>Active users</XDSHeading>
            <XDSButton
              label="Reload"
              variant="secondary"
              size="md"
              icon={<ReloadIcon style={{width: 16, height: 16}} />}>
              Reload
            </XDSButton>
          </XDSHStack>
          <ActiveUsersChart />
        </XDSVStack>

        {/* Metric Cards */}
        <XDSStack direction="horizontal" gap={4}>
          {metrics.map((m, i) => (
            <MetricCard key={m.label} {...m} sparkline={sparklines[i]} />
          ))}
        </XDSStack>

        <XDSDivider />

        {/* Demographics */}
        <XDSHStack hAlign="between" vAlign="center">
          <XDSHeading level={3}>Demographics</XDSHeading>
          <XDSButton label="View more" variant="secondary" size="sm" />
        </XDSHStack>
        <XDSHStack gap={16}>
          <StackedBarCard title="Region" data={regionData} />
          <StackedBarCard title="Role" data={roleData} />
        </XDSHStack>

        <XDSDivider />

        {/* Engagement */}
        <XDSHStack hAlign="between" vAlign="center">
          <XDSHeading level={3}>Engagement</XDSHeading>
          <XDSButton label="View more" variant="secondary" size="sm" />
        </XDSHStack>
        <XDSHStack gap={16}>
          <TopPagesCard />
          <TopEventsCard />
        </XDSHStack>
      </XDSVStack>
    </XDSAppShell>
  );
}
