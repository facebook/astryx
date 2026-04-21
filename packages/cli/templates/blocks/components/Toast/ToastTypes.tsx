'use client';

import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Stack';

export default function ToastTypes() {
  const toast = useXDSToast();
  return (
    <XDSStack direction="horizontal" gap={2}>
      <XDSButton
        label="Info"
        variant="secondary"
        onClick={() =>
          toast({body: 'This is an info notification.', type: 'info'})
        }
      />
      <XDSButton
        label="Error"
        variant="destructive"
        onClick={() =>
          toast({body: 'This is an error notification.', type: 'error'})
        }
      />
    </XDSStack>
  );
}
