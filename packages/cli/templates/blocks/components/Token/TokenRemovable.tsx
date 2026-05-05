'use client';

import {XDSToken} from '@xds/core/Token';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TokenRemovable() {
  return (
    <XDSStack direction="vertical" gap={10}>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Active filters
        </XDSText>
        <XDSStack direction="horizontal" gap={2} wrap="wrap">
          <XDSToken label="Status: Open" color="green" onRemove={() => {}} />
          <XDSToken label="Priority: High" color="red" onRemove={() => {}} />
          <XDSToken label="Team: Design" color="purple" onRemove={() => {}} />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={2}>
        <XDSText type="supporting" color="secondary">
          Selected recipients
        </XDSText>
        <XDSStack direction="horizontal" gap={2} wrap="wrap">
          <XDSToken label="Sarah Chen" color="blue" onRemove={() => {}} />
          <XDSToken label="Alex Rivera" color="blue" onRemove={() => {}} />
          <XDSToken label="Jordan Lee" color="blue" onRemove={() => {}} />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
