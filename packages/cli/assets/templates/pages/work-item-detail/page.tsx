// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {colorVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutPanel,
  VStack,
  HStack,
  StackItem,
  Section,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Token} from '@astryxdesign/core/Token';
import {Tokenizer} from '@astryxdesign/core/Tokenizer';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Link} from '@astryxdesign/core/Link';
import {Icon} from '@astryxdesign/core/Icon';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Divider} from '@astryxdesign/core/Divider';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Card} from '@astryxdesign/core/Card';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {List, ListItem} from '@astryxdesign/core/List';
import {CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {
  ArrowLeftIcon,
  LinkIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ViewColumnsIcon,
  ArrowUpTrayIcon,
  BellIcon,
  ShareIcon,
  EyeIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';

// ─── Task data ──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  {
    value: 'todo',
    label: 'To Do',
    icon: <StatusDot variant="neutral" label="To Do" />,
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    icon: <StatusDot variant="accent" label="In Progress" />,
  },
  {
    value: 'in_review',
    label: 'In Review',
    icon: <StatusDot variant="warning" label="In Review" />,
  },
  {
    value: 'done',
    label: 'Done',
    icon: <StatusDot variant="success" label="Done" />,
  },
];

const ASSIGNEE_OPTIONS = [
  {
    value: 'priya-shah',
    label: 'Priya Shah',
    icon: <Avatar name="Priya Shah" size="xsm" />,
  },
  {
    value: 'marcus-chen',
    label: 'Marcus Chen',
    icon: <Avatar name="Marcus Chen" size="xsm" />,
  },
  {
    value: 'sofia-alvarez',
    label: 'Sofia Alvarez',
    icon: <Avatar name="Sofia Alvarez" size="xsm" />,
  },
];

const PRIORITY_OPTIONS = [
  {value: 'high', label: 'High'},
  {value: 'mid', label: 'Mid'},
  {value: 'low', label: 'Low'},
  {value: 'none', label: 'None'},
];

type LabelOption = SearchableItem & {
  color: 'blue' | 'green' | 'purple';
};

const LABEL_OPTIONS: LabelOption[] = [
  {id: 'onboarding', label: 'Onboarding', color: 'purple'},
  {id: 'q1-goal', label: 'Q1 goal', color: 'blue'},
  {id: 'growth', label: 'Growth', color: 'green'},
];

const LABEL_SEARCH_SOURCE: SearchSource<LabelOption> = {
  search: query =>
    LABEL_OPTIONS.filter(option =>
      option.label.toLowerCase().includes(query.toLowerCase()),
    ),
  bootstrap: () => LABEL_OPTIONS,
};

function PriorityBadge({priority}: {priority: string}) {
  const label =
    PRIORITY_OPTIONS.find(option => option.value === priority)?.label ?? 'None';

  switch (priority) {
    case 'high':
      return <Badge variant="red" label={label} />;
    case 'mid':
      return <Badge variant="orange" label={label} />;
    case 'low':
      return <Badge variant="yellow" label={label} />;
    default:
      return <Badge variant="neutral" label={label} />;
  }
}

const SUBTASKS = [
  {
    id: 1,
    title: 'Audit current onboarding flow and note friction points',
    isDone: true,
    assignee: 'Priya Shah',
    due: '2026-03-04',
  },
  {
    id: 2,
    title: 'Interview five recent sign-ups about their first-run experience',
    isDone: true,
    assignee: 'Marcus Chen',
    due: '2026-03-06',
  },
  {
    id: 3,
    title: 'Draft revised welcome sequence with three variants',
    isDone: false,
    assignee: 'Priya Shah',
    due: '2026-03-11',
  },
  {
    id: 4,
    title: 'Review copy with content design and legal',
    isDone: false,
    assignee: 'Sofia Alvarez',
    due: '2026-03-13',
  },
  {
    id: 5,
    title: 'Ship variant A to 10% of new accounts and measure activation',
    isDone: false,
    assignee: 'Marcus Chen',
    due: '2026-03-18',
  },
];

const ATTACHMENTS = [
  {
    kind: 'link' as const,
    title: 'Onboarding audit notes',
    subtitle: 'docs.example.com',
    href: '#',
  },
  {
    kind: 'link' as const,
    title: 'Sign-up funnel dashboard',
    subtitle: 'analytics.example.com',
    href: '#',
  },
  {
    kind: 'image' as const,
    title: 'welcome-screen-v3.png',
    subtitle: '1.4 MB · Added 2 days ago',
    src: '/template-assets/light-home-square-1.png',
  },
  {
    kind: 'file' as const,
    title: 'Interview transcripts.pdf',
    subtitle: '820 KB · Added 3 days ago',
  },
];

const WATCHERS = [
  {name: 'Priya Shah'},
  {name: 'Marcus Chen'},
  {name: 'Sofia Alvarez'},
  {name: 'Jordan Blake'},
  {name: 'Lin Wei'},
  {name: 'Aisha Okafor'},
];

const LINKED_ITEMS = [
  {id: 'PLT-238', title: 'Track activation rate by acquisition channel'},
  {id: 'PLT-241', title: 'Welcome email A/B test — copy variants'},
];

type ActivityEntry =
  | {
      kind: 'comment';
      author: string;
      time: string;
      body: string;
      reactions?: number;
    }
  | {
      kind: 'event';
      author: string;
      time: string;
      body: string;
    };

const ACTIVITY: ActivityEntry[] = [
  {
    kind: 'event',
    author: 'Sofia Alvarez',
    time: '2026-03-02T14:12:00Z',
    body: 'created this task',
  },
  {
    kind: 'comment',
    author: 'Priya Shah',
    time: '2026-03-03T09:41:00Z',
    body: 'Finished the audit — three biggest friction points are the account form length, the empty first-run dashboard, and the tour tooltip cluster on step two. Full notes in the linked doc.',
    reactions: 4,
  },
  {
    kind: 'event',
    author: 'Marcus Chen',
    time: '2026-03-03T15:20:00Z',
    body: 'changed status from To Do to In Progress',
  },
  {
    kind: 'comment',
    author: 'Marcus Chen',
    time: '2026-03-04T10:05:00Z',
    body: 'Interviews wrapped. A consistent theme: people expect a personalized starting workspace and get an empty one. Suggest we scope a template step into variant A.',
    reactions: 2,
  },
  {
    kind: 'event',
    author: 'Sofia Alvarez',
    time: '2026-03-04T16:48:00Z',
    body: 'assigned this task to Priya Shah',
  },
];

// ─── Page Header ────────────────────────────────────────────────────────────
function PageHeader({
  status,
  onStatusChange,
  assignee,
  onAssigneeChange,
  priority,
  onPriorityChange,
  labels,
  onLabelsChange,
  isPanelOpen,
  onTogglePanel,
  isNarrow,
}: {
  status: string;
  onStatusChange: (value: string) => void;
  assignee: string;
  onAssigneeChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  labels: LabelOption[];
  onLabelsChange: (labels: LabelOption[]) => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  isNarrow: boolean;
}) {
  return (
    <LayoutHeader padding={4} hasDivider>
      <VStack gap={4}>
        <HStack gap={3} vAlign="start" hAlign="between">
          <VStack gap={2}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <Link type="supporting" color="secondary">
                <HStack as="span" gap={1} vAlign="center">
                  <Icon icon={ArrowLeftIcon} size="sm" />
                  All Tasks
                </HStack>
              </Link>
              <Divider orientation="vertical" style={{height: 12}} />
              <Text type="supporting" color="secondary">
                PLT-247
              </Text>
              <Divider orientation="vertical" style={{height: 12}} />
              <Text type="supporting" color="secondary">
                Platform / Onboarding
              </Text>
            </HStack>
            <Heading level={1} maxLines={2}>
              Refresh onboarding flow for workspaces
            </Heading>
          </VStack>
          {!isNarrow && (
            <HStack gap={1}>
              <IconButton
                label="Watch"
                variant="secondary"
                icon={<Icon icon={EyeIcon} size="sm" />}
              />
              <IconButton
                label="Share"
                variant="secondary"
                icon={<Icon icon={ShareIcon} size="sm" />}
              />
              <IconButton
                label="Notify"
                variant="secondary"
                icon={<Icon icon={BellIcon} size="sm" />}
              />
              <Button
                label={isPanelOpen ? 'Hide details' : 'Show details'}
                variant="secondary"
                icon={<Icon icon={ViewColumnsIcon} size="sm" />}
                onClick={onTogglePanel}
              />
            </HStack>
          )}
        </HStack>

        <HStack gap={4} vAlign="center" wrap="wrap">
          <HStack gap={1} vAlign="center" wrap="wrap">
            <Selector
              label="Status"
              isLabelHidden
              value={status}
              onChange={onStatusChange}
              options={STATUS_OPTIONS}
            />
            <Selector
              label="Assignee"
              isLabelHidden
              hasSearch
              searchPlaceholder="Search assignees..."
              value={assignee}
              onChange={onAssigneeChange}
              options={ASSIGNEE_OPTIONS}
            />
            <Selector
              label="Priority"
              isLabelHidden
              value={priority}
              onChange={onPriorityChange}
              options={PRIORITY_OPTIONS}
              renderValue={option => <PriorityBadge priority={option.value} />}
              renderOption={option => <PriorityBadge priority={option.value} />}
            />
            <Tokenizer
              label="Labels"
              isLabelHidden
              searchSource={LABEL_SEARCH_SOURCE}
              value={labels}
              onChange={onLabelsChange}
              renderToken={(label, onRemove) => (
                <Token
                  label={label.label}
                  color={label.color}
                  size="sm"
                  onRemove={onRemove}
                />
              )}
            />
          </HStack>
        </HStack>
      </VStack>
    </LayoutHeader>
  );
}

// ─── Description ────────────────────────────────────────────────────────────
function DescriptionSection() {
  return (
    <Section>
      <VStack gap={4}>
        <Heading level={2}>Description</Heading>
        <VStack gap={2}>
          <Text type="body">
            Reduce the drop-off between account creation and first meaningful
            action in a new workspace. Recent cohorts activate at 42 percent by
            day seven, and interview evidence points to an empty starting state
            and a long welcome sequence as the two largest contributors.
          </Text>
          <Text type="body">
            Ship a revised flow that shortens the sequence, seeds every new
            workspace with a sample project, and measures activation as the
            percentage of workspaces that reach three completed actions in the
            first three days.
          </Text>
          <Text type="body">&nbsp;</Text>
          <Heading level={4}>Success criteria</Heading>
          <List listStyle="disc" density="compact">
            <ListItem label="Day-seven activation rises from 42 to 55 percent for new workspaces in the variant." />
            <ListItem label="Median time to first completed action drops below eight minutes." />
            <ListItem label="No regression in day-thirty retention." />
          </List>
        </VStack>
      </VStack>
    </Section>
  );
}

// ─── Subtasks ───────────────────────────────────────────────────────────────
function SubtasksSection({
  subtasks,
  onToggle,
}: {
  subtasks: {
    id: number;
    title: string;
    isDone: boolean;
    assignee: string;
    due: string;
  }[];
  onToggle: (id: number) => void;
}) {
  const doneCount = subtasks.filter(s => s.isDone).length;
  return (
    <Section>
      <VStack gap={4}>
        <HStack vAlign="center" gap={2} hAlign="between" wrap="wrap">
          <Heading level={2}>Subtasks</Heading>
          <Button label="Add subtask" />
        </HStack>
        <HStack gap={3} vAlign="center">
          <Text type="supporting" color="secondary">
            {doneCount} of {subtasks.length} complete
          </Text>
          <StackItem size="fill">
            <ProgressBar
              label="Subtask progress"
              isLabelHidden
              value={(doneCount / subtasks.length) * 100}
              variant="success"
            />
          </StackItem>
        </HStack>
        <List>
          {subtasks.map(task => (
            <CheckboxListItem
              key={task.id}
              label={task.title}
              isChecked={task.isDone}
              onCheck={() => onToggle(task.id)}
              endContent={
                <HStack gap={2} vAlign="center">
                  <Timestamp
                    value={task.due}
                    format="date"
                    type="supporting"
                    color="secondary"
                  />
                  <Avatar name={task.assignee} size="sm" />
                </HStack>
              }
            />
          ))}
        </List>
      </VStack>
    </Section>
  );
}

// ─── Attachments ────────────────────────────────────────────────────────────
function AttachmentsSection() {
  return (
    <Section>
      <VStack gap={4}>
        <HStack vAlign="center" gap={2} wrap="wrap" hAlign="between">
          <Heading level={2}>Attachments</Heading>
          <Button label="Add attachment" />
        </HStack>
        <VStack gap={1}>
          {ATTACHMENTS.map((a, i) => (
            <ClickableCard
              key={i}
              label={`Open ${a.title}`}
              href={a.kind === 'link' ? a.href : '#'}
              variant="default"
              padding={3}>
              <HStack gap={4} vAlign="center">
                <AspectRatio
                  ratio={1}
                  fit="center"
                  style={{
                    width: 40,
                    backgroundColor: colorVars['--color-background-muted'],
                    borderRadius: radiusVars['--radius-element'],
                  }}>
                  <Icon
                    icon={
                      a.kind === 'link'
                        ? LinkIcon
                        : a.kind === 'image'
                          ? PhotoIcon
                          : DocumentTextIcon
                    }
                    size="lg"
                    color="secondary"
                  />
                </AspectRatio>
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text type="body" weight="semibold">
                      {a.title}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {a.subtitle}
                    </Text>
                  </VStack>
                </StackItem>
                <MoreMenu
                  presentation="adaptive"
                  label={`Actions for ${a.title}`}
                  items={[
                    {label: 'Edit', icon: PencilIcon, onClick: () => {}},
                    {
                      label: 'Delete',
                      icon: TrashIcon,
                      variant: 'destructive',
                      onClick: () => {},
                    },
                  ]}
                />
              </HStack>
            </ClickableCard>
          ))}
        </VStack>
      </VStack>
    </Section>
  );
}

// ─── Activity

// ─── Activity ───────────────────────────────────────────────────────────────
function ActivitySection({
  comment,
  onCommentChange,
}: {
  comment: string;
  onCommentChange: (v: string) => void;
}) {
  return (
    <Section>
      <VStack gap={6}>
        <Heading level={2}>Comments and activity</Heading>
        <VStack gap={6}>
          {ACTIVITY.map((entry, i) => (
            <HStack key={i} gap={3} vAlign="start">
              <Avatar name={entry.author} size="sm" />
              <StackItem size="fill">
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Text type="body" weight="semibold">
                      {entry.author}
                    </Text>
                    {entry.kind !== 'comment' && (
                      <Text type="supporting" color="secondary">
                        {entry.body}
                      </Text>
                    )}
                    <StackItem size="fill" />
                    <Timestamp
                      value={entry.time}
                      format="relative"
                      type="supporting"
                      color="secondary"
                    />
                  </HStack>
                  {entry.kind === 'comment' && (
                    <>
                      <Card variant="muted" padding={3}>
                        <Text type="body">{entry.body}</Text>
                      </Card>
                      <Link href="#" color="secondary">
                        Reply
                      </Link>
                    </>
                  )}
                </VStack>
              </StackItem>
            </HStack>
          ))}
        </VStack>
        <Divider />
        <VStack gap={2} hAlign="stretch">
          <TextArea
            width="100%"
            label="Add a comment"
            isLabelHidden
            placeholder="Write a comment…"
            value={comment}
            onChange={onCommentChange}
            rows={3}
          />
          <HStack gap={2} hAlign="end">
            <Button label="Cancel" variant="ghost" />
            <Button
              label="Comment"
              variant="primary"
              isDisabled={comment.trim().length === 0}
            />
          </HStack>
        </VStack>
      </VStack>
    </Section>
  );
}

// ─── Rail (details) ─────────────────────────────────────────────────────────
function PanelContent({
  status,
  priority,
  assignee,
  labels,
}: {
  status: string;
  priority: string;
  assignee: string;
  labels: LabelOption[];
}) {
  const statusOption =
    STATUS_OPTIONS.find(option => option.value === status) ?? STATUS_OPTIONS[0];
  const assigneeOption =
    ASSIGNEE_OPTIONS.find(option => option.value === assignee) ??
    ASSIGNEE_OPTIONS[0];

  return (
    <VStack gap={10}>
      <VStack gap={4}>
        <Heading level={3}>Details</Heading>
        <MetadataList>
          <MetadataListItem label="Status">
            <HStack gap={2} vAlign="center">
              {statusOption.icon}
              <Text type="body">{statusOption.label}</Text>
            </HStack>
          </MetadataListItem>
          <MetadataListItem label="Priority">
            <PriorityBadge priority={priority} />
          </MetadataListItem>
          <MetadataListItem label="Assignee">
            <HStack gap={2} vAlign="center">
              {assigneeOption.icon}
              <Text type="body">{assigneeOption.label}</Text>
            </HStack>
          </MetadataListItem>
          <MetadataListItem label="Reporter">
            <HStack gap={2} vAlign="center">
              <Avatar name="Sofia Alvarez" size="xsm" />
              <Text type="body">Sofia Alvarez</Text>
            </HStack>
          </MetadataListItem>
          <MetadataListItem label="Start date">
            <Timestamp
              value="2026-03-02"
              format="date"
              type="body"
              color="primary"
            />
          </MetadataListItem>
          <MetadataListItem label="Due date">
            <Timestamp
              value="2026-03-18"
              format="date"
              type="body"
              color="primary"
            />
          </MetadataListItem>
          <MetadataListItem label="Sprint">
            <Text type="body">Sprint 24 · Mar 2 – Mar 15</Text>
          </MetadataListItem>
          <MetadataListItem label="Parent">
            <Link href="#">PLT-192 · Activation initiative</Link>
          </MetadataListItem>
          <MetadataListItem label="Labels">
            <HStack gap={1} wrap="wrap">
              {labels.map(label => (
                <Token
                  key={label.id}
                  color={label.color}
                  label={label.label}
                  size="sm"
                />
              ))}
            </HStack>
          </MetadataListItem>
          <MetadataListItem label="Team">
            <Text type="body">Platform · Growth pod</Text>
          </MetadataListItem>
        </MetadataList>
      </VStack>

      <VStack gap={4}>
        <HStack vAlign="center" gap={2} hAlign="between">
          <Heading level={3}>Watchers</Heading>
          <Button label="Add" />
        </HStack>
        <AvatarGroup size="md">
          {WATCHERS.map(w => (
            <Avatar key={w.name} name={w.name} />
          ))}
        </AvatarGroup>
      </VStack>

      <VStack gap={4}>
        <Heading level={3}>Linked items</Heading>
        <VStack gap={1}>
          {LINKED_ITEMS.map(item => (
            <ClickableCard
              key={item.id}
              label={`Open ${item.id}: ${item.title}`}
              href="#"
              variant="default"
              padding={3}>
              <VStack gap={0}>
                <Text type="supporting" color="secondary">
                  {item.id}
                </Text>
                <Text type="body" weight="semibold">
                  {item.title}
                </Text>
              </VStack>
            </ClickableCard>
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
}

function RightPanel({
  status,
  priority,
  assignee,
  labels,
}: {
  status: string;
  priority: string;
  assignee: string;
  labels: LabelOption[];
}) {
  return (
    <LayoutPanel width={340} padding={4} hasDivider role="complementary">
      <PanelContent
        status={status}
        priority={priority}
        assignee={assignee}
        labels={labels}
      />
    </LayoutPanel>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function TaskDetailTemplate() {
  const [status, setStatus] = useState('in_progress');
  const [assignee, setAssignee] = useState('priya-shah');
  const [priority, setPriority] = useState('high');
  const [labels, setLabels] = useState<LabelOption[]>(LABEL_OPTIONS);
  const [comment, setComment] = useState('');
  const [subtasks, setSubtasks] = useState(SUBTASKS);
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [isPanelDialogOpen, setPanelDialogOpen] = useState(false);

  const isPanelShown = isNarrow ? isPanelDialogOpen : showSidePanel;
  const togglePanel = () =>
    isNarrow
      ? setPanelDialogOpen(prev => !prev)
      : setShowSidePanel(prev => !prev);

  const toggleSubtask = (id: number) =>
    setSubtasks(prev =>
      prev.map(s => (s.id === id ? {...s, isDone: !s.isDone} : s)),
    );

  return (
    <>
      <Layout
        height="fill"
        contentWidth={1260}
        defaultHasDividers
        header={
          <PageHeader
            status={status}
            onStatusChange={setStatus}
            assignee={assignee}
            onAssigneeChange={setAssignee}
            priority={priority}
            onPriorityChange={setPriority}
            labels={labels}
            onLabelsChange={setLabels}
            isPanelOpen={isPanelShown}
            onTogglePanel={togglePanel}
            isNarrow={isNarrow}
          />
        }
        content={
          <LayoutContent role="main">
            <VStack gap={10}>
              <DescriptionSection />
              <SubtasksSection subtasks={subtasks} onToggle={toggleSubtask} />
              <AttachmentsSection />
              <Divider />
              <ActivitySection comment={comment} onCommentChange={setComment} />
            </VStack>
          </LayoutContent>
        }
        end={
          !isNarrow && showSidePanel ? (
            <RightPanel
              status={status}
              priority={priority}
              assignee={assignee}
              labels={labels}
            />
          ) : undefined
        }
      />
      <Dialog
        variant="fullscreen"
        isOpen={isNarrow && isPanelDialogOpen}
        onOpenChange={setPanelDialogOpen}>
        <Layout
          header={
            <DialogHeader
              title="Task details"
              onOpenChange={setPanelDialogOpen}
            />
          }
          content={
            <LayoutContent padding={4}>
              <PanelContent
                status={status}
                priority={priority}
                assignee={assignee}
                labels={labels}
              />
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}
