'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerFullBleed() {
  return (
    <XDSSection variant="wash">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="label">Order Summary</XDSText>
          <XDSText type="body">3 items · Subtotal: $127.00</XDSText>
          <XDSDivider isFullBleed />
          <XDSText type="label">Shipping</XDSText>
          <XDSText type="body">
            Standard delivery — estimated Apr 25, 2026
          </XDSText>
          <XDSDivider isFullBleed />
          <XDSText type="bodyBold">Total: $134.99</XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  );
}
