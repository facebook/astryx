// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Scheduling — a calendar-driven interview agenda.
 *
 * Frame:
 *   header | calendar selector (fill) | selected-day agenda 400px
 *
 * Responsive contract:
 *   > 1200px — two calendar months and an end agenda panel
 *   768–1199px — one calendar month and an end agenda panel
 *   < 768px — one calendar month with the agenda below it
 *
 * Calendar remains a date picker rather than an event grid. Selecting a date
 * updates the adjacent semantic list; filters refine that list without changing
 * the selected date.
 */

import {useState, type FormEvent} from 'react';

import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Calendar, type ISODateString} from '@astryxdesign/core/Calendar';
import {Center} from '@astryxdesign/core/Center';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TimeInput, type ISOTimeString} from '@astryxdesign/core/TimeInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {CalendarDaysIcon, PlusIcon} from '@heroicons/react/24/outline';

type ScheduleStatus = 'confirmed' | 'tentative' | 'cancelled';

interface ScheduleEntry {
  id: string;
  title: string;
  interviewType: string;
  date: ISODateString;
  startTime: ISOTimeString;
  endTime: ISOTimeString;
  interviewer: string;
  status: ScheduleStatus;
}

interface ScheduleDraft {
  title: string;
  date: ISODateString | undefined;
  startTime: ISOTimeString | undefined;
  endTime: ISOTimeString | undefined;
  interviewer: string;
}

const INITIAL_DATE: ISODateString = '2026-08-12';
const CREATE_FORM_ID = 'create-schedule-entry';

function isoTime(value: string): ISOTimeString {
  return value as ISOTimeString;
}

const INTERVIEWER_OPTIONS = [
  {value: 'priya-shah', label: 'Priya Shah'},
  {value: 'marcus-webb', label: 'Marcus Webb'},
  {value: 'ana-duarte', label: 'Ana Duarte'},
  {value: 'devon-park', label: 'Devon Park'},
];

const INTERVIEWER_FILTER_OPTIONS = [
  {value: 'all', label: 'All interviewers'},
  ...INTERVIEWER_OPTIONS,
];

const STATUS_FILTER_OPTIONS = [
  {value: 'all', label: 'All statuses'},
  {value: 'confirmed', label: 'Confirmed'},
  {value: 'tentative', label: 'Tentative'},
  {value: 'cancelled', label: 'Cancelled'},
];

const STATUS_LABEL: Record<ScheduleStatus, string> = {
  confirmed: 'Confirmed',
  tentative: 'Tentative',
  cancelled: 'Cancelled',
};

const STATUS_VARIANT: Record<
  ScheduleStatus,
  'success' | 'warning' | 'neutral'
> = {
  confirmed: 'success',
  tentative: 'warning',
  cancelled: 'neutral',
};

const INITIAL_ENTRIES: ScheduleEntry[] = [
  {
    id: 'interview-101',
    title: 'Maya Patel',
    interviewType: 'Frontend systems interview',
    date: '2026-08-12',
    startTime: isoTime('09:00'),
    endTime: isoTime('09:45'),
    interviewer: 'priya-shah',
    status: 'confirmed',
  },
  {
    id: 'interview-102',
    title: 'Noah Williams',
    interviewType: 'Product design interview',
    date: '2026-08-12',
    startTime: isoTime('11:30'),
    endTime: isoTime('12:15'),
    interviewer: 'ana-duarte',
    status: 'tentative',
  },
  {
    id: 'interview-103',
    title: 'Sofia Ramirez',
    interviewType: 'Engineering manager interview',
    date: '2026-08-12',
    startTime: isoTime('14:00'),
    endTime: isoTime('14:45'),
    interviewer: 'marcus-webb',
    status: 'confirmed',
  },
  {
    id: 'interview-104',
    title: 'Ethan Okafor',
    interviewType: 'Portfolio review',
    date: '2026-08-13',
    startTime: isoTime('10:00'),
    endTime: isoTime('10:45'),
    interviewer: 'devon-park',
    status: 'confirmed',
  },
  {
    id: 'interview-105',
    title: 'Amelia Chen',
    interviewType: 'Frontend systems interview',
    date: '2026-08-14',
    startTime: isoTime('15:00'),
    endTime: isoTime('15:45'),
    interviewer: 'priya-shah',
    status: 'cancelled',
  },
];

function interviewerName(value: string): string {
  return (
    INTERVIEWER_OPTIONS.find(option => option.value === value)?.label ?? value
  );
}

function dateFromISO(value: ISODateString): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatFullDate(value: ISODateString): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(dateFromISO(value));
}

function formatShortDate(value: ISODateString): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(dateFromISO(value));
}

function Agenda({
  selectedDate,
  dayEntries,
  visibleEntries,
  hasActiveFilters,
  onCreate,
  onClearFilters,
}: {
  selectedDate: ISODateString;
  dayEntries: ScheduleEntry[];
  visibleEntries: ScheduleEntry[];
  hasActiveFilters: boolean;
  onCreate: () => void;
  onClearFilters: () => void;
}) {
  const resultLabel = `${visibleEntries.length} ${
    visibleEntries.length === 1 ? 'interview' : 'interviews'
  } on ${formatShortDate(selectedDate)}`;

  return (
    <VStack gap={4}>
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={2}>{formatFullDate(selectedDate)}</Heading>
            <Text
              type="supporting"
              color="secondary"
              aria-live="polite"
              aria-atomic="true">
              {resultLabel}
            </Text>
          </VStack>
        </StackItem>
        <Button
          label="Schedule interview"
          tooltip="Schedule interview"
          variant="secondary"
          size="sm"
          isIconOnly
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          onClick={onCreate}
        />
      </HStack>

      {visibleEntries.length > 0 ? (
        <List
          density="balanced"
          hasDividers
          header={
            <Text type="label" color="secondary">
              Interview schedule
            </Text>
          }>
          {visibleEntries.map(entry => (
            <ListItem
              key={entry.id}
              label={entry.title}
              description={
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    {entry.interviewType}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {interviewerName(entry.interviewer)}
                  </Text>
                </VStack>
              }
              startContent={<Avatar name={entry.title} size="md" />}
              endContent={
                <VStack gap={1} hAlign="end">
                  <HStack gap={1} vAlign="center">
                    <StatusDot
                      variant={STATUS_VARIANT[entry.status]}
                      label={STATUS_LABEL[entry.status]}
                      aria-hidden="true"
                    />
                    <Text type="supporting" color="secondary">
                      {STATUS_LABEL[entry.status]}
                    </Text>
                  </HStack>
                  <HStack gap={1} vAlign="center">
                    <Timestamp
                      value={`${entry.date}T${entry.startTime}:00`}
                      format="time"
                      color="secondary"
                    />
                    <Text type="supporting" color="secondary">
                      –
                    </Text>
                    <Timestamp
                      value={`${entry.date}T${entry.endTime}:00`}
                      format="time"
                      color="secondary"
                    />
                  </HStack>
                </VStack>
              }
            />
          ))}
        </List>
      ) : dayEntries.length > 0 && hasActiveFilters ? (
        <EmptyState
          title="No matching interviews"
          description="The current filters exclude this day's interview schedule."
          headingLevel={3}
          isCompact
          icon={<Icon icon={CalendarDaysIcon} size="lg" />}
          actions={
            <Button
              label="Clear filters"
              variant="secondary"
              onClick={onClearFilters}
            />
          }
        />
      ) : (
        <EmptyState
          title="No interviews scheduled"
          description={`There are no interviews on ${formatFullDate(selectedDate)}.`}
          headingLevel={3}
          isCompact
          icon={<Icon icon={CalendarDaysIcon} size="lg" />}
          actions={
            <Button
              label="Schedule interview"
              variant="primary"
              onClick={onCreate}
            />
          }
        />
      )}
    </VStack>
  );
}

export default function SchedulingPage() {
  const [selectedDate, setSelectedDate] = useState<ISODateString>(INITIAL_DATE);
  const [interviewerFilter, setInterviewerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entries, setEntries] = useState<ScheduleEntry[]>(INITIAL_ENTRIES);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [draft, setDraft] = useState<ScheduleDraft>({
    title: '',
    date: INITIAL_DATE,
    startTime: isoTime('09:00'),
    endTime: isoTime('09:45'),
    interviewer: INTERVIEWER_OPTIONS[0].value,
  });

  const isPhone = useMediaQuery('(max-width: 767px)');
  const isMedium = useMediaQuery('(max-width: 1199px)');

  const dayEntries = entries
    .filter(entry => entry.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const visibleEntries = dayEntries.filter(
    entry =>
      (interviewerFilter === 'all' ||
        entry.interviewer === interviewerFilter) &&
      (statusFilter === 'all' || entry.status === statusFilter),
  );

  const hasActiveFilters =
    interviewerFilter !== 'all' || statusFilter !== 'all';

  const titleError =
    hasSubmitted && !draft.title.trim() ? 'Enter a candidate name.' : undefined;
  const dateError =
    hasSubmitted && !draft.date ? 'Choose an interview date.' : undefined;
  const startTimeError =
    hasSubmitted && !draft.startTime ? 'Choose a start time.' : undefined;
  const endTimeError =
    hasSubmitted && !draft.endTime
      ? 'Choose an end time.'
      : hasSubmitted &&
          draft.startTime &&
          draft.endTime &&
          draft.endTime <= draft.startTime
        ? 'End time must be later than start time.'
        : undefined;

  const clearFilters = () => {
    setInterviewerFilter('all');
    setStatusFilter('all');
  };

  const openCreateDialog = () => {
    setDraft({
      title: '',
      date: selectedDate,
      startTime: isoTime('09:00'),
      endTime: isoTime('09:45'),
      interviewer:
        interviewerFilter === 'all'
          ? INTERVIEWER_OPTIONS[0].value
          : interviewerFilter,
    });
    setHasSubmitted(false);
    setIsCreateOpen(true);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setIsCreateOpen(isOpen);
    if (!isOpen) {
      setHasSubmitted(false);
    }
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);

    const {date, startTime, endTime} = draft;
    if (
      !draft.title.trim() ||
      !date ||
      !startTime ||
      !endTime ||
      endTime <= startTime
    ) {
      return;
    }

    setEntries(current => [
      ...current,
      {
        id: `interview-${current.length + 101}`,
        title: draft.title.trim(),
        interviewType: 'Candidate interview',
        date,
        startTime,
        endTime,
        interviewer: draft.interviewer,
        status: 'tentative',
      },
    ]);
    setSelectedDate(date);

    if (
      interviewerFilter !== 'all' &&
      interviewerFilter !== draft.interviewer
    ) {
      setInterviewerFilter('all');
    }
    if (statusFilter !== 'all' && statusFilter !== 'tentative') {
      setStatusFilter('all');
    }

    handleDialogOpenChange(false);
  };

  const agenda = (
    <Agenda
      selectedDate={selectedDate}
      dayEntries={dayEntries}
      visibleEntries={visibleEntries}
      hasActiveFilters={hasActiveFilters}
      onCreate={openCreateDialog}
      onClearFilters={clearFilters}
    />
  );

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0}>
                  <Heading level={1}>Scheduling</Heading>
                  <Text type="supporting" color="secondary">
                    Coordinate interview loops across the recruiting team.
                  </Text>
                </VStack>
              </StackItem>
              <Button
                label="Schedule interview"
                variant="primary"
                icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
                onClick={openCreateDialog}
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={isPhone ? 4 : 6}>
            <VStack gap={6}>
              <HStack gap={3} vAlign="end" wrap="wrap">
                <Selector
                  label="Interviewer"
                  options={INTERVIEWER_FILTER_OPTIONS}
                  value={interviewerFilter}
                  onChange={setInterviewerFilter}
                  width={isPhone ? '100%' : 240}
                />
                <Selector
                  label="Status"
                  options={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  width={isPhone ? '100%' : 200}
                />
              </HStack>

              <Center axis="horizontal" width="100%">
                <Calendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  numberOfMonths={isMedium ? 1 : 2}
                  min="2026-08-01"
                  max="2026-09-30"
                  weekStartsOn="mon"
                />
              </Center>

              {isPhone && (
                <>
                  <Divider />
                  {agenda}
                </>
              )}
            </VStack>
          </LayoutContent>
        }
        end={
          isPhone ? undefined : (
            <LayoutPanel
              width={400}
              padding={4}
              hasDivider
              label="Selected day agenda"
              role="complementary">
              {agenda}
            </LayoutPanel>
          )
        }
      />

      <Dialog
        isOpen={isCreateOpen}
        onOpenChange={handleDialogOpenChange}
        purpose="form"
        width={560}
        maxHeight="90vh">
        <Layout
          header={
            <DialogHeader
              title="Schedule interview"
              subtitle={
                draft.date
                  ? `Add an interview to ${formatFullDate(draft.date)}.`
                  : 'Choose a date for the interview.'
              }
              onOpenChange={handleDialogOpenChange}
              hasDivider
            />
          }
          content={
            <LayoutContent padding={4}>
              <form id={CREATE_FORM_ID} onSubmit={handleCreate}>
                <FormLayout>
                  <TextInput
                    label="Candidate name"
                    placeholder="Enter candidate name"
                    value={draft.title}
                    onChange={title =>
                      setDraft(current => ({...current, title}))
                    }
                    isRequired
                    status={
                      titleError
                        ? {type: 'error', message: titleError}
                        : undefined
                    }
                  />
                  <DateInput
                    label="Interview date"
                    value={draft.date}
                    onChange={date => setDraft(current => ({...current, date}))}
                    min="2026-08-01"
                    max="2026-09-30"
                    isRequired
                    status={
                      dateError
                        ? {type: 'error', message: dateError}
                        : undefined
                    }
                  />
                  <FormLayout direction={isPhone ? 'vertical' : 'horizontal'}>
                    <TimeInput
                      label="Start time"
                      value={draft.startTime}
                      onChange={startTime =>
                        setDraft(current => ({...current, startTime}))
                      }
                      hourFormat="12h"
                      increment={15}
                      isRequired
                      status={
                        startTimeError
                          ? {type: 'error', message: startTimeError}
                          : undefined
                      }
                    />
                    <TimeInput
                      label="End time"
                      value={draft.endTime}
                      onChange={endTime =>
                        setDraft(current => ({...current, endTime}))
                      }
                      hourFormat="12h"
                      increment={15}
                      isRequired
                      status={
                        endTimeError
                          ? {type: 'error', message: endTimeError}
                          : undefined
                      }
                    />
                  </FormLayout>
                  <Selector
                    label="Interviewer"
                    options={INTERVIEWER_OPTIONS}
                    value={draft.interviewer}
                    onChange={interviewer =>
                      setDraft(current => ({...current, interviewer}))
                    }
                    isRequired
                  />
                </FormLayout>
              </form>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Cancel"
                  variant="secondary"
                  type="button"
                  onClick={() => handleDialogOpenChange(false)}
                />
                <Button
                  label="Schedule interview"
                  variant="primary"
                  type="submit"
                  form={CREATE_FORM_ID}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
    </>
  );
}
