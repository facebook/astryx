'use client';

import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSStack} from '@xds/core/Stack';

export default function ToastWithAction() {
  const toast = useXDSToast();
  return (
    <XDSStack direction="horizontal" gap={2}>
      <XDSButton
        label="With button"
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
      <XDSButton
        label="With link"
        variant="secondary"
        onClick={() =>
          toast({
            body: 'Your report is ready.',
            isAutoHide: false,
            endContent: (
              <XDSLink href="#" label="View report" hasUnderline>
                View report
              </XDSLink>
            ),
          })
        }
      />
    </XDSStack>
  );
}
