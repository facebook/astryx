// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Popover} from '@astryxdesign/core/Popover';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Divider} from '@astryxdesign/core/Divider';

export default function PopoverShowcase() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      hasAutoFocus={false}
      placement="below"
      label="Settings"
      width={280}
      content={
        <VStack gap={3}>
          <Heading level={4} tabIndex={0}>
            Settings
          </Heading>
          <Divider />
          <Text type="body">
            Notifications, dark mode, and sound preferences.
          </Text>
        </VStack>
      }>
      <Button label="Settings">Settings</Button>
    </Popover>
  );
}
