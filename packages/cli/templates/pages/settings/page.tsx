// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  XDSVStack,
  XDSHStack,
  XDSStackItem,
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutHeader,
  XDSLayoutPanel,
} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSSection} from '@xds/core/Section';
import {XDSTypeahead} from '@xds/core/Typeahead';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const styles = stylex.create({
  constrainedShell: {
    maxWidth: 1440,
    marginInline: 'auto',
  },
  headerPadding: {
    padding: spacingVars['--spacing-4'],
  },
  sideNavWidth: {
    minWidth: 260,
  },
});

const NAV_ITEMS = [
  'Profile',
  'Account',
  'Members',
  'Billing',
  'Invoices',
  'API',
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
  const [currentPw, setCurrentPw] = useState('password123');
  const [newPw, setNewPw] = useState('password123');
  const [confirmPw, setConfirmPw] = useState('password123');
  const [dataExport, setDataExport] = useState(false);
  const [adminMembers, setAdminMembers] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [searchValue, setSearchValue] = useState<XDSSearchableItem | null>(
    null,
  );

  return (
    <XDSLayout
      height="auto"
      xstyle={styles.constrainedShell}
      header={
        <XDSLayoutHeader hasDivider>
          <XDSHStack vAlign="center" xstyle={styles.headerPadding}>
            <XDSStackItem size="fill">
              <XDSHeading level={1}>Settings</XDSHeading>
            </XDSStackItem>
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
          </XDSHStack>
        </XDSLayoutHeader>
      }
      start={
        <XDSLayoutPanel hasDivider={false} padding={0}>
          <XDSSection
            padding={2}
            variant="transparent"
            xstyle={styles.sideNavWidth}>
            <XDSList density="balanced">
              {NAV_ITEMS.map(item => (
                <XDSListItem
                  key={item}
                  label={item}
                  isSelected={activeNav === item}
                  onClick={() => setActiveNav(item)}
                />
              ))}
            </XDSList>
          </XDSSection>
        </XDSLayoutPanel>
      }
      content={
        <XDSLayoutContent padding={4}>
          <XDSVStack gap={4}>
            <XDSGrid columns={{minWidth: 320}} gap={10}>
              <XDSVStack gap={1}>
                <XDSHeading level={3}>Basic information</XDSHeading>
                <XDSText type="supporting" color="secondary">
                  View and update your personal details and account information.
                </XDSText>
              </XDSVStack>
              <XDSVStack gap={4}>
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
                <XDSHStack>
                  <XDSButton label="Save" variant="primary" />
                </XDSHStack>
              </XDSVStack>
            </XDSGrid>

            <XDSDivider />

            <XDSGrid columns={{minWidth: 320}} gap={10}>
              <XDSVStack gap={1}>
                <XDSHeading level={3}>Change password</XDSHeading>
                <XDSText type="supporting" color="secondary">
                  Update your password to keep your account secure.
                </XDSText>
              </XDSVStack>
              <XDSVStack gap={4}>
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
                <XDSHStack>
                  <XDSButton label="Save" variant="primary" />
                </XDSHStack>
              </XDSVStack>
            </XDSGrid>

            <XDSDivider />

            <XDSGrid columns={{minWidth: 320}} gap={10}>
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
                <XDSHStack>
                  <XDSButton label="Save" variant="primary" />
                </XDSHStack>
              </XDSVStack>
            </XDSGrid>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
