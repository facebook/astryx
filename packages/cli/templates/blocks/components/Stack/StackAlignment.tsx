'use client';

import {XDSStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function StackAlignment() {
  return (
    <XDSStack direction="vertical" gap={3} width="100%" style={{maxWidth: 500}}>
      <XDSCard padding={4}>
        <XDSStack direction="vertical" gap={4}>
          <XDSText type="supporting" color="secondary">
            Start (left)
          </XDSText>
          <XDSStack direction="horizontal" gap={1} hAlign="start">
            <XDSButton label="Cancel" variant="secondary" size="sm" />
            <XDSButton label="Save" variant="primary" size="sm" />
          </XDSStack>
        </XDSStack>
      </XDSCard>
      <XDSCard padding={4}>
        <XDSStack direction="vertical" gap={4}>
          <XDSText type="supporting" color="secondary">
            Center
          </XDSText>
          <XDSStack direction="horizontal" gap={1} hAlign="center">
            <XDSButton label="Cancel" variant="secondary" size="sm" />
            <XDSButton label="Save" variant="primary" size="sm" />
          </XDSStack>
        </XDSStack>
      </XDSCard>
      <XDSCard padding={4}>
        <XDSStack direction="vertical" gap={4}>
          <XDSText type="supporting" color="secondary">
            End (right)
          </XDSText>
          <XDSStack direction="horizontal" gap={1} hAlign="end">
            <XDSButton label="Cancel" variant="secondary" size="sm" />
            <XDSButton label="Save" variant="primary" size="sm" />
          </XDSStack>
        </XDSStack>
      </XDSCard>
    </XDSStack>
  );
}
