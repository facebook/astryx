// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file page.tsx
 * @position Lab → Core graduation dashboard. Tracks every @astryxdesign/lab
 *   component against the core-graduation bar and lets the community upvote
 *   which components should graduate next.
 * @input None — component roster and criteria signals are defined inline.
 * @output A sandbox page rendering the graduation matrix and upvote column.
 *
 * The graduation criteria mirror the "core bar" from the Component Lifecycle
 * wiki (https://github.com/facebook/astryx/wiki/Component-Lifecycle) and
 * packages/lab/README.md: a component graduates from lab to core only after it
 * clears full accessibility, hover guards, a theming story, status states,
 * spec compliance, and vibe testing — on top of the foundational tests + docs
 * build gate. The checkmarks here are a first-pass, best-effort snapshot meant
 * to visualize the gap, not an authoritative pass/fail (that's the Hardening
 * Protocol's job). Upvotes are stored client-side to gauge community demand.
 */

'use client';

import {useCallback, useMemo, useState} from 'react';

import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Banner} from '@astryxdesign/core/Banner';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

// =============================================================================
// Graduation criteria — the "core bar" from the Component Lifecycle wiki.
// =============================================================================

interface Criterion {
  key: string;
  label: string;
  description: string;
}

const CRITERIA: Criterion[] = [
  {
    key: 'tests',
    label: 'Tests',
    description:
      'Behavior, keyboard, and ARIA unit tests colocated with the component (build-gate foundation).',
  },
  {
    key: 'docs',
    label: 'Docs',
    description:
      'Typed .doc.mjs authoring file so the CLI and docsite can surface the API.',
  },
  {
    key: 'a11y',
    label: 'A11y / Keyboard',
    description:
      'Full WAI-ARIA APG keyboard support and the shared a11y primitives (useFocusTrap, useAnnounce, focus hooks). Hard requirement for graduation.',
  },
  {
    key: 'theming',
    label: 'Theming',
    description:
      'themeProps on the correct elements so every registered theme can target the component.',
  },
  {
    key: 'hover',
    label: 'Hover guards',
    description:
      ':hover feedback guarded behind @media (hover: hover) so touch devices are not stuck in a hover state.',
  },
  {
    key: 'status',
    label: 'Status states',
    description:
      'Error / warning / success treatment where the component accepts input (n/a for non-input components).',
  },
  {
    key: 'spec',
    label: 'Spec compliance',
    description:
      'Built against an approved spec with the API conventions applied — verified during Hardening.',
  },
  {
    key: 'vibe',
    label: 'Vibe tested',
    description:
      'Passed the nightly vibe-test battery so the API is validated with real LLM usage.',
  },
];

// =============================================================================
// Component roster.
//
// `signals` are a heuristic, source-scan snapshot (present / absent), NOT an
// authoritative pass. `spec` and `vibe` require human/pipeline sign-off, so
// they start unconfirmed for everything currently in lab. Keep this list in
// sync with packages/lab/src/index.ts.
// =============================================================================

type Cell = 'pass' | 'gap' | 'na' | 'unknown';

interface LabComponent {
  name: string;
  summary: string;
  signals: Record<string, Cell>;
  seedVotes: number;
}

const COMPONENTS: LabComponent[] = [
  {
    name: 'BottomSheet',
    summary:
      'Mobile touch sheet with drag-to-resize snap points on a native <dialog>.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'pass',
      hover: 'gap',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 14,
  },
  {
    name: 'Chart',
    summary: 'Composable chart primitives (moving to @astryxdesign/charts).',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'pass',
      theming: 'gap',
      hover: 'gap',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 22,
  },
  {
    name: 'Chat',
    summary:
      'Conversation shell: composer, message list, reactions, typing indicators.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'pass',
      theming: 'pass',
      hover: 'pass',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 41,
  },
  {
    name: 'ChatReasoning',
    summary: 'Collapsible reasoning trace block for assistant messages.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'pass',
      hover: 'gap',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 9,
  },
  {
    name: 'CircularProgress',
    summary: 'Determinate / indeterminate circular progress indicator.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'pass',
      hover: 'na',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 18,
  },
  {
    name: 'CodeEditor',
    summary: 'Controlled code editor with syntax highlighting.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'pass',
      theming: 'pass',
      hover: 'gap',
      status: 'gap',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 33,
  },
  {
    name: 'Drawer',
    summary: 'Edge-anchored overlay panel on the native <dialog> element.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'pass',
      hover: 'gap',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 27,
  },
  {
    name: 'InfoTip',
    summary: 'Small info affordance mirroring Tooltip for supplementary text.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'gap',
      hover: 'pass',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 11,
  },
  {
    name: 'ListInput',
    summary: 'Repeatable list-of-values input with add/remove rows.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'pass',
      theming: 'pass',
      hover: 'gap',
      status: 'pass',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 7,
  },
  {
    name: 'LogStream',
    summary: 'Streaming log viewer with autoscroll and level filtering.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'pass',
      hover: 'pass',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 15,
  },
  {
    name: 'Radial',
    summary: 'Radial gauge / dial visualization.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'pass',
      theming: 'gap',
      hover: 'gap',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 6,
  },
  {
    name: 'RichTextEditor',
    summary:
      'Markdown-backed rich text editor with getMarkdown() and maxLength.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'pass',
      theming: 'pass',
      hover: 'gap',
      status: 'pass',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 38,
  },
  {
    name: 'SVGIcon',
    summary: 'Low-level SVG icon renderer for the icon registry.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'pass',
      hover: 'na',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 4,
  },
  {
    name: 'Sankey',
    summary: 'Sankey flow diagram.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'pass',
      theming: 'gap',
      hover: 'gap',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 8,
  },
  {
    name: 'Schedule',
    summary: 'Calendar / schedule grid for events and availability.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'pass',
      hover: 'gap',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 19,
  },
  {
    name: 'Stat',
    summary: 'KPI / metric display with label, value, and trend.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'pass',
      hover: 'na',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 24,
  },
  {
    name: 'Stepper',
    summary: 'Multi-step progress indicator with on-track state.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'pass',
      theming: 'pass',
      hover: 'pass',
      status: 'pass',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 29,
  },
  {
    name: 'ThreeD',
    summary: '3D model / scene viewer.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'gap',
      hover: 'gap',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 5,
  },
  {
    name: 'Tour',
    summary: 'Guided product tour / coach-mark walkthrough.',
    signals: {
      tests: 'pass',
      docs: 'pass',
      a11y: 'gap',
      theming: 'gap',
      hover: 'gap',
      status: 'na',
      spec: 'unknown',
      vibe: 'unknown',
    },
    seedVotes: 16,
  },
];

const VOTE_STORAGE_KEY = 'astryx-lab-graduation-votes';

// =============================================================================
// Progress helpers
// =============================================================================

/** Criteria that count toward the graduation score (n/a is excluded). */
function scoreFor(signals: Record<string, Cell>): {
  passed: number;
  total: number;
} {
  let passed = 0;
  let total = 0;
  for (const c of CRITERIA) {
    const cell = signals[c.key];
    if (cell === 'na') {
      continue;
    }
    total += 1;
    if (cell === 'pass') {
      passed += 1;
    }
  }
  return {passed, total};
}

// =============================================================================
// Cell renderer
// =============================================================================

function CriterionCell({state, label}: {state: Cell; label: string}) {
  if (state === 'na') {
    return (
      <Tooltip content={`${label}: not applicable to this component`}>
        <span {...stylex.props(styles.cellWrap)}>
          <Icon
            icon="close"
            size="xsm"
            color="secondary"
            label={`${label}: not applicable`}
          />
        </span>
      </Tooltip>
    );
  }
  if (state === 'pass') {
    return (
      <Tooltip content={`${label}: meets the bar`}>
        <span {...stylex.props(styles.cellWrap, styles.cellPass)}>
          <Icon icon="check" size="sm" label={`${label}: meets the bar`} />
        </span>
      </Tooltip>
    );
  }
  if (state === 'unknown') {
    return (
      <Tooltip content={`${label}: needs human / pipeline sign-off`}>
        <span {...stylex.props(styles.cellWrap, styles.cellUnknown)}>
          <Text type="supporting" color="secondary">
            —
          </Text>
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip content={`${label}: gap remaining before graduation`}>
      <span {...stylex.props(styles.cellWrap, styles.cellGap)}>
        <Icon
          icon="warning"
          size="xsm"
          color="secondary"
          label={`${label}: gap remaining`}
        />
      </span>
    </Tooltip>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function LabGraduationPage() {
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    const seed: Record<string, number> = {};
    for (const c of COMPONENTS) {
      seed[c.name] = c.seedVotes;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(VOTE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Record<string, number>;
          for (const [name, delta] of Object.entries(parsed)) {
            if (name in seed) {
              seed[name] += delta;
            }
          }
        }
      } catch {
        // ignore malformed storage
      }
    }
    return seed;
  });

  const [myVotes, setMyVotes] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') {
      return {};
    }
    try {
      const stored = window.localStorage.getItem(VOTE_STORAGE_KEY);
      if (!stored) {
        return {};
      }
      const parsed = JSON.parse(stored) as Record<string, number>;
      const flags: Record<string, boolean> = {};
      for (const [name, delta] of Object.entries(parsed)) {
        if (delta > 0) {
          flags[name] = true;
        }
      }
      return flags;
    } catch {
      return {};
    }
  });

  const toggleVote = useCallback((name: string) => {
    setMyVotes(prevFlags => {
      const nextVoted = !prevFlags[name];
      const nextFlags = {...prevFlags, [name]: nextVoted};

      setVotes(prevVotes => {
        const nextVotes = {
          ...prevVotes,
          [name]: (prevVotes[name] ?? 0) + (nextVoted ? 1 : -1),
        };
        if (typeof window !== 'undefined') {
          try {
            const deltas: Record<string, number> = {};
            for (const [n, voted] of Object.entries(nextFlags)) {
              if (voted) {
                deltas[n] = 1;
              }
            }
            window.localStorage.setItem(
              VOTE_STORAGE_KEY,
              JSON.stringify(deltas),
            );
          } catch {
            // ignore write failures (private mode, quota)
          }
        }
        return nextVotes;
      });

      return nextFlags;
    });
  }, []);

  const rows = useMemo(() => {
    return [...COMPONENTS]
      .map(c => {
        const {passed, total} = scoreFor(c.signals);
        return {...c, passed, total, votes: votes[c.name] ?? 0};
      })
      .sort((a, b) => {
        // Closest to graduation first, then by demand.
        const ap = a.passed / a.total;
        const bp = b.passed / b.total;
        if (bp !== ap) {
          return bp - ap;
        }
        return b.votes - a.votes;
      });
  }, [votes]);

  type Row = (typeof rows)[number];

  const readyCount = rows.filter(r => r.passed === r.total).length;
  const topDemand = [...rows].sort((a, b) => b.votes - a.votes)[0];

  const columns: TableColumn<Row>[] = [
    {
      key: 'component',
      header: 'Component',
      width: proportional(3),
      renderCell: (row: Row) => (
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Text weight="bold">{row.name}</Text>
            {row.passed === row.total ? (
              <Badge variant="success" label="Ready" />
            ) : null}
          </HStack>
          <Text type="supporting" color="secondary">
            {row.summary}
          </Text>
        </VStack>
      ),
    },
    ...CRITERIA.map((crit): TableColumn<Row> => ({
      key: crit.key,
      header: crit.label,
      width: pixel(96),
      align: 'center',
      renderCell: (row: Row) => (
        <CriterionCell state={row.signals[crit.key]} label={crit.label} />
      ),
    })),
    {
      key: 'progress',
      header: 'Progress',
      width: pixel(150),
      renderCell: (row: Row) => (
        <VStack gap={1}>
          <ProgressBar
            value={row.passed}
            max={row.total}
            label={`${row.name} graduation progress`}
            isLabelHidden
          />
          <Text type="supporting" color="secondary">
            {row.passed}/{row.total} criteria
          </Text>
        </VStack>
      ),
    },
    {
      key: 'demand',
      header: 'Community demand',
      width: pixel(170),
      align: 'center',
      renderCell: (row: Row) => (
        <HStack gap={2} vAlign="center" hAlign="center">
          <IconButton
            label={
              myVotes[row.name]
                ? `Remove your upvote for ${row.name}`
                : `Upvote ${row.name} to graduate`
            }
            tooltip={myVotes[row.name] ? 'Remove upvote' : 'Upvote to graduate'}
            variant={myVotes[row.name] ? 'primary' : 'secondary'}
            size="sm"
            icon={<Icon icon="arrowUp" size="sm" />}
            onClick={() => toggleVote(row.name)}
          />
          <span {...stylex.props(styles.voteCount)}>
            <Text weight="bold">{row.votes}</Text>
          </span>
        </HStack>
      ),
    },
  ];

  return (
    <div {...stylex.props(styles.page)}>
      <VStack gap={5}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Heading level={1}>Lab → Core graduation</Heading>
            <Badge variant="purple" label="Coming soon" />
          </HStack>
          <Text type="large" color="secondary">
            Every component in <code>@astryxdesign/lab</code> and how far it is
            from graduating into <code>@astryxdesign/core</code>. The bar comes
            from the Component Lifecycle promotion gate: full accessibility,
            theming, status states, spec compliance, and vibe testing.
          </Text>
        </VStack>

        <HStack gap={3} wrap="wrap">
          <SummaryStat label="In lab" value={COMPONENTS.length} />
          <SummaryStat label="Meeting the full bar" value={readyCount} />
          <SummaryStat
            label="Most requested"
            value={topDemand ? `${topDemand.name} (${topDemand.votes})` : '—'}
          />
        </HStack>

        <Banner
          status="info"
          title="These checkmarks are a first-pass snapshot"
          description="Criteria signals are derived from a source scan and are meant to visualize the gap, not certify a pass. Spec compliance and vibe testing require human / pipeline sign-off (shown as —). The Hardening Protocol remains the source of truth for an actual graduation."
        />

        <Card>
          <div {...stylex.props(styles.tableWrap)}>
            <Table
              data={rows}
              columns={columns}
              idKey="name"
              density="spacious"
              dividers="rows"
              hasHover
            />
          </div>
        </Card>

        <div {...stylex.props(styles.legend)}>
          <Heading level={4}>Legend</Heading>
          <HStack gap={4} wrap="wrap">
            <LegendItem>
              <span {...stylex.props(styles.cellWrap, styles.cellPass)}>
                <Icon icon="check" size="sm" />
              </span>
              <Text type="supporting">Meets the bar</Text>
            </LegendItem>
            <LegendItem>
              <span {...stylex.props(styles.cellWrap, styles.cellGap)}>
                <Icon icon="warning" size="xsm" color="secondary" />
              </span>
              <Text type="supporting">Gap remaining</Text>
            </LegendItem>
            <LegendItem>
              <span {...stylex.props(styles.cellWrap, styles.cellUnknown)}>
                <Text type="supporting" color="secondary">
                  —
                </Text>
              </span>
              <Text type="supporting">Needs sign-off</Text>
            </LegendItem>
            <LegendItem>
              <span {...stylex.props(styles.cellWrap)}>
                <Icon icon="close" size="xsm" color="secondary" />
              </span>
              <Text type="supporting">Not applicable</Text>
            </LegendItem>
          </HStack>
        </div>
      </VStack>
    </div>
  );
}

function SummaryStat({label, value}: {label: string; value: string | number}) {
  return (
    <Card>
      <div {...stylex.props(styles.summaryStat)}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Text type="large" weight="bold">
          {String(value)}
        </Text>
      </div>
    </Card>
  );
}

function LegendItem({children}: {children: React.ReactNode}) {
  return (
    <span {...stylex.props(styles.legendItem)}>
      <HStack gap={2} vAlign="center">
        {children}
      </HStack>
    </span>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  page: {
    padding: spacingVars['--spacing-6'],
    maxWidth: 1280,
    marginInline: 'auto',
    width: '100%',
  },
  tableWrap: {
    padding: spacingVars['--spacing-2'],
    overflowX: 'auto',
  },
  summaryStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    padding: spacingVars['--spacing-4'],
    minWidth: 160,
  },
  cellWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: radiusVars['--radius-full'],
  },
  cellPass: {
    color: colorVars['--color-success'],
    backgroundColor: colorVars['--color-success-muted'],
  },
  cellGap: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  cellUnknown: {
    backgroundColor: 'transparent',
  },
  voteCount: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: typeScaleVars['--text-body-size'],
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-2'],
  },
  legendItem: {
    display: 'inline-flex',
  },
});
