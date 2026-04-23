'use client';

import React, {useState, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {
  XDSLayout,
  XDSLayoutContent,
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
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSCenter} from '@xds/core/Center';
import {XDSIcon} from '@xds/core/Icon';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSDivider} from '@xds/core/Divider';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {
  XDSTable,
  XDSTableRow,
  XDSTableCell,
  proportional,
  pixel,
} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {
  ClockIcon,
  InboxIcon,
  Squares2X2Icon,
  EyeIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  TagIcon,
  UserIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {
  ChartBarIcon,
  CommandLineIcon,
  ClockIcon as ClockIconSolid,
  InboxIcon as InboxIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  EyeIcon as EyeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ArrowPathIcon as ArrowPathIconSolid,
} from '@heroicons/react/24/solid';

const pageStyles = stylex.create({
  groupHeaderRow: {
    cursor: 'pointer',
    backgroundColor: 'var(--color-background-muted)',
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
  'positive' | 'info' | 'neutral' | 'warning'
> = {
  in_progress: 'info',
  todo: 'warning',
  backlog: 'neutral',
  done: 'positive',
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

const STATUS_BADGE: Record<TaskStatus, 'neutral'> = {
  in_progress: 'neutral',
  todo: 'neutral',
  backlog: 'neutral',
  done: 'neutral',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  in_progress: 'In Progress',
  todo: 'Todo',
  backlog: 'Backlog',
  done: 'Done',
};

const GROUP_ORDER: TaskStatus[] = ['in_progress', 'todo', 'backlog', 'done'];

const columns: XDSTableColumn<TaskRow>[] = [
  {
    key: 'status',
    header: '',
    width: pixel(48),
  },
  {
    key: 'title',
    header: 'Issue',
    width: proportional(5),
  },
  {
    key: 'project',
    header: 'Project',
    width: proportional(2),
  },
  {
    key: 'created',
    header: 'Created',
    width: pixel(90),
  },
  {
    key: 'updated',
    header: 'Updated',
    width: pixel(90),
  },
  {
    key: 'assignee',
    header: 'Assignee',
    width: pixel(80),
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

function TaskTrackerSideNav() {
  const [active, setActive] = useState('issues');
  return (
    <XDSSideNav
      header={
        <XDSSideNavHeading
          heading="Acme"
          icon={
            <XDSNavIcon
              icon={
                <XDSIcon icon={CommandLineIcon} size="sm" color="inherit" />
              }
            />
          }
        />
      }
      collapsible>
      <XDSSideNavSection title="Workspace" isHeaderHidden>
        <XDSSideNavItem
          label="Inbox"
          icon={InboxIcon}
          selectedIcon={InboxIconSolid}
          isSelected={active === 'inbox'}
          onClick={() => setActive('inbox')}
        />
        <XDSSideNavItem
          label="My issues"
          icon={ClockIcon}
          selectedIcon={ClockIconSolid}
          isSelected={active === 'my-issues'}
          onClick={() => setActive('my-issues')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Workspace">
        <XDSSideNavItem
          label="Projects"
          icon={Squares2X2Icon}
          selectedIcon={Squares2X2IconSolid}
          isSelected={active === 'projects'}
          onClick={() => setActive('projects')}
        />
        <XDSSideNavItem
          label="Views"
          icon={EyeIcon}
          selectedIcon={EyeIconSolid}
          isSelected={active === 'views'}
          onClick={() => setActive('views')}
        />
        <XDSSideNavItem
          label="Teams"
          icon={UserGroupIcon}
          selectedIcon={UserGroupIconSolid}
          isSelected={active === 'teams'}
          onClick={() => setActive('teams')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Your teams">
        <XDSSideNavItem
          label="Issues"
          icon={ClockIcon}
          selectedIcon={ClockIconSolid}
          isSelected={active === 'issues'}
          onClick={() => setActive('issues')}
          collapsible>
          <XDSSideNavItem
            label="Active"
            isSelected={active === 'active'}
            onClick={() => setActive('active')}
          />
          <XDSSideNavItem
            label="Backlog"
            isSelected={active === 'backlog'}
            onClick={() => setActive('backlog')}
          />
        </XDSSideNavItem>
        <XDSSideNavItem
          label="Projects"
          icon={Squares2X2Icon}
          selectedIcon={Squares2X2IconSolid}
          isSelected={active === 'team-projects'}
          onClick={() => setActive('team-projects')}
        />
        <XDSSideNavItem
          label="Views"
          icon={EyeIcon}
          selectedIcon={EyeIconSolid}
          isSelected={active === 'team-views'}
          onClick={() => setActive('team-views')}
        />
        <XDSSideNavItem
          label="Cycles"
          icon={ArrowPathIcon}
          selectedIcon={ArrowPathIconSolid}
          isSelected={active === 'cycles'}
          onClick={() => setActive('cycles')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

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
}: {
  task: TaskRow | null;
  onClose: () => void;
}) {
  if (!task) return null;
  return (
    <XDSLayoutPanel
      hasDivider
      width={360}
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
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [isAdvancedFilter, setIsAdvancedFilter] = useState(false);
  const [powerSearchFilters, setPowerSearchFilters] = useState<
    ReadonlyArray<PowerSearchFilter>
  >([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<TaskStatus>>(
    () => new Set(GROUP_ORDER),
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
    if (priorityFilter !== 'all')
      data = data.filter(t => t.priority === priorityFilter);
    return data;
  }, [search, priorityFilter]);

  const grouped = useMemo(() => {
    const map = new Map<TaskStatus, TaskRow[]>();
    for (const status of GROUP_ORDER) map.set(status, []);
    for (const task of filtered) map.get(task.status)!.push(task);
    return map;
  }, [filtered]);

  const toggleGroup = (status: TaskStatus) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const COL_COUNT = columns.length;

  return (
    <XDSAppShell
      sideNav={<TaskTrackerSideNav />}
      variant="elevated"
      contentPadding={0}>
      <XDSLayout
        height="fill"
        content={
          <XDSLayoutContent role="main" padding={4}>
            <XDSVStack gap={2}>
              <XDSHStack gap={3} vAlign="center">
                <XDSStackItem size="fill">
                  <XDSHeading level={1}>All Issues</XDSHeading>
                </XDSStackItem>
                <XDSButton
                  label="+ Create issue"
                  variant="primary"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                />
              </XDSHStack>

              {isAdvancedFilter ? (
                <XDSToolbar
                  label="Filter toolbar"
                  startContent={
                    <>
                      <div {...stylex.props(pageStyles.flexFill)}>
                        <XDSPowerSearch
                          config={powerSearchConfig}
                          filters={powerSearchFilters}
                          onChange={newFilters =>
                            setPowerSearchFilters(newFilters)
                          }
                          placeholder="Filter issues..."
                          resultCount={`${filtered.length} issue${filtered.length !== 1 ? 's' : ''}`}
                        />
                      </div>
                      <XDSButton
                        label="Simple filters"
                        variant="ghost"
                        size="md"
                        icon={
                          <XDSIcon icon={AdjustmentsHorizontalIcon} size="sm" />
                        }
                        isIconOnly
                        onClick={() => setIsAdvancedFilter(false)}
                      />
                      <XDSButton
                        label="View Options"
                        variant="ghost"
                        size="md"
                      />
                    </>
                  }
                />
              ) : (
                <XDSToolbar
                  label="Filter toolbar"
                  startContent={
                    <>
                      <XDSTextInput
                        label="Filter"
                        isLabelHidden
                        placeholder="Search issues..."
                        value={search}
                        onChange={setSearch}
                      />
                      <XDSSelector
                        label="Priority"
                        isLabelHidden
                        value={priorityFilter}
                        options={[
                          {value: 'all', label: 'All priorities'},
                          {value: 'urgent', label: 'Urgent'},
                          {value: 'high', label: 'High'},
                          {value: 'medium', label: 'Medium'},
                          {value: 'low', label: 'Low'},
                          {value: 'none', label: 'No priority'},
                        ]}
                        onChange={setPriorityFilter}
                      />
                      <XDSButton
                        label="Advanced filters"
                        variant="ghost"
                        size="md"
                        icon={
                          <XDSIcon icon={AdjustmentsHorizontalIcon} size="sm" />
                        }
                        isIconOnly
                        onClick={() => setIsAdvancedFilter(true)}
                      />
                      <XDSText type="supporting" color="secondary">
                        {filtered.length} issue
                        {filtered.length !== 1 ? 's' : ''}
                      </XDSText>
                    </>
                  }
                  endContent={
                    <XDSButton label="View Options" variant="ghost" size="md" />
                  }
                />
              )}

              <XDSTable
                columns={columns}
                density="balanced"
                dividers="rows"
                hasHover>
                {GROUP_ORDER.map(status => {
                  const tasks = grouped.get(status)!;
                  if (tasks.length === 0) return null;
                  const isExpanded = expandedGroups.has(status);

                  return (
                    <React.Fragment key={status}>
                      <XDSTableRow
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleGroup(status)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleGroup(status);
                          }
                        }}
                        xstyle={[pageStyles.groupHeaderRow]}>
                        <td
                          colSpan={COL_COUNT}
                          {...stylex.props(pageStyles.groupHeaderCell)}>
                          <XDSHStack gap={6} vAlign="center">
                            <XDSIcon
                              icon={
                                isExpanded ? ChevronDownIcon : ChevronRightIcon
                              }
                              size="sm"
                              color="secondary"
                            />
                            <XDSText type="body" weight="bold">
                              {STATUS_LABEL[status]}
                            </XDSText>
                            <XDSBadge
                              variant={STATUS_BADGE[status]}
                              label={String(tasks.length)}
                            />
                          </XDSHStack>
                        </td>
                      </XDSTableRow>

                      {isExpanded &&
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
                                <XDSText type="body" weight="bold" maxLines={1}>
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
            </XDSVStack>
          </XDSLayoutContent>
        }
        end={
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        }
      />

      <XDSDialog isOpen={dialogOpen} onOpenChange={open => setDialogOpen(open)}>
        <XDSDialogHeader
          title="Create Issue"
          onOpenChange={open => setDialogOpen(open)}
        />
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
          <XDSHStack gap={2}>
            <XDSButton
              label="Create"
              variant="primary"
              size="sm"
              onClick={() => setDialogOpen(false)}
            />
            <XDSButton
              label="Cancel"
              variant="secondary"
              size="sm"
              onClick={() => setDialogOpen(false)}
            />
          </XDSHStack>
        </XDSVStack>
      </XDSDialog>
    </XDSAppShell>
  );
}
