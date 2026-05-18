// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {CubeIcon} from '@heroicons/react/24/outline';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fit: {
    height: '100%',
    minHeight: 0,
  },
});

export default function AppShellTopNavOnly() {
  return (
    <XDSAppShell
      contentPadding={6}
      xstyle={styles.fit}
      topNav={
        <XDSTopNav
          label="Main navigation"
          heading={
            <XDSTopNavHeading
              heading="App Shell"
              logo={
                <XDSNavIcon
                  icon={<CubeIcon style={{width: 16, height: 16}} />}
                />
              }
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
