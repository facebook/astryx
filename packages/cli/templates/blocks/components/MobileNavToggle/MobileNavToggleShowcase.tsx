'use client';

import {useState} from 'react';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSSideNavItem, XDSSideNavSection} from '@xds/core/SideNav';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSSection} from '@xds/core/Layout';

export default function MobileNavToggleShowcase() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <XDSSection>
      <XDSButton
        label="Open navigation"
        variant="ghost"
        icon={<XDSIcon icon="menu" color="inherit" />}
        isIconOnly
        onClick={() => setIsOpen(true)}
      />
      <XDSMobileNav isOpen={isOpen} onOpenChange={setIsOpen} header="Navigation">
        <XDSSideNavSection title="Pages">
          <XDSSideNavItem label="Home" isSelected href="#" />
          <XDSSideNavItem label="Settings" href="#" />
        </XDSSideNavSection>
      </XDSMobileNav>
    </XDSSection>
  );
}
