'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';

const styles = stylex.create({
  sidebarItem: {
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
  sidebarItemSelected: {
    fontWeight: 600,
  },
});

const NAV_ITEMS = ['Profile', 'Account', 'Members', 'Billing', 'Invoices', 'API'];

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

  return (
    <div style={{height: '100svh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid var(--xds-color-border-primary, #e5e5e5)', flexShrink: 0}}>
        <XDSHeading level={1}>Settings</XDSHeading>
        <div style={{width: 240}}>
          <XDSTextInput label="Search" isLabelHidden placeholder="Search" value="" onChange={() => {}} />
        </div>
      </div>

      {/* Body */}
      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        {/* Sidebar */}
        <nav style={{width: 200, padding: 8, borderRight: '1px solid var(--xds-color-border-primary, #e5e5e5)', flexShrink: 0, overflowY: 'auto'}}>
          <XDSList density="compact">
            {NAV_ITEMS.map(item => (
              <XDSListItem
                key={item}
                label={item}
                isSelected={activeNav === item}
                onClick={() => setActiveNav(item)}
              />
            ))}
          </XDSList>
        </nav>

        {/* Content */}
        <div style={{flex: 1, padding: 16, maxWidth: 960, overflowY: 'auto'}}>
          <XDSVStack gap={8}>
            {/* Basic information */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40}}>
              <div>
                <XDSVStack gap={1}>
                  <XDSHeading level={3}>Basic information</XDSHeading>
                  <XDSText type="supporting" color="secondary">
                    View and update your personal details and account information.
                  </XDSText>
                </XDSVStack>
              </div>
              <div>
                <XDSVStack gap={4}>
                  <XDSTextInput label="Username" value={username} onChange={setUsername} />
                  <XDSTextInput label="First name" value={firstName} onChange={setFirstName} />
                  <XDSTextInput label="Last name" value={lastName} onChange={setLastName} />
                  <XDSTextInput label="Email address" value={email} onChange={setEmail} />
                  <div>
                    <XDSButton label="Save" variant="primary" />
                  </div>
                </XDSVStack>
              </div>
            </div>

            <XDSDivider />

            {/* Change password */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40}}>
              <div>
                <XDSVStack gap={1}>
                  <XDSHeading level={3}>Change password</XDSHeading>
                  <XDSText type="supporting" color="secondary">
                    Update your password to keep your account secure.
                  </XDSText>
                </XDSVStack>
              </div>
              <div>
                <XDSVStack gap={4}>
                  <XDSTextInput label="Verify current password" type="password" value={currentPw} onChange={setCurrentPw} />
                  <XDSTextInput label="New password" type="password" value={newPw} onChange={setNewPw} />
                  <XDSTextInput label="Confirm password" type="password" value={confirmPw} onChange={setConfirmPw} />
                  <div>
                    <XDSButton label="Save" variant="primary" />
                  </div>
                </XDSVStack>
              </div>
            </div>

            <XDSDivider />

            {/* Advanced settings */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40}}>
              <div>
                <XDSVStack gap={1}>
                  <XDSHeading level={3}>Advanced settings</XDSHeading>
                  <XDSText type="supporting" color="secondary">
                    Configure detailed account preferences and security options.
                  </XDSText>
                </XDSVStack>
              </div>
              <div>
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
                  <div>
                    <XDSButton label="Save" variant="primary" />
                  </div>
                </XDSVStack>
              </div>
            </div>
          </XDSVStack>
        </div>
      </div>
    </div>
  );
}
