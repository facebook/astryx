// Copyright (c) Meta Platforms, Inc. and affiliates.

import {headers} from 'next/headers';
import {AppShell} from '@astryxdesign/core/AppShell';
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
    <AppShell
      variant="surface"
      height="auto"
      mobileNav={{defaultIsMobile}}
      topNav={<SharedTopNav />}>
      <div className={styles.shell}>
        <div className={styles.main}>{children}</div>
        <div className={styles.footer}>
          <SiteFooter />
        </div>
      </div>
    </AppShell>
  );
}
