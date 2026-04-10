'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSDivider} from '@xds/core/Divider';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSection} from '@xds/core/Section';
import {XDSCard} from '@xds/core/Card';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSLink} from '@xds/core/Link';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSBadge} from '@xds/core/Badge';
import {colorVars} from '@xds/core/theme/tokens.stylex';
import {
  UserIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  BellIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BriefcaseIcon,
  PencilSquareIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

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

const LOGIN_ROWS: {label: string; value: string; action: string}[] = [
  {label: 'Password', value: 'Not created', action: 'Create'},
];

const SOCIAL_ROWS: {label: string; value: string; action: string}[] = [
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

// ---------------------------------------------------------------------------
// Expandable row
// ---------------------------------------------------------------------------

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
        <div style={{padding: '16px 0'}}>
          <div style={{marginBottom: 12}}>
            <XDSText type="body" weight="semibold" display="block">
              {label}
            </XDSText>
          </div>
          <div style={{marginBottom: 16}}>{children}</div>
          <XDSHStack gap={2}>
            <XDSButton label="Save" variant="primary" onClick={onSave} />
            <XDSButton label="Cancel" variant="ghost" onClick={onCancel} />
          </XDSHStack>
        </div>
      ) : (
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
          <XDSLink
            label="Edit"
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onEdit();
            }}>
            Edit
          </XDSLink>
        </div>
      )}
      <XDSDivider />
    </>
  );
}

function InfoRowItem({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action: string;
}) {
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
        {action && (
          <XDSLink label={action} href="#">
            {action}
          </XDSLink>
        )}
      </div>
      <XDSDivider />
    </>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  pageBg: {backgroundColor: colorVars['--color-background-body']},
  cardBg: {backgroundColor: colorVars['--color-background-card']},
  noBorder: {borderWidth: 0},
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsDialogTemplate() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Login & security');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Johnson');
  const [email, setEmail] = useState('alex.johnson@email.com');
  const [phone, setPhone] = useState('+1 (416) 555-0123');
  const [language, setLanguage] = useState('en-CA');
  const [currency, setCurrency] = useState('CAD');
  const [timezone, setTimezone] = useState('ET');
  const [activeTab, setActiveTab] = useState('login');
  const [readReceipts, setReadReceipts] = useState(true);
  const [searchEngines, setSearchEngines] = useState(true);
  const [showCity, setShowCity] = useState(true);
  const [showTripType, setShowTripType] = useState(true);
  const [showStayLength, setShowStayLength] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [aiFeatures, setAiFeatures] = useState(true);

  const handleEdit = (row: string) => setExpandedRow(row);
  const handleCancel = () => setExpandedRow(null);
  const handleSave = () => setExpandedRow(null);

  return (
    <div
      {...stylex.props(styles.pageBg)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        inset: 0,
      }}>
      <XDSButton
        label="Open settings"
        variant="primary"
        onClick={() => setIsOpen(true)}
      />
      <XDSDialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        width={900}
        maxHeight="85vh"
        purpose="form">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 'calc(85vh - 2px)',
            maxHeight: 'calc(85vh - 2px)',
            position: 'relative',
          }}>
          {/* Close button — top right, no header bar */}
          <div style={{position: 'absolute', top: 12, right: 12, zIndex: 1}}>
            <XDSButton
              label="Close"
              icon={<XMarkIcon width={20} height={20} />}
              variant="ghost"
              onClick={() => setIsOpen(false)}
              isIconOnly
            />
          </div>

          {/* Body: sidebar + content */}
          <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
            {/* Sidebar */}
            <nav
              {...stylex.props(styles.cardBg)}
              style={{
                width: 280,
                paddingTop: 16,
                paddingLeft: 12,
                paddingRight: 12,
                paddingBottom: 16,
                borderRight:
                  '1px solid var(--xds-color-border-primary, #e5e5e5)',
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
                      startContent={<item.icon width={20} height={20} />}
                      isSelected={activeNav === item.label}
                      onClick={() => {
                        setActiveNav(item.label);
                        setExpandedRow(null);
                      }}
                    />
                  ))}
                </XDSList>
                <XDSDivider />
                <XDSList density="spacious">
                  <XDSListItem
                    label="Professional hosting tools"
                    startContent={
                      <WrenchScrewdriverIcon width={20} height={20} />
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
                overflowY: 'auto',
                padding: '16px 32px',
                maxWidth: 680,
              }}>
              {activeNav === 'Personal information' && (
                <XDSVStack gap={6}>
                  <XDSHeading level={2}>Personal info</XDSHeading>
                  <XDSVStack gap={0}>
                    <InfoRowItem
                      label="Legal name"
                      value="Alex Johnson"
                      action="Edit"
                    />
                    <InfoRowItem
                      label="Preferred first name"
                      value="Not provided"
                      action="Add"
                    />
                    <InfoRowItem
                      label="Email address"
                      value="a***n@example.com"
                      action="Edit"
                    />
                    <InfoRowItem
                      label="Phone number"
                      value="+1 ***-***-0123"
                      action="Edit"
                    />
                    <InfoRowItem
                      label="Identity verification"
                      value="Verified"
                      action=""
                    />
                    <InfoRowItem
                      label="Residential address"
                      value="Not provided"
                      action="Add"
                    />
                    <InfoRowItem
                      label="Mailing address"
                      value="Not provided"
                      action="Add"
                    />
                    <InfoRowItem
                      label="Emergency contact"
                      value="Provided"
                      action="Edit"
                    />
                  </XDSVStack>

                  <XDSCard padding={4} style={{marginTop: 16}}>
                    <XDSVStack gap={0}>
                      <div style={{paddingTop: 0, paddingBottom: 16}}>
                        <XDSHStack gap={3} vAlign="start">
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              backgroundColor:
                                'var(--xds-color-background-muted, #f5f5f5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                            <LockClosedIcon width={24} height={24} />
                          </div>
                          <XDSVStack gap={0}>
                            <XDSText
                              type="body"
                              weight="semibold"
                              display="block">
                              Why isn&apos;t my info shown here?
                            </XDSText>
                            <XDSText
                              type="supporting"
                              color="secondary"
                              display="block">
                              We&apos;re hiding some account details to protect
                              your identity.
                            </XDSText>
                          </XDSVStack>
                        </XDSHStack>
                      </div>
                      <XDSDivider />
                      <div style={{padding: '16px 0'}}>
                        <XDSHStack gap={3} vAlign="start">
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              backgroundColor:
                                'var(--xds-color-background-muted, #f5f5f5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                            <PencilSquareIcon width={24} height={24} />
                          </div>
                          <XDSVStack gap={0}>
                            <XDSText
                              type="body"
                              weight="semibold"
                              display="block">
                              Which details can be edited?
                            </XDSText>
                            <XDSText
                              type="supporting"
                              color="secondary"
                              display="block">
                              Contact info and personal details can be edited.
                              If this info was used to verify your identity,
                              you&apos;ll need to get verified again the next
                              time you book—or to continue hosting.
                            </XDSText>
                          </XDSVStack>
                        </XDSHStack>
                      </div>
                      <XDSDivider />
                      <div style={{paddingTop: 16, paddingBottom: 0}}>
                        <XDSHStack gap={3} vAlign="start">
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              backgroundColor:
                                'var(--xds-color-background-muted, #f5f5f5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                            <ShareIcon width={24} height={24} />
                          </div>
                          <XDSVStack gap={0}>
                            <XDSText
                              type="body"
                              weight="semibold"
                              display="block">
                              What info is shared with others?
                            </XDSText>
                            <XDSText
                              type="supporting"
                              color="secondary"
                              display="block">
                              We only release contact information after a
                              reservation is confirmed.
                            </XDSText>
                          </XDSVStack>
                        </XDSHStack>
                      </div>
                    </XDSVStack>
                  </XDSCard>
                </XDSVStack>
              )}

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
                      {/* Login */}
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
                                width={32}
                                height={32}
                                style={{
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
                            <XDSText
                              type="body"
                              weight="semibold"
                              display="block">
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
                            Review each request carefully before approving
                            access. We&apos;ll email your employee or co-worker
                            a 4-digit code that lets them log into your account
                            with their trusted device.
                          </XDSText>
                        </div>
                      </XDSVStack>

                      <XDSCard padding={0} xstyle={styles.noBorder}>
                        <XDSSection variant="wash" style={{padding: 16}}>
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
                              <LockClosedIcon width={24} height={24} />
                            </div>
                            <XDSVStack gap={1}>
                              <XDSText type="body" weight="bold">
                                Adding devices from people you trust
                              </XDSText>
                              <XDSText type="body" color="secondary">
                                When you approve a request, you grant someone
                                full access to your account. They&apos;ll be
                                able to change reservations and send messages on
                                your behalf.
                              </XDSText>
                            </XDSVStack>
                          </div>
                        </XDSSection>
                      </XDSCard>
                    </XDSVStack>
                  )}
                </XDSVStack>
              )}

              {activeNav === 'Languages & currency' && (
                <XDSVStack gap={6}>
                  <XDSHeading level={2}>Languages &amp; currency</XDSHeading>
                  <XDSVStack gap={0}>
                    <XDSDivider />
                    <ExpandableRow
                      label="Preferred language"
                      value={
                        LANGUAGES.find(l => l.value === language)?.label ??
                        language
                      }
                      isExpanded={expandedRow === 'language'}
                      onEdit={() => handleEdit('language')}
                      onCancel={handleCancel}
                      onSave={handleSave}>
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
                        CURRENCIES.find(c => c.value === currency)?.label ??
                        currency
                      }
                      isExpanded={expandedRow === 'currency'}
                      onEdit={() => handleEdit('currency')}
                      onCancel={handleCancel}
                      onSave={handleSave}>
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
                        TIMEZONES.find(t => t.value === timezone)?.label ??
                        timezone
                      }
                      isExpanded={expandedRow === 'timezone'}
                      onEdit={() => handleEdit('timezone')}
                      onCancel={handleCancel}
                      onSave={handleSave}>
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
                          <XDSLink
                            label="Learn more"
                            href="#"
                            type="supporting">
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
                          <XDSText type="body">
                            Request my personal data
                          </XDSText>
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
                      <XDSCard padding={0} xstyle={styles.noBorder}>
                        <XDSSection variant="wash" style={{padding: 16}}>
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
                              <ShieldCheckIcon width={24} height={24} />
                            </div>
                            <XDSVStack gap={1}>
                              <XDSText type="body" weight="bold">
                                Committed to privacy
                              </XDSText>
                              <XDSText type="supporting" color="secondary">
                                We&apos;re committed to keeping your data
                                protected. See details in our{' '}
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
                        </XDSSection>
                      </XDSCard>
                    </XDSVStack>
                  </XDSVStack>
                </XDSVStack>
              )}
            </div>
          </div>
        </div>
      </XDSDialog>
    </div>
  );
}
