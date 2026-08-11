// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useMemo, useState} from 'react';
import * as stylex from '@stylexjs/stylex';

import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import type {BadgeVariant} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Link} from '@astryxdesign/core/Link';
import {Code} from '@astryxdesign/core/Code';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';

import {
  AUDIT_PROMPT,
  LEDGER_URL,
  LEDGER_WIKI_URL,
  REPO,
  RUBRIC_URL,
  SECTION_TITLES,
  roster,
  snapshot,
  snapshotFetchedAt,
  type Ledger,
  type LedgerBlock,
  type LedgerEntry,
} from '../../../../generated/componentScores';

// =============================================================================
// Row model — the roster joined with whatever the ledger knows
// =============================================================================

interface ScoreRow extends Record<string, unknown> {
  id: string;
  component: string;
  package: string;
  audited: boolean;
  score: number | null;
  grade: string | null;
  blocks: number;
  blockList: LedgerBlock[];
  lastAudited: string | null;
  rubricVersion: string | null;
  weakest: string | null;
  entry: LedgerEntry | null;
}

const GRADE_VARIANT: Record<string, BadgeVariant> = {
  A: 'success',
  B: 'success',
  C: 'warning',
  D: 'warning',
  F: 'error',
};

/** The lowest section carrying a published per-section score. */
function weakestSection(entry: LedgerEntry): string | null {
  let worst: {id: string; score: number} | null = null;
  for (const [id, section] of Object.entries(entry.sections || {})) {
    if (section.state !== 'scored' || typeof section.score !== 'number') {
      continue;
    }
    if (!worst || section.score < worst.score) {
      worst = {id, score: section.score};
    }
  }
  return worst
    ? `${SECTION_TITLES[worst.id] ?? worst.id} (${worst.score}/5)`
    : null;
}

function buildRows(ledger: Ledger | null): ScoreRow[] {
  const byId = new Map<string, LedgerEntry>();
  for (const entry of ledger?.components ?? []) {
    byId.set(`${entry.package}/${entry.component}`, entry);
  }

  return roster
    .map(item => {
      const entry = byId.get(`${item.package}/${item.component}`) ?? null;
      return {
        // `Chat` exists in both core and lab, so the row key is the pair.
        id: `${item.package}/${item.component}`,
        component: item.component,
        package: item.package,
        audited: entry != null,
        score: entry?.score ?? null,
        grade: entry?.grade ?? null,
        blocks: entry?.blocks?.count ?? 0,
        blockList: entry?.blocks?.open ?? [],
        lastAudited: entry?.lastAudited ?? null,
        rubricVersion: entry?.rubricVersion ?? null,
        weakest: entry ? weakestSection(entry) : null,
        entry,
      };
    })
    .sort(
      (a, b) =>
        a.component.localeCompare(b.component) ||
        a.package.localeCompare(b.package),
    );
}

// =============================================================================
// Copy-to-clipboard
// =============================================================================

function CopyButton({
  text,
  label = 'Copy',
  size = 'sm',
}: {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      size={size}
      label={copied ? 'Copied' : label}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
    />
  );
}

/** The audit request for one component, with the placeholder filled in. */
const promptFor = (component: string) =>
  AUDIT_PROMPT.replaceAll('<Component>', component);

// =============================================================================
// Freshness
// =============================================================================

/**
 * Which copy is on screen, said out loud. A stale page that looks live is worse
 * than one that admits it, so this is a Badge next to the numbers rather than a
 * line of small print underneath them.
 */
function FreshnessBadge({
  source,
  updated,
}: {
  source: LedgerSource;
  updated: string | null;
}) {
  const snapshotDate = snapshotFetchedAt?.slice(0, 10) ?? null;
  const state = {
    loading: {
      variant: 'neutral' as BadgeVariant,
      label: 'Checking the wiki…',
      detail:
        'Reading the ledger from the wiki. The build-time copy is showing meanwhile.',
    },
    live: {
      variant: 'success' as BadgeVariant,
      label: 'Live',
      detail: updated
        ? `Fetched from the wiki ledger just now; the ledger was last written ${updated}.`
        : 'Fetched from the wiki ledger just now.',
    },
    snapshot: {
      variant: 'warning' as BadgeVariant,
      label: snapshotDate ? `Snapshot from ${snapshotDate}` : 'Snapshot',
      detail:
        'The wiki could not be reached, so this is the copy taken when the site was built. ' +
        'Scores recorded since then are not on this page.',
    },
    none: {
      variant: 'error' as BadgeVariant,
      label: 'No ledger',
      detail:
        'Neither the live fetch nor a build-time snapshot resolved. Every component reads TBD — ' +
        'that is this page failing, not 118 unaudited components.',
    },
  }[source];

  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Badge variant={state.variant} label={state.label} />
      <Text type="supporting" color="secondary">
        {state.detail}
      </Text>
    </HStack>
  );
}

// =============================================================================
// Sticky header
//
// Table ships a sticky-COLUMNS plugin but has no sticky header, and this page
// is 118 rows: scroll past the fold and every cell is an unlabelled em-dash.
// This goes through Table's documented `transformHeaderCell` seam — the same
// one useTableStickyColumns uses — rather than reaching around the component.
// It wants to be a Table prop; see the PR description.
// =============================================================================

const stickyHeaderStyles = stylex.create({
  cell: {
    position: 'sticky',
    insetBlockStart: 0,
    zIndex: 1,
    // Header cells are transparent by default, so a pinned header needs a
    // surface of its own or the rows scroll visibly through it.
    backgroundColor: colorVars['--color-background-body'],
  },
  scrollWrapper: {
    // `position: sticky` resolves against the nearest scrollport, and Table's
    // scroll wrapper already is one: `overflow-x: auto` forces the block axis
    // to compute to `auto` as well. So the header can only pin if the wrapper
    // is also what scrolls vertically. Measured, not assumed — with the sticky
    // cell alone the header scrolled away with the page.
    maxBlockSize: '70vh',
    overflowY: 'auto',
  },
});

const stickyHeader: TablePlugin<ScoreRow> = {
  transformHeaderCell: props => ({
    ...props,
    xstyle: [...props.xstyle, stickyHeaderStyles.cell],
  }),
  transformScrollWrapper: props => ({
    ...props,
    xstyle: [...props.xstyle, stickyHeaderStyles.scrollWrapper],
  }),
};

// =============================================================================
// Page
// =============================================================================

type Filter = 'all' | 'audited' | 'tbd' | 'blocks';

const FILTERS: Array<{value: Filter; label: string}> = [
  {value: 'all', label: 'All'},
  {value: 'audited', label: 'Audited'},
  {value: 'tbd', label: 'TBD'},
  {value: 'blocks', label: 'With open BLOCKs'},
];

/**
 * Which copy of the ledger is on screen. `loading` matters: without it the page
 * claims "snapshot" for the few hundred milliseconds before the fetch lands,
 * which is the same lie in the other direction.
 */
type LedgerSource = 'loading' | 'live' | 'snapshot' | 'none';

export default function ComponentScoresPage() {
  const [ledger, setLedger] = useState<Ledger | null>(snapshot);
  const [source, setSource] = useState<LedgerSource>('loading');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // The ledger is a wiki file served with `access-control-allow-origin: *`, so
  // this page reads current scores without a rebuild. The build-time snapshot
  // is only there so nothing is ever blank while this resolves — and so the
  // page still works when the wiki is unreachable.
  //
  // `no-store`: raw.githubusercontent serves the ledger with `max-age=300`, so
  // the default cache would happily hand back a five-minute-old copy and the
  // page would call it live. A page that says "live" has to have asked.
  useEffect(() => {
    let cancelled = false;
    fetch(LEDGER_URL, {cache: 'no-store'})
      .then(res =>
        res.ok ? res.json() : Promise.reject(new Error(String(res.status))),
      )
      .then((data: Ledger) => {
        if (cancelled) {
          return;
        }
        if (!Array.isArray(data.components)) {
          throw new Error('not a ledger');
        }
        setLedger(data);
        setSource('live');
      })
      .catch(() => {
        if (!cancelled) {
          setSource(snapshot ? 'snapshot' : 'none');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => buildRows(ledger), [ledger]);

  const stats = useMemo(() => {
    const audited = rows.filter(r => r.audited);
    const grades: Record<string, number> = {A: 0, B: 0, C: 0, D: 0, F: 0};
    for (const r of audited) {
      if (r.grade && r.grade in grades) {
        grades[r.grade] += 1;
      }
    }
    return {
      total: rows.length,
      audited: audited.length,
      percent: rows.length
        ? Math.round((audited.length / rows.length) * 1000) / 10
        : 0,
      grades,
      openBlocks: audited.reduce((sum, r) => sum + r.blocks, 0),
      filedIssues: audited.reduce(
        (sum, r) => sum + r.blockList.filter(b => b.issue).length,
        0,
      ),
    };
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (q && !r.component.toLowerCase().includes(q)) {
        return false;
      }
      if (filter === 'audited') {
        return r.audited;
      }
      if (filter === 'tbd') {
        return !r.audited;
      }
      if (filter === 'blocks') {
        return r.blocks > 0;
      }
      return true;
    });
  }, [rows, query, filter]);

  const columns: TableColumn<ScoreRow>[] = [
    {
      key: 'component',
      header: 'Component',
      width: proportional(3),
      renderCell: (row: ScoreRow) => (
        <VStack gap={1}>
          <Text weight="medium">{row.component}</Text>
          <Text type="supporting" color="secondary">
            {row.package}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      width: pixel(88),
      renderCell: (row: ScoreRow) =>
        row.grade ? (
          <Badge
            variant={GRADE_VARIANT[row.grade] ?? 'neutral'}
            label={row.grade}
          />
        ) : (
          <Badge label="TBD" />
        ),
    },
    {
      key: 'score',
      header: 'Score',
      width: pixel(80),
      renderCell: (row: ScoreRow) => (
        <Text>
          {typeof row.score === 'number' ? row.score.toFixed(1) : '—'}
        </Text>
      ),
    },
    {
      key: 'blocks',
      header: 'Open BLOCKs',
      width: proportional(2),
      renderCell: (row: ScoreRow) => {
        if (!row.audited) {
          return <Text color="secondary">—</Text>;
        }
        if (row.blocks === 0) {
          return <Text>0</Text>;
        }
        const filed = row.blockList.filter(b => b.issue);
        const unattributed = row.blocks - row.blockList.length;
        return (
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Badge variant="error" label={String(row.blocks)} />
            {filed.map(block => (
              <Link
                key={`${row.id}-${block.id}`}
                href={`https://github.com/${REPO}/issues/${block.issue}`}
                isExternalLink
                type="supporting">
                {block.id} #{block.issue}
              </Link>
            ))}
            {row.blockList
              .filter(b => !b.issue)
              .map(block => (
                <Text
                  key={`${row.id}-${block.id}`}
                  type="supporting"
                  color="secondary">
                  {block.id} (no issue)
                </Text>
              ))}
            {unattributed > 0 ? (
              <Text type="supporting" color="secondary">
                +{unattributed} unattributed
              </Text>
            ) : null}
          </HStack>
        );
      },
    },
    {
      key: 'weakest',
      header: 'Weakest section',
      width: proportional(2),
      renderCell: (row: ScoreRow) => (
        <Text type="supporting" color="secondary">
          {row.weakest ?? '—'}
        </Text>
      ),
    },
    {
      key: 'lastAudited',
      header: 'Last audited',
      width: pixel(136),
      renderCell: (row: ScoreRow) =>
        row.audited ? (
          <VStack gap={1}>
            <Text type="supporting">{row.lastAudited}</Text>
            <Text type="supporting" color="secondary">
              rubric v{row.rubricVersion}
            </Text>
          </VStack>
        ) : (
          <Text type="supporting" color="secondary">
            never
          </Text>
        ),
    },
    {
      key: 'action',
      header: 'Audit',
      // Wide enough for the button plus the cell's own padding: at pixel(150)
      // the 162px control was clipped on every row.
      width: pixel(190),
      renderCell: (row: ScoreRow) => (
        <CopyButton
          text={promptFor(row.component)}
          label={row.audited ? 'Copy re-audit prompt' : 'Copy audit prompt'}
        />
      ),
    },
  ];

  return (
    // AppShell renders sandbox pages with `contentPadding={0}`, so the page owns
    // its own gutters — without them the content ran flush to both viewport
    // edges and the last column's button was clipped off the right. `maxWidth`
    // caps the measure: unconstrained, the table stretched to 2300px on a
    // 2560px monitor, which puts a component's name and its grade a foot apart.
    <VStack gap={5} padding={6} maxWidth={1600} width="100%">
      <VStack gap={2} maxWidth="72ch">
        <Heading level={1}>Component scores</Heading>
        <Text>
          Every component in <Code>packages/core/src</Code> and{' '}
          <Code>packages/lab/src</Code>, joined with the audit ledger kept in{' '}
          <Link href={LEDGER_WIKI_URL} isExternalLink>
            the wiki
          </Link>
          . <strong>TBD</strong> means nobody has audited it yet — not that the
          component is bad.
        </Text>
        <Link href={RUBRIC_URL} isExternalLink>
          How components are graded, and how to get one audited
        </Link>
      </VStack>

      <VStack gap={2}>
        <HStack gap={6} wrap="wrap" vAlign="center">
          <Stat label="Audited" value={`${stats.audited} / ${stats.total}`} />
          <Stat label="Coverage" value={`${stats.percent}%`} />
          <Stat label="Open BLOCKs" value={String(stats.openBlocks)} />
          <Stat
            label="BLOCKs with an issue"
            value={String(stats.filedIssues)}
          />
          <Stat
            label="Grades"
            value={`A ${stats.grades.A} · B ${stats.grades.B} · C ${stats.grades.C} · D ${stats.grades.D} · F ${stats.grades.F}`}
          />
        </HStack>
        <FreshnessBadge source={source} updated={ledger?.updated ?? null} />
      </VStack>

      <VStack gap={3}>
        <HStack gap={3} vAlign="end" wrap="wrap">
          <TextInput
            label="Filter components"
            isLabelHidden
            placeholder="Filter components…"
            value={query}
            onChange={setQuery}
          />
          {FILTERS.map(({value, label}) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? 'primary' : 'ghost'}
              label={label}
              onClick={() => setFilter(value)}
            />
          ))}
          <Text type="supporting" color="secondary">
            {visible.length} of {rows.length}
          </Text>
        </HStack>

        <Table<ScoreRow>
          data={visible}
          columns={columns}
          idKey="id"
          density="balanced"
          dividers="rows"
          hasHover
          plugins={{stickyHeader}}
        />
      </VStack>

      {ledger?.caveats?.length ? (
        <Card>
          <VStack gap={3}>
            <Heading level={2}>Caveats on the recorded rows</Heading>
            <VStack gap={2}>
              {ledger.caveats.map(caveat => (
                <Text key={caveat} type="supporting" color="secondary">
                  {caveat}
                </Text>
              ))}
            </VStack>
          </VStack>
        </Card>
      ) : null}
    </VStack>
  );
}

function Stat({label, value}: {label: string; value: string}) {
  return (
    <VStack gap={1}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Text type="large" xstyle={styles.statValue}>
        {value}
      </Text>
    </VStack>
  );
}

const styles = stylex.create({
  statValue: {
    fontVariantNumeric: 'tabular-nums',
  },
});
