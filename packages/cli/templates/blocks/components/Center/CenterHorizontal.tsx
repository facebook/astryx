// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Card} from '@xds/core/Card';
import {Stack} from '@xds/core/Layout';
import {Heading} from '@xds/core/Text';
import {Icon} from '@xds/core/Icon';
import {IconButton} from '@xds/core/IconButton';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  LinkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

export default function CenterHorizontal() {
  return (
    <Card width={520} padding={2}>
      <Stack direction="horizontal" vAlign="center">
        <Heading level={2}>Untitled Document</Heading>
        <Stack direction="horizontal" gap={0} hAlign="end" style={{flex: 1}}>
          <IconButton
            label="Bold"
            icon={<Icon icon={BoldIcon} />}
            variant="ghost"
            size="sm"
          />
          <IconButton
            label="Italic"
            icon={<Icon icon={ItalicIcon} />}
            variant="ghost"
            size="sm"
          />
          <IconButton
            label="Underline"
            icon={<Icon icon={UnderlineIcon} />}
            variant="ghost"
            size="sm"
          />
          <IconButton
            label="List"
            icon={<Icon icon={ListBulletIcon} />}
            variant="ghost"
            size="sm"
          />
          <IconButton
            label="Link"
            icon={<Icon icon={LinkIcon} />}
            variant="ghost"
            size="sm"
          />
          <IconButton
            label="Image"
            icon={<Icon icon={PhotoIcon} />}
            variant="ghost"
            size="sm"
          />
        </Stack>
      </Stack>
    </Card>
  );
}
