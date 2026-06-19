// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Banner} from '@xds/core/Banner';
import {Button} from '@xds/core/Button';
import {List, ListItem} from '@xds/core/List';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function BannerCollapsibleContent() {
  return (
    <Banner
      status="warning"
      title="Configuration changes detected"
      description="Review the changes before they take effect."
      endContent={<Button label="Review" variant="secondary" size="sm" />}
      isDismissable
      defaultIsExpanded>
      <Stack direction="vertical" gap={2}>
        <Text type="supporting" color="secondary">
          Changed settings:
        </Text>
        <List density="compact">
          <ListItem label="Authentication method updated" />
          <ListItem label="Rate limits modified" />
        </List>
      </Stack>
    </Banner>
  );
}
