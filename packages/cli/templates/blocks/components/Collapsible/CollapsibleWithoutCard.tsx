'use client';

import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSDivider} from '@xds/core/Divider';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleWithoutCard() {
  return (
    <XDSVStack gap={3} style={{width: '100%', maxWidth: 400}}>
      <XDSCollapsible trigger="Deployment Details">
        <XDSText type="body">
          Last deployed on April 18, 2026 at 3:42 PM by Sarah Chen. Build
          duration was 2m 14s with zero warnings.
        </XDSText>
      </XDSCollapsible>
      <XDSDivider />
      <XDSCollapsible trigger="Environment Variables" defaultIsOpen={false}>
        <XDSText type="body">
          12 variables configured. Last updated March 30, 2026. All secrets are
          encrypted at rest with AES-256.
        </XDSText>
      </XDSCollapsible>
      <XDSDivider />
      <XDSCollapsible trigger="Build Logs" defaultIsOpen={false}>
        <XDSText type="body">
          Build completed successfully. 847 modules compiled, 0 errors, 0
          warnings. Bundle size: 142 KB gzipped.
        </XDSText>
      </XDSCollapsible>
    </XDSVStack>
  );
}
