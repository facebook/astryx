import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSSankeyChart,
  XDSSankeyLink,
  XDSSankeyNode,
  XDSSankeyLabel,
  XDSSankeyGrid,
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

/** Classic diverging funnel with grid lines */
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
        height={360}>
        <XDSSankeyGrid />
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
        height={420}>
        <XDSSankeyGrid />
        <XDSSankeyLink opacity={0.65} tension={0.55} />
        <XDSSankeyNode />
        <XDSSankeyLabel />
      </XDSSankeyChart>
    </XDSStack>
  ),
};

/** Minimal — auto-detected columns, no grid */
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

/** Many columns — demonstrates horizontal scroll with minColumnWidth */
export const ManyColumns: Story = {
  render: () => {
    const nodes: SankeyNode[] = [
      {id: 'awareness', label: 'Awareness', value: 100000},
      {id: 'interest', label: 'Interest', value: 68000},
      {id: 'dropped1', label: 'Dropped', value: 32000, color: [0.5, 0.12, 350]},
      {id: 'consideration', label: 'Consideration', value: 45000},
      {
        id: 'dropped2',
        label: 'Distracted',
        value: 23000,
        color: [0.5, 0.12, 350],
      },
      {id: 'intent', label: 'Intent', value: 32000},
      {
        id: 'dropped3',
        label: 'Abandoned',
        value: 13000,
        color: [0.5, 0.12, 350],
      },
      {id: 'evaluation', label: 'Evaluation', value: 24000},
      {id: 'dropped4', label: 'Lost', value: 8000, color: [0.5, 0.12, 350]},
      {
        id: 'purchase',
        label: 'Purchase',
        value: 18000,
        color: [0.64, 0.18, 155],
      },
      {id: 'dropped5', label: 'Rejected', value: 6000, color: [0.5, 0.12, 350]},
    ];
    const links: SankeyLink[] = [
      {source: 'awareness', target: 'interest', value: 68000},
      {source: 'awareness', target: 'dropped1', value: 32000},
      {source: 'interest', target: 'consideration', value: 45000},
      {source: 'interest', target: 'dropped2', value: 23000},
      {source: 'consideration', target: 'intent', value: 32000},
      {source: 'consideration', target: 'dropped3', value: 13000},
      {source: 'intent', target: 'evaluation', value: 24000},
      {source: 'intent', target: 'dropped4', value: 8000},
      {source: 'evaluation', target: 'purchase', value: 18000},
      {source: 'evaluation', target: 'dropped5', value: 6000},
    ];
    const columns = [
      ['awareness'],
      ['interest', 'dropped1'],
      ['consideration', 'dropped2'],
      ['intent', 'dropped3'],
      ['evaluation', 'dropped4'],
      ['purchase', 'dropped5'],
    ];

    return (
      <XDSStack direction="vertical" gap={4}>
        <XDSHeading level={3}>Deep Funnel (6 stages)</XDSHeading>
        <XDSText type="body" color="secondary">
          Scrolls horizontally when columns exceed container width
        </XDSText>
        <div
          style={{
            maxWidth: 600,
            border: '1px solid var(--color-border, #ddd)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
          <XDSSankeyChart
            nodes={nodes}
            links={links}
            columns={columns}
            height={360}
            minColumnWidth={160}>
            <XDSSankeyGrid />
            <XDSSankeyLink />
            <XDSSankeyNode />
            <XDSSankeyLabel />
          </XDSSankeyChart>
        </div>
      </XDSStack>
    );
  },
};

// --- Business Funnel: blue main flow, gray exits ---

// oklch approximations of XDS data tokens:
// blue categorical: #0171E3 ≈ oklch(0.55 0.19 255)
// blue-3: #2694FE ≈ oklch(0.65 0.17 250)
// gray-4: #5D6C7B ≈ oklch(0.50 0.02 240)
// gray-3: #AFB9C4 ≈ oklch(0.77 0.02 240)

const bizNodes: SankeyNode[] = [
  {id: 'visitors', label: 'Visitors', value: 84200, color: [0.55, 0.19, 255]},
  {id: 'signups', label: 'Signed Up', value: 42100, color: [0.58, 0.18, 255]},
  {id: 'bounce', label: 'Bounced', value: 42100, color: [0.5, 0.02, 240]},
  {id: 'onboarded', label: 'Onboarded', value: 28700, color: [0.61, 0.17, 252]},
  {id: 'stalled', label: 'Stalled', value: 13400, color: [0.5, 0.02, 240]},
  {id: 'active', label: 'Active Users', value: 21500, color: [0.64, 0.16, 250]},
  {id: 'inactive', label: 'Inactive', value: 7200, color: [0.5, 0.02, 240]},
  {id: 'paying', label: 'Paying', value: 15200, color: [0.67, 0.15, 248]},
  {id: 'free', label: 'Free Tier', value: 6300, color: [0.5, 0.02, 240]},
];

const bizLinks: SankeyLink[] = [
  {source: 'visitors', target: 'signups', value: 42100},
  {source: 'visitors', target: 'bounce', value: 42100},
  {source: 'signups', target: 'onboarded', value: 28700},
  {source: 'signups', target: 'stalled', value: 13400},
  {source: 'onboarded', target: 'active', value: 21500},
  {source: 'onboarded', target: 'inactive', value: 7200},
  {source: 'active', target: 'paying', value: 15200},
  {source: 'active', target: 'free', value: 6300},
];

const bizColumns = [
  ['visitors'],
  ['signups', 'bounce'],
  ['onboarded', 'stalled'],
  ['active', 'inactive'],
  ['paying', 'free'],
];

/**
 * Business funnel with blue main flow and gray exit paths.
 * Uses background labels for readability over the ribbons.
 */
export const BusinessFunnel: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Acquisition Funnel</XDSHeading>
      <XDSText type="body" color="secondary">
        Blue = progression · Gray = drop-off
      </XDSText>
      <XDSSankeyChart
        nodes={bizNodes}
        links={bizLinks}
        columns={bizColumns}
        height={380}>
        <XDSSankeyGrid />
        <XDSSankeyLink opacity={0.6} />
        <XDSSankeyNode />
        <XDSSankeyLabel background />
      </XDSSankeyChart>
    </XDSStack>
  ),
};

// --- Art Deco style: wider bars with rotated labels + column headers ---

const demoNodes: SankeyNode[] = [
  {id: 'single', label: 'Single', value: 48, color: [0.62, 0.16, 30]},
  {id: 'married', label: 'Married', value: 35, color: [0.58, 0.14, 180]},
  {id: 'divorced', label: 'Divorced', value: 17, color: [0.55, 0.12, 300]},
  {id: 'male', label: 'Male', value: 55, color: [0.57, 0.15, 240]},
  {id: 'female', label: 'Female', value: 45, color: [0.6, 0.16, 340]},
  {id: 'happy', label: 'Happy', value: 62, color: [0.64, 0.18, 150]},
  {id: 'unhappy', label: 'Unhappy', value: 38, color: [0.52, 0.14, 25]},
];

const demoLinks: SankeyLink[] = [
  {source: 'single', target: 'male', value: 26},
  {source: 'single', target: 'female', value: 22},
  {source: 'married', target: 'male', value: 20},
  {source: 'married', target: 'female', value: 15},
  {source: 'divorced', target: 'male', value: 9},
  {source: 'divorced', target: 'female', value: 8},
  {source: 'male', target: 'happy', value: 34},
  {source: 'male', target: 'unhappy', value: 21},
  {source: 'female', target: 'happy', value: 28},
  {source: 'female', target: 'unhappy', value: 17},
];

const demoColumns = [
  {ids: ['single', 'married', 'divorced'], label: 'Relationship'},
  {ids: ['male', 'female'], label: 'Gender'},
  {ids: ['happy', 'unhappy'], label: 'Outcome'},
];

/** Wide bars with rotated labels and column headers — art deco style */
export const WideBarStyle: Story = {
  render: () => (
    <XDSStack direction="vertical" gap={4}>
      <XDSHeading level={3}>Survey Flow</XDSHeading>
      <XDSText type="body" color="secondary">
        Wider node bars with rotated text labels
      </XDSText>
      <XDSSankeyChart
        nodes={demoNodes}
        links={demoLinks}
        columns={demoColumns}
        height={380}
        nodeWidth={20}
        nodeGap={8}>
        <XDSSankeyGrid />
        <XDSSankeyLink opacity={0.5} tension={0.5} />
        <XDSSankeyNode />
        <XDSSankeyLabel />
      </XDSSankeyChart>
    </XDSStack>
  ),
};
