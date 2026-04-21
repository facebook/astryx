'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSText} from '@xds/core/Text';

export default function AppShellShowcase() {
  return (
    <XDSAppShell contentPadding={6}>
      <XDSText type="large">Page Content</XDSText>
    </XDSAppShell>
  );
}
