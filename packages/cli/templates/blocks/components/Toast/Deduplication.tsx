'use client';

import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Stack';

export default function Deduplication() {
  const toast = useXDSToast();
  return (
    <XDSStack direction="row" gap={2}>
      <XDSButton
        label="Offline (ignore)"
        onClick={() =>
          toast({
            body: 'You are offline',
            uniqueID: 'offline',
            collisionBehavior: 'ignore',
            isAutoHide: false,
          })
        }
      />
      <XDSButton
        label="Progress (overwrite)"
        variant="secondary"
        onClick={() =>
          toast({
            body: `Uploading... ${Math.floor(Math.random() * 100)}%`,
            uniqueID: 'upload-progress',
            collisionBehavior: 'overwrite',
            isAutoHide: false,
          })
        }
      />
    </XDSStack>
  );
}
