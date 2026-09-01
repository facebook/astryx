// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * A triage queue that reads as a list and behaves as a table: no header row, no
 * dividers, every row a doorway into a conversation.
 *
 * An inbox is the case where the table's chrome works against it. A header row
 * labels columns you never compare across rows — nobody scans an inbox by
 * sender, they scan it for the one thread that matters — and row dividers chop
 * a continuous queue into a grid. What is left is a table's real value: a fixed
 * column grid so sender, subject, tags, and time land in the same place on
 * every row, which is what makes the list scannable at all. Strip the chrome,
 * keep the grid.
 *
 * ## Extending this template
 *
 * **Headerless means children mode, and children mode has a real cost.** In
 * data-driven mode `BaseTable` renders `{hasColumns && <TableHeader>}` — there
 * is no way to suppress it while keeping columns. Passing `children` replaces
 * the entire header-and-body render, which is what makes a headerless table
 * possible and, in the same stroke, means render plugins never run. Your rows
 * go straight to the `<table>`, so `useTableSelection` cannot inject its
 * checkbox column and `useTableRowStatus` cannot inject its status gutter.
 *
 * **The headless state hooks still work, and that is the way through.**
 * `useTableSelectionState` is pure state: it owns the selected set, computes
 * select-all and indeterminate across the *visible* rows, and correctly freezes
 * rows you mark unselectable. This template drives its own checkbox cells from
 * that state. You lose the plugin's rendering, not its logic — so do not
 * hand-roll the selection maths, which is where the bugs are (select-all over a
 * filtered list, indeterminate, locked rows surviving a deselect-all).
 *
 * **The column grid is a `colgroup`, not a header.** `resolveColumnWidths`
 * turns the same column definitions the data path would use into `<col>`
 * styles, so alignment survives without a `<thead>`. Keep the definitions even
 * though nothing renders their `header` — they are the contract that every row
 * agrees to, and the place to change a width.
 *
 * **Unread is weight, not colour.** Unread rows render their sender and subject
 * semibold and show an accent dot; read rows go quiet. Encoding it as colour
 * alone would fail anyone who cannot distinguish it, and the dot carries a text
 * label for assistive tech. The preview text stays secondary in both states so
 * the subject keeps the emphasis.
 *
 * **The toolbar swaps rather than grows.** With nothing selected it holds the
 * scope filters; with a selection it becomes bulk actions and a count. Showing
 * both at once is the common version and it is worse — the actions are dead
 * controls most of the time, and the row of filters competes with them exactly
 * when the user has committed to an action. Swapping keeps one job on screen.
 *
 * **Rows are activatable, so they are buttons.** Each row wires `onClick` plus
 * Enter and Space through `onKeyDown` and carries `tabIndex={0}`, because a
 * `<tr>` has no built-in activation. Do not put the checkbox click inside that
 * handler — the cell stops propagation so selecting never opens the thread.
 */

import {useMemo, useState} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  pixel,
  proportional,
  resolveColumnWidths,
  useTableSelectionState,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  CheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

// ============= DATA =============

type Priority = 'urgent' | 'high' | 'normal';

interface Conversation extends Record<string, unknown> {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  tags: string[];
  receivedAt: string;
  isUnread: boolean;
  priority: Priority;
  assignee: string | null;
  /** Locked threads are mid-escalation and cannot be bulk-actioned. */
  isLocked?: boolean;
}

const PRIORITY_VARIANT: Record<Priority, 'error' | 'warning' | 'neutral'> = {
  urgent: 'error',
  high: 'warning',
  normal: 'neutral',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High priority',
  normal: 'Normal priority',
};

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c-01',
    sender: 'Priya Raman',
    subject: 'Checkout returns 502 for EU customers',
    preview:
      'Started around 09:40 UTC. Roughly one in five card payments fails at the confirm step…',
    tags: ['Billing', 'Escalated'],
    receivedAt: '9:52 AM',
    isUnread: true,
    priority: 'urgent',
    assignee: null,
    isLocked: true,
  },
  {
    id: 'c-02',
    sender: 'Marcus Feld',
    subject: 'SSO metadata rotation — need new certificate',
    preview:
      'Our IdP certificate expires Friday. Can you confirm the fingerprint before we cut over?',
    tags: ['Identity'],
    receivedAt: '9:31 AM',
    isUnread: true,
    priority: 'high',
    assignee: null,
  },
  {
    id: 'c-03',
    sender: 'Dana Osei',
    subject: 'Re: Bulk export finished but the file is empty',
    preview:
      'Thanks — re-running with the date filter cleared did produce rows this time.',
    tags: ['Exports'],
    receivedAt: '8:58 AM',
    isUnread: true,
    priority: 'normal',
    assignee: 'You',
  },
  {
    id: 'c-04',
    sender: 'Tomás Ibarra',
    subject: 'Webhook retries stopped after the 3rd attempt',
    preview:
      'We expected five retries with backoff. Logs show three and then nothing for order 88214.',
    tags: ['Webhooks', 'Bug'],
    receivedAt: '8:14 AM',
    isUnread: false,
    priority: 'high',
    assignee: 'You',
  },
  {
    id: 'c-05',
    sender: 'Hannah Lindqvist',
    subject: 'Requesting a sandbox with production-shaped data',
    preview:
      'Happy to sign whatever is needed. We mostly need realistic invoice volumes.',
    tags: ['Sales'],
    receivedAt: 'Yesterday',
    isUnread: false,
    priority: 'normal',
    assignee: null,
  },
  {
    id: 'c-06',
    sender: 'Owen Baptiste',
    subject: 'Seat count says 145 but we only provisioned 120',
    preview:
      'Finance flagged the discrepancy on the March invoice. Can we reconcile before the 30th?',
    tags: ['Billing'],
    receivedAt: 'Yesterday',
    isUnread: false,
    priority: 'high',
    assignee: 'You',
  },
  {
    id: 'c-07',
    sender: 'Aiko Tanaka',
    subject: 'Docs: the rate-limit page contradicts the API response header',
    preview:
      'Page says 600/min, header reports 300/min on our plan. One of them is wrong.',
    tags: ['Docs'],
    receivedAt: 'Yesterday',
    isUnread: false,
    priority: 'normal',
    assignee: null,
  },
  {
    id: 'c-08',
    sender: 'Reuben Cole',
    subject: 'Re: Scheduled maintenance window confirmation',
    preview: 'Confirmed for Sunday 02:00–04:00 UTC. Nothing further needed.',
    tags: ['Ops'],
    receivedAt: 'Mon',
    isUnread: false,
    priority: 'normal',
    assignee: 'You',
  },
  {
    id: 'c-09',
    sender: 'Sofia Marchetti',
    subject: 'Feature request: per-workspace retention policy',
    preview:
      'Our legal team needs 30-day retention on one workspace and 400 on another.',
    tags: ['Feature request'],
    receivedAt: 'Mon',
    isUnread: false,
    priority: 'normal',
    assignee: null,
  },
];

type Scope = 'all' | 'unread' | 'mine';

const SCOPES: {value: Scope; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'unread', label: 'Unread'},
  {value: 'mine', label: 'Assigned to me'},
];

// ============= COLUMN GRID =============

// The same column definitions the data-driven path would take. Nothing renders
// their `header` — they exist to produce the colgroup below, which is what
// holds every row on the same grid without a <thead>.
const columns: TableColumn<Conversation>[] = [
  {key: 'select', width: pixel(44)},
  // Wide enough for the dot plus both cell paddings. Any narrower and the
  // dot overflows, which makes `textOverflow="truncate"` paint an ellipsis
  // next to it even though the cell holds no text.
  {key: 'status', width: pixel(44)},
  {key: 'sender', width: pixel(200)},
  {key: 'subject', width: proportional(3)},
  {key: 'tags', width: pixel(210)},
  {key: 'received', width: pixel(96)},
];

const COLUMN_WIDTHS = resolveColumnWidths(columns);

// ============= PAGE =============

export default function SupportInboxTemplate() {
  const [scope, setScope] = useState<Scope>('all');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const visible = useMemo(() => {
    if (scope === 'unread') {
      return CONVERSATIONS.filter(item => item.isUnread);
    }
    if (scope === 'mine') {
      return CONVERSATIONS.filter(item => item.assignee === 'You');
    }
    return CONVERSATIONS;
  }, [scope]);

  // Headless: this hook is pure selection state, so it works in children mode
  // where the selection *plugin* would not. It scopes select-all to the rows
  // passed in, which is why `visible` goes in rather than the full list.
  const {selectionConfig} = useTableSelectionState<Conversation>({
    data: visible,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
    getIsItemEnabled: item => !item.isLocked,
  });

  const selectedCount = selectedKeys.size;
  const hasSelection = selectedCount > 0;
  const unreadCount = CONVERSATIONS.filter(item => item.isUnread).length;

  const clearSelection = () => setSelectedKeys(new Set());

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider padding={4}>
          <VStack gap={4}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0.5}>
                  <Heading level={1}>Inbox</Heading>
                  <Text type="supporting">
                    {unreadCount} unread of {CONVERSATIONS.length} conversations
                  </Text>
                </VStack>
              </StackItem>
              <Button
                label="Refresh"
                variant="ghost"
                icon={<Icon icon={ArrowPathIcon} size="sm" />}
              />
            </HStack>

            {/* One job on screen: scope filters, or bulk actions — never both.
                Select-all sits outside the swap because a headerless table has
                no header cell to host it, and it has to stay reachable before
                the first row is picked. */}
            <HStack gap={3} vAlign="center" wrap="wrap">
              <CheckboxInput
                label="Select all conversations"
                isLabelHidden
                value={
                  selectionConfig.getIsIndeterminate?.() === true
                    ? 'indeterminate'
                    : selectionConfig.getIsAllSelected()
                }
                onChange={checked =>
                  selectionConfig.onSelectAll({isAllSelected: checked})
                }
              />
              {hasSelection ? (
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text weight="semibold">{selectedCount} selected</Text>
                  <Button
                    label="Archive"
                    variant="secondary"
                    icon={<Icon icon={ArchiveBoxIcon} size="sm" />}
                  />
                  <Button
                    label="Mark read"
                    variant="secondary"
                    icon={<Icon icon={CheckIcon} size="sm" />}
                  />
                  <Button
                    label="Assign"
                    variant="secondary"
                    icon={<Icon icon={UserPlusIcon} size="sm" />}
                  />
                  <Button
                    label="Clear selection"
                    variant="ghost"
                    onClick={clearSelection}
                  />
                </HStack>
              ) : (
                <SegmentedControl
                  label="Filter conversations"
                  value={scope}
                  onChange={value => setScope(value as Scope)}>
                  {SCOPES.map(option => (
                    <SegmentedControlItem
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    />
                  ))}
                </SegmentedControl>
              )}
            </HStack>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0} isScrollable>
          {visible.length === 0 ? (
            <VStack padding={6}>
              <EmptyState
                title="Nothing here"
                description="No conversation matches this filter."
                actions={
                  <Button
                    label="Show all"
                    variant="secondary"
                    onClick={() => setScope('all')}
                  />
                }
              />
            </VStack>
          ) : (
            <Table
              density="balanced"
              dividers="none"
              hasHover
              textOverflow="truncate">
              <colgroup>
                {columns.map(column => (
                  <col
                    key={column.key}
                    style={COLUMN_WIDTHS.columns.get(column.key)?.style}
                  />
                ))}
              </colgroup>
              {/* No TableHeader. Children mode is the only way to omit it. */}
              <TableBody>
                {visible.map(item => {
                  const isSelected = selectionConfig.getIsItemSelected(item);
                  return (
                    <TableRow
                      key={item.id}
                      tabIndex={0}
                      aria-selected={isSelected}
                      onClick={() => {
                        // Open the thread. A row is not a button element, so
                        // activation is wired by hand — see onKeyDown.
                      }}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                        }
                      }}>
                      {/* Selecting must never open the thread, so the cell
                          swallows the click before it reaches the row. */}
                      <TableCell onClick={event => event.stopPropagation()}>
                        <CheckboxInput
                          label={`Select conversation from ${item.sender}`}
                          isLabelHidden
                          value={isSelected}
                          isDisabled={item.isLocked === true}
                          disabledMessage="This thread is mid-escalation"
                          onChange={checked =>
                            selectionConfig.onSelectItem({
                              item,
                              isSelected: checked,
                            })
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {item.priority === 'normal' ? null : (
                          <StatusDot
                            variant={PRIORITY_VARIANT[item.priority]}
                            label={PRIORITY_LABEL[item.priority]}
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <HStack gap={2} vAlign="center">
                          <Avatar
                            name={item.sender}
                            size="sm"
                            tooltip={false}
                          />
                          <Text
                            maxLines={1}
                            weight={item.isUnread ? 'semibold' : 'normal'}>
                            {item.sender}
                          </Text>
                        </HStack>
                      </TableCell>

                      <TableCell>
                        <HStack gap={2} vAlign="center">
                          {item.isUnread && (
                            <StatusDot variant="accent" label="Unread" />
                          )}
                          <Text
                            maxLines={1}
                            weight={item.isUnread ? 'semibold' : 'normal'}>
                            {item.subject}
                          </Text>
                          {/* The preview absorbs the leftover width and
                              truncates, so the subject keeps its natural size
                              instead of both shrinking in step. */}
                          <StackItem size="fill">
                            <Text maxLines={1} color="secondary">
                              — {item.preview}
                            </Text>
                          </StackItem>
                        </HStack>
                      </TableCell>

                      <TableCell>
                        <HStack gap={1.5} vAlign="center">
                          {item.tags.map(tag => (
                            <Token key={tag} size="sm" label={tag} />
                          ))}
                        </HStack>
                      </TableCell>

                      <TableCell>
                        <Text
                          display="block"
                          justify="end"
                          color="secondary"
                          weight={item.isUnread ? 'semibold' : 'normal'}>
                          {item.receivedAt}
                        </Text>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </LayoutContent>
      }
    />
  );
}
