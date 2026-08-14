// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Avatar} from '@astryxdesign/core/Avatar';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const NAMES = [
  {name: 'John Doe', note: 'First + last'},
  {name: 'Alice', note: 'Single name'},
  {name: 'Bob Smith Johnson', note: 'Multi-word'},
  {name: 'Dr. Sarah Connor', note: 'Prefixed'},
];

export default function AvatarInitialsFallback() {
  return (
    <Stack direction="horizontal" gap={6} vAlign="center">
      {NAMES.map(({name, note}) => (
        <Stack key={name} direction="vertical" gap={2} hAlign="center">
          <Avatar name={name} size="lg" />
          <Text type="supporting" color="secondary">
            {note}
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}
