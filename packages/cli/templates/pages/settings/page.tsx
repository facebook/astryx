'use client';

import {useState} from 'react';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSSideNav, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSVStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTypeahead} from '@xds/core/Typeahead';
import {
  MagnifyingGlassIcon,
  UserIcon,
  Cog6ToothIcon,
  UsersIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const NAV_ITEMS = [
  {label: 'Profile', icon: UserIcon},
  {label: 'Account', icon: Cog6ToothIcon},
  {label: 'Members', icon: UsersIcon},
  {label: 'Billing', icon: CreditCardIcon},
  {label: 'Invoices', icon: DocumentTextIcon},
  {label: 'API', icon: CodeBracketIcon},
];

const SETTINGS_ITEMS: XDSSearchableItem[] = [
  {id: '1', label: 'Username'},
  {id: '2', label: 'First name'},
  {id: '3', label: 'Last name'},
  {id: '4', label: 'Email address'},
  {id: '5', label: 'Change password'},
  {id: '6', label: 'Data Export Access'},
  {id: '7', label: 'Allow Admin to Add Members'},
  {id: '8', label: 'Two-Factor Authentication'},
];

const settingsSearchSource: XDSSearchSource<XDSSearchableItem> = {
  search: (query: string) =>
    SETTINGS_ITEMS.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase()),
    ),
  bootstrap: () => SETTINGS_ITEMS,
};

export default function SettingsTemplate() {
  const [activeNav, setActiveNav] = useState('Profile');
  const [username, setUsername] = useState('nicol43');
  const [firstName, setFirstName] = useState('Stephanie');
  const [lastName, setLastName] = useState('Nicol');
  const [email, setEmail] = useState('stephanie_nicol@mail.com');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [dataExport, setDataExport] = useState(false);
  const [adminMembers, setAdminMembers] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [searchValue, setSearchValue] = useState<XDSSearchableItem | null>(
    null,
  );

  return (
    <XDSAppShell
      contentPadding={4}
      height="auto"
      topNav={
        <XDSTopNav
          label="Settings"
          heading={<XDSTopNavHeading heading="Settings" />}
          endContent={
            <XDSTypeahead
              label="Search"
              isLabelHidden
              placeholder="Search settings..."
              searchSource={settingsSearchSource}
              value={searchValue}
              onChange={setSearchValue}
              hasEntriesOnFocus
              startIcon={MagnifyingGlassIcon}
            />
          }
        />
      }
      sideNav={
        <XDSSideNav>
          {NAV_ITEMS.map(item => (
            <XDSSideNavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              isSelected={activeNav === item.label}
              onClick={() => setActiveNav(item.label)}
            />
          ))}
        </XDSSideNav>
      }>
      <XDSVStack gap={6}>
        <XDSGrid columns={{minWidth: 280, max: 2}} gap={7}>
          <XDSVStack gap={1}>
            <XDSHeading level={3}>Basic information</XDSHeading>
            <XDSText type="supporting" color="secondary">
              View and update your personal details and account information.
            </XDSText>
          </XDSVStack>
          <XDSFormLayout>
            <XDSTextInput
              label="Username"
              value={username}
              onChange={setUsername}
            />
            <XDSTextInput
              label="First name"
              value={firstName}
              onChange={setFirstName}
            />
            <XDSTextInput
              label="Last name"
              value={lastName}
              onChange={setLastName}
            />
            <XDSTextInput
              label="Email address"
              value={email}
              onChange={setEmail}
            />
            <XDSButton label="Save" variant="primary" />
          </XDSFormLayout>
        </XDSGrid>

        <XDSDivider />

        <XDSGrid columns={{minWidth: 280, max: 2}} gap={7}>
          <XDSVStack gap={1}>
            <XDSHeading level={3}>Change password</XDSHeading>
            <XDSText type="supporting" color="secondary">
              Update your password to keep your account secure.
            </XDSText>
          </XDSVStack>
          <XDSFormLayout>
            <XDSTextInput
              label="Verify current password"
              type="password"
              value={currentPw}
              onChange={setCurrentPw}
            />
            <XDSTextInput
              label="New password"
              type="password"
              value={newPw}
              onChange={setNewPw}
            />
            <XDSTextInput
              label="Confirm password"
              type="password"
              value={confirmPw}
              onChange={setConfirmPw}
            />
            <XDSButton label="Save" variant="primary" />
          </XDSFormLayout>
        </XDSGrid>

        <XDSDivider />

        <XDSGrid columns={{minWidth: 280, max: 2}} gap={7}>
          <XDSVStack gap={1}>
            <XDSHeading level={3}>Advanced settings</XDSHeading>
            <XDSText type="supporting" color="secondary">
              Configure detailed account preferences and security options.
            </XDSText>
          </XDSVStack>
          <XDSVStack gap={5}>
            <XDSCheckboxInput
              label="Data Export Access"
              description="Allow export of personal data and backups."
              value={dataExport}
              onChange={setDataExport}
            />
            <XDSCheckboxInput
              label="Allow Admin to Add Members"
              description="Admins can invite and manage members."
              value={adminMembers}
              onChange={setAdminMembers}
            />
            <XDSCheckboxInput
              label="Enable Two-Factor Authentication"
              description="Require 2FA for added account security."
              value={twoFactor}
              onChange={setTwoFactor}
            />
            <XDSButton label="Save" variant="primary" />
          </XDSVStack>
        </XDSGrid>
      </XDSVStack>
    </XDSAppShell>
  );
}
