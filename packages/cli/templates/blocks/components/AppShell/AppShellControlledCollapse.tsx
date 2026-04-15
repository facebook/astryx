'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSSideNav} from '@xds/core/SideNav';
import {useState} from 'react';

export default function AppShellControlledCollapse() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="App"
          heading={<XDSTopNavHeading heading="App" />}
        />
      }
      sideNav={
        <XDSSideNav>
          <div style={{padding: 16}}>Navigation items</div>
        </XDSSideNav>
      }
      // @ts-expect-error migrated example
      isSideNavCollapsed={collapsed}
      onSideNavCollapsedChange={setCollapsed}>
      <div style={{padding: 24}}>
        <h1>Content</h1>
        <p>SideNav collapse is controlled externally.</p>
      </div>
    </XDSAppShell>
  );
}
