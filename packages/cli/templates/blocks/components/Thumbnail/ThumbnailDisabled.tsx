'use client';

import {XDSThumbnail} from '@xds/core/Thumbnail';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ThumbnailDisabled() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Enabled
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSThumbnail
            src="https://picsum.photos/id/1043/200/200"
            alt="Bright landscape"
            label="landscape.jpg"
            onRemove={() => {}}
          />
          <XDSThumbnail label="document.pdf" onRemove={() => {}} />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Disabled
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSThumbnail
            src="https://picsum.photos/id/1043/200/200"
            alt="Bright landscape"
            label="landscape.jpg"
            onRemove={() => {}}
            isDisabled
          />
          <XDSThumbnail label="document.pdf" onRemove={() => {}} isDisabled />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
