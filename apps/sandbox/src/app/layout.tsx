import type {Metadata} from 'next';
import {XDSTheme, defaultTheme} from '@xds/core/theme';
import {Sidebar} from './Sidebar';

export const metadata: Metadata = {
  title: 'XDS Sandbox',
  description: 'XDS component exploration and testing sandbox',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body style={{margin: 0}}>
        <XDSTheme theme={defaultTheme}>
          <div
            style={{
              display: 'flex',
              minHeight: '100vh',
            }}>
            <Sidebar />
            <main style={{flex: 1, padding: 24, overflow: 'auto'}}>
              {children}
            </main>
          </div>
        </XDSTheme>
      </body>
    </html>
  );
}
