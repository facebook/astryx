// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

export default function ConfirmDeleteDialog() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen} width={400} purpose="required">
      <DialogHeader title="Are you sure you want to delete this item?" onOpenChange={setIsOpen} />
      <VStack gap={4} xstyle={{padding: '16px'}}>
        <Text>This action cannot be undone. The item will be permanently removed.</Text>
        <HStack gap={2} justify="end">
          <Button label="Cancel" variant="secondary" onClick={() => setIsOpen(false)} />
          <Button label="Delete" variant="destructive" onClick={() => setIsOpen(false)} />
        </HStack>
      </VStack>
    </Dialog>
  );
}
