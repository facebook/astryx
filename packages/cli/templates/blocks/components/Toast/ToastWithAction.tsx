'use client';

import {XDSButton} from '@xds/core/Button';
import {useXDSToast} from '@xds/core/Toast';

export default function ToastWithAction() {
  const toast = useXDSToast();

  return (
    <XDSButton
      label="Delete item"
      variant="primary"
      onClick={() =>
        toast({
          body: 'Item deleted',
          isAutoHide: false,
          endContent: (
            <XDSButton
              label="Undo"
              variant="secondary"
              size="sm"
              onClick={() => {}}
            />
          ),
        })
      }
    />
  );
}
