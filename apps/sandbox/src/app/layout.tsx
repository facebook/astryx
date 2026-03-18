import type {Metadata} from 'next';
import '@xds/core/reset.css';
import '@xds/core/xds.css';
import '@xds/theme-default/theme.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'XDS Sandbox',
  description: 'XDS component testing sandbox',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
