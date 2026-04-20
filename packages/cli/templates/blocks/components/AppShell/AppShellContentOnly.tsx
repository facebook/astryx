'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSText} from '@xds/core/Text';

export default function AppShellContentOnly() {
  return (
    <XDSAppShell contentPadding={6}>
      <XDSText type="large">Page Content</XDSText>
      <XDSText type="body">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </XDSText>
    </XDSAppShell>
  );
}
