import type {Metadata} from 'next';
import '@xds/core/reset.css';
import '@xds/core/typography.css';
import './globals.css';
import {Providers} from './providers';
import {Sidebar} from './Sidebar';

export const metadata: Metadata = {
  title: 'XDS Sandbox',
  description: 'XDS component testing sandbox',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div
            style={{
              display: 'flex',
              minHeight: '100vh',
              backgroundColor: 'var(--color-wash)',
            }}>
            <Sidebar />
            <main style={{flex: 1, padding: '2rem'}}>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
