import type {Metadata} from 'next';
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme/default';

export const metadata: Metadata = {
  title: 'XDS Sandbox',
  description: 'XDS component testing sandbox',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <XDSTheme theme={defaultTheme}>{children}</XDSTheme>
      </body>
    </html>
  );
}
