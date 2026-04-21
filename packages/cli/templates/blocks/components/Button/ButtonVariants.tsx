'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const VARIANTS = [
  {variant: 'primary' as const, label: 'Save changes'},
  {variant: 'secondary' as const, label: 'Cancel'},
  {variant: 'ghost' as const, label: 'Learn more'},
  {variant: 'destructive' as const, label: 'Delete account'},
];

export default function ButtonVariants() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        {VARIANTS.map(({variant, label}) => (
          <XDSButton key={variant} label={label} variant={variant} />
        ))}
      </XDSStack>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        {VARIANTS.map(({variant, label}) => (
          <XDSButton key={variant} label={label} variant={variant} isDisabled />
        ))}
      </XDSStack>
    </XDSStack>
  );
}
