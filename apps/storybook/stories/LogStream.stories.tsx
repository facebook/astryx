// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState, type CSSProperties} from 'react';
import {LogStream, type LogEntry} from '@astryxdesign/lab';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack, VStack, StackItem} from '@astryxdesign/core/Stack';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Text} from '@astryxdesign/core/Text';

const meta: Meta<typeof LogStream> = {
  title: 'Lab/LogStream',
  component: LogStream,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 880, padding: 32}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LogStream>;

const detailStyle: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-family-code)',
  fontSize: 'var(--font-size-sm)',
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap',
};

const buildEntries: LogEntry[] = [
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
    message: 'Cloning github.com/acme/astryx-console (branch: main)',
  },
  {
    id: 'b-03',
    timestamp: '12:04:18.021',
    level: 'info',
    source: 'stage',
    message: 'Install',
  },
  {
    id: 'b-04',
    timestamp: '12:04:18.144',
    level: 'info',
    source: 'install',
    message: '$ pnpm install --frozen-lockfile',
  },
  {
    id: 'b-05',
    timestamp: '12:04:23.348',
    level: 'info',
    source: 'build',
    message: '$ next build',
  },
  {
    id: 'b-06',
    timestamp: '12:04:38.207',
    level: 'warn',
    source: 'build',
    message: 'Compiled with warnings (1)',
    detail: (
      <pre style={detailStyle}>
        {
          './app/logs/page.tsx\n42:9 Warning: "range" is assigned a value but never used.'
        }
      </pre>
    ),
  },
  {
    id: 'b-07',
    timestamp: '12:04:45.201',
    level: 'info',
    source: 'deploy',
    message: 'Uploading build outputs (23.4 MB)',
  },
  {
    id: 'b-08',
    timestamp: '12:04:50.004',
    level: 'info',
    source: 'deploy',
    message: 'Build completed in 34s',
  },
];

const monitoringEntries: LogEntry[] = [
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
    timestamp: '14:02:09.243',
    level: 'warn',
    source: 'billing',
    message: 'upstream latency 1840ms exceeds 1500ms budget',
    detail: (
      <pre style={detailStyle}>
        {
          '{\n  "upstream": "payments.stripe",\n  "latencyMs": 1840,\n  "budgetMs": 1500,\n  "traceId": "tr_9c41b2"\n}'
        }
      </pre>
    ),
  },
  {
    id: 'l-04',
    timestamp: '14:02:10.037',
    level: 'error',
    source: 'billing',
    message: 'charge failed: upstream returned 502',
    detail: (
      <pre style={detailStyle}>
        {
          '{\n  "error": "UpstreamBadGateway",\n  "attempt": 1,\n  "retryInMs": 400,\n  "invoice": "inv_20418"\n}'
        }
      </pre>
    ),
  },
  {
    id: 'l-05',
    timestamp: '14:02:11.305',
    level: 'info',
    source: 'billing',
    message: 'charge succeeded for inv_20418 in 322ms',
  },
  {
    id: 'l-06',
    timestamp: '14:02:13.078',
    level: 'debug',
    source: 'api-gateway',
    message: 'route table reloaded (37 routes)',
  },
];

const liveScript: Omit<LogEntry, 'id'>[] = [
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
    timestamp: '14:02:17.708',
    level: 'warn',
    source: 'billing',
    message: 'webhook delivery slow: 2210ms to partner.acme',
  },
  {
    timestamp: '14:02:20.131',
    level: 'error',
    source: 'worker',
    message: 'job usage-rollup-0415 failed: table locked',
  },
];

export const TerminalBuild: Story = {
  render: () => (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StatusDot variant="success" label="Ready" />
        <Heading level={3}>Build logs</Heading>
      </HStack>
      <LogStream
        entries={buildEntries}
        variant="terminal"
        maxHeight={360}
        label="Build logs"
      />
    </VStack>
  ),
};

export const MonitoringRows: Story = {
  render: () => (
    <Card padding={4}>
      <VStack gap={3}>
        <VStack gap={0}>
          <Heading level={3}>Log results</Heading>
          <Text type="supporting" color="secondary">
            {monitoringEntries.length} events indexed / env:prod / UTC
          </Text>
        </VStack>
        <LogStream
          entries={monitoringEntries}
          maxHeight={360}
          label="Log results stream"
        />
      </VStack>
    </Card>
  ),
};

export const ControlledFollow: Story = {
  render: () => {
    const [entries, setEntries] = useState<LogEntry[]>(monitoringEntries);
    const [isFollowing, setIsFollowing] = useState(true);
    const nextIndex = entries.length - monitoringEntries.length;
    const canAppend = nextIndex < liveScript.length;

    const appendEntry = () => {
      if (!canAppend) {
        return;
      }
      setEntries(current => [
        ...current,
        {...liveScript[nextIndex], id: `live-${nextIndex}`},
      ]);
      setIsFollowing(true);
    };

    return (
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StatusDot
            variant={isFollowing ? 'success' : 'neutral'}
            label={isFollowing ? 'Following latest' : 'Not following'}
            isPulsing={isFollowing}
          />
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              {entries.length} rows
            </Text>
          </StackItem>
          <Button
            label="Append line"
            variant="secondary"
            onClick={appendEntry}
            isDisabled={!canAppend}
          />
          <Button
            label="Reset"
            variant="ghost"
            onClick={() => {
              setEntries(monitoringEntries);
              setIsFollowing(true);
            }}
          />
        </HStack>
        <LogStream
          entries={entries}
          maxHeight={320}
          isFollowing={isFollowing}
          onFollowChange={setIsFollowing}
          label="Live log stream"
        />
      </VStack>
    );
  },
};
