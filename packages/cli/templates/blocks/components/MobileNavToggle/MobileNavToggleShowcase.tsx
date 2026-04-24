'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSMobileNav, XDSMobileNavToggle} from '@xds/core/MobileNav';
import {XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

export default function MobileNavToggleShowcase() {
  return (
    <XDSAppShell
      mobileNav={
        <XDSMobileNav header="Navigation">
          <XDSSideNavSection title="Pages">
            <XDSSideNavItem label="Home" isSelected href="#" />
            <XDSSideNavItem label="Settings" href="#" />
          </XDSSideNavSection>
        </XDSMobileNav>
      }>
      <XDSCenter>
        <XDSVStack gap={3} hAlign="center">
          <XDSMobileNavToggle />
          <XDSText type="supporting" color="secondary">
            Resize to mobile width to see the toggle
          </XDSText>
        </XDSVStack>
      </XDSCenter>
    </XDSAppShell>
  );
}
