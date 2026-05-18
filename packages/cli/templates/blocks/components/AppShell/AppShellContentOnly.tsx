// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHeading, XDSText} from '@xds/core/Text';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fit: {
    height: '100%',
    minHeight: 0,
  },
});

export default function AppShellContentOnly() {
  return (
    <XDSAppShell contentPadding={6} xstyle={styles.fit}>
      <XDSVStack gap={4}>
        <XDSHeading level={3}>Page Content</XDSHeading>
        <XDSText type="body">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </XDSText>
      </XDSVStack>
    </XDSAppShell>
  );
}
