// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import './globals.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'XDS — Design System',
  description:
    'Open-source design system for building internal tools and products.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Fustat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Manufacturing+Consent&family=Montserrat:wght@400;500;600;700&family=PT+Serif:wght@400;700&family=Playwrite+US+Trad:wght@100..400&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
