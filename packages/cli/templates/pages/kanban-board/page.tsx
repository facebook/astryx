// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useState, type CSSProperties, type DragEvent} from 'react';
import * as stylex from '@stylexjs/stylex';

import {
  Layout,
  LayoutHeader,
  LayoutContent,
  HStack,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Selector} from '@astryxdesign/core/Selector';
import {Section} from '@astryxdesign/core/Section';
import {Divider} from '@astryxdesign/core/Divider';
import {Toolbar} from '@astryxdesign/core/Toolbar';

import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  ArrowPathIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  InboxIcon,
  InformationCircleIcon,
  BellAlertIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

// ============= TYPES =============

type ColumnId = 'backlog' | 'in-progress' | 'in-review' | 'done';
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
  status?: string;
  worked?: string;
  handledIn?: string;
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
  emptyHasAdd?: boolean;
}

// ============= DATA =============

const COLUMNS: ColumnMeta[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    variant: 'neutral',
    tooltip: 'Items waiting to be picked up.',
    emptyTitle: 'Backlog is empty',
    emptyDescription:
      'Auto-triage adds and investigates new items as they arrive.',
    emptyIcon: InboxIcon,
    emptyHasAdd: true,
  },
  {
    id: 'in-progress',
    title: 'In progress',
    variant: 'accent',
    tooltip: 'Items currently in progress.',
    emptyTitle: 'Nothing in progress',
    emptyDescription: 'Items being worked on appear here.',
    emptyIcon: ArrowPathIcon,
  },
  {
    id: 'in-review',
    title: 'In review',
    variant: 'warning',
    tooltip: 'Items waiting for your review.',
    emptyTitle: 'Nothing in review',
    emptyDescription: 'Items awaiting your review appear here.',
    emptyIcon: ClipboardDocumentCheckIcon,
  },
  {
    id: 'done',
    title: 'Done',
    variant: 'success',
    tooltip: 'Items that have been handled.',
    emptyTitle: 'Nothing done yet',
    emptyDescription: 'Completed items appear here.',
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
    column: 'in-review',
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
    column: 'in-review',
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
    column: 'in-review',
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
    column: 'done',
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
    column: 'done',
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
    column: 'done',
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

// ============= LAYOUT STYLES =============
// Inline styles cover only layout concerns the primitives delegate to CSS
// (overflow, flex sizing, fixed rail width) — never color or spacing tokens.

const boardScroll: CSSProperties = {
  overflowX: 'auto',
  overflowY: 'hidden',
  height: '100%',
};

const styles = stylex.create({
  verticalDivider: {
    height: 'auto',
    marginBlock: '2px',
    alignSelf: 'stretch',
  },
});
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

function KindIcon({kind}: {kind: ItemKind}) {
  return (
    <Icon
      icon={kind === 'alert' ? BellAlertIcon : CheckCircleIcon}
      size="xsm"
      color={kind === 'alert' ? 'error' : 'secondary'}
    />
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
    <Card variant="muted" padding={0} style={columnShell}>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={3}>
            <HStack justify="between" vAlign="center">
              <HStack gap={2} vAlign="center">
                <StatusDot
                  variant={meta.variant}
                  label={`${meta.title} status`}
                />
                <Heading level={4}>{meta.title}</Heading>
                <Icon
                  icon={InformationCircleIcon}
                  size="xsm"
                  color="secondary"
                />
              </HStack>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {items.length}
              </Text>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={3}>
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
              {items.length === 0 ? (
                <EmptyState
                  isCompact
                  icon={
                    <Icon icon={meta.emptyIcon} size="md" color="secondary" />
                  }
                  title={meta.emptyTitle}
                  description={meta.emptyDescription}
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
            </div>
          </LayoutContent>
        }
      />
    </Card>
  );
}

// ============= MAIN =============

export default function KanbanBoardTemplate() {
  const [items, setItems] = useState<WorkItem[]>(INITIAL_ITEMS);
  const [autoTriage, setAutoTriage] = useState(true);
  const [sprint, setSprint] = useState('003');
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
      backlog: [],
      'in-progress': [],
      'in-review': [],
      done: [],
    };
    for (const item of items) {
      map[item.column].push(item);
    }
    return map;
  }, [items]);

  return (
    <Section variant="section" padding={4} height="100dvh">
      <Card padding={0} variant="muted" height="100%">
        <Layout
          height="fill"
          header={
            <LayoutHeader hasDivider padding={4}>
              <Toolbar
                label="Board actions"
                gap={2}
                startContent={
                  <>
                    <Heading level={3}>Board</Heading>
                    <Badge label={items.length} variant="neutral" />
                  </>
                }
                endContent={
                  <>
                    <Selector
                      label="Sprint"
                      width={200}
                      isLabelHidden
                      value={sprint}
                      onChange={setSprint}
                      options={[
                        {value: '003', label: 'Sprint 003'},
                        {value: '002', label: 'Sprint 002'},
                        {value: '001', label: 'Sprint 001'},
                      ]}
                    />
                    <HStack gap={1} vAlign="center">
                      <IconButton
                        icon={<Icon icon={ArrowsUpDownIcon} size="sm" />}
                        label="Sort"
                      />
                      <IconButton
                        icon={<Icon icon={FunnelIcon} size="sm" />}
                        label="Filter"
                      />
                      <IconButton
                        icon={<Icon icon={MagnifyingGlassIcon} size="sm" />}
                        label="Search"
                      />
                    </HStack>
                    <Divider
                      orientation="vertical"
                      variant="strong"
                      xstyle={styles.verticalDivider}
                    />
                    <Button
                      label="Add task"
                      variant="primary"
                      icon={<Icon icon={PlusIcon} size="sm" />}
                    />
                  </>
                }
              />
            </LayoutHeader>
          }
          content={
            <LayoutContent padding={4}>
              <HStack gap={2} style={boardScroll}>
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
      </Card>
    </Section>
  );
}
