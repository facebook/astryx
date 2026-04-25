'use client';

import {useState} from 'react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSCenter} from '@xds/core/Center';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function MobileNavToggleShowcase() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <XDSCenter>
      <XDSVStack gap={3} hAlign="center">
        <XDSButton
          label="Open navigation"
          variant="ghost"
          icon={<XDSIcon icon="menu" color="inherit" />}
          isIconOnly
          onClick={() => setIsOpen(true)}
        />
        <XDSText type="supporting" color="secondary">
          XDSMobileNavToggle renders this hamburger button automatically inside
          an AppShell at mobile breakpoints.
        </XDSText>
        <XDSMobileNav isOpen={isOpen} onOpenChange={setIsOpen} header="Navigation">
          <XDSSideNavSection title="Pages">
            <XDSSideNavItem label="Home" isSelected href="#" />
            <XDSSideNavItem label="Settings" href="#" />
          </XDSSideNavSection>
        </XDSMobileNav>
      </XDSVStack>
    </XDSCenter>
  );
}
