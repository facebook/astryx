// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useAppShellMobile} from '@xds/core/AppShell';
import {Button} from '@xds/core/Button';
import {HStack, VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function AppShellMobileHookUsage() {
  const {
    closeMobileNav,
    isMobile,
    isMobileNavEnabled,
    isMobileNavOpen,
    openMobileNav,
  } = useAppShellMobile();

  if (!isMobileNavEnabled) {
    return (
      <VStack gap={2}>
        <Button label="Open navigation" variant="secondary" isDisabled />
        <Text type="body" color="secondary">
          No active AppShell mobile navigation context was detected. This hook
          returns safe defaults outside AppShell, or when the surrounding
          AppShell has mobile navigation disabled.
        </Text>
      </VStack>
    );
  }

  if (!isMobile) {
    return (
      <VStack gap={2}>
        <Button label="Open navigation" variant="secondary" isDisabled />
        <Text type="body" color="secondary">
          AppShell mobile navigation context is available. Narrow the viewport
          below the AppShell mobile breakpoint to make the custom trigger
          active.
        </Text>
      </VStack>
    );
  }

  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Button
          label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
          variant="secondary"
          onClick={isMobileNavOpen ? closeMobileNav : openMobileNav}
        />
        <Text type="body" color="secondary">
          {isMobileNavOpen ? 'Mobile nav is open' : 'Mobile nav is closed'}
        </Text>
      </HStack>
      <Text type="body" color="secondary">
        This button controls the nearest AppShell mobile nav from context; in
        the docsite it opens and closes the surrounding page navigation.
      </Text>
    </VStack>
  );
}
