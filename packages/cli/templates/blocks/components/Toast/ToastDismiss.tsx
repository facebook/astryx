// In production, use useXDSToast() hook for proper positioning, stacking, and lifecycle.
'use client';

import {useRef} from 'react';
import {XDSToast} from '@xds/core/Toast';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';

export default function ToastDismiss() {
  const toast = useXDSToast();
  const dismissRef = useRef<(() => void) | null>(null);

  return (
    <XDSVStack gap={3}>
      <XDSToast
        type="info"
        body="Uploading file…"
        isAutoHide={false}
        autoHideDuration={5000}
        isExiting={false}
        onDismiss={() => {}}
      />
      <XDSHStack gap={3} vAlign="center">
        <XDSButton
          label="Show toast"
          variant="secondary"
          size="sm"
          onClick={() => {
            dismissRef.current = toast({
              body: 'Uploading file…',
              isAutoHide: false,
            });
          }}
        />
        <XDSButton
          label="Dismiss via code"
          variant="ghost"
          size="sm"
          onClick={() => {
            dismissRef.current?.();
            dismissRef.current = null;
          }}
        />
      </XDSHStack>
    </XDSVStack>
  );
}
