'use client';

import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function IconSizes() {
  return (
    <XDSHStack gap={4}>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="search" size="xsm" />
        <XDSText type="supporting">xsm</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="search" size="sm" />
        <XDSText type="supporting">sm</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="search" size="md" />
        <XDSText type="supporting">md</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="search" size="lg" />
        <XDSText type="supporting">lg</XDSText>
      </XDSVStack>
    </XDSHStack>
  );
}
