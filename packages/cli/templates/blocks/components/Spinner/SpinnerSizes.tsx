'use client';

import {XDSSpinner} from '@xds/core/Spinner';
import {XDSHStack} from '@xds/core/Layout';

export default function SpinnerSizes() {
  return (
    <XDSHStack gap={4} vAlign="center">
      <XDSSpinner size="sm" />
      <XDSSpinner size="md" />
      <XDSSpinner size="lg" />
      <XDSSpinner size="xl" />
    </XDSHStack>
  );
}
