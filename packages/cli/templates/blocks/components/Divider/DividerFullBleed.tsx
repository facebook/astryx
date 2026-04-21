'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerFullBleed() {
  return (
    <XDSVStack gap={3}>
      <XDSText type="label">Order Summary</XDSText>
      <XDSHStack hAlign="space-between">
        <XDSText type="body">3 items</XDSText>
        <XDSText type="body">$127.00</XDSText>
      </XDSHStack>
      <XDSDivider />
      <XDSHStack hAlign="space-between">
        <XDSText type="body">Shipping</XDSText>
        <XDSText type="body">$7.99</XDSText>
      </XDSHStack>
      <XDSHStack hAlign="space-between">
        <XDSText type="body">Tax</XDSText>
        <XDSText type="body">$10.16</XDSText>
      </XDSHStack>
      <XDSDivider />
      <XDSHStack hAlign="space-between">
        <XDSText type="bodyBold">Total</XDSText>
        <XDSText type="bodyBold">$145.15</XDSText>
      </XDSHStack>
    </XDSVStack>
  );
}
