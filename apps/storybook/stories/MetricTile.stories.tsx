// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSMetricTile} from '@xds/core/MetricTile';

const meta: Meta<typeof XDSMetricTile> = {
  title: 'Core/MetricTile',
  component: XDSMetricTile,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'number',
      description: 'The metric value to display',
    },
    title: {
      control: 'text',
      description: 'Metric title text',
    },
    subtitle: {
      control: 'text',
      description: 'Optional metric subtitle',
    },
    format: {
      control: 'select',
      options: ['prettyMetric', 'prettyInt', 'prettyBytes'],
      description: 'Number formatter',
    },
    size: {
      control: 'select',
      options: ['large', 'small'],
      description: 'Size variant',
    },
    titlePosition: {
      control: 'select',
      options: ['top', 'bottom'],
      description: 'Title placement relative to value',
    },
    deltaTrend: {
      control: 'select',
      options: [undefined, 'upward', 'downward', 'flat'],
      description: 'Trend direction for delta indicator',
    },
    deltaFavorability: {
      control: 'select',
      options: [undefined, 'favorable', 'unfavorable', 'neutral'],
      description: 'Favorability for delta color coding',
    },
    deltaValue: {
      control: 'text',
      description: 'Delta value text',
    },
    hasPadding: {
      control: 'boolean',
      description: 'Whether to add padding',
    },
    hasTabularNumbers: {
      control: 'boolean',
      description: 'Use tabular (fixed-width) numbers',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSMetricTile>;

export const Default: Story = {
  args: {
    value: 1250,
    title: 'Revenue',
  },
};

export const WithSubtitle: Story = {
  args: {
    value: 1250,
    title: 'Revenue',
    subtitle: 'This month',
  },
};

export const LargeSize: Story = {
  render: () => (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: 'auto auto auto auto',
        gap: '8px',
      }}>
      <XDSMetricTile value={26} title="KPI Title" />
      <XDSMetricTile value={26} title="KPI Title" subtitle="Subtitle" />
      <XDSMetricTile value={26} title="KPI Title" titlePosition="top" />
      <XDSMetricTile
        value={26}
        title="KPI Title"
        subtitle="Subtitle"
        titlePosition="top"
      />
    </div>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: 'auto auto auto auto',
        gap: '8px',
      }}>
      <XDSMetricTile value={26} title="KPI Title" size="small" />
      <XDSMetricTile
        value={26}
        title="KPI Title"
        subtitle="Subtitle"
        size="small"
      />
      <XDSMetricTile
        value={26}
        title="KPI Title"
        titlePosition="top"
        size="small"
      />
      <XDSMetricTile
        value={26}
        title="KPI Title"
        subtitle="Subtitle"
        titlePosition="top"
        size="small"
      />
    </div>
  ),
};

export const Formats: Story = {
  render: () => (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: 'auto auto auto auto',
        gap: '8px',
      }}>
      <XDSMetricTile
        value={123456789}
        format="prettyMetric"
        title="prettyMetric (Default)"
      />
      <XDSMetricTile value={123456789} format="prettyInt" title="prettyInt" />
      <XDSMetricTile
        value={123456789}
        format="prettyBytes"
        title="prettyBytes"
      />
      <XDSMetricTile value={50} format={value => value + '%'} title="Custom" />
    </div>
  ),
};

export const WithDelta: Story = {
  render: () => (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: 'auto auto auto',
        gap: '8px',
      }}>
      <XDSMetricTile
        value={1250}
        title="Revenue"
        subtitle="This month"
        deltaValue="+12.5%"
        deltaTrend="upward"
        deltaFavorability="favorable"
      />
      <XDSMetricTile
        value={850}
        title="Active Users"
        subtitle="Last 7 days"
        deltaValue="-5.2%"
        deltaTrend="downward"
        deltaFavorability="unfavorable"
      />
      <XDSMetricTile
        value={42}
        title="Response Time"
        subtitle="Average (ms)"
        deltaValue="0%"
        deltaTrend="flat"
        deltaFavorability="neutral"
      />
    </div>
  ),
};

export const SmallWithDelta: Story = {
  render: () => (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: 'auto auto auto',
        gap: '8px',
      }}>
      <XDSMetricTile
        value={234}
        title="Error Rate"
        subtitle="Per 1000 requests"
        deltaValue="+3.1%"
        deltaTrend="upward"
        deltaFavorability="unfavorable"
        size="small"
      />
      <XDSMetricTile
        value={9500}
        title="Page Views"
        subtitle="This week"
        deltaTrend="upward"
        deltaFavorability="favorable"
        size="small"
      />
      <XDSMetricTile
        value={127}
        title="Conversion Rate"
        subtitle="Last 30 days"
        deltaValue="+2.8%"
        deltaFavorability="favorable"
        size="small"
      />
    </div>
  ),
};

export const NullValue: Story = {
  args: {
    value: null,
    title: 'Pending Metric',
    subtitle: 'Data not available',
  },
};

export const WithHovercard: Story = {
  args: {
    value: 1250,
    title: 'Revenue',
    subtitle: 'This month',
    hovercard: (
      <div style={{maxWidth: 280, padding: 8}}>
        <strong>Revenue</strong>
        <p style={{margin: '8px 0 0'}}>
          Total revenue across all product lines for the current calendar month.
          Data sourced from the billing pipeline, updated daily.
        </p>
      </div>
    ),
  },
};

export const TabularNumbers: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
      <XDSMetricTile value={1111} title="Ones" hasTabularNumbers />
      <XDSMetricTile value={8888} title="Eights" hasTabularNumbers />
      <XDSMetricTile value={1234} title="Mixed" hasTabularNumbers />
    </div>
  ),
};
