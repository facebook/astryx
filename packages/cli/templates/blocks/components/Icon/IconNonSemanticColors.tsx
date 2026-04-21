'use client';

import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const colors = [
  'blue',
  'red',
  'green',
  'gray',
  'cyan',
  'teal',
  'yellow',
  'orange',
  'pink',
  'purple',
] as const;

export default function IconNonSemanticColors() {
  return (
    <XDSHStack gap={4} wrap="wrap">
      {colors.map((color) => (
        <XDSVStack key={color} gap={1} hAlign="center">
          <XDSIcon icon="search" color={color} />
          <XDSText type="supporting">{color}</XDSText>
        </XDSVStack>
      ))}
    </XDSHStack>
  );
}
