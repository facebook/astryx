import type {Metadata} from 'next';
import './globals.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'XDS Example — Next.js + Tailwind (Dist)',
  description:
    'Reference example consuming @xds/core pre-built dist with Tailwind for custom styles',
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
