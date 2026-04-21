'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ButtonLinkButton() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Buttons that render as anchor elements
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        <XDSButton
          label="Visit site"
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
          label="Documentation"
          href="https://example.com"
          variant="ghost"
        />
      </XDSStack>
    </XDSStack>
  );
}
