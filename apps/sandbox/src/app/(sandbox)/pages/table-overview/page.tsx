// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useMemo} from 'react';

import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Card} from '@astryxdesign/core/Card';
import {
  Table,
  useTableSelection,
  proportional,
  pixel,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import type {BadgeVariant} from '@astryxdesign/core/Badge';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import * as stylex from '@stylexjs/stylex';

// =============================================================================
// Types
// =============================================================================

interface ReviewRow extends Record<string, unknown> {
  id: string;
  title: string;
  prId: string;
  lines: number;
  reviewTime: string;
  authorName: string;
  authorAvatar: string;
  reviewerAvatars: string[];
  testStatus: 'passed' | 'failed';
  created: string;
  status: 'Needs review' | 'Waiting on author' | 'Changes planned' | 'Accepted';
}

// =============================================================================
// Mock Data
// =============================================================================

const waitingForAWhile: ReviewRow[] = [
  {
    id: '1',
    title: '[astryx][FilterTokenList]: Promote out of beta',
    prId: 'PR-1042',
    lines: 3,
    reviewTime: '<20sec review',
    authorName: 'Alice Chen',
    authorAvatar: 'https://i.pravatar.cc/36?img=1',
    reviewerAvatars: [
      'https://i.pravatar.cc/36?img=5',
      'https://i.pravatar.cc/36?img=6',
    ],
    testStatus: 'passed',
    created: 'Feb 24, 2025',
    status: 'Waiting on author',
  },
  {
    id: '2',
    title: '[astryx][Table] Fix column resize regression on Safari',
    prId: 'PR-1038',
    lines: 47,
    reviewTime: '~3min review',
    authorName: 'Bob Martinez',
    authorAvatar: 'https://i.pravatar.cc/36?img=2',
    reviewerAvatars: ['https://i.pravatar.cc/36?img=7'],
    testStatus: 'failed',
    created: 'Feb 23, 2025',
    status: 'Changes planned',
  },
];

const needsCodeReview: ReviewRow[] = [
  {
    id: '3',
    title: '[astryx][Avatar] Add AvatarStatusDot size scaling',
    prId: 'PR-1055',
    lines: 128,
    reviewTime: '~8min review',
    authorName: 'Carol Wu',
    authorAvatar: 'https://i.pravatar.cc/36?img=3',
    reviewerAvatars: [
      'https://i.pravatar.cc/36?img=8',
      'https://i.pravatar.cc/36?img=9',
      'https://i.pravatar.cc/36?img=10',
    ],
    testStatus: 'passed',
    created: '19 hours ago',
    status: 'Needs review',
  },
  {
    id: '4',
    title: '[astryx][Badge] Introduce error variant with icon slot',
    prId: 'PR-1061',
    lines: 52,
    reviewTime: '~2min review',
    authorName: 'Dan Kim',
    authorAvatar: 'https://i.pravatar.cc/36?img=4',
    reviewerAvatars: ['https://i.pravatar.cc/36?img=11'],
    testStatus: 'passed',
    created: '14 hours ago',
    status: 'Needs review',
  },
  {
    id: '5',
    title: '[astryx][Collapsible] Animate height transitions with CSS',
    prId: 'PR-1063',
    lines: 210,
    reviewTime: '~12min review',
    authorName: 'Eve Patel',
    authorAvatar: 'https://i.pravatar.cc/36?img=12',
    reviewerAvatars: [
      'https://i.pravatar.cc/36?img=5',
      'https://i.pravatar.cc/36?img=13',
    ],
    testStatus: 'passed',
    created: '8 hours ago',
    status: 'Needs review',
  },
  {
    id: '6',
    title: '[astryx][TextInput] Add clearable prop with trailing icon',
    prId: 'PR-1067',
    lines: 34,
    reviewTime: '<1min review',
    authorName: 'Frank Lee',
    authorAvatar: 'https://i.pravatar.cc/36?img=14',
    reviewerAvatars: ['https://i.pravatar.cc/36?img=6'],
    testStatus: 'failed',
    created: '5 hours ago',
    status: 'Needs review',
  },
  {
    id: '7',
    title: '[astryx][Layout] Support sticky header in LayoutHeader',
    prId: 'PR-1070',
    lines: 89,
    reviewTime: '~5min review',
    authorName: 'Grace Tan',
    authorAvatar: 'https://i.pravatar.cc/36?img=15',
    reviewerAvatars: [
      'https://i.pravatar.cc/36?img=7',
      'https://i.pravatar.cc/36?img=8',
    ],
    testStatus: 'passed',
    created: '2 hours ago',
    status: 'Needs review',
  },
];

const acceptedAndReady: ReviewRow[] = [
  {
    id: '8',
    title: '[astryx][StatusDot] Add isPulsing animation support',
    prId: 'PR-1048',
    lines: 22,
    reviewTime: '<30sec review',
    authorName: 'Hank Zhou',
    authorAvatar: 'https://i.pravatar.cc/36?img=9',
    reviewerAvatars: [
      'https://i.pravatar.cc/36?img=1',
      'https://i.pravatar.cc/36?img=2',
    ],
    testStatus: 'passed',
    created: 'Feb 25, 2025',
    status: 'Accepted',
  },
  {
    id: '9',
    title: '[astryx][Card] Add isFullBleed prop for edge-to-edge content',
    prId: 'PR-1051',
    lines: 15,
    reviewTime: '<20sec review',
    authorName: 'Iris Nakamura',
    authorAvatar: 'https://i.pravatar.cc/36?img=10',
    reviewerAvatars: ['https://i.pravatar.cc/36?img=3'],
    testStatus: 'passed',
    created: 'Feb 26, 2025',
    status: 'Accepted',
  },
];

// =============================================================================
// Helpers
// =============================================================================

const STATUS_VARIANT_MAP: Record<ReviewRow['status'], BadgeVariant> = {
  'Needs review': 'info',
  'Waiting on author': 'warning',
  'Changes planned': 'warning',
  Accepted: 'success',
};

// =============================================================================
// Stat Card
// =============================================================================

function StatCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string | number;
  emoji?: string;
}) {
  return (
    <Card>
      <div {...stylex.props(styles.statCard)}>
        <Text type="supporting" color="secondary">
          {emoji ? `${emoji} ` : ''}
          {label}
        </Text>
        <Text type="large" weight="bold">
          {String(value)}
        </Text>
      </div>
    </Card>
  );
}

// =============================================================================
// Columns (defined outside component for stable identity)
// =============================================================================

const columns: TableColumn<ReviewRow>[] = [
  {
    key: 'author',
    header: 'Author',
    width: proportional(4),
    renderCell: (item: ReviewRow) => (
      <HStack gap={3} vAlign="center">
        <Avatar
          src={item.authorAvatar}
          name={item.authorName}
          size="small"
        />
        <div {...stylex.props(styles.authorInfo)}>
          <VStack gap={1}>
            <span {...stylex.props(styles.titleLink)}>{item.title}</span>
            <span {...stylex.props(styles.supportingLine)}>
              <Text type="supporting" color="secondary">
                {item.prId} · {item.lines} lines {item.reviewTime}
              </Text>
            </span>
          </VStack>
        </div>
      </HStack>
    ),
  },
  {
    key: 'reviewers',
    header: 'Reviewers',
    width: pixel(120),
    renderCell: (item: ReviewRow) => (
      <div {...stylex.props(styles.avatarGroup)}>
        {item.reviewerAvatars.map((src: string, i: number) => (
          <div
            key={i}
            {...stylex.props(styles.avatarOverlap)}
            style={{
              marginLeft: i > 0 ? -8 : 0,
              zIndex: item.reviewerAvatars.length - i,
            }}>
            <Avatar src={src} name={`Reviewer ${i + 1}`} size="xsmall" />
          </div>
        ))}
      </div>
    ),
  },
  {
    key: 'testing',
    header: 'Testing',
    width: pixel(110),
    renderCell: (item: ReviewRow) => (
      <HStack gap={2} vAlign="center">
        <StatusDot
          variant={item.testStatus === 'passed' ? 'success' : 'error'}
          label={item.testStatus === 'passed' ? 'Passed' : 'Failed'}
        />
        <Text type="supporting">
          {item.testStatus === 'passed' ? 'Passed' : 'Failed'}
        </Text>
      </HStack>
    ),
  },
  {
    key: 'created',
    header: 'Created',
    width: pixel(130),
    renderCell: (item: ReviewRow) => (
      <Text type="supporting" color="secondary">
        {item.created}
      </Text>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(160),
    renderCell: (item: ReviewRow) => (
      <Badge variant={STATUS_VARIANT_MAP[item.status]} label={item.status} />
    ),
  },
];

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  container: {
    maxWidth: 1100,
    width: '100%',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '12px 16px',
    minWidth: 120,
  },
  statsRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  titleLink: {
    color: '#1a73e8',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  authorInfo: {
    overflow: 'hidden',
    minWidth: 0,
  },
  supportingLine: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  avatarGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  avatarOverlap: {
    position: 'relative',
    display: 'inline-flex',
  },
});

// =============================================================================
// Section Table (table within a collapsible)
// =============================================================================

function SectionTable({
  data,
  selectedKeys,
  setSelectedKeys,
}: {
  data: ReviewRow[];
  selectedKeys: Set<string>;
  setSelectedKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const selectionPlugin = useTableSelection<ReviewRow>({
    getIsItemSelected: (item: ReviewRow) => selectedKeys.has(item.id),
    onSelectItem: ({
      item,
      isSelected,
    }: {
      item: ReviewRow;
      isSelected: boolean;
    }) => {
      setSelectedKeys(prev => {
        const next = new Set(prev);
        if (isSelected) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
        return next;
      });
    },
    onSelectAll: ({isAllSelected}: {isAllSelected: boolean}) => {
      setSelectedKeys(prev => {
        const next = new Set(prev);
        if (isAllSelected) {
          data.forEach(row => next.add(row.id));
        } else {
          data.forEach(row => next.delete(row.id));
        }
        return next;
      });
    },
    getIsAllSelected: () => data.every(row => selectedKeys.has(row.id)),
    getIsIndeterminate: () => {
      const count = data.filter(row => selectedKeys.has(row.id)).length;
      return count > 0 && count < data.length;
    },
  });

  const plugins = useMemo(
    () => ({selection: selectionPlugin}),
    [selectionPlugin],
  );

  return (
    <Table<ReviewRow>
      data={data}
      columns={columns}
      idKey="id"
      density="balanced"
      dividers="rows"
      hasHover
      plugins={plugins}
    />
  );
}

// =============================================================================
// Page
// =============================================================================

export default function TableOverviewPage() {
  const [search, setSearch] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const filterRows = (rows: ReviewRow[]) => {
    if (!search.trim()) {
      return rows;
    }
    const q = search.toLowerCase();
    return rows.filter(
      row =>
        row.title.toLowerCase().includes(q) ||
        row.authorName.toLowerCase().includes(q) ||
        row.prId.toLowerCase().includes(q),
    );
  };

  const filteredWaiting = filterRows(waitingForAWhile);
  const filteredNeeds = filterRows(needsCodeReview);
  const filteredAccepted = filterRows(acceptedAndReady);

  return (
    <div {...stylex.props(styles.container)}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1}>Table Overview</Heading>
          <Text type="body" color="secondary">
            A code review dashboard demonstrating Table with selection,
            badges, avatars, and collapsible sections.
          </Text>
        </VStack>

        {/* Search */}
        <TextInput
          label="Search"
          isLabelHidden
          placeholder="Search..."
          value={search}
          onChange={setSearch}
        />

        {/* Stats Row */}
        <div {...stylex.props(styles.statsRow)}>
          <StatCard emoji="🔥" label="Review streak" value="4 days" />
          <StatCard label="Reviews today" value={6} />
          <StatCard label="Diff reviews" value={28} />
          <StatCard label="Post-land reviews" value={3} />
          <StatCard label="Mobile reviews" value={2} />
        </div>

        {/* Grouped Tables */}
        <VStack gap={4}>
          {filteredWaiting.length > 0 && (
            <Collapsible
              trigger={
                <Text type="body" weight="bold">
                  Waiting for a while ({filteredWaiting.length})
                </Text>
              }>
              <SectionTable
                data={filteredWaiting}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
              />
            </Collapsible>
          )}

          {filteredNeeds.length > 0 && (
            <Collapsible
              trigger={
                <Text type="body" weight="bold">
                  Needs code review ({filteredNeeds.length})
                </Text>
              }>
              <SectionTable
                data={filteredNeeds}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
              />
            </Collapsible>
          )}

          {filteredAccepted.length > 0 && (
            <Collapsible
              trigger={
                <Text type="body" weight="bold">
                  Accepted and ready to land ({filteredAccepted.length})
                </Text>
              }>
              <SectionTable
                data={filteredAccepted}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
              />
            </Collapsible>
          )}
        </VStack>
      </VStack>
    </div>
  );
}
