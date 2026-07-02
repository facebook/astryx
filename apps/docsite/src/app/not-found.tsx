// Copyright (c) Meta Platforms, Inc. and affiliates.

import {AppShell} from '@astryxdesign/core/AppShell';
import {Center} from '@astryxdesign/core/Center';
import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {SharedTopNav} from '../components/SharedTopNav';
import {SiteFooter} from '../components/SiteFooter';
import {getCopyrightYear} from '../lib/copyrightYear';
import styles from './not-found.module.css';

export default async function NotFound() {
  const year = await getCopyrightYear();

  return (
    <AppShell variant="surface" height="fill" topNav={<SharedTopNav />}>
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
        <SiteFooter year={year} />
      </div>
    </AppShell>
  );
}
