// Copyright (c) Meta Platforms, Inc. and affiliates.

import {headers} from 'next/headers';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Center} from '@astryxdesign/core/Center';
import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {SharedTopNav} from '../components/SharedTopNav';
import {SiteFooter} from '../components/SiteFooter';
import styles from './not-found.module.css';

export default async function NotFound() {
  const headersList = await headers();
  const ua = headersList.get('user-agent') ?? '';
  const defaultIsMobile = /mobile|android|iphone|ipad/i.test(ua);

  return (
    <AppShell
      variant="surface"
      height="fill"
      mobileNav={{defaultIsMobile}}
      topNav={<SharedTopNav />}>
      <div className={styles.shell}>
        <div className={styles.content}>
          <Center axis="both" height="100%">
            <VStack gap={2} hAlign="center">
              <Heading level={1} type="display-1">
                404
              </Heading>
              <Text type="body" color="secondary">
                This page could not be found.
              </Text>
            </VStack>
          </Center>
        </div>
        <SiteFooter />
      </div>
    </AppShell>
  );
}
