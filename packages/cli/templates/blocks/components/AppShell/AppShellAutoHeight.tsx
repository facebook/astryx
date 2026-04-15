'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSSideNav} from '@xds/core/SideNav';

export default function AppShellAutoHeight() {
  return (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Docs"
          heading={<XDSTopNavHeading heading="Docs" />}
        />
      }
      sideNav={
        <XDSSideNav>
          <div style={{padding: 16}}>Navigation items</div>
        </XDSSideNav>
      }
      height="auto">
      <div style={{padding: 24}}>
        <h1>Documentation</h1>
        <p>Long document content that grows with the page.</p>
      </div>
    </XDSAppShell>
  );
}
