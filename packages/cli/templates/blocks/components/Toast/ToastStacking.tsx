'use client';

import {useRef} from 'react';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';

export default function ToastStacking() {
  const toast = useXDSToast();
  const countRef = useRef(0);

  return (
    <XDSButton
      label="Add toast"
      onClick={() => {
        countRef.current++;
        const types = ['info', 'error'] as const;
        const type = types[countRef.current % types.length];
        toast({
          body: `Toast #${countRef.current} — ${type} notification.`,
          type,
        });
      }}
    />
  );
}
