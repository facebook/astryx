// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {AppShell} from '@xds/core/AppShell';
import {VStack} from '@xds/core/Stack';
import {Heading, Text} from '@xds/core/Text';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fit: {
    height: '100%',
    minHeight: 0,
  },
});

export default function AppShellContentOnly() {
  return (
    <AppShell contentPadding={6} xstyle={styles.fit}>
      <VStack gap={4}>
        <Heading level={3}>Page Content</Heading>
        <Text type="body">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </Text>
      </VStack>
    </AppShell>
  );
}
