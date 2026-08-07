// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useState, type CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Divider} from '@astryxdesign/core/Divider';
import {Badge} from '@astryxdesign/core/Badge';
import {Token} from '@astryxdesign/core/Token';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  CheckCircleIcon,
  ArrowDownTrayIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import {StopIcon} from '@heroicons/react/24/solid';

// ============= TYPES =============

type Rag = 'onTrack' | 'atRisk' | 'blocked';
type Phase = 'all' | 'build' | 'beta' | 'ga';

interface Milestone {
  id: string;
  name: string;
  phase: Exclude<Phase, 'all'>;
  // Day offsets on a shared 0..90 timeline (project day 0 = kickoff).
  start: number;
  end: number;
  status: Rag;
  dateLabel: string;
}

interface Workstream extends Record<string, unknown> {
  id: string;
  name: string;
  owner: string;
  phase: Exclude<Phase, 'all'>;
  percent: number;
  due: string;
  status: Rag;
}

interface Risk {
  id: string;
  title: string;
  workstream: string;
  phase: Exclude<Phase, 'all'>;
  severity: Rag;
  owner: string;
  detail: string;
}

// ============= LABEL & TONE MAPPING =============

const PHASE_LABEL: Record<Exclude<Phase, 'all'>, string> = {
  build: 'Build',
  beta: 'Beta',
  ga: 'GA',
};

const RAG_LABEL: Record<Rag, string> = {
  onTrack: 'On track',
  atRisk: 'At risk',
  blocked: 'Blocked',
};

const RAG_BADGE: Record<Rag, 'green' | 'yellow' | 'red'> = {
  onTrack: 'green',
  atRisk: 'yellow',
  blocked: 'red',
};

// Semantic tone per status — drives the progress bar variant.
const RAG_TONE: Record<Rag, 'success' | 'warning' | 'error'> = {
  onTrack: 'success',
  atRisk: 'warning',
  blocked: 'error',
};

// Chart fills via design tokens (hex fallbacks for non-themed contexts).
const RAG_FILL: Record<Rag, string> = {
  onTrack: 'var(--color-success, #0B991F)',
  atRisk: 'var(--color-warning, #B25000)',
  blocked: 'var(--color-error, #D6002A)',
};

const GRID_STROKE = 'var(--color-border, rgba(5, 54, 89, 0.1))';
const AXIS_TICK = {
  fontSize: 'var(--font-size-sm, 12px)',
  fill: 'var(--color-text-secondary, #4E606F)',
};

// ============= DATA =============

const PROJECT_DAY = 58; // "today" marker on the 0..90 timeline

const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    name: 'Kickoff & scoping',
    phase: 'build',
    start: 0,
    end: 8,
    status: 'onTrack',
    dateLabel: 'Apr 1 – Apr 9',
  },
  {
    id: 'm2',
    name: 'Architecture sign-off',
    phase: 'build',
    start: 8,
    end: 20,
    status: 'onTrack',
    dateLabel: 'Apr 9 – Apr 21',
  },
  {
    id: 'm3',
    name: 'Feature complete',
    phase: 'build',
    start: 20,
    end: 44,
    status: 'atRisk',
    dateLabel: 'Apr 21 – May 15',
  },
  {
    id: 'm4',
    name: 'Private beta',
    phase: 'beta',
    start: 44,
    end: 62,
    status: 'atRisk',
    dateLabel: 'May 15 – Jun 2',
  },
  {
    id: 'm5',
    name: 'Bug bash & hardening',
    phase: 'beta',
    start: 58,
    end: 72,
    status: 'blocked',
    dateLabel: 'May 29 – Jun 12',
  },
  {
    id: 'm6',
    name: 'GA readiness review',
    phase: 'ga',
    start: 72,
    end: 82,
    status: 'onTrack',
    dateLabel: 'Jun 12 – Jun 22',
  },
  {
    id: 'm7',
    name: 'Public launch',
    phase: 'ga',
    start: 82,
    end: 90,
    status: 'onTrack',
    dateLabel: 'Jun 22 – Jun 30',
  },
];

const WORKSTREAMS: Workstream[] = [
  {
    id: 'w1',
    name: 'Core platform',
    owner: 'Priya Raman',
    phase: 'build',
    percent: 100,
    due: '2026-04-21',
    status: 'onTrack',
  },
  {
    id: 'w2',
    name: 'Data pipeline',
    owner: 'Marcus Webb',
    phase: 'build',
    percent: 92,
    due: '2026-05-15',
    status: 'atRisk',
  },
  {
    id: 'w3',
    name: 'Web client',
    owner: 'Ana Duarte',
    phase: 'build',
    percent: 88,
    due: '2026-05-15',
    status: 'onTrack',
  },
  {
    id: 'w4',
    name: 'Beta onboarding',
    owner: 'Tom Okafor',
    phase: 'beta',
    percent: 64,
    due: '2026-06-02',
    status: 'atRisk',
  },
  {
    id: 'w5',
    name: 'Load & reliability',
    owner: 'Dana Whitfield',
    phase: 'beta',
    percent: 38,
    due: '2026-06-12',
    status: 'blocked',
  },
  {
    id: 'w6',
    name: 'Docs & enablement',
    owner: 'Sofia Marín',
    phase: 'ga',
    percent: 55,
    due: '2026-06-22',
    status: 'onTrack',
  },
  {
    id: 'w7',
    name: 'Launch marketing',
    owner: 'Kenji Watanabe',
    phase: 'ga',
    percent: 41,
    due: '2026-06-22',
    status: 'onTrack',
  },
  {
    id: 'w8',
    name: 'Go-to-market ops',
    owner: 'Lena Fischer',
    phase: 'ga',
    percent: 30,
    due: '2026-06-30',
    status: 'atRisk',
  },
];

const RISKS: Risk[] = [
  {
    id: 'r1',
    title: 'Load tests failing at 3x target concurrency',
    workstream: 'Load & reliability',
    phase: 'beta',
    severity: 'blocked',
    owner: 'Dana Whitfield',
    detail:
      'p99 latency degrades past SLO above 12k concurrent sessions. Root cause traced to connection-pool saturation; fix depends on the data-pipeline retry change landing first.',
  },
  {
    id: 'r2',
    title: 'Data pipeline backfill slower than planned',
    workstream: 'Data pipeline',
    phase: 'build',
    severity: 'atRisk',
    owner: 'Marcus Webb',
    detail:
      'Historical backfill is tracking two days behind. Mitigation: parallelizing the backfill workers; feature-complete date at risk if not recovered this week.',
  },
  {
    id: 'r3',
    title: 'Beta onboarding email deliverability',
    workstream: 'Beta onboarding',
    phase: 'beta',
    severity: 'atRisk',
    owner: 'Tom Okafor',
    detail:
      'Invite emails landing in spam for two enterprise domains. Working with IT to allowlist sending IPs before the private beta opens.',
  },
];

// Ideal vs. actual remaining scope (story points), one entry per week.
const BURNDOWN = (() => {
  const total = 320;
  // Actual trails ideal mid-project (scope discovery), recovers late.
  const actualRemaining = [
    320, 300, 286, 262, 240, 226, 210, 182, 150, 132, 96, 54, 20,
  ];
  const idealStep = total / (actualRemaining.length - 1);
  return actualRemaining.map((actual, i) => ({
    week: i,
    label: `W${i + 1}`,
    ideal: Math.max(0, Math.round(total - idealStep * i)),
    actual,
  }));
})();

// ============= DERIVED FROM DATA =============

// Both aggregates describe the whole program, so they never change with the
// phase filter and are computed once at module scope.

const OVERALL_PERCENT = Math.round(
  WORKSTREAMS.reduce((sum, w) => sum + w.percent, 0) / WORKSTREAMS.length,
);

// Worst status across every workstream wins.
const PROGRAM_STATUS: Rag = WORKSTREAMS.some(w => w.status === 'blocked')
  ? 'blocked'
  : WORKSTREAMS.some(w => w.status === 'atRisk')
    ? 'atRisk'
    : 'onTrack';

// Milestones, workstreams and risks all carry a `phase`, so one filter serves
// all three.
function byPhase<T extends {phase: Exclude<Phase, 'all'>}>(
  items: T[],
  phase: Phase,
): T[] {
  return phase === 'all' ? items : items.filter(item => item.phase === phase);
}

// ============= SHARED PIECES =============

// The second page section caps at a content column and centers within it, so
// its content stays aligned even though the section background runs the full
// width of the viewport.
const pageStyles = stylex.create({
  contentWidth: {
    width: '100%',
    maxWidth: 1440,
    marginInline: 'auto',
  },
  // Content is full bleed (padding={0}), so add breathing room below the last
  // section instead of letting it butt against the scroll container's edge.
  contentBottomPad: {
    paddingBlockEnd: 'var(--spacing-10)',
  },
});

// Icon's `color` prop only takes semantic names, but the legend swatch must
// match the exact chart series color — inline color required (same pattern as
// the shipped dashboard templates).
function LegendDot({color, label}: {color: string; label: string}) {
  const dotStyle: CSSProperties = {color};
  return (
    <HStack gap={2} vAlign="center">
      <Icon icon={StopIcon} size="xsm" style={dotStyle} />
      <Text type="supporting" color="secondary">
        {label}
      </Text>
    </HStack>
  );
}

// ============= GANTT (milestone timeline) =============

interface GanttTooltipEntry {
  payload: Milestone & {offset: number; duration: number};
}

function GanttTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: GanttTooltipEntry[];
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const m = payload[payload.length - 1].payload;
  return (
    <Card padding={3}>
      <VStack gap={1}>
        <Text type="body" weight="semibold">
          {m.name}
        </Text>
        <Text type="supporting" color="secondary">
          {m.dateLabel} · {PHASE_LABEL[m.phase]}
        </Text>
      </VStack>
    </Card>
  );
}

function GanttChart({milestones}: {milestones: Milestone[]}) {
  // Recharts renders a floating bar as a transparent offset segment plus a
  // colored duration segment stacked on top.
  const data = milestones.map(m => ({
    ...m,
    offset: m.start,
    duration: m.end - m.start,
  }));
  const height = Math.max(160, data.length * 44);

  return (
    <VStack gap={3}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{top: 4, right: 16, left: 8, bottom: 4}}
          barCategoryGap={12}>
          <CartesianGrid horizontal={false} vertical stroke={GRID_STROKE} />
          <XAxis
            type="number"
            domain={[0, 90]}
            ticks={[0, 15, 30, 45, 60, 75, 90]}
            tickFormatter={(v: number) => `D${v}`}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={148}
          />
          <Tooltip content={<GanttTooltip />} cursor={{fill: GRID_STROKE}} />
          <ReferenceLine
            x={PROJECT_DAY}
            stroke="var(--color-accent, #0074e2)"
            strokeDasharray="4 4"
            label={{
              value: 'Today',
              position: 'top',
              fontSize: 11,
              fill: 'var(--color-accent, #0074e2)',
            }}
          />
          <Bar
            dataKey="offset"
            stackId="gantt"
            fill="transparent"
            isAnimationActive={false}
          />
          <Bar
            dataKey="duration"
            stackId="gantt"
            radius={4}
            isAnimationActive={false}>
            {data.map(m => (
              <Cell key={m.id} fill={RAG_FILL[m.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <HStack gap={5} vAlign="center" wrap="wrap">
        <LegendDot color={RAG_FILL.onTrack} label="On track" />
        <LegendDot color={RAG_FILL.atRisk} label="At risk" />
        <LegendDot color={RAG_FILL.blocked} label="Blocked" />
      </HStack>
    </VStack>
  );
}

// ============= WORKSTREAM TABLE =============

const columns: TableColumn<Workstream>[] = [
  {
    key: 'name',
    header: 'Workstream',
    width: proportional(2),
    renderCell: (item: Workstream) => (
      <VStack gap={0}>
        <Text type="body" weight="semibold">
          {item.name}
        </Text>
        <Text type="supporting" color="secondary">
          {PHASE_LABEL[item.phase]}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'owner',
    header: 'Owner',
    width: pixel(180),
    renderCell: (item: Workstream) => (
      <HStack gap={2} vAlign="center">
        <Avatar name={item.owner} size="sm" />
        <Text type="body">{item.owner}</Text>
      </HStack>
    ),
  },
  {
    key: 'percent',
    header: '% complete',
    width: proportional(1),
    renderCell: (item: Workstream) => (
      <VStack gap={1}>
        <ProgressBar
          value={item.percent}
          max={100}
          variant={RAG_TONE[item.status]}
          label={`${item.name} progress`}
          isLabelHidden
        />
        <Text type="supporting" color="secondary">
          {item.percent}%
        </Text>
      </VStack>
    ),
  },
  {
    key: 'due',
    header: 'Due',
    width: pixel(120),
    renderCell: (item: Workstream) => (
      <Timestamp value={item.due} format="date" />
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(130),
    renderCell: (item: Workstream) => (
      <Token
        size="sm"
        color={RAG_BADGE[item.status]}
        label={RAG_LABEL[item.status]}
      />
    ),
  },
];

// ============= RISKS PANEL =============

function RiskCard({risk}: {risk: Risk}) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="start">
          <StackItem size="fill">
            <Text type="body" weight="semibold">
              {risk.title}
            </Text>
          </StackItem>
          <Badge
            variant={RAG_BADGE[risk.severity]}
            label={RAG_LABEL[risk.severity]}
          />
        </HStack>

        <Text type="supporting" color="secondary">
          {risk.detail}
        </Text>

        <Divider />

        <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
          <HStack gap={2} vAlign="center">
            <Avatar name={risk.owner} size="sm" />
            <Text type="supporting" color="secondary">
              {risk.owner}
            </Text>
          </HStack>
          <Text type="supporting" color="secondary">
            {risk.workstream} · {PHASE_LABEL[risk.phase]}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

function RisksPanel({risks}: {risks: Risk[]}) {
  if (risks.length === 0) {
    return (
      <EmptyState
        title="No open blockers or risks"
        description="Nothing flagged for the selected phase. Keep it up."
        icon={<Icon icon={CheckCircleIcon} size="lg" color="success" />}
        isCompact
      />
    );
  }
  return (
    <VStack gap={3}>
      {risks.map(risk => (
        <RiskCard key={risk.id} risk={risk} />
      ))}
    </VStack>
  );
}

// ============= BURN-DOWN CHART =============

interface BurndownEntry {
  name: string;
  value: number;
  color: string;
}

function BurndownTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: BurndownEntry[];
  label?: number;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const wk = typeof label === 'number' ? (BURNDOWN[label]?.label ?? '') : '';
  return (
    <Card padding={3}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {wk}
        </Text>
        {payload.map(entry => (
          <LegendDot
            key={entry.name}
            color={entry.color}
            label={`${entry.name}: ${entry.value} pts`}
          />
        ))}
      </VStack>
    </Card>
  );
}

function BurndownChart() {
  const idealColor = 'var(--color-text-secondary, #737373)';
  const actualColor = 'var(--color-data-categorical-blue, #0171E3)';
  return (
    <VStack gap={3}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={BURNDOWN}
          margin={{top: 5, right: 12, left: 0, bottom: 5}}>
          <CartesianGrid horizontal vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="week"
            type="number"
            domain={[0, BURNDOWN.length - 1]}
            ticks={[0, 3, 6, 9, 12]}
            tickFormatter={(v: number) => BURNDOWN[v]?.label ?? ''}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={40}
            unit=" pts"
          />
          <Tooltip
            content={<BurndownTooltip />}
            cursor={{stroke: GRID_STROKE}}
          />
          <Line
            type="monotone"
            dataKey="ideal"
            name="Ideal"
            stroke={idealColor}
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke={actualColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <HStack gap={5} vAlign="center" wrap="wrap">
        <LegendDot color={actualColor} label="Actual remaining" />
        <LegendDot color={idealColor} label="Ideal burndown" />
      </HStack>
    </VStack>
  );
}

// ============= SECTION HEADING =============

function SectionHeading({title, hint}: {title: string; hint?: string}) {
  return (
    <HStack hAlign="between" vAlign="center" gap={3}>
      <Heading level={2}>{title}</Heading>
      {hint ? (
        <Text type="supporting" color="secondary">
          {hint}
        </Text>
      ) : null}
    </HStack>
  );
}

// ============= MAIN =============

export default function LaunchStatusTrackerPage() {
  const [phase, setPhase] = useState<Phase>('all');

  const milestones = useMemo(() => byPhase(MILESTONES, phase), [phase]);
  const workstreams = useMemo(() => byPhase(WORKSTREAMS, phase), [phase]);
  const risks = useMemo(() => byPhase(RISKS, phase), [phase]);

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader padding={6} hasDivider>
          <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
            <VStack gap={2}>
              <Heading level={1}>Aurora Launch</Heading>
              <HStack gap={2} vAlign="center">
                <Badge variant="yellow" label={RAG_LABEL[PROGRAM_STATUS]} />
                <Text type="body" color="secondary">
                  Target GA
                </Text>
                <Text type="body" color="secondary">
                  •
                </Text>
                <Timestamp
                  value="2026-06-30T00:00:00Z"
                  format="date"
                  type="body"
                  color="secondary"
                />
              </HStack>
            </VStack>
            <HStack gap={3}>
              <SegmentedControl
                label="Release phase"
                value={phase}
                onChange={value => setPhase(value as Phase)}>
                <SegmentedControlItem label="All" value="all" />
                <SegmentedControlItem label="Build" value="build" />
                <SegmentedControlItem label="Beta" value="beta" />
                <SegmentedControlItem label="GA" value="ga" />
              </SegmentedControl>
              <Button
                label="Export status"
                variant="secondary"
                icon={<Icon icon={ArrowDownTrayIcon} size="sm" />}
              />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      end={
        <LayoutPanel
          width={400}
          padding={6}
          hasDivider
          role="complementary"
          label="Blockers and risks">
          <VStack gap={4}>
            <SectionHeading
              title="Blockers & risks"
              hint={`${risks.length} open`}
            />
            <RisksPanel risks={risks} />
          </VStack>
        </LayoutPanel>
      }
      content={
        <LayoutContent padding={0} xstyle={pageStyles.contentBottomPad}>
          <VStack gap={6}>
            <Section variant="transparent" padding={6} dividers={['bottom']}>
              <VStack gap={8}>
                {/* Overall progress */}
                <VStack gap={4}>
                  <HStack gap={2} vAlign="center" hAlign="between">
                    <Heading level={2}>Overall completion</Heading>
                    <Text type="large" color="secondary">
                      {OVERALL_PERCENT}%
                    </Text>
                  </HStack>
                  <ProgressBar
                    value={OVERALL_PERCENT}
                    max={100}
                    variant={RAG_TONE[PROGRAM_STATUS]}
                    label="Overall completion"
                    isLabelHidden
                  />
                </VStack>

                <Divider />

                {/* Milestone timeline */}
                <VStack gap={4}>
                  <SectionHeading
                    title="Milestone timeline"
                    hint="Project days 0–90 · dashed line marks today"
                  />
                  {milestones.length === 0 ? (
                    <EmptyState
                      title="No milestones in this phase"
                      description="Switch phases to see other milestones."
                      icon={<Icon icon={FlagIcon} size="lg" />}
                      isCompact
                    />
                  ) : (
                    <GanttChart milestones={milestones} />
                  )}
                </VStack>
              </VStack>
            </Section>

            <Section variant="transparent" padding={6}>
              <VStack gap={10} xstyle={pageStyles.contentWidth}>
                {/* Workstream table */}
                <VStack gap={6}>
                  <SectionHeading
                    title="Workstreams"
                    hint={`${workstreams.length} of ${WORKSTREAMS.length}`}
                  />
                  <Card>
                    {workstreams.length === 0 ? (
                      <EmptyState
                        title="No workstreams in this phase"
                        description="Switch phases to see other workstreams."
                        icon={<Icon icon={FlagIcon} size="lg" />}
                        isCompact
                      />
                    ) : (
                      <Table<Workstream>
                        data={workstreams}
                        columns={columns}
                        idKey="id"
                        density="balanced"
                        dividers="rows"
                        hasHover
                      />
                    )}
                  </Card>
                </VStack>

                {/* Burn-down / progress-over-time */}
                <VStack gap={6}>
                  <SectionHeading
                    title="Scope burndown"
                    hint={`Remaining story points · ${BURNDOWN.length} weeks`}
                  />
                  <Card>
                    <BurndownChart />
                  </Card>
                </VStack>
              </VStack>
            </Section>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
