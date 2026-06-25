// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import './globals.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'Astryx Sandbox',
  description: 'Astryx component testing sandbox',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Fustat:wght@400;500;600;700&family=Manufacturing+Consent&family=Outfit:wght@400;500;600;700&family=Sarina&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        />
        {/* Prevent PreviewShell toolbar flash when loaded inside an iframe.
            Runs before paint so the toolbar is never visible in embed contexts. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(window.self!==window.top)document.documentElement.classList.add('astryx-embed')}catch(e){document.documentElement.classList.add('astryx-embed')}`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html.astryx-embed [data-preview-shell]{display:none!important}`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
