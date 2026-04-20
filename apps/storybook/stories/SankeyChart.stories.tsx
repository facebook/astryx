import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSSankeyChart,
  XDSSankeyLink,
  XDSSankeyNode,
  XDSSankeyLabel,
  type SankeyNode,
  type SankeyLink,
} from '@xds/lab';
import {XDSStack, XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core/Text';

const meta: Meta = {
  title: 'Lab/XDSSankeyChart',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// --- Data ---

const funnelNodes: SankeyNode[] = [
  {id: 'visitors', label: 'Visitors', value: 52000, color: [0.65, 0.2, 270]},
  {id: 'signups', label: 'Sign Ups', value: 28000, color: [0.6, 0.17, 235]},
  {id: 'bounced', label: 'Bounced', value: 24000, color: [0.55, 0.14, 350]},
  {id: 'activated', label: 'Activated', value: 19500, color: [0.62, 0.16, 190]},
  {id: 'dormant', label: 'Dormant', value: 8500, color: [0.55, 0.13, 50]},
  {
    id: 'subscribed',
    label: 'Subscribed',
    value: 12400,
    color: [0.64, 0.18, 155],
  },
  {id: 'churned', label: 'Churned', value: 7100, color: [0.54, 0.15, 20]},
];

const funnelLinks: SankeyLink[] = [
  {source: 'visitors', target: 'signups', value: 28000},
  {source: 'visitors', target: 'bounced', value: 24000},
  {source: 'signups', target: 'activated', value: 19500},
  {source: 'signups', target: 'dormant', value: 8500},
  {source: 'activated', target: 'subscribed', value: 12400},
  {source: 'activated', target: 'churned', value: 7100},
];

const funnelColumns = [
  ['visitors'],
  ['signups', 'bounced'],
  ['activated', 'dormant'],
  ['subscribed', 'churned'],
];

/** Classic diverging funnel — marketing acquisition to revenue */
export const ConversionFunnel: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Conversion Funnel</XDSHeading>
      <XDSText type="body" color="secondary">
        User journey · Last 30 days
      </XDSText>
      <XDSSankeyChart
        nodes={funnelNodes}
        links={funnelLinks}
        columns={funnelColumns}
        height={340}>
        <XDSSankeyLink />
        <XDSSankeyNode />
        <XDSSankeyLabel />
      </XDSSankeyChart>
    </XDSStack>
  ),
};

// --- Revenue Sources (converging) ---

const revenueNodes: SankeyNode[] = [
  {id: 'organic', label: 'Organic', value: 18000, color: [0.62, 0.17, 155]},
  {id: 'paid', label: 'Paid Ads', value: 22000, color: [0.6, 0.18, 240]},
  {id: 'referral', label: 'Referral', value: 12000, color: [0.58, 0.15, 40]},
  {id: 'direct', label: 'Direct', value: 8000, color: [0.55, 0.14, 300]},
  {id: 'web', label: 'Web', value: 32000, color: [0.61, 0.16, 210]},
  {id: 'mobile', label: 'Mobile', value: 20000, color: [0.59, 0.16, 170]},
  {id: 'other', label: 'Other', value: 8000, color: [0.5, 0.11, 320]},
  {id: 'sub', label: 'Subscription', value: 38000, color: [0.64, 0.19, 260]},
  {id: 'onetime', label: 'One-time', value: 14000, color: [0.58, 0.15, 50]},
  {
    id: 'enterprise',
    label: 'Enterprise',
    value: 8000,
    color: [0.56, 0.13, 190],
  },
];

const revenueLinks: SankeyLink[] = [
  {source: 'organic', target: 'web', value: 12000},
  {source: 'organic', target: 'mobile', value: 6000},
  {source: 'paid', target: 'web', value: 14000},
  {source: 'paid', target: 'mobile', value: 8000},
  {source: 'referral', target: 'web', value: 4000},
  {source: 'referral', target: 'mobile', value: 6000},
  {source: 'referral', target: 'other', value: 2000},
  {source: 'direct', target: 'web', value: 2000},
  {source: 'direct', target: 'other', value: 6000},
  {source: 'web', target: 'sub', value: 22000},
  {source: 'web', target: 'onetime', value: 6000},
  {source: 'web', target: 'enterprise', value: 4000},
  {source: 'mobile', target: 'sub', value: 14000},
  {source: 'mobile', target: 'onetime', value: 4000},
  {source: 'mobile', target: 'enterprise', value: 2000},
  {source: 'other', target: 'sub', value: 2000},
  {source: 'other', target: 'onetime', value: 4000},
  {source: 'other', target: 'enterprise', value: 2000},
];

const revenueColumns = [
  ['organic', 'paid', 'referral', 'direct'],
  ['web', 'mobile', 'other'],
  ['sub', 'onetime', 'enterprise'],
];

/** Converging Sankey — multiple sources flowing to fewer destinations */
export const RevenueFlow: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Revenue Sources</XDSHeading>
      <XDSText type="body" color="secondary">
        Channel attribution · March 2026
      </XDSText>
      <XDSSankeyChart
        nodes={revenueNodes}
        links={revenueLinks}
        columns={revenueColumns}
        height={400}>
        <XDSSankeyLink opacity={0.65} tension={0.55} />
        <XDSSankeyNode />
        <XDSSankeyLabel />
      </XDSSankeyChart>
    </XDSStack>
  ),
};

/** Minimal — auto-detected columns with no explicit assignment */
export const AutoColumns: Story = {
  render: () => {
    const nodes: SankeyNode[] = [
      {id: 'a', label: 'Source A', value: 100},
      {id: 'b', label: 'Source B', value: 80},
      {id: 'mid', label: 'Middle', value: 180},
      {id: 'out1', label: 'Output 1', value: 120},
      {id: 'out2', label: 'Output 2', value: 60},
    ];
    const links: SankeyLink[] = [
      {source: 'a', target: 'mid', value: 100},
      {source: 'b', target: 'mid', value: 80},
      {source: 'mid', target: 'out1', value: 120},
      {source: 'mid', target: 'out2', value: 60},
    ];

    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Auto Column Detection</XDSHeading>
        <XDSText type="body" color="secondary">
          No explicit columns — topologically sorted
        </XDSText>
        <XDSSankeyChart nodes={nodes} links={links} height={280}>
          <XDSSankeyLink tension={0.6} />
          <XDSSankeyNode />
          <XDSSankeyLabel showPercent={false} />
        </XDSSankeyChart>
      </XDSStack>
    );
  },
};

/** High tension — very curvy ribbons */
export const HighTension: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>High Tension (0.7)</XDSHeading>
      <XDSText type="body" color="secondary">
        Curvier bezier ribbons
      </XDSText>
      <XDSSankeyChart
        nodes={funnelNodes}
        links={funnelLinks}
        columns={funnelColumns}
        height={340}>
        <XDSSankeyLink tension={0.7} />
        <XDSSankeyNode />
        <XDSSankeyLabel />
      </XDSSankeyChart>
    </XDSStack>
  ),
};
