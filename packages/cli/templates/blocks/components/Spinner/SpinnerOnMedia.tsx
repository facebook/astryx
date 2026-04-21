'use client';

import {XDSSpinner} from '@xds/core/Spinner';
import {XDSHStack} from '@xds/core/Layout';

export default function SpinnerOnMedia() {
  return (
    <XDSHStack gap={4} vAlign="center">
      <XDSSpinner shade="default" />
      <div
        style={{
          backgroundColor: '#1a1a2e',
          padding: 16,
          borderRadius: 8,
        }}>
        <XDSSpinner shade="onMedia" />
      </div>
    </XDSHStack>
  );
}
