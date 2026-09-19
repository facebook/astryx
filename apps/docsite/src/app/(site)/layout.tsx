// Copyright (c) Meta Platforms, Inc. and affiliates.

import {AppShell} from '@astryxdesign/core/AppShell';
import {SharedTopNav} from '../../components/SharedTopNav';
import {CanaryBanner} from '../../components/CanaryBanner';
import {CURRENT_TARGET} from '../../lib/docsVersions';
import {SiteFooter} from '../../components/SiteFooter';
import {getCopyrightYear} from '../../lib/copyrightYear';
import styles from './layout.module.css';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = await getCopyrightYear();

  return (
    <AppShell
      variant="surface"
      height="auto"
      mobileNav={false}
      banner={CURRENT_TARGET === 'canary' ? <CanaryBanner /> : undefined}
      topNav={<SharedTopNav />}>
      <div className={styles.shell}>
        <div className={styles.main}>{children}</div>
        <div className={styles.footer}>
          <SiteFooter year={year} />
        </div>
      </div>
    </AppShell>
  );
}
