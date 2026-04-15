'use client';

import {XDSHStack, XDSStackItem} from '@xds/core/Layout';

export default function StackOverrideAlignmentPerItem() {
  return (
    <XDSHStack vAlign="start">
      <XDSStackItem crossAlignSelf="center">Centered</XDSStackItem>
      <XDSStackItem>Top-aligned</XDSStackItem>
    </XDSHStack>
  );
}
