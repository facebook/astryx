// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Dialog} from '@astryxdesign/core/Dialog';
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';

export function DeleteConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen} purpose="required" width={420}>
      <DialogHeader title="Are you sure you want to delete this item?" />
      <div className="px-6 py-4">
        <Text>This action cannot be undone. The item will be permanently removed.</Text>
      </div>
      <div className="flex justify-end gap-2 px-6 py-4 border-t">
        <Button label="Cancel" variant="secondary" onClick={() => setIsOpen(false)} />
        <Button label="Delete" variant="destructive" onClick={() => setIsOpen(false)} />
      </div>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;
