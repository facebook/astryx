// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Kanban Board — product delivery board with frame-first chrome.
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the
 * board title + visible task count, a segmented filter (All / Mine /
 * High priority), a sprint selector, and the "New task" primary action.
 * LayoutContent (padding 0) is a single horizontal scroller of
 * fixed-width columns. Cards are the correct container here — each task
 * is a ClickableCard tile — but the page chrome stays frame-first.
 *
 * Interaction contract (moving cards between columns):
 * - Task→column assignment lives in useState so moves re-render; the
 *   segmented filter and sprint selector operate on the moved state.
 * - Menu path (always available, keyboard + touch accessible): each
 *   card carries a MoreMenu with "Move to <column>" items for the
 *   other three columns. ClickableCard supports independent nested
 *   interactive elements (its accessible trigger is a hidden sibling,
 *   not a wrapping link), so the menu never fights the card's click.
 * - Pointer path: native HTML5 drag-and-drop — cards are draggable,
 *   columns are drop targets with an accent highlight while a drag
 *   hovers them. No dependencies, no pointer-event emulation.
 * - Every move is announced through a visually-hidden aria-live
 *   region ("Moved <task> to <column>").
 *
 * Responsive contract:
 * - >768px: four 300px columns in a horizontal scroller (overflow-x
 *   auto); columns never shrink, the row scrolls.
 * - <=768px: columns are 85vw with scroll-snap (x mandatory) so each
 *   swipe lands on exactly one column.
 * - Each column's card list scrolls vertically and independently; the
 *   column header row stays pinned above its list.
 * - Drag-and-drop is enabled only for fine pointers with hover
 *   ("(hover: hover) and (pointer: fine)") so draggable cards never
 *   interfere with touch scrolling; touch users move cards through
 *   the per-card MoreMenu instead.
 */

import {useCallback, useMemo, useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {Avatar} from '@astryxdesign/core/Avatar';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Token} from '@astryxdesign/core/Token';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  PlusIcon,
  InboxIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

const styles: Record<string, CSSProperties> = {
  board: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-3)',
    height: '100%',
    overflowX: 'auto',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  boardSnap: {
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 'var(--spacing-4)',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    minHeight: 0,
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
  },
  columnSnap: {
    scrollSnapAlign: 'start',
  },
  columnHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-2) var(--spacing-1)',
  },
  columnBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-2) var(--spacing-2)',
  },
  columnEmpty: {
    padding: 'var(--spacing-4) 0',
  },
  columnDropTarget: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: '-2px',
    backgroundColor: 'var(--color-accent-muted)',
  },
  cardDragging: {
    opacity: 0.5,
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

type Priority = 'urgent' | 'high' | 'normal';
type TokenColor = 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'pink';

interface BoardTask {
  id: string;
  title: string;
  summary: string;
  labels: ReadonlyArray<{label: string; color: TokenColor}>;
  priority: Priority;
  assignee: string;
  sprint: string;
  column: string;
}

const CURRENT_USER = 'Priya Raman';

const COLUMNS = [
  {id: 'backlog', title: 'Backlog'},
  {id: 'in-progress', title: 'In progress'},
  {id: 'in-review', title: 'In review'},
  {id: 'done', title: 'Done'},
];

const SPRINT_OPTIONS = [
  {value: 'all', label: 'All sprints'},
  {value: 'sprint-24', label: 'Sprint 24'},
  {value: 'sprint-25', label: 'Sprint 25'},
  {value: 'sprint-26', label: 'Sprint 26'},
];

const PRIORITY_DOT: Record<
  Priority,
  {variant: 'error' | 'warning' | 'neutral'; label: string}
> = {
  urgent: {variant: 'error', label: 'Urgent priority'},
  high: {variant: 'warning', label: 'High priority'},
  normal: {variant: 'neutral', label: 'Normal priority'},
};

const TASKS: BoardTask[] = [
  // Backlog
  {
    id: 'DEL-138',
    title: 'Bulk-edit shipping rules',
    summary: 'Let ops update carrier rules across regions in one pass.',
    labels: [
      {label: 'frontend', color: 'blue'},
      {label: 'ops', color: 'teal'},
    ],
    priority: 'normal',
    assignee: 'Marcus Webb',
    sprint: 'sprint-26',
    column: 'backlog',
  },
  {
    id: 'DEL-142',
    title: 'Rate-limit webhook retries',
    summary: 'Exponential backoff for failed delivery callbacks.',
    labels: [{label: 'api', color: 'purple'}],
    priority: 'high',
    assignee: 'Priya Raman',
    sprint: 'sprint-26',
    column: 'backlog',
  },
  {
    id: 'DEL-147',
    title: 'Driver ETA push notifications',
    summary: 'Notify customers when the driver is two stops away.',
    labels: [
      {label: 'mobile', color: 'green'},
      {label: 'api', color: 'purple'},
    ],
    priority: 'normal',
    assignee: 'Jonah Fields',
    sprint: 'sprint-26',
    column: 'backlog',
  },
  {
    id: 'DEL-149',
    title: 'Consolidate duplicate addresses',
    summary: 'Merge near-identical dropoff points during import.',
    labels: [{label: 'data', color: 'orange'}],
    priority: 'normal',
    assignee: 'Sofia Ortiz',
    sprint: 'sprint-25',
    column: 'backlog',
  },
  {
    id: 'DEL-151',
    title: 'Depot capacity heatmap',
    summary: 'Visualize inbound volume against depot slot capacity.',
    labels: [
      {label: 'frontend', color: 'blue'},
      {label: 'data', color: 'orange'},
    ],
    priority: 'high',
    assignee: 'Priya Raman',
    sprint: 'sprint-26',
    column: 'backlog',
  },
  // In progress
  {
    id: 'DEL-129',
    title: 'Route re-optimization on cancellation',
    summary: 'Re-plan remaining stops when an order is cancelled mid-route.',
    labels: [
      {label: 'api', color: 'purple'},
      {label: 'routing', color: 'pink'},
    ],
    priority: 'urgent',
    assignee: 'Priya Raman',
    sprint: 'sprint-25',
    column: 'in-progress',
  },
  {
    id: 'DEL-133',
    title: 'Proof-of-delivery photo upload',
    summary: 'Drivers attach a photo at dropoff; store and expose via API.',
    labels: [
      {label: 'mobile', color: 'green'},
      {label: 'api', color: 'purple'},
    ],
    priority: 'high',
    assignee: 'Marcus Webb',
    sprint: 'sprint-25',
    column: 'in-progress',
  },
  {
    id: 'DEL-136',
    title: 'Dispatcher live map clustering',
    summary: 'Cluster vehicle markers above 200 concurrent drivers.',
    labels: [{label: 'frontend', color: 'blue'}],
    priority: 'normal',
    assignee: 'Jonah Fields',
    sprint: 'sprint-25',
    column: 'in-progress',
  },
  {
    id: 'DEL-140',
    title: 'Split oversized orders',
    summary: 'Auto-split orders that exceed a single vehicle load.',
    labels: [
      {label: 'routing', color: 'pink'},
      {label: 'data', color: 'orange'},
    ],
    priority: 'urgent',
    assignee: 'Sofia Ortiz',
    sprint: 'sprint-25',
    column: 'in-progress',
  },
  {
    id: 'DEL-144',
    title: 'Customer delivery window picker',
    summary: 'Two-hour windows sourced from live route capacity.',
    labels: [{label: 'frontend', color: 'blue'}],
    priority: 'normal',
    assignee: 'Priya Raman',
    sprint: 'sprint-25',
    column: 'in-progress',
  },
  // In review (intentionally nearly empty)
  {
    id: 'DEL-127',
    title: 'Signature capture fallback',
    summary: 'Typed-name fallback when the signature pad fails.',
    labels: [{label: 'mobile', color: 'green'}],
    priority: 'high',
    assignee: 'Priya Raman',
    sprint: 'sprint-25',
    column: 'in-review',
  },
  {
    id: 'DEL-131',
    title: 'Webhook payload versioning',
    summary: 'Version header plus a v1 compatibility shim.',
    labels: [{label: 'api', color: 'purple'}],
    priority: 'normal',
    assignee: 'Marcus Webb',
    sprint: 'sprint-25',
    column: 'in-review',
  },
  // Done — all normal priority, none assigned to the current user, so the
  // "Mine" and "High priority" filters empty this column (EmptyState).
  {
    id: 'DEL-112',
    title: 'Depot check-in kiosk mode',
    summary: 'Fullscreen arrival flow for warehouse tablets.',
    labels: [{label: 'frontend', color: 'blue'}],
    priority: 'normal',
    assignee: 'Jonah Fields',
    sprint: 'sprint-24',
    column: 'done',
  },
  {
    id: 'DEL-118',
    title: 'CSV order import validation',
    summary: 'Row-level errors with downloadable failure report.',
    labels: [{label: 'data', color: 'orange'}],
    priority: 'normal',
    assignee: 'Sofia Ortiz',
    sprint: 'sprint-24',
    column: 'done',
  },
  {
    id: 'DEL-121',
    title: 'Driver shift handoff notes',
    summary: 'Notes persist across shift changes on shared routes.',
    labels: [{label: 'mobile', color: 'green'}],
    priority: 'normal',
    assignee: 'Marcus Webb',
    sprint: 'sprint-24',
    column: 'done',
  },
  {
    id: 'DEL-124',
    title: 'Route summary email digest',
    summary: 'Nightly digest of completed routes per dispatcher.',
    labels: [
      {label: 'api', color: 'purple'},
      {label: 'ops', color: 'teal'},
    ],
    priority: 'normal',
    assignee: 'Jonah Fields',
    sprint: 'sprint-25',
    column: 'done',
  },
];

function TaskCard({
  task,
  columnId,
  isDraggable,
  isDragging,
  onMove,
  onDraggingChange,
}: {
  task: BoardTask;
  columnId: string;
  isDraggable: boolean;
  isDragging: boolean;
  onMove: (taskId: string, columnId: string) => void;
  onDraggingChange: (taskId: string | null) => void;
}) {
  const dot = PRIORITY_DOT[task.priority];
  const moveTargets = COLUMNS.filter(column => column.id !== columnId);
  return (
    // Draggable wrapper (pointer path). The MoreMenu below is the
    // touch/keyboard path — ClickableCard's accessible trigger is a
    // hidden sibling of the content, so the nested menu button stays a
    // valid, independent interactive element (no button-in-link).
    <div
      draggable={isDraggable || undefined}
      onDragStart={event => {
        event.dataTransfer.setData('text/plain', task.id);
        event.dataTransfer.effectAllowed = 'move';
        onDraggingChange(task.id);
      }}
      onDragEnd={() => onDraggingChange(null)}
      style={isDragging ? styles.cardDragging : undefined}>
      <ClickableCard label={task.title} href="#" width="100%" padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="start">
            <StackItem size="fill">
              <VStack gap={1}>
                <Text type="body" maxLines={2}>
                  {task.title}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {task.summary}
                </Text>
              </VStack>
            </StackItem>
            <MoreMenu
              label={`Move ${task.id}`}
              size="sm"
              items={moveTargets.map(column => ({
                label: `Move to ${column.title}`,
                onClick: () => onMove(task.id, column.id),
              }))}
            />
          </HStack>
          <HStack gap={1}>
            {task.labels.map(({label, color}) => (
              <Token key={label} label={label} color={color} size="sm" />
            ))}
          </HStack>
          <HStack gap={2} vAlign="center">
            <StatusDot variant={dot.variant} label={dot.label} />
            <Avatar name={task.assignee} size="xsmall" />
            <StackItem size="fill" />
            <Text type="supporting" color="secondary">
              {task.id}
            </Text>
          </HStack>
        </VStack>
      </ClickableCard>
    </div>
  );
}

function BoardColumn({
  columnId,
  title,
  tasks,
  width,
  isSnapping,
  isDraggable,
  draggingTaskId,
  onMove,
  onDraggingChange,
}: {
  columnId: string;
  title: string;
  tasks: BoardTask[];
  width: string | number;
  isSnapping: boolean;
  isDraggable: boolean;
  draggingTaskId: string | null;
  onMove: (taskId: string, columnId: string) => void;
  onDraggingChange: (taskId: string | null) => void;
}) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  return (
    <div
      onDragOver={event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setIsDropTarget(true);
      }}
      onDragLeave={event => {
        // Ignore leave events fired when the drag moves over children.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDropTarget(false);
        }
      }}
      onDrop={event => {
        event.preventDefault();
        setIsDropTarget(false);
        const taskId = event.dataTransfer.getData('text/plain');
        if (taskId) {
          onMove(taskId, columnId);
        }
      }}
      style={{
        ...styles.column,
        ...(isSnapping ? styles.columnSnap : undefined),
        ...(isDropTarget ? styles.columnDropTarget : undefined),
        width,
      }}>
      <div style={styles.columnHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <HStack gap={2} vAlign="center">
              <Text type="label">{title}</Text>
              <Text type="supporting" color="secondary">
                {tasks.length}
              </Text>
            </HStack>
          </StackItem>
          <IconButton
            label={`${title} column options`}
            icon={<Icon icon={EllipsisHorizontalIcon} size="sm" />}
            variant="ghost"
          />
        </HStack>
      </div>
      <div style={styles.columnBody}>
        {tasks.length === 0 ? (
          <div style={styles.columnEmpty}>
            <EmptyState
              isCompact
              icon={<Icon icon={InboxIcon} size="lg" />}
              title="No tasks"
              description="Nothing here matches the current filters."
            />
          </div>
        ) : (
          <VStack gap={2}>
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                columnId={columnId}
                isDraggable={isDraggable}
                isDragging={draggingTaskId === task.id}
                onMove={onMove}
                onDraggingChange={onDraggingChange}
              />
            ))}
          </VStack>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoardTemplate() {
  const [filter, setFilter] = useState('all');
  const [sprint, setSprint] = useState('all');
  // Task→column assignment lifted into state so moves re-render;
  // seeded deterministically from the fixture data.
  const [taskColumns, setTaskColumns] = useState(() =>
    Object.fromEntries(TASKS.map(task => [task.id, task.column] as const)),
  );
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const isNarrow = useMediaQuery('(max-width: 768px)');
  // Drag-and-drop only for hover-capable fine pointers; touch users
  // move cards through each card's MoreMenu.
  const canDrag = useMediaQuery('(hover: hover) and (pointer: fine)');
  const columnWidth = isNarrow ? '85vw' : 300;

  const moveTask = useCallback(
    (taskId: string, targetColumnId: string) => {
      const task = TASKS.find(item => item.id === taskId);
      const column = COLUMNS.find(item => item.id === targetColumnId);
      if (!task || !column || taskColumns[taskId] === targetColumnId) {
        return;
      }
      setTaskColumns(prev => ({...prev, [taskId]: targetColumnId}));
      setAnnouncement(`Moved ${task.title} to ${column.title}`);
    },
    [taskColumns],
  );

  const visibleTasks = useMemo(() => {
    return TASKS.filter(task => {
      if (sprint !== 'all' && task.sprint !== sprint) {
        return false;
      }
      if (filter === 'mine') {
        return task.assignee === CURRENT_USER;
      }
      if (filter === 'high') {
        return task.priority !== 'normal';
      }
      return true;
    });
  }, [filter, sprint]);

  const tasksByColumn = useMemo(() => {
    const grouped = new Map<string, BoardTask[]>();
    for (const column of COLUMNS) {
      grouped.set(column.id, []);
    }
    for (const task of visibleTasks) {
      grouped.get(taskColumns[task.id] ?? task.column)?.push(task);
    }
    return grouped;
  }, [visibleTasks, taskColumns]);

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Delivery board</Heading>
                <Text type="supporting" color="secondary">
                  {visibleTasks.length} tasks
                </Text>
              </HStack>
            </StackItem>
            <SegmentedControl
              label="Filter tasks"
              value={filter}
              onChange={setFilter}
              size="sm">
              <SegmentedControlItem label="All" value="all" />
              <SegmentedControlItem label="Mine" value="mine" />
              <SegmentedControlItem label="High priority" value="high" />
            </SegmentedControl>
            <Selector
              label="Sprint"
              isLabelHidden
              size="sm"
              options={SPRINT_OPTIONS}
              value={sprint}
              onChange={setSprint}
            />
            <Button
              label="New task"
              icon={<Icon icon={PlusIcon} size="sm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div
            style={{
              ...styles.board,
              ...(isNarrow ? styles.boardSnap : undefined),
            }}>
            {COLUMNS.map(column => (
              <BoardColumn
                key={column.id}
                columnId={column.id}
                title={column.title}
                tasks={tasksByColumn.get(column.id) ?? []}
                width={columnWidth}
                isSnapping={isNarrow}
                isDraggable={canDrag}
                draggingTaskId={draggingTaskId}
                onMove={moveTask}
                onDraggingChange={setDraggingTaskId}
              />
            ))}
          </div>
        </LayoutContent>
      }
    />
  );
}
