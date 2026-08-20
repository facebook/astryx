// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {DateInputMobile} from '@astryxdesign/lab';
import type {ISODateString} from '@astryxdesign/core/utils';
import {Text} from '@astryxdesign/core/Text';

const styles = stylex.create({
  /**
   * A phone-width column. The component is fluid, but every story here is
   * about touch, so they are all framed at a handset width.
   */
  phone: {
    inlineSize: 360,
    maxInlineSize: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  readout: {
    minBlockSize: 20,
  },
});

const meta: Meta<typeof DateInputMobile> = {
  title: 'Lab/DateInputMobile',
  component: DateInputMobile,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Touch counterpart to DateInput. Months scroll continuously in a ' +
          'fixed-height, snap-paged surface; tapping the header title swaps ' +
          'the calendar for month and year wheels.',
      },
    },
  },
  argTypes: {
    presentation: {control: 'select', options: ['sheet', 'inline']},
    weekStartsOn: {control: {type: 'number', min: 0, max: 6}},
    format: {
      control: 'select',
      options: ['date', 'date_long', 'date_weekday', 'system_date'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateInputMobile>;

// ============================================================
// SHEET (default) — a field that opens the picker in a BottomSheet
// ============================================================

export const Default: Story = {
  name: 'Sheet',
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>();
    return (
      <div {...stylex.props(styles.phone)}>
        <DateInputMobile
          label="Event date"
          description="Tap to open the picker, then scroll through months."
          value={date}
          onChange={setDate}
          hasClear
        />
        <Text size="supporting" color="secondary" xstyle={styles.readout}>
          {date ?? 'no date selected'}
        </Text>
      </div>
    );
  },
};

// ============================================================
// INLINE — the picker surface on its own
// ============================================================

export const Inline: Story = {
  name: 'Inline',
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>('2026-03-21');
    return (
      <div {...stylex.props(styles.phone)}>
        <DateInputMobile
          label="Event date"
          presentation="inline"
          value={date}
          onChange={setDate}
        />
        <Text size="supporting" color="secondary" xstyle={styles.readout}>
          {date ?? 'no date selected'}
        </Text>
      </div>
    );
  },
};

// ============================================================
// WHEELS — same surface, opened on the month/year wheels
// ============================================================

export const MonthYearWheels: Story = {
  name: 'Month / year wheels',
  parameters: {
    docs: {
      description: {
        story:
          'Tap "March 2026" in the header. The calendar is replaced in place ' +
          'by two wheels — the surface never changes height — and each wheel ' +
          'commits when it comes to rest.',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>('2026-03-21');
    return (
      <div {...stylex.props(styles.phone)}>
        <DateInputMobile
          label="Event date"
          isLabelHidden
          presentation="inline"
          value={date}
          onChange={setDate}
        />
      </div>
    );
  },
};

// ============================================================
// BOUNDED — min/max clamp the scroller AND the wheels
// ============================================================

export const Bounded: Story = {
  name: 'Bounded range',
  parameters: {
    docs: {
      description: {
        story:
          'With min and max, the scroller stops at the bounds instead of ' +
          'running a century in each direction, and out-of-range months and ' +
          'years stay on the wheels but cannot be committed.',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>('2026-03-10');
    return (
      <div {...stylex.props(styles.phone)}>
        <DateInputMobile
          label="Delivery date"
          description="Between Feb 1 and May 31, 2026."
          presentation="inline"
          min="2026-02-01"
          max="2026-05-31"
          value={date}
          onChange={setDate}
        />
      </div>
    );
  },
};

// ============================================================
// CONSTRAINED — weekdays only, Monday-first
// ============================================================

export const WeekdaysOnly: Story = {
  name: 'Weekdays only, Monday first',
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>();
    return (
      <div {...stylex.props(styles.phone)}>
        <DateInputMobile
          label="Appointment"
          description="Weekends are not bookable."
          presentation="inline"
          weekStartsOn={1}
          dateConstraints={[date => date.getDay() !== 0 && date.getDay() !== 6]}
          value={date}
          onChange={setDate}
        />
      </div>
    );
  },
};

// ============================================================
// STATUS — the field carries Field's status treatment
// ============================================================

export const WithStatus: Story = {
  name: 'With status',
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>();
    return (
      <div {...stylex.props(styles.phone)}>
        <DateInputMobile
          label="Event date"
          isRequired
          value={date}
          onChange={setDate}
          status={
            date == null
              ? {type: 'error', message: 'Pick a date to continue'}
              : undefined
          }
        />
      </div>
    );
  },
};
