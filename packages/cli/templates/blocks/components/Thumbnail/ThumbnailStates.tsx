// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSThumbnail} from '@xds/core/Thumbnail';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ThumbnailStates() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Lifecycle: empty → uploading → processing → loaded
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="end">
          <XDSStack direction="vertical" gap={1} hAlign="center">
            <XDSThumbnail label="report.pdf" />
            <XDSText type="supporting" color="secondary">
              Placeholder
            </XDSText>
          </XDSStack>
          <XDSStack direction="vertical" gap={1} hAlign="center">
            <XDSThumbnail isLoading label="uploading.jpg" />
            <XDSText type="supporting" color="secondary">
              Skeleton
            </XDSText>
          </XDSStack>
          <XDSStack direction="vertical" gap={1} hAlign="center">
            <XDSThumbnail
              src="https://lookaside.facebook.com/assets/xds_oss/moody-home-vertical-1.png"
              alt="Mountain landscape"
              isLoading
              label="landscape.jpg"
            />
            <XDSText type="supporting" color="secondary">
              Uploading
            </XDSText>
          </XDSStack>
          <XDSStack direction="vertical" gap={1} hAlign="center">
            <XDSThumbnail
              src="https://lookaside.facebook.com/assets/xds_oss/moody-home-vertical-1.png"
              alt="Mountain landscape"
              label="landscape.jpg"
            />
            <XDSText type="supporting" color="secondary">
              Loaded
            </XDSText>
          </XDSStack>
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
