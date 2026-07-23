// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
// Turbopack only reliably emits a <link> for CSS reached through the JS module
// graph. A bare `@import '@astryxdesign/core/astryx.css'` from a CSS file is
// compiled into a chunk but never linked onto the route, so components render
// unstyled. Importing the stylesheets as JS side-effects here is the supported
// path on Next.js + Turbopack. Order matters: reset -> component atoms -> theme.
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import './globals.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'Astryx Example — Next.js + Turbopack (Dist)',
  description:
    'Reference example consuming @astryxdesign/core on Next.js 16 with Turbopack',
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
