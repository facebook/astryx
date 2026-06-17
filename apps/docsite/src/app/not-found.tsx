// Copyright (c) Meta Platforms, Inc. and affiliates.

import {headers} from 'next/headers';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSCenter} from '@xds/core/Center';
import {XDSVStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {SharedTopNav} from '../components/SharedTopNav';
import {SiteFooter} from '../components/SiteFooter';
import styles from './not-found.module.css';

// This is the global App Router not-found boundary. It is rendered inside the
// root layout (app/layout.tsx) only — the (site) route-group layout that
// normally provides <SharedTopNav /> and <SiteFooter /> does NOT wrap it. So
// we reconstruct the same shell here to keep the 404 on-brand, with the
// message centered in the space between the header and footer.
export default async function NotFound() {
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
        <div className={styles.main}>
          <XDSCenter axis="both" height="100%">
            <XDSVStack gap={2} hAlign="center">
              <XDSHeading level={1} type="display-1">
                404
              </XDSHeading>
              <XDSText type="large" color="secondary">
                This page could not be found.
              </XDSText>
            </XDSVStack>
          </XDSCenter>
        </div>
        <SiteFooter />
      </div>
    </XDSAppShell>
  );
}
