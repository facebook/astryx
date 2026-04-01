'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSTable, proportional, pixel} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSLink} from '@xds/core/Link';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';


// Icons
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const LifecycleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);
const AnalyticsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);
const ProjectsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
);
const TeamIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const DataIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const ReportsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);
const WordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  </svg>
);
const HelpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
);
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const MoreIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
  </svg>
);
const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <path d="M23 6l-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" />
  </svg>
);
const TrendDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <path d="M23 18l-9.5-9.5-5 5L1 6" /><path d="M17 18h6v-6" />
  </svg>
);

// Mock data
const stats = [
  {label: 'Total Revenue', value: '$1,250.00', change: '+12.5%', positive: true, desc: 'Trending up this month'},
  {label: 'New Customers', value: '1,234', change: '-20%', positive: false, desc: 'Down 20% this period'},
  {label: 'Active Accounts', value: '45,678', change: '+12.5%', positive: true, desc: 'Strong user retention'},
  {label: 'Growth Rate', value: '4.5%', change: '+4.5%', positive: true, desc: 'Steady performance increase'},
];

interface DocRow extends Record<string, unknown> {
  id: string;
  header: string;
  sectionType: string;
  status: 'In Process' | 'Done' | 'Draft';
  target: number;
  limit: number;
  reviewer: string;
}

const docRows: DocRow[] = [
  {id: '1', header: 'Cover page', sectionType: 'Cover page', status: 'In Process', target: 18, limit: 5, reviewer: 'Eddie Lake'},
  {id: '2', header: 'Table of contents', sectionType: 'Table of contents', status: 'Done', target: 20, limit: 24, reviewer: 'Eddie Lake'},
  {id: '3', header: 'Executive summary', sectionType: 'Summary', status: 'In Process', target: 12, limit: 8, reviewer: 'Eddie Lake'},
  {id: '4', header: 'Technical approach', sectionType: 'Technical', status: 'Draft', target: 45, limit: 30, reviewer: 'Eddie Lake'},
  {id: '5', header: 'Design methodology', sectionType: 'Design', status: 'In Process', target: 22, limit: 15, reviewer: 'Eddie Lake'},
];

const docColumns: XDSTableColumn<DocRow>[] = [
  {key: 'header', header: 'Header', width: proportional(3)},
  {key: 'sectionType', header: 'Section Type', width: proportional(2)},
  {
    key: 'status',
    header: 'Status',
    width: pixel(130),
    renderCell: (item: DocRow) => (
      <XDSBadge
        variant={item.status === 'Done' ? 'success' : item.status === 'Draft' ? undefined : 'info'}
        label={item.status}
      />
    ),
  },
  {key: 'target', header: 'Target', width: pixel(80)},
  {key: 'limit', header: 'Limit', width: pixel(80)},
  {
    key: 'reviewer',
    header: 'Reviewer',
    width: pixel(140),
    renderCell: (item: DocRow) => (
      <XDSText type="body">{item.reviewer}</XDSText>
    ),
  },
];

// Chart data — approximate the area chart from the screenshot
const chartPoints = [
  10, 15, 12, 18, 25, 30, 28, 35, 32, 38, 42, 35, 30, 28, 32, 25, 20, 22,
  28, 35, 30, 25, 22, 28, 32, 38, 42, 45, 40, 35, 38, 42, 48, 45, 40, 38,
  42, 45, 50, 48, 42, 38, 35, 40, 45, 42, 38, 35, 30, 28, 32, 35, 38, 42,
  45, 48, 52, 50, 45, 42, 38, 35, 32, 30, 28, 25, 22, 20, 18, 22, 25, 28,
  32, 35, 38, 42, 45, 48, 42, 38, 35, 32, 35, 38, 42, 45, 48, 52, 55, 50,
];

const styles = stylex.create({
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changePositive: {color: 'var(--color-text-success, #16a34a)'},
  changeNegative: {color: 'var(--color-text-error, #dc2626)'},
  chartContainer: {
    position: 'relative',
    height: 260,
    overflow: 'hidden',
  },
  chartSvg: {
    width: '100%',
    height: '100%',
  },
  tabRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
});

function AreaChart() {
  const max = Math.max(...chartPoints);
  const w = 900;
  const h = 220;
  const pad = 20;
  const points = chartPoints.map((v, i) => ({
    x: pad + (i / (chartPoints.length - 1)) * (w - pad * 2),
    y: h - pad - (v / max) * (h - pad * 2),
  }));
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  const months = ['Apr 7', 'Apr 13', 'Apr 19', 'Apr 26', 'May 2', 'May 8', 'May 14', 'May 21', 'May 28', 'Jun 3', 'Jun 9', 'Jun 15', 'Jun 22', 'Jun 30'];

  return (
    <div {...stylex.props(styles.chartContainer)}>
      <svg viewBox={`0 0 ${w} ${h + 30}`} {...stylex.props(styles.chartSvg)} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent, #000)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-accent, #000)" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(pct => (
          <line
            key={pct}
            x1={pad}
            y1={h - pad - pct * (h - pad * 2)}
            x2={w - pad}
            y2={h - pad - pct * (h - pad * 2)}
            stroke="var(--color-divider, #e5e5e5)"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#areaGrad)" />
        <path d={line} fill="none" stroke="var(--color-text-primary, #000)" strokeWidth="1.5" />
        {/* X-axis labels */}
        {months.map((label, i) => (
          <text
            key={label}
            x={pad + (i / (months.length - 1)) * (w - pad * 2)}
            y={h + 20}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-text-secondary, #888)"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function StatCard({label, value, change, positive, desc}: typeof stats[0]) {
  return (
    <XDSCard>
      <XDSVStack gap={2}>
        <div {...stylex.props(styles.statRow)}>
          <XDSText type="supporting" color="secondary">{label}</XDSText>
          <XDSHStack gap={1} vAlign="center">
            {positive ? <TrendUpIcon /> : <TrendDownIcon />}
            <span {...stylex.props(positive ? styles.changePositive : styles.changeNegative)}>
              <XDSText type="supporting">{change}</XDSText>
            </span>
          </XDSHStack>
        </div>
        <XDSHeading level={2}>{value}</XDSHeading>
        <XDSText type="supporting" color="secondary">{desc}</XDSText>
      </XDSVStack>
    </XDSCard>
  );
}

function DashboardSideNav() {
  const [active, setActive] = useState('dashboard');
  return (
    <XDSSideNav
      header={
        <XDSVStack gap={3} style={{padding: '12px 16px'}}>
          <XDSHStack gap={2} vAlign="center">
            <XDSNavIcon icon={<DashboardIcon style={{width: 16, height: 16}} />} />
            <XDSText type="body" weight="bold">Acme Inc.</XDSText>
          </XDSHStack>
          <XDSHStack gap={2}>
            <XDSButton label="Quick Create" variant="primary" size="sm" xstyle={{flex: 1} as never} />
            <XDSButton label="Mail" variant="ghost" size="sm" icon={<MailIcon style={{width: 16, height: 16}} />} />
          </XDSHStack>
        </XDSVStack>
      }
      footer={
        <XDSVStack gap={0} style={{padding: '8px 0'}}>
          <XDSSideNavItem label="Settings" icon={SettingsIcon} isSelected={active === 'settings'} onClick={() => setActive('settings')} />
          <XDSSideNavItem label="Get Help" icon={HelpIcon} isSelected={active === 'help'} onClick={() => setActive('help')} />
          <XDSSideNavItem label="Search" icon={SearchIcon} isSelected={active === 'search'} onClick={() => setActive('search')} />
          <div style={{padding: '12px 16px', borderTop: '1px solid var(--color-divider)'}}>
            <XDSHStack gap={3} vAlign="center">
              <XDSAvatar name="shadcn" size="small" />
              <XDSVStack gap={0} style={{flex: 1}}>
                <XDSText type="body" weight="bold">shadcn</XDSText>
                <XDSText type="supporting" color="secondary">m@example.com</XDSText>
              </XDSVStack>
              <XDSButton label="More" variant="ghost" size="sm" icon={<MoreIcon style={{width: 16, height: 16}} />} />
            </XDSHStack>
          </div>
        </XDSVStack>
      }>
      <XDSSideNavSection title="Platform">
        <XDSSideNavItem label="Dashboard" icon={DashboardIcon} isSelected={active === 'dashboard'} onClick={() => setActive('dashboard')} />
        <XDSSideNavItem label="Lifecycle" icon={LifecycleIcon} isSelected={active === 'lifecycle'} onClick={() => setActive('lifecycle')} />
        <XDSSideNavItem label="Analytics" icon={AnalyticsIcon} isSelected={active === 'analytics'} onClick={() => setActive('analytics')} />
        <XDSSideNavItem label="Projects" icon={ProjectsIcon} isSelected={active === 'projects'} onClick={() => setActive('projects')} />
        <XDSSideNavItem label="Team" icon={TeamIcon} isSelected={active === 'team'} onClick={() => setActive('team')} />
      </XDSSideNavSection>
      <XDSSideNavSection title="Documents">
        <XDSSideNavItem label="Data Library" icon={DataIcon} isSelected={active === 'data'} onClick={() => setActive('data')} />
        <XDSSideNavItem label="Reports" icon={ReportsIcon} isSelected={active === 'reports'} onClick={() => setActive('reports')} />
        <XDSSideNavItem label="Word Assistant" icon={WordIcon} isSelected={active === 'word'} onClick={() => setActive('word')} />
        <XDSSideNavItem label="More" icon={MoreIcon} isSelected={active === 'more'} onClick={() => setActive('more')} />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

export default function DashboardTemplate() {
  const [period, setPeriod] = useState('3m');
  const [docTab, setDocTab] = useState('outline');

  return (
    <XDSAppShell
      sideNav={<DashboardSideNav />}
      topNav={
        <XDSTopNav
          endContent={
            <XDSLink label="GitHub" href="#">GitHub</XDSLink>
          }>
          <XDSTopNavHeading>Documents</XDSTopNavHeading>
        </XDSTopNav>
      }
      variant="elevated"
      contentPadding={6}>
      <XDSVStack gap={6}>
        {/* Stats Grid */}
        <div {...stylex.props(styles.statsGrid)}>
          {stats.map(stat => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Area Chart */}
        <XDSCard>
          <XDSVStack gap={4}>
            <div {...stylex.props(styles.statRow)}>
              <XDSVStack gap={1}>
                <XDSHeading level={3}>Total Visitors</XDSHeading>
                <XDSText type="supporting" color="secondary">
                  Total for the last 3 months
                </XDSText>
              </XDSVStack>
              <XDSSegmentedControl label="Time period" value={period} onChange={setPeriod}>
                <XDSSegmentedControlItem value="3m" label="Last 3 months" />
                <XDSSegmentedControlItem value="30d" label="Last 30 days" />
                <XDSSegmentedControlItem value="7d" label="Last 7 days" />
              </XDSSegmentedControl>
            </div>
            <AreaChart />
          </XDSVStack>
        </XDSCard>

        {/* Document Tabs + Table */}
        <div {...stylex.props(styles.tabRow)}>
          <XDSTabList value={docTab} onChange={setDocTab}>
            <XDSTab value="outline" label="Outline" />
            <XDSTab value="performance" label="Past Performance" />
            <XDSTab value="personnel" label="Key Personnel" />
            <XDSTab value="focus" label="Focus Documents" />
          </XDSTabList>
          <XDSHStack gap={3}>
            <XDSButton label="Customize Columns" variant="secondary" size="sm" />
            <XDSButton label="+ Add Section" variant="secondary" size="sm" />
          </XDSHStack>
        </div>

        <XDSCard padding={0}>
          <XDSTable<DocRow>
            data={docRows}
            columns={docColumns}
            idKey="id"
            density="balanced"
            dividers="rows"
            hasHover
          />
        </XDSCard>
      </XDSVStack>
    </XDSAppShell>
  );
}
