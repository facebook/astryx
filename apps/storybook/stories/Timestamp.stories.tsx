// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Text} from '@astryxdesign/core/Text';

const meta: Meta<typeof Timestamp> = {
  title: 'Core/Timestamp',
  component: Timestamp,
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: [
        'relative',
        'auto',
        'date',
        'date_long',
        'date_weekday',
        'date_time',
        'time',
        'system_date',
        'system_date_time',
        'system_time',
      ],
      description: 'Display format',
    },
    type: {
      control: 'select',
      options: [
        'body',
        'large',
        'label',
        'supporting',
        'code',
        'display-1',
        'display-2',
        'display-3',
      ],
      description: 'Semantic text type (from Text)',
    },
    size: {
      control: 'select',
      options: [
        '4xs',
        '3xs',
        '2xs',
        'xsm',
        'sm',
        'base',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
      ],
      description: 'Font size override',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'disabled',
        'placeholder',
        'accent',
        'inherit',
      ],
      description: 'Text color',
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight',
    },
    isLive: {
      control: 'boolean',
      description: 'Live-update relative time',
    },
    hasTooltip: {
      control: 'boolean',
      description: 'Show tooltip on hover',
    },
    isTimezoneShown: {
      control: 'boolean',
      description: 'Append timezone abbreviation',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Timestamp>;

export const Default: Story = {
  args: {
    value: '2026-03-25T12:00:00Z',
  },
};

export const RelativeFormat: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-start',
      }}>
      <Timestamp value={Date.now() / 1000 - 5} format="relative" />
      <Timestamp value={Date.now() / 1000 - 120} format="relative" />
      <Timestamp value={Date.now() / 1000 - 3600} format="relative" />
      <Timestamp value={Date.now() / 1000 - 86400} format="relative" />
      <Timestamp value={Date.now() / 1000 - 259200} format="relative" />
      <Timestamp value={Date.now() / 1000 - 90 * 86400} format="relative" />
      <Timestamp value={Date.now() / 1000 - 730 * 86400} format="relative" />
    </div>
  ),
};

export const DateFormat: Story = {
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date',
  },
};

export const DateLongFormat: Story = {
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_long',
  },
};

export const DateWeekdayFormat: Story = {
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_weekday',
  },
};

export const DateTimeFormat: Story = {
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_time',
  },
};

export const DateTimeWithTimezone: Story = {
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'date_time',
    isTimezoneShown: true,
  },
};

export const TimeFormat: Story = {
  args: {
    value: '2026-02-19T17:00:00Z',
    format: 'time',
  },
};

export const SystemFormats: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <div>
        <Text type="label" color="secondary">
          system_date:{' '}
        </Text>
        <Timestamp
          value="2026-02-19T17:00:00Z"
          format="system_date"
          type="code"
        />
      </div>
      <div>
        <Text type="label" color="secondary">
          system_date_time:{' '}
        </Text>
        <Timestamp
          value="2026-02-19T17:00:00Z"
          format="system_date_time"
          type="code"
        />
      </div>
      <div>
        <Text type="label" color="secondary">
          system_time:{' '}
        </Text>
        <Timestamp
          value="2026-02-19T17:00:00Z"
          format="system_time"
          type="code"
        />
      </div>
    </div>
  ),
};

export const AllFormats: Story = {
  render: () => {
    const date = '2026-02-19T17:00:00Z';
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        <div>
          <Text type="label" color="secondary">
            relative:{' '}
          </Text>
          <Timestamp value={Date.now() / 1000 - 3600} format="relative" />
        </div>
        <div>
          <Text type="label" color="secondary">
            date:{' '}
          </Text>
          <Timestamp value={date} format="date" />
        </div>
        <div>
          <Text type="label" color="secondary">
            date_long:{' '}
          </Text>
          <Timestamp value={date} format="date_long" />
        </div>
        <div>
          <Text type="label" color="secondary">
            date_weekday:{' '}
          </Text>
          <Timestamp value={date} format="date_weekday" />
        </div>
        <div>
          <Text type="label" color="secondary">
            date_time:{' '}
          </Text>
          <Timestamp value={date} format="date_time" />
        </div>
        <div>
          <Text type="label" color="secondary">
            time:{' '}
          </Text>
          <Timestamp value={date} format="time" />
        </div>
        <div>
          <Text type="label" color="secondary">
            system_date:{' '}
          </Text>
          <Timestamp value={date} format="system_date" type="code" />
        </div>
        <div>
          <Text type="label" color="secondary">
            system_date_time:{' '}
          </Text>
          <Timestamp value={date} format="system_date_time" type="code" />
        </div>
        <div>
          <Text type="label" color="secondary">
            system_time:{' '}
          </Text>
          <Timestamp value={date} format="system_time" type="code" />
        </div>
      </div>
    );
  },
};

export const LiveUpdating: Story = {
  args: {
    value: Date.now() / 1000 - 5,
    format: 'relative',
    isLive: true,
  },
};

export const TextTypes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="date_time"
        type="supporting"
      />
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" type="body" />
      <Timestamp value="2026-02-19T17:00:00Z" format="date_time" type="large" />
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="date_time"
        type="label"
        weight="semibold"
      />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="date_time"
        color="primary"
      />
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="date_time"
        color="secondary"
      />
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="date_time"
        color="disabled"
      />
      <Timestamp
        value="2026-02-19T17:00:00Z"
        format="date_time"
        color="accent"
      />
    </div>
  ),
};

export const AutoFormat: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <div>
        <Text type="label" color="secondary">
          Recent (relative):{' '}
        </Text>
        <Timestamp value={Date.now() / 1000 - 3600} format="auto" />
      </div>
      <div>
        <Text type="label" color="secondary">
          Old (date_time):{' '}
        </Text>
        <Timestamp value="2025-01-01T12:00:00Z" format="auto" />
      </div>
    </div>
  ),
};

export const FutureDates: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-start',
      }}>
      <Timestamp value={Date.now() / 1000 + 60} format="relative" />
      <Timestamp value={Date.now() / 1000 + 3600} format="relative" />
      <Timestamp value={Date.now() / 1000 + 86400} format="relative" />
    </div>
  ),
};
