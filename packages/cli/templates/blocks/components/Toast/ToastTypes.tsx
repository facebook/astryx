// Copyright (c) Meta Platforms, Inc. and affiliates.

// In production, use useXDSToast() hook for proper positioning, stacking, and lifecycle.
'use client';

import {XDSToast} from '@xds/core/Toast';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

export default function ToastTypes() {
  const toast = useXDSToast();

  return (
    <XDSVStack gap={3}>
      <XDSToast
        type="info"
        body="Changes saved successfully."
        endContent={
          <XDSButton
            label="Show toast"
            variant="ghost"
            size="sm"
            onClick={() =>
              toast({body: 'Changes saved successfully.', type: 'info'})
            }
          />
        }
        isAutoHide={false}
        autoHideDuration={5000}
        isExiting={false}
        onDismiss={() => {}}
      />
      <XDSToast
        type="error"
        body="Failed to save changes."
        endContent={
          <XDSButton
            label="Show toast"
            variant="ghost"
            size="sm"
            onClick={() =>
              toast({body: 'Failed to save changes.', type: 'error'})
            }
          />
        }
        isAutoHide={false}
        autoHideDuration={5000}
        isExiting={false}
        onDismiss={() => {}}
      />
    </XDSVStack>
  );
}
