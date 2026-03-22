'use client';

import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';

export function SandboxTopNav() {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="XDS Sandbox" />}
    />
  );
}
