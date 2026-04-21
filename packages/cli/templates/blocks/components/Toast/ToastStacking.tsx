'use client';

import {useRef} from 'react';
import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const MESSAGES = [
  {body: 'Changes saved.', type: 'info' as const},
  {body: 'Failed to upload file.', type: 'error' as const},
  {body: 'Message sent to Sarah Chen.', type: 'info' as const},
  {body: 'Connection lost.', type: 'error' as const},
];

export default function ToastStacking() {
  const toast = useXDSToast();
  const countRef = useRef(0);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Click multiple times to see stacking behavior
      </XDSText>
      <XDSButton
        label="Add toast"
        onClick={() => {
          const msg = MESSAGES[countRef.current % MESSAGES.length];
          countRef.current++;
          toast(msg);
        }}
      />
    </XDSStack>
  );
}
