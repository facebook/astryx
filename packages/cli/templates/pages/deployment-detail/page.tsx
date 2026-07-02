// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Deployment Detail — single-deployment status page: LayoutHeader with the
 * mono deployment id + environment Token + StatusDot (building/ready) +
 * Visit/Redeploy/Promote actions, a metadata grid (branch, commit, duration,
 * domains), and a terminal-variant LogStream streaming the build log with
 * Install/Build/Deploy stage headers simulated as entries.
 *
 * "Redeploy" clears the log and replays a fixed script (deterministic
 * fixtures — same lines and timestamps every run) on a 600ms tick;
 * EmptyState covers the gap before the first line lands.
 *
 * Responsive contract:
 * - ≥769px: header id/actions share one row; metadata is a multi-column grid.
 * - ≤768px: header controls wrap onto a second line; metadata collapses to a
 *   single column.
 */

import {useEffect, useRef, useState, type CSSProperties} from 'react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  VStack,
  HStack,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {LogStream} from '@astryxdesign/lab';
import type {LogEntry} from '@astryxdesign/lab';

// ============= STYLES =============
// Plain inline styles using Astryx design-token CSS variables (declared at
// :root by `@astryxdesign/core/astryx.css`). No StyleX compiler required.

const styles: Record<string, CSSProperties> = {
  headerRow: {
    width: '100%',
  },
  mono: {
    fontFamily: 'var(--font-family-code)',
  },
  detailBlock: {
    margin: 0,
    fontFamily: 'var(--font-family-code)',
    fontSize: 'var(--font-size-sm)',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed timestamps and lines — a "Redeploy" replays
// the exact same script (only the append cadence is a runtime interval).

const DEPLOYMENT_ID = 'dpl_9f3k2v7q1x8m4n6p';

/**
 * Fixed build script. Install/Build/Deploy stage headers are plain info
 * entries (source: "stage") — the staged, collapsible feel of a build
 * console simulated inside a flat stream.
 */
const BUILD_SCRIPT: LogEntry[] = [
  {
    id: 'b-01',
    timestamp: '12:04:16.002',
    level: 'info',
    source: 'build',
    message: 'Build machine: 4 cores, 8 GB RAM (iad1)',
  },
  {
    id: 'b-02',
    timestamp: '12:04:16.089',
    level: 'info',
    source: 'build',
    message:
      'Cloning github.com/acme/astryx-console (branch: main, commit: 9f3c2ab)',
  },
  {
    id: 'b-03',
    timestamp: '12:04:17.910',
    level: 'info',
    source: 'build',
    message: 'Cloning completed in 1.8s',
  },
  {
    id: 'b-04',
    timestamp: '12:04:18.021',
    level: 'info',
    source: 'stage',
    message: '── Install ──────────────────────────────',
  },
  {
    id: 'b-05',
    timestamp: '12:04:18.144',
    level: 'info',
    source: 'install',
    message: '$ pnpm install --frozen-lockfile',
  },
  {
    id: 'b-06',
    timestamp: '12:04:21.876',
    level: 'info',
    source: 'install',
    message: 'Packages: +412 (reused 398 from store)',
  },
  {
    id: 'b-07',
    timestamp: '12:04:22.910',
    level: 'debug',
    source: 'install',
    message: 'Ignored build scripts: esbuild, sharp',
  },
  {
    id: 'b-08',
    timestamp: '12:04:23.101',
    level: 'info',
    source: 'install',
    message: 'Done in 4.9s',
  },
  {
    id: 'b-09',
    timestamp: '12:04:23.220',
    level: 'info',
    source: 'stage',
    message: '── Build ────────────────────────────────',
  },
  {
    id: 'b-10',
    timestamp: '12:04:23.348',
    level: 'info',
    source: 'build',
    message: '$ next build',
  },
  {
    id: 'b-11',
    timestamp: '12:04:26.774',
    level: 'info',
    source: 'build',
    message: 'Creating an optimized production build…',
  },
  {
    id: 'b-12',
    timestamp: '12:04:38.207',
    level: 'warn',
    source: 'build',
    message: 'Compiled with warnings (1)',
    detail: (
      <pre style={styles.detailBlock}>
        {
          './app/logs/page.tsx\n42:9  Warning: "range" is assigned a value but never used.  @typescript-eslint/no-unused-vars'
        }
      </pre>
    ),
  },
  {
    id: 'b-13',
    timestamp: '12:04:41.552',
    level: 'info',
    source: 'build',
    message: 'Collecting page data…',
  },
  {
    id: 'b-14',
    timestamp: '12:04:44.310',
    level: 'info',
    source: 'build',
    message: 'Route (app): 14 routes, first load JS 87.4 kB',
  },
  {
    id: 'b-15',
    timestamp: '12:04:44.518',
    level: 'info',
    source: 'stage',
    message: '── Deploy ───────────────────────────────',
  },
  {
    id: 'b-16',
    timestamp: '12:04:45.201',
    level: 'info',
    source: 'deploy',
    message: 'Uploading build outputs (23.4 MB)…',
  },
  {
    id: 'b-17',
    timestamp: '12:04:48.664',
    level: 'info',
    source: 'deploy',
    message: 'Assigning alias astryx-console.example.com',
  },
  {
    id: 'b-18',
    timestamp: '12:04:49.882',
    level: 'info',
    source: 'deploy',
    message: 'Deployment ready: https://astryx-console-git-main.example.app',
  },
  {
    id: 'b-19',
    timestamp: '12:04:50.004',
    level: 'info',
    source: 'deploy',
    message: 'Build completed in 34s',
  },
];

const METADATA = [
  {label: 'Branch', value: 'main'},
  {label: 'Commit', value: '9f3c2ab — fix(logs): stabilize tail ordering'},
  {label: 'Duration', value: '34s'},
  {label: 'Created', value: 'Jun 11, 2026, 12:04 UTC'},
  {label: 'Domains', value: 'astryx-console.example.com'},
  {label: 'Framework', value: 'Next.js 15'},
];

type BuildStatus = 'building' | 'ready';

// ============= PAGE =============

export default function DeploymentDetailPage() {
  // Initial state: the last build already completed (full script shown).
  const [buildEntries, setBuildEntries] = useState<LogEntry[]>(BUILD_SCRIPT);
  const [status, setStatus] = useState<BuildStatus>('ready');
  const [isFollowing, setIsFollowing] = useState(false);
  const tickRef = useRef(0);

  const isCompact = useMediaQuery('(max-width: 768px)');

  // Streaming rebuild: one scripted line per 600ms tick until exhausted.
  useEffect(() => {
    if (status !== 'building') {
      return;
    }
    const id = window.setInterval(() => {
      const n = tickRef.current;
      if (n >= BUILD_SCRIPT.length) {
        setStatus('ready');
        return;
      }
      tickRef.current += 1;
      setBuildEntries(prev => [...prev, BUILD_SCRIPT[n]]);
    }, 600);
    return () => window.clearInterval(id);
  }, [status]);

  const handleRedeploy = () => {
    tickRef.current = 0;
    setBuildEntries([]);
    setStatus('building');
    setIsFollowing(true);
  };

  const isBuilding = status === 'building';

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
            <StackItem size="fill">
              <VStack gap={1}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Heading level={1}>
                    <span style={styles.mono}>{DEPLOYMENT_ID}</span>
                  </Heading>
                  <Token label="Production" color="blue" size="sm" />
                  <HStack gap={1.5} vAlign="center">
                    <StatusDot
                      variant={isBuilding ? 'accent' : 'success'}
                      label={isBuilding ? 'Building' : 'Ready'}
                      isPulsing={isBuilding}
                    />
                    <Text type="supporting" color="secondary">
                      {isBuilding ? 'Building' : 'Ready'}
                    </Text>
                  </HStack>
                </HStack>
                <Text type="supporting" color="secondary">
                  acme/astryx-console · deployed from main by dpetersen
                </Text>
              </VStack>
            </StackItem>
            <HStack gap={2} vAlign="center">
              <Button label="Visit" variant="secondary" />
              <Button
                label="Redeploy"
                variant="secondary"
                onClick={handleRedeploy}
                isDisabled={isBuilding}
              />
              <Button label="Promote" variant="primary" />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={3} label="Deployment detail">
          <VStack gap={4}>
            <Card padding={4}>
              <MetadataList
                columns={isCompact ? 'single' : 'multi'}
                label={{position: 'start', width: 96}}>
                {METADATA.map(item => (
                  <MetadataListItem key={item.label} label={item.label}>
                    <Text type="body">{item.value}</Text>
                  </MetadataListItem>
                ))}
              </MetadataList>
            </Card>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Heading level={3}>Build logs</Heading>
                </StackItem>
                <Text type="supporting" color="secondary">
                  {isBuilding
                    ? `Streaming — ${buildEntries.length} of ${BUILD_SCRIPT.length} lines`
                    : `${BUILD_SCRIPT.length} lines · completed in 34s`}
                </Text>
              </HStack>
              {buildEntries.length === 0 ? (
                <EmptyState
                  title="Waiting for build output…"
                  description="The build container is starting. The first log lines land here in a moment."
                />
              ) : (
                <LogStream
                  entries={buildEntries}
                  variant="terminal"
                  maxHeight={420}
                  isFollowing={isFollowing}
                  onFollowChange={setIsFollowing}
                  label="Build logs"
                />
              )}
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
