// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useState, type CSSProperties, type DragEvent} from 'react';

import {Layout, LayoutContent, HStack, VStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';

import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronDoubleLeftIcon,
  StarIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  InboxIcon,
  InformationCircleIcon,
  BellAlertIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

// ============= TYPES =============

type ColumnId = 'queue' | 'agent' | 'needs-you' | 'resolved';
type Priority = 'high' | 'medium' | 'low';
type ItemKind = 'task' | 'alert';

interface WorkItem {
  id: string;
  column: ColumnId;
  kind: ItemKind;
  ref: string;
  priority: Priority;
  title: string;
  description: string;
  score: number;
  /** "Needs you" cards show elapsed-work + status; resolved cards show a handled-in stamp. */
  status?: string;
  worked?: string;
  handledIn?: string;
  /** Optional nested review action (e.g. a diff awaiting review). */
  review?: string;
}

interface ColumnMeta {
  id: ColumnId;
  title: string;
  variant: 'neutral' | 'accent' | 'warning' | 'success';
  tooltip: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: typeof InboxIcon;
  /** Only the first column offers an inline add affordance in its empty state. */
  emptyHasAdd?: boolean;
}

interface FeedItem {
  id: string;
  kind: ItemKind;
  ref: string;
  priority: Priority;
  title: string;
  score: number;
  age: string;
}

// ============= DATA =============

const COLUMNS: ColumnMeta[] = [
  {
    id: 'queue',
    title: 'Queue',
    variant: 'neutral',
    tooltip: 'Items waiting to be picked up.',
    emptyTitle: 'Nothing queued yet',
    emptyDescription:
      'Auto-triage adds and investigates new items as they arrive. Or drag a feed item here to queue one.',
    emptyIcon: InboxIcon,
    emptyHasAdd: true,
  },
  {
    id: 'agent',
    title: 'Agent handling',
    variant: 'accent',
    tooltip: 'Items an agent is actively working.',
    emptyTitle: 'Nothing in progress',
    emptyDescription: 'Items the agent picks up appear here.',
    emptyIcon: ArrowPathIcon,
  },
  {
    id: 'needs-you',
    title: 'Needs you',
    variant: 'warning',
    tooltip: 'Items waiting on your input or review.',
    emptyTitle: 'All caught up',
    emptyDescription: 'Nothing needs your input.',
    emptyIcon: CheckCircleIcon,
  },
  {
    id: 'resolved',
    title: 'Resolved',
    variant: 'success',
    tooltip: 'Items that have been handled.',
    emptyTitle: 'Nothing resolved yet',
    emptyDescription: 'Resolved items appear here.',
    emptyIcon: CheckCircleIcon,
  },
];

const PRIORITY_META: Record<
  Priority,
  {label: string; variant: 'error' | 'warning' | 'neutral'}
> = {
  high: {label: 'High', variant: 'error'},
  medium: {label: 'Medium', variant: 'warning'},
  low: {label: 'Low', variant: 'neutral'},
};

const INITIAL_ITEMS: WorkItem[] = [
  {
    id: 'w1',
    column: 'needs-you',
    kind: 'task',
    ref: 'Task 4821',
    priority: 'low',
    title: 'Ownership metadata missing on shared config module',
    description:
      'A shared config module is missing its ownership attribute; a proposed change adds it and awaits reviewer acceptance.',
    score: 45,
    worked: '15m 59s worked',
    status: 'escalated to chat',
    review: 'Change 5104 · Needs Review',
  },
  {
    id: 'w2',
    column: 'needs-you',
    kind: 'task',
    ref: 'Task 4825',
    priority: 'low',
    title: 'Unowned asset flagged by nightly lint',
    description:
      'A utility file lacks an ownership attribute, tripping the privacy lint; a proposed change adds it and awaits acceptance.',
    score: 45,
    worked: '16m 41s worked',
    status: 'escalated to chat',
    review: 'Change 5186 · Needs Review',
  },
  {
    id: 'w3',
    column: 'needs-you',
    kind: 'task',
    ref: 'Task 4833',
    priority: 'medium',
    title: 'Reasoning engine module missing owner class',
    description:
      'The reasoning engine module is missing an owner class attribute; a change has been published and is awaiting accept-and-ship.',
    score: 45,
    worked: '20m 2s worked',
    status: 'escalated to chat',
    review: 'Change 5355 · Needs Review',
  },
  {
    id: 'r1',
    column: 'resolved',
    kind: 'alert',
    ref: 'Alert',
    priority: 'low',
    title: 'Dependency Health Detector — static threshold',
    description:
      'Dependency health detector triggered on a static threshold during normal business hours with no actual dependency issue; self-resolved overnight.',
    score: 0,
    handledIn: 'Handled in 1m 16s',
  },
  {
    id: 'r2',
    column: 'resolved',
    kind: 'alert',
    ref: 'Alert',
    priority: 'high',
    title: 'Exception Detector — static threshold',
    description:
      'An exception spike in a production job crossed the static threshold from expected self-cancellations and self-cleared; resolved as benign.',
    score: 0,
    handledIn: 'Handled in 14m 8s',
  },
  {
    id: 'r3',
    column: 'resolved',
    kind: 'task',
    ref: 'Task 4790',
    priority: 'medium',
    title: 'Owner review needed for restored formatting change',
    description:
      'A change restored formatting in a fetcher module and landed with owner approval, requiring no further action.',
    score: 0,
    handledIn: 'Handled in 15m 57s',
  },
];

const FEED_CURRENT: FeedItem[] = [];

const FEED_PRIOR: FeedItem[] = [
  {
    id: 'f1',
    kind: 'task',
    ref: 'Task 4590',
    priority: 'medium',
    title: 'Owner review needed for serialization change',
    score: 45,
    age: '2d ago',
  },
  {
    id: 'f2',
    kind: 'task',
    ref: 'Task 4291',
    priority: 'medium',
    title: 'Rotation schedule has a gap with no active members',
    score: 45,
    age: '6d ago',
  },
  {
    id: 'f3',
    kind: 'task',
    ref: 'Task 4035',
    priority: 'low',
    title: 'Unowned asset detected in shared directory',
    score: 40,
    age: '8d ago',
  },
  {
    id: 'f4',
    kind: 'alert',
    ref: 'Alert',
    priority: 'high',
    title: 'Dead detector: SLI signal for chat notifications',
    score: 62,
    age: '8d ago',
  },
  {
    id: 'f5',
    kind: 'task',
    ref: 'Task 3835',
    priority: 'medium',
    title: 'Scheduled test of root-cause notification path',
    score: 45,
    age: '8d ago',
  },
];

// ============= LAYOUT STYLES =============
// Inline styles cover only layout concerns the primitives delegate to CSS
// (overflow, flex sizing, fixed rail width) — never color or spacing tokens.

const page: CSSProperties = {height: '100dvh'};
const feedRail: CSSProperties = {
  flexShrink: 0,
  flexBasis: 300,
  height: '100%',
  overflowY: 'auto',
  padding: 'var(--spacing-4)',
  borderInlineEnd: '1px solid var(--color-border, rgba(5,54,89,0.1))',
};
const boardScroll: CSSProperties = {
  overflowX: 'auto',
  overflowY: 'hidden',
  flexGrow: 1,
};
const columnShell: CSSProperties = {
  flexShrink: 0,
  flexBasis: 300,
  height: '100%',
};
const columnList: CSSProperties = {
  overflowY: 'auto',
  flexGrow: 1,
  paddingBlockEnd: 8,
};
const grab: CSSProperties = {cursor: 'grab'};

// ============= FEED RAIL =============

function KindIcon({kind}: {kind: ItemKind}) {
  return (
    <Icon
      icon={kind === 'alert' ? BellAlertIcon : CheckCircleIcon}
      size="xsm"
      color={kind === 'alert' ? 'error' : 'secondary'}
    />
  );
}

function FeedCard({item}: {item: FeedItem}) {
  const priority = PRIORITY_META[item.priority];
  return (
    <div draggable style={grab}>
      <Card padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <KindIcon kind={item.kind} />
            <Text type="supporting" color="secondary">
              {item.ref}
            </Text>
            <Badge label={priority.label} variant={priority.variant} />
          </HStack>
          <Text weight="medium">{item.title}</Text>
          <HStack hAlign="between" vAlign="center">
            <HStack gap={1} vAlign="center">
              <Icon icon={StarIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {item.score}
              </Text>
            </HStack>
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary">
                {item.age}
              </Text>
              <IconButton
                icon={<Icon icon={ArrowRightIcon} size="xsm" />}
                label="Promote to board"
                variant="ghost"
                size="sm"
              />
            </HStack>
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}

function FeedSection({
  title,
  count,
  description,
  items,
  defaultIsOpen,
}: {
  title: string;
  count: number;
  description: string;
  items: FeedItem[];
  defaultIsOpen?: boolean;
}) {
  return (
    <Collapsible
      defaultIsOpen={defaultIsOpen}
      trigger={
        <HStack gap={2} vAlign="center">
          <Heading level={4}>{title}</Heading>
          <Badge label={count} variant="neutral" />
        </HStack>
      }>
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          {description}
        </Text>
        {items.map(item => (
          <FeedCard key={item.id} item={item} />
        ))}
      </VStack>
    </Collapsible>
  );
}

function FeedRail() {
  return (
    <VStack gap={4} style={feedRail}>
      <HStack hAlign="between" vAlign="center">
        <HStack gap={2} vAlign="center">
          <Heading level={3}>Feed</Heading>
          <Badge
            label={FEED_CURRENT.length + FEED_PRIOR.length}
            variant="neutral"
          />
        </HStack>
        <HStack gap={0} vAlign="center">
          <IconButton
            icon={<Icon icon={ArrowsUpDownIcon} size="xsm" />}
            label="Sort feed"
            variant="ghost"
            size="sm"
          />
          <IconButton
            icon={<Icon icon={FunnelIcon} size="xsm" />}
            label="Filter feed"
            variant="ghost"
            size="sm"
          />
          <IconButton
            icon={<Icon icon={ChevronDoubleLeftIcon} size="xsm" />}
            label="Collapse feed"
            variant="ghost"
            size="sm"
          />
          <IconButton
            icon={<Icon icon={ArrowPathIcon} size="xsm" />}
            label="Refresh feed"
            variant="ghost"
            size="sm"
          />
        </HStack>
      </HStack>

      <FeedSection
        title="Current shift"
        count={FEED_CURRENT.length}
        description="No new items this shift yet — they'll appear here as they arrive. See prior shifts below."
        items={FEED_CURRENT}
        defaultIsOpen
      />
      <FeedSection
        title="Prior shifts"
        count={FEED_PRIOR.length}
        description="From before this shift; launch manually if needed."
        items={FEED_PRIOR}
        defaultIsOpen
      />
    </VStack>
  );
}

// ============= WORK ITEM CARD =============

function WorkItemCard({
  item,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  item: WorkItem;
  onMove: (id: string, to: ColumnId) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  const priority = PRIORITY_META[item.priority];
  const moveTargets = COLUMNS.filter(c => c.id !== item.column).map(c => ({
    label: `Move to ${c.title}`,
    onClick: () => onMove(item.id, c.id),
  }));

  return (
    <div
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragEnd={onDragEnd}
      style={grab}>
      <Card padding={3}>
        <VStack gap={2}>
          <HStack hAlign="between" vAlign="start">
            <HStack gap={1} vAlign="center" wrap="wrap">
              <HStack gap={1} vAlign="center">
                <KindIcon kind={item.kind} />
                <Text type="supporting" color="secondary">
                  {item.ref}
                </Text>
              </HStack>
              <Badge label={priority.label} variant={priority.variant} />
            </HStack>
            <MoreMenu
              label="Work item actions"
              size="sm"
              items={[
                {label: 'Open', onClick: () => {}},
                {label: 'Assign to me', onClick: () => {}},
                {type: 'divider'},
                ...moveTargets,
              ]}
            />
          </HStack>

          <Text weight="medium">{item.title}</Text>

          <Text type="supporting" color="secondary">
            {item.description}
          </Text>

          {item.handledIn ? (
            <HStack gap={1} vAlign="center">
              <Icon icon={CheckCircleIcon} size="xsm" color="success" />
              <Text type="supporting" color="secondary">
                {item.handledIn}
              </Text>
            </HStack>
          ) : (
            <HStack gap={1} vAlign="center">
              <Icon icon={PauseCircleIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                {item.worked}
                {item.status ? ` · ${item.status}` : ''}
              </Text>
            </HStack>
          )}

          {item.review ? (
            <Button
              label={item.review}
              variant="secondary"
              size="sm"
              icon={<Icon icon={ClipboardDocumentCheckIcon} size="xsm" />}
            />
          ) : null}
        </VStack>
      </Card>
    </div>
  );
}

// ============= BOARD COLUMN =============

function BoardColumn({
  meta,
  items,
  isDropTarget,
  onMove,
  onDragStart,
  onDragEnd,
  onDragEnterColumn,
  onDropColumn,
}: {
  meta: ColumnMeta;
  items: WorkItem[];
  isDropTarget: boolean;
  onMove: (id: string, to: ColumnId) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragEnterColumn: (col: ColumnId) => void;
  onDropColumn: (col: ColumnId) => void;
}) {
  return (
    <VStack gap={3} style={columnShell}>
      <HStack gap={2} vAlign="center">
        <StatusDot variant={meta.variant} label={`${meta.title} status`} />
        <Heading level={4}>{meta.title}</Heading>
        <Icon icon={InformationCircleIcon} size="xsm" color="secondary" />
        <HStack style={{marginInlineStart: 'auto'}}>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {items.length}
          </Text>
        </HStack>
      </HStack>

      <div
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          onDragEnterColumn(meta.id);
        }}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          onDropColumn(meta.id);
        }}
        style={columnList}>
        <Card
          padding={2}
          variant={isDropTarget ? 'muted' : 'gray'}
          minHeight="100%">
          {items.length === 0 ? (
            <EmptyState
              isCompact
              icon={<Icon icon={meta.emptyIcon} size="md" color="secondary" />}
              title={meta.emptyTitle}
              description={meta.emptyDescription}
              actions={
                meta.emptyHasAdd ? (
                  <Button
                    label="Add work item"
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={PlusIcon} size="xsm" />}
                  />
                ) : undefined
              }
            />
          ) : (
            <VStack gap={2}>
              {items.map(item => (
                <WorkItemCard
                  key={item.id}
                  item={item}
                  onMove={onMove}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              ))}
            </VStack>
          )}
        </Card>
      </div>
    </VStack>
  );
}

// ============= MAIN =============

export default function KanbanBoardTemplate() {
  const [items, setItems] = useState<WorkItem[]>(INITIAL_ITEMS);
  const [autoTriage, setAutoTriage] = useState(true);
  const [shift, setShift] = useState('Current shift');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropColumn, setDropColumn] = useState<ColumnId | null>(null);

  const moveItem = (id: string, to: ColumnId) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? {...item, column: to} : item)),
    );
  };

  const handleDropColumn = (col: ColumnId) => {
    if (draggingId) {
      moveItem(draggingId, col);
    }
    setDraggingId(null);
    setDropColumn(null);
  };

  const itemsByColumn = useMemo(() => {
    const map: Record<ColumnId, WorkItem[]> = {
      queue: [],
      agent: [],
      'needs-you': [],
      resolved: [],
    };
    for (const item of items) {
      map[item.column].push(item);
    }
    return map;
  }, [items]);

  return (
    <div style={page}>
      <Layout
        height="fill"
        start={<FeedRail />}
        header={
          <HStack hAlign="between" vAlign="center">
            <HStack gap={3} vAlign="center">
              <HStack gap={2} vAlign="center">
                <Heading level={3}>Board</Heading>
                <Badge label={items.length} variant="neutral" />
              </HStack>
              <Switch
                label="Auto triage"
                value={autoTriage}
                onChange={(checked: boolean) => setAutoTriage(checked)}
              />
              <Button
                label="Add work item"
                variant="secondary"
                size="sm"
                icon={<Icon icon={PlusIcon} size="xsm" />}
              />
            </HStack>
            <HStack gap={2} vAlign="center">
              <DropdownMenu
                button={{label: shift, variant: 'secondary', size: 'sm'}}
                hasChevron
                items={[
                  {
                    label: 'Current shift',
                    onClick: () => setShift('Current shift'),
                  },
                  {
                    label: 'Previous shift',
                    onClick: () => setShift('Previous shift'),
                  },
                  {label: 'All shifts', onClick: () => setShift('All shifts')},
                ]}
              />
              <IconButton
                icon={<Icon icon={MagnifyingGlassIcon} size="xsm" />}
                label="Search board"
                variant="ghost"
                size="sm"
              />
              <IconButton
                icon={<Icon icon={ArrowsUpDownIcon} size="xsm" />}
                label="Sort board"
                variant="ghost"
                size="sm"
              />
              <IconButton
                icon={<Icon icon={FunnelIcon} size="xsm" />}
                label="Filter board"
                variant="ghost"
                size="sm"
              />
            </HStack>
          </HStack>
        }
        content={
          <LayoutContent padding={4}>
            <HStack gap={4} style={boardScroll}>
              {COLUMNS.map(meta => (
                <BoardColumn
                  key={meta.id}
                  meta={meta}
                  items={itemsByColumn[meta.id]}
                  isDropTarget={dropColumn === meta.id}
                  onMove={moveItem}
                  onDragStart={setDraggingId}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDropColumn(null);
                  }}
                  onDragEnterColumn={setDropColumn}
                  onDropColumn={handleDropColumn}
                />
              ))}
            </HStack>
          </LayoutContent>
        }
      />
    </div>
  );
}
