// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import {Analytics} from '@vercel/analytics/react';
import './globals.css';
import {Providers} from './providers';

// Note: the Astryx theme (src/themes/astryxTheme.ts) is Figtree-first.
// We can't use next/font/google here (it requires SWC, but this app pins
// a custom babel.config.js for StyleX — they're mutually exclusive per
// https://nextjs.org/docs/messages/babel-font-loader-conflict). Figtree
// loads via the shared Google Fonts <link> in <head> below, which is the
// "Good" path from the theming wiki §Font Declarations.

export const metadata: Metadata = {
  title: 'Astryx Design System',
  description:
    'An open source design system that is fully customizable and agent ready.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    // Server-render data-xds-theme so the Astryx theme's @scope'd tokens (body
    // color, top spacing) apply on the first paint. Deliberately no data-theme:
    // reset.css then keeps `color-scheme: light dark`, so the light-dark()
    // tokens follow the OS preference with no script and no flash (#2713).
    <html lang="en" data-xds-theme="astryx">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:wght@400;500;600;700&family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Fustat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Manufacturing+Consent&family=Montserrat:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=PT+Serif:wght@400;700&family=Playwrite+US+Trad:wght@100..400&family=Poppins:wght@400;500;600;700&family=Sarina&family=UnifrakturMaguntia&display=swap"
        />
      </head>
      <body>
        <Analytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
