// Copyright (c) Meta Platforms, Inc. and affiliates.

import {headers} from 'next/headers';
import {XDSAppShell} from '@xds/core/AppShell';
import {SharedTopNav} from '../../components/SharedTopNav';

export default async function CraftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const ua = headersList.get('user-agent') ?? '';
  const defaultIsMobile = /mobile|android|iphone|ipad/i.test(ua);

  return (
    <XDSAppShell
      variant="surface"
      height="auto"
      mobileNav={{defaultIsMobile}}
      topNav={<SharedTopNav />}>
      {children}
    </XDSAppShell>
  );
}
