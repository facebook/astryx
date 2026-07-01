// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Logs Explorer — monitoring log explorer: header (title + live-tail Switch
 * with pulsing StatusDot + time-range SegmentedControl), a facet rail
 * (level/service CheckboxLists with counts), PowerSearch over
 * level/service/message, and an expandable, live-tailing LogStream.
 *
 * Live tail appends a fixed scripted sequence (deterministic fixtures) on a
 * 1200ms interval while the Switch is on; the LogStream pins to the newest
 * row and unpins on scroll-up ("Jump to latest" re-pins).
 *
 * Responsive contract:
 * - ≥769px: facet rail as a 240px start LayoutPanel; content fills the rest.
 * - ≤768px: the facet rail hides — filtering stays available via PowerSearch
 *   level/service fields; header controls wrap onto a second line.
 */

import {useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  VStack,
  HStack,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Divider} from '@astryxdesign/core/Divider';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  PowerSearch,
  usePowerSearchConfig,
} from '@astryxdesign/core/PowerSearch';
import type {PowerSearchFilter} from '@astryxdesign/core/PowerSearch';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {LogStream} from '@astryxdesign/lab';
import type {LogEntry, LogStreamLevel} from '@astryxdesign/lab';

// ============= STYLES =============
// Plain inline styles using Astryx design-token CSS variables (declared at
// :root by `@astryxdesign/core/astryx.css`). No StyleX compiler required.

const styles: Record<string, CSSProperties> = {
  headerRow: {
    width: '100%',
  },
  detailBlock: {
    margin: 0,
    fontFamily: 'var(--font-family-code)',
    fontSize: 'var(--font-size-sm)',
    lineHeight: 1.7,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'pre-wrap',
  },
  streamFooter: {
    paddingTop: 'var(--spacing-2)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed pre-formatted timestamps, no clocks or
// randomness. The live-tail SCRIPT below is equally fixed — only the
// append *cadence* uses a runtime interval.

const LEVELS: LogStreamLevel[] = ['info', 'warn', 'error', 'debug'];
const SERVICES = ['api-gateway', 'billing', 'auth', 'worker'] as const;

function detail(lines: string): React.ReactNode {
  return <pre style={styles.detailBlock}>{lines}</pre>;
}

const BASE_ENTRIES: LogEntry[] = [
  {
    id: 'l-01',
    timestamp: '14:02:08.114',
    level: 'info',
    source: 'api-gateway',
    message: 'GET /v1/projects 200 in 42ms',
  },
  {
    id: 'l-02',
    timestamp: '14:02:08.371',
    level: 'debug',
    source: 'auth',
    message: 'token cache hit for key sess_7f31',
  },
  {
    id: 'l-03',
    timestamp: '14:02:08.910',
    level: 'info',
    source: 'worker',
    message: 'job invoice-sync-2214 dequeued',
  },
  {
    id: 'l-04',
    timestamp: '14:02:09.243',
    level: 'warn',
    source: 'billing',
    message: 'upstream latency 1840ms exceeds 1500ms budget',
    detail: detail(
      '{\n  "upstream": "payments.stripe",\n  "latencyMs": 1840,\n  "budgetMs": 1500,\n  "route": "POST /v1/charges",\n  "traceId": "tr_9c41b2"\n}',
    ),
  },
  {
    id: 'l-05',
    timestamp: '14:02:09.815',
    level: 'info',
    source: 'api-gateway',
    message: 'POST /v1/deployments 201 in 118ms',
  },
  {
    id: 'l-06',
    timestamp: '14:02:10.037',
    level: 'error',
    source: 'billing',
    message: 'charge failed: upstream returned 502',
    detail: detail(
      '{\n  "error": "UpstreamBadGateway",\n  "upstream": "payments.stripe",\n  "attempt": 1,\n  "retryInMs": 400,\n  "invoice": "inv_20418",\n  "traceId": "tr_9c44f8"\n}',
    ),
  },
  {
    id: 'l-07',
    timestamp: '14:02:10.442',
    level: 'info',
    source: 'billing',
    message: 'retrying charge for inv_20418 (attempt 2)',
  },
  {
    id: 'l-08',
    timestamp: '14:02:10.977',
    level: 'debug',
    source: 'worker',
    message: 'connection pool at 40% (8/20)',
  },
  {
    id: 'l-09',
    timestamp: '14:02:11.305',
    level: 'info',
    source: 'billing',
    message: 'charge succeeded for inv_20418 in 322ms',
  },
  {
    id: 'l-10',
    timestamp: '14:02:11.848',
    level: 'info',
    source: 'auth',
    message: 'session refreshed for user u_88412',
  },
  {
    id: 'l-11',
    timestamp: '14:02:12.190',
    level: 'warn',
    source: 'api-gateway',
    message: 'rate limit at 85% for key ak_prod_44',
    detail: detail(
      '{\n  "key": "ak_prod_44",\n  "window": "60s",\n  "used": 851,\n  "limit": 1000,\n  "policy": "sliding-window"\n}',
    ),
  },
  {
    id: 'l-12',
    timestamp: '14:02:12.633',
    level: 'info',
    source: 'worker',
    message: 'job invoice-sync-2214 completed in 3.7s',
  },
  {
    id: 'l-13',
    timestamp: '14:02:13.078',
    level: 'debug',
    source: 'api-gateway',
    message: 'route table reloaded (37 routes)',
  },
  {
    id: 'l-14',
    timestamp: '14:02:13.559',
    level: 'info',
    source: 'api-gateway',
    message: 'GET /v1/logs?cursor=eyJv 200 in 51ms',
  },
];

/** Fixed live-tail script; appended one entry per 1200ms tick, in order. */
const TAIL_SCRIPT: Omit<LogEntry, 'id'>[] = [
  {
    timestamp: '14:02:14.102',
    level: 'info',
    source: 'api-gateway',
    message: 'GET /v1/projects 200 in 38ms',
  },
  {
    timestamp: '14:02:15.310',
    level: 'debug',
    source: 'auth',
    message: 'token cache hit for key sess_9a02',
  },
  {
    timestamp: '14:02:16.522',
    level: 'info',
    source: 'worker',
    message: 'job usage-rollup-0415 dequeued',
  },
  {
    timestamp: '14:02:17.708',
    level: 'warn',
    source: 'billing',
    message: 'webhook delivery slow: 2210ms to partner.acme',
  },
  {
    timestamp: '14:02:18.914',
    level: 'info',
    source: 'billing',
    message: 'webhook delivered to partner.acme (attempt 2)',
  },
  {
    timestamp: '14:02:20.131',
    level: 'error',
    source: 'worker',
    message: 'job usage-rollup-0415 failed: table locked',
  },
  {
    timestamp: '14:02:21.345',
    level: 'info',
    source: 'worker',
    message: 'job usage-rollup-0415 retried and completed',
  },
  {
    timestamp: '14:02:22.560',
    level: 'info',
    source: 'api-gateway',
    message: 'GET /v1/deployments 200 in 47ms',
  },
];

const TIME_RANGES = ['15m', '1h', '4h', '24h'];

const LEVEL_DOT: Record<
  LogStreamLevel,
  'error' | 'warning' | 'accent' | 'neutral'
> = {
  error: 'error',
  warn: 'warning',
  info: 'accent',
  debug: 'neutral',
};

const fieldDefs = [
  {
    key: 'level',
    type: 'enum',
    label: 'Level',
    enumValues: LEVELS.map(level => ({value: level, label: level})),
  },
  {
    key: 'service',
    type: 'enum',
    label: 'Service',
    enumValues: SERVICES.map(service => ({value: service, label: service})),
  },
  {key: 'message', type: 'string', label: 'Message'},
] as const;

// ============= PAGE =============

export default function LogsExplorerPage() {
  const [levelSel, setLevelSel] = useState<string[]>([...LEVELS]);
  const [serviceSel, setServiceSel] = useState<string[]>([...SERVICES]);
  const [range, setRange] = useState('1h');
  const [isLive, setIsLive] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
  const [liveEntries, setLiveEntries] = useState<LogEntry[]>([]);
  // Script cursor lives in a ref so the interval never restarts mid-stream.
  const tailCounterRef = useRef(0);

  const isCompact = useMediaQuery('(max-width: 768px)');

  // Live tail: append the next scripted entry every 1200ms while on. The
  // script itself is a fixed fixture; only the cadence is runtime.
  useEffect(() => {
    if (!isLive) {
      return;
    }
    const id = window.setInterval(() => {
      const n = tailCounterRef.current;
      tailCounterRef.current += 1;
      const scripted = TAIL_SCRIPT[n % TAIL_SCRIPT.length];
      setLiveEntries(prev => [...prev, {...scripted, id: `live-${n}`}]);
    }, 1200);
    return () => window.clearInterval(id);
  }, [isLive]);

  const handleLiveChange = (checked: boolean) => {
    setIsLive(checked);
    if (checked) {
      // Turning the tail on pins the stream to the newest row.
      setIsFollowing(true);
    }
  };

  const allEntries = useMemo(
    () => [...BASE_ENTRIES, ...liveEntries],
    [liveEntries],
  );

  const {config, applyFilters} = usePowerSearchConfig(fieldDefs, 'Logs');

  const visibleEntries = useMemo(() => {
    const faceted = allEntries.filter(
      entry =>
        levelSel.includes(entry.level) &&
        (entry.source == null || serviceSel.includes(entry.source)),
    );
    // PowerSearch filters run against a flat projection of each entry.
    const rows = faceted.map(entry => ({
      id: entry.id,
      level: entry.level,
      service: entry.source ?? '',
      message: entry.message,
    }));
    const kept = new Set(applyFilters(filters, rows).map(row => row.id));
    return faceted.filter(entry => kept.has(entry.id));
  }, [allEntries, levelSel, serviceSel, filters, applyFilters]);

  // Facet counts reflect the full (unfaceted) stream, like most log tools.
  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of allEntries) {
      counts[entry.level] = (counts[entry.level] ?? 0) + 1;
    }
    return counts;
  }, [allEntries]);

  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of allEntries) {
      if (entry.source != null) {
        counts[entry.source] = (counts[entry.source] ?? 0) + 1;
      }
    }
    return counts;
  }, [allEntries]);

  const facetRail = (
    <VStack gap={4}>
      <CheckboxList
        label="Level"
        value={levelSel}
        onChange={setLevelSel}
        density="compact">
        {LEVELS.map(level => (
          <CheckboxListItem
            key={level}
            value={level}
            label={
              <HStack gap={2} vAlign="center">
                <StatusDot
                  variant={LEVEL_DOT[level]}
                  label={`Level: ${level}`}
                />
                <Text type="body">{level}</Text>
              </HStack>
            }
            endContent={<Badge label={String(levelCounts[level] ?? 0)} />}
          />
        ))}
      </CheckboxList>
      <Divider />
      <CheckboxList
        label="Service"
        value={serviceSel}
        onChange={setServiceSel}
        density="compact">
        {SERVICES.map(service => (
          <CheckboxListItem
            key={service}
            value={service}
            label={service}
            endContent={<Badge label={String(serviceCounts[service] ?? 0)} />}
          />
        ))}
      </CheckboxList>
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Logs</Heading>
                <Text type="supporting" color="secondary">
                  {allEntries.length} events indexed · env:prod · UTC
                </Text>
              </VStack>
            </StackItem>
            <HStack gap={2} vAlign="center">
              <StatusDot
                variant={isLive ? 'success' : 'neutral'}
                label={isLive ? 'Live tail streaming' : 'Live tail off'}
                isPulsing={isLive}
              />
              <Switch
                label="Live tail"
                value={isLive}
                onChange={handleLiveChange}
              />
            </HStack>
            <SegmentedControl
              label="Time range"
              value={range}
              onChange={setRange}
              size="sm">
              {TIME_RANGES.map(r => (
                <SegmentedControlItem key={r} value={r} label={r} />
              ))}
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      start={
        isCompact ? undefined : (
          <LayoutPanel width={240} padding={3} hasDivider label="Log facets">
            {facetRail}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={3} label="Log results">
          <VStack gap={3}>
            <PowerSearch
              config={config}
              filters={filters}
              onChange={next => setFilters([...next])}
              placeholder="Filter logs by level, service, or message..."
              resultCount={visibleEntries.length}
            />
            <LogStream
              entries={visibleEntries}
              maxHeight={520}
              isFollowing={isFollowing}
              onFollowChange={setIsFollowing}
              label="Log results stream"
            />
            <div style={styles.streamFooter}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    Showing {visibleEntries.length} of {allEntries.length} logs
                    · past {range}
                  </Text>
                </StackItem>
                <Text type="supporting" color="secondary">
                  {isLive
                    ? isFollowing
                      ? 'Live tail streaming — pinned to latest'
                      : 'Live tail streaming — scrolled up (Jump to latest to re-pin)'
                    : 'Live tail off'}
                </Text>
              </HStack>
            </div>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
