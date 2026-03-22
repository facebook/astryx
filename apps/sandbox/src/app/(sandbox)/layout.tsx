import {XDSAppShell} from '@xds/core/AppShell';
import {SandboxTopNav} from '../SandboxTopNav';
import {SandboxNav} from '../SandboxNav';

export default function SandboxLayout({children}: {children: React.ReactNode}) {
  return (
    <XDSAppShell
      topNav={<SandboxTopNav />}
      sideNav={<SandboxNav />}
      contentPadding={4}>
      {children}
    </XDSAppShell>
  );
}
