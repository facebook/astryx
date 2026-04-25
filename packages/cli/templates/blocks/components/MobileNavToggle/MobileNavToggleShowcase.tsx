'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSMobileNavToggle} from '@xds/core/MobileNav';
import {XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSCenter} from '@xds/core/Center';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function MobileNavToggleShowcase() {
  return (
    <XDSAppShell
      mobileNav={{hasToggle: false, breakpoint: 'lg'}}
      sideNav={
        <XDSSideNavSection title="Pages">
          <XDSSideNavItem label="Home" isSelected href="#" />
          <XDSSideNavItem label="Settings" href="#" />
        </XDSSideNavSection>
      }>
      <XDSCenter>
        <XDSVStack gap={3} hAlign="center">
          <XDSMobileNavToggle />
          <XDSText type="supporting" color="secondary">
            Resize below the large breakpoint to see the toggle
          </XDSText>
        </XDSVStack>
      </XDSCenter>
    </XDSAppShell>
  );
}
