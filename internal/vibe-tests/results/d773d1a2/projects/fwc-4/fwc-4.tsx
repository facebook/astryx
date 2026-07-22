import {Dialog, Button, Text, VStack} from '@astryxdesign/core';
import {useState} from 'react';

export default function DeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Item">
      <VStack gap={3}>
        <Text>Are you sure you want to delete this item? This action cannot be undone.</Text>
        <Dialog.Actions>
          <Button label="Cancel" variant="secondary" onPress={() => setIsOpen(false)} />
          <Button label="Delete" variant="destructive" onPress={() => setIsOpen(false)} />
        </Dialog.Actions>
      </VStack>
    </Dialog>
  );
}
