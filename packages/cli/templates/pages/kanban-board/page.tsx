// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useState, type CSSProperties, type DragEvent} from 'react';

import {Layout, LayoutContent, HStack, VStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

import {
  PlusIcon,
  StarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// ============= TYPES =============

type ColumnId = 'backlog' | 'in-progress' | 'in-review' | 'done';
type Priority = 'urgent' | 'high' | 'medium' | 'low';

interface Assignee {
  name: string;
  src?: string;
}

interface WorkItem {
  id: string;
  ref: string;
  title: string;
  priority: Priority;
  points: number;
  updated: string;
  tag: {label: string; variant: 'blue' | 'purple' | 'teal' | 'cyan' | 'pink'};
  assignee: Assignee;
  column: ColumnId;
}

interface ColumnMeta {
  id: ColumnId;
  title: string;
  status: 'neutral' | 'accent' | 'warning' | 'success';
  emptyLabel: string;
}

// ============= DATA =============

const COLUMNS: ColumnMeta[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    status: 'neutral',
    emptyLabel: 'Nothing queued yet',
  },
  {
    id: 'in-progress',
    title: 'In progress',
    status: 'accent',
    emptyLabel: 'Nothing in progress',
  },
  {
    id: 'in-review',
    title: 'In review',
    status: 'warning',
    emptyLabel: 'Nothing waiting on review',
  },
  {
    id: 'done',
    title: 'Done',
    status: 'success',
    emptyLabel: 'Nothing shipped yet',
  },
];

const PRIORITY_META: Record<
  Priority,
  {label: string; variant: 'error' | 'warning' | 'neutral' | 'info'}
> = {
  urgent: {label: 'Urgent', variant: 'error'},
  high: {label: 'High', variant: 'warning'},
  medium: {label: 'Medium', variant: 'info'},
  low: {label: 'Low', variant: 'neutral'},
};

// The signed-in user, used by the "Assigned to me" filter.
const CURRENT_USER = 'Sofia Reyes';

type Scope = 'all' | 'mine' | 'urgent';

const INITIAL_ITEMS: WorkItem[] = [
  {
    id: '1',
    ref: 'PLAT-482',
    title: 'Audit color tokens for AA contrast in dark theme',
    priority: 'high',
    points: 5,
    updated: '2h ago',
    tag: {label: 'Design', variant: 'purple'},
    assignee: {name: 'Ravi Anand'},
    column: 'backlog',
  },
  {
    id: '2',
    ref: 'PLAT-476',
    title: 'Document the new DataGrid density prop',
    priority: 'low',
    points: 2,
    updated: '5h ago',
    tag: {label: 'Docs', variant: 'teal'},
    assignee: {name: 'Mei Lin'},
    column: 'backlog',
  },
  {
    id: '3',
    ref: 'PLAT-491',
    title: 'Investigate flaky Toast animation test',
    priority: 'medium',
    points: 3,
    updated: '1d ago',
    tag: {label: 'Bug', variant: 'pink'},
    assignee: {name: 'Jordan Cole'},
    column: 'backlog',
  },
  {
    id: '4',
    ref: 'PLAT-470',
    title: 'Add keyboard navigation to Menu component',
    priority: 'urgent',
    points: 8,
    updated: '18m ago',
    tag: {label: 'A11y', variant: 'blue'},
    assignee: {name: 'Sofia Reyes'},
    column: 'in-progress',
  },
  {
    id: '5',
    ref: 'PLAT-465',
    title: 'Migrate Button styles off deprecated spacing scale',
    priority: 'medium',
    points: 5,
    updated: '3h ago',
    tag: {label: 'Refactor', variant: 'cyan'},
    assignee: {name: 'Ravi Anand'},
    column: 'in-progress',
  },
  {
    id: '6',
    ref: 'PLAT-458',
    title: 'Ship responsive Grid template',
    priority: 'high',
    points: 5,
    updated: '6h ago',
    tag: {label: 'Feature', variant: 'blue'},
    assignee: {name: 'Mei Lin'},
    column: 'in-review',
  },
  {
    id: '7',
    ref: 'PLAT-451',
    title: 'Fix Tooltip clipping inside scroll containers',
    priority: 'medium',
    points: 3,
    updated: '1d ago',
    tag: {label: 'Bug', variant: 'pink'},
    assignee: {name: 'Jordan Cole'},
    column: 'in-review',
  },
  {
    id: '8',
    ref: 'PLAT-442',
    title: 'Publish v2 icon set to the package registry',
    priority: 'low',
    points: 2,
    updated: '2d ago',
    tag: {label: 'Release', variant: 'teal'},
    assignee: {name: 'Sofia Reyes'},
    column: 'done',
  },
  {
    id: '9',
    ref: 'PLAT-437',
    title: 'Add tabular-numbers support to Text',
    priority: 'low',
    points: 1,
    updated: '3d ago',
    tag: {label: 'Feature', variant: 'blue'},
    assignee: {name: 'Ravi Anand'},
    column: 'done',
  },
];

// ============= LAYOUT STYLES =============
// Inline styles are used only for layout concerns (overflow, flex sizing) that
// the layout primitives delegate to CSS — never for color or spacing tokens.

const page: CSSProperties = {height: '100dvh'};
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

// ============= CARD =============

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
          <HStack hAlign="between" vAlign="center">
            <Text type="supporting" color="secondary">
              {item.ref}
            </Text>
            <HStack gap={1} vAlign="center">
              <Badge label={priority.label} variant={priority.variant} />
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
          </HStack>

          <Text weight="medium">{item.title}</Text>

          <HStack hAlign="between" vAlign="center">
            <Badge label={item.tag.label} variant={item.tag.variant} />
            <HStack gap={3} vAlign="center">
              <HStack gap={1} vAlign="center">
                <Icon icon={StarIcon} size="xsm" color="secondary" />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {item.points}
                </Text>
              </HStack>
              <HStack gap={1} vAlign="center">
                <Icon icon={ClockIcon} size="xsm" color="secondary" />
                <Text type="supporting" color="secondary">
                  {item.updated}
                </Text>
              </HStack>
              <Avatar
                name={item.assignee.name}
                src={item.assignee.src}
                size="xsmall"
              />
            </HStack>
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}

// ============= COLUMN =============

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
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    onDragEnterColumn(meta.id);
  };

  return (
    <VStack gap={3} style={columnShell}>
      <HStack hAlign="between" vAlign="center">
        <HStack gap={2} vAlign="center">
          <StatusDot variant={meta.status} label={`${meta.title} status`} />
          <Heading level={4}>{meta.title}</Heading>
          <Badge label={items.length} variant="neutral" />
        </HStack>
      </HStack>

      <div
        onDragOver={handleDragOver}
        onDrop={e => {
          e.preventDefault();
          onDropColumn(meta.id);
        }}
        style={columnList}>
        <Card
          padding={2}
          variant={isDropTarget ? 'muted' : 'default'}
          minHeight="100%">
          {items.length === 0 ? (
            <VStack gap={0} hAlign="center" style={{paddingBlock: 32}}>
              <Text type="supporting" color="secondary">
                {meta.emptyLabel}
              </Text>
            </VStack>
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
  const [scope, setScope] = useState<Scope>('all');
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

  // Derive the visible set from the active filter — no secondary state needed.
  const visibleItems = useMemo(() => {
    switch (scope) {
      case 'mine':
        return items.filter(item => item.assignee.name === CURRENT_USER);
      case 'urgent':
        return items.filter(item => item.priority === 'urgent');
      default:
        return items;
    }
  }, [items, scope]);

  const itemsByColumn = useMemo(() => {
    const map: Record<ColumnId, WorkItem[]> = {
      backlog: [],
      'in-progress': [],
      'in-review': [],
      done: [],
    };
    for (const item of visibleItems) {
      map[item.column].push(item);
    }
    return map;
  }, [visibleItems]);

  return (
    <div style={page}>
      <Layout
        height="fill"
        header={
          <VStack gap={4} style={{paddingBlock: 16, paddingInline: 24}}>
            <HStack hAlign="between" vAlign="center">
              <VStack gap={0}>
                <Heading level={1}>Platform Board</Heading>
                <Text type="supporting" color="secondary">
                  {visibleItems.length} of {items.length} work items across{' '}
                  {COLUMNS.length} columns
                </Text>
              </VStack>
              <HStack gap={2} vAlign="center">
                <Button
                  label="Search"
                  variant="secondary"
                  icon={<Icon icon={MagnifyingGlassIcon} size="sm" />}
                />
                <Button
                  label="Add work item"
                  variant="primary"
                  icon={<Icon icon={PlusIcon} size="sm" />}
                />
              </HStack>
            </HStack>
            <SegmentedControl
              value={scope}
              onChange={value => setScope(value as Scope)}
              label="Filter work items">
              <SegmentedControlItem value="all" label="All items" />
              <SegmentedControlItem value="mine" label="Assigned to me" />
              <SegmentedControlItem value="urgent" label="Urgent" />
            </SegmentedControl>
          </VStack>
        }
        content={
          <LayoutContent padding={6}>
            <HStack gap={4} style={boardScroll} height="100%">
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
