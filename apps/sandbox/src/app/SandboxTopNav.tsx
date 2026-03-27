'use client';

import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {BuildStatus} from './BuildStatus';

export function SandboxTopNav() {
  return (
    <XDSTopNav
      label="Main navigation"
      heading={<XDSTopNavHeading heading="XDS Sandbox" />}
      endContent={<BuildStatus />}
    />
  );
}
