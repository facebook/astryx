// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {useMediaQuery} from '@astryxdesign/core/hooks';
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {Icon} from '@astryxdesign/core/Icon';
import {Divider} from '@astryxdesign/core/Divider';
import {Card} from '@astryxdesign/core/Card';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {
  ArrowLeftIcon,
  PaperClipIcon,
  LinkIcon,
  DocumentTextIcon,
  ViewColumnsIcon,
  ArrowUpTrayIcon,
  BellIcon,
  ShareIcon,
  EyeIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';

// ─── Task data ──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  {value: 'todo', label: 'To Do'},
  {value: 'in_progress', label: 'In Progress'},
  {value: 'in_review', label: 'In Review'},
  {value: 'done', label: 'Done'},
];

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
  isPanelOpen,
  onTogglePanel,
  isNarrow,
}: {
  status: string;
  onStatusChange: (value: string) => void;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  isNarrow: boolean;
}) {
  return (
    <LayoutHeader hasDivider padding={4}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="start">
          <StackItem size="fill">
            <VStack gap={1}>
              <Link href="#" color="secondary">
                <HStack gap={1} vAlign="center">
                  <Icon icon={ArrowLeftIcon} size="sm" color="inherit" />
                  All tasks
                </HStack>
              </Link>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Text type="supporting" color="secondary">
                  PLT-247
                </Text>
                <Text type="supporting" color="secondary">
                  ·
                </Text>
                <Text type="supporting" color="secondary">
                  Platform / Onboarding
                </Text>
              </HStack>
              <Heading level={1} maxLines={2}>
                Refresh the onboarding flow for new workspaces
              </Heading>
            </VStack>
          </StackItem>
          {!isNarrow && (
            <HStack gap={2}>
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

        <HStack gap={3} vAlign="center" wrap="wrap">
          <Selector
            label="Status"
            isLabelHidden
            variant="ghost"
            size="md"
            value={status}
            onChange={onStatusChange}
            options={STATUS_OPTIONS}
          />
          <Divider orientation="vertical" />
          <HStack gap={2} vAlign="center">
            <Avatar name="Priya Shah" size="sm" />
            <Text type="body">Priya Shah</Text>
          </HStack>
          <Divider orientation="vertical" />
          <HStack gap={2} vAlign="center">
            <Text type="body" color="secondary">
              Due
            </Text>
            <Timestamp
              value="2026-03-18"
              format="date"
              type="body"
              color="primary"
            />
          </HStack>
          <Divider orientation="vertical" />
          <Badge variant="warning" label="High priority" />
          <Token color="purple" label="Onboarding" size="sm" />
          <Token color="blue" label="Q1 goal" size="sm" />
        </HStack>
      </VStack>
    </LayoutHeader>
  );
}

// ─── Description ────────────────────────────────────────────────────────────
function DescriptionSection() {
  return (
    <Section>
      <VStack gap={3}>
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
          <VStack gap={1}>
            <Text type="body" weight="semibold">
              Success criteria
            </Text>
            <VStack gap={0.5}>
              <Text type="body">
                · Day-seven activation rises from 42 to 55 percent for new
                workspaces in the variant.
              </Text>
              <Text type="body">
                · Median time to first completed action drops below eight
                minutes.
              </Text>
              <Text type="body">· No regression in day-thirty retention.</Text>
            </VStack>
          </VStack>
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
      <VStack gap={3}>
        <HStack vAlign="center" gap={2} wrap="wrap">
          <StackItem size="fill">
            <Heading level={2}>Subtasks</Heading>
          </StackItem>
          <Button label="Add subtask" variant="ghost" size="sm" />
        </HStack>
        <VStack gap={2}>
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
          <VStack gap={0}>
            {subtasks.map((task, i) => (
              <VStack key={task.id} gap={0}>
                {i > 0 && <Divider />}
                <HStack gap={3} vAlign="center" padding={2}>
                  <Button
                    label={task.isDone ? 'Mark incomplete' : 'Mark complete'}
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    icon={
                      task.isDone ? (
                        <Badge variant="success" label="✓" />
                      ) : (
                        <Badge variant="neutral" label=" " />
                      )
                    }
                    onClick={() => onToggle(task.id)}
                  />
                  <StackItem size="fill">
                    <Text
                      type="body"
                      color={task.isDone ? 'secondary' : 'primary'}>
                      {task.title}
                    </Text>
                  </StackItem>
                  <Timestamp
                    value={task.due}
                    format="date"
                    type="supporting"
                    color="secondary"
                  />
                  <Avatar name={task.assignee} size="sm" />
                </HStack>
              </VStack>
            ))}
          </VStack>
        </VStack>
      </VStack>
    </Section>
  );
}

// ─── Attachments ────────────────────────────────────────────────────────────
function AttachmentsSection() {
  return (
    <Section>
      <VStack gap={3}>
        <HStack vAlign="center" gap={2} wrap="wrap">
          <StackItem size="fill">
            <Heading level={2}>Attachments</Heading>
          </StackItem>
          <Button
            label="Add attachment"
            variant="ghost"
            size="sm"
            icon={<Icon icon={ArrowUpTrayIcon} size="sm" />}
          />
        </HStack>
        <VStack gap={2}>
          {ATTACHMENTS.map((a, i) => (
            <Card key={i} variant="muted" padding={3}>
              <HStack gap={3} vAlign="center">
                {a.kind === 'image' ? (
                  <Thumbnail src={a.src} alt={a.title} label={a.title} />
                ) : (
                  <Icon
                    icon={a.kind === 'link' ? LinkIcon : DocumentTextIcon}
                    size="lg"
                    color="secondary"
                  />
                )}
                <StackItem size="fill">
                  <VStack gap={0}>
                    {a.kind === 'link' ? (
                      <Link href={a.href}>{a.title}</Link>
                    ) : (
                      <Text type="body" weight="semibold">
                        {a.title}
                      </Text>
                    )}
                    <Text type="supporting" color="secondary">
                      {a.subtitle}
                    </Text>
                  </VStack>
                </StackItem>
                <IconButton
                  label="More"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={PaperClipIcon} size="sm" />}
                />
              </HStack>
            </Card>
          ))}
        </VStack>
      </VStack>
    </Section>
  );
}

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
      <VStack gap={3}>
        <Heading level={2}>Comments and activity</Heading>
        <HStack gap={3} vAlign="start">
          <Avatar name="You" size="md" />
          <StackItem size="fill">
            <VStack gap={2} hAlign="stretch">
              <TextArea
                label="Add a comment"
                isLabelHidden
                placeholder="Write a comment…"
                value={comment}
                onChange={onCommentChange}
                rows={3}
              />
              <HStack gap={2}>
                <StackItem size="fill" />
                <Button label="Cancel" variant="ghost" size="sm" />
                <Button
                  label="Comment"
                  variant="primary"
                  size="sm"
                  isDisabled={comment.trim().length === 0}
                />
              </HStack>
            </VStack>
          </StackItem>
        </HStack>
        <Divider />
        <VStack gap={4}>
          {ACTIVITY.map((entry, i) =>
            entry.kind === 'comment' ? (
              <HStack key={i} gap={3} vAlign="start">
                <Avatar name={entry.author} size="md" />
                <StackItem size="fill">
                  <VStack gap={1}>
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      <Text type="body" weight="semibold">
                        {entry.author}
                      </Text>
                      <Timestamp
                        value={entry.time}
                        format="relative"
                        type="supporting"
                        color="secondary"
                      />
                    </HStack>
                    <Card variant="muted" padding={3}>
                      <Text type="body">{entry.body}</Text>
                    </Card>
                    <HStack gap={3} vAlign="center">
                      <HStack gap={1} vAlign="center">
                        <Icon
                          icon={FaceSmileIcon}
                          size="xsm"
                          color="secondary"
                        />
                        <Text type="supporting" color="secondary">
                          {entry.reactions ?? 0}
                        </Text>
                      </HStack>
                      <Link href="#" color="secondary">
                        Reply
                      </Link>
                    </HStack>
                  </VStack>
                </StackItem>
              </HStack>
            ) : (
              <HStack key={i} gap={3} vAlign="center">
                <Avatar name={entry.author} size="sm" />
                <Text type="supporting" color="secondary">
                  <Text type="supporting" color="primary" weight="semibold">
                    {entry.author}
                  </Text>{' '}
                  {entry.body}
                </Text>
                <StackItem size="fill" />
                <Timestamp
                  value={entry.time}
                  format="relative"
                  type="supporting"
                  color="secondary"
                />
              </HStack>
            ),
          )}
        </VStack>
      </VStack>
    </Section>
  );
}

// ─── Rail (details) ─────────────────────────────────────────────────────────
function PanelContent() {
  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <Heading level={4}>Details</Heading>
        <MetadataList>
          <MetadataListItem label="Status">
            <Badge variant="info" label="In Progress" />
          </MetadataListItem>
          <MetadataListItem label="Priority">
            <Badge variant="warning" label="High" />
          </MetadataListItem>
          <MetadataListItem label="Assignee">
            <HStack gap={2} vAlign="center">
              <Avatar name="Priya Shah" size="xsm" />
              <Text type="body">Priya Shah</Text>
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
              <Token color="purple" label="Onboarding" size="sm" />
              <Token color="blue" label="Q1 goal" size="sm" />
              <Token color="green" label="Growth" size="sm" />
            </HStack>
          </MetadataListItem>
          <MetadataListItem label="Team">
            <Text type="body">Platform · Growth pod</Text>
          </MetadataListItem>
        </MetadataList>
      </VStack>

      <VStack gap={2}>
        <HStack vAlign="center" gap={2}>
          <StackItem size="fill">
            <Heading level={4}>Watchers</Heading>
          </StackItem>
          <Button label="Add" variant="ghost" size="sm" />
        </HStack>
        <AvatarGroup size="sm">
          {WATCHERS.map(w => (
            <Avatar key={w.name} name={w.name} />
          ))}
        </AvatarGroup>
      </VStack>

      <VStack gap={2}>
        <Heading level={4}>Linked items</Heading>
        <VStack gap={2}>
          {LINKED_ITEMS.map(item => (
            <Card key={item.id} variant="muted" padding={3}>
              <VStack gap={0}>
                <Text type="supporting" color="secondary">
                  {item.id}
                </Text>
                <Link href="#">{item.title}</Link>
              </VStack>
            </Card>
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
}

function RightPanel() {
  return (
    <LayoutPanel width={340} padding={4} role="complementary">
      <PanelContent />
    </LayoutPanel>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function TaskDetailTemplate() {
  const [status, setStatus] = useState('in_progress');
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
        contentWidth={1000}
        defaultHasDividers
        header={
          <PageHeader
            status={status}
            onStatusChange={setStatus}
            isPanelOpen={isPanelShown}
            onTogglePanel={togglePanel}
            isNarrow={isNarrow}
          />
        }
        content={
          <LayoutContent role="main">
            <VStack gap={4}>
              <DescriptionSection />
              <SubtasksSection subtasks={subtasks} onToggle={toggleSubtask} />
              <AttachmentsSection />
              <ActivitySection comment={comment} onCommentChange={setComment} />
            </VStack>
          </LayoutContent>
        }
        end={!isNarrow && showSidePanel ? <RightPanel /> : undefined}
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
              <PanelContent />
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}
