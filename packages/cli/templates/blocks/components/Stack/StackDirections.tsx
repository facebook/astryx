'use client';

import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSToken} from '@xds/core/Token';

export default function StackDirections() {
  return (
    <XDSHStack gap={10} hAlign="center">
      <XDSHStack gap={2} vAlign="center">
        <XDSToken label="Horizontal" />
        <XDSToken label="Horizontal" />
        <XDSToken label="Horizontal" />
      </XDSHStack>
      <XDSVStack gap={2}>
        <XDSToken label="Vertical" />
        <XDSToken label="Vertical" />
        <XDSToken label="Vertical" />
      </XDSVStack>
    </XDSHStack>
  );
}
