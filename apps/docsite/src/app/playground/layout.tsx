// Copyright (c) Meta Platforms, Inc. and affiliates.

import {XDSAppShell} from '@xds/core/AppShell';
import {SharedTopNav} from '../../components/SharedTopNav';

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <XDSAppShell
      variant="surface"
      height="fill"
      contentPadding={0}
      topNav={<SharedTopNav />}>
      {children}
    </XDSAppShell>
  );
}
