// Copyright (c) Meta Platforms, Inc. and affiliates.

import {headers} from 'next/headers';
import {XDSAppShell} from '@xds/core/AppShell';
import {SharedTopNav} from '../../components/SharedTopNav';
import {SiteFooter} from '../../components/SiteFooter';
import styles from './layout.module.css';

export default async function MarketingLayout({
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
      <div className={styles.shell}>
        <div className={styles.main}>{children}</div>
        <SiteFooter />
      </div>
    </XDSAppShell>
  );
}
