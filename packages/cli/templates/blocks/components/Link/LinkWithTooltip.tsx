'use client';

import {XDSLink} from '@xds/core/Link';

export default function LinkWithTooltip() {
  return (
    <XDSLink
      label="Settings"
      href="/settings"
      tooltip="Configure your preferences">
      Settings
    </XDSLink>
  );
}

export const showcase = {
  aspectRatio: 1,
  render: LinkWithTooltip,
};
