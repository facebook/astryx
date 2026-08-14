// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';

import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {useThemeControls} from '../../../providers';
import type {ThemeMode} from '@astryxdesign/core/theme';
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Divider} from '@astryxdesign/core/Divider';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Switch} from '@astryxdesign/core/Switch';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Spinner} from '@astryxdesign/core/Spinner';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Calendar} from '@astryxdesign/core/Calendar';
import {Token} from '@astryxdesign/core/Token';

const styles = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fullWidth: {width: '100%'},
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    height: 80,
  },
  bar: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: 'var(--color-accent, #0066ff)',
    minWidth: 0,
  },
  barMuted: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: 'var(--color-accent, #0066ff)',
    opacity: 0.3,
    minWidth: 0,
  },
  barPurple: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: '#a855f7',
    minWidth: 0,
  },
  sectionContainer: {
    backgroundColor: 'var(--color-surface-secondary, #f5f5f5)',
    borderRadius: 12,
    padding: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-text-success, #00a67e)',
  },
  placeholder: {
    height: 120,
    borderRadius: 8,
    backgroundColor: 'var(--color-surface-secondary, #f5f5f5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkline: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
  },
});

function Sparkline({values}: {values: number[]}) {
  return (
    <div {...stylex.props(styles.sparkline)}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: v,
            borderRadius: 2,
            backgroundColor: 'var(--color-accent, #0066ff)',
          }}
        />
      ))}
    </div>
  );
}

export default function ExampleCardsPage() {
  const {themeName, setThemeName, mode, setMode} = useThemeControls();

  const themeOptions = [
    'Neutral',
    'Meta',
    'WhatsApp',
    'Stone',
    'Gothic',
    'Chocolate',
  ];
  const modeOptions = ['Light', 'Dark'];

  const [email, setEmail] = useState('artist@studio.inc');
  const [notes, setNotes] = useState('');
  const [publicStats, setPublicStats] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [ticker, setTicker] = useState('VOO');
  const [transferAmount, setTransferAmount] = useState('1,200.00');
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('$15,000');
  const [targetDate, setTargetDate] = useState('Dec 2025');
  const [settingsTab, setSettingsTab] = useState('general');
  const [brightness, setBrightness] = useState(65);
  const [colorTemp, setColorTemp] = useState(45);
  const [selectAll, setSelectAll] = useState(false);
  const [txnAlerts, setTxnAlerts] = useState(true);
  const [secAlerts, setSecAlerts] = useState(false);
  const [goalMilestones, setGoalMilestones] = useState(false);
  const [marketUpdates, setMarketUpdates] = useState(false);
  const [fromAccount, setFromAccount] = useState('checking');
  const [toAccount, setToAccount] = useState('savings');
  const [spotifyUrl, setSpotifyUrl] = useState('spotify.com/artist/3i..2k');
  const [igHandle, setIgHandle] = useState('@julianduryea_music');
  const [scUrl, setScUrl] = useState('soundcloud.com/username');
  const [website, setWebsite] = useState('https://yoursite.com');

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}>
        <Heading level={3}>
          {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
        </Heading>
        <HStack gap={2}>
          <Selector
            label="Theme"
            options={themeOptions}
            value={themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            onChange={(v: string) => setThemeName(v.toLowerCase())}
            size="sm"
          />
          <Selector
            label="Mode"
            options={modeOptions}
            value={mode === 'dark' ? 'Dark' : 'Light'}
            onChange={(v: string) => setMode(v.toLowerCase() as ThemeMode)}
            size="sm"
          />
        </HStack>
      </div>
      <Divider />
      <div
        style={{
          columnCount: 4,
          columnGap: 24,
          padding: 24,
          backgroundColor: 'var(--color-background-muted)',
          minHeight: '100%',
        }}>
        {/* Contribution History */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <Heading level={3}>Contribution History</Heading>
                <Badge label="+12% vs last month" variant="info" />
              </div>
              <Text type="supporting" color="secondary">
                Last 6 months of activity
              </Text>
              <div {...stylex.props(styles.chart)}>
                {[40, 55, 60, 70, 55, 65].map((h, i) => (
                  <div
                    key={i}
                    {...stylex.props(styles.barPurple)}
                    style={{height: h}}
                  />
                ))}
              </div>
              <HStack gap={4}>
                {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => (
                  <Text key={m} type="supporting" color="secondary">
                    {m}
                  </Text>
                ))}
              </HStack>
              <Divider />
              <div {...stylex.props(styles.row)}>
                <div {...stylex.props(styles.sectionContainer)}>
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
                <div {...stylex.props(styles.sectionContainer)}>
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
              </div>
              <Button
                label="View Full Report"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </VStack>
          </Card>
        </div>

        {/* Payout Threshold */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <Heading level={3}>Payout Threshold</Heading>
                <Button
                  label=""
                  icon={<Icon icon="close" size="sm" />}
                  variant="ghost"
                  size="sm"
                />
              </div>
              <Text type="supporting" color="secondary">
                Set the minimum balance required before a payout is triggered.
              </Text>
              <Selector
                label="Preferred Currency"
                options={[
                  'USD — United States Dollar',
                  'EUR — Euro',
                  'GBP — British Pound',
                ]}
                value="USD — United States Dollar"
                onChange={() => {}}
              />
              <VStack gap={2}>
                <div {...stylex.props(styles.row)}>
                  <Text type="label">Minimum Payout Amount</Text>
                  <Heading level={2}>$2500.00</Heading>
                </div>
                <Slider
                  label="Payout amount"
                  isLabelHidden
                  value={50}
                  onChange={() => {}}
                />
                <div {...stylex.props(styles.row)}>
                  <Text type="supporting" color="secondary">
                    $50 (MIN)
                  </Text>
                  <Text type="supporting" color="secondary">
                    $10,000 (MAX)
                  </Text>
                </div>
              </VStack>
              <TextInput
                label="Notes"
                placeholder="Add any notes for this payout configuration..."
                value={notes}
                onChange={setNotes}
              />
              <Button
                label="Save Threshold"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </VStack>
          </Card>
        </div>

        {/* Savings Targets */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <Heading level={3}>Savings Targets</Heading>
                <Button label="New Goal" variant="primary" size="sm" />
              </div>
              <Text type="supporting" color="secondary">
                Active milestones for 2024
              </Text>
              <VStack gap={1}>
                <Text type="supporting" color="secondary">
                  RETIREMENT
                </Text>
                <Heading level={2}>$420,000</Heading>
                <ProgressBar label="Retirement" value={65} />
                <div {...stylex.props(styles.row)}>
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
                <div {...stylex.props(styles.row)}>
                  <Text type="supporting" color="secondary">
                    32% achieved
                  </Text>
                  <Text type="supporting" color="secondary">
                    $27,200
                  </Text>
                </div>
              </VStack>
              <Text type="supporting" color="secondary">
                You have not met your targets for this year.
              </Text>
            </VStack>
          </Card>
        </div>

        {/* Buy Investment */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <Heading level={3}>Buy Investment</Heading>
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
              <Divider />
              <div {...stylex.props(styles.row)}>
                <Text type="body">Estimated Shares</Text>
                <Text type="body" weight="bold">
                  1.95
                </Text>
              </div>
              <div {...stylex.props(styles.row)}>
                <Text type="body">Buying Power</Text>
                <Text type="body" weight="bold">
                  $12,450.00
                </Text>
              </div>
              <Button
                label="Review Order"
                variant="primary"
                xstyle={styles.fullWidth}
              />
              <Text type="supporting" color="secondary">
                Trades are typically executed within minutes during market
                hours.
              </Text>
            </VStack>
          </Card>
        </div>

        {/* Account Access */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <Heading level={3}>Account Access</Heading>
              <Text type="supporting" color="secondary">
                Update your credentials or re-authenticate.
              </Text>
              <TextInput
                label="Email Address"
                value={email}
                onChange={setEmail}
              />
              <TextInput
                label="Current Password"
                type="password"
                value="password123"
                onChange={() => {}}
              />
              <Button
                label="Update Security"
                variant="primary"
                xstyle={styles.fullWidth}
              />
              <VStack gap={2}>
                <HStack gap={2} vAlign="center">
                  <StatusDot variant="warning" label="Warning" />
                  <Text type="supporting">Danger Zone</Text>
                </HStack>
                <Text type="supporting" color="secondary">
                  Archive account and remove catalog
                </Text>
              </VStack>
            </VStack>
          </Card>
        </div>

        {/* Payout Preferences */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <Heading level={3}>Payout Preferences</Heading>
                <Button
                  label=""
                  icon={<Icon icon="close" size="sm" />}
                  variant="ghost"
                  size="sm"
                />
              </div>
              <Text type="supporting" color="secondary">
                Receiving Method
              </Text>
              <TextInput
                label="Account Holder Name"
                value="Synthetic Horizons Music LLC"
                onChange={() => {}}
              />
              <RadioList
                label="Receiving Method"
                value="bank"
                onChange={() => {}}>
                <RadioListItem
                  value="bank"
                  label="Bank Transfer — SWIFT / IBAN"
                />
                <RadioListItem value="paypal" label="PayPal — Instant Payout" />
              </RadioList>
              <TextInput
                label="IBAN / Account Number"
                value="DE89 3704 0044 ..."
                onChange={() => {}}
              />
              <Button
                label="Save Payout Settings"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </VStack>
          </Card>
        </div>

        {/* Stock Performance */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Heading level={3}>Stock Performance</Heading>
              <Text type="supporting" color="secondary">
                6-month price history.
              </Text>
              <Selector
                label="Ticker"
                options={['VOO', 'AAPL', 'GOOGL', 'MSFT']}
                value={ticker}
                onChange={setTicker}
              />
              <div {...stylex.props(styles.chart)}>
                {[30, 45, 38, 52, 48, 55, 42, 60, 58, 65, 50, 70].map(
                  (h, i) => (
                    <div
                      key={i}
                      {...stylex.props(styles.bar)}
                      style={{height: h}}
                    />
                  ),
                )}
              </div>
            </VStack>
          </Card>
        </div>

        {/* Distribute Track */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Heading level={3}>Distribute Track</Heading>
              <Text type="supporting" color="secondary">
                Upload your first master and start reaching listeners on
                Spotify, Apple Music and more.
              </Text>
              <HStack gap={2}>
                <Button label="Create Release" variant="primary" size="sm" />
                <Button label="+" variant="secondary" size="sm" />
              </HStack>
            </VStack>
          </Card>
        </div>

        {/* Clearinghouse Balance */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <Text type="supporting" color="secondary">
                Clearhouse Balance
              </Text>
              <Heading level={1}>$0.00</Heading>
              <HStack gap={2} vAlign="center">
                <div {...stylex.props(styles.dot)} />
                <Text type="supporting" color="secondary">
                  Pending Setup
                </Text>
              </HStack>
              <Divider />
              <div {...stylex.props(styles.row)}>
                <Text type="body">Net Royalties</Text>
                <Text type="body" weight="bold">
                  $0.00
                </Text>
              </div>
              <div {...stylex.props(styles.row)}>
                <Text type="body">Processing Fee</Text>
                <Text type="body" weight="bold">
                  -$0.00
                </Text>
              </div>
              <Divider />
              <div {...stylex.props(styles.row)}>
                <Text type="body">Total Ready to Claim</Text>
                <Text type="body" weight="bold">
                  $0.00 USD
                </Text>
              </div>
              <Text type="supporting" color="secondary">
                Once your bank is connected, balances over $10.00 are
                automatically eligible for monthly distribution on the 15th of
                each month.
              </Text>
            </VStack>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <VStack gap={1}>
                  <Heading level={3}>Recent Transactions</Heading>
                  <Text type="supporting" color="secondary">
                    Your latest account activity.
                  </Text>
                </VStack>
                <Link href="#">View All</Link>
              </div>
              <Divider />
              {[
                {
                  name: 'Blue Bottle Coffee',
                  cat: 'Food & Drink',
                  date: 'Today, 10:24 AM',
                  amt: '-$6.50',
                  initials: 'BB',
                },
                {
                  name: 'Whole Foods Market',
                  cat: 'Groceries',
                  date: 'Yesterday',
                  amt: '-$142.30',
                  initials: 'WF',
                },
                {
                  name: 'Stripe Payout',
                  cat: 'Income',
                  date: 'Oct 12',
                  amt: '+$4,200.00',
                  initials: 'SP',
                },
                {
                  name: 'Uber Technologies',
                  cat: 'Transport',
                  date: 'Oct 11',
                  amt: '-$24.10',
                  initials: 'UT',
                },
                {
                  name: 'Netflix Subscription',
                  cat: 'Entertainment',
                  date: 'Oct 10',
                  amt: '-$19.99',
                  initials: 'NS',
                },
              ].map((txn, i) => (
                <div key={i}>
                  <div {...stylex.props(styles.row)}>
                    <HStack gap={3} vAlign="center">
                      <Avatar name={txn.initials} size="md" />
                      <VStack gap={0}>
                        <Text type="body" weight="bold">
                          {txn.name}
                        </Text>
                        <Text type="supporting" color="secondary">
                          {txn.cat}
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack gap={0} style={{alignItems: 'flex-end'}}>
                      <Text type="body" weight="bold">
                        {txn.amt}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {txn.date}
                      </Text>
                    </VStack>
                  </div>
                  {i < 4 && <Divider />}
                </div>
              ))}
            </VStack>
          </Card>
        </div>

        {/* Card Balance */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Card Balance
                  </Text>
                  <Heading level={3}>US$12.94</Heading>
                  <Text type="supporting" color="secondary">
                    US$ 1,337.06 Available
                  </Text>
                </VStack>
                <VStack gap={0} style={{alignItems: 'flex-end'}}>
                  <Text type="supporting" color="secondary">
                    Payment Due
                  </Text>
                  <Heading level={3}>1 Apr</Heading>
                  <Link href="#">Pay Early</Link>
                </VStack>
              </div>
              <Text type="supporting" color="secondary">
                Yearly Activity
              </Text>
              <HStack gap={2} vAlign="center">
                <Text type="supporting" color="secondary">
                  +US$0.25 Daily Cash
                </Text>
              </HStack>
              <div {...stylex.props(styles.chart)}>
                {[20, 35, 15, 45, 30, 50, 25, 40, 55, 35, 45, 30].map(
                  (h, i) => (
                    <div
                      key={i}
                      {...stylex.props(styles.bar)}
                      style={{height: h}}
                    />
                  ),
                )}
              </div>
              <HStack gap={2}>
                {[
                  'J',
                  'F',
                  'M',
                  'A',
                  'M',
                  'J',
                  'J',
                  'A',
                  'S',
                  'O',
                  'N',
                  'D',
                ].map((m, i) => (
                  <Text key={i} type="supporting" color="secondary">
                    {m}
                  </Text>
                ))}
              </HStack>
            </VStack>
          </Card>
        </div>

        {/* Power Usage */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Heading level={3}>Power Usage</Heading>
              <Text type="supporting" color="secondary">
                Whole Home
              </Text>
              <div {...stylex.props(styles.chart)}>
                {[60, 45, 70, 55, 40, 65, 50, 35, 55, 45, 60, 50].map(
                  (h, i) => (
                    <div
                      key={i}
                      {...stylex.props(styles.bar)}
                      style={{height: h}}
                    />
                  ),
                )}
              </div>
              <Divider />
              <div {...stylex.props(styles.row)}>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Currently Using
                  </Text>
                  <Text type="label" weight="bold">
                    3.4 kW
                  </Text>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Solar Gen
                  </Text>
                  <Text type="label" weight="bold" color="accent">
                    +1.2 kW
                  </Text>
                </VStack>
              </div>
              <VStack gap={1}>
                <Text type="supporting" color="secondary">
                  Battery Level
                </Text>
                <ProgressBar label="Battery" value={85} hasValueLabel />
              </VStack>
            </VStack>
          </Card>
        </div>

        {/* Explore Catalog */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Heading level={3}>Explore Catalog</Heading>
              <Text type="supporting" color="secondary">
                Check your ISRC codes, metadata, and visual assets before going
                live.
              </Text>
              <Button label="View Catalog" variant="primary" size="sm" />
            </VStack>
          </Card>
        </div>

        {/* Transfer Funds */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <Heading level={3}>Transfer Funds</Heading>
                <Button
                  label=""
                  icon={<Icon icon="close" size="sm" />}
                  variant="ghost"
                  size="sm"
                />
              </div>
              <Text type="supporting" color="secondary">
                Move money between your connected accounts.
              </Text>
              <TextInput
                label="Amount to Transfer"
                value={transferAmount}
                onChange={setTransferAmount}
              />
              <Selector
                label="From Account"
                options={[
                  {
                    value: 'checking',
                    label: 'Main Checking (...8401) — $12,450.00',
                  },
                  {
                    value: 'savings',
                    label: 'High Yield Savings (...1992) — $42,100.00',
                  },
                ]}
                value={fromAccount}
                onChange={setFromAccount}
              />
              <Selector
                label="To Account"
                options={[
                  {
                    value: 'savings',
                    label: 'High Yield Savings (...1992) — $42,100.00',
                  },
                  {
                    value: 'checking',
                    label: 'Main Checking (...8401) — $12,450.00',
                  },
                ]}
                value={toAccount}
                onChange={setToAccount}
              />
              <Divider />
              <div {...stylex.props(styles.row)}>
                <Text type="body">Estimated arrival:</Text>
                <Text type="body" weight="bold">
                  Today, Apr 14
                </Text>
              </div>
              <div {...stylex.props(styles.row)}>
                <Text type="body">Transaction fee:</Text>
                <Text type="body" weight="bold">
                  $0.00
                </Text>
              </div>
              <div {...stylex.props(styles.row)}>
                <Text type="body">Total amount:</Text>
                <Text type="body" weight="bold">
                  $1,200.00
                </Text>
              </div>
              <Button
                label="Confirm Transfer"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </VStack>
          </Card>
        </div>

        {/* Set a New Milestone */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <Heading level={3}>Set a new milestone</Heading>
              <Text type="supporting" color="secondary">
                Define your financial target and we&apos;ll help you pace your
                savings.
              </Text>
              <TextInput
                label="Goal Name"
                placeholder="e.g. New Car, Home Downpayment"
                value={goalName}
                onChange={setGoalName}
              />
              <HStack gap={3}>
                <TextInput
                  label="Target Amount"
                  value={targetAmount}
                  onChange={setTargetAmount}
                />
                <TextInput
                  label="Target Date"
                  value={targetDate}
                  onChange={setTargetDate}
                />
              </HStack>
              <HStack gap={3}>
                <Button label="Create Goal" variant="primary" />
                <Button label="Cancel" variant="ghost" />
              </HStack>
            </VStack>
          </Card>
        </div>

        {/* Connect Bank */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Heading level={3}>Connect Bank</Heading>
              <Text type="supporting" color="secondary">
                Link your payment method to receive monthly royalty
                distributions automatically.
              </Text>
              <Button label="Set Up Payouts" variant="primary" size="sm" />
            </VStack>
          </Card>
        </div>

        {/* Preferences */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <Heading level={3}>Preferences</Heading>
                <Button
                  label=""
                  icon={<Icon icon="close" size="sm" />}
                  variant="ghost"
                  size="sm"
                />
              </div>
              <Text type="supporting" color="secondary">
                Manage your account settings and notifications.
              </Text>
              <Selector
                label="Default Currency"
                options={[
                  'USD — United States Dollar',
                  'EUR — Euro',
                  'GBP — British Pound',
                ]}
                value="USD — United States Dollar"
                onChange={() => {}}
              />
              <Switch
                label="Public Statistics"
                value={publicStats}
                onChange={setPublicStats}
              />
              <Text type="supporting" color="secondary">
                Allow others to see your total stream count and listening
                activity
              </Text>
              <Switch
                label="Email Notifications"
                value={emailNotifs}
                onChange={setEmailNotifs}
              />
              <Text type="supporting" color="secondary">
                Monthly royalty reports and distribution updates
              </Text>
              <Divider />
              <HStack gap={3}>
                <Button label="Reset" variant="ghost" />
                <Button label="Save Preferences" variant="primary" />
              </HStack>
            </VStack>
          </Card>
        </div>

        {/* Settings Navigation */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <HStack gap={6}>
              <VStack gap={3} style={{flex: 1}}>
                <Text type="label" weight="bold" color="secondary">
                  Overview
                </Text>
                {[
                  {name: 'Dashboard', color: 'accent' as const},
                  {name: 'Transactions', color: 'accent' as const},
                  {name: 'Investments', color: 'success' as const},
                  {name: 'Goals', color: 'success' as const},
                  {name: 'Budget', color: 'warning' as const},
                  {name: 'Reports', color: 'warning' as const},
                  {name: 'Documents', color: 'accent' as const},
                ].map(item => (
                  <HStack key={item.name} gap={2} vAlign="center">
                    <StatusDot variant={item.color} label={item.name} />
                    <Text type="body">{item.name}</Text>
                  </HStack>
                ))}
              </VStack>
              <VStack gap={3} style={{flex: 1}}>
                <Text type="label" weight="bold" color="secondary">
                  Account
                </Text>
                {[
                  {name: 'Profile', color: 'accent' as const},
                  {name: 'Billing', color: 'accent' as const},
                  {name: 'Notifications', color: 'success' as const},
                  {name: 'Security', color: 'warning' as const},
                  {name: 'Help Center', color: 'success' as const},
                  {name: 'Contact Us', color: 'accent' as const},
                  {name: 'Status', color: 'success' as const},
                ].map(item => (
                  <HStack key={item.name} gap={2} vAlign="center">
                    <StatusDot variant={item.color} label={item.name} />
                    <Text type="body">{item.name}</Text>
                  </HStack>
                ))}
              </VStack>
            </HStack>
          </Card>
        </div>

        {/* Payments Navigation */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <HStack gap={2} vAlign="center">
                <Text type="supporting" color="secondary">
                  Home
                </Text>
                <Icon icon="chevronRight" size="xsm" color="secondary" />
                <Text type="supporting" color="secondary">
                  ...
                </Text>
                <Icon icon="chevronRight" size="xsm" color="secondary" />
                <Text type="label">Payments</Text>
              </HStack>
              <Divider />
              {[
                {
                  title: 'Change transfer limit',
                  desc: 'Adjust how much you can send from your balance.',
                },
                {
                  title: 'Scheduled transfers',
                  desc: 'Set up a transfer to send at a later date.',
                },
                {
                  title: 'Direct Debits',
                  desc: 'Set up and manage regular payments.',
                },
                {
                  title: 'Recurring card payments',
                  desc: 'Manage your repeated card transactions.',
                },
              ].map((item, i) => (
                <div key={i} {...stylex.props(styles.row)}>
                  <VStack gap={1}>
                    <Text type="body" weight="bold">
                      {item.title}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {item.desc}
                    </Text>
                  </VStack>
                  <Icon icon="chevronRight" size="sm" color="secondary" />
                </div>
              ))}
            </VStack>
          </Card>
        </div>

        {/* FAQ / Settings Tabs */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <TabList value={settingsTab} onChange={setSettingsTab}>
                <Tab value="general" label="General" />
                <Tab value="billing" label="Billing" />
                <Tab value="goals" label="Goals" />
              </TabList>
              <Divider />
              <VStack gap={3}>
                <Text type="label" weight="bold">
                  How do I set up a custom financial goal?
                </Text>
                <Text type="body" color="secondary">
                  Click New Goal from the Savings Targets card. Choose a
                  category, set a target amount and date, and we&apos;ll
                  calculate the monthly contribution needed.
                </Text>
                <Divider />
                <Text type="label" weight="bold">
                  Can I track multiple goals at once?
                </Text>
                <Divider />
                <Text type="label" weight="bold">
                  How are monthly contributions calculated?
                </Text>
                <Divider />
                <Button
                  label="Contact Support"
                  variant="secondary"
                  xstyle={styles.fullWidth}
                />
              </VStack>
            </VStack>
          </Card>
        </div>

        {/* Upcoming Payments */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Heading level={3}>Upcoming Payments</Heading>
              <Text type="supporting" color="secondary">
                Select a date to view scheduled payments.
              </Text>
              <Calendar />
              <Divider />
              {[
                {
                  name: 'Netflix Subscription',
                  date: 'Apr 15, 2024',
                  amt: '$19.99',
                },
                {name: 'Rent Payment', date: 'Apr 1, 2024', amt: '$2,400.00'},
                {name: 'Auto Insurance', date: 'Apr 22, 2024', amt: '$186.00'},
              ].map((p, i) => (
                <div key={i} {...stylex.props(styles.row)}>
                  <VStack gap={0}>
                    <Text type="body" weight="bold">
                      {p.name}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {p.date}
                    </Text>
                  </VStack>
                  <Text type="body" weight="bold">
                    {p.amt}
                  </Text>
                </div>
              ))}
            </VStack>
          </Card>
        </div>

        {/* QR Code / Mobile Connect */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <div {...stylex.props(styles.placeholder)}>
                <Text type="body" color="secondary">
                  QR Code
                </Text>
              </div>
              <Heading level={3}>Scan to connect your mobile device</Heading>
              <Text type="supporting" color="secondary">
                Open the Ledger mobile app and scan this code to link your
                device.
              </Text>
              <Button
                label="Got it"
                variant="secondary"
                xstyle={styles.fullWidth}
              />
            </VStack>
          </Card>
        </div>

        {/* Q2 Dividend Income */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <Heading level={3}>Q2 Dividend Income</Heading>
                <Button
                  label=""
                  icon={<Icon icon="close" size="sm" />}
                  variant="ghost"
                  size="sm"
                />
              </div>
              <Text type="supporting" color="secondary">
                Quarterly dividend payouts across your portfolio holdings.
              </Text>
              <Divider />
              {[
                {name: 'Vanguard VIG', shares: '450 Shares', amt: '$1,842.10'},
                {name: 'S&P 500 VOO', shares: '112 Shares', amt: '$928.40'},
                {name: 'Apple AAPL', shares: '85 Shares', amt: '$340.00'},
                {name: 'Realty Income', shares: '320 Shares', amt: '$1,139.50'},
              ].map((d, i) => (
                <div key={i} {...stylex.props(styles.row)}>
                  <VStack gap={0}>
                    <Text type="body" weight="bold">
                      {d.name}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {d.shares}
                    </Text>
                  </VStack>
                  <HStack gap={2} vAlign="center">
                    <Sparkline values={[8, 12, 6, 15, 10, 18]} />
                    <Text type="body" weight="bold">
                      {d.amt}
                    </Text>
                  </HStack>
                </div>
              ))}
            </VStack>
          </Card>
        </div>

        {/* Savings Target Progress */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Heading level={2}>$24,000</Heading>
              <Text type="supporting" color="secondary">
                80% of $30,000
              </Text>
              <ProgressBar label="Savings Progress" value={80} />
              <Divider />
              <div {...stylex.props(styles.row)}>
                <Text type="body">Projected Finish</Text>
                <Text type="body" weight="bold">
                  October 2024
                </Text>
              </div>
              <div {...stylex.props(styles.row)}>
                <Text type="body">Monthly Average</Text>
                <Text type="body" weight="bold">
                  $1,250
                </Text>
              </div>
              <div {...stylex.props(styles.row)}>
                <Text type="body">Top Contributor</Text>
                <Text type="body" weight="bold">
                  Auto-Transfer
                </Text>
              </div>
            </VStack>
          </Card>
        </div>

        {/* Dollar-Cost Averaging */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Heading level={3}>Dollar-Cost Averaging</Heading>
              <Text type="supporting" color="secondary">
                A strategy for building wealth over time.
              </Text>
              <Text type="body" color="secondary">
                Over time, this smooths out the average cost of your
                investments. When prices drop, your fixed amount buys more
                shares. When prices rise, you buy fewer. The result is a lower
                average cost per share compared to lump-sum investing during
                volatile periods.
              </Text>
            </VStack>
          </Card>
        </div>

        {/* Cover Art / Upload */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Text type="supporting" color="secondary">
                COVER ART
              </Text>
              <img
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop"
                alt="Cover art"
                style={{
                  width: '100%',
                  height: 160,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
              <Heading level={3}>Upload Artwork</Heading>
              <Text type="supporting" color="secondary">
                Minimum 3000 × 3000px — JPEG or PNG only
              </Text>
            </VStack>
          </Card>
        </div>

        {/* Front Door (Smart Home) */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <VStack gap={0}>
                  <Heading level={3}>Front Door</Heading>
                  <Text type="supporting" color="secondary">
                    Smart Lock Pro
                  </Text>
                </VStack>
                <HStack gap={2} vAlign="center">
                  <Text type="supporting">Locked</Text>
                  <StatusDot variant="success" label="Locked" />
                </HStack>
              </div>
              <div {...stylex.props(styles.placeholder)}>
                <Badge label="Live" variant="error" />
              </div>
            </VStack>
          </Card>
        </div>

        {/* Stock Holdings */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <TextInput
                label="Search holdings"
                placeholder="Search holdings or tickers..."
                value=""
                onChange={() => {}}
              />
              <HStack gap={3}>
                <Token label="Stocks" />
                <Token label="ETFs" />
                <Token label="REITs" />
              </HStack>
              <Divider />
              {[
                {
                  ticker: 'VOO',
                  name: 'Vanguard S&P 500 ETF',
                  info: '112 SHARES · JAN 2021',
                  type: 'ETF',
                  value: '$48,230.40',
                },
                {
                  ticker: 'VIG',
                  name: 'Vanguard Dividend Appreciation',
                  info: '450 SHARES · MAR 2022',
                  type: 'ETF',
                  value: '$26,033.79',
                },
                {
                  ticker: 'AAPL',
                  name: 'Apple Inc.',
                  info: '85 SHARES · NOV 2020',
                  type: 'Stock',
                  value: '$18,488.90',
                },
                {
                  ticker: 'O',
                  name: 'Realty Income Corp',
                  info: '320 SHARES · JUN 2023',
                  type: 'REIT',
                  value: '$15,136.59',
                },
              ].map((s, i) => (
                <div key={i}>
                  <div {...stylex.props(styles.row)}>
                    <HStack gap={3} vAlign="center">
                      <Avatar name={s.ticker} size="md" />
                      <VStack gap={0}>
                        <Text type="body" weight="bold">
                          {s.name}
                        </Text>
                        <Text type="supporting" color="secondary">
                          {s.info}
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack gap={0} style={{alignItems: 'flex-end'}}>
                      <Text type="supporting" color="secondary">
                        {s.type}
                      </Text>
                      <Text type="body" weight="bold">
                        {s.value}
                      </Text>
                    </VStack>
                  </div>
                  {i < 3 && <Divider />}
                </div>
              ))}
            </VStack>
          </Card>
        </div>

        {/* Kitchen Island (Smart Home) */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <Heading level={3}>Kitchen Island</Heading>
                <Switch label="On" value={true} onChange={() => {}} />
              </div>
              <Text type="supporting" color="secondary">
                Hue Color Ambient
              </Text>
              <HStack gap={2}>
                {['Cooking', 'Dining', 'Nightlight', 'Focus'].map(m => (
                  <Token key={m} label={m} />
                ))}
              </HStack>
              <Slider
                label="Brightness"
                value={brightness}
                onChange={(v: number) => setBrightness(v)}
              />
              <Slider
                label="Color Temp"
                value={colorTemp}
                onChange={(v: number) => setColorTemp(v)}
              />
            </VStack>
          </Card>
        </div>

        {/* Living Room (Smart Home) */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <Heading level={3}>Living Room</Heading>
              <Text type="supporting" color="secondary">
                Roller Shades
              </Text>
              <div
                {...stylex.props(styles.placeholder)}
                style={{height: 100}}
              />
              <Slider label="Position" value={50} onChange={() => {}} />
              <HStack gap={3}>
                <Button label="Open" variant="ghost" size="sm" />
                <Button label="Half" variant="ghost" size="sm" />
                <Button label="Closed" variant="ghost" size="sm" />
              </HStack>
            </VStack>
          </Card>
        </div>

        {/* Social Links */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <Heading level={3}>Social Links</Heading>
              <TextInput
                label="Spotify Artist URL"
                value={spotifyUrl}
                onChange={setSpotifyUrl}
              />
              <TextInput
                label="Instagram Handle"
                value={igHandle}
                onChange={setIgHandle}
              />
              <TextInput
                label="SoundCloud URL"
                value={scUrl}
                onChange={setScUrl}
              />
              <TextInput
                label="Website"
                value={website}
                onChange={setWebsite}
              />
              <HStack gap={3}>
                <Button label="Discard" variant="ghost" />
                <Button label="Save Changes" variant="primary" />
              </HStack>
            </VStack>
          </Card>
        </div>

        {/* Notifications */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={4}>
              <Heading level={3}>Notifications</Heading>
              <Text type="supporting" color="secondary">
                Choose what you want to be notified about.
              </Text>
              <CheckboxInput
                label="Select all"
                value={selectAll}
                onChange={setSelectAll}
              />
              <Divider />
              <CheckboxInput
                label="Transaction alerts"
                value={txnAlerts}
                onChange={setTxnAlerts}
              />
              <Text type="supporting" color="secondary">
                Deposits, withdrawals, and transfers.
              </Text>
              <CheckboxInput
                label="Security alerts"
                value={secAlerts}
                onChange={setSecAlerts}
              />
              <Text type="supporting" color="secondary">
                Login attempts and account changes.
              </Text>
              <CheckboxInput
                label="Goal milestones"
                value={goalMilestones}
                onChange={setGoalMilestones}
              />
              <Text type="supporting" color="secondary">
                Updates at 25%, 50%, 75%, and 100%.
              </Text>
              <CheckboxInput
                label="Market updates"
                value={marketUpdates}
                onChange={setMarketUpdates}
              />
              <Text type="supporting" color="secondary">
                Daily portfolio summary and price alerts.
              </Text>
              <Button
                label="Save Preferences"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </VStack>
          </Card>
        </div>

        {/* Syncing Accounts */}
        <div style={{breakInside: 'avoid', marginBottom: 24}}>
          <Card>
            <VStack gap={3}>
              <HStack gap={3} vAlign="center">
                <Spinner size="sm" />
                <VStack gap={1}>
                  <Heading level={3}>Syncing your accounts</Heading>
                  <Text type="supporting" color="secondary">
                    We&apos;re pulling in your latest transactions. This usually
                    takes a few seconds.
                  </Text>
                </VStack>
              </HStack>
              <Button
                label="Cancel"
                variant="ghost"
                xstyle={styles.fullWidth}
              />
            </VStack>
          </Card>
        </div>

        {/* Badges & Tokens */}
        <div
          style={{
            breakInside: 'avoid',
            marginBottom: 24,
            gridColumn: '1 / -1',
          }}>
          <Card>
            <VStack gap={4}>
              <Heading level={3}>Badges & Tokens</Heading>
              <Divider />
              <VStack gap={3}>
                <Text type="supporting" color="secondary">
                  Badge Variants
                </Text>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Badge label="Default" />
                  <Badge label="Info" variant="info" />
                  <Badge label="Success" variant="success" />
                  <Badge label="Warning" variant="warning" />
                  <Badge label="Error" variant="error" />
                </HStack>
                <Divider />
                <Text type="supporting" color="secondary">
                  Tokens
                </Text>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Token label="Default" />
                  <Token label="Blue" color="blue" />
                  <Token label="Green" color="green" />
                  <Token label="Red" color="red" />
                  <Token label="Orange" color="orange" />
                  <Token label="Purple" color="purple" />
                  <Token label="Pink" color="pink" />
                  <Token label="Gray" color="gray" />
                </HStack>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Token label="Removable" onRemove={() => {}} />
                  <Token label="Clickable" onClick={() => {}} />
                  <Token label="Disabled" isDisabled />
                </HStack>
              </VStack>
            </VStack>
          </Card>
        </div>

        {/* Input Components */}
        <div
          style={{
            breakInside: 'avoid',
            marginBottom: 24,
            gridColumn: '1 / -1',
          }}>
          <Card>
            <VStack gap={4}>
              <Heading level={3}>Input Components</Heading>
              <Divider />
              <VStack gap={4}>
                <HStack gap={4} wrap="wrap">
                  <TextInput
                    label="Default"
                    placeholder="Enter text..."
                    value=""
                    onChange={() => {}}
                  />
                  <TextInput
                    label="With value"
                    value="Hello world"
                    onChange={() => {}}
                  />
                  <TextInput
                    label="Disabled"
                    value="Can't edit"
                    isDisabled
                    onChange={() => {}}
                  />
                </HStack>
                <HStack gap={4} wrap="wrap">
                  <TextInput
                    label="Error state"
                    status={{type: 'error', message: 'This field is required'}}
                    value=""
                    onChange={() => {}}
                  />
                  <TextInput
                    label="Success state"
                    status={{type: 'success', message: 'Looks good!'}}
                    value="Valid input"
                    onChange={() => {}}
                  />
                  <TextInput
                    label="With placeholder"
                    placeholder="Enter email..."
                    value=""
                    onChange={() => {}}
                  />
                </HStack>
                <Divider />
                <Text type="supporting" color="secondary">
                  Selector
                </Text>
                <HStack gap={4} wrap="wrap">
                  <Selector
                    label="Choose option"
                    options={['Option A', 'Option B', 'Option C']}
                    value="Option A"
                    onChange={() => {}}
                  />
                  <Selector
                    label="Disabled"
                    options={['Locked']}
                    value="Locked"
                    isDisabled
                    onChange={() => {}}
                  />
                </HStack>
                <Divider />
                <Text type="supporting" color="secondary">
                  Slider
                </Text>
                <Slider label="Volume" value={65} onChange={() => {}} />
                <Divider />
                <Text type="supporting" color="secondary">
                  Toggle Controls
                </Text>
                <HStack gap={6} vAlign="center" wrap="wrap">
                  <Switch label="On" value={true} onChange={() => {}} />
                  <Switch label="Off" value={false} onChange={() => {}} />
                  <Switch
                    label="Disabled on"
                    value={true}
                    isDisabled
                    onChange={() => {}}
                  />
                  <Switch
                    label="Disabled off"
                    value={false}
                    isDisabled
                    onChange={() => {}}
                  />
                </HStack>
                <Divider />
                <Text type="supporting" color="secondary">
                  Checkbox
                </Text>
                <HStack gap={6} wrap="wrap">
                  <CheckboxInput
                    label="Checked"
                    value={true}
                    onChange={() => {}}
                  />
                  <CheckboxInput
                    label="Unchecked"
                    value={false}
                    onChange={() => {}}
                  />
                  <CheckboxInput
                    label="Checked disabled"
                    value={true}
                    isDisabled
                    onChange={() => {}}
                  />
                  <CheckboxInput
                    label="Unchecked disabled"
                    value={false}
                    isDisabled
                    onChange={() => {}}
                  />
                </HStack>
                <Divider />
                <Text type="supporting" color="secondary">
                  Radio
                </Text>
                <RadioList label="Radio" value="a" onChange={() => {}}>
                  <RadioListItem value="a" label="Choice A" />
                  <RadioListItem value="b" label="Choice B" />
                  <RadioListItem
                    value="c"
                    label="Choice C (disabled)"
                    isDisabled
                  />
                </RadioList>
              </VStack>
            </VStack>
          </Card>
        </div>

        {/* Button Variants */}
        <div
          style={{
            breakInside: 'avoid',
            marginBottom: 24,
            gridColumn: '1 / -1',
          }}>
          <Card>
            <VStack gap={4}>
              <Heading level={3}>Button Variants</Heading>
              <Divider />
              <VStack gap={3}>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Primary
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Button label="Small" variant="primary" size="sm" />
                    <Button label="Medium" variant="primary" size="md" />
                    <Button label="Large" variant="primary" size="lg" />
                    <Button label="Disabled" variant="primary" isDisabled />
                  </HStack>
                </VStack>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Secondary
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Button label="Small" variant="secondary" size="sm" />
                    <Button label="Medium" variant="secondary" size="md" />
                    <Button label="Large" variant="secondary" size="lg" />
                    <Button label="Disabled" variant="secondary" isDisabled />
                  </HStack>
                </VStack>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Destructive
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Button label="Small" variant="destructive" size="sm" />
                    <Button label="Medium" variant="destructive" size="md" />
                    <Button label="Large" variant="destructive" size="lg" />
                    <Button label="Disabled" variant="destructive" isDisabled />
                  </HStack>
                </VStack>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Ghost
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Button label="Small" variant="ghost" size="sm" />
                    <Button label="Medium" variant="ghost" size="md" />
                    <Button label="Large" variant="ghost" size="lg" />
                    <Button label="Disabled" variant="ghost" isDisabled />
                  </HStack>
                </VStack>
                <Divider />
                <Text type="supporting" color="secondary">
                  Theme-specific variants (Meta)
                </Text>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Primary Muted
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Button
                      label="Small"
                      variant={'primary-muted' as never}
                      size="sm"
                    />
                    <Button
                      label="Medium"
                      variant={'primary-muted' as never}
                      size="md"
                    />
                    <Button
                      label="Large"
                      variant={'primary-muted' as never}
                      size="lg"
                    />
                    <Button
                      label="Disabled"
                      variant={'primary-muted' as never}
                      isDisabled
                    />
                  </HStack>
                </VStack>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Destructive Muted
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Button
                      label="Small"
                      variant={'destructive-muted' as never}
                      size="sm"
                    />
                    <Button
                      label="Medium"
                      variant={'destructive-muted' as never}
                      size="md"
                    />
                    <Button
                      label="Large"
                      variant={'destructive-muted' as never}
                      size="lg"
                    />
                    <Button
                      label="Disabled"
                      variant={'destructive-muted' as never}
                      isDisabled
                    />
                  </HStack>
                </VStack>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Primary Outline
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Button
                      label="Small"
                      variant={'primary-outline' as never}
                      size="sm"
                    />
                    <Button
                      label="Medium"
                      variant={'primary-outline' as never}
                      size="md"
                    />
                    <Button
                      label="Large"
                      variant={'primary-outline' as never}
                      size="lg"
                    />
                    <Button
                      label="Disabled"
                      variant={'primary-outline' as never}
                      isDisabled
                    />
                  </HStack>
                </VStack>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Secondary Outline
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Button
                      label="Small"
                      variant={'secondary-outline' as never}
                      size="sm"
                    />
                    <Button
                      label="Medium"
                      variant={'secondary-outline' as never}
                      size="md"
                    />
                    <Button
                      label="Large"
                      variant={'secondary-outline' as never}
                      size="lg"
                    />
                    <Button
                      label="Disabled"
                      variant={'secondary-outline' as never}
                      isDisabled
                    />
                  </HStack>
                </VStack>
                <VStack gap={1}>
                  <Text type="supporting" color="secondary">
                    Destructive Outline
                  </Text>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Button
                      label="Small"
                      variant={'destructive-outline' as never}
                      size="sm"
                    />
                    <Button
                      label="Medium"
                      variant={'destructive-outline' as never}
                      size="md"
                    />
                    <Button
                      label="Large"
                      variant={'destructive-outline' as never}
                      size="lg"
                    />
                    <Button
                      label="Disabled"
                      variant={'destructive-outline' as never}
                      isDisabled
                    />
                  </HStack>
                </VStack>
              </VStack>
            </VStack>
          </Card>
        </div>

        {/* Typography Scale */}
        <div
          style={{
            breakInside: 'avoid',
            marginBottom: 24,
            gridColumn: '1 / -1',
          }}>
          <Card>
            <VStack gap={4}>
              <Heading level={3}>Typography Scale</Heading>
              <Divider />
              <VStack gap={3}>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Display 1
                  </Text>
                  <Text type="display-1" as="h1">
                    The quick brown fox
                  </Text>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Display 2
                  </Text>
                  <Text type="display-2" as="h1">
                    The quick brown fox
                  </Text>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Display 3
                  </Text>
                  <Text type="display-3" as="h1">
                    The quick brown fox
                  </Text>
                </VStack>
                <Divider />
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Heading 1
                  </Text>
                  <Heading level={1}>The quick brown fox</Heading>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Heading 2
                  </Text>
                  <Heading level={2}>The quick brown fox</Heading>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Heading 3
                  </Text>
                  <Heading level={3}>The quick brown fox</Heading>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Heading 4
                  </Text>
                  <Heading level={4}>The quick brown fox</Heading>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Heading 5
                  </Text>
                  <Heading level={5}>The quick brown fox</Heading>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Heading 6
                  </Text>
                  <Heading level={6}>The quick brown fox</Heading>
                </VStack>
                <Divider />
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Large
                  </Text>
                  <Text type="large">
                    The quick brown fox jumps over the lazy dog
                  </Text>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Body
                  </Text>
                  <Text type="body">
                    The quick brown fox jumps over the lazy dog
                  </Text>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Label
                  </Text>
                  <Text type="label">
                    The quick brown fox jumps over the lazy dog
                  </Text>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Supporting
                  </Text>
                  <Text type="supporting">
                    The quick brown fox jumps over the lazy dog
                  </Text>
                </VStack>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    Code
                  </Text>
                  <Text type="code">const fox = &apos;quick brown&apos;;</Text>
                </VStack>
              </VStack>
            </VStack>
          </Card>
        </div>
      </div>
    </>
  );
}
