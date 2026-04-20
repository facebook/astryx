'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSText} from '@xds/core/Text';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';

function CubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.5V7.914a1.5 1.5 0 0 0-.75-1.299l-7.5-4.329a1.5 1.5 0 0 0-1.5 0l-7.5 4.33A1.5 1.5 0 0 0 3 7.913V16.5a1.5 1.5 0 0 0 .75 1.3l7.5 4.328a1.5 1.5 0 0 0 1.5 0l7.5-4.329A1.5 1.5 0 0 0 21 16.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 7.5 8.25 4.764 8.25-4.764M12 22.089V12.264" />
    </svg>
  );
}

export default function AppShellTopNavOnly() {
  return (
    <XDSAppShell
      contentPadding={6}
      topNav={
        <XDSTopNav
          label="Main navigation"
          heading={
            <XDSTopNavHeading
              heading="Acme App"
              logo={<XDSNavIcon icon={<CubeIcon />} />}
            />
          }
          startContent={
            <>
              <XDSTopNavItem label="Home" href="#" isSelected />
              <XDSTopNavItem label="Products" href="#" />
              <XDSTopNavItem label="Docs" href="#" />
            </>
          }
        />
      }>
      <XDSText type="large">Page Content</XDSText>
      <XDSText type="body">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </XDSText>
    </XDSAppShell>
  );
}
