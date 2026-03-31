'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';

import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSButton} from '@xds/core/Button';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSDivider} from '@xds/core/Divider';
import {XDSSelector} from '@xds/core/Selector';
import {XDSBadge} from '@xds/core/Badge';

// Icons
const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const PaintbrushIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z" />
    <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
  </svg>
);
const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const styles = stylex.create({
  formSection: {padding: '24px'},
  row: {display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16},
  avatarRow: {display: 'flex', alignItems: 'center', gap: 16},
  actions: {display: 'flex', justifyContent: 'flex-end', gap: 8},
  notifRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

// Sub-pages
function ProfileTab() {
  const [name, setName] = useState('Olivia Martin');
  const [email, setEmail] = useState('olivia@acme.com');
  const [bio, setBio] = useState('Product designer based in San Francisco.');
  const [role, setRole] = useState('Designer');

  return (
    <XDSVStack gap={6}>
      <XDSCard>
        <div {...stylex.props(styles.formSection)}>
          <XDSVStack gap={5}>
            <XDSVStack gap={1}>
              <XDSText type="body" weight="bold">
                Profile
              </XDSText>
              <XDSText type="supporting" color="secondary">
                Manage your public profile information.
              </XDSText>
            </XDSVStack>
            <XDSDivider />
            <div {...stylex.props(styles.avatarRow)}>
              <XDSAvatar
                src="https://i.pravatar.cc/80?img=1"
                name="Olivia Martin"
                size="large"
              />
              <XDSVStack gap={1}>
                <XDSButton
                  label="Change avatar"
                  variant="secondary"
                  size="sm"
                />
                <XDSText type="supporting" color="secondary">
                  JPG, GIF or PNG. 1MB max.
                </XDSText>
              </XDSVStack>
            </div>
            <div {...stylex.props(styles.row)}>
              <XDSTextInput label="Full name" value={name} onChange={setName} />
              <XDSTextInput label="Email" value={email} onChange={setEmail} />
            </div>
            <div {...stylex.props(styles.row)}>
              <XDSTextInput label="Role" value={role} onChange={setRole} />
              <XDSSelector
                label="Timezone"
                value="pst"
                options={[
                  {value: 'pst', label: 'Pacific Time (PT)'},
                  {value: 'est', label: 'Eastern Time (ET)'},
                  {value: 'utc', label: 'UTC'},
                  {value: 'cet', label: 'Central European Time'},
                ]}
                onChange={() => {}}
              />
            </div>
            <XDSTextArea label="Bio" value={bio} onChange={setBio} />
            <div {...stylex.props(styles.actions)}>
              <XDSButton label="Cancel" variant="secondary" size="sm" />
              <XDSButton label="Save changes" variant="primary" size="sm" />
            </div>
          </XDSVStack>
        </div>
      </XDSCard>
    </XDSVStack>
  );
}

function NotificationsTab() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [security, setSecurity] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const items = [
    {
      label: 'Email notifications',
      desc: 'Receive email about account activity.',
      value: emailNotifs,
      onChange: setEmailNotifs,
    },
    {
      label: 'Push notifications',
      desc: 'Receive push notifications on your devices.',
      value: pushNotifs,
      onChange: setPushNotifs,
    },
    {
      label: 'Marketing emails',
      desc: 'Receive emails about new features and updates.',
      value: marketing,
      onChange: setMarketing,
    },
    {
      label: 'Security alerts',
      desc: 'Get notified about unusual account activity.',
      value: security,
      onChange: setSecurity,
    },
    {
      label: 'Weekly digest',
      desc: 'A weekly summary of your activity.',
      value: weeklyDigest,
      onChange: setWeeklyDigest,
    },
  ];

  return (
    <XDSCard>
      <div {...stylex.props(styles.formSection)}>
        <XDSVStack gap={5}>
          <XDSVStack gap={1}>
            <XDSText type="body" weight="bold">
              Notifications
            </XDSText>
            <XDSText type="supporting" color="secondary">
              Choose what notifications you receive.
            </XDSText>
          </XDSVStack>
          <XDSDivider />
          {items.map(item => (
            <div key={item.label} {...stylex.props(styles.notifRow)}>
              <XDSVStack gap={0}>
                <XDSText type="body">{item.label}</XDSText>
                <XDSText type="supporting" color="secondary">
                  {item.desc}
                </XDSText>
              </XDSVStack>
              <XDSSwitch
                label={item.label}
                isLabelHidden
                value={item.value}
                onChange={item.onChange}
              />
            </div>
          ))}
          <div {...stylex.props(styles.actions)}>
            <XDSButton label="Save preferences" variant="primary" size="sm" />
          </div>
        </XDSVStack>
      </div>
    </XDSCard>
  );
}

function SecurityTab() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const sessions = [
    {
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      time: 'Active now',
      current: true,
    },
    {
      device: 'iPhone 15',
      location: 'San Francisco, CA',
      time: '2 hours ago',
      current: false,
    },
    {
      device: 'Windows PC',
      location: 'New York, NY',
      time: '3 days ago',
      current: false,
    },
  ];

  return (
    <XDSVStack gap={6}>
      <XDSCard>
        <div {...stylex.props(styles.formSection)}>
          <XDSVStack gap={5}>
            <XDSVStack gap={1}>
              <XDSText type="body" weight="bold">
                Change Password
              </XDSText>
              <XDSText type="supporting" color="secondary">
                Update your password to keep your account secure.
              </XDSText>
            </XDSVStack>
            <XDSDivider />
            <XDSTextInput
              label="Current password"
              value={currentPw}
              onChange={setCurrentPw}
              type="password"
            />
            <div {...stylex.props(styles.row)}>
              <XDSTextInput
                label="New password"
                value={newPw}
                onChange={setNewPw}
                type="password"
              />
              <XDSTextInput
                label="Confirm password"
                value={confirmPw}
                onChange={setConfirmPw}
                type="password"
              />
            </div>
            <div {...stylex.props(styles.actions)}>
              <XDSButton label="Update password" variant="primary" size="sm" />
            </div>
          </XDSVStack>
        </div>
      </XDSCard>
      <XDSCard>
        <div {...stylex.props(styles.formSection)}>
          <XDSVStack gap={4}>
            <XDSVStack gap={1}>
              <XDSText type="body" weight="bold">
                Active Sessions
              </XDSText>
              <XDSText type="supporting" color="secondary">
                Manage your active sessions across devices.
              </XDSText>
            </XDSVStack>
            <XDSDivider />
            {sessions.map(s => (
              <XDSHStack key={s.device} gap={3} vAlign="center">
                <div style={{flex: 1}}>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSText type="body" weight="bold">
                      {s.device}
                    </XDSText>
                    {s.current && (
                      <XDSBadge variant="success" label="Current" />
                    )}
                  </XDSHStack>
                  <XDSText type="supporting" color="secondary">
                    {s.location} &middot; {s.time}
                  </XDSText>
                </div>
                {!s.current && (
                  <XDSButton label="Revoke" variant="ghost" size="sm" />
                )}
              </XDSHStack>
            ))}
          </XDSVStack>
        </div>
      </XDSCard>
    </XDSVStack>
  );
}

// Sidebar
function SettingsSideNav() {
  const [active, setActive] = useState('profile');
  return (
    <XDSSideNav
      header={
        <div style={{padding: '12px 16px'}}>
          <XDSText type="body" weight="bold">
            Settings
          </XDSText>
        </div>
      }>
      <XDSSideNavSection title="Account">
        <XDSSideNavItem
          label="Profile"
          icon={ProfileIcon}
          isSelected={active === 'profile'}
          onClick={() => setActive('profile')}
        />
        <XDSSideNavItem
          label="Notifications"
          icon={BellIcon}
          isSelected={active === 'notifications'}
          onClick={() => setActive('notifications')}
        />
        <XDSSideNavItem
          label="Security"
          icon={ShieldIcon}
          isSelected={active === 'security'}
          onClick={() => setActive('security')}
        />
      </XDSSideNavSection>
      <XDSSideNavSection title="Preferences">
        <XDSSideNavItem
          label="Appearance"
          icon={PaintbrushIcon}
          isSelected={active === 'appearance'}
          onClick={() => setActive('appearance')}
        />
        <XDSSideNavItem
          label="API Keys"
          icon={KeyIcon}
          isSelected={active === 'api'}
          onClick={() => setActive('api')}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

export default function SettingsTemplate() {
  const [tab, setTab] = useState('profile');

  const content =
    tab === 'notifications' ? (
      <NotificationsTab />
    ) : tab === 'security' ? (
      <SecurityTab />
    ) : (
      <ProfileTab />
    );

  return (
    <XDSAppShell
      sideNav={<SettingsSideNav />}
      variant="elevated"
      contentPadding={6}>
      <XDSVStack gap={6}>
        <XDSVStack gap={1}>
          <XDSHeading level={1}>Settings</XDSHeading>
          <XDSText type="body" color="secondary">
            Manage your account settings and preferences.
          </XDSText>
        </XDSVStack>
        <XDSTabList value={tab} onChange={setTab}>
          <XDSTab value="profile" label="Profile" />
          <XDSTab value="notifications" label="Notifications" />
          <XDSTab value="security" label="Security" />
        </XDSTabList>
        {content}
      </XDSVStack>
    </XDSAppShell>
  );
}
