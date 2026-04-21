'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Layout';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText} from '@xds/core/Text';
import {InboxIcon} from '@heroicons/react/24/outline';

export default function CenterInsideACard() {
  return (
    <XDSCard width={400}>
      <XDSCenter height={200}>
        <XDSStack direction="vertical" gap={2} hAlign="center">
          <XDSIcon icon={InboxIcon} size="lg" color="secondary" />
          <XDSText type="body" weight="bold">
            No messages yet
          </XDSText>
          <XDSText type="supporting" color="secondary">
            Messages from your team will appear here.
          </XDSText>
        </XDSStack>
      </XDSCenter>
    </XDSCard>
  );
}
