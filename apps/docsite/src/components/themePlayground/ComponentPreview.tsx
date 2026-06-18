// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import {Button} from '@xds/core/Button';
import {Card} from '@xds/core/Card';
import {HStack, VStack} from '@xds/core/Stack';
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';
import {Switch} from '@xds/core/Switch';
import {TextInput} from '@xds/core/TextInput';
import {Badge} from '@xds/core/Badge';
import {Banner} from '@xds/core/Banner';
import {TabList, Tab} from '@xds/core/TabList';
import {Selector} from '@xds/core/Selector';
import {ProgressBar} from '@xds/core/ProgressBar';
import {CheckboxInput} from '@xds/core/CheckboxInput';
import {Divider} from '@xds/core/Divider';
import {Avatar} from '@xds/core/Avatar';
import {Link} from '@xds/core/Link';
import {Table} from '@xds/core/Table';
import type {TableColumn} from '@xds/core/Table';
import {Spinner} from '@xds/core/Spinner';
import {Skeleton} from '@xds/core/Skeleton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {ChatComposer, ChatComposerInput} from '@xds/core/Chat';
import {Slider} from '@xds/core/Slider';
import {RadioList, RadioListItem} from '@xds/core/RadioList';
import {Token} from '@xds/core/Token';
import {Tooltip} from '@xds/core/Tooltip';

import {CodeExampleBlock} from '../CodeExampleBlock';
import {Collapsible, CollapsibleGroup} from '@xds/core/Collapsible';
import {StatusDot} from '@xds/core/StatusDot';
import {TextArea} from '@xds/core/TextArea';
import {Section} from '@xds/core/Section';

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-2)',
  flexWrap: 'wrap',
};
const FULL_W: React.CSSProperties = {width: '100%'};
const CHART: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 'var(--spacing-1)',
  height: 80,
};
const BAR_BASE: React.CSSProperties = {
  flex: 1,
  borderRadius: 'var(--radius-inner)',
  backgroundColor: 'var(--color-accent)',
  minWidth: 0,
};
const SEC_BOX: React.CSSProperties = {
  backgroundColor: 'var(--color-background-muted)',
  borderRadius: 'var(--radius-container)',
  padding: 'var(--spacing-3)',
};
const CARD_WRAP: React.CSSProperties = {
  breakInside: 'avoid' as const,
  marginBottom: 'var(--spacing-4)',
  minWidth: 0,
  overflow: 'hidden',
};

interface TxRow extends Record<string, unknown> {
  id: string;
  name: string;
  date: string;
  amt: string;
}

const txColumns: TableColumn<TxRow>[] = [
  {key: 'name', header: 'Name'},
  {key: 'date', header: 'Date'},
  {key: 'amt', header: 'Amount'},
];

const txData: TxRow[] = [
  {id: '1', name: 'Blue Bottle Coffee', date: 'Today, 10:24 AM', amt: '-$6.50'},
  {id: '2', name: 'Whole Foods Market', date: 'Yesterday', amt: '-$142.30'},
  {id: '3', name: 'Stripe Payout', date: 'Oct 12', amt: '+$4,200.00'},
  {id: '4', name: 'Netflix', date: 'Oct 10', amt: '-$15.99'},
];

export function ComponentPreview() {
  const [settingsTab, setSettingsTab] = React.useState('general');
  const [switch1, setSwitch1] = React.useState(false);
  const [switch2, setSwitch2] = React.useState(true);
  const [check1, setCheck1] = React.useState(false);
  const [check2, setCheck2] = React.useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  const [timeRange, setTimeRange] = useState('1M');
  const [riskTolerance, setRiskTolerance] = useState(65);
  const [rebalanceFreq, setRebalanceFreq] = useState('quarterly');
  const [composerValue, setComposerValue] = useState('');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setColumns(w < 800 ? 1 : w < 1100 ? 2 : 3);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        columnCount: columns,
        columnGap: 'var(--spacing-4)',
        minHeight: '100%',
      }}>
      {/* Contribution History */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <VStack gap={1}>
                  <div style={ROW}>
                    <Heading level={3}>Contribution History</Heading>
                    <Badge label="+12% vs last month" variant="info" />
                  </div>
                  <Text type="supporting" color="secondary">
                    Last 6 months of activity
                  </Text>
                </VStack>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={3}>
                  <Section>
                    <VStack gap={3}>
                      <div style={CHART}>
                        {[40, 55, 60, 70, 55, 65].map((h, i) => (
                          <div key={i} style={{...BAR_BASE, height: h}} />
                        ))}
                      </div>
                      <HStack gap={4} hAlign="between">
                        {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => (
                          <Text key={m} type="supporting" color="secondary">
                            {m}
                          </Text>
                        ))}
                      </HStack>
                    </VStack>
                  </Section>
                  <HStack gap={3} wrap="wrap">
                    <div style={{...SEC_BOX, flex: 1, minWidth: 140}}>
                      <VStack gap={1}>
                        <Text type="supporting" color="secondary">
                          UPCOMING
                        </Text>
                        <Text type="label">May 25, 2024</Text>
                        <Text type="supporting" color="secondary">
                          $1,000 scheduled
                        </Text>
                      </VStack>
                    </div>
                    <div style={{...SEC_BOX, flex: 1, minWidth: 140}}>
                      <VStack gap={1}>
                        <Text type="supporting" color="secondary">
                          AUTO-SAVE PLAN
                        </Text>
                        <Text type="label">Accelerated</Text>
                        <Text type="supporting" color="secondary">
                          Recurring weekly
                        </Text>
                      </VStack>
                    </div>
                  </HStack>
                </VStack>
              </LayoutContent>
            }
            footer={
              <LayoutFooter>
                <Button
                  label="View Full Report"
                  variant="primary"
                  style={FULL_W}
                />
              </LayoutFooter>
            }
          />
        </Card>
      </div>

      {/* Portfolio Performance — uses SegmentedControl */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <div style={ROW}>
                  <Heading level={3}>Portfolio Performance</Heading>
                  <Badge label="Live" variant="error" />
                </div>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Text type="display-2">$48,231.04</Text>
                    <HStack gap={2} vAlign="center">
                      <Text type="body" color="secondary">
                        +$3,412.50 (7.6%)
                      </Text>
                      <Text type="supporting" color="secondary">
                        past{' '}
                        {timeRange === '1W'
                          ? 'week'
                          : timeRange === '1M'
                            ? 'month'
                            : timeRange === '3M'
                              ? '3 months'
                              : timeRange === '1Y'
                                ? 'year'
                                : 'time'}
                      </Text>
                    </HStack>
                  </VStack>
                  <Section>
                    <div style={{...CHART, height: 100}}>
                      {[30, 35, 28, 45, 42, 55, 60, 58, 65, 62, 70, 75].map(
                        (h, i) => (
                          <div key={i} style={{...BAR_BASE, height: `${h}%`}} />
                        ),
                      )}
                    </div>
                  </Section>
                  <HStack hAlign="between" vAlign="center">
                    <div style={{display: 'inline-flex'}}>
                      <SegmentedControl
                        value={timeRange}
                        onChange={setTimeRange}
                        label="Time range">
                        <SegmentedControlItem value="1W" label="1W" />
                        <SegmentedControlItem value="1M" label="1M" />
                        <SegmentedControlItem value="3M" label="3M" />
                        <SegmentedControlItem value="1Y" label="1Y" />
                        <SegmentedControlItem value="ALL" label="All" />
                      </SegmentedControl>
                    </div>
                    <Text type="supporting" color="secondary">
                      Updated just now
                    </Text>
                  </HStack>
                </VStack>
              </LayoutContent>
            }
          />
        </Card>
      </div>

      {/* Savings Targets */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <div style={ROW}>
                  <Heading level={3}>Savings Targets</Heading>
                  <Button label="New Goal" size="sm" />
                </div>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={4}>
                  <Banner
                    status="info"
                    title="On Track"
                    description="Your retirement savings are ahead of schedule by $12,000 this quarter."
                  />
                  <VStack gap={1}>
                    <Text type="supporting" color="secondary">
                      RETIREMENT
                    </Text>
                    <Heading level={2}>$420,000</Heading>
                    <ProgressBar label="Retirement" value={65} />
                    <div style={ROW}>
                      <Text type="supporting" color="secondary">
                        65% achieved
                      </Text>
                      <Text type="supporting" color="secondary">
                        $273,000
                      </Text>
                    </div>
                  </VStack>
                  <VStack gap={1}>
                    <Text type="supporting" color="secondary">
                      REAL ESTATE
                    </Text>
                    <Heading level={2}>$85,000</Heading>
                    <ProgressBar label="Real Estate" value={32} />
                    <div style={ROW}>
                      <Text type="supporting" color="secondary">
                        32% achieved
                      </Text>
                      <Text type="supporting" color="secondary">
                        $27,200
                      </Text>
                    </div>
                  </VStack>
                </VStack>
              </LayoutContent>
            }
          />
        </Card>
      </div>

      {/* Buy Investment */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <Heading level={3}>Buy Investment</Heading>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={4}>
                  <TextInput
                    label="Amount to Invest"
                    value="1,000.00"
                    onChange={() => {}}
                  />
                  <Selector
                    label="Order Type"
                    options={['Market Order', 'Limit Order', 'Stop Order']}
                    value="Market Order"
                    onChange={() => {}}
                  />
                  <Text type="supporting" color="secondary">
                    Market orders execute at the current price.
                  </Text>
                  <Divider variant="strong" />
                  <div style={ROW}>
                    <Text type="body">Estimated Shares</Text>
                    <Text type="body" weight="bold">
                      1.95
                    </Text>
                  </div>
                  <div style={ROW}>
                    <Text type="body">Buying Power</Text>
                    <Text type="body" weight="bold">
                      $12,450.00
                    </Text>
                  </div>
                </VStack>
              </LayoutContent>
            }
            footer={
              <LayoutFooter>
                <Button
                  label="Review Order"
                  variant="primary"
                  style={FULL_W}
                />
              </LayoutFooter>
            }
          />
        </Card>
      </div>

      {/* Advisor Chat — uses ChatComposer */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <div style={ROW}>
                  <VStack gap={1}>
                    <Heading level={3}>Advisor Chat</Heading>
                    <HStack gap={2} vAlign="center">
                      <StatusDot variant="success" label="Online" />
                      <Text type="supporting" color="secondary">
                        Sarah is available
                      </Text>
                    </HStack>
                  </VStack>
                  <Tooltip content="View chat history">
                    <Button label="History" variant="ghost" size="sm" />
                  </Tooltip>
                </div>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={3}>
                  <Section>
                    <VStack gap={2}>
                      <Text type="supporting" color="secondary">
                        Sarah, Financial Advisor
                      </Text>
                      <Text type="body">
                        Your portfolio is well-diversified. I'd recommend
                        increasing your bond allocation by 5% given the current
                        market conditions.
                      </Text>
                    </VStack>
                  </Section>
                  <ChatComposer
                    onSubmit={() => setComposerValue('')}
                    input={
                      <ChatComposerInput
                        placeholder="Ask your advisor..."
                        value={composerValue}
                        onChange={setComposerValue}
                      />
                    }
                  />
                </VStack>
              </LayoutContent>
            }
          />
        </Card>
      </div>

      {/* Account Activity — uses Skeleton for a loading row */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <div style={ROW}>
                  <Heading level={3}>Account Activity</Heading>
                  <HStack gap={2} vAlign="center">
                    <Spinner size="sm" />
                    <Text type="supporting" color="secondary">
                      Syncing...
                    </Text>
                  </HStack>
                </div>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={3}>
                  <Section>
                    <VStack gap={3}>
                      {[
                        {
                          name: 'Dividend — AAPL',
                          time: '2 hours ago',
                          amount: '+$32.40',
                        },
                        {
                          name: 'Auto-invest — S&P 500',
                          time: 'Yesterday',
                          amount: '-$500.00',
                        },
                      ].map(item => (
                        <HStack
                          key={item.name}
                          gap={3}
                          vAlign="center"
                          hAlign="between">
                          <VStack gap={0}>
                            <Text type="body">{item.name}</Text>
                            <Text type="supporting" color="secondary">
                              {item.time}
                            </Text>
                          </VStack>
                          <Text type="label" weight="bold">
                            {item.amount}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Section>
                  <HStack gap={3} vAlign="center">
                    <Skeleton width={40} height={40} radius="rounded" />
                    <VStack gap={1} style={{flex: 1}}>
                      <Skeleton width="70%" height={14} radius={2} />
                      <Skeleton width="40%" height={10} radius={2} />
                    </VStack>
                    <Skeleton width={60} height={14} radius={2} />
                  </HStack>
                  <HStack gap={3} vAlign="center">
                    <Skeleton width={40} height={40} radius="rounded" />
                    <VStack gap={1} style={{flex: 1}}>
                      <Skeleton width="55%" height={14} radius={2} />
                      <Skeleton width="30%" height={10} radius={2} />
                    </VStack>
                    <Skeleton width={60} height={14} radius={2} />
                  </HStack>
                </VStack>
              </LayoutContent>
            }
          />
        </Card>
      </div>

      {/* Recent Transactions */}
      <div style={CARD_WRAP}>
        <Card padding={0}>
          <Layout
            height="auto"
            header={
              <LayoutHeader padding={4}>
                <div style={ROW}>
                  <VStack gap={1}>
                    <Heading level={3}>Recent Transactions</Heading>
                    <Text type="supporting" color="secondary">
                      Your latest account activity.
                    </Text>
                  </VStack>
                  <Link label="View All" href="#">
                    View All
                  </Link>
                </div>
              </LayoutHeader>
            }
            content={
              <LayoutContent padding={0}>
                <div style={{overflowX: 'auto'}}>
                  <Table
                    data={txData}
                    columns={txColumns}
                    textOverflow="truncate"
                  />
                </div>
              </LayoutContent>
            }
          />
        </Card>
      </div>

      {/* Risk & Allocation — uses Slider, RadioList */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <Heading level={3}>Risk & Allocation</Heading>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={4}>
                  <Section>
                    <VStack gap={1}>
                      <div style={ROW}>
                        <Text type="label">Risk Tolerance</Text>
                        <Text type="supporting" color="secondary">
                          {riskTolerance}%
                        </Text>
                      </div>
                      <Slider
                        label="Risk tolerance"
                        value={riskTolerance}
                        onChange={setRiskTolerance}
                      />
                      <HStack gap={0} hAlign="between">
                        <Text type="supporting" color="secondary">
                          Conservative
                        </Text>
                        <Text type="supporting" color="secondary">
                          Aggressive
                        </Text>
                      </HStack>
                    </VStack>
                  </Section>
                  <RadioList
                    label="Rebalance frequency"
                    value={rebalanceFreq}
                    onChange={setRebalanceFreq}>
                    <RadioListItem value="monthly" label="Monthly" />
                    <RadioListItem value="quarterly" label="Quarterly" />
                    <RadioListItem value="annually" label="Annually" />
                  </RadioList>
                  <Banner
                    status="warning"
                    title="High allocation to tech"
                    description="Consider diversifying — 62% of your portfolio is in technology stocks."
                  />
                </VStack>
              </LayoutContent>
            }
          />
        </Card>
      </div>

      {/* Team Members — uses Avatar, StatusDot */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <div style={ROW}>
                  <Heading level={3}>Team Members</Heading>
                  <Button label="Invite" size="sm" variant="secondary" />
                </div>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={3}>
                  {[
                    {
                      name: 'Alice Chen',
                      role: 'Engineering Lead',
                      status: 'success' as const,
                    },
                    {
                      name: 'Bob Martinez',
                      role: 'Product Designer',
                      status: 'warning' as const,
                    },
                    {
                      name: 'Carol Wu',
                      role: 'Backend Engineer',
                      status: 'error' as const,
                    },
                  ].map(member => (
                    <HStack
                      key={member.name}
                      gap={3}
                      vAlign="center"
                      hAlign="between">
                      <HStack gap={3} vAlign="center">
                        <Avatar name={member.name} size="small" />
                        <VStack gap={0}>
                          <Text type="body">{member.name}</Text>
                          <Text type="supporting" color="secondary">
                            {member.role}
                          </Text>
                        </VStack>
                      </HStack>
                      <StatusDot
                        variant={member.status}
                        label={member.name}
                      />
                    </HStack>
                  ))}
                </VStack>
              </LayoutContent>
            }
          />
        </Card>
      </div>

      {/* Settings */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <VStack gap={0}>
                  <TabList
                    value={settingsTab}
                    onChange={setSettingsTab}
                    size="sm">
                    <Tab value="general" label="General" />
                    <Tab value="notifications" label="Notifications" />
                    <Tab value="security" label="Security" />
                  </TabList>
                  <Divider />
                </VStack>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={3}>
                  <Section>
                    <VStack gap={3}>
                      <HStack gap={3} vAlign="center" hAlign="between">
                        <VStack gap={0}>
                          <Text type="body">Dark Mode</Text>
                          <Text type="supporting" color="secondary">
                            Enable dark theme
                          </Text>
                        </VStack>
                        <Switch
                          label="Dark Mode"
                          isLabelHidden
                          value={switch1}
                          onChange={setSwitch1}
                        />
                      </HStack>
                      <HStack gap={3} vAlign="center" hAlign="between">
                        <VStack gap={0}>
                          <Text type="body">Notifications</Text>
                          <Text type="supporting" color="secondary">
                            Push notifications
                          </Text>
                        </VStack>
                        <Switch
                          label="Notifications"
                          isLabelHidden
                          value={switch2}
                          onChange={setSwitch2}
                        />
                      </HStack>
                    </VStack>
                  </Section>
                  <CheckboxInput
                    label="Email updates"
                    value={check1}
                    onChange={setCheck1}
                  />
                  <CheckboxInput
                    label="Weekly digest"
                    value={check2}
                    onChange={setCheck2}
                  />
                </VStack>
              </LayoutContent>
            }
          />
        </Card>
      </div>

      {/* Tax Documents — uses Collapsible, Token, CodeBlock */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <div style={ROW}>
                  <Heading level={3}>Tax Documents</Heading>
                  <HStack gap={2} wrap="wrap">
                    <Token label="2024" />
                    <Token label="1099-B" />
                  </HStack>
                </div>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={3}>
                  <CollapsibleGroup type="single" defaultValue="summary">
                    <Collapsible
                      trigger={
                        <Text type="body" weight="bold">
                          Capital Gains Summary
                        </Text>
                      }
                      value="summary">
                      <VStack
                        gap={3}
                        style={{paddingBlock: 'var(--spacing-3)'}}>
                        <div style={ROW}>
                          <Text type="body">Short-term gains</Text>
                          <Text type="body" weight="bold">
                            $1,240.00
                          </Text>
                        </div>
                        <div style={ROW}>
                          <Text type="body">Long-term gains</Text>
                          <Text type="body" weight="bold">
                            $8,920.00
                          </Text>
                        </div>
                        <Divider />
                        <div style={ROW}>
                          <Text type="label">Total taxable</Text>
                          <Text type="label" weight="bold">
                            $10,160.00
                          </Text>
                        </div>
                      </VStack>
                    </Collapsible>
                    <Collapsible
                      trigger={
                        <Text type="body" weight="bold">
                          Dividend Income
                        </Text>
                      }
                      value="dividends">
                      <VStack
                        gap={3}
                        style={{paddingBlock: 'var(--spacing-3)'}}>
                        <div style={ROW}>
                          <Text type="body">Qualified dividends</Text>
                          <Text type="body" weight="bold">
                            $2,450.00
                          </Text>
                        </div>
                        <div style={ROW}>
                          <Text type="body">Ordinary dividends</Text>
                          <Text type="body" weight="bold">
                            $680.00
                          </Text>
                        </div>
                      </VStack>
                    </Collapsible>
                    <Collapsible
                      trigger={
                        <Text type="body" weight="bold">
                          Export Format
                        </Text>
                      }
                      value="export">
                      <div style={{paddingBlock: 'var(--spacing-3)'}}>
                        <CodeExampleBlock
                          code={`Tax Year: 2024\nAccount: ***4821\nTotal Gains: $10,160.00\nDividends: $3,130.00`}
                          language="text"
                          size="sm"
                        />
                      </div>
                    </Collapsible>
                  </CollapsibleGroup>
                </VStack>
              </LayoutContent>
            }
          />
        </Card>
      </div>

      {/* Support Ticket — uses TextArea, Section */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <div style={ROW}>
                  <Heading level={3}>Submit a Request</Heading>
                  <Badge label="Support" variant="info" />
                </div>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={4}>
                  <Selector
                    label="Category"
                    options={[
                      'Account Access',
                      'Transfers',
                      'Tax Forms',
                      'Other',
                    ]}
                    value="Account Access"
                    onChange={() => {}}
                  />
                  <TextInput
                    label="Subject"
                    value=""
                    placeholder="Brief description"
                    onChange={() => {}}
                  />
                  <Section>
                    <TextArea
                      label="Details"
                      placeholder="Describe your issue..."
                      value=""
                    />
                  </Section>
                </VStack>
              </LayoutContent>
            }
            footer={
              <LayoutFooter>
                <HStack gap={2} hAlign="end">
                  <Button label="Cancel" variant="ghost" />
                  <Button label="Submit" variant="primary" />
                </HStack>
              </LayoutFooter>
            }
          />
        </Card>
      </div>

      {/* Buttons */}
      <div style={CARD_WRAP}>
        <Card>
          <Layout
            height="auto"
            header={
              <LayoutHeader>
                <Heading level={3}>Quick Actions</Heading>
              </LayoutHeader>
            }
            content={
              <LayoutContent>
                <VStack gap={3}>
                  <HStack gap={2} wrap="wrap">
                    <Button label="Transfer" variant="primary" size="md" />
                    <Button label="Deposit" variant="secondary" size="md" />
                    <Button label="Statements" variant="ghost" size="md" />
                  </HStack>
                  <HStack gap={2} wrap="wrap">
                    <Button label="Small" variant="primary" size="sm" />
                    <Button label="Medium" variant="primary" size="md" />
                    <Button label="Large" variant="primary" size="lg" />
                  </HStack>
                  <HStack gap={2} wrap="wrap">
                    <Button
                      label="Processing..."
                      variant="primary"
                      isDisabled
                    />
                    <Button
                      label="Unavailable"
                      variant="secondary"
                      isDisabled
                    />
                  </HStack>
                </VStack>
              </LayoutContent>
            }
          />
        </Card>
      </div>
    </div>
  );
}
