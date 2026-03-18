import type {Metadata} from 'next';
import '@xds/core/reset.css';
import '@xds/theme-default/theme.css';
import './globals.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'XDS Example — Next.js',
  description:
    'Reference example for consuming @xds/core as a source distribution',
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
