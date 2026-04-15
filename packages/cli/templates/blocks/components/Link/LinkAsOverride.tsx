'use client';

import {XDSLink} from '@xds/core/Link';

function CustomRouterLink({
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

export default function LinkAsOverride() {
  return (
    <XDSLink label="Docs" href="/docs" as={CustomRouterLink}>
      Docs
    </XDSLink>
  );
}
