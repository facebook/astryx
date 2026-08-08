// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Project Status Dashboard — a program / launch status tracker.
 *
 * Content-only (root `Layout`); the host supplies the app shell. Frame:
 *   header (title, program status, phase filter) | content column capped at 1440px
 *
 * Widgets stack down the content column:
 *
 *   overall completion bar | milestone Gantt with a "today" marker
 *                          | blockers & risks carousel
 *                          | workstream table | scope burndown
 *
 * The release-phase control (All / Build / Beta / GA) is real: it filters
 * milestones, workstreams, and risks, each of which falls back to an empty
 * state. All data is deterministic (fixed fixtures, no clocks/random) so
 * previews stay stable.
 */

import {useMemo, useState, type CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutFooter,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Badge} from '@astryxdesign/core/Badge';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Carousel} from '@astryxdesign/core/Carousel';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Table, proportional} from '@astryxdesign/core/Table';
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
type ReleasePhase = Exclude<Phase, 'all'>;

interface Milestone {
  id: string;
  name: string;
  phase: ReleasePhase;
  // Day offsets on the shared TIMELINE_DAYS scale (project day 0 = kickoff).
  start: number;
  end: number;
  status: Rag;
  dateLabel: string;
}

interface Workstream extends Record<string, unknown> {
  id: string;
  name: string;
  owner: string;
  phase: ReleasePhase;
  percent: number;
  due: string;
  status: Rag;
}

interface Risk {
  id: string;
  title: string;
  workstream: string;
  phase: ReleasePhase;
  severity: Rag;
  owner: string;
  detail: string;
}

// ============= LABEL & TONE MAPPING =============

const PHASE_LABEL: Record<ReleasePhase, string> = {
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

// Chart fills via design tokens (hex fallbacks for non-themed contexts).
const RAG_FILL: Record<Rag, string> = {
  onTrack: 'var(--color-success, #0B991F)',
  atRisk: 'var(--color-warning, #B25000)',
  blocked: 'var(--color-error, #D6002A)',
};

// ============= CHART CHROME (design tokens w/ hex fallbacks) =============

const TEXT_SECONDARY = 'var(--color-text-secondary, #4E606F)';
const GRID_STROKE = 'var(--color-border, rgba(5, 54, 89, 0.1))';
const ACCENT = 'var(--color-accent, #0074e2)';
const IDEAL_COLOR = TEXT_SECONDARY;
const ACTUAL_COLOR = 'var(--color-data-categorical-blue, #0171E3)';
const AXIS_TICK = {
  fontSize: 'var(--font-size-sm, 12px)',
  fill: TEXT_SECONDARY,
};

// ============= TIMELINE SCALE =============

const TIMELINE_DAYS = 90;
const TIMELINE_TICK_STEP = 15;
const TIMELINE_TICKS = Array.from(
  {length: TIMELINE_DAYS / TIMELINE_TICK_STEP + 1},
  (_, i) => i * TIMELINE_TICK_STEP,
);

// "Today" marker, as a day offset on the same scale.
const PROJECT_DAY = 58;

// ============= DATA =============

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

// Ideal vs. actual remaining scope (story points), one entry per week. Actual
// trails ideal mid-project (scope discovery), then recovers late.
const BURNDOWN = (() => {
  const total = 320;
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

const BURNDOWN_TICKS = [0, 3, 6, 9, 12];

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
function byPhase<T extends {phase: ReleasePhase}>(
  items: T[],
  phase: Phase,
): T[] {
  return phase === 'all' ? items : items.filter(item => item.phase === phase);
}

// ============= SHARED PIECES =============

const pageStyles = stylex.create({
  contentBottomPad: {
    paddingBlockEnd: 'var(--spacing-10)',
  },
  // Carousel's `padding` prop is inline-only, so the block gutter is supplied
  // here. The root has no padding of its own, so nothing overrides these.
  riskCarousel: {
    paddingBlockStart: 'var(--spacing-4)',
    paddingBlockEnd: 'var(--spacing-4)',
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

function PhaseEmptyState({noun}: {noun: string}) {
  return (
    <EmptyState
      title={`No ${noun} in this phase`}
      description={`Switch phases to see other ${noun}.`}
      icon={<Icon icon={FlagIcon} size="lg" />}
      isCompact
    />
  );
}

// ============= GANTT (milestone timeline) =============

const GANTT_MIN_HEIGHT = 160;
const GANTT_ROW_HEIGHT = 44;

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
  // The colored duration segment is stacked last, so it carries the milestone.
  const milestone = payload[payload.length - 1].payload;
  return (
    <Card padding={3}>
      <VStack gap={1}>
        <Text type="body" weight="semibold">
          {milestone.name}
        </Text>
        <Text type="supporting" color="secondary">
          {milestone.dateLabel} · {PHASE_LABEL[milestone.phase]}
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
  const height = Math.max(GANTT_MIN_HEIGHT, data.length * GANTT_ROW_HEIGHT);

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
            domain={[0, TIMELINE_DAYS]}
            ticks={TIMELINE_TICKS}
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
            stroke={ACCENT}
            strokeDasharray="4 4"
            label={{
              value: 'Today',
              position: 'top',
              fontSize: 11,
              fill: ACCENT,
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
      <HStack gap={4} vAlign="center" wrap="wrap">
        <LegendDot color={RAG_FILL.onTrack} label={RAG_LABEL.onTrack} />
        <LegendDot color={RAG_FILL.atRisk} label={RAG_LABEL.atRisk} />
        <LegendDot color={RAG_FILL.blocked} label={RAG_LABEL.blocked} />
      </HStack>
    </VStack>
  );
}

// ============= RISKS CAROUSEL =============

// Fixed card footprint so every slide in the carousel is the same size.
const RISK_CARD_WIDTH = 320;
const RISK_CARD_HEIGHT = 280;

function RiskCard({risk}: {risk: Risk}) {
  return (
    <Card width={RISK_CARD_WIDTH} height={RISK_CARD_HEIGHT} padding={0}>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={4}>
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
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={4}>
            <Text type="supporting" color="secondary">
              {risk.detail}
            </Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter padding={4} hasDivider>
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
          </LayoutFooter>
        }
      />
    </Card>
  );
}

function RisksPanel({risks}: {risks: Risk[]}) {
  if (risks.length === 0) {
    return (
      <Card variant="muted" padding={6}>
        <EmptyState
          title="No open blockers or risks"
          description="Nothing flagged for the selected phase. Keep it up."
          icon={<Icon icon={CheckCircleIcon} size="lg" color="success" />}
          isCompact
        />
      </Card>
    );
  }
  return (
    // padding={0} so the carousel can scroll edge to edge; its own `padding`
    // prop supplies the inline gutter.
    <Card variant="muted" padding={0}>
      <Carousel
        padding={4}
        gap={3}
        hasSnap
        aria-label="Blockers and risks"
        xstyle={pageStyles.riskCarousel}>
        {risks.map(risk => (
          <RiskCard key={risk.id} risk={risk} />
        ))}
      </Carousel>
    </Card>
  );
}

// ============= WORKSTREAM TABLE =============

const WORKSTREAM_COLUMNS: TableColumn<Workstream>[] = [
  {
    key: 'name',
    header: 'Workstream',
    width: proportional(1, {minWidth: 160}),
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
    width: proportional(1, {minWidth: 160}),
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
    width: proportional(2, {minWidth: 200}),
    renderCell: (item: Workstream) => (
      <VStack gap={1}>
        <ProgressBar
          value={item.percent}
          max={100}
          variant="neutral"
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
    width: proportional(1, {minWidth: 120}),
    renderCell: (item: Workstream) => (
      <Timestamp value={item.due} format="date" />
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: proportional(1, {minWidth: 120}),
    renderCell: (item: Workstream) => (
      <Badge variant={RAG_BADGE[item.status]} label={RAG_LABEL[item.status]} />
    ),
  },
];

// ============= BURN-DOWN CHART =============

interface BurndownTooltipEntry {
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
  payload?: BurndownTooltipEntry[];
  label?: number;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const week = typeof label === 'number' ? (BURNDOWN[label]?.label ?? '') : '';
  return (
    <Card padding={3}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {week}
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
  return (
    <VStack gap={3}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={BURNDOWN}
          margin={{top: 16, right: 4, left: 4, bottom: 4}}>
          <CartesianGrid horizontal vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="week"
            type="number"
            domain={[0, BURNDOWN.length - 1]}
            ticks={BURNDOWN_TICKS}
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
            stroke={IDEAL_COLOR}
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke={ACTUAL_COLOR}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <HStack gap={4} vAlign="center" wrap="wrap">
        <LegendDot color={ACTUAL_COLOR} label="Actual remaining" />
        <LegendDot color={IDEAL_COLOR} label="Ideal burndown" />
      </HStack>
    </VStack>
  );
}

// ============= PAGE HEADER =============

function ProgramHeader({
  phase,
  onPhaseChange,
}: {
  phase: Phase;
  onPhaseChange: (phase: Phase) => void;
}) {
  return (
    <LayoutHeader padding={6} hasDivider>
      <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
        <VStack gap={2}>
          <Heading level={1}>Aurora Launch</Heading>
          <HStack gap={2} vAlign="center">
            <Badge
              variant={RAG_BADGE[PROGRAM_STATUS]}
              label={RAG_LABEL[PROGRAM_STATUS]}
            />
            <Text type="body" color="secondary">
              Target GA ·
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
            onChange={value => onPhaseChange(value as Phase)}>
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
  );
}

// ============= MAIN =============

export default function ProjectStatusPage() {
  const [phase, setPhase] = useState<Phase>('all');

  const milestones = useMemo(() => byPhase(MILESTONES, phase), [phase]);
  const workstreams = useMemo(() => byPhase(WORKSTREAMS, phase), [phase]);
  const risks = useMemo(() => byPhase(RISKS, phase), [phase]);

  return (
    <Layout
      height="fill"
      contentWidth={1440}
      header={<ProgramHeader phase={phase} onPhaseChange={setPhase} />}
      content={
        <LayoutContent padding={6} xstyle={pageStyles.contentBottomPad}>
          <VStack gap={10}>
            <Card padding={6}>
              <VStack gap={4}>
                <HStack gap={2} vAlign="center" hAlign="between">
                  {/* Visually a card title, but a peer of the level-2 section
                      headings below it in the document outline. */}
                  <Heading level={3} accessibilityLevel={2}>
                    Overall completion
                  </Heading>
                  <Text type="body" color="secondary">
                    {OVERALL_PERCENT}%
                  </Text>
                </HStack>
                <ProgressBar
                  value={OVERALL_PERCENT}
                  max={100}
                  variant="accent"
                  label="Overall completion"
                  isLabelHidden
                />
              </VStack>
            </Card>

            <VStack gap={4}>
              <SectionHeading
                title="Milestone timeline"
                hint={`Project days 0–${TIMELINE_DAYS} · dashed line marks today`}
              />
              <Card padding={6}>
                {milestones.length === 0 ? (
                  <PhaseEmptyState noun="milestones" />
                ) : (
                  <GanttChart milestones={milestones} />
                )}
              </Card>
            </VStack>

            <VStack gap={4}>
              <SectionHeading
                title="Blockers & risks"
                hint={`${risks.length} open`}
              />
              <RisksPanel risks={risks} />
            </VStack>

            <VStack gap={4}>
              <SectionHeading
                title="Workstreams"
                hint={`${workstreams.length} of ${WORKSTREAMS.length}`}
              />
              <Card>
                {workstreams.length === 0 ? (
                  <PhaseEmptyState noun="workstreams" />
                ) : (
                  <Table<Workstream>
                    data={workstreams}
                    columns={WORKSTREAM_COLUMNS}
                    idKey="id"
                    density="balanced"
                    dividers="rows"
                    hasHover
                  />
                )}
              </Card>
            </VStack>

            <VStack gap={4}>
              <SectionHeading
                title="Scope burndown"
                hint={`Remaining story points · ${BURNDOWN.length} weeks`}
              />
              <Card padding={6}>
                <BurndownChart />
              </Card>
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
