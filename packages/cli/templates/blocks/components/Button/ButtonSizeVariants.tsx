'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const SIZES = [
  {size: 'sm' as const, label: 'Small'},
  {size: 'md' as const, label: 'Medium'},
  {size: 'lg' as const, label: 'Large'},
];

export default function ButtonSizeVariants() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Primary
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          {SIZES.map(({size, label}) => (
            <XDSButton key={size} label={label} variant="primary" size={size} />
          ))}
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Secondary
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          {SIZES.map(({size, label}) => (
            <XDSButton
              key={size}
              label={label}
              variant="secondary"
              size={size}
            />
          ))}
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
