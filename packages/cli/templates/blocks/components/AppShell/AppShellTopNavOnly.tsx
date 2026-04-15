'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';

export default function AppShellTopNavOnly() {
  return (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Navigation"
          heading={<XDSTopNavHeading heading="Landing Page" />}
        />
      }>
      <div style={{padding: 24}}>
        <h1>Landing Page</h1>
        <p>Main content area</p>
      </div>
    </XDSAppShell>
  );
}
