// In production, use useXDSToast() hook for proper positioning, stacking, and lifecycle.
'use client';

import {XDSToast} from '@xds/core/Toast';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';

export default function ToastAction() {
  const toast = useXDSToast();

  return (
    <XDSVStack gap={3}>
      <XDSToast
        type="info"
        body="Item deleted"
        endContent={
          <XDSButton
            label="Undo"
            variant="secondary"
            size="sm"
            onClick={() => toast({body: 'Undo successful', type: 'info'})}
          />
        }
        isAutoHide={false}
        autoHideDuration={5000}
        isExiting={false}
        onDismiss={() => {}}
      />
      <XDSToast
        type="info"
        body="Your report is ready."
        endContent={
          <XDSLink href="#" hasUnderline>
            View report
          </XDSLink>
        }
        isAutoHide={false}
        autoHideDuration={5000}
        isExiting={false}
        onDismiss={() => {}}
      />
    </XDSVStack>
  );
}
