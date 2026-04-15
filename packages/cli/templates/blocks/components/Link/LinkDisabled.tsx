'use client';

import {XDSLink} from '@xds/core/Link';

export default function LinkDisabled() {
  return (
    <XDSLink label="Disabled" href="/disabled" isDisabled>
      Disabled Link
    </XDSLink>
  );
}
