'use client';

import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSBadge} from '@xds/core/Badge';
import {XDSText} from '@xds/core/Text';

export default function VStackShowcase() {
  return (
    <XDSHStack gap={10} hAlign="center">
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">gap=2</XDSText>
        <XDSVStack gap={2}>
          <XDSBadge label="Step 1" />
          <XDSBadge label="Step 2" />
          <XDSBadge label="Step 3" />
        </XDSVStack>
      </XDSVStack>
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">gap=4</XDSText>
        <XDSVStack gap={4}>
          <XDSBadge label="Step 1" />
          <XDSBadge label="Step 2" />
          <XDSBadge label="Step 3" />
        </XDSVStack>
      </XDSVStack>
      <XDSVStack gap={2}>
        <XDSText type="supporting" color="secondary">gap=6</XDSText>
        <XDSVStack gap={6}>
          <XDSBadge label="Step 1" />
          <XDSBadge label="Step 2" />
          <XDSBadge label="Step 3" />
        </XDSVStack>
      </XDSVStack>
    </XDSHStack>
  );
}
