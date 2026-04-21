'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const VARIANTS = [
  {variant: 'primary' as const, label: 'Primary'},
  {variant: 'secondary' as const, label: 'Secondary'},
  {variant: 'ghost' as const, label: 'Ghost'},
  {variant: 'destructive' as const, label: 'Destructive'},
];

export default function ButtonVariants() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          {VARIANTS.map(({variant, label}) => (
            <XDSButton key={variant} label={label} variant={variant} />
          ))}
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Disabled
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          {VARIANTS.map(({variant, label}) => (
            <XDSButton
              key={variant}
              label={label}
              variant={variant}
              isDisabled
            />
          ))}
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Loading
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          {VARIANTS.map(({variant, label}) => (
            <XDSButton
              key={variant}
              label={label}
              variant={variant}
              isLoading
            />
          ))}
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
