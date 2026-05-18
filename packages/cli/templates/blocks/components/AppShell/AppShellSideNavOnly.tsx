// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {HomeIcon} from '@heroicons/react/24/solid';
import {CubeIcon} from '@heroicons/react/24/outline';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fit: {
    height: '100%',
    minHeight: 0,
  },
});

export default function AppShellSideNavOnly() {
  return (
    <XDSAppShell
      contentPadding={6}
      xstyle={styles.fit}
      sideNav={
        <XDSSideNav
          header={
            <XDSSideNavHeading
              icon={
                <XDSNavIcon
                  icon={<CubeIcon style={{width: 16, height: 16}} />}
                />
              }
              heading="App Shell"
              headingHref="#"
            />
          }>
          <XDSSideNavSection title="Main" isHeaderHidden>
            <XDSSideNavItem
              label="Dashboard"
              icon={HomeIcon}
              isSelected
              href="#"
            />
            <XDSSideNavItem label="Analytics" icon={ChartBarIcon} href="#" />
            <XDSSideNavItem label="Projects" icon={FolderIcon} href="#" />
          </XDSSideNavSection>
          <XDSSideNavSection title="Organization">
            <XDSSideNavItem label="Team" icon={UsersIcon} href="#" />
            <XDSSideNavItem label="Settings" icon={Cog6ToothIcon} href="#" />
          </XDSSideNavSection>
        </XDSSideNav>
      }>
      <XDSVStack gap={4}>
        <XDSHeading level={3}>Page Content</XDSHeading>
        <XDSText type="body">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </XDSText>
      </XDSVStack>
    </XDSAppShell>
  );
}
