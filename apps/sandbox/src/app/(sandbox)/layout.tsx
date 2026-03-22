import {XDSAppShell} from '@xds/core/AppShell';
import {SandboxNav} from '../SandboxNav';

export default function SandboxLayout({children}: {children: React.ReactNode}) {
  return (
    <XDSAppShell
      sideNav={<SandboxNav />}
      contentPadding={4}>
      {children}
    </XDSAppShell>
  );
}
