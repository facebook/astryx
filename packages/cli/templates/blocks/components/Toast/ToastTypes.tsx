'use client';

import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ToastTypes() {
  const toast = useXDSToast();

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Click each button to see the toast variant
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        <XDSButton
          label="Info toast"
          variant="secondary"
          onClick={() =>
            toast({body: 'Changes saved successfully.', type: 'info'})
          }
        />
        <XDSButton
          label="Error toast"
          variant="destructive"
          onClick={() =>
            toast({body: 'Failed to save changes.', type: 'error'})
          }
        />
      </XDSStack>
    </XDSStack>
  );
}
