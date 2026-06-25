// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: blog layout
 * Standalone shell with the shared top nav and NO sidebar (issue #2896:
 * "Avoid traditional blog sidebars"). Mirrors the craft/playground layout.
 */

import {headers} from 'next/headers';
import {AppShell} from '@astryxdesign/core/AppShell';
import {SharedTopNav} from '../../components/SharedTopNav';
import {SiteFooter} from '../../components/SiteFooter';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const ua = headersList.get('user-agent') ?? '';
  const defaultIsMobile = /mobile|android|iphone|ipad/i.test(ua);

  return (
    <AppShell
      variant="surface"
      height="auto"
      mobileNav={{defaultIsMobile}}
      topNav={<SharedTopNav />}>
      {children}
      <SiteFooter />
    </AppShell>
  );
}
