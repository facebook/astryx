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

// Runs before first paint (in <head>, before <body> renders) so the correct
// theme attributes are on <html> for the very first paint — eliminating the
// flash of light theme when the OS prefers dark. It mirrors what the root
// <XDSTheme> sync does post-hydration:
//   - data-xds-theme="astryx" so @scope'd theme CSS applies immediately
//   - data-theme="dark" when the OS prefers dark (Providers also defaults to
//     the OS preference, so the two stay in sync; once the user manually
//     toggles, Providers' client sync takes over).
// Inlined as a string so it ships in the initial HTML and executes
// synchronously. suppressHydrationWarning on <html> covers the attribute the
// client may flip after a manual toggle.
const THEME_INIT_SCRIPT = `(function(){try{var e=document.documentElement;e.setAttribute('data-xds-theme','astryx');if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){e.setAttribute('data-theme','dark')}else{e.setAttribute('data-theme','light')}}catch(_){}})();`;

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" data-xds-theme="astryx" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: THEME_INIT_SCRIPT}} />
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
