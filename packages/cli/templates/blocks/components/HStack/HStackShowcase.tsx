'use client';

import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSBadge} from '@xds/core/Badge';
import {XDSText} from '@xds/core/Text';

export default function HStackShowcase() {
  return (
    <XDSVStack gap={6} width="100%" style={{maxWidth: 400}}>
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">
          HAlign: start
        </XDSText>
        <XDSHStack gap={2}>
          <XDSBadge label="React" />
          <XDSBadge label="TypeScript" />
          <XDSBadge label="Node.js" />
        </XDSHStack>
      </XDSVStack>
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">
          HAlign: center
        </XDSText>
        <XDSHStack gap={4} hAlign="center">
          <XDSBadge label="Design" />
          <XDSBadge label="Engineering" />
          <XDSBadge label="Product" />
        </XDSHStack>
      </XDSVStack>
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">
          HAlign: between
        </XDSText>
        <XDSHStack gap={2} hAlign="between">
          <XDSBadge label="Start" />
          <XDSBadge label="Middle" />
          <XDSBadge label="End" />
        </XDSHStack>
      </XDSVStack>
    </XDSVStack>
  );
}
