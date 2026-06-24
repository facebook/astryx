// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function ThumbnailStates() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Lifecycle: empty → uploading → processing → loaded
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="end">
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail label="report.pdf" />
            <Text type="supporting" color="secondary">
              Placeholder
            </Text>
          </Stack>
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail isLoading label="uploading.jpg" />
            <Text type="supporting" color="secondary">
              Skeleton
            </Text>
          </Stack>
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail
              src="https://lookaside.facebook.com/assets/astryx/moody-home-vertical-1.png"
              alt="Mountain landscape"
              isLoading
              label="landscape.jpg"
            />
            <Text type="supporting" color="secondary">
              Uploading
            </Text>
          </Stack>
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail
              src="https://lookaside.facebook.com/assets/astryx/moody-home-vertical-1.png"
              alt="Mountain landscape"
              label="landscape.jpg"
            />
            <Text type="supporting" color="secondary">
              Loaded
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
