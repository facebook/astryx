// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import './globals.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'XDS Example — Next.js (Source)',
  description: 'Reference example compiling @xds/core from source with StyleX',
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
