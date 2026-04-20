'use client';

import {XDSLink} from '@xds/core/Link';

export default function LinksWithTooltips() {
  return (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSLink
        label="Settings"
        href="/settings"
        tooltip="Configure your account settings"
        isStandalone>
        Settings
      </XDSLink>
      <XDSLink
        label="Profile"
        href="/profile"
        tooltip="View and edit your profile"
        isStandalone>
        Profile
      </XDSLink>
      <XDSLink
        label="Help"
        href="/help"
        tooltip="Get help and support"
        color="secondary"
        isStandalone>
        Help
      </XDSLink>
    </div>
  );
}
