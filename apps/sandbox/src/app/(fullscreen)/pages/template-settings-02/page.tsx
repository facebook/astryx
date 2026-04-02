'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSCard} from '@xds/core/Card';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSBadge} from '@xds/core/Badge';
import {colorVars} from '@xds/core/theme/tokens.stylex';
import {
  UserIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
  CreditCardIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

const styles = stylex.create({
  pageBg: {
    backgroundColor: colorVars['--color-background-surface'],
  },
});

const NAV_ITEMS = [
  {label: 'Personal information', icon: UserIcon},
  {label: 'Login & security', icon: LockClosedIcon},
  {label: 'Privacy', icon: ShieldCheckIcon},
  {label: 'Notifications', icon: BellIcon},
  {label: 'Taxes', icon: DocumentTextIcon},
  {label: 'Payments', icon: CreditCardIcon},
  {label: 'Languages & currency', icon: GlobeAltIcon},
  {label: 'Travel for work', icon: BriefcaseIcon},
];

interface InfoRow {
  label: string;
  value: string;
  action: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const LOGIN_ROWS: InfoRow[] = [
  {label: 'Password', value: 'Not created', action: 'Create'},
];

const SOCIAL_ROWS: InfoRow[] = [
  {label: 'Google', value: 'Connected', action: 'Disconnect'},
];

const DEVICE_ROWS: {
  label: string;
  badge?: string;
  location: string;
  action?: string;
}[] = [
  {
    label: 'OS X 10.15.7 · Chrome',
    badge: 'CURRENT SESSION',
    location: 'McKinney, Texas · March 30, 2026 at 19:31',
  },
  {label: 'Session', location: 'August 9, 2023 at 04:19', action: 'Log out'},
  {
    label: 'OS X 10.15.7 · unknown',
    location: 'Sunnyvale, California · April 14, 2023 at 17:47',
    action: 'Log out',
  },
];

function InfoRowItem({label, value, action}: InfoRow) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '16px 0',
        }}>
        <div>
          <XDSText type="body" weight="semibold" display="block">
            {label}
          </XDSText>
          <XDSText type="supporting" color="secondary" display="block">
            {value}
          </XDSText>
        </div>
        <XDSLink label={action} href="#">
          {action}
        </XDSLink>
      </div>
      <XDSDivider />
    </>
  );
}

export default function SettingsSecurityTemplate() {
  const [activeNav, setActiveNav] = useState('Login & security');
  const [activeTab, setActiveTab] = useState('login');
  const [readReceipts, setReadReceipts] = useState(true);
  const [searchEngines, setSearchEngines] = useState(true);
  const [showCity, setShowCity] = useState(true);
  const [showTripType, setShowTripType] = useState(true);
  const [showStayLength, setShowStayLength] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [aiFeatures, setAiFeatures] = useState(true);

  return (
    <div
      {...stylex.props(styles.pageBg)}
      style={{minHeight: '100svh', display: 'flex', flexDirection: 'column'}}>
      {/* Body — constrained */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          maxWidth: 1000,
          margin: '0 auto',
          width: '100%',
        }}>
        {/* Sidebar */}
        <nav
          style={{
            width: 280,
            paddingTop: 16,
            paddingLeft: 12,
            paddingRight: 12,
            paddingBottom: 16,
            borderRight: '1px solid var(--xds-color-border-primary, #e5e5e5)',
            flexShrink: 0,
            overflowY: 'auto',
          }}>
          <XDSVStack gap={4}>
            <div style={{paddingLeft: 16, paddingRight: 16}}>
              <XDSHeading level={2}>Account settings</XDSHeading>
            </div>
            <XDSList density="spacious">
              {NAV_ITEMS.map(item => (
                <XDSListItem
                  key={item.label}
                  label={item.label}
                  startContent={<item.icon style={{width: 20, height: 20}} />}
                  isSelected={activeNav === item.label}
                  onClick={() => setActiveNav(item.label)}
                />
              ))}
            </XDSList>
            <XDSDivider />
            <XDSList density="spacious">
              <XDSListItem
                label="Professional hosting tools"
                startContent={
                  <WrenchScrewdriverIcon style={{width: 20, height: 20}} />
                }
                onClick={() => {}}
              />
            </XDSList>
          </XDSVStack>
        </nav>

        {/* Content */}
        <div
          style={{
            flex: 1,
            paddingTop: 16,
            paddingLeft: 32,
            paddingRight: 32,
            paddingBottom: 16,
            overflowY: 'auto',
          }}>
          {activeNav === 'Login & security' && (
            <XDSVStack gap={6}>
              <XDSHeading level={2}>Login &amp; security</XDSHeading>

              <div style={{marginLeft: -12, overflow: 'hidden'}}>
                <XDSTabList
                  value={activeTab}
                  onChange={setActiveTab}
                  hasDivider>
                  <XDSTab value="login" label="Login" />
                  <XDSTab value="shared" label="Shared access" />
                </XDSTabList>
              </div>

              {activeTab === 'login' && (
                <XDSVStack gap={8}>
                  {/* Login section */}
                  <XDSVStack gap={0}>
                    <XDSHeading level={3}>Login</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSDivider />
                    </div>
                    {LOGIN_ROWS.map(row => (
                      <InfoRowItem key={row.label} {...row} />
                    ))}
                  </XDSVStack>

                  {/* Social accounts */}
                  <XDSVStack gap={0}>
                    <XDSHeading level={3}>Social accounts</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSDivider />
                    </div>
                    {SOCIAL_ROWS.map(row => (
                      <InfoRowItem key={row.label} {...row} />
                    ))}
                  </XDSVStack>

                  {/* Device history */}
                  <XDSVStack gap={0}>
                    <XDSHeading level={3}>Device history</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSDivider />
                    </div>
                    {DEVICE_ROWS.map((device, i) => (
                      <div key={i}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            padding: '16px 0',
                            gap: 12,
                          }}>
                          <ComputerDesktopIcon
                            style={{
                              width: 32,
                              height: 32,
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          />
                          <div style={{flex: 1}}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}>
                              <XDSText type="body" weight="semibold">
                                {device.label}
                              </XDSText>
                              {device.badge && (
                                <XDSBadge label={device.badge} />
                              )}
                            </div>
                            <XDSText type="supporting" color="secondary">
                              {device.location}
                            </XDSText>
                          </div>
                          {device.action && (
                            <XDSLink label={device.action} href="#">
                              {device.action}
                            </XDSLink>
                          )}
                        </div>
                        <XDSDivider />
                      </div>
                    ))}
                  </XDSVStack>

                  {/* Account */}
                  <XDSVStack gap={0}>
                    <XDSHeading level={3}>Account</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSDivider />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: '16px 0',
                      }}>
                      <div>
                        <XDSText type="body" weight="semibold" display="block">
                          Deactivate your account
                        </XDSText>
                        <XDSText
                          type="supporting"
                          color="secondary"
                          display="block">
                          This action cannot be undone
                        </XDSText>
                      </div>
                      <XDSLink label="Deactivate" href="#">
                        Deactivate
                      </XDSLink>
                    </div>
                    <XDSDivider />
                  </XDSVStack>
                </XDSVStack>
              )}

              {activeTab === 'shared' && (
                <XDSVStack gap={8}>
                  <XDSVStack gap={0}>
                    <XDSHeading level={3}>Shared access</XDSHeading>
                    <div style={{marginTop: 8}}>
                      <XDSDivider />
                    </div>
                    <div style={{paddingTop: 16}}>
                      <XDSText type="body" color="secondary">
                        Review each request carefully before approving access.
                        We&apos;ll email your employee or co-worker a 4-digit
                        code that lets them log into your account with their
                        trusted device.
                      </XDSText>
                    </div>
                  </XDSVStack>

                  <XDSCard
                    padding={4}
                    xstyle={{
                      backgroundColor: colorVars['--color-background-body'],
                      borderWidth: 0,
                    }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                      }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          backgroundColor:
                            'var(--xds-color-background-surface, #fff)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                        <LockClosedIcon style={{width: 24, height: 24}} />
                      </div>
                      <XDSVStack gap={1}>
                        <XDSText type="body" weight="bold">
                          Adding devices from people you trust
                        </XDSText>
                        <XDSText type="body" color="secondary">
                          When you approve a request, you grant someone full
                          access to your account. They&apos;ll be able to change
                          reservations and send messages on your behalf.
                        </XDSText>
                      </XDSVStack>
                    </div>
                  </XDSCard>
                </XDSVStack>
              )}
            </XDSVStack>
          )}

          {activeNav === 'Privacy' && (
            <XDSVStack gap={6}>
              <XDSHeading level={2}>Privacy</XDSHeading>

              <XDSVStack gap={8}>
                {/* Messages */}
                <XDSVStack gap={0}>
                  <XDSHeading level={3}>Messages</XDSHeading>
                  <div style={{marginTop: 16}}>
                    <XDSSwitch
                      label="Show people when I've read their messages."
                      value={readReceipts}
                      onChange={setReadReceipts}
                      labelPosition="start"
                      labelSpacing="spread"
                    />
                  </div>
                  <div style={{padding: '16px 0'}}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <XDSText type="body" weight="semibold">
                        Blocked people
                      </XDSText>
                      <XDSLink label="View" href="#">
                        View
                      </XDSLink>
                    </div>
                  </div>
                  <XDSDivider />
                </XDSVStack>

                {/* Listings */}
                <XDSVStack gap={0}>
                  <XDSHeading level={3}>Listings</XDSHeading>
                  <div style={{marginTop: 16}}>
                    <XDSSwitch
                      label="Include my listing(s) in search engines"
                      description="Turning this on means search engines, like Google, will display your listing page(s) in search results."
                      value={searchEngines}
                      onChange={setSearchEngines}
                      labelPosition="start"
                      labelSpacing="spread"
                    />
                  </div>
                  <div style={{marginTop: 8}}>
                    <XDSDivider />
                  </div>
                </XDSVStack>

                {/* Reviews */}
                <XDSVStack gap={0}>
                  <XDSHeading level={3}>Reviews</XDSHeading>
                  <div>
                    <XDSText type="supporting" color="secondary">
                      Choose what&apos;s shared when you write a review.{' '}
                      <XDSLink label="Learn more" href="#" type="supporting">
                        Learn more
                      </XDSLink>
                    </XDSText>
                  </div>
                  <div style={{marginTop: 16}}>
                    <XDSVStack gap={4}>
                      <XDSSwitch
                        label="Show my home city and country"
                        description="Ex: City and country"
                        value={showCity}
                        onChange={setShowCity}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                      <XDSSwitch
                        label="Show my trip type"
                        description="Ex: Stayed with kids or pets"
                        value={showTripType}
                        onChange={setShowTripType}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                      <XDSSwitch
                        label="Show my length of stay"
                        description="Ex: A few nights, about a week, etc."
                        value={showStayLength}
                        onChange={setShowStayLength}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                      <XDSSwitch
                        label="Show my booked services"
                        description="Ex: Gourmet brunch or tasting menu"
                        value={showServices}
                        onChange={setShowServices}
                        labelPosition="start"
                        labelSpacing="spread"
                      />
                    </XDSVStack>
                  </div>
                  <div style={{marginTop: 16}}>
                    <XDSDivider />
                  </div>
                </XDSVStack>

                {/* Data privacy */}
                <XDSVStack gap={4}>
                  <XDSHeading level={3}>Data privacy</XDSHeading>
                  <XDSCard padding={4}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <XDSText type="body">Request my personal data</XDSText>
                      <XDSLink label="Request" href="#">
                        Request
                      </XDSLink>
                    </div>
                  </XDSCard>
                  <XDSSwitch
                    label="Help improve AI-powered features"
                    description="When this is on, we use your data to develop and improve AI models."
                    value={aiFeatures}
                    onChange={setAiFeatures}
                    labelPosition="start"
                    labelSpacing="spread"
                  />
                  <XDSCard padding={4}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <XDSText type="body">Delete my account</XDSText>
                      <XDSLink label="Delete" href="#">
                        Delete
                      </XDSLink>
                    </div>
                  </XDSCard>
                  <XDSCard
                    padding={4}
                    xstyle={{
                      backgroundColor: colorVars['--color-background-body'],
                      borderWidth: 0,
                    }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                      }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          backgroundColor:
                            'var(--xds-color-background-surface, #fff)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                        <ShieldCheckIcon style={{width: 24, height: 24}} />
                      </div>
                      <XDSVStack gap={1}>
                        <XDSText type="body" weight="bold">
                          Committed to privacy
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          We&apos;re committed to keeping your data protected.
                          See details in our{' '}
                          <XDSLink
                            label="Privacy Policy"
                            href="#"
                            type="supporting">
                            Privacy Policy
                          </XDSLink>
                          .
                        </XDSText>
                      </XDSVStack>
                    </div>
                  </XDSCard>
                </XDSVStack>
              </XDSVStack>
            </XDSVStack>
          )}
        </div>
      </div>
    </div>
  );
}
