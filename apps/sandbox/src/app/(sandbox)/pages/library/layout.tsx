import {XDSAppShell} from '@xds/core/AppShell';
import {SandboxNav} from '../../../SandboxNav';

export default function LibraryLayout({children}: {children: React.ReactNode}) {
  return (
    <XDSAppShell sideNav={<SandboxNav />} contentPadding={0}>
      {children}
    </XDSAppShell>
  );
}
