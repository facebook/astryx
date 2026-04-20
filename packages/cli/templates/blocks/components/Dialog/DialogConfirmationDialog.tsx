'use client';

import {useState} from 'react';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function DialogConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = () => {
    setDeleted(true);
    setIsOpen(false);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <XDSButton
        label="Delete Item"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      />
      {deleted && (
        <XDSText type="body" color="primary">
          Item deleted (demo)
        </XDSText>
      )}
      <XDSDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width={350}
        purpose="form">
        <XDSLayout
          header={
            <XDSDialogHeader
              title="Confirm Delete"
              onOpenChange={setIsOpen}
            />
          }
          content={
            <XDSLayoutContent>
              <XDSText type="body">
                Are you sure you want to delete this item? This action cannot be
                undone.
              </XDSText>
            </XDSLayoutContent>
          }
          footer={
            <XDSLayoutFooter>
              <XDSHStack gap={2} hAlign="end">
                <XDSButton
                  label="Cancel"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                />
                <XDSButton
                  label="Delete"
                  variant="destructive"
                  onClick={handleDelete}
                />
              </XDSHStack>
            </XDSLayoutFooter>
          }
        />
      </XDSDialog>
    </div>
  );
}
