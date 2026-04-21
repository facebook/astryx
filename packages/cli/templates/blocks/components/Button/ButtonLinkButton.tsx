'use client';

import {XDSButton} from '@xds/core/Button';

export default function ButtonLinkButton() {
  return (
    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
      <XDSButton
        label="Visit Example"
        href="https://example.com"
        variant="primary"
      />
      <XDSButton
        label="Open in new tab"
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
        variant="secondary"
      />
      <XDSButton
        label="Ghost link"
        href="https://example.com"
        variant="ghost"
      />
    </div>
  );
}
