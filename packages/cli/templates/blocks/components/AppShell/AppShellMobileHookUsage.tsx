// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useXDSAppShellMobile} from '@xds/core/AppShell';
import {XDSButton} from '@xds/core/Button';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function AppShellMobileHookUsage() {
  const {
    closeMobileNav,
    isMobile,
    isMobileNavEnabled,
    isMobileNavOpen,
    openMobileNav,
  } = useXDSAppShellMobile();

  if (!isMobileNavEnabled) {
    return (
      <XDSVStack gap={2}>
        <XDSButton label="Open navigation" variant="secondary" isDisabled />
        <XDSText type="body" color="secondary">
          No active AppShell mobile navigation context was detected. This hook
          returns safe defaults outside AppShell, or when the surrounding
          AppShell has mobile navigation disabled.
        </XDSText>
      </XDSVStack>
    );
  }

  if (!isMobile) {
    return (
      <XDSVStack gap={2}>
        <XDSButton label="Open navigation" variant="secondary" isDisabled />
        <XDSText type="body" color="secondary">
          AppShell mobile navigation context is available. Narrow the viewport
          below the AppShell mobile breakpoint to make the custom trigger active.
        </XDSText>
      </XDSVStack>
    );
  }

  return (
    <XDSVStack gap={2}>
      <XDSHStack gap={2} vAlign="center">
        <XDSButton
          label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
          variant="secondary"
          onClick={isMobileNavOpen ? closeMobileNav : openMobileNav}
        />
        <XDSText type="body" color="secondary">
          {isMobileNavOpen ? 'Mobile nav is open' : 'Mobile nav is closed'}
        </XDSText>
      </XDSHStack>
      <XDSText type="body" color="secondary">
        This button controls the nearest AppShell mobile nav from context — in
        the docsite it opens and closes the surrounding page navigation.
      </XDSText>
    </XDSVStack>
  );
}
