// In production, use useXDSToast() hook for proper positioning, stacking, and lifecycle.
'use client';

import {XDSToast} from '@xds/core/Toast';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';

export default function ToastDeduplication() {
  const toast = useXDSToast();

  return (
    <XDSVStack gap={3}>
      <XDSToast
        type="info"
        body="You are offline"
        isAutoHide={false}
        autoHideDuration={5000}
        isExiting={false}
        onDismiss={() => {}}
      />
      <XDSHStack gap={3} vAlign="center">
        <XDSButton
          label="Offline (ignore)"
          variant="secondary"
          size="sm"
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
          size="sm"
          onClick={() =>
            toast({
              body: `Uploading… ${Math.floor(Math.random() * 100)}%`,
              uniqueID: 'upload-progress',
              collisionBehavior: 'overwrite',
              isAutoHide: false,
            })
          }
        />
      </XDSHStack>
    </XDSVStack>
  );
}
