import {XDSAppShell} from '@xds/core/AppShell';
import {SandboxNav} from '../SandboxNav';

export default function LibraryLayout({children}: {children: React.ReactNode}) {
  // contentPadding={0} so the library page can manage its own full-width header
  return (
    <XDSAppShell sideNav={<SandboxNav />} contentPadding={0}>
      {children}
    </XDSAppShell>
  );
}
