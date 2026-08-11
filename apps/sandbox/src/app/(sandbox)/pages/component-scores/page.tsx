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
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Code} from '@astryxdesign/core/Code';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';

import {
  AUDIT_PROMPT,
  LEDGER_URL,
  REPO,
  RUBRIC_URL,
  SCORES_WIKI_URL,
  SECTION_TITLES,
  roster,
  snapshot,
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
// Page
// =============================================================================

type Filter = 'all' | 'audited' | 'tbd' | 'blocks';

const FILTERS: Array<{value: Filter; label: string}> = [
  {value: 'all', label: 'All'},
  {value: 'audited', label: 'Audited'},
  {value: 'tbd', label: 'TBD'},
  {value: 'blocks', label: 'With open BLOCKs'},
];

export default function ComponentScoresPage() {
  const [ledger, setLedger] = useState<Ledger | null>(snapshot);
  const [source, setSource] = useState<'snapshot' | 'live' | 'none'>(
    snapshot ? 'snapshot' : 'none',
  );
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // The ledger is a wiki file served with `access-control-allow-origin: *`, so
  // this page reads current scores without a rebuild. The build-time snapshot
  // above is only there so nothing is ever blank while this resolves — and so
  // the page still works when the wiki is unreachable.
  useEffect(() => {
    let cancelled = false;
    fetch(LEDGER_URL)
      .then(res =>
        res.ok ? res.json() : Promise.reject(new Error(String(res.status))),
      )
      .then((data: Ledger) => {
        if (cancelled || !Array.isArray(data.components)) {
          return;
        }
        setLedger(data);
        setSource('live');
      })
      .catch(() => {
        /* keep the snapshot; the banner says which one is showing */
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
      width: pixel(96),
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
      width: pixel(140),
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
      width: pixel(150),
      renderCell: (row: ScoreRow) => (
        <CopyButton
          text={promptFor(row.component)}
          label={row.audited ? 'Copy re-audit prompt' : 'Copy audit prompt'}
        />
      ),
    },
  ];

  return (
    <VStack gap={6}>
      <VStack gap={3}>
        <Heading level={1}>Component scores</Heading>
        <Text>
          Every component in <Code>packages/core/src</Code> and{' '}
          <Code>packages/lab/src</Code>, joined with the audit ledger. The list
          of components is read from the packages, so anything added shows up
          here as <strong>TBD</strong> with nobody maintaining a list. The
          scores come from{' '}
          <Link href={SCORES_WIKI_URL} isExternalLink>
            the wiki ledger
          </Link>
          , fetched live — a score recorded five minutes ago is on this page
          without a rebuild.
        </Text>
        <Text type="supporting" color="secondary">
          Grades follow the{' '}
          <Link href={RUBRIC_URL} isExternalLink>
            Component Audit Rubric
          </Link>
          : A 90+ · B 80+ · C 70+ · D 60+ · F below 60, and any open BLOCK caps
          the grade at C. The score measures distance from the bar, not craft —
          read the BLOCK count before the letter. TBD means no evidence, not a
          bad component.
        </Text>
      </VStack>

      <Card>
        <VStack gap={3}>
          <Heading level={2}>Coverage</Heading>
          <HStack gap={6} wrap="wrap">
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
          <Text type="supporting" color="secondary">
            {source === 'live'
              ? 'Live from the wiki ledger.'
              : source === 'snapshot'
                ? 'Showing the build-time snapshot — the live fetch has not resolved (or the wiki is unreachable).'
                : 'No ledger available: neither the build-time snapshot nor the live fetch resolved. Every component reads TBD.'}
          </Text>
        </VStack>
      </Card>

      <Card>
        <VStack gap={3}>
          <Heading level={2}>Getting a component audited</Heading>
          <Text>
            You do not need to be an auditor and it does not need a pull
            request. Paste this to an agent that has the repo checked out —
            replace <Code>&lt;Component&gt;</Code>, or use the copy button on
            any row to get it filled in. The nightly pass picks up the next five
            unaudited components on its own, so this is for jumping the queue.
          </Text>
          <CodeBlock language="text" code={AUDIT_PROMPT} />
          <HStack gap={3}>
            <CopyButton text={AUDIT_PROMPT} label="Copy the prompt" size="md" />
            <Link href={RUBRIC_URL} isExternalLink>
              Read the rubric
            </Link>
          </HStack>
          <Divider />
          <Text type="supporting" color="secondary">
            An audit writes its result with{' '}
            <Code>
              node scripts/score-ledger.mjs --record &lt;Component&gt; --from
              &lt;scorecard.json&gt;
            </Code>{' '}
            against a clone of the wiki, files one <Code>hardening</Code> issue
            per open BLOCK, and pushes. Only what was actually measured gets
            recorded — an unverified section is <Code>not_measured</Code>, never
            a guess and never a zero.
          </Text>
        </VStack>
      </Card>

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
      <span {...stylex.props(styles.statValue)}>
        <Text type="large">{value}</Text>
      </span>
    </VStack>
  );
}

const styles = stylex.create({
  statValue: {
    fontVariantNumeric: 'tabular-nums',
  },
});
