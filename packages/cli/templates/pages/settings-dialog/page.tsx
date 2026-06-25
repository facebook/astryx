// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import React, {useState, type CSSProperties} from 'react';
import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutPanel,
  LayoutContent,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {List, ListItem} from '@astryxdesign/core/List';
import {Divider} from '@astryxdesign/core/Divider';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Card} from '@astryxdesign/core/Card';
import {Switch} from '@astryxdesign/core/Switch';
import {Link} from '@astryxdesign/core/Link';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {Center} from '@astryxdesign/core/Center';
import {
  UserIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  BellIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BriefcaseIcon,
  PencilSquareIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

const iconBox: CSSProperties = {
  borderRadius: 'var(--radius-container)',
  backgroundColor: 'var(--color-background-surface)',
  flexShrink: 0,
};
// Sticky dialog header bar — no Astryx prop for sticky/background/z-index.
// Inline + block padding comes from the parent LayoutContent `padding`.
const headerSticky: CSSProperties = {
  position: 'sticky',
  top: 0,
  backgroundColor: 'var(--color-background-surface)',
  zIndex: 1,
};
// No `maxWidth` prop on VStack — width only. Inline padding comes from
// the parent LayoutContent `padding`.
const contentMaxWidth: CSSProperties = {
  maxWidth: 680,
};
// Aligns the sidebar heading with list-item label text. No heading margin prop.
const sideNavHeading: CSSProperties = {
  marginInline: 'var(--spacing-4)',
};
const dialogHeight: CSSProperties = {
  height: '85vh',
};

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
        <VStack gap={4}>
          <Text type="body" weight="semibold" display="block">
            {label}
          </Text>
          {children}
          <HStack gap={2}>
            <Button label="Save" variant="primary" onClick={onSave} />
            <Button label="Cancel" variant="ghost" onClick={onCancel} />
          </HStack>
        </VStack>
      ) : (
        <HStack hAlign="between" vAlign="start">
          <VStack gap={0}>
            <Text type="body" weight="semibold" display="block">
              {label}
            </Text>
            <Text type="supporting" color="secondary" display="block">
              {value}
            </Text>
          </VStack>
          <Link
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onEdit();
            }}>
            Edit
          </Link>
        </HStack>
      )}
      <Divider />
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
      <HStack hAlign="between" vAlign="start">
        <VStack gap={0}>
          <Text type="body" weight="semibold" display="block">
            {label}
          </Text>
          <Text type="supporting" color="secondary" display="block">
            {value}
          </Text>
        </VStack>
        {action && <Link href="#">{action}</Link>}
      </HStack>
      <Divider />
    </>
  );
}

export default function SettingsDialogTemplate() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Login & security');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [language, setLanguage] = useState('en-CA');
  const [currency, setCurrency] = useState('CAD');
  const [timezone, setTimezone] = useState('ET');
  const [activeTab, setActiveTab] = useState('login');

  const [legalName, setLegalName] = useState('Alex Johnson');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('a***n@example.com');
  const [phone, setPhone] = useState('+1 ***-***-0123');
  const [address, setAddress] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('Provided');
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
    <>
      <Layout
        content={
          <LayoutContent padding={0}>
            <Center height="80vh">
              <Button
                label="Open settings"
                variant="primary"
                onClick={() => setIsOpen(true)}
              />
            </Center>
          </LayoutContent>
        }
      />

      <Dialog
        isOpen={isOpen}
        onOpenChange={open => setIsOpen(open)}
        width={900}
        maxHeight="85vh"
        padding={0}
        purpose="form"
        style={dialogHeight}>
        <Layout
          height="fill"
          start={
            <LayoutPanel
              width={280}
              hasDivider
              role="navigation"
              padding={3}>
              <VStack gap={4}>
                <Heading level={2} style={sideNavHeading}>
                  Account settings
                </Heading>
                <List density="spacious">
                  {NAV_ITEMS.map(item => (
                    <ListItem
                      key={item.label}
                      label={item.label}
                      startContent={<Icon icon={item.icon} />}
                      isSelected={activeNav === item.label}
                      onClick={() => {
                        setActiveNav(item.label);
                        setExpandedRow(null);
                      }}
                    />
                  ))}
                </List>
                <Divider />
                <List density="spacious">
                  <ListItem
                    label="Professional hosting tools"
                    startContent={<Icon icon={WrenchScrewdriverIcon} />}
                    onClick={() => {}}
                  />
                </List>
              </VStack>
            </LayoutPanel>
          }
          content={
            <LayoutContent isScrollable padding={6}>
              <VStack gap={6}>
                <VStack style={headerSticky}>
                  <DialogHeader
                    title={
                      activeNav === 'Personal information'
                        ? 'Personal info'
                        : activeNav
                    }
                    onOpenChange={open => setIsOpen(open)}
                    hasDivider={false}
                  />
                </VStack>
                <VStack gap={0} style={contentMaxWidth}>
                  {activeNav === 'Personal information' && (
                    <VStack gap={6}>
                      <VStack gap={4}>
                        <ExpandableRow
                          label="Legal name"
                          value={legalName}
                          isExpanded={expandedRow === 'legalName'}
                          onEdit={() => handleEdit('legalName')}
                          onCancel={handleCancel}
                          onSave={handleSave}>
                          <TextInput
                            label="Legal name"
                            isLabelHidden
                            value={legalName}
                            onChange={setLegalName}
                          />
                        </ExpandableRow>
                        <ExpandableRow
                          label="Preferred first name"
                          value={preferredName || 'Not provided'}
                          isExpanded={expandedRow === 'preferredName'}
                          onEdit={() => handleEdit('preferredName')}
                          onCancel={handleCancel}
                          onSave={handleSave}>
                          <TextInput
                            label="Preferred first name"
                            isLabelHidden
                            value={preferredName}
                            onChange={setPreferredName}
                          />
                        </ExpandableRow>
                        <ExpandableRow
                          label="Email address"
                          value={email}
                          isExpanded={expandedRow === 'email'}
                          onEdit={() => handleEdit('email')}
                          onCancel={handleCancel}
                          onSave={handleSave}>
                          <TextInput
                            label="Email address"
                            isLabelHidden
                            value={email}
                            onChange={setEmail}
                          />
                        </ExpandableRow>
                        <ExpandableRow
                          label="Phone number"
                          value={phone}
                          isExpanded={expandedRow === 'phone'}
                          onEdit={() => handleEdit('phone')}
                          onCancel={handleCancel}
                          onSave={handleSave}>
                          <TextInput
                            label="Phone number"
                            isLabelHidden
                            value={phone}
                            onChange={setPhone}
                          />
                        </ExpandableRow>
                        <InfoRowItem
                          label="Identity verification"
                          value="Verified"
                          action=""
                        />
                        <ExpandableRow
                          label="Residential address"
                          value={address || 'Not provided'}
                          isExpanded={expandedRow === 'address'}
                          onEdit={() => handleEdit('address')}
                          onCancel={handleCancel}
                          onSave={handleSave}>
                          <TextInput
                            label="Residential address"
                            isLabelHidden
                            value={address}
                            onChange={setAddress}
                          />
                        </ExpandableRow>
                        <ExpandableRow
                          label="Mailing address"
                          value={mailingAddress || 'Not provided'}
                          isExpanded={expandedRow === 'mailingAddress'}
                          onEdit={() => handleEdit('mailingAddress')}
                          onCancel={handleCancel}
                          onSave={handleSave}>
                          <TextInput
                            label="Mailing address"
                            isLabelHidden
                            value={mailingAddress}
                            onChange={setMailingAddress}
                          />
                        </ExpandableRow>
                        <ExpandableRow
                          label="Emergency contact"
                          value={emergencyContact}
                          isExpanded={expandedRow === 'emergencyContact'}
                          onEdit={() => handleEdit('emergencyContact')}
                          onCancel={handleCancel}
                          onSave={handleSave}>
                          <TextInput
                            label="Emergency contact"
                            isLabelHidden
                            value={emergencyContact}
                            onChange={setEmergencyContact}
                          />
                        </ExpandableRow>
                      </VStack>

                      <Card padding={4}>
                        <VStack gap={4}>
                          <HStack gap={3} vAlign="start">
                            <Center
                              width={48}
                              height={48}
                              style={iconBox}>
                              <Icon icon={LockClosedIcon} />
                            </Center>
                            <VStack gap={0}>
                              <Text
                                type="body"
                                weight="semibold"
                                display="block">
                                Why isn&apos;t my info shown here?
                              </Text>
                              <Text
                                type="supporting"
                                color="secondary"
                                display="block">
                                We&apos;re hiding some account details to
                                protect your identity.
                              </Text>
                            </VStack>
                          </HStack>
                          <Divider />
                          <HStack gap={3} vAlign="start">
                            <Center
                              width={48}
                              height={48}
                              style={iconBox}>
                              <Icon icon={PencilSquareIcon} />
                            </Center>
                            <VStack gap={0}>
                              <Text
                                type="body"
                                weight="semibold"
                                display="block">
                                Which details can be edited?
                              </Text>
                              <Text
                                type="supporting"
                                color="secondary"
                                display="block">
                                Contact info and personal details can be edited.
                                If this info was used to verify your identity,
                                you&apos;ll need to get verified again the next
                                time you book—or to continue hosting.
                              </Text>
                            </VStack>
                          </HStack>
                          <Divider />
                          <HStack gap={3} vAlign="start">
                            <Center
                              width={48}
                              height={48}
                              style={iconBox}>
                              <Icon icon={ShareIcon} />
                            </Center>
                            <VStack gap={0}>
                              <Text
                                type="body"
                                weight="semibold"
                                display="block">
                                What info is shared with others?
                              </Text>
                              <Text
                                type="supporting"
                                color="secondary"
                                display="block">
                                We only release contact information after a
                                reservation is confirmed.
                              </Text>
                            </VStack>
                          </HStack>
                        </VStack>
                      </Card>
                    </VStack>
                  )}

                  {activeNav === 'Login & security' && (
                    <VStack gap={6}>
                      <TabList
                        value={activeTab}
                        onChange={setActiveTab}
                        hasDivider>
                        <Tab value="login" label="Login" />
                        <Tab value="shared" label="Shared access" />
                      </TabList>

                      {activeTab === 'login' && (
                        <VStack gap={8}>
                          <VStack gap={4}>
                            <Heading level={3}>Login</Heading>
                            <Divider />
                            {LOGIN_ROWS.map(row => (
                              <InfoRowItem key={row.label} {...row} />
                            ))}
                          </VStack>

                          <VStack gap={4}>
                            <Heading level={3}>Social accounts</Heading>
                            <Divider />
                            {SOCIAL_ROWS.map(row => (
                              <InfoRowItem key={row.label} {...row} />
                            ))}
                          </VStack>

                          <VStack gap={4}>
                            <Heading level={3}>Device history</Heading>
                            <Divider />
                            {DEVICE_ROWS.map((device, i) => (
                              <React.Fragment key={i}>
                                <HStack gap={3} vAlign="start">
                                  <Icon icon={ComputerDesktopIcon} />
                                  <StackItem size="fill">
                                    <VStack gap={0}>
                                      <HStack gap={2} vAlign="center">
                                        <Text type="body" weight="semibold">
                                          {device.label}
                                        </Text>
                                        {device.badge && (
                                          <Badge label={device.badge} />
                                        )}
                                      </HStack>
                                      <Text
                                        type="supporting"
                                        color="secondary"
                                        display="block">
                                        {device.location}
                                      </Text>
                                    </VStack>
                                  </StackItem>
                                  {device.action && (
                                    <Link href="#">{device.action}</Link>
                                  )}
                                </HStack>
                                <Divider />
                              </React.Fragment>
                            ))}
                          </VStack>

                          <VStack gap={4}>
                            <Heading level={3}>Account</Heading>
                            <Divider />
                            <HStack hAlign="between" vAlign="start">
                              <VStack gap={0}>
                                <Text
                                  type="body"
                                  weight="semibold"
                                  display="block">
                                  Deactivate your account
                                </Text>
                                <Text
                                  type="supporting"
                                  color="secondary"
                                  display="block">
                                  This action cannot be undone
                                </Text>
                              </VStack>
                              <Link href="#">Deactivate</Link>
                            </HStack>
                            <Divider />
                          </VStack>
                        </VStack>
                      )}

                      {activeTab === 'shared' && (
                        <VStack gap={8}>
                          <VStack gap={2}>
                            <Heading level={3}>Shared access</Heading>
                            <Divider />
                            <Text type="body" color="secondary">
                              Review each request carefully before approving
                              access. We&apos;ll email your employee or
                              co-worker a 4-digit code that lets them log into
                              your account with their trusted device.
                            </Text>
                          </VStack>

                          <Card variant="muted">
                            <HStack gap={4} vAlign="start">
                              <Center
                                width={48}
                                height={48}
                                style={iconBox}>
                                <Icon icon={LockClosedIcon} />
                              </Center>
                              <VStack gap={1}>
                                <Text type="body" weight="bold">
                                  Adding devices from people you trust
                                </Text>
                                <Text type="body" color="secondary">
                                  When you approve a request, you grant someone
                                  full access to your account. They&apos;ll be
                                  able to change reservations and send messages
                                  on your behalf.
                                </Text>
                              </VStack>
                            </HStack>
                          </Card>
                        </VStack>
                      )}
                    </VStack>
                  )}

                  {activeNav === 'Languages & currency' && (
                    <VStack gap={6}>
                      <VStack gap={4}>
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
                          <Selector
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
                          <Selector
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
                          <Selector
                            label="Time zone"
                            isLabelHidden
                            size="lg"
                            value={timezone}
                            onChange={setTimezone}
                            options={TIMEZONES}
                          />
                        </ExpandableRow>
                      </VStack>
                    </VStack>
                  )}

                  {activeNav === 'Privacy' && (
                    <VStack gap={6}>
                      <VStack gap={8}>
                        <VStack gap={4}>
                          <Heading level={3}>Messages</Heading>
                          <Switch
                            label="Show people when I've read their messages."
                            value={readReceipts}
                            onChange={setReadReceipts}
                            labelPosition="start"
                            labelSpacing="spread"
                          />
                          <HStack hAlign="between" vAlign="center">
                            <Text type="body" weight="semibold">
                              Blocked people
                            </Text>
                            <Link href="#">View</Link>
                          </HStack>
                          <Divider />
                        </VStack>

                        <VStack gap={4}>
                          <Heading level={3}>Listings</Heading>
                          <Switch
                            label="Include my listing(s) in search engines"
                            description="Turning this on means search engines, like Google, will display your listing page(s) in search results."
                            value={searchEngines}
                            onChange={setSearchEngines}
                            labelPosition="start"
                            labelSpacing="spread"
                          />
                          <Divider />
                        </VStack>

                        <VStack gap={4}>
                          <Heading level={3}>Reviews</Heading>
                          <Text type="supporting" color="secondary">
                            Choose what&apos;s shared when you write a review.{' '}
                            <Link href="#" type="supporting">
                              Learn more
                            </Link>
                          </Text>
                          <VStack gap={4}>
                            <Switch
                              label="Show my home city and country"
                              description="Ex: City and country"
                              value={showCity}
                              onChange={setShowCity}
                              labelPosition="start"
                              labelSpacing="spread"
                            />
                            <Switch
                              label="Show my trip type"
                              description="Ex: Stayed with kids or pets"
                              value={showTripType}
                              onChange={setShowTripType}
                              labelPosition="start"
                              labelSpacing="spread"
                            />
                            <Switch
                              label="Show my length of stay"
                              description="Ex: A few nights, about a week, etc."
                              value={showStayLength}
                              onChange={setShowStayLength}
                              labelPosition="start"
                              labelSpacing="spread"
                            />
                            <Switch
                              label="Show my booked services"
                              description="Ex: Gourmet brunch or tasting menu"
                              value={showServices}
                              onChange={setShowServices}
                              labelPosition="start"
                              labelSpacing="spread"
                            />
                          </VStack>
                          <Divider />
                        </VStack>

                        <VStack gap={4}>
                          <Heading level={3}>Data privacy</Heading>
                          <Card>
                            <HStack hAlign="between" vAlign="center">
                              <Text type="body">
                                Request my personal data
                              </Text>
                              <Link href="#">Request</Link>
                            </HStack>
                          </Card>
                          <Switch
                            label="Help improve AI-powered features"
                            description="When this is on, we use your data to develop and improve AI models."
                            value={aiFeatures}
                            onChange={setAiFeatures}
                            labelPosition="start"
                            labelSpacing="spread"
                          />
                          <Card>
                            <HStack hAlign="between" vAlign="center">
                              <Text type="body">Delete my account</Text>
                              <Link href="#">Delete</Link>
                            </HStack>
                          </Card>
                          <Card variant="muted">
                            <HStack gap={4} vAlign="start">
                              <Center
                                width={48}
                                height={48}
                                style={iconBox}>
                                <Icon icon={ShieldCheckIcon} />
                              </Center>
                              <VStack gap={1}>
                                <Text type="body" weight="bold">
                                  Committed to privacy
                                </Text>
                                <Text type="supporting" color="secondary">
                                  We&apos;re committed to keeping your data
                                  protected. See details in our{' '}
                                  <Link href="#" type="supporting">
                                    Privacy Policy
                                  </Link>
                                  .
                                </Text>
                              </VStack>
                            </HStack>
                          </Card>
                        </VStack>
                      </VStack>
                    </VStack>
                  )}
                </VStack>
              </VStack>
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}
