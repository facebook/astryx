// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Dialog} from '@astryxdesign/core/Dialog';
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

export function DeleteConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen} purpose="required" width={420}>
      <DialogHeader title="Are you sure you want to delete this item?" />
      <Stack gap={3} padding={4}>
        <Text>This action cannot be undone. The item will be permanently removed.</Text>
      </Stack>
      <Stack direction="row" gap={2} padding={4} justify="end">
        <Button label="Cancel" variant="secondary" onClick={() => setIsOpen(false)} />
        <Button label="Delete" variant="destructive" onClick={() => setIsOpen(false)} />
      </Stack>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;
