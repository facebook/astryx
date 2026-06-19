// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Collapsible} from '@xds/core/Collapsible';
import {Divider} from '@xds/core/Divider';
import {Text} from '@xds/core/Text';
import {VStack} from '@xds/core/Layout';

export default function CollapsibleWithoutCard() {
  return (
    <VStack gap={3} style={{width: '100%', maxWidth: 400}}>
      <Collapsible trigger="Deployment Details">
        <Text type="body">
          Last deployed on April 18, 2026 at 3:42 PM by Sarah Chen. Build
          duration was 2m 14s with zero warnings.
        </Text>
      </Collapsible>
      <Divider />
      <Collapsible trigger="Environment Variables" defaultIsOpen={false}>
        <Text type="body">
          12 variables configured. Last updated March 30, 2026. All secrets are
          encrypted at rest with AES-256.
        </Text>
      </Collapsible>
      <Divider />
      <Collapsible trigger="Build Logs" defaultIsOpen={false}>
        <Text type="body">
          Build completed successfully. 847 modules compiled, 0 errors, 0
          warnings. Bundle size: 142 KB gzipped.
        </Text>
      </Collapsible>
    </VStack>
  );
}
