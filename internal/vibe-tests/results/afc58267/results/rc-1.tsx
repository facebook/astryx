// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {TopNav} from '@astryxdesign/core/TopNav';
import {NavItem} from '@astryxdesign/core/NavItem';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MobileNav} from '@astryxdesign/core/MobileNav';
import {HStack} from '@astryxdesign/core/HStack';
import {Text} from '@astryxdesign/core/Text';

const navItems = [
  {label: 'Home', href: '/'},
  {label: 'Products', href: '/products'},
  {label: 'About', href: '/about'},
  {label: 'Contact', href: '/contact'},
];

export default function ResponsiveNavigation() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <TopNav>
        <HStack gap="md" align="center" style={{width: '100%'}}>
          <Text weight="bold" size="lg">Logo</Text>
          <HStack gap="sm" style={{marginLeft: 'auto'}}>
            <div className="desktop-nav">
              {navItems.map(item => (
                <NavItem key={item.href} href={item.href}>
                  {item.label}
                </NavItem>
              ))}
            </div>
            <div className="mobile-toggle">
              <IconButton
                label="Open menu"
                icon="menu"
                variant="ghost"
                onClick={() => setIsMobileOpen(true)}
              />
            </div>
          </HStack>
        </HStack>
      </TopNav>
      <MobileNav
        isOpen={isMobileOpen}
        onOpenChange={setIsMobileOpen}
      >
        {navItems.map(item => (
          <NavItem key={item.href} href={item.href}>
            {item.label}
          </NavItem>
        ))}
      </MobileNav>
      <style>{`
        .desktop-nav { display: flex; gap: var(--xds-spacing-sm); }
        .mobile-toggle { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .mobile-toggle { display: block; }
        }
      `}</style>
    </>
  );
}
