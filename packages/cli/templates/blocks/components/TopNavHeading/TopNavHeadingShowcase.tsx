'use client';

import {XDSTopNav, XDSTopNavHeading} from '@xds/core/TopNav';
import {XDSVStack} from '@xds/core/Layout';

function LogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V15m0 0l-2.25-1.313" />
    </svg>
  );
}

export default function TopNavHeadingShowcase() {
  return (
    <XDSVStack gap={4}>
      <XDSTopNav
        label="Plain heading example"
        heading={
          <XDSTopNavHeading
            heading="Acme Platform"
            logo={<LogoIcon />}
          />
        }
      />
      <XDSTopNav
        label="Linked heading example"
        heading={
          <XDSTopNavHeading
            heading="Acme Platform"
            logo={<LogoIcon />}
            href="/"
          />
        }
      />
    </XDSVStack>
  );
}
