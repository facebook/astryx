import {useState, useMemo} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSButton} from '@xds/core/Button';
import {} from '@heroicons/react/24/outline';

function XBracketIcon({style}: {style?: React.CSSProperties}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      style={style}>
      {/* Left bracket */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4H4v16h3" />
      {/* Right bracket */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 4h3v16h-3" />
      {/* X */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9l6 6M15 9l-6 6"
      />
    </svg>
  );
}

function NestIcon({style}: {style?: React.CSSProperties}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      style={style}>
      {/* Bowl shape */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12c0 5 4 9 9 9s9-4 9-9"
      />
      {/* Woven lines */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13c1.5 3 4 5 7 5s5.5-2 7-5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 15c1 1.5 2.5 2.5 4.5 2.5s3.5-1 4.5-2.5"
      />
      {/* Three eggs */}
      <ellipse cx="8.5" cy="10.5" rx="2" ry="2.8" strokeLinejoin="round" />
      <ellipse cx="12" cy="9.5" rx="1.8" ry="2.5" strokeLinejoin="round" />
      <ellipse cx="15.5" cy="10.5" rx="2" ry="2.8" strokeLinejoin="round" />
    </svg>
  );
}
import {XDSDivider} from '@xds/core/Divider';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSTable, proportional, pixel} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSPagination} from '@xds/core/Pagination';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  fontWeightVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacingVars['--spacing-3'],
  },
  statInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: spacingVars['--spacing-2'],
  },
  changePositive: {
    color: colorVars['--color-positive'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacingVars['--spacing-4'],
  },
  chartInner: {
    paddingTop: spacingVars['--spacing-1'],
  },
  linksRow: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    flexWrap: 'wrap',
  },
  searchFill: {
    flex: 1,
    minWidth: 0,
  },
  sectionLabel: {
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: fontWeightVars['--font-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colorVars['--color-text-secondary'],
  },
  orgBar: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    height: 26,
  },
  orgLabel: {
    width: 180,
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'right',
    flexShrink: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: colorVars['--color-wash'],
    borderRadius: radiusVars['--radius-content'],
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colorVars['--color-active'],
    borderRadius: radiusVars['--radius-content'],
  },
  pctLabel: {
    width: 36,
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
  wash: {
    backgroundColor: colorVars['--color-wash'],
    padding: spacingVars['--spacing-6'],
    minHeight: '100vh',
  },
});

// =============================================================================
// Mock Data
// =============================================================================

const overviewStats = [
  {
    label: 'Total Intern Tools',
    value: '14,184',
    change: '+5.4%',
    source: 'internal_tool_data · MoM',
  },
  {
    label: 'Intern WAU',
    value: '282,255',
    change: '+6.3%',
    source: 'vitals_event · WoW',
  },
  {
    label: 'Total Nest Apps',
    value: '7,304',
    change: '+318.3%',
    source: 'nest/apps · MoM',
  },
  {
    label: 'Nest WAU',
    value: '22,169',
    change: '+23.2%',
    source: 'nest_traces · WoW',
  },
];

interface AdoptionMatrixRow extends Record<string, unknown> {
  id: string;
  metric: string;
  xdsIntern: string;
  xdsInternChange: string;
  xdsInternSub: string;
  xdsWwwNest: string;
  xdsWwwNestChange: string;
  xdsWwwNestSub: string;
  xdsOssNest: string;
  xdsOssNestChange: string;
  xdsOssNestSub: string;
  ndsNest: string;
  ndsNestChange: string;
  ndsNestSub: string;
}

const adoptionMatrixData: AdoptionMatrixRow[] = [
  {
    id: 'components',
    metric: 'Components',
    xdsIntern: '588',
    xdsInternChange: '+1.2%',
    xdsInternSub: 'Components in www',
    xdsWwwNest: '671',
    xdsWwwNestChange: '+0.4%',
    xdsWwwNestSub: '@nest/xds components',
    xdsOssNest: '45',
    xdsOssNestChange: '+4.7%',
    xdsOssNestSub: '@xds/core components',
    ndsNest: '155',
    ndsNestChange: '+0.6%',
    ndsNestSub: '@nest/nds components',
  },
  {
    id: 'insertions',
    metric: 'Insertions',
    xdsIntern: '2,376,231',
    xdsInternChange: '+3.1%',
    xdsInternSub: 'Total usages in www',
    xdsWwwNest: '132',
    xdsWwwNestChange: '+8.2%',
    xdsWwwNestSub: 'Import usages',
    xdsOssNest: '81+',
    xdsOssNestChange: '+12.5%',
    xdsOssNestSub: 'Import usages',
    ndsNest: '7,960+',
    ndsNestChange: '+2.3%',
    ndsNestSub: 'Import usages',
  },
  {
    id: 'tools',
    metric: 'Tools / Apps Using',
    xdsIntern: '127',
    xdsInternChange: '+1.6%',
    xdsInternSub: 'Distinct oncalls on www',
    xdsWwwNest: '236+',
    xdsWwwNestChange: '+5.4%',
    xdsWwwNestSub: 'Apps with @nest/xds',
    xdsOssNest: '5',
    xdsOssNestChange: '+0.0%',
    xdsOssNestSub: 'Apps with @xds/core',
    ndsNest: '4,700+',
    ndsNestChange: '+1.9%',
    ndsNestSub: 'Apps with @nest/nds',
  },
];

const adoptionMatrixColumns: XDSTableColumn<AdoptionMatrixRow>[] = [
  {key: 'metric', header: '', width: proportional(1.2)},
  {
    key: 'xdsIntern',
    header: 'XDS on Intern',
    renderCell: row => (
      <XDSVStack gap={0.5}>
        <span>
          <XDSText type="large" weight="bold">
            {row.xdsIntern}
          </XDSText>{' '}
          <span style={{color: '#16a34a', fontSize: '0.75rem'}}>
            {row.xdsInternChange}
          </span>
        </span>
        <XDSText type="supporting" color="disabled">
          {row.xdsInternSub}
        </XDSText>
      </XDSVStack>
    ),
  },
  {
    key: 'xdsWwwNest',
    header: 'XDS WWW on Nest',
    renderCell: row => (
      <XDSVStack gap={0.5}>
        <span>
          <XDSText type="large" weight="bold">
            {row.xdsWwwNest}
          </XDSText>{' '}
          <span style={{color: '#16a34a', fontSize: '0.75rem'}}>
            {row.xdsWwwNestChange}
          </span>
        </span>
        <XDSText type="supporting" color="disabled">
          {row.xdsWwwNestSub}
        </XDSText>
      </XDSVStack>
    ),
  },
  {
    key: 'xdsOssNest',
    header: 'XDS OSS on Nest',
    renderCell: row => (
      <XDSVStack gap={0.5}>
        <span>
          <XDSText type="large" weight="bold">
            {row.xdsOssNest}
          </XDSText>{' '}
          <span style={{color: '#16a34a', fontSize: '0.75rem'}}>
            {row.xdsOssNestChange}
          </span>
        </span>
        <XDSText type="supporting" color="disabled">
          {row.xdsOssNestSub}
        </XDSText>
      </XDSVStack>
    ),
  },
  {
    key: 'ndsNest',
    header: 'NDS on Nest',
    renderCell: row => (
      <XDSVStack gap={0.5}>
        <span>
          <XDSText type="large" weight="bold">
            {row.ndsNest}
          </XDSText>{' '}
          <span style={{color: '#16a34a', fontSize: '0.75rem'}}>
            {row.ndsNestChange}
          </span>
        </span>
        <XDSText type="supporting" color="disabled">
          {row.ndsNestSub}
        </XDSText>
      </XDSVStack>
    ),
  },
];

const oncallsByOrg = [
  {org: 'ABM - Corp Ads Growth', pct: 95},
  {org: 'Central Integrity', pct: 88},
  {org: 'Commerce Growth', pct: 82},
  {org: 'FDA Foundation App Platform', pct: 78},
  {org: 'Family Safety', pct: 72},
  {org: 'Instagram Product Eng', pct: 70},
  {org: 'Infra Engineering', pct: 65},
  {org: 'Monetization', pct: 60},
  {org: 'Instagram Privacy & Safety', pct: 55},
  {org: 'PAK Payments Platform', pct: 50},
  {org: 'RL Systems', pct: 45},
  {org: 'RL Operations', pct: 42},
];

interface ComponentAdoptionRow extends Record<string, unknown> {
  id: string;
  component: string;
  usages: number;
  files: number;
  oncalls: number;
  teams: number;
  firstInstance: string;
}

const componentAdoptionData: ComponentAdoptionRow[] = [
  {
    id: '1',
    component: 'XDSText',
    usages: 420851,
    files: 119979,
    oncalls: 107,
    teams: 89,
    firstInstance: '2023-10-23',
  },
  {
    id: '2',
    component: 'XDSFlexbox',
    usages: 338790,
    files: 118852,
    oncalls: 94,
    teams: 82,
    firstInstance: '2023-10-23',
  },
  {
    id: '3',
    component: 'XDSButton',
    usages: 148454,
    files: 76138,
    oncalls: 95,
    teams: 83,
    firstInstance: '2023-10-23',
  },
  {
    id: '4',
    component: 'XDSCard',
    usages: 70940,
    files: 42012,
    oncalls: 73,
    teams: 63,
    firstInstance: '2023-10-23',
  },
  {
    id: '5',
    component: 'XDSLink',
    usages: 70572,
    files: 42201,
    oncalls: 55,
    teams: 49,
    firstInstance: '2023-10-23',
  },
  {
    id: '6',
    component: 'XDSIcon',
    usages: 70271,
    files: 35573,
    oncalls: 40,
    teams: 36,
    firstInstance: '2023-10-23',
  },
  {
    id: '7',
    component: 'XDSSelectorItem',
    usages: 57513,
    files: 19649,
    oncalls: 50,
    teams: 46,
    firstInstance: '2023-10-23',
  },
  {
    id: '8',
    component: 'XDSBadge',
    usages: 51564,
    files: 22065,
    oncalls: 37,
    teams: 34,
    firstInstance: '2023-10-23',
  },
  {
    id: '9',
    component: 'XDSHeading',
    usages: 49170,
    files: 31130,
    oncalls: 49,
    teams: 44,
    firstInstance: '2023-10-23',
  },
  {
    id: '10',
    component: 'XDSDescriptionListItem',
    usages: 47118,
    files: 7778,
    oncalls: 20,
    teams: 20,
    firstInstance: '2023-10-23',
  },
  {
    id: '11',
    component: 'XDSAvatar',
    usages: 42300,
    files: 18900,
    oncalls: 38,
    teams: 32,
    firstInstance: '2023-10-23',
  },
  {
    id: '12',
    component: 'XDSSpinner',
    usages: 38100,
    files: 15200,
    oncalls: 35,
    teams: 30,
    firstInstance: '2023-10-23',
  },
  {
    id: '13',
    component: 'XDSTooltip',
    usages: 35800,
    files: 14100,
    oncalls: 33,
    teams: 28,
    firstInstance: '2023-10-23',
  },
  {
    id: '14',
    component: 'XDSDivider',
    usages: 33500,
    files: 12800,
    oncalls: 30,
    teams: 25,
    firstInstance: '2023-10-23',
  },
  {
    id: '15',
    component: 'XDSSwitch',
    usages: 28900,
    files: 11200,
    oncalls: 28,
    teams: 23,
    firstInstance: '2023-10-23',
  },
  {
    id: '16',
    component: 'XDSTextInput',
    usages: 25600,
    files: 9800,
    oncalls: 25,
    teams: 21,
    firstInstance: '2023-10-23',
  },
  {
    id: '17',
    component: 'XDSCheckbox',
    usages: 22100,
    files: 8900,
    oncalls: 22,
    teams: 19,
    firstInstance: '2023-10-23',
  },
  {
    id: '18',
    component: 'XDSRadioList',
    usages: 18700,
    files: 7500,
    oncalls: 20,
    teams: 17,
    firstInstance: '2023-10-23',
  },
  {
    id: '19',
    component: 'XDSDialog',
    usages: 15400,
    files: 6200,
    oncalls: 18,
    teams: 15,
    firstInstance: '2023-10-23',
  },
  {
    id: '20',
    component: 'XDSProgressBar',
    usages: 12100,
    files: 5100,
    oncalls: 15,
    teams: 13,
    firstInstance: '2023-10-23',
  },
];

// =============================================================================
// Simple SVG Line Chart (no external dep)
// =============================================================================

function generateDAUData() {
  const data = [];
  const start = new Date('2026-03-03');
  for (let i = 0; i < 14; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    data.push({
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      intern: isWeekend
        ? 125000 + i * 2000
        : 185000 + i * 3000 + (i % 3) * 10000,
      nest: isWeekend ? 17000 + i * 500 : 32000 + i * 1000 + (i % 3) * 3000,
    });
  }
  return data;
}

function generateCreationData() {
  const data = [];
  const months = [
    "Dec'25",
    "Jan'26",
    "Feb'26",
    "Mar'26",
    "Apr'26",
    "May'26",
    "Jun'26",
    "Jul'26",
  ];
  for (let i = 0; i < 8; i++) {
    data.push({
      label: months[i],
      intern: 40 + Math.round(i * 5 + (i % 2) * 15),
      nest: 30 + Math.round(i * 35 + (i % 2) * 20),
    });
  }
  return data;
}

function generateComponentCountData() {
  const data = [];
  const months = ["Sep'25", 'Oct', 'Nov', 'Dec', "Jan'26", 'Feb', 'Mar'];
  const counts = [460, 480, 505, 490, 530, 560, 588];
  for (let i = 0; i < months.length; i++) {
    data.push({label: months[i], value: counts[i]});
  }
  return data;
}

const dauData = generateDAUData();
const creationData = generateCreationData();
const componentCountData = generateComponentCountData();

type DualPoint = {label: string; intern: number; nest: number};
type SinglePoint = {label: string; value: number};

function MiniLineChart({
  data,
  height = 280,
  colors = ['#3b82f6', '#f97316'],
  keys,
  formatY,
}: {
  data: DualPoint[];
  height?: number;
  colors?: string[];
  keys: [string, string];
  formatY?: (v: number) => string;
}) {
  const w = 500;
  const h = height;
  const pad = {top: 20, right: 20, bottom: 50, left: 50};
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const allVals = data.flatMap(d => [
    d[keys[0] as keyof DualPoint] as number,
    d[keys[1] as keyof DualPoint] as number,
  ]);
  const minV = Math.min(...allVals) * 0.9;
  const maxV = Math.max(...allVals) * 1.05;

  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * cw;
  const yScale = (v: number) =>
    pad.top + ch - ((v - minV) / (maxV - minV)) * ch;
  const fmt =
    formatY ||
    ((v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)));

  const line = (key: string) =>
    data
      .map(
        (d, i) =>
          `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d[key as keyof DualPoint] as number)}`,
      )
      .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width: '100%', height}}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = pad.top + ch * (1 - pct);
        const val = minV + (maxV - minV) * pct;
        return (
          <g key={pct}>
            <line
              x1={pad.left}
              x2={w - pad.right}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
            <text
              x={pad.left - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#999">
              {fmt(val)}
            </text>
          </g>
        );
      })}
      {/* X labels */}
      {data.map((d, i) =>
        i % Math.ceil(data.length / 7) === 0 ? (
          <text
            key={i}
            x={xScale(i)}
            y={pad.top + ch + 16}
            textAnchor="middle"
            fontSize={10}
            fill="#999">
            {d.label}
          </text>
        ) : null,
      )}
      {/* Lines */}
      <path d={line(keys[0])} fill="none" stroke={colors[0]} strokeWidth={2} />
      <path d={line(keys[1])} fill="none" stroke={colors[1]} strokeWidth={2} />
      {/* Legend */}
      <circle cx={w / 2 - 35} cy={h - 8} r={3} fill={colors[0]} />
      <text x={w / 2 - 27} y={h - 4} fontSize={10} fill="#666">
        {keys[0]}
      </text>
      <circle cx={w / 2 + 25} cy={h - 8} r={3} fill={colors[1]} />
      <text x={w / 2 + 33} y={h - 4} fontSize={10} fill="#666">
        {keys[1]}
      </text>
    </svg>
  );
}

function SingleLineChart({
  data,
  height = 240,
  color = '#3b82f6',
}: {
  data: SinglePoint[];
  height?: number;
  color?: string;
}) {
  const w = 500;
  const h = height;
  const pad = {top: 20, right: 20, bottom: 30, left: 50};
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const values = data.map(d => d.value);
  const minV = Math.min(...values) * 0.95;
  const maxV = Math.max(...values) * 1.05;

  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * cw;
  const yScale = (v: number) =>
    pad.top + ch - ((v - minV) / (maxV - minV)) * ch;

  const line = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d.value)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width: '100%', height}}>
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = pad.top + ch * (1 - pct);
        const val = minV + (maxV - minV) * pct;
        return (
          <g key={pct}>
            <line
              x1={pad.left}
              x2={w - pad.right}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
            <text
              x={pad.left - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#999">
              {Math.round(val)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) =>
        i % Math.ceil(data.length / 6) === 0 ? (
          <text
            key={i}
            x={xScale(i)}
            y={h - 6}
            textAnchor="middle"
            fontSize={10}
            fill="#999">
            {d.label}
          </text>
        ) : null,
      )}
      <path d={line} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}

// =============================================================================
// Reusable pieces
// =============================================================================

function StatCard({
  label,
  value,
  change,
  source,
}: {
  label: string;
  value: string;
  change?: string;
  source?: string;
}) {
  return (
    <XDSCard padding={4}>
      <XDSVStack gap={1}>
        <XDSText type="supporting" color="secondary">
          {label}
        </XDSText>
        <div {...stylex.props(styles.statValueRow)}>
          <XDSText type="large" weight="bold">
            {value}
          </XDSText>
          {change && (
            <span {...stylex.props(styles.changePositive)}>{change}</span>
          )}
        </div>
        {source && (
          <XDSText type="supporting" color="disabled">
            {source}
          </XDSText>
        )}
      </XDSVStack>
    </XDSCard>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <XDSCard padding={4}>
      <XDSVStack gap={2}>
        <XDSText type="body" weight="bold">
          {title}
        </XDSText>
        <div {...stylex.props(styles.chartInner)}>{children}</div>
      </XDSVStack>
    </XDSCard>
  );
}

// =============================================================================
// Table columns
// =============================================================================

const columns: XDSTableColumn<ComponentAdoptionRow>[] = [
  {
    key: 'component',
    header: 'Component',
    width: proportional(1),
    renderCell: (item: ComponentAdoptionRow) => (
      <XDSText type="body" weight="bold">
        {item.component}
      </XDSText>
    ),
  },
  {
    key: 'usages',
    header: 'Usages',
    width: proportional(1),
    renderCell: (item: ComponentAdoptionRow) => (
      <XDSText type="body">{item.usages.toLocaleString()}</XDSText>
    ),
  },
  {
    key: 'files',
    header: 'Files',
    width: proportional(1),
    renderCell: (item: ComponentAdoptionRow) => (
      <XDSText type="body">{item.files.toLocaleString()}</XDSText>
    ),
  },
  {
    key: 'oncalls',
    header: 'Oncalls',
    width: proportional(1),
    renderCell: (item: ComponentAdoptionRow) => (
      <XDSText type="body">{String(item.oncalls)}</XDSText>
    ),
  },
  {
    key: 'teams',
    header: 'Teams',
    width: proportional(1),
    renderCell: (item: ComponentAdoptionRow) => (
      <XDSText type="body">{String(item.teams)}</XDSText>
    ),
  },
  {
    key: 'firstInstance',
    header: 'First Instance',
    width: proportional(1),
    renderCell: (item: ComponentAdoptionRow) => (
      <XDSText type="supporting" color="secondary">
        {item.firstInstance}
      </XDSText>
    ),
  },
];

// =============================================================================
// Page: Overview
// =============================================================================

const PAGE_SIZE = 10;

function OverviewContent() {
  const [ovTab, setOvTab] = useState('usage');
  const [search, setSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return componentAdoptionData;
    const q = search.toLowerCase();
    return componentAdoptionData.filter(row =>
      row.component.toLowerCase().includes(q),
    );
  }, [search]);

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const pagedRows = filteredRows.slice(
    (tablePage - 1) * PAGE_SIZE,
    tablePage * PAGE_SIZE,
  );

  return (
    <XDSVStack gap={6}>
      <XDSTabList
        value={ovTab}
        onChange={(v: string) => setOvTab(v)}
        hasDivider>
        <XDSTab value="usage" label="Overview" />
        <XDSTab value="ds-details" label="Design System Details" />
      </XDSTabList>

      {ovTab === 'usage' && (
        <XDSVStack gap={6}>
          <XDSVStack gap={3}>
            <span {...stylex.props(styles.sectionLabel)}>
              www vs Nest Usage
            </span>
            <div {...stylex.props(styles.statsRow)}>
              {overviewStats.map(stat => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </XDSVStack>

          <div {...stylex.props(styles.chartsGrid)}>
            <ChartCard title="Daily Active Users (14d) — Intern vs Nest">
              <MiniLineChart data={dauData} keys={['intern', 'nest']} />
            </ChartCard>
            <ChartCard title="Daily New Tool / App Creation — Intern vs Nest">
              <MiniLineChart data={creationData} keys={['intern', 'nest']} />
            </ChartCard>
          </div>

          <XDSDivider />

          <XDSVStack gap={3}>
            <span {...stylex.props(styles.sectionLabel)}>
              Design System Adoption
            </span>
            <XDSTable<AdoptionMatrixRow>
              data={adoptionMatrixData}
              columns={adoptionMatrixColumns}
              idKey="id"
              density="balanced"
              dividers="grid"
            />
          </XDSVStack>
        </XDSVStack>
      )}

      {ovTab === 'ds-details' && (
        <XDSVStack gap={6}>
          <div {...stylex.props(styles.chartsGrid)}>
            {/* Left column */}
            <XDSVStack gap={3}>
              <span {...stylex.props(styles.sectionLabel)}>
                XDS on Intern (www)
              </span>
              <ChartCard title="XDS Component Count Over Time">
                <SingleLineChart data={componentCountData} />
              </ChartCard>
              <ChartCard title="% Oncalls Using XDS WWW by Org">
                <div style={{maxHeight: 260, overflowY: 'auto'}}>
                  {oncallsByOrg.map(org => (
                    <div key={org.org} {...stylex.props(styles.orgBar)}>
                      <span {...stylex.props(styles.orgLabel)}>{org.org}</span>
                      <div {...stylex.props(styles.barTrack)}>
                        <div
                          {...stylex.props(styles.barFill)}
                          style={{width: `${org.pct}%`}}
                        />
                      </div>
                      <span {...stylex.props(styles.pctLabel)}>{org.pct}%</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </XDSVStack>

            {/* Right column */}
            <XDSVStack gap={3}>
              <span {...stylex.props(styles.sectionLabel)}>
                Nest Design Systems (NDS / XDS OSS)
              </span>
              <ChartCard title="Nest Design System Component Count Over Time">
                <SingleLineChart data={componentCountData} />
              </ChartCard>
              <ChartCard title="% Apps Using NDS / XDS OSS by Org">
                <div style={{maxHeight: 260, overflowY: 'auto'}}>
                  {oncallsByOrg.map(org => (
                    <div key={org.org} {...stylex.props(styles.orgBar)}>
                      <span {...stylex.props(styles.orgLabel)}>{org.org}</span>
                      <div {...stylex.props(styles.barTrack)}>
                        <div
                          {...stylex.props(styles.barFill)}
                          style={{width: `${org.pct}%`}}
                        />
                      </div>
                      <span {...stylex.props(styles.pctLabel)}>{org.pct}%</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </XDSVStack>
          </div>

          <XDSDivider />

          {/* Component Adoption Table */}
          <XDSVStack gap={3}>
            <span {...stylex.props(styles.sectionLabel)}>
              XDS Component Adoption Details
            </span>
            <XDSHStack gap={3} vAlign="end">
              <XDSDropdownMenu
                button={{
                  label: 'XDS on Intern (WWW)',
                  variant: 'secondary',
                  size: 'sm',
                }}
                items={[
                  {label: 'XDS on Intern (WWW)', onClick: () => {}},
                  {
                    label: 'Nest Design System (NDS/XDS OSS)',
                    onClick: () => {},
                  },
                ]}
              />
              <div {...stylex.props(styles.searchFill)}>
                <XDSTextInput
                  label="Search components"
                  isLabelHidden
                  placeholder="Search components..."
                  value={search}
                  onChange={(v: string) => {
                    setSearch(v);
                    setTablePage(1);
                  }}
                />
              </div>
            </XDSHStack>
            <div {...stylex.props(styles.chartsGrid)}>
              <ChartCard title="Nest Component Growth: Button">
                <SingleLineChart data={componentCountData} />
              </ChartCard>
              <ChartCard title="Nest Design System Component Adoption">
                <SingleLineChart data={componentCountData} />
              </ChartCard>
            </div>
            <XDSTable<ComponentAdoptionRow>
              data={pagedRows}
              columns={columns}
              idKey="id"
              density="balanced"
              dividers="rows"
              hasHover
            />
            {totalPages > 1 && (
              <XDSHStack gap={2} hAlign="center">
                <XDSPagination
                  page={tablePage}
                  totalPages={totalPages}
                  onChange={setTablePage}
                />
              </XDSHStack>
            )}
          </XDSVStack>

          {/* Quick Links */}
          <div {...stylex.props(styles.linksRow)}>
            {[
              {
                name: 'XDS WWW on Nest',
                href: 'https://example-xds.nest.x2p.facebook.net/',
              },
              {
                name: 'XDS OSS Storybook',
                href: 'https://facebookexperimental.github.io/xds/',
              },
              {
                name: 'NDS Storybook',
                href: 'https://nds-storybook.nest.x2p.facebook.net/storybook/index.html?path=/',
              },
            ].map(({name, href}) => (
              <XDSButton
                key={name}
                label={name}
                variant="secondary"
                size="sm"
                onClick={() => window.open(href, '_blank')}>
                {name} ↗
              </XDSButton>
            ))}
          </div>
        </XDSVStack>
      )}
    </XDSVStack>
  );
}

// =============================================================================
// Dashboard Shell
// =============================================================================

function AnalyticsDashboard() {
  return (
    <div {...stylex.props(styles.wash)}>
      <XDSTopNav
        label="Main navigation"
        heading={<XDSTopNavHeading heading="Internal Web Apps Analytics" />}
        endContent={
          <>
            <XDSButton
              label="Notifications"
              variant="ghost"
              icon={<XBracketIcon style={{width: 16, height: 16}} />}
              onClick={() =>
                window.open('https://fburl.com/unidash/1tc4odil', '_blank')
              }
            />
            <XDSButton
              label="Nest"
              variant="ghost"
              icon={<NestIcon style={{width: 16, height: 16}} />}
              onClick={() =>
                window.open('https://fburl.com/unidash/3lwsz2m9', '_blank')
              }
            />
          </>
        }
      />

      <div {...stylex.props(styles.page)}>
        <XDSVStack gap={6}>
          <OverviewContent />
        </XDSVStack>
      </div>
    </div>
  );
}

// =============================================================================
// Story
// =============================================================================

const meta: Meta = {
  title: 'Pages/Analytics Dashboard',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Overview: StoryObj = {
  render: () => <AnalyticsDashboard />,
};
