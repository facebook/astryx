// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import './globals.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'Astryx Example — Next.js (Precompiled)',
  description:
    'Reference migration from Astryx source compilation to precompiled CSS',
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
