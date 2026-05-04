'use client';

import {useState} from 'react';
import {XDSMobileNav, XDSMobileNavToggle} from '@xds/core/MobileNav';
import {XDSAppShellMobileContext} from '@xds/core/AppShell';
import {XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function MobileNavToggleShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <XDSAppShellMobileContext.Provider
      value={{
        isMobile: true,
        isMobileNavOpen: isOpen,
        toggleMobileNav: () => setIsOpen(v => !v),
        openMobileNav: () => setIsOpen(true),
        closeMobileNav: () => setIsOpen(false),
        isMobileNavEnabled: true,
        hasAutoToggle: false,
      }}>
      <XDSHStack gap={3} vAlign="center">
        <XDSMobileNavToggle />
        <XDSText type="body" weight="bold">
          Page title
        </XDSText>
      </XDSHStack>
      <XDSMobileNav
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        header="Navigation">
        <XDSSideNavSection title="Pages">
          <XDSSideNavItem label="Home" isSelected href="#" />
          <XDSSideNavItem label="Settings" href="#" />
        </XDSSideNavSection>
      </XDSMobileNav>
    </XDSAppShellMobileContext.Provider>
  );
}
