// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSItem} from '@xds/core/Item';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ItemWithMetadata() {
  return (
    <XDSStack gap={0}>
      <XDSItem
        startContent={<XDSIcon icon="check" size="sm" color="success" />}
        label="Build passed"
        description="Production deploy completed"
        endContent={<XDSText color="secondary">2m ago</XDSText>}
      />
      <XDSItem
        startContent={<XDSIcon icon="warning" size="sm" color="warning" />}
        label="High memory usage"
        description="Worker pool is above the warning threshold"
        endContent={<XDSBadge label="Warning" variant="warning" />}
        isHighlighted
      />
      <XDSItem
        startContent={<XDSIcon icon="error" size="sm" color="error" />}
        label="Sync failed"
        description="Retry after checking service credentials"
        endContent={<XDSBadge label="Action" variant="error" />}
        isSelected
      />
    </XDSStack>
  );
}
