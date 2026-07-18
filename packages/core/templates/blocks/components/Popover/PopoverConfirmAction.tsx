// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Popover} from '@astryxdesign/core/Popover';
import {Button} from '@astryxdesign/core/Button';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
export default function PopoverConfirmAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      placement="below"
      label="Confirm deletion"
      width={300}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      content={
        <VStack gap={3}>
          <Heading level={4}>Delete project?</Heading>
          <Text type="body">
            This will permanently delete the project and all its data. This
            action cannot be undone.
          </Text>
          <HStack gap={2} hAlign="end">
            <Button
              label="Delete"
              variant="destructive"
              onClick={() => setIsOpen(false)}>
              Delete
            </Button>
            <Button
              label="Cancel"
              variant="ghost"
              onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </HStack>
        </VStack>
      }>
      <Button label="Delete project" variant="destructive">
        Delete project
      </Button>
    </Popover>
  );
}
