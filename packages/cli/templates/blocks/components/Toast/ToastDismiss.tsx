'use client';

import {useRef} from 'react';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ToastDismiss() {
  const toast = useXDSToast();
  const dismissRef = useRef<(() => void) | null>(null);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Show a persistent toast, then dismiss it from code
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        <XDSButton
          label="Show persistent toast"
          variant="secondary"
          onClick={() => {
            dismissRef.current = toast({
              body: 'Uploading file\u2026',
              isAutoHide: false,
            });
          }}
        />
        <XDSButton
          label="Dismiss"
          variant="ghost"
          onClick={() => {
            dismissRef.current?.();
            dismissRef.current = null;
          }}
        />
      </XDSStack>
    </XDSStack>
  );
}
