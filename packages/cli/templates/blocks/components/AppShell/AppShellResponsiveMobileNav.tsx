'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSSideNav} from '@xds/core/SideNav';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSButton} from '@xds/core/Button';
import {useState} from 'react';

function MenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

export default function AppShellResponsiveMobileNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <XDSAppShell
      topNav={
        <XDSTopNav
          label="Navigation"
          heading={<XDSTopNavHeading heading="My App" />}
          startContent={
            <>
              <XDSButton
                label="Menu"
                icon={<MenuIcon />}
                variant="ghost"
                onClick={() => setMobileOpen(true)}
              />
              <XDSTopNavItem label="Home" href="/" isSelected />
            </>
          }
        />
      }
      sideNav={
        <XDSSideNav>
          <div style={{padding: 16}}>Navigation items</div>
        </XDSSideNav>
      }
      mobileNav={
        <XDSMobileNav
          isOpen={mobileOpen}
          onOpenChange={(open) => setMobileOpen(open)}
          header="My App">
          <div style={{padding: 16}}>Navigation items</div>
        </XDSMobileNav>
      }>
      <div style={{padding: 24}}>
        <h1>Content</h1>
        <p>Responsive layout with mobile navigation drawer.</p>
      </div>
    </XDSAppShell>
  );
}
