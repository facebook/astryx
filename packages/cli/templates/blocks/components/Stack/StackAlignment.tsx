'use client';

import {XDSStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function StackAlignment() {
  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSCard padding={4} variant="muted">
        <XDSStack direction="vertical" gap={2}>
          <XDSText type="supporting" color="secondary">
            Start (left)
          </XDSText>
          <XDSStack direction="horizontal" gap={2} hAlign="start">
            <XDSButton variant="secondary" size="sm">
              Cancel
            </XDSButton>
            <XDSButton variant="primary" size="sm">
              Save
            </XDSButton>
          </XDSStack>
        </XDSStack>
      </XDSCard>
      <XDSCard padding={4} variant="muted">
        <XDSStack direction="vertical" gap={2}>
          <XDSText type="supporting" color="secondary">
            Center
          </XDSText>
          <XDSStack direction="horizontal" gap={2} hAlign="center">
            <XDSButton variant="secondary" size="sm">
              Cancel
            </XDSButton>
            <XDSButton variant="primary" size="sm">
              Save
            </XDSButton>
          </XDSStack>
        </XDSStack>
      </XDSCard>
      <XDSCard padding={4} variant="muted">
        <XDSStack direction="vertical" gap={2}>
          <XDSText type="supporting" color="secondary">
            End (right)
          </XDSText>
          <XDSStack direction="horizontal" gap={2} hAlign="end">
            <XDSButton variant="secondary" size="sm">
              Cancel
            </XDSButton>
            <XDSButton variant="primary" size="sm">
              Save
            </XDSButton>
          </XDSStack>
        </XDSStack>
      </XDSCard>
    </XDSStack>
  );
}
