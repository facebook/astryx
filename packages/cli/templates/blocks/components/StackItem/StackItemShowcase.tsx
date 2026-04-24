'use client';

import {XDSHStack, XDSStackItem} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';

export default function StackItemShowcase() {
  return (
    <XDSHStack gap={3} vAlign="center">
      <XDSStackItem size="static">
        <XDSCard padding={2}>Logo</XDSCard>
      </XDSStackItem>
      <XDSStackItem size="fill">
        <XDSCard padding={2}>Content fills remaining space</XDSCard>
      </XDSStackItem>
      <XDSStackItem size="static">
        <XDSCard padding={2}>Actions</XDSCard>
      </XDSStackItem>
    </XDSHStack>
  );
}
