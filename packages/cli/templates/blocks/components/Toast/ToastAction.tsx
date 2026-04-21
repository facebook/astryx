'use client';

import {useXDSToast} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ToastAction() {
  const toast = useXDSToast();

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Trailing actions for undo or navigation
      </XDSText>
      <XDSStack direction="horizontal" gap={3} vAlign="center">
        <XDSButton
          label="Delete with undo"
          variant="secondary"
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
          label="Report ready"
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
    </XDSStack>
  );
}
