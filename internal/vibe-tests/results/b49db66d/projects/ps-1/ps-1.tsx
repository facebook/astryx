import React, {useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {TopNav} from '@astryxdesign/core/TopNav';
import {TopNavHeading} from '@astryxdesign/core/TopNav';
import {SideNav} from '@astryxdesign/core/SideNav';
import {SideNavItem} from '@astryxdesign/core/SideNav';
import {SideNavSection} from '@astryxdesign/core/SideNav';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Switch} from '@astryxdesign/core/Switch';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  section: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 },
  formRow: { display: 'flex', flexDirection: 'column', gap: 8 },
});

function ProfileIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 015 5v1a5 5 0 01-10 0V7a5 5 0 015-5zm-7 18a7 7 0 0114 0H5z"/></svg>; }
function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 017 7v4l2 3H3l2-3V9a7 7 0 017-7zm-1 19h2a1 1 0 01-2 0z"/></svg>; }
function ShieldIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l9 4v6c0 5.25-3.81 9.74-9 11-5.19-1.26-9-5.75-9-11V5l9-4z"/></svg>; }
function PaletteIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2 2 0 002-2c0-.5-.2-.97-.5-1.33A1.75 1.75 0 0114.83 17h1.67c3.04 0 5.5-2.46 5.5-5.5C22 6.49 17.51 2 12 2z"/></svg>; }

export default function SettingsDashboard() {
  const [selected, setSelected] = useState('profile');
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@example.com');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  const sidebar = (
    <SideNav>
      <SideNavSection label="Settings">
        <SideNavItem label="Profile" icon={<ProfileIcon />} isSelected={selected === 'profile'} onClick={() => setSelected('profile')} />
        <SideNavItem label="Notifications" icon={<BellIcon />} isSelected={selected === 'notifications'} onClick={() => setSelected('notifications')} />
        <SideNavItem label="Security" icon={<ShieldIcon />} isSelected={selected === 'security'} onClick={() => setSelected('security')} />
        <SideNavItem label="Appearance" icon={<PaletteIcon />} isSelected={selected === 'appearance'} onClick={() => setSelected('appearance')} />
      </SideNavSection>
    </SideNav>
  );

  return (
    <AppShell topNav={<TopNav heading={<TopNavHeading title="Settings App" />} />} sideNav={sidebar} contentPadding={4}>
      <div {...stylex.props(styles.section)}>
        {selected === 'profile' && (<><Heading level={2}>Profile</Heading><Text type="supporting">Manage your account details.</Text><Card><div {...stylex.props(styles.formRow)}><TextInput label="Full Name" value={name} onChange={setName} /><TextInput label="Email" type="email" value={email} onChange={setEmail} /><Button label="Save changes" variant="primary" /></div></Card></>)}
        {selected === 'notifications' && (<><Heading level={2}>Notifications</Heading><Card><div {...stylex.props(styles.formRow)}><Switch label="Email notifications" value={emailNotifs} onChange={setEmailNotifs} /><Switch label="Push notifications" value={pushNotifs} onChange={setPushNotifs} /></div></Card></>)}
        {selected === 'security' && (<><Heading level={2}>Security</Heading><Card><div {...stylex.props(styles.formRow)}><Button label="Change password" variant="secondary" /><Button label="Enable 2FA" variant="secondary" /></div></Card></>)}
        {selected === 'appearance' && (<><Heading level={2}>Appearance</Heading><Card><Text>Theme settings here.</Text></Card></>)}
      </div>
    </AppShell>
  );
}
