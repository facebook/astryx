'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ButtonLoading() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Loading state across all variants
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        <XDSButton label="Saving..." variant="primary" isLoading />
        <XDSButton label="Uploading..." variant="secondary" isLoading />
        <XDSButton label="Loading..." variant="ghost" isLoading />
        <XDSButton label="Deleting..." variant="destructive" isLoading />
      </XDSStack>
    </XDSStack>
  );
}
