import type {Metadata} from 'next';
import './globals.css';
import {Providers} from './providers';
import {DocsShell} from '../components/DocsShell';
import {components} from '../generated/componentRegistry';
import {packages} from '../generated/packageRegistry';
import {docTopics} from '../generated/docsRegistry';
import {templates} from '../generated/templateRegistry';

export const metadata: Metadata = {
  title: 'XDS — Design System',
  description:
    'Open-source design system for building internal tools and products.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <DocsShell
            components={components}
            packages={packages}
            docTopics={docTopics}
            templates={templates}>
            {children}
          </DocsShell>
        </Providers>
      </body>
    </html>
  );
}
