'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavItem,
  XDSSideNavHeading,
} from '@xds/core/SideNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCard} from '@xds/core/Card';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSDivider} from '@xds/core/Divider';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSList, XDSListItem} from '@xds/core/List';
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
  PencilSquareIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

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

const LOGIN_ROWS = [
  {label: 'Password', value: 'Not created', action: 'Create'},
];

const SOCIAL_ROWS = [
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

const LANGUAGES = [
  {label: 'English (Canada)', value: 'en-CA'},
  {label: 'English (US)', value: 'en-US'},
  {label: 'French', value: 'fr'},
  {label: 'Spanish', value: 'es'},
  {label: 'German', value: 'de'},
  {label: 'Japanese', value: 'ja'},
];

const CURRENCIES = [
  {label: 'Canadian dollar (CAD)', value: 'CAD'},
  {label: 'US dollar (USD)', value: 'USD'},
  {label: 'Euro (EUR)', value: 'EUR'},
  {label: 'British pound (GBP)', value: 'GBP'},
  {label: 'Japanese yen (JPY)', value: 'JPY'},
];

const TIMEZONES = [
  {label: '(GMT-05:00) Eastern Time (US & Canada)', value: 'ET'},
  {label: '(GMT-06:00) Central Time (US & Canada)', value: 'CT'},
  {label: '(GMT-07:00) Mountain Time (US & Canada)', value: 'MT'},
  {label: '(GMT-08:00) Pacific Time (US & Canada)', value: 'PT'},
  {label: '(GMT+00:00) UTC', value: 'UTC'},
  {label: '(GMT+01:00) London', value: 'GMT+1'},
];

interface ExpandableRowProps {
  label: string;
  value: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

function ExpandableRow({
  label,
  value,
  children,
  isExpanded,
  onEdit,
  onCancel,
  onSave,
}: ExpandableRowProps) {
  return (
    <>
      {isExpanded ? (
        <XDSVStack gap={4}>
          <XDSText type="body" weight="semibold" display="block">
            {label}
          </XDSText>
          {children}
          <XDSHStack gap={2}>
            <XDSButton label="Save" variant="primary" onClick={onSave} />
            <XDSButton label="Cancel" variant="ghost" onClick={onCancel} />
          </XDSHStack>
        </XDSVStack>
      ) : (
        <XDSHStack hAlign="between" vAlign="start">
          <XDSVStack gap={0}>
            <XDSText type="body" weight="semibold" display="block">
              {label}
            </XDSText>
            <XDSText type="supporting" color="secondary" display="block">
              {value}
            </XDSText>
          </XDSVStack>
          <XDSLink
            label="Edit"
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onEdit();
            }}>
            Edit
          </XDSLink>
        </XDSHStack>
      )}
      <XDSDivider />
    </>
  );
}

export default function SettingsSidebarTemplate() {
  const [activeNav, setActiveNav] = useState('Personal information');
  const [activeTab, setActiveTab] = useState('login');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [readReceipts, setReadReceipts] = useState(true);
  const [searchEngines, setSearchEngines] = useState(true);
  const [showCity, setShowCity] = useState(true);
  const [showTripType, setShowTripType] = useState(true);
  const [showStayLength, setShowStayLength] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [aiFeatures, setAiFeatures] = useState(true);

  const [language, setLanguage] = useState('en-CA');
  const [currency, setCurrency] = useState('CAD');
  const [timezone, setTimezone] = useState('ET');

  return (
    <XDSAppShell
      contentPadding={4}
      height="fill"
      sideNav={
        <XDSSideNav
          header={<XDSSideNavHeading heading="Account settings" />}>
          {NAV_ITEMS.map(item => (
            <XDSSideNavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              isSelected={activeNav === item.label}
              onClick={() => setActiveNav(item.label)}
            />
          ))}
          <XDSDivider />
          <XDSSideNavItem
            label="Professional hosting tools"
            icon={WrenchScrewdriverIcon}
            onClick={() => {}}
          />
        </XDSSideNav>
      }>
      {activeNav === 'Personal information' && (
        <XDSVStack gap={6}>
          <XDSHeading level={2}>Personal info</XDSHeading>
          <XDSList hasDividers density="spacious">
            <XDSListItem
              label="Legal name"
              description="Alex Johnson"
              endContent={
                <XDSLink label="Edit" href="#">
                  Edit
                </XDSLink>
              }
            />
            <XDSListItem
              label="Preferred first name"
              description="Not provided"
              endContent={
                <XDSLink label="Add" href="#">
                  Add
                </XDSLink>
              }
            />
            <XDSListItem
              label="Email address"
              description="a***n@example.com"
              endContent={
                <XDSLink label="Edit" href="#">
                  Edit
                </XDSLink>
              }
            />
            <XDSListItem
              label="Phone number"
              description="+1 ***-***-0123"
              endContent={
                <XDSLink label="Edit" href="#">
                  Edit
                </XDSLink>
              }
            />
            <XDSListItem
              label="Identity verification"
              description="Verified"
            />
            <XDSListItem
              label="Residential address"
              description="Not provided"
              endContent={
                <XDSLink label="Add" href="#">
                  Add
                </XDSLink>
              }
            />
            <XDSListItem
              label="Mailing address"
              description="Not provided"
              endContent={
                <XDSLink label="Add" href="#">
                  Add
                </XDSLink>
              }
            />
            <XDSListItem
              label="Emergency contact"
              description="Provided"
              endContent={
                <XDSLink label="Edit" href="#">
                  Edit
                </XDSLink>
              }
            />
          </XDSList>

          <XDSCard padding={4}>
            <XDSList hasDividers density="spacious">
              <XDSListItem
                label="Why isn't my info shown here?"
                description="We're hiding some account details to protect your identity."
                startContent={<XDSIcon icon={LockClosedIcon} size="lg" />}
              />
              <XDSListItem
                label="Which details can be edited?"
                description="Contact info and personal details can be edited. If this info was used to verify your identity, you'll need to get verified again the next time you book—or to continue hosting."
                startContent={<XDSIcon icon={PencilSquareIcon} size="lg" />}
              />
              <XDSListItem
                label="What info is shared with others?"
                description="We only release contact information after a reservation is confirmed."
                startContent={<XDSIcon icon={ShareIcon} size="lg" />}
              />
            </XDSList>
          </XDSCard>
        </XDSVStack>
      )}

      {activeNav === 'Login & security' && (
        <XDSVStack gap={6}>
          <XDSHeading level={2}>Login &amp; security</XDSHeading>

          <XDSTabList
            value={activeTab}
            onChange={setActiveTab}
            hasDivider>
            <XDSTab value="login" label="Login" />
            <XDSTab value="shared" label="Shared access" />
          </XDSTabList>

          {activeTab === 'login' && (
            <XDSVStack gap={8}>
              <XDSVStack gap={2}>
                <XDSHeading level={3}>Login</XDSHeading>
                <XDSList hasDividers density="spacious">
                  {LOGIN_ROWS.map(row => (
                    <XDSListItem
                      key={row.label}
                      label={row.label}
                      description={row.value}
                      endContent={
                        <XDSLink label={row.action} href="#">
                          {row.action}
                        </XDSLink>
                      }
                    />
                  ))}
                </XDSList>
              </XDSVStack>

              <XDSVStack gap={2}>
                <XDSHeading level={3}>Social accounts</XDSHeading>
                <XDSList hasDividers density="spacious">
                  {SOCIAL_ROWS.map(row => (
                    <XDSListItem
                      key={row.label}
                      label={row.label}
                      description={row.value}
                      endContent={
                        <XDSLink label={row.action} href="#">
                          {row.action}
                        </XDSLink>
                      }
                    />
                  ))}
                </XDSList>
              </XDSVStack>

              <XDSVStack gap={2}>
                <XDSHeading level={3}>Device history</XDSHeading>
                <XDSList hasDividers density="spacious">
                  {DEVICE_ROWS.map((device, i) => (
                    <XDSListItem
                      key={i}
                      label={device.label}
                      description={device.location}
                      startContent={
                        <XDSIcon icon={ComputerDesktopIcon} size="lg" />
                      }
                      endContent={
                        device.badge ? (
                          <XDSBadge label={device.badge} />
                        ) : device.action ? (
                          <XDSLink label={device.action} href="#">
                            {device.action}
                          </XDSLink>
                        ) : undefined
                      }
                    />
                  ))}
                </XDSList>
              </XDSVStack>

              <XDSVStack gap={2}>
                <XDSHeading level={3}>Account</XDSHeading>
                <XDSList hasDividers density="spacious">
                  <XDSListItem
                    label="Deactivate your account"
                    description="This action cannot be undone"
                    endContent={
                      <XDSLink label="Deactivate" href="#">
                        Deactivate
                      </XDSLink>
                    }
                  />
                </XDSList>
              </XDSVStack>
            </XDSVStack>
          )}

          {activeTab === 'shared' && (
            <XDSVStack gap={8}>
              <XDSVStack gap={2}>
                <XDSHeading level={3}>Shared access</XDSHeading>
                <XDSDivider />
                <XDSText type="body" color="secondary">
                  Review each request carefully before approving access.
                  We&apos;ll email your employee or co-worker a 4-digit code
                  that lets them log into your account with their trusted
                  device.
                </XDSText>
              </XDSVStack>

              <XDSCard variant="muted" padding={4}>
                <XDSHStack gap={4} vAlign="start">
                  <XDSIcon icon={LockClosedIcon} size="lg" />
                  <XDSVStack gap={1}>
                    <XDSText type="body" weight="bold">
                      Adding devices from people you trust
                    </XDSText>
                    <XDSText type="body" color="secondary">
                      When you approve a request, you grant someone full access
                      to your account. They&apos;ll be able to change
                      reservations and send messages on your behalf.
                    </XDSText>
                  </XDSVStack>
                </XDSHStack>
              </XDSCard>
            </XDSVStack>
          )}
        </XDSVStack>
      )}

      {activeNav === 'Privacy' && (
        <XDSVStack gap={6}>
          <XDSHeading level={2}>Privacy</XDSHeading>

          <XDSVStack gap={8}>
            <XDSVStack gap={4}>
              <XDSHeading level={3}>Messages</XDSHeading>
              <XDSSwitch
                label="Show people when I've read their messages."
                value={readReceipts}
                onChange={setReadReceipts}
                labelPosition="start"
                labelSpacing="spread"
              />
              <XDSList hasDividers density="spacious">
                <XDSListItem
                  label="Blocked people"
                  endContent={
                    <XDSLink label="View" href="#">
                      View
                    </XDSLink>
                  }
                />
              </XDSList>
            </XDSVStack>

            <XDSVStack gap={4}>
              <XDSHeading level={3}>Listings</XDSHeading>
              <XDSSwitch
                label="Include my listing(s) in search engines"
                description="Turning this on means search engines, like Google, will display your listing page(s) in search results."
                value={searchEngines}
                onChange={setSearchEngines}
                labelPosition="start"
                labelSpacing="spread"
              />
              <XDSDivider />
            </XDSVStack>

            <XDSVStack gap={4}>
              <XDSHeading level={3}>Reviews</XDSHeading>
              <XDSText type="supporting" color="secondary">
                Choose what&apos;s shared when you write a review.{' '}
                <XDSLink label="Learn more" href="#" type="supporting">
                  Learn more
                </XDSLink>
              </XDSText>
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
              <XDSDivider />
            </XDSVStack>

            <XDSVStack gap={4}>
              <XDSHeading level={3}>Data privacy</XDSHeading>
              <XDSCard padding={4}>
                <XDSHStack hAlign="between" vAlign="center">
                  <XDSText type="body">Request my personal data</XDSText>
                  <XDSLink label="Request" href="#">
                    Request
                  </XDSLink>
                </XDSHStack>
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
                <XDSHStack hAlign="between" vAlign="center">
                  <XDSText type="body">Delete my account</XDSText>
                  <XDSLink label="Delete" href="#">
                    Delete
                  </XDSLink>
                </XDSHStack>
              </XDSCard>
              <XDSCard variant="muted" padding={4}>
                <XDSHStack gap={4} vAlign="start">
                  <XDSIcon icon={ShieldCheckIcon} size="lg" />
                  <XDSVStack gap={1}>
                    <XDSText type="body" weight="bold">
                      Committed to privacy
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      We&apos;re committed to keeping your data protected. See
                      details in our{' '}
                      <XDSLink
                        label="Privacy Policy"
                        href="#"
                        type="supporting">
                        Privacy Policy
                      </XDSLink>
                      .
                    </XDSText>
                  </XDSVStack>
                </XDSHStack>
              </XDSCard>
            </XDSVStack>
          </XDSVStack>
        </XDSVStack>
      )}

      {activeNav === 'Languages & currency' && (
        <XDSVStack gap={6}>
          <XDSHeading level={2}>Languages &amp; currency</XDSHeading>
          <XDSVStack gap={0}>
            <ExpandableRow
              label="Preferred language"
              value={
                LANGUAGES.find(l => l.value === language)?.label ?? language
              }
              isExpanded={expandedRow === 'language'}
              onEdit={() => setExpandedRow('language')}
              onCancel={() => setExpandedRow(null)}
              onSave={() => setExpandedRow(null)}>
              <XDSSelector
                label="Language"
                isLabelHidden
                size="lg"
                value={language}
                onChange={setLanguage}
                options={LANGUAGES}
              />
            </ExpandableRow>
            <ExpandableRow
              label="Preferred currency"
              value={
                CURRENCIES.find(c => c.value === currency)?.label ?? currency
              }
              isExpanded={expandedRow === 'currency'}
              onEdit={() => setExpandedRow('currency')}
              onCancel={() => setExpandedRow(null)}
              onSave={() => setExpandedRow(null)}>
              <XDSSelector
                label="Currency"
                isLabelHidden
                size="lg"
                value={currency}
                onChange={setCurrency}
                options={CURRENCIES}
              />
            </ExpandableRow>
            <ExpandableRow
              label="Time zone"
              value={
                TIMEZONES.find(t => t.value === timezone)?.label ?? timezone
              }
              isExpanded={expandedRow === 'timezone'}
              onEdit={() => setExpandedRow('timezone')}
              onCancel={() => setExpandedRow(null)}
              onSave={() => setExpandedRow(null)}>
              <XDSSelector
                label="Time zone"
                isLabelHidden
                size="lg"
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONES}
              />
            </ExpandableRow>
          </XDSVStack>
        </XDSVStack>
      )}
    </XDSAppShell>
  );
}
