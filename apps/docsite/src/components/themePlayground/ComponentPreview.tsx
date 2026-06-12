// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as React from 'react';
import {useState, useEffect, useRef} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSHStack, XDSVStack} from '@xds/core/Stack';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSBanner} from '@xds/core/Banner';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSSelector} from '@xds/core/Selector';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSDivider} from '@xds/core/Divider';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSLink} from '@xds/core/Link';
import {XDSTable} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSChatComposer, XDSChatComposerInput} from '@xds/core/Chat';
import {XDSSlider} from '@xds/core/Slider';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSToken} from '@xds/core/Token';
import {XDSTooltip} from '@xds/core/Tooltip';

import {CodeExampleBlock} from '../CodeExampleBlock';
import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSSection} from '@xds/core/Section';

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

const txColumns: XDSTableColumn<TxRow>[] = [
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
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <XDSVStack gap={1}>
                  <div style={ROW}>
                    <XDSHeading level={3}>Contribution History</XDSHeading>
                    <XDSBadge label="+12% vs last month" variant="info" />
                  </div>
                  <XDSText type="supporting" color="secondary">
                    Last 6 months of activity
                  </XDSText>
                </XDSVStack>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
                  <XDSSection>
                    <XDSVStack gap={3}>
                      <div style={CHART}>
                        {[40, 55, 60, 70, 55, 65].map((h, i) => (
                          <div key={i} style={{...BAR_BASE, height: h}} />
                        ))}
                      </div>
                      <XDSHStack gap={4} hAlign="between">
                        {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => (
                          <XDSText key={m} type="supporting" color="secondary">
                            {m}
                          </XDSText>
                        ))}
                      </XDSHStack>
                    </XDSVStack>
                  </XDSSection>
                  <XDSHStack gap={3} wrap="wrap">
                    <div style={{...SEC_BOX, flex: 1, minWidth: 140}}>
                      <XDSVStack gap={1}>
                        <XDSText type="supporting" color="secondary">
                          UPCOMING
                        </XDSText>
                        <XDSText type="label">May 25, 2024</XDSText>
                        <XDSText type="supporting" color="secondary">
                          $1,000 scheduled
                        </XDSText>
                      </XDSVStack>
                    </div>
                    <div style={{...SEC_BOX, flex: 1, minWidth: 140}}>
                      <XDSVStack gap={1}>
                        <XDSText type="supporting" color="secondary">
                          AUTO-SAVE PLAN
                        </XDSText>
                        <XDSText type="label">Accelerated</XDSText>
                        <XDSText type="supporting" color="secondary">
                          Recurring weekly
                        </XDSText>
                      </XDSVStack>
                    </div>
                  </XDSHStack>
                </XDSVStack>
              </XDSLayoutContent>
            }
            footer={
              <XDSLayoutFooter>
                <XDSButton
                  label="View Full Report"
                  variant="primary"
                  style={FULL_W}
                />
              </XDSLayoutFooter>
            }
          />
        </XDSCard>
      </div>

      {/* Portfolio Performance — uses SegmentedControl */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSHeading level={3}>Portfolio Performance</XDSHeading>
                  <XDSBadge label="Live" variant="error" />
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSVStack gap={1}>
                    <XDSText type="display-2">$48,231.04</XDSText>
                    <XDSHStack gap={2} vAlign="center">
                      <XDSText type="body" color="secondary">
                        +$3,412.50 (7.6%)
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
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
                      </XDSText>
                    </XDSHStack>
                  </XDSVStack>
                  <XDSSection>
                    <div style={{...CHART, height: 100}}>
                      {[30, 35, 28, 45, 42, 55, 60, 58, 65, 62, 70, 75].map(
                        (h, i) => (
                          <div key={i} style={{...BAR_BASE, height: `${h}%`}} />
                        ),
                      )}
                    </div>
                  </XDSSection>
                  <XDSHStack hAlign="between" vAlign="center">
                    <div style={{display: 'inline-flex'}}>
                      <XDSSegmentedControl
                        value={timeRange}
                        onChange={setTimeRange}
                        label="Time range">
                        <XDSSegmentedControlItem value="1W" label="1W" />
                        <XDSSegmentedControlItem value="1M" label="1M" />
                        <XDSSegmentedControlItem value="3M" label="3M" />
                        <XDSSegmentedControlItem value="1Y" label="1Y" />
                        <XDSSegmentedControlItem value="ALL" label="All" />
                      </XDSSegmentedControl>
                    </div>
                    <XDSText type="supporting" color="secondary">
                      Updated just now
                    </XDSText>
                  </XDSHStack>
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Savings Targets */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSHeading level={3}>Savings Targets</XDSHeading>
                  <XDSButton label="New Goal" size="sm" />
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSBanner
                    status="info"
                    title="On Track"
                    description="Your retirement savings are ahead of schedule by $12,000 this quarter."
                  />
                  <XDSVStack gap={1}>
                    <XDSText type="supporting" color="secondary">
                      RETIREMENT
                    </XDSText>
                    <XDSHeading level={2}>$420,000</XDSHeading>
                    <XDSProgressBar label="Retirement" value={65} />
                    <div style={ROW}>
                      <XDSText type="supporting" color="secondary">
                        65% achieved
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        $273,000
                      </XDSText>
                    </div>
                  </XDSVStack>
                  <XDSVStack gap={1}>
                    <XDSText type="supporting" color="secondary">
                      REAL ESTATE
                    </XDSText>
                    <XDSHeading level={2}>$85,000</XDSHeading>
                    <XDSProgressBar label="Real Estate" value={32} />
                    <div style={ROW}>
                      <XDSText type="supporting" color="secondary">
                        32% achieved
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        $27,200
                      </XDSText>
                    </div>
                  </XDSVStack>
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Buy Investment */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <XDSHeading level={3}>Buy Investment</XDSHeading>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSTextInput
                    label="Amount to Invest"
                    value="1,000.00"
                    onChange={() => {}}
                  />
                  <XDSSelector
                    label="Order Type"
                    options={['Market Order', 'Limit Order', 'Stop Order']}
                    value="Market Order"
                    onChange={() => {}}
                  />
                  <XDSText type="supporting" color="secondary">
                    Market orders execute at the current price.
                  </XDSText>
                  <XDSDivider variant="strong" />
                  <div style={ROW}>
                    <XDSText type="body">Estimated Shares</XDSText>
                    <XDSText type="body" weight="bold">
                      1.95
                    </XDSText>
                  </div>
                  <div style={ROW}>
                    <XDSText type="body">Buying Power</XDSText>
                    <XDSText type="body" weight="bold">
                      $12,450.00
                    </XDSText>
                  </div>
                </XDSVStack>
              </XDSLayoutContent>
            }
            footer={
              <XDSLayoutFooter>
                <XDSButton
                  label="Review Order"
                  variant="primary"
                  style={FULL_W}
                />
              </XDSLayoutFooter>
            }
          />
        </XDSCard>
      </div>

      {/* Advisor Chat — uses ChatComposer */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSVStack gap={1}>
                    <XDSHeading level={3}>Advisor Chat</XDSHeading>
                    <XDSHStack gap={2} vAlign="center">
                      <XDSStatusDot variant="success" label="Online" />
                      <XDSText type="supporting" color="secondary">
                        Sarah is available
                      </XDSText>
                    </XDSHStack>
                  </XDSVStack>
                  <XDSTooltip content="View chat history">
                    <XDSButton label="History" variant="ghost" size="sm" />
                  </XDSTooltip>
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
                  <XDSSection>
                    <XDSVStack gap={2}>
                      <XDSText type="supporting" color="secondary">
                        Sarah, Financial Advisor
                      </XDSText>
                      <XDSText type="body">
                        Your portfolio is well-diversified. I'd recommend
                        increasing your bond allocation by 5% given the current
                        market conditions.
                      </XDSText>
                    </XDSVStack>
                  </XDSSection>
                  <XDSChatComposer
                    onSubmit={() => setComposerValue('')}
                    input={
                      <XDSChatComposerInput
                        placeholder="Ask your advisor..."
                        value={composerValue}
                        onChange={setComposerValue}
                      />
                    }
                  />
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Account Activity — uses Skeleton for a loading row */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSHeading level={3}>Account Activity</XDSHeading>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSSpinner size="sm" />
                    <XDSText type="supporting" color="secondary">
                      Syncing...
                    </XDSText>
                  </XDSHStack>
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
                  <XDSSection>
                    <XDSVStack gap={3}>
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
                        <XDSHStack
                          key={item.name}
                          gap={3}
                          vAlign="center"
                          hAlign="between">
                          <XDSVStack gap={0}>
                            <XDSText type="body">{item.name}</XDSText>
                            <XDSText type="supporting" color="secondary">
                              {item.time}
                            </XDSText>
                          </XDSVStack>
                          <XDSText type="label" weight="bold">
                            {item.amount}
                          </XDSText>
                        </XDSHStack>
                      ))}
                    </XDSVStack>
                  </XDSSection>
                  <XDSHStack gap={3} vAlign="center">
                    <XDSSkeleton width={40} height={40} radius="rounded" />
                    <XDSVStack gap={1} style={{flex: 1}}>
                      <XDSSkeleton width="70%" height={14} radius={2} />
                      <XDSSkeleton width="40%" height={10} radius={2} />
                    </XDSVStack>
                    <XDSSkeleton width={60} height={14} radius={2} />
                  </XDSHStack>
                  <XDSHStack gap={3} vAlign="center">
                    <XDSSkeleton width={40} height={40} radius="rounded" />
                    <XDSVStack gap={1} style={{flex: 1}}>
                      <XDSSkeleton width="55%" height={14} radius={2} />
                      <XDSSkeleton width="30%" height={10} radius={2} />
                    </XDSVStack>
                    <XDSSkeleton width={60} height={14} radius={2} />
                  </XDSHStack>
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Recent Transactions */}
      <div style={CARD_WRAP}>
        <XDSCard padding={0}>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader padding={4}>
                <div style={ROW}>
                  <XDSVStack gap={1}>
                    <XDSHeading level={3}>Recent Transactions</XDSHeading>
                    <XDSText type="supporting" color="secondary">
                      Your latest account activity.
                    </XDSText>
                  </XDSVStack>
                  <XDSLink label="View All" href="#">
                    View All
                  </XDSLink>
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent padding={0}>
                <div style={{overflowX: 'auto'}}>
                  <XDSTable
                    data={txData}
                    columns={txColumns}
                    textOverflow="truncate"
                  />
                </div>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Risk & Allocation — uses Slider, RadioList */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <XDSHeading level={3}>Risk & Allocation</XDSHeading>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSSection>
                    <XDSVStack gap={1}>
                      <div style={ROW}>
                        <XDSText type="label">Risk Tolerance</XDSText>
                        <XDSText type="supporting" color="secondary">
                          {riskTolerance}%
                        </XDSText>
                      </div>
                      <XDSSlider
                        label="Risk tolerance"
                        value={riskTolerance}
                        onChange={setRiskTolerance}
                      />
                      <XDSHStack gap={0} hAlign="between">
                        <XDSText type="supporting" color="secondary">
                          Conservative
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          Aggressive
                        </XDSText>
                      </XDSHStack>
                    </XDSVStack>
                  </XDSSection>
                  <XDSRadioList
                    label="Rebalance frequency"
                    value={rebalanceFreq}
                    onChange={setRebalanceFreq}>
                    <XDSRadioListItem value="monthly" label="Monthly" />
                    <XDSRadioListItem value="quarterly" label="Quarterly" />
                    <XDSRadioListItem value="annually" label="Annually" />
                  </XDSRadioList>
                  <XDSBanner
                    status="warning"
                    title="High allocation to tech"
                    description="Consider diversifying — 62% of your portfolio is in technology stocks."
                  />
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Team Members — uses Avatar, StatusDot */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSHeading level={3}>Team Members</XDSHeading>
                  <XDSButton label="Invite" size="sm" variant="secondary" />
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
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
                    <XDSHStack
                      key={member.name}
                      gap={3}
                      vAlign="center"
                      hAlign="between">
                      <XDSHStack gap={3} vAlign="center">
                        <XDSAvatar name={member.name} size="small" />
                        <XDSVStack gap={0}>
                          <XDSText type="body">{member.name}</XDSText>
                          <XDSText type="supporting" color="secondary">
                            {member.role}
                          </XDSText>
                        </XDSVStack>
                      </XDSHStack>
                      <XDSStatusDot
                        variant={member.status}
                        label={member.name}
                      />
                    </XDSHStack>
                  ))}
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Settings */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <XDSVStack gap={0}>
                  <XDSTabList
                    value={settingsTab}
                    onChange={setSettingsTab}
                    size="sm">
                    <XDSTab value="general" label="General" />
                    <XDSTab value="notifications" label="Notifications" />
                    <XDSTab value="security" label="Security" />
                  </XDSTabList>
                  <XDSDivider />
                </XDSVStack>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
                  <XDSSection>
                    <XDSVStack gap={3}>
                      <XDSHStack gap={3} vAlign="center" hAlign="between">
                        <XDSVStack gap={0}>
                          <XDSText type="body">Dark Mode</XDSText>
                          <XDSText type="supporting" color="secondary">
                            Enable dark theme
                          </XDSText>
                        </XDSVStack>
                        <XDSSwitch
                          label="Dark Mode"
                          isLabelHidden
                          value={switch1}
                          onChange={setSwitch1}
                        />
                      </XDSHStack>
                      <XDSHStack gap={3} vAlign="center" hAlign="between">
                        <XDSVStack gap={0}>
                          <XDSText type="body">Notifications</XDSText>
                          <XDSText type="supporting" color="secondary">
                            Push notifications
                          </XDSText>
                        </XDSVStack>
                        <XDSSwitch
                          label="Notifications"
                          isLabelHidden
                          value={switch2}
                          onChange={setSwitch2}
                        />
                      </XDSHStack>
                    </XDSVStack>
                  </XDSSection>
                  <XDSCheckboxInput
                    label="Email updates"
                    value={check1}
                    onChange={setCheck1}
                  />
                  <XDSCheckboxInput
                    label="Weekly digest"
                    value={check2}
                    onChange={setCheck2}
                  />
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Tax Documents — uses Collapsible, Token, CodeBlock */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSHeading level={3}>Tax Documents</XDSHeading>
                  <XDSHStack gap={2} wrap="wrap">
                    <XDSToken label="2024" />
                    <XDSToken label="1099-B" />
                  </XDSHStack>
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
                  <XDSCollapsibleGroup type="single" defaultValue="summary">
                    <XDSCollapsible
                      trigger={
                        <XDSText type="body" weight="bold">
                          Capital Gains Summary
                        </XDSText>
                      }
                      value="summary">
                      <XDSVStack
                        gap={3}
                        style={{paddingBlock: 'var(--spacing-3)'}}>
                        <div style={ROW}>
                          <XDSText type="body">Short-term gains</XDSText>
                          <XDSText type="body" weight="bold">
                            $1,240.00
                          </XDSText>
                        </div>
                        <div style={ROW}>
                          <XDSText type="body">Long-term gains</XDSText>
                          <XDSText type="body" weight="bold">
                            $8,920.00
                          </XDSText>
                        </div>
                        <XDSDivider />
                        <div style={ROW}>
                          <XDSText type="label">Total taxable</XDSText>
                          <XDSText type="label" weight="bold">
                            $10,160.00
                          </XDSText>
                        </div>
                      </XDSVStack>
                    </XDSCollapsible>
                    <XDSCollapsible
                      trigger={
                        <XDSText type="body" weight="bold">
                          Dividend Income
                        </XDSText>
                      }
                      value="dividends">
                      <XDSVStack
                        gap={3}
                        style={{paddingBlock: 'var(--spacing-3)'}}>
                        <div style={ROW}>
                          <XDSText type="body">Qualified dividends</XDSText>
                          <XDSText type="body" weight="bold">
                            $2,450.00
                          </XDSText>
                        </div>
                        <div style={ROW}>
                          <XDSText type="body">Ordinary dividends</XDSText>
                          <XDSText type="body" weight="bold">
                            $680.00
                          </XDSText>
                        </div>
                      </XDSVStack>
                    </XDSCollapsible>
                    <XDSCollapsible
                      trigger={
                        <XDSText type="body" weight="bold">
                          Export Format
                        </XDSText>
                      }
                      value="export">
                      <div style={{paddingBlock: 'var(--spacing-3)'}}>
                        <CodeExampleBlock
                          code={`Tax Year: 2024\nAccount: ***4821\nTotal Gains: $10,160.00\nDividends: $3,130.00`}
                          language="text"
                          size="sm"
                        />
                      </div>
                    </XDSCollapsible>
                  </XDSCollapsibleGroup>
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Support Ticket — uses TextArea, Section */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSHeading level={3}>Submit a Request</XDSHeading>
                  <XDSBadge label="Support" variant="info" />
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSSelector
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
                  <XDSTextInput
                    label="Subject"
                    value=""
                    placeholder="Brief description"
                    onChange={() => {}}
                  />
                  <XDSSection>
                    <XDSTextArea
                      label="Details"
                      placeholder="Describe your issue..."
                      value=""
                    />
                  </XDSSection>
                </XDSVStack>
              </XDSLayoutContent>
            }
            footer={
              <XDSLayoutFooter>
                <XDSHStack gap={2} hAlign="end">
                  <XDSButton label="Cancel" variant="ghost" />
                  <XDSButton label="Submit" variant="primary" />
                </XDSHStack>
              </XDSLayoutFooter>
            }
          />
        </XDSCard>
      </div>

      {/* Buttons */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <XDSHeading level={3}>Quick Actions</XDSHeading>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
                  <XDSHStack gap={2} wrap="wrap">
                    <XDSButton label="Transfer" variant="primary" size="md" />
                    <XDSButton label="Deposit" variant="secondary" size="md" />
                    <XDSButton label="Statements" variant="ghost" size="md" />
                  </XDSHStack>
                  <XDSHStack gap={2} wrap="wrap">
                    <XDSButton label="Small" variant="primary" size="sm" />
                    <XDSButton label="Medium" variant="primary" size="md" />
                    <XDSButton label="Large" variant="primary" size="lg" />
                  </XDSHStack>
                  <XDSHStack gap={2} wrap="wrap">
                    <XDSButton
                      label="Processing..."
                      variant="primary"
                      isDisabled
                    />
                    <XDSButton
                      label="Unavailable"
                      variant="secondary"
                      isDisabled
                    />
                  </XDSHStack>
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>
    </div>
  );
}
