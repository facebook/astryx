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

// Public origin for the docsite. Set NEXT_PUBLIC_SITE_URL in other
// environments (e.g. preview deploys); defaults to the production domain so
// metadataBase resolves relative OG/Twitter image paths to absolute URLs —
// social scrapers (Facebook, X, LinkedIn, Slack, iMessage) require absolute
// image URLs or the card image is dropped.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://astryx.atmeta.com';

const SITE_NAME = 'Astryx';
const SITE_TITLE = 'Astryx Design System';
const SITE_DESCRIPTION =
  'An open source design system that is fully customizable and agent ready.';

// Default social card image: the launch banner that the announcement blog post
// uses for its cover. Reusing the same branded banner keeps the shared-link
// preview consistent with the launch creative across the site and the post.
const OG_IMAGE = '/blog-post-01.png';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    // Per-page `title` values render as "<page> · Astryx".
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 675,
        alt: 'Astryx — an open source design system by Meta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    // Server-render data-astryx-theme so the Astryx theme's @scope'd tokens (body
    // color, top spacing) apply on the first paint. Deliberately no data-theme:
    // reset.css then keeps `color-scheme: light dark`, so the light-dark()
    // tokens follow the OS preference with no script and no flash (#2713).
    <html lang="en" data-astryx-theme="astryx">
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
