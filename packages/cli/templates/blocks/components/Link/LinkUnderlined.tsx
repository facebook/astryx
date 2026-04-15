'use client';

import {XDSLink} from '@xds/core/Link';

export default function LinkUnderlined() {
  return (
    <XDSLink label="Privacy Policy" href="/privacy" hasUnderline>
      Privacy Policy
    </XDSLink>
  );
}

export const showcase = {
  aspectRatio: 1,
  render: LinkUnderlined,
};
