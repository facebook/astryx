import type {Metadata} from 'next';

/**
 * XDS CSS Layer Model (dist path)
 *
 * Import order establishes CSS layer priority (lowest → highest):
 *   1. @xds/core/reset.css            → @layer reset  (reset styles)
 *   2. @xds/core/xds.css              → @layer xds-base   (component base styles)
 *   3. @xds/theme-default/theme.css   → @layer xds-theme  (default theme)
 *   4. @xds/theme-neutral/theme.css   → @layer xds-theme  (neutral theme)
 *   5. @xds/theme-brutalist/theme.css → @layer xds-theme  (brutalist theme)
 *
 * All theme CSS files are in @layer xds-theme and scoped via
 * @scope ([data-xds-theme="name"]), so only the active theme's rules apply.
 *
 * Product/consumer styles sit unlayered (outside layers) and naturally
 * win over all XDS layers without needing !important.
 */
import '@xds/core/reset.css';
import '@xds/core/xds.css';
import '@xds/theme-default/theme.css';
import '@xds/theme-neutral/theme.css';
import '@xds/theme-brutalist/theme.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'XDS Sandbox',
  description: 'XDS component testing sandbox',
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
