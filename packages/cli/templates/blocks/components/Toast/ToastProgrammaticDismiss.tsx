'use client';

import {useRef} from 'react';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Stack';

export default function ToastProgrammaticDismiss() {
  const toast = useXDSToast();
  const dismissRef = useRef<(() => void) | null>(null);

  return (
    <XDSStack direction="horizontal" gap={2}>
      <XDSButton
        label="Show persistent toast"
        onClick={() => {
          dismissRef.current = toast({
            body: 'Uploading...',
            isAutoHide: false,
          });
        }}
      />
      <XDSButton
        label="Dismiss"
        variant="secondary"
        onClick={() => {
          dismissRef.current?.();
          dismissRef.current = null;
        }}
      />
    </XDSStack>
  );
}
