'use client';

import {XDSButton} from '@xds/core/Button';
import {useXDSToast} from '@xds/core/Toast';

export default function ToastError() {
  const toast = useXDSToast();

  return (
    <XDSButton
      label="Show error toast"
      variant="primary"
      onClick={() => toast({body: 'Failed to save', type: 'error'})}
    />
  );
}
