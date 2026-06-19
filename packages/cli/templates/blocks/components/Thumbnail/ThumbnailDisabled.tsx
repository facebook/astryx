// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Thumbnail} from '@xds/core/Thumbnail';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function ThumbnailDisabled() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Enabled
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <Thumbnail
            src="https://lookaside.facebook.com/assets/xds_oss/moody-scene-vertical-2.png"
            alt="Bright landscape"
            label="landscape.jpg"
            onRemove={() => {}}
          />
          <Thumbnail label="document.pdf" onRemove={() => {}} />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Disabled
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <Thumbnail
            src="https://lookaside.facebook.com/assets/xds_oss/moody-scene-vertical-2.png"
            alt="Bright landscape"
            label="landscape.jpg"
            onRemove={() => {}}
            isDisabled
          />
          <Thumbnail label="document.pdf" onRemove={() => {}} isDisabled />
        </Stack>
      </Stack>
    </Stack>
  );
}
