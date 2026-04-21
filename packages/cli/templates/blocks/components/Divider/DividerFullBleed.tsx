'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerFullBleed() {
  return (
    <XDSVStack gap={3} hAlign="stretch">
      <XDSText type="label">Order Summary</XDSText>
      <XDSHStack hAlign="between">
        <XDSText type="body">3 items</XDSText>
        <XDSText type="body">$127.00</XDSText>
      </XDSHStack>
      <XDSDivider />
      <XDSHStack hAlign="between">
        <XDSText type="body">Shipping</XDSText>
        <XDSText type="body">$7.99</XDSText>
      </XDSHStack>
      <XDSHStack hAlign="between">
        <XDSText type="body">Tax</XDSText>
        <XDSText type="body">$10.16</XDSText>
      </XDSHStack>
      <XDSDivider />
      <XDSHStack hAlign="between">
<XDSText type="body" weight="bold">Total</XDSText>
            <XDSText type="body" weight="bold">$145.15</XDSText>
      </XDSHStack>
    </XDSVStack>
  );
}
