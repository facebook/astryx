'use client';

import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';

export default function ToastShowcase() {
  const toast = useXDSToast();
  return (
    <XDSButton
      label="Show toast"
      onClick={() => toast({body: 'This is an info toast'})}
    />
  );
}
