'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSSideNav} from '@xds/core/SideNav';
import {XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {useState} from 'react';

export default function AppShellPaddedContent() {
  const [appName, setAppName] = useState('');

  return (
    <XDSAppShell
      contentPadding={4}
      topNav={
        <XDSTopNav
          label="App"
          heading={<XDSTopNavHeading heading="Settings" />}
        />
      }
      sideNav={
        <XDSSideNav>
          <div style={{padding: 16}}>Navigation items</div>
        </XDSSideNav>
      }>
      <XDSHeading level={1}>General</XDSHeading>
      <XDSTextInput
        label="App Name"
        value={appName}
        onChange={(v) => setAppName(v)}
      />
    </XDSAppShell>
  );
}
