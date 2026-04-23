// In production, use useXDSToast() hook for proper positioning, stacking, and lifecycle.
'use client';

import {useRef} from 'react';
import {XDSToast} from '@xds/core/Toast';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

const MESSAGES = [
  {body: 'Changes saved.', type: 'info' as const},
  {body: 'Failed to upload file.', type: 'error' as const},
  {body: 'Message sent to Sarah Chen.', type: 'info' as const},
];

export default function ToastStacking() {
  const toast = useXDSToast();
  const countRef = useRef(0);

  return (
    <XDSVStack gap={3}>
      {MESSAGES.map(msg => (
        <XDSToast
          key={msg.body}
          type={msg.type}
          body={msg.body}
          isAutoHide={false}
          autoHideDuration={5000}
          isExiting={false}
          onDismiss={() => {}}
        />
      ))}
      <XDSButton
        label="Show toast"
        variant="secondary"
        size="sm"
        onClick={() => {
          const msg = MESSAGES[countRef.current % MESSAGES.length];
          countRef.current++;
          toast(msg);
        }}
      />
    </XDSVStack>
  );
}
