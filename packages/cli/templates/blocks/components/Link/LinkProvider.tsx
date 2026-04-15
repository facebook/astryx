'use client';

import {XDSLink, XDSLinkProvider} from '@xds/core/Link';

function CustomLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export default function LinkProvider() {
  return (
    <XDSLinkProvider component={CustomLink}>
      <XDSLink label="Home" href="/">
        Home
      </XDSLink>{' '}
      <XDSLink label="About" href="/about">
        About
      </XDSLink>
    </XDSLinkProvider>
  );
}
