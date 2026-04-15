'use client';

import {XDSLink} from '@xds/core/Link';

export default function LinkStandalone() {
  return (
    <XDSLink label="Settings" href="/settings" isStandalone>
      Settings
    </XDSLink>
  );
}

export const showcase = {
  aspectRatio: 1,
  render: LinkStandalone,
};
