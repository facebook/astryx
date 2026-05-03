'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {useThemeControls} from '../../../providers';
import type {ThemeMode} from '@xds/core/theme';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSIcon} from '@xds/core/Icon';
import {XDSLink} from '@xds/core/Link';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSSelector} from '@xds/core/Selector';
import {XDSSlider} from '@xds/core/Slider';
import {XDSCalendar} from '@xds/core/Calendar';
import {XDSToken} from '@xds/core/Token';

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
    'Default',
    'Neutral',
    'Brutalist',
    'Meta',
    'WhatsApp',
    'Daily',
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
        <XDSHeading level={3}>
          {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
        </XDSHeading>
        <XDSHStack gap={2}>
          <XDSSelector
            label="Theme"
           
            options={themeOptions}
            value={themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            onChange={(v: string) => setThemeName(v.toLowerCase())}
            size="sm"
          />
          <XDSSelector
            label="Mode"
           
            options={modeOptions}
            value={mode === 'dark' ? 'Dark' : 'Light'}
            onChange={(v: string) => setMode(v.toLowerCase() as ThemeMode)}
            size="sm"
          />
        </XDSHStack>
      </div>
      <XDSDivider />
      <div
        style={{
          columnCount: 4,
          columnGap: 24,
          padding: 24,
          backgroundColor: 'var(--color-background-muted)',
          minHeight: '100%',
        }}>
        {/* Contribution History */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <XDSHeading level={3}>
                  Contribution History
                </XDSHeading>
                <XDSBadge label="+12% vs last month" variant="info" />
              </div>
              <XDSText type="supporting" color="secondary">
                Last 6 months of activity
              </XDSText>
              <div {...stylex.props(styles.chart)}>
                {[40, 55, 60, 70, 55, 65].map((h, i) => (
                  <div
                    key={i}
                    {...stylex.props(styles.barPurple)}
                    style={{height: h}}
                  />
                ))}
              </div>
              <XDSHStack gap={4}>
                {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => (
                  <XDSText key={m} type="supporting" color="secondary">
                    {m}
                  </XDSText>
                ))}
              </XDSHStack>
              <XDSDivider />
              <div {...stylex.props(styles.row)}>
                <div {...stylex.props(styles.sectionContainer)}>
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
                <div {...stylex.props(styles.sectionContainer)}>
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
              </div>
              <XDSButton
                label="View Full Report"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Payout Threshold */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <XDSHeading level={3}>
                  Payout Threshold
                </XDSHeading>
                <XDSButton label="" icon={<XDSIcon icon="close" size="sm" />} variant="ghost" size="sm" />
              </div>
              <XDSText type="supporting" color="secondary">
                Set the minimum balance required before a payout is triggered.
              </XDSText>
              <XDSSelector
                label="Preferred Currency"
                options={[
                  'USD — United States Dollar',
                  'EUR — Euro',
                  'GBP — British Pound',
                ]}
                value="USD — United States Dollar"
                onChange={() => {}}
              />
              <XDSVStack gap={2}>
                <div {...stylex.props(styles.row)}>
                  <XDSText type="label">Minimum Payout Amount</XDSText>
                  <XDSHeading level={2}>$2500.00</XDSHeading>
                </div>
                <XDSSlider
                  label="Payout amount"
                  isLabelHidden
                  value={50}
                  onChange={() => {}}
                />
                <div {...stylex.props(styles.row)}>
                  <XDSText type="supporting" color="secondary">
                    $50 (MIN)
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    $10,000 (MAX)
                  </XDSText>
                </div>
              </XDSVStack>
              <XDSTextInput
                label="Notes"
                placeholder="Add any notes for this payout configuration..."
                value={notes}
                onChange={setNotes}
              />
              <XDSButton
                label="Save Threshold"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Savings Targets */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <XDSHeading level={3}>
                  Savings Targets
                </XDSHeading>
                <XDSButton label="New Goal" variant="primary" size="sm" />
              </div>
              <XDSText type="supporting" color="secondary">
                Active milestones for 2024
              </XDSText>
              <XDSVStack gap={1}>
                <XDSText type="supporting" color="secondary">
                  RETIREMENT
                </XDSText>
                <XDSHeading level={2}>$420,000</XDSHeading>
                <XDSProgressBar label="Retirement" value={65} />
                <div {...stylex.props(styles.row)}>
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
                <div {...stylex.props(styles.row)}>
                  <XDSText type="supporting" color="secondary">
                    32% achieved
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    $27,200
                  </XDSText>
                </div>
              </XDSVStack>
              <XDSText type="supporting" color="secondary">
                You have not met your targets for this year.
              </XDSText>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Buy Investment */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>
                Buy Investment
              </XDSHeading>
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
              <XDSDivider />
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Estimated Shares</XDSText>
                <XDSText type="body" weight="bold">
                  1.95
                </XDSText>
              </div>
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Buying Power</XDSText>
                <XDSText type="body" weight="bold">
                  $12,450.00
                </XDSText>
              </div>
              <XDSButton
                label="Review Order"
                variant="primary"
                xstyle={styles.fullWidth}
              />
              <XDSText type="supporting" color="secondary">
                Trades are typically executed within minutes during market
                hours.
              </XDSText>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Account Access */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>
                Account Access
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Update your credentials or re-authenticate.
              </XDSText>
              <XDSTextInput
                label="Email Address"
                value={email}
                onChange={setEmail}
              />
              <XDSTextInput
                label="Current Password"
                type="password"
                value="password123"
                onChange={() => {}}
              />
              <XDSButton
                label="Update Security"
                variant="primary"
                xstyle={styles.fullWidth}
              />
              <XDSVStack gap={2}>
                <XDSHStack gap={2} vAlign="center">
                  <XDSStatusDot variant="warning" label="Warning" />
                  <XDSText type="supporting">Danger Zone</XDSText>
                </XDSHStack>
                <XDSText type="supporting" color="secondary">
                  Archive account and remove catalog
                </XDSText>
              </XDSVStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Payout Preferences */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <XDSHeading level={3}>
                  Payout Preferences
                </XDSHeading>
                <XDSButton label="" icon={<XDSIcon icon="close" size="sm" />} variant="ghost" size="sm" />
              </div>
              <XDSText type="supporting" color="secondary">
                Receiving Method
              </XDSText>
              <XDSTextInput
                label="Account Holder Name"
                value="Synthetic Horizons Music LLC"
                onChange={() => {}}
              />
              <XDSRadioList
                label="Receiving Method"
                value="bank"
                onChange={() => {}}>
                <XDSRadioListItem
                  value="bank"
                  label="Bank Transfer — SWIFT / IBAN"
                />
                <XDSRadioListItem
                  value="paypal"
                  label="PayPal — Instant Payout"
                />
              </XDSRadioList>
              <XDSTextInput
                label="IBAN / Account Number"
                value="DE89 3704 0044 ..."
                onChange={() => {}}
              />
              <XDSButton
                label="Save Payout Settings"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Stock Performance */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHeading level={3}>
                Stock Performance
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                6-month price history.
              </XDSText>
              <XDSSelector
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
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Distribute Track */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHeading level={3}>
                Distribute Track
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Upload your first master and start reaching listeners on
                Spotify, Apple Music and more.
              </XDSText>
              <XDSHStack gap={2}>
                <XDSButton label="Create Release" variant="primary" size="sm" />
                <XDSButton label="+" variant="secondary" size="sm" />
              </XDSHStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Clearinghouse Balance */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSText type="supporting" color="secondary">
                Clearhouse Balance
              </XDSText>
              <XDSHeading level={1}>$0.00</XDSHeading>
              <XDSHStack gap={2} vAlign="center">
                <div {...stylex.props(styles.dot)} />
                <XDSText type="supporting" color="secondary">
                  Pending Setup
                </XDSText>
              </XDSHStack>
              <XDSDivider />
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Net Royalties</XDSText>
                <XDSText type="body" weight="bold">
                  $0.00
                </XDSText>
              </div>
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Processing Fee</XDSText>
                <XDSText type="body" weight="bold">
                  -$0.00
                </XDSText>
              </div>
              <XDSDivider />
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Total Ready to Claim</XDSText>
                <XDSText type="body" weight="bold">
                  $0.00 USD
                </XDSText>
              </div>
              <XDSText type="supporting" color="secondary">
                Once your bank is connected, balances over $10.00 are
                automatically eligible for monthly distribution on the 15th of
                each month.
              </XDSText>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Recent Transactions */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <XDSVStack gap={1}>
                  <XDSHeading level={3}>
                    Recent Transactions
                  </XDSHeading>
                  <XDSText type="supporting" color="secondary">
                    Your latest account activity.
                  </XDSText>
                </XDSVStack>
                <XDSLink href="#">
                  View All
                </XDSLink>
              </div>
              <XDSDivider />
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
                    <XDSHStack gap={3} vAlign="center">
                      <XDSAvatar name={txn.initials} size="small" />
                      <XDSVStack gap={0}>
                        <XDSText type="body" weight="bold">
                          {txn.name}
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          {txn.cat}
                        </XDSText>
                      </XDSVStack>
                    </XDSHStack>
                    <XDSVStack gap={0} style={{alignItems: 'flex-end'}}>
                      <XDSText type="body" weight="bold">
                        {txn.amt}
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        {txn.date}
                      </XDSText>
                    </XDSVStack>
                  </div>
                  {i < 4 && <XDSDivider />}
                </div>
              ))}
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Card Balance */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">
                    Card Balance
                  </XDSText>
                  <XDSHeading level={3}>US$12.94</XDSHeading>
                  <XDSText type="supporting" color="secondary">
                    US$ 1,337.06 Available
                  </XDSText>
                </XDSVStack>
                <XDSVStack gap={0} style={{alignItems: 'flex-end'}}>
                  <XDSText type="supporting" color="secondary">
                    Payment Due
                  </XDSText>
                  <XDSHeading level={3}>1 Apr</XDSHeading>
                  <XDSLink href="#">
                    Pay Early
                  </XDSLink>
                </XDSVStack>
              </div>
              <XDSText type="supporting" color="secondary">
                Yearly Activity
              </XDSText>
              <XDSHStack gap={2} vAlign="center">
                <XDSText type="supporting" color="secondary">
                  +US$0.25 Daily Cash
                </XDSText>
              </XDSHStack>
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
              <XDSHStack gap={2}>
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
                  <XDSText key={i} type="supporting" color="secondary">
                    {m}
                  </XDSText>
                ))}
              </XDSHStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Power Usage */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHeading level={3}>
                Power Usage
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Whole Home
              </XDSText>
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
              <XDSDivider />
              <div {...stylex.props(styles.row)}>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">
                    Currently Using
                  </XDSText>
                  <XDSText type="label" weight="bold">
                    3.4 kW
                  </XDSText>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">
                    Solar Gen
                  </XDSText>
                  <XDSText type="label" weight="bold" color="active">
                    +1.2 kW
                  </XDSText>
                </XDSVStack>
              </div>
              <XDSVStack gap={1}>
                <XDSText type="supporting" color="secondary">
                  Battery Level
                </XDSText>
                <XDSProgressBar label="Battery" value={85} hasValueLabel />
              </XDSVStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Explore Catalog */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHeading level={3}>
                Explore Catalog
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Check your ISRC codes, metadata, and visual assets before going
                live.
              </XDSText>
              <XDSButton label="View Catalog" variant="primary" size="sm" />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Transfer Funds */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <XDSHeading level={3}>
                  Transfer Funds
                </XDSHeading>
                <XDSButton label="" icon={<XDSIcon icon="close" size="sm" />} variant="ghost" size="sm" />
              </div>
              <XDSText type="supporting" color="secondary">
                Move money between your connected accounts.
              </XDSText>
              <XDSTextInput
                label="Amount to Transfer"
                value={transferAmount}
                onChange={setTransferAmount}
              />
              <XDSSelector
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
              <XDSSelector
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
              <XDSDivider />
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Estimated arrival:</XDSText>
                <XDSText type="body" weight="bold">
                  Today, Apr 14
                </XDSText>
              </div>
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Transaction fee:</XDSText>
                <XDSText type="body" weight="bold">
                  $0.00
                </XDSText>
              </div>
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Total amount:</XDSText>
                <XDSText type="body" weight="bold">
                  $1,200.00
                </XDSText>
              </div>
              <XDSButton
                label="Confirm Transfer"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Set a New Milestone */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>
                Set a new milestone
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Define your financial target and we&apos;ll help you pace your
                savings.
              </XDSText>
              <XDSTextInput
                label="Goal Name"
                placeholder="e.g. New Car, Home Downpayment"
                value={goalName}
                onChange={setGoalName}
              />
              <XDSHStack gap={3}>
                <XDSTextInput
                  label="Target Amount"
                  value={targetAmount}
                  onChange={setTargetAmount}
                />
                <XDSTextInput
                  label="Target Date"
                  value={targetDate}
                  onChange={setTargetDate}
                />
              </XDSHStack>
              <XDSHStack gap={3}>
                <XDSButton label="Create Goal" variant="primary" />
                <XDSButton label="Cancel" variant="ghost" />
              </XDSHStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Connect Bank */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHeading level={3}>
                Connect Bank
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Link your payment method to receive monthly royalty
                distributions automatically.
              </XDSText>
              <XDSButton label="Set Up Payouts" variant="primary" size="sm" />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Preferences */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <XDSHeading level={3}>
                  Preferences
                </XDSHeading>
                <XDSButton label="" icon={<XDSIcon icon="close" size="sm" />} variant="ghost" size="sm" />
              </div>
              <XDSText type="supporting" color="secondary">
                Manage your account settings and notifications.
              </XDSText>
              <XDSSelector
                label="Default Currency"
                options={[
                  'USD — United States Dollar',
                  'EUR — Euro',
                  'GBP — British Pound',
                ]}
                value="USD — United States Dollar"
                onChange={() => {}}
              />
              <XDSSwitch
                label="Public Statistics"
                value={publicStats}
                onChange={setPublicStats}
              />
              <XDSText type="supporting" color="secondary">
                Allow others to see your total stream count and listening
                activity
              </XDSText>
              <XDSSwitch
                label="Email Notifications"
                value={emailNotifs}
                onChange={setEmailNotifs}
              />
              <XDSText type="supporting" color="secondary">
                Monthly royalty reports and distribution updates
              </XDSText>
              <XDSDivider />
              <XDSHStack gap={3}>
                <XDSButton label="Reset" variant="ghost" />
                <XDSButton label="Save Preferences" variant="primary" />
              </XDSHStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Settings Navigation */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSHStack gap={6}>
              <XDSVStack gap={3} style={{flex: 1}}>
                <XDSText type="label" weight="bold" color="secondary">
                  Overview
                </XDSText>
                {[
                  {name: 'Dashboard', color: 'info' as const},
                  {name: 'Transactions', color: 'info' as const},
                  {name: 'Investments', color: 'positive' as const},
                  {name: 'Goals', color: 'positive' as const},
                  {name: 'Budget', color: 'warning' as const},
                  {name: 'Reports', color: 'warning' as const},
                  {name: 'Documents', color: 'info' as const},
                ].map(item => (
                  <XDSHStack key={item.name} gap={2} vAlign="center">
                    <XDSStatusDot variant={item.color} label={item.name} />
                    <XDSText type="body">{item.name}</XDSText>
                  </XDSHStack>
                ))}
              </XDSVStack>
              <XDSVStack gap={3} style={{flex: 1}}>
                <XDSText type="label" weight="bold" color="secondary">
                  Account
                </XDSText>
                {[
                  {name: 'Profile', color: 'info' as const},
                  {name: 'Billing', color: 'info' as const},
                  {name: 'Notifications', color: 'positive' as const},
                  {name: 'Security', color: 'warning' as const},
                  {name: 'Help Center', color: 'positive' as const},
                  {name: 'Contact Us', color: 'info' as const},
                  {name: 'Status', color: 'positive' as const},
                ].map(item => (
                  <XDSHStack key={item.name} gap={2} vAlign="center">
                    <XDSStatusDot variant={item.color} label={item.name} />
                    <XDSText type="body">{item.name}</XDSText>
                  </XDSHStack>
                ))}
              </XDSVStack>
            </XDSHStack>
          </XDSCard>
        </div>

        {/* Payments Navigation */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHStack gap={2} vAlign="center">
                <XDSText type="supporting" color="secondary">
                  Home
                </XDSText>
                <XDSIcon icon="chevronRight" size="xsm" color="secondary" />
                <XDSText type="supporting" color="secondary">
                  ...
                </XDSText>
                <XDSIcon icon="chevronRight" size="xsm" color="secondary" />
                <XDSText type="label">Payments</XDSText>
              </XDSHStack>
              <XDSDivider />
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
                  <XDSVStack gap={1}>
                    <XDSText type="body" weight="bold">
                      {item.title}
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      {item.desc}
                    </XDSText>
                  </XDSVStack>
                  <XDSIcon icon="chevronRight" size="sm" color="secondary" />
                </div>
              ))}
            </XDSVStack>
          </XDSCard>
        </div>

        {/* FAQ / Settings Tabs */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSTabList value={settingsTab} onChange={setSettingsTab}>
                <XDSTab value="general" label="General" />
                <XDSTab value="billing" label="Billing" />
                <XDSTab value="goals" label="Goals" />
              </XDSTabList>
              <XDSDivider />
              <XDSVStack gap={3}>
                <XDSText type="label" weight="bold">
                  How do I set up a custom financial goal?
                </XDSText>
                <XDSText type="body" color="secondary">
                  Click New Goal from the Savings Targets card. Choose a
                  category, set a target amount and date, and we&apos;ll
                  calculate the monthly contribution needed.
                </XDSText>
                <XDSDivider />
                <XDSText type="label" weight="bold">
                  Can I track multiple goals at once?
                </XDSText>
                <XDSDivider />
                <XDSText type="label" weight="bold">
                  How are monthly contributions calculated?
                </XDSText>
                <XDSDivider />
                <XDSButton
                  label="Contact Support"
                  variant="secondary"
                  xstyle={styles.fullWidth}
                />
              </XDSVStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Upcoming Payments */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHeading level={3}>
                Upcoming Payments
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Select a date to view scheduled payments.
              </XDSText>
              <XDSCalendar />
              <XDSDivider />
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
                  <XDSVStack gap={0}>
                    <XDSText type="body" weight="bold">
                      {p.name}
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      {p.date}
                    </XDSText>
                  </XDSVStack>
                  <XDSText type="body" weight="bold">
                    {p.amt}
                  </XDSText>
                </div>
              ))}
            </XDSVStack>
          </XDSCard>
        </div>

        {/* QR Code / Mobile Connect */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <div {...stylex.props(styles.placeholder)}>
                <XDSText type="body" color="secondary">
                  QR Code
                </XDSText>
              </div>
              <XDSHeading level={3}>
                Scan to connect your mobile device
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Open the Ledger mobile app and scan this code to link your
                device.
              </XDSText>
              <XDSButton
                label="Got it"
                variant="secondary"
                xstyle={styles.fullWidth}
              />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Q2 Dividend Income */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <XDSHeading level={3}>
                  Q2 Dividend Income
                </XDSHeading>
                <XDSButton label="" icon={<XDSIcon icon="close" size="sm" />} variant="ghost" size="sm" />
              </div>
              <XDSText type="supporting" color="secondary">
                Quarterly dividend payouts across your portfolio holdings.
              </XDSText>
              <XDSDivider />
              {[
                {name: 'Vanguard VIG', shares: '450 Shares', amt: '$1,842.10'},
                {name: 'S&P 500 VOO', shares: '112 Shares', amt: '$928.40'},
                {name: 'Apple AAPL', shares: '85 Shares', amt: '$340.00'},
                {name: 'Realty Income', shares: '320 Shares', amt: '$1,139.50'},
              ].map((d, i) => (
                <div key={i} {...stylex.props(styles.row)}>
                  <XDSVStack gap={0}>
                    <XDSText type="body" weight="bold">
                      {d.name}
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      {d.shares}
                    </XDSText>
                  </XDSVStack>
                  <XDSHStack gap={2} vAlign="center">
                    <Sparkline values={[8, 12, 6, 15, 10, 18]} />
                    <XDSText type="body" weight="bold">
                      {d.amt}
                    </XDSText>
                  </XDSHStack>
                </div>
              ))}
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Savings Target Progress */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHeading level={2}>$24,000</XDSHeading>
              <XDSText type="supporting" color="secondary">
                80% of $30,000
              </XDSText>
              <XDSProgressBar label="Savings Progress" value={80} />
              <XDSDivider />
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Projected Finish</XDSText>
                <XDSText type="body" weight="bold">
                  October 2024
                </XDSText>
              </div>
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Monthly Average</XDSText>
                <XDSText type="body" weight="bold">
                  $1,250
                </XDSText>
              </div>
              <div {...stylex.props(styles.row)}>
                <XDSText type="body">Top Contributor</XDSText>
                <XDSText type="body" weight="bold">
                  Auto-Transfer
                </XDSText>
              </div>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Dollar-Cost Averaging */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHeading level={3}>
                Dollar-Cost Averaging
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                A strategy for building wealth over time.
              </XDSText>
              <XDSText type="body" color="secondary">
                Over time, this smooths out the average cost of your
                investments. When prices drop, your fixed amount buys more
                shares. When prices rise, you buy fewer. The result is a lower
                average cost per share compared to lump-sum investing during
                volatile periods.
              </XDSText>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Cover Art / Upload */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSText type="supporting" color="secondary">
                COVER ART
              </XDSText>
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
              <XDSHeading level={3}>
                Upload Artwork
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Minimum 3000 × 3000px — JPEG or PNG only
              </XDSText>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Front Door (Smart Home) */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <div {...stylex.props(styles.row)}>
                <XDSVStack gap={0}>
                  <XDSHeading level={3}>
                    Front Door
                  </XDSHeading>
                  <XDSText type="supporting" color="secondary">
                    Smart Lock Pro
                  </XDSText>
                </XDSVStack>
                <XDSHStack gap={2} vAlign="center">
                  <XDSText type="supporting">Locked</XDSText>
                  <XDSStatusDot variant="positive" label="Locked" />
                </XDSHStack>
              </div>
              <div {...stylex.props(styles.placeholder)}>
                <XDSBadge label="Live" variant="error" />
              </div>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Stock Holdings */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSTextInput
                label="Search holdings"
               
                placeholder="Search holdings or tickers..."
                value=""
                onChange={() => {}}
              />
              <XDSHStack gap={3}>
                <XDSToken label="Stocks" />
                <XDSToken label="ETFs" />
                <XDSToken label="REITs" />
              </XDSHStack>
              <XDSDivider />
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
                    <XDSHStack gap={3} vAlign="center">
                      <XDSAvatar name={s.ticker} size="small" />
                      <XDSVStack gap={0}>
                        <XDSText type="body" weight="bold">
                          {s.name}
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          {s.info}
                        </XDSText>
                      </XDSVStack>
                    </XDSHStack>
                    <XDSVStack gap={0} style={{alignItems: 'flex-end'}}>
                      <XDSText type="supporting" color="secondary">
                        {s.type}
                      </XDSText>
                      <XDSText type="body" weight="bold">
                        {s.value}
                      </XDSText>
                    </XDSVStack>
                  </div>
                  {i < 3 && <XDSDivider />}
                </div>
              ))}
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Kitchen Island (Smart Home) */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <div {...stylex.props(styles.row)}>
                <XDSHeading level={3}>
                  Kitchen Island
                </XDSHeading>
                <XDSSwitch label="On" value={true} onChange={() => {}} />
              </div>
              <XDSText type="supporting" color="secondary">
                Hue Color Ambient
              </XDSText>
              <XDSHStack gap={2}>
                {['Cooking', 'Dining', 'Nightlight', 'Focus'].map(m => (
                  <XDSToken key={m} label={m} />
                ))}
              </XDSHStack>
              <XDSSlider
                label="Brightness"
                value={brightness}
                onChange={(v: number) => setBrightness(v)}
              />
              <XDSSlider
                label="Color Temp"
                value={colorTemp}
                onChange={(v: number) => setColorTemp(v)}
              />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Living Room (Smart Home) */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHeading level={3}>
                Living Room
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Roller Shades
              </XDSText>
              <div
                {...stylex.props(styles.placeholder)}
                style={{height: 100}}
              />
              <XDSSlider label="Position" value={50} onChange={() => {}} />
              <XDSHStack gap={3}>
                <XDSButton label="Open" variant="ghost" size="sm" />
                <XDSButton label="Half" variant="ghost" size="sm" />
                <XDSButton label="Closed" variant="ghost" size="sm" />
              </XDSHStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Social Links */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>
                Social Links
              </XDSHeading>
              <XDSTextInput
                label="Spotify Artist URL"
                value={spotifyUrl}
                onChange={setSpotifyUrl}
              />
              <XDSTextInput
                label="Instagram Handle"
                value={igHandle}
                onChange={setIgHandle}
              />
              <XDSTextInput
                label="SoundCloud URL"
                value={scUrl}
                onChange={setScUrl}
              />
              <XDSTextInput
                label="Website"
                value={website}
                onChange={setWebsite}
              />
              <XDSHStack gap={3}>
                <XDSButton label="Discard" variant="ghost" />
                <XDSButton label="Save Changes" variant="primary" />
              </XDSHStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Notifications */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>
                Notifications
              </XDSHeading>
              <XDSText type="supporting" color="secondary">
                Choose what you want to be notified about.
              </XDSText>
              <XDSCheckboxInput
                label="Select all"
                value={selectAll}
                onChange={setSelectAll}
              />
              <XDSDivider />
              <XDSCheckboxInput
                label="Transaction alerts"
                value={txnAlerts}
                onChange={setTxnAlerts}
              />
              <XDSText type="supporting" color="secondary">
                Deposits, withdrawals, and transfers.
              </XDSText>
              <XDSCheckboxInput
                label="Security alerts"
                value={secAlerts}
                onChange={setSecAlerts}
              />
              <XDSText type="supporting" color="secondary">
                Login attempts and account changes.
              </XDSText>
              <XDSCheckboxInput
                label="Goal milestones"
                value={goalMilestones}
                onChange={setGoalMilestones}
              />
              <XDSText type="supporting" color="secondary">
                Updates at 25%, 50%, 75%, and 100%.
              </XDSText>
              <XDSCheckboxInput
                label="Market updates"
                value={marketUpdates}
                onChange={setMarketUpdates}
              />
              <XDSText type="supporting" color="secondary">
                Daily portfolio summary and price alerts.
              </XDSText>
              <XDSButton
                label="Save Preferences"
                variant="primary"
                xstyle={styles.fullWidth}
              />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Syncing Accounts */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24}}>
          <XDSCard>
            <XDSVStack gap={3}>
              <XDSHStack gap={3} vAlign="center">
                <XDSSpinner size="sm" />
                <XDSVStack gap={1}>
                  <XDSHeading level={3}>
                    Syncing your accounts
                  </XDSHeading>
                  <XDSText type="supporting" color="secondary">
                    We&apos;re pulling in your latest transactions. This usually
                    takes a few seconds.
                  </XDSText>
                </XDSVStack>
              </XDSHStack>
              <XDSButton
                label="Cancel"
                variant="ghost"
                xstyle={styles.fullWidth}
              />
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Badges & Tokens */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24, gridColumn: '1 / -1'}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>Badges & Tokens</XDSHeading>
              <XDSDivider />
              <XDSVStack gap={3}>
                <XDSText type="supporting" color="secondary">Badge Variants</XDSText>
                <XDSHStack gap={2} vAlign="center" wrap="wrap">
                  <XDSBadge label="Default" />
                  <XDSBadge label="Info" variant="info" />
                  <XDSBadge label="Success" variant="success" />
                  <XDSBadge label="Warning" variant="warning" />
                  <XDSBadge label="Error" variant="error" />
                </XDSHStack>
                <XDSDivider />
                <XDSText type="supporting" color="secondary">Tokens</XDSText>
                <XDSHStack gap={2} vAlign="center" wrap="wrap">
                  <XDSToken label="Default" />
                  <XDSToken label="Blue" color="blue" />
                  <XDSToken label="Green" color="green" />
                  <XDSToken label="Red" color="red" />
                  <XDSToken label="Orange" color="orange" />
                  <XDSToken label="Purple" color="purple" />
                  <XDSToken label="Pink" color="pink" />
                  <XDSToken label="Gray" color="gray" />
                </XDSHStack>
                <XDSHStack gap={2} vAlign="center" wrap="wrap">
                  <XDSToken label="Removable" onRemove={() => {}} />
                  <XDSToken label="Clickable" onClick={() => {}} />
                  <XDSToken label="Disabled" isDisabled />
                </XDSHStack>
              </XDSVStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Input Components */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24, gridColumn: '1 / -1'}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>Input Components</XDSHeading>
              <XDSDivider />
              <XDSVStack gap={4}>
                <XDSHStack gap={4} wrap="wrap">
                  <XDSTextInput label="Default" placeholder="Enter text..." value="" onChange={() => {}} />
                  <XDSTextInput label="With value" value="Hello world" onChange={() => {}} />
                  <XDSTextInput label="Disabled" value="Can't edit" isDisabled onChange={() => {}} />
                </XDSHStack>
                <XDSHStack gap={4} wrap="wrap">
                  <XDSTextInput label="Error state" status={{type: "error", message: "This field is required"}} value="" onChange={() => {}} />
                  <XDSTextInput label="Success state" status={{type: "success", message: "Looks good!"}} value="Valid input" onChange={() => {}} />
                  <XDSTextInput label="With placeholder" placeholder="Enter email..." value="" onChange={() => {}} />
                </XDSHStack>
                <XDSDivider />
                <XDSText type="supporting" color="secondary">Selector</XDSText>
                <XDSHStack gap={4} wrap="wrap">
                  <XDSSelector
                    label="Choose option"
                    options={['Option A', 'Option B', 'Option C']}
                    value="Option A"
                    onChange={() => {}}
                  />
                  <XDSSelector
                    label="Disabled"
                    options={['Locked']}
                    value="Locked"
                    isDisabled
                    onChange={() => {}}
                  />
                </XDSHStack>
                <XDSDivider />
                <XDSText type="supporting" color="secondary">Slider</XDSText>
                <XDSSlider label="Volume" value={65} onChange={() => {}} />
                <XDSDivider />
                <XDSText type="supporting" color="secondary">Toggle Controls</XDSText>
                <XDSHStack gap={6} vAlign="center" wrap="wrap">
                  <XDSSwitch label="On" value={true} onChange={() => {}} />
                  <XDSSwitch label="Off" value={false} onChange={() => {}} />
                  <XDSSwitch label="Disabled on" value={true} isDisabled onChange={() => {}} />
                  <XDSSwitch label="Disabled off" value={false} isDisabled onChange={() => {}} />
                </XDSHStack>
                <XDSDivider />
                <XDSText type="supporting" color="secondary">Checkbox</XDSText>
                <XDSHStack gap={6} wrap="wrap">
                  <XDSCheckboxInput label="Checked" value={true} onChange={() => {}} />
                  <XDSCheckboxInput label="Unchecked" value={false} onChange={() => {}} />
                  <XDSCheckboxInput label="Checked disabled" value={true} isDisabled onChange={() => {}} />
                  <XDSCheckboxInput label="Unchecked disabled" value={false} isDisabled onChange={() => {}} />
                </XDSHStack>
                <XDSDivider />
                <XDSText type="supporting" color="secondary">Radio</XDSText>
                <XDSRadioList label="Radio" value="a" onChange={() => {}}>
                  <XDSRadioListItem value="a" label="Choice A" />
                  <XDSRadioListItem value="b" label="Choice B" />
                  <XDSRadioListItem value="c" label="Choice C (disabled)" isDisabled />
                </XDSRadioList>
              </XDSVStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Button Variants */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24, gridColumn: '1 / -1'}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>Button Variants</XDSHeading>
              <XDSDivider />
              <XDSVStack gap={3}>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" color="secondary">Primary</XDSText>
                  <XDSHStack gap={2} vAlign="center" wrap="wrap">
                    <XDSButton label="Small" variant="primary" size="sm" />
                    <XDSButton label="Medium" variant="primary" size="md" />
                    <XDSButton label="Large" variant="primary" size="lg" />
                    <XDSButton label="Disabled" variant="primary" isDisabled />
                  </XDSHStack>
                </XDSVStack>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" color="secondary">Secondary</XDSText>
                  <XDSHStack gap={2} vAlign="center" wrap="wrap">
                    <XDSButton label="Small" variant="secondary" size="sm" />
                    <XDSButton label="Medium" variant="secondary" size="md" />
                    <XDSButton label="Large" variant="secondary" size="lg" />
                    <XDSButton label="Disabled" variant="secondary" isDisabled />
                  </XDSHStack>
                </XDSVStack>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" color="secondary">Destructive</XDSText>
                  <XDSHStack gap={2} vAlign="center" wrap="wrap">
                    <XDSButton label="Small" variant="destructive" size="sm" />
                    <XDSButton label="Medium" variant="destructive" size="md" />
                    <XDSButton label="Large" variant="destructive" size="lg" />
                    <XDSButton label="Disabled" variant="destructive" isDisabled />
                  </XDSHStack>
                </XDSVStack>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" color="secondary">Ghost</XDSText>
                  <XDSHStack gap={2} vAlign="center" wrap="wrap">
                    <XDSButton label="Small" variant="ghost" size="sm" />
                    <XDSButton label="Medium" variant="ghost" size="md" />
                    <XDSButton label="Large" variant="ghost" size="lg" />
                    <XDSButton label="Disabled" variant="ghost" isDisabled />
                  </XDSHStack>
                </XDSVStack>
                <XDSDivider />
                <XDSText type="supporting" color="secondary">Theme-specific variants (Meta)</XDSText>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" color="secondary">Primary Muted</XDSText>
                  <XDSHStack gap={2} vAlign="center" wrap="wrap">
                    <XDSButton label="Small" variant={'primary-muted' as never} size="sm" />
                    <XDSButton label="Medium" variant={'primary-muted' as never} size="md" />
                    <XDSButton label="Large" variant={'primary-muted' as never} size="lg" />
                    <XDSButton label="Disabled" variant={'primary-muted' as never} isDisabled />
                  </XDSHStack>
                </XDSVStack>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" color="secondary">Destructive Muted</XDSText>
                  <XDSHStack gap={2} vAlign="center" wrap="wrap">
                    <XDSButton label="Small" variant={'destructive-muted' as never} size="sm" />
                    <XDSButton label="Medium" variant={'destructive-muted' as never} size="md" />
                    <XDSButton label="Large" variant={'destructive-muted' as never} size="lg" />
                    <XDSButton label="Disabled" variant={'destructive-muted' as never} isDisabled />
                  </XDSHStack>
                </XDSVStack>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" color="secondary">Primary Outline</XDSText>
                  <XDSHStack gap={2} vAlign="center" wrap="wrap">
                    <XDSButton label="Small" variant={'primary-outline' as never} size="sm" />
                    <XDSButton label="Medium" variant={'primary-outline' as never} size="md" />
                    <XDSButton label="Large" variant={'primary-outline' as never} size="lg" />
                    <XDSButton label="Disabled" variant={'primary-outline' as never} isDisabled />
                  </XDSHStack>
                </XDSVStack>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" color="secondary">Secondary Outline</XDSText>
                  <XDSHStack gap={2} vAlign="center" wrap="wrap">
                    <XDSButton label="Small" variant={'secondary-outline' as never} size="sm" />
                    <XDSButton label="Medium" variant={'secondary-outline' as never} size="md" />
                    <XDSButton label="Large" variant={'secondary-outline' as never} size="lg" />
                    <XDSButton label="Disabled" variant={'secondary-outline' as never} isDisabled />
                  </XDSHStack>
                </XDSVStack>
                <XDSVStack gap={1}>
                  <XDSText type="supporting" color="secondary">Destructive Outline</XDSText>
                  <XDSHStack gap={2} vAlign="center" wrap="wrap">
                    <XDSButton label="Small" variant={'destructive-outline' as never} size="sm" />
                    <XDSButton label="Medium" variant={'destructive-outline' as never} size="md" />
                    <XDSButton label="Large" variant={'destructive-outline' as never} size="lg" />
                    <XDSButton label="Disabled" variant={'destructive-outline' as never} isDisabled />
                  </XDSHStack>
                </XDSVStack>
              </XDSVStack>
            </XDSVStack>
          </XDSCard>
        </div>

        {/* Typography Scale */}
        <div
          style={{breakInside: 'avoid', marginBottom: 24, gridColumn: '1 / -1'}}>
          <XDSCard>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>Typography Scale</XDSHeading>
              <XDSDivider />
              <XDSVStack gap={3}>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Display 1</XDSText>
                  <XDSText type="display-1" as="h1">The quick brown fox</XDSText>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Display 2</XDSText>
                  <XDSText type="display-2" as="h1">The quick brown fox</XDSText>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Display 3</XDSText>
                  <XDSText type="display-3" as="h1">The quick brown fox</XDSText>
                </XDSVStack>
                <XDSDivider />
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Heading 1</XDSText>
                  <XDSHeading level={1}>The quick brown fox</XDSHeading>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Heading 2</XDSText>
                  <XDSHeading level={2}>The quick brown fox</XDSHeading>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Heading 3</XDSText>
                  <XDSHeading level={3}>The quick brown fox</XDSHeading>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Heading 4</XDSText>
                  <XDSHeading level={4}>The quick brown fox</XDSHeading>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Heading 5</XDSText>
                  <XDSHeading level={5}>The quick brown fox</XDSHeading>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Heading 6</XDSText>
                  <XDSHeading level={6}>The quick brown fox</XDSHeading>
                </XDSVStack>
                <XDSDivider />
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Large</XDSText>
                  <XDSText type="large">The quick brown fox jumps over the lazy dog</XDSText>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Body</XDSText>
                  <XDSText type="body">The quick brown fox jumps over the lazy dog</XDSText>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Label</XDSText>
                  <XDSText type="label">The quick brown fox jumps over the lazy dog</XDSText>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Supporting</XDSText>
                  <XDSText type="supporting">The quick brown fox jumps over the lazy dog</XDSText>
                </XDSVStack>
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">Code</XDSText>
                  <XDSText type="code">const fox = &apos;quick brown&apos;;</XDSText>
                </XDSVStack>
              </XDSVStack>
            </XDSVStack>
          </XDSCard>
        </div>
      </div>
    </>
  );
}
