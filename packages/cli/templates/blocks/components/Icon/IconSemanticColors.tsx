'use client';

import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function IconSemanticColors() {
  return (
    <XDSHStack gap={4} wrap="wrap">
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="search" color="primary" />
        <XDSText type="supporting">primary</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="menu" color="secondary" />
        <XDSText type="supporting">secondary</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="info" color="tertiary" />
        <XDSText type="supporting">tertiary</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="clock" color="disabled" />
        <XDSText type="supporting">disabled</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="calendar" color="accent" />
        <XDSText type="supporting">accent</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="success" color="positive" />
        <XDSText type="supporting">positive</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="error" color="negative" />
        <XDSText type="supporting">negative</XDSText>
      </XDSVStack>
      <XDSVStack gap={1} hAlign="center">
        <XDSIcon icon="warning" color="warning" />
        <XDSText type="supporting">warning</XDSText>
      </XDSVStack>
    </XDSHStack>
  );
}
