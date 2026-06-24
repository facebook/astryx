// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {ChatLayoutScrollButton} from '@astryxdesign/core/Chat';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function ChatLayoutScrollButtonLabels() {
  return (
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Labels expand the button to give context
      </Text>
      <Stack direction="vertical" gap={3}>
        <ChatLayoutScrollButton
          isVisible={true}
          onClick={() => {}}
        />
        <ChatLayoutScrollButton
          isVisible={true}
          label="New messages"
          onClick={() => {}}
        />
        <ChatLayoutScrollButton
          isVisible={true}
          label="3 unread replies"
          onClick={() => {}}
        />
      </Stack>
    </Stack>
  );
}
