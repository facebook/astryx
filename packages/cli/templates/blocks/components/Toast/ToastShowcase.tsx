// In production, use useXDSToast() hook for proper positioning, stacking, and lifecycle.
'use client';

import {XDSToast} from '@xds/core/Toast';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';

export default function ToastShowcase() {
  const toast = useXDSToast();
  return (
    <XDSToast
      type="info"
      body="Document saved successfully"
      endContent={
        <XDSButton
          label="Show toast"
          variant="ghost"
          size="sm"
          onClick={() => toast({body: 'Document saved successfully'})}
        />
      }
      isAutoHide={false}
      autoHideDuration={5000}
      isExiting={false}
      onDismiss={() => {}}
    />
  );
}
