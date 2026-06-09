// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import React, {useState, useMemo} from 'react';
import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';
import type {ResizableProps} from '@xds/core/Resizable';
import * as stylex from '@stylexjs/stylex';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSLayoutHeader,
  XDSLayoutPanel,
  XDSVStack,
  XDSHStack,
  XDSStackItem,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSSelector} from '@xds/core/Selector';
import {XDSPowerSearch} from '@xds/core/PowerSearch';
import type {PowerSearchConfig, PowerSearchFilter} from '@xds/core/PowerSearch';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSPopover} from '@xds/core/Popover';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSCenter} from '@xds/core/Center';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSDivider} from '@xds/core/Divider';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {
  XDSTable,
  XDSTableRow,
  XDSTableCell,
  proportional,
  pixel,
  resolveColumnWidths,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  TagIcon,
  UserIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {ChartBarIcon} from '@heroicons/react/24/solid';

const pageStyles = stylex.create({
  groupHeaderRow: {
    cursor: 'pointer',
    backgroundColor: 'var(--color-background-muted)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
  },
  headerRow: {
    paddingBottom: 'var(--spacing-4)',
  },
  groupHeaderCell: {
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  flexFill: {
    flexGrow: 1,
    minWidth: 0,
  },
});

// Types
type TaskStatus = 'in_progress' | 'todo' | 'backlog' | 'done';
type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

interface TaskRow extends Record<string, unknown> {
  id: string;
  taskId: string;
  title: string;
  subtitle: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: string;
  tags: string[];
  created: string;
  createdISO: string;
  updated: string;
  updatedISO: string;
  assignee: string;
}

const STATUS_DOT_VARIANT: Record<
  TaskStatus,
  'success' | 'accent' | 'neutral' | 'warning'
> = {
  in_progress: 'accent',
  todo: 'warning',
  backlog: 'neutral',
  done: 'success',
};

const PRIORITY_COLOR: Record<
  TaskPriority,
  'primary' | 'secondary' | 'disabled'
> = {
  urgent: 'primary',
  high: 'primary',
  medium: 'secondary',
  low: 'disabled',
  none: 'disabled',
};

// Mock data matching a task tracker
const allTasks: TaskRow[] = [
  {
    id: '1',
    taskId: 'T235040469',
    title: 'Update user interface',
    subtitle: 'Update payment gateway integration',
    status: 'in_progress',
    priority: 'medium',
    project: 'Payment gateway integration 2.0',
    tags: [],
    created: 'Jul 3',
    createdISO: '2025-07-03',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Olivia Martin',
  },
  {
    id: '2',
    taskId: 'T235040470',
    title: 'Use Projects to organize work for features or releases',
    subtitle: '',
    status: 'in_progress',
    priority: 'medium',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Jackson Lee',
  },
  {
    id: '3',
    taskId: 'T235040471',
    title: 'Use Cycles to focus work over n-weeks',
    subtitle: '',
    status: 'in_progress',
    priority: 'medium',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Isabella Nguyen',
  },
  {
    id: '4',
    taskId: 'T235040472',
    title: 'Testing code',
    subtitle: 'Update payment gateway integration',
    status: 'todo',
    priority: 'medium',
    project: 'Payment gateway integration 2.0',
    tags: [],
    created: 'Jul 3',
    createdISO: '2025-07-03',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'William Kim',
  },
  {
    id: '5',
    taskId: 'T235040473',
    title: 'Update backend code',
    subtitle: 'Update payment gateway integration',
    status: 'todo',
    priority: 'medium',
    project: 'Payment gateway integration 2.0',
    tags: [],
    created: 'Jul 3',
    createdISO: '2025-07-03',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Sofia Davis',
  },
  {
    id: '6',
    taskId: 'T235040474',
    title: 'Update front end code',
    subtitle: 'Update payment gateway integration',
    status: 'todo',
    priority: 'medium',
    project: 'Payment gateway integration 2.0',
    tags: [],
    created: 'Jul 3',
    createdISO: '2025-07-03',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Mia Wilson',
  },
  {
    id: '7',
    taskId: 'T235040475',
    title: 'Update payment gateway integration',
    subtitle: '',
    status: 'todo',
    priority: 'high',
    project: 'Payment gateway integration 2.0',
    tags: ['Improvement', '3rd Party'],
    created: 'Jul 3',
    createdISO: '2025-07-03',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Lucas Brown',
  },
  {
    id: '8',
    taskId: 'T235040476',
    title: 'Update payment gateway backend code',
    subtitle: '',
    status: 'todo',
    priority: 'medium',
    project: '',
    tags: [],
    created: 'Jul 3',
    createdISO: '2025-07-03',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Ethan Jones',
  },
  {
    id: '9',
    taskId: 'T235040477',
    title: 'Invite your teammates',
    subtitle: '',
    status: 'todo',
    priority: 'low',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 1',
    updatedISO: '2025-07-01',
    assignee: 'Ava Taylor',
  },
  {
    id: '10',
    taskId: 'T235040478',
    title: 'Next steps',
    subtitle: '',
    status: 'todo',
    priority: 'none',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Noah Garcia',
  },
  {
    id: '11',
    taskId: 'T235040479',
    title: 'Welcome to Linear',
    subtitle: '',
    status: 'backlog',
    priority: 'none',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Olivia Martin',
  },
  {
    id: '12',
    taskId: 'T235040480',
    title: 'Connect GitHub or GitLab',
    subtitle: '',
    status: 'backlog',
    priority: 'none',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Jackson Lee',
  },
  {
    id: '13',
    taskId: 'T235040481',
    title: 'Customize settings',
    subtitle: '',
    status: 'backlog',
    priority: 'none',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Isabella Nguyen',
  },
  {
    id: '14',
    taskId: 'T235040482',
    title: 'Try 3 ways to navigate: Command menu, keyboard or mouse',
    subtitle: '',
    status: 'done',
    priority: 'none',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'William Kim',
  },
  {
    id: '15',
    taskId: 'T235040483',
    title: 'Connect to Slack',
    subtitle: '',
    status: 'done',
    priority: 'none',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Sofia Davis',
  },
  {
    id: '16',
    taskId: 'T235040484',
    title: 'Migrate database schema to v2',
    subtitle: 'Payment gateway integration',
    status: 'in_progress',
    priority: 'high',
    project: 'Payment gateway integration 2.0',
    tags: [],
    created: 'Jul 4',
    createdISO: '2025-07-04',
    updated: 'Jul 5',
    updatedISO: '2025-07-05',
    assignee: 'Lucas Brown',
  },
  {
    id: '17',
    taskId: 'T235040485',
    title: 'Write integration tests for checkout flow',
    subtitle: '',
    status: 'in_progress',
    priority: 'medium',
    project: 'Payment gateway integration 2.0',
    tags: [],
    created: 'Jul 4',
    createdISO: '2025-07-04',
    updated: 'Jul 5',
    updatedISO: '2025-07-05',
    assignee: 'Ethan Jones',
  },
  {
    id: '18',
    taskId: 'T235040486',
    title: 'Set up CI/CD pipeline for staging',
    subtitle: '',
    status: 'in_progress',
    priority: 'high',
    project: '',
    tags: [],
    created: 'Jul 2',
    createdISO: '2025-07-02',
    updated: 'Jul 5',
    updatedISO: '2025-07-05',
    assignee: 'Ava Taylor',
  },
  {
    id: '19',
    taskId: 'T235040487',
    title: 'Add rate limiting to public API endpoints',
    subtitle: '',
    status: 'todo',
    priority: 'urgent',
    project: '',
    tags: [],
    created: 'Jul 5',
    createdISO: '2025-07-05',
    updated: 'Jul 5',
    updatedISO: '2025-07-05',
    assignee: 'Noah Garcia',
  },
  {
    id: '20',
    taskId: 'T235040488',
    title: 'Refactor auth middleware to support OAuth2',
    subtitle: '',
    status: 'todo',
    priority: 'high',
    project: '',
    tags: [],
    created: 'Jul 4',
    createdISO: '2025-07-04',
    updated: 'Jul 5',
    updatedISO: '2025-07-05',
    assignee: 'Olivia Martin',
  },
  {
    id: '21',
    taskId: 'T235040489',
    title: 'Design error pages for 404 and 500',
    subtitle: '',
    status: 'todo',
    priority: 'low',
    project: '',
    tags: [],
    created: 'Jul 3',
    createdISO: '2025-07-03',
    updated: 'Jul 4',
    updatedISO: '2025-07-04',
    assignee: 'Mia Wilson',
  },
  {
    id: '22',
    taskId: 'T235040490',
    title: 'Audit third-party dependencies for vulnerabilities',
    subtitle: '',
    status: 'todo',
    priority: 'medium',
    project: '',
    tags: [],
    created: 'Jul 5',
    createdISO: '2025-07-05',
    updated: 'Jul 5',
    updatedISO: '2025-07-05',
    assignee: 'Jackson Lee',
  },
  {
    id: '23',
    taskId: 'T235040491',
    title: 'Implement webhook retry logic with exponential backoff',
    subtitle: 'Payment gateway integration',
    status: 'todo',
    priority: 'medium',
    project: 'Payment gateway integration 2.0',
    tags: [],
    created: 'Jul 4',
    createdISO: '2025-07-04',
    updated: 'Jul 5',
    updatedISO: '2025-07-05',
    assignee: 'William Kim',
  },
  {
    id: '24',
    taskId: 'T235040492',
    title: 'Add dark mode support to dashboard',
    subtitle: '',
    status: 'backlog',
    priority: 'low',
    project: '',
    tags: [],
    created: 'Jul 2',
    createdISO: '2025-07-02',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Sofia Davis',
  },
  {
    id: '25',
    taskId: 'T235040493',
    title: 'Create onboarding flow for new team members',
    subtitle: '',
    status: 'backlog',
    priority: 'none',
    project: '',
    tags: [],
    created: 'Jul 1',
    createdISO: '2025-07-01',
    updated: 'Jul 2',
    updatedISO: '2025-07-02',
    assignee: 'Isabella Nguyen',
  },
  {
    id: '26',
    taskId: 'T235040494',
    title: 'Set up error tracking with Sentry',
    subtitle: '',
    status: 'backlog',
    priority: 'medium',
    project: '',
    tags: [],
    created: 'Jul 3',
    createdISO: '2025-07-03',
    updated: 'Jul 4',
    updatedISO: '2025-07-04',
    assignee: 'Ethan Jones',
  },
  {
    id: '27',
    taskId: 'T235040495',
    title: 'Improve search performance with indexing',
    subtitle: '',
    status: 'backlog',
    priority: 'low',
    project: '',
    tags: [],
    created: 'Jul 2',
    createdISO: '2025-07-02',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Ava Taylor',
  },
  {
    id: '28',
    taskId: 'T235040496',
    title: 'Write API documentation for v2 endpoints',
    subtitle: '',
    status: 'done',
    priority: 'medium',
    project: '',
    tags: [],
    created: 'Jun 28',
    createdISO: '2025-06-28',
    updated: 'Jul 3',
    updatedISO: '2025-07-03',
    assignee: 'Noah Garcia',
  },
  {
    id: '29',
    taskId: 'T235040497',
    title: 'Set up staging environment',
    subtitle: '',
    status: 'done',
    priority: 'high',
    project: '',
    tags: [],
    created: 'Jun 25',
    createdISO: '2025-06-25',
    updated: 'Jul 1',
    updatedISO: '2025-07-01',
    assignee: 'Lucas Brown',
  },
  {
    id: '30',
    taskId: 'T235040498',
    title: 'Fix flaky end-to-end tests in CI',
    subtitle: '',
    status: 'done',
    priority: 'medium',
    project: '',
    tags: [],
    created: 'Jun 30',
    createdISO: '2025-06-30',
    updated: 'Jul 2',
    updatedISO: '2025-07-02',
    assignee: 'Mia Wilson',
  },
];

const STATUS_LABEL: Record<TaskStatus, string> = {
  in_progress: 'In Progress',
  todo: 'Todo',
  backlog: 'Backlog',
  done: 'Done',
};

const GROUP_ORDER: TaskStatus[] = ['in_progress', 'todo', 'backlog', 'done'];

type GroupByField = 'status' | 'priority' | 'project' | 'assignee' | 'none';

const GROUP_BY_OPTIONS: {value: GroupByField; label: string}[] = [
  {value: 'none', label: 'None'},
  {value: 'status', label: 'Status'},
  {value: 'priority', label: 'Priority'},
  {value: 'project', label: 'Project'},
  {value: 'assignee', label: 'Assignee'},
];

function groupTasks(
  tasks: TaskRow[],
  groupBy: GroupByField,
): Map<string, TaskRow[]> {
  if (groupBy === 'none') {
    return new Map([['All', tasks]]);
  }
  const map = new Map<string, TaskRow[]>();
  for (const task of tasks) {
    const key = String(task[groupBy]) || '—';
    let group = map.get(key);
    if (!group) {
      group = [];
      map.set(key, group);
    }
    group.push(task);
  }
  return map;
}

function getGroupLabel(groupBy: GroupByField, key: string): string {
  if (groupBy === 'status') {
    return STATUS_LABEL[key as TaskStatus] ?? key;
  }
  if (groupBy === 'priority') {
    const labels: Record<string, string> = {
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      none: 'No priority',
    };
    return labels[key] ?? key;
  }
  return key;
}

const columns: XDSTableColumn<TaskRow>[] = [
  {
    key: 'status',
    header: '',
    width: pixel(44),
  },
  {
    key: 'title',
    header: 'Issue',
    width: proportional(1),
  },
  {
    key: 'project',
    header: 'Project',
    width: pixel(180),
  },
  {
    key: 'created',
    header: 'Created',
    width: pixel(72),
  },
  {
    key: 'updated',
    header: 'Updated',
    width: pixel(72),
  },
  {
    key: 'assignee',
    header: 'Assignee',
    width: pixel(52),
  },
  {
    key: 'actions',
    header: '',
    width: pixel(56),
  },
];

const powerSearchConfig: PowerSearchConfig = {
  name: 'IssueSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              {value: 'in_progress', label: 'In Progress'},
              {value: 'todo', label: 'Todo'},
              {value: 'backlog', label: 'Backlog'},
              {value: 'done', label: 'Done'},
            ],
          },
        },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              {value: 'urgent', label: 'Urgent'},
              {value: 'high', label: 'High'},
              {value: 'medium', label: 'Medium'},
              {value: 'low', label: 'Low'},
              {value: 'none', label: 'None'},
            ],
          },
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
      ],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
      ],
    },
    {
      key: 'project',
      label: 'Project',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
      ],
    },
  ],
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
};

function TaskDetailPanel({
  task,
  onClose,
  resizable,
}: {
  task: TaskRow | null;
  onClose: () => void;
  resizable: ResizableProps;
}) {
  if (!task) {
    return null;
  }
  return (
    <XDSLayoutPanel
      hasDivider
      resizable={resizable}
      padding={4}
      role="complementary"
      label="Task details">
      <XDSVStack gap={4}>
        <XDSHStack gap={2} vAlign="center">
          <XDSStackItem size="fill">
            <XDSText type="supporting" color="secondary">
              {task.taskId}
            </XDSText>
          </XDSStackItem>
          <XDSButton
            label="Close panel"
            variant="ghost"
            size="sm"
            icon={<XDSIcon icon={XMarkIcon} size="sm" />}
            isIconOnly
            onClick={onClose}
          />
        </XDSHStack>

        <XDSVStack gap={1}>
          <XDSHeading level={3}>{task.title}</XDSHeading>
          {task.subtitle && (
            <XDSText type="body" color="secondary">
              {task.subtitle}
            </XDSText>
          )}
        </XDSVStack>

        <XDSMetadataList label={{position: 'start'}}>
          <XDSMetadataListItem label="Status">
            <XDSHStack gap={2} vAlign="center">
              <XDSStatusDot
                variant={STATUS_DOT_VARIANT[task.status]}
                label={STATUS_LABEL[task.status]}
              />
              <XDSText type="body">{STATUS_LABEL[task.status]}</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Priority">
            <XDSHStack gap={2} vAlign="center">
              <XDSIcon
                icon={ChartBarIcon}
                size="sm"
                color={PRIORITY_COLOR[task.priority]}
              />
              <XDSText type="body">{PRIORITY_LABEL[task.priority]}</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Assignee">
            <XDSHStack gap={2} vAlign="center">
              <XDSAvatar name={task.assignee} size="xsmall" />
              <XDSText type="body">{task.assignee}</XDSText>
            </XDSHStack>
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Project">
            {task.project || '\u2014'}
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Created">
            {task.created}
          </XDSMetadataListItem>
          <XDSMetadataListItem label="Updated">
            {task.updated}
          </XDSMetadataListItem>
        </XDSMetadataList>

        {task.tags.length > 0 && (
          <>
            <XDSDivider />
            <XDSVStack gap={2}>
              <XDSText type="label">Labels</XDSText>
              <XDSHStack gap={2}>
                {task.tags.map(tag => (
                  <XDSBadge key={tag} variant="neutral" label={tag} />
                ))}
              </XDSHStack>
            </XDSVStack>
          </>
        )}
      </XDSVStack>
    </XDSLayoutPanel>
  );
}

export default function DataTableTemplate() {
  const [search, _setSearch] = useState('');
  const [priorityFilter, _setPriorityFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [powerSearchFilters, setPowerSearchFilters] = useState<
    ReadonlyArray<PowerSearchFilter>
  >([]);
  const [groupBy, setGroupBy] = useState<GroupByField>('status');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(GROUP_ORDER as string[]),
  );

  const filtered = useMemo(() => {
    let data = allTasks;
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.taskId.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q),
      );
    }
    if (priorityFilter !== 'all') {
      data = data.filter(t => t.priority === priorityFilter);
    }
    return data;
  }, [search, priorityFilter]);

  const grouped = useMemo(
    () => groupTasks(filtered, groupBy),
    [filtered, groupBy],
  );

  const groupKeys = useMemo(() => Array.from(grouped.keys()), [grouped]);

  React.useEffect(() => {
    setExpandedGroups(new Set(groupKeys));
  }, [groupKeys]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const detailPanel = useXDSResizable({
    defaultSize: 360,
    minSizePx: 280,
    maxSizePx: 500,
  });

  const COL_COUNT = columns.length;
  const resolvedWidths = resolveColumnWidths(columns);

  return (
    <>
      <XDSLayout
        height="fill"
        header={
          <XDSLayoutHeader hasDivider padding={4}>
            <XDSVStack gap={4}>
              <XDSHStack gap={3} vAlign="center">
                <XDSStackItem size="fill">
                  <XDSHeading level={1}>All Issues</XDSHeading>
                </XDSStackItem>
                <XDSButton
                  label="Create issue"
                  variant="primary"
                  size="lg"
                  onClick={() => setDialogOpen(true)}
                />
              </XDSHStack>
              <XDSHStack gap={2} vAlign="center">
                <XDSStackItem size="fill">
                  <XDSPowerSearch
                    config={powerSearchConfig}
                    filters={powerSearchFilters}
                    onChange={newFilters => setPowerSearchFilters(newFilters)}
                    placeholder="Filter issues..."
                    resultCount={`${filtered.length} issue${filtered.length !== 1 ? 's' : ''}`}
                  />
                </XDSStackItem>
                <XDSPopover
                  placement="below"
                  alignment="end"
                  width={320}
                  label="Grouping options"
                  content={
                    <XDSVStack gap={4}>
                      <XDSRadioList
                        label="Group by"
                        value={groupBy}
                        onChange={v => setGroupBy(v as GroupByField)}>
                        {GROUP_BY_OPTIONS.map(opt => (
                          <XDSRadioListItem
                            key={opt.value}
                            value={opt.value}
                            label={opt.label}
                          />
                        ))}
                      </XDSRadioList>
                    </XDSVStack>
                  }>
                  <XDSButton
                    label="View Options"
                    variant="secondary"
                    size="md"
                  />
                </XDSPopover>
              </XDSHStack>
            </XDSVStack>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent role="main" padding={0}>
            <XDSTable
              columns={columns}
              density="balanced"
              dividers="rows"
              textOverflow="truncate"
              hasHover>
              <colgroup>
                {columns.map(col => (
                  <col
                    key={col.key}
                    style={resolvedWidths.columns.get(col.key)?.style}
                  />
                ))}
              </colgroup>
              {groupKeys.map(key => {
                const tasks = grouped.get(key);
                if (!tasks || tasks.length === 0) {
                  return null;
                }
                const isExpanded = expandedGroups.has(key);

                return (
                  <React.Fragment key={key}>
                    {groupBy !== 'none' && (
                      <XDSTableRow
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleGroup(key)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleGroup(key);
                          }
                        }}
                        xstyle={[pageStyles.groupHeaderRow]}>
                        <td
                          colSpan={COL_COUNT}
                          {...stylex.props(pageStyles.groupHeaderCell)}>
                          <XDSHStack gap={2} vAlign="center">
                            <XDSIcon
                              icon={
                                isExpanded ? ChevronDownIcon : ChevronRightIcon
                              }
                              size="sm"
                              color="secondary"
                            />
                            <XDSText type="body" weight="bold">
                              {getGroupLabel(groupBy, key)}
                            </XDSText>
                            <XDSBadge
                              variant="neutral"
                              label={String(tasks.length)}
                            />
                          </XDSHStack>
                        </td>
                      </XDSTableRow>
                    )}

                    {(groupBy === 'none' || isExpanded) &&
                      tasks.map(task => (
                        <XDSTableRow
                          key={task.id}
                          onClick={() => setSelectedTask(task)}>
                          <XDSTableCell>
                            <XDSCenter axis="horizontal">
                              <XDSStatusDot
                                variant={STATUS_DOT_VARIANT[task.status]}
                                label={STATUS_LABEL[task.status]}
                              />
                            </XDSCenter>
                          </XDSTableCell>
                          <XDSTableCell>
                            <XDSHStack gap={3} vAlign="center">
                              <XDSIcon
                                icon={ChartBarIcon}
                                size="sm"
                                color={PRIORITY_COLOR[task.priority]}
                              />
                              <XDSText type="supporting" color="secondary">
                                {task.taskId}
                              </XDSText>
                              <XDSText type="body" maxLines={1}>
                                {task.title}
                              </XDSText>
                              {task.subtitle && (
                                <XDSText
                                  type="body"
                                  color="secondary"
                                  maxLines={1}>
                                  › {task.subtitle}
                                </XDSText>
                              )}
                            </XDSHStack>
                          </XDSTableCell>
                          <XDSTableCell>
                            {task.project ? (
                              <XDSText type="body" maxLines={1}>
                                {task.project}
                              </XDSText>
                            ) : (
                              <XDSText type="supporting" color="secondary">
                                —
                              </XDSText>
                            )}
                          </XDSTableCell>
                          <XDSTableCell>
                            <XDSText type="supporting" color="secondary">
                              {task.created}
                            </XDSText>
                          </XDSTableCell>
                          <XDSTableCell>
                            <XDSText type="supporting" color="secondary">
                              {task.updated}
                            </XDSText>
                          </XDSTableCell>
                          <XDSTableCell>
                            <XDSAvatar name={task.assignee} size="xsmall" />
                          </XDSTableCell>
                          <XDSTableCell>
                            <XDSDropdownMenu
                              button={{
                                label: 'Actions',
                                variant: 'ghost',
                                size: 'sm',
                                icon: (
                                  <XDSIcon
                                    icon={EllipsisHorizontalIcon}
                                    size="sm"
                                  />
                                ),
                                isIconOnly: true,
                              }}
                              hasChevron={false}
                              items={[
                                {
                                  label: 'Edit issue',
                                  icon: PencilIcon,
                                  onClick: () => {},
                                },
                                {
                                  label: 'Assign to...',
                                  icon: UserIcon,
                                  onClick: () => {},
                                },
                                {
                                  label: 'Add label',
                                  icon: TagIcon,
                                  onClick: () => {},
                                },
                                {
                                  label: 'Duplicate',
                                  icon: DocumentDuplicateIcon,
                                  onClick: () => {},
                                },
                                {
                                  label: 'Move to project',
                                  icon: ArrowRightIcon,
                                  onClick: () => {},
                                },
                                {type: 'divider' as const},
                                {
                                  label: 'Delete issue',
                                  icon: TrashIcon,
                                  onClick: () => {},
                                },
                              ]}
                            />
                          </XDSTableCell>
                        </XDSTableRow>
                      ))}
                  </React.Fragment>
                );
              })}
            </XDSTable>
          </XDSLayoutContent>
        }
        end={
          selectedTask && (
            <>
              <XDSResizeHandle resizable={detailPanel.props} isReversed />
              <TaskDetailPanel
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                resizable={detailPanel.props}
              />
            </>
          )
        }
      />

      <XDSDialog isOpen={dialogOpen} onOpenChange={open => setDialogOpen(open)}>
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Create Issue"
              onOpenChange={open => setDialogOpen(open)}
            />
          }
          content={
            <XDSLayoutContent padding={4}>
              <XDSVStack gap={4}>
                <XDSTextInput
                  label="Title"
                  placeholder="Issue title"
                  value=""
                  onChange={() => {}}
                />
                <XDSSelector
                  label="Status"
                  value="todo"
                  options={[
                    {value: 'in_progress', label: 'In Progress'},
                    {value: 'todo', label: 'Todo'},
                    {value: 'backlog', label: 'Backlog'},
                  ]}
                  onChange={() => {}}
                />
                <XDSSelector
                  label="Priority"
                  value="none"
                  options={[
                    {value: 'urgent', label: 'Urgent'},
                    {value: 'high', label: 'High'},
                    {value: 'medium', label: 'Medium'},
                    {value: 'low', label: 'Low'},
                    {value: 'none', label: 'No priority'},
                  ]}
                  onChange={() => {}}
                />
                <XDSTextInput
                  label="Project"
                  placeholder="Project name"
                  value=""
                  onChange={() => {}}
                />
              </XDSVStack>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter hasDivider>
              <XDSHStack gap={2} hAlign="end">
                <XDSButton
                  label="Cancel"
                  variant="secondary"
                  size="md"
                  onClick={() => setDialogOpen(false)}
                />
                <XDSButton
                  label="Create"
                  variant="primary"
                  size="md"
                  onClick={() => setDialogOpen(false)}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </>
  );
}
