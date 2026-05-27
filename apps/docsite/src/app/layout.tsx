// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import './globals.css';
import {Providers} from './providers';

// Note: @xds/theme-astryx is Figtree-first. We can't use next/font/google
// here (it requires SWC, but this app pins a custom babel.config.js for
// StyleX — they're mutually exclusive per
// https://nextjs.org/docs/messages/babel-font-loader-conflict). Figtree
// loads via the shared Google Fonts <link> in <head> below, which is the
// "Good" path from the theming wiki §Font Declarations.

export const metadata: Metadata = {
  title: 'XDS — Design System',
  description:
    'Open-source design system for building internal tools and products.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        {/* Disable browser scroll restoration synchronously, before any
            hydration runs. This guarantees the page never starts at a
            previously-restored scroll position on hard refresh. The
            Providers component also resets scroll on mount as a
            belt-and-suspenders fallback.

            We also register a `load` listener that forces scroll back to
            (0, 0) — the browser performs its (default-auto) scroll
            restoration around the load event, which can outrun the
            `scrollRestoration='manual'` setting on some browsers. */}
        {/* Force every page load to land at scroll-top. Three layers:
              1. `scrollRestoration = 'manual'` opts out of the browser's
                 default scroll-position restoration.
              2. DOMContentLoaded + load listeners reset scroll to (0, 0).
              3. A requestAnimationFrame loop keeps re-resetting for 2s
                 after `load`, because something on this app (likely a
                 focus-into-view side effect from a hydrating subtree)
                 nudges scroll back to ~92px shortly after first paint.
                 The rAF loop wins that race.
              All three live in a synchronous inline <script> so they run
              before any client-side React code. */}
        <script
          dangerouslySetInnerHTML={{
            __html: [
              "if('scrollRestoration' in history){history.scrollRestoration='manual';}",
              "addEventListener('DOMContentLoaded',function(){scrollTo(0,0);});",
              "addEventListener('load',function(){scrollTo(0,0);});",
              "addEventListener('load',function(){var start=performance.now();function tick(){if(window.scrollY>0){window.scrollTo(0,0);}if(performance.now()-start<2000){requestAnimationFrame(tick);}}tick();});",
            ].join(''),
          }}
        />
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
