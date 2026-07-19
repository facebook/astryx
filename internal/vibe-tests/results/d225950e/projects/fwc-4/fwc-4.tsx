// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';

export default function ConfirmDeleteDialog() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen} width={400} purpose="required">
      <DialogHeader title="Are you sure you want to delete this item?" onOpenChange={setIsOpen} />
      <div className="flex flex-col gap-4 p-4">
        <Text>This action cannot be undone. The item will be permanently removed.</Text>
        <div className="flex gap-2 justify-end">
          <Button label="Cancel" variant="secondary" onClick={() => setIsOpen(false)} />
          <Button label="Delete" variant="destructive" onClick={() => setIsOpen(false)} />
        </div>
      </div>
    </Dialog>
  );
}
