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
  DocumentTextIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {HomeIcon} from '@heroicons/react/24/solid';
import {CubeIcon} from '@heroicons/react/24/outline';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fit: {
    height: '100%',
    minHeight: 0,
    width: '100%',
  },
});

export default function AppShellShowcase() {
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
            <XDSSideNavItem label="Home" icon={HomeIcon} isSelected href="#" />
            <XDSSideNavItem label="Reports" icon={ChartBarIcon} href="#" />
            <XDSSideNavItem
              label="Documents"
              icon={DocumentTextIcon}
              href="#"
            />
            <XDSSideNavItem label="Team" icon={UsersIcon} href="#" />
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
